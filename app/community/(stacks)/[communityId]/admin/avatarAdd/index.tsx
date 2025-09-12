import { captureException } from "@sentry/react-native"
import { router, useGlobalSearchParams } from "expo-router"
import React, { useState } from "react"
import { Keyboard, TouchableWithoutFeedback, View } from "react-native"
import { ExecutionMethod, ID } from "react-native-appwrite"
import {
  ImageOrVideo,
  openCropper,
  openPicker,
} from "react-native-image-crop-picker"
import { useAlertModal } from "~/components/contexts/AlertModalProvider"
import { Button } from "~/components/ui/button"
import { Text } from "~/components/ui/text"
import { H2, Muted } from "~/components/ui/typography"
import { databases, functions, storage } from "~/lib/appwrite-client"
import { StorageError } from "~/lib/types/collections"

export default function AvatarAdd() {
  const [image, setImage] = useState<ImageOrVideo>(
    null as unknown as ImageOrVideo
  )
  const { showAlert, hideAlert } = useAlertModal()
  const maxFileSize = 1.5 * 1024 * 1024 // 1.5 MB in bytes
  const local = useGlobalSearchParams()

  const pickImage = async () => {
    try {
      const result = await openPicker({
        mediaType: "photo",
        writeTempFile: true,
      })

      if (!result.path) {
        showAlert("FAILED", "No image selected!")
        return
      }

      setImage(result)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      //showAlert('FAILED', 'Error picking image.')
      //Sentry.captureException(error)
    }
  }

  async function upload() {
    await uploadImageAsync()
  }

  React.useEffect(() => {
    void upload().then()
  }, [image])

  const handleClose = () => {
    setImage(null as unknown as ImageOrVideo)
    router.back()
  }

  const handleFinish = () => {
    setImage(null as unknown as ImageOrVideo)
    router.back()
  }

  async function compressImage(uri: string) {
    return await openCropper({
      path: uri,
      mediaType: "photo",
      width: 512,
      height: 512,
      compressImageQuality: 0.7,
    })
  }

  async function uploadImageAsync() {
    try {
      const compressedImage = await compressImage(image.path)

      if (compressedImage.size > maxFileSize) {
        showAlert("FAILED", "Image size is too large. Has to be under 1.5 MB")
        return
      }

      // change this to any string of your choice for optonal naming if file name is undefined
      const file = {
        name: image.filename ?? "upload" + Math.random().toString(16) + ".jpg",
        type: compressedImage.mime,
        size: compressedImage.size,
        uri: compressedImage.path,
      }

      showAlert("LOADING", "Uploading image...")

      const data = await functions.createExecution({
        functionId: "community-endpoints",
        body: "",
        async: false,
        xpath: `/community/upload?communityId=${local.communityId as string}&type=avatar`,
        method: ExecutionMethod.POST,
      })
      const response = JSON.parse(data.responseBody)

      if (response.type === "community_upload_missing_id") {
        hideAlert()
        showAlert("FAILED", "Community ID is missing. Please try again later.")
        return
      } else if (response.type === "unauthorized") {
        hideAlert()
        showAlert("FAILED", "You are not authorized to upload.")
        return
      } else if (response.type === "community_upload_missing_type") {
        hideAlert()
        showAlert("FAILED", "Missing upload type. Please try again later.")
        return
      }

      const fileData = storage.createFile({
        bucketId: "community-avatars",
        fileId: ID.unique(),
        file: file,
      })

      fileData.then(
        async function (response) {
          // Update the user's avatarId
          await databases.updateRow({
            databaseId: "hp_db",
            tableId: "community",
            rowId: local.communityId as string,
            data: {
              avatarId: response.$id,
            },
          })

          showAlert("SUCCESS", "Your avatar has been uploaded successfully.")

          await functions.createExecution({
            functionId: "community-endpoints",
            async: true,
            xpath: `/community/upload/finish?communityId=${local.communityId as string}`,
            method: ExecutionMethod.POST,
          })
          hideAlert()
          handleFinish()
        },
        function (error: unknown) {
          hideAlert()
          if (error && typeof error === "object" && "type" in error) {
            const storageError = error as StorageError
            switch (storageError.type) {
              case "storage_file_empty":
                showAlert("FAILED", "Missing file.")
                break
              case "storage_invalid_file_size":
                showAlert(
                  "FAILED",
                  "The file size is either not valid or exceeds the maximum allowed size."
                )
                break
              case "storage_file_type_unsupported":
                showAlert(
                  "FAILED",
                  "The given file extension is not supported."
                )
                break
              case "storage_invalid_file":
                showAlert(
                  "FAILED",
                  "The uploaded file is invalid. Please check the file and try again."
                )
                break
              case "storage_device_not_found":
                showAlert(
                  "FAILED",
                  "The requested storage device could not be found."
                )
                break
              default:
                showAlert("FAILED", "Error uploading image.")
                captureException(error)
            }
          } else {
            showAlert("FAILED", "Error uploading image.")
            captureException(error)
          }
        }
      )
    } catch (error) {
      showAlert("FAILED", "Error uploading image.")
      captureException(error)
    }
  }

  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View className={"mx-8 flex-1"}>
          <View className={"flex-1"}>
            <View className={"mt-8"}>
              <H2>Want to upload an avatar?</H2>
              <Muted>
                You can select an image from your camera roll to upload as your
                avatar.
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
    </>
  )
}
