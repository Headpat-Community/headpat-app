import { captureException } from "@sentry/react-native";
import { router, useGlobalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import { ExecutionMethod, ID } from "react-native-appwrite";
import {
	type ImageOrVideo,
	openCropper,
	openPicker,
} from "react-native-image-crop-picker";
import { useAlertModal } from "~/components/contexts/AlertModalProvider";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { H2, Muted } from "~/components/ui/typography";
import { databases, functions, storage } from "~/lib/appwrite-client";
import type { StorageError } from "~/lib/types/collections";

export default function BannerAdd() {
	const [image, setImage] = useState<ImageOrVideo>(
		null as unknown as ImageOrVideo,
	);
	const { showAlert, hideAlert } = useAlertModal();
	const maxFileSize = 5 * 1024 * 1024; // 1.5 MB in bytes
	const local = useGlobalSearchParams();

	const pickImage = async () => {
		try {
			const result = await openPicker({
				mediaType: "photo",
			});

			if (!result.path) {
				showAlert("FAILED", "No image selected!");
				return;
			}

			setImage(result);
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (_error) {
			//showAlertModal('FAILED', 'Error picking image.')
			//Sentry.captureException(error)
		}
	};

	const handleClose = useCallback(() => {
		setImage(null as unknown as ImageOrVideo);
		router.back();
	}, []);

	const handleFinish = useCallback(() => {
		setImage(null as unknown as ImageOrVideo);
		router.back();
	}, []);

	const compressImage = useCallback(async (uri: string) => {
		return await openCropper({
			path: uri,
			mediaType: "photo",
			width: 2400,
			height: 500,
			compressImageQuality: 0.8,
		});
	}, []);

	const uploadImageAsync = useCallback(async () => {
		if (!image.path) {
			showAlert("FAILED", "Please select an image to upload");
			return;
		}

		try {
			const compressedImage = await compressImage(image.path);

			if (compressedImage.size > maxFileSize) {
				showAlert("FAILED", "Image size is too large. Has to be under 1.5 MB");
				return;
			}

			const file = {
				name: image.filename ?? `upload${Math.random().toString(16)}.jpg`,
				type: compressedImage.mime,
				size: compressedImage.size,
				uri: compressedImage.path,
			};

			showAlert("LOADING", "Uploading image...");

			const data = await functions.createExecution({
				functionId: "community-endpoints",
				async: false,
				xpath: `/community/upload?communityId=${local.communityId as string}&type=banner`,
				method: ExecutionMethod.POST,
			});
			const response = JSON.parse(data.responseBody);

			if (response.type === "community_upload_missing_id") {
				hideAlert();
				showAlert("FAILED", "Community ID is missing. Please try again later.");
				return;
			} else if (response.type === "unauthorized") {
				hideAlert();
				showAlert("FAILED", "You are not authorized to upload.");
				return;
			} else if (response.type === "community_upload_missing_type") {
				hideAlert();
				showAlert("FAILED", "Missing upload type. Please try again later.");
				return;
			}

			const fileData = storage.createFile({
				bucketId: "community-banners",
				fileId: ID.unique(),
				file: file,
			});

			fileData.then(
				async (response) => {
					// Update the community's bannerId
					await databases.updateRow({
						databaseId: "hp_db",
						tableId: "community",
						rowId: local.communityId as string,
						data: {
							bannerId: response.$id,
						},
					});

					hideAlert();

					showAlert("SUCCESS", "Your banner has been uploaded successfully.");

					await functions.createExecution({
						functionId: "community-endpoints",
						async: true,
						xpath: `/community/upload/finish?communityId=${local.communityId as string}`,
						method: ExecutionMethod.POST,
					});
					handleFinish();
				},
				(error: unknown) => {
					hideAlert();
					if (error && typeof error === "object" && "type" in error) {
						const storageError = error as StorageError;
						switch (storageError.type) {
							case "storage_file_empty":
								showAlert("FAILED", "Missing file.");
								break;
							case "storage_invalid_file_size":
								showAlert(
									"FAILED",
									"The file size is either not valid or exceeds the maximum allowed size.",
								);
								break;
							case "storage_file_type_unsupported":
								showAlert(
									"FAILED",
									"The given file extension is not supported.",
								);
								break;
							case "storage_invalid_file":
								showAlert(
									"FAILED",
									"The uploaded file is invalid. Please check the file and try again.",
								);
								break;
							case "storage_device_not_found":
								showAlert(
									"FAILED",
									"The requested storage device could not be found.",
								);
								break;
							default:
								showAlert("FAILED", "Error uploading image.");
								captureException(error);
						}
					} else {
						showAlert("FAILED", "Error uploading image.");
						captureException(error);
					}
				},
			);
		} catch (error) {
			//console.log(error)
			showAlert("FAILED", "Error picking image.");
			captureException(error);
		}
	}, [
		compressImage,
		image,
		local.communityId,
		showAlert,
		hideAlert,
		handleFinish,
	]);

	useEffect(() => {
		if (image.path) {
			void uploadImageAsync();
		}
	}, [image.path, uploadImageAsync]);

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
			<View className={"mx-8 flex-1"}>
				<View className={"flex-1"}>
					<View className={"mt-8"}>
						<H2>Want to upload a banner?</H2>
						<Muted>
							You can select an image from your camera roll to upload as your
							banner.
						</Muted>
					</View>
					<View className={"items-center justify-center py-8"}>
						<Button onPress={() => void pickImage()}>
							<Text>Pick an image from camera roll</Text>
						</Button>
					</View>
				</View>
				<View style={{ marginBottom: 40 }} className={"gap-4"}>
					<Button variant={"outline"} onPress={handleClose}>
						<Text>Cancel</Text>
					</Button>
				</View>
			</View>
		</TouchableWithoutFeedback>
	);
}
