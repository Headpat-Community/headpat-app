import * as Sentry from "@sentry/react-native"
import * as ImagePicker from "expo-image-picker"
import { router } from "expo-router"
import * as WebBrowser from "expo-web-browser"
import { useState } from "react"
import { Keyboard, TouchableWithoutFeedback, View } from "react-native"
import { ID } from "react-native-appwrite"
import { Blurhash } from "react-native-blurhash"
import { z } from "zod"
import { useAlertModal } from "~/components/contexts/AlertModalProvider"
import { useUser } from "~/components/contexts/UserContext"
import FeatureAccess from "~/components/FeatureAccess"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Progress } from "~/components/ui/progress"
import { Text } from "~/components/ui/text"
import { Textarea } from "~/components/ui/textarea"
import { H2, Muted } from "~/components/ui/typography"
import { databases, storage } from "~/lib/appwrite-client"

const gallerySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(32, "Name is too long"),
  longText: z.string().trim().max(2048, "Description is too long").optional(),
})

export default function GalleryAdd() {
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset>(
    null as unknown as ImagePicker.ImagePickerAsset
  )
  const [page, setPage] = useState<number>(1)
  const [title, setTitle] = useState<string>("")
  const [nsfw, setNsfw] = useState<boolean>(false)
  const [description, setDescription] = useState<string>("")
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)
  const { showAlert } = useAlertModal()
  const { current } = useUser()

  const openBrowser = async (url: string) => {
    await WebBrowser.openBrowserAsync(url)
  }

  const maxFileSize = 8 * 1024 * 1024 // 8 MB in bytes

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images", "videos", "livePhotos"],
        allowsEditing: true,
        quality: 0.9,
        videoQuality: 1,
      })

      if (result.assets?.length === 0 || !result.assets?.[0]?.uri) {
        showAlert("FAILED", "No image selected!")
        return
      }

      if (
        result.assets[0]?.fileSize &&
        result.assets[0].fileSize > maxFileSize
      ) {
        showAlert("FAILED", "Image size is too large. Has to be under 8 MB")
        return
      }

      setImage(result.assets[0])
      setPage(2)
    } catch (error) {
      console.log(error)
      //showAlertModal('FAILED', 'Error picking image.')
      //Sentry.captureException(error)
    }
  }

  const handleClose = () => {
    setImage(null as unknown as ImagePicker.ImagePickerAsset)
    setPage(1)
    router.back()
  }

  const handleFinish = (galleryId: string) => {
    setImage(null as unknown as ImagePicker.ImagePickerAsset)
    setPage(1)
    router.push(`/gallery/${galleryId}`)
  }

  async function uploadImageAsync() {
    setIsUploading(true)
    if (!image.uri) {
      showAlert("FAILED", "Please select an image to upload!")
      setIsUploading(false)
      return
    }

    try {
      gallerySchema.parse({ name: title, longText: description })
    } catch (error) {
      if (error instanceof z.ZodError) {
        showAlert("FAILED", error.errors[0].message)
      } else {
        showAlert("FAILED", "Validation error")
      }
      setIsUploading(false)
      return
    }

    try {
      // Generate Blurhash from the image
      const blurhash = await Blurhash.encode(image.uri, 4, 3)

      // name is galleryFile + mimeType
      const name =
        image.fileName ??
        "galleryFile." + (image.mimeType?.split("/")[1] ?? "jpg")
      const fileData = {
        name: image.fileName ?? name,
        type: image.mimeType ?? "image/jpeg",
        size: image.fileSize ?? 0,
        uri: image.uri,
      }

      const storageData = await storage.createFile({
        bucketId: "gallery",
        fileId: ID.unique(),
        file: fileData,
        onProgress: (progress) => {
          setProgress(progress.progress)
        },
      })

      await databases.createRow({
        databaseId: "hp_db",
        tableId: "gallery-images",
        rowId: storageData.$id,
        data: {
          name: title,
          longText: description,
          nsfw: nsfw,
          userId: current?.$id,
          mimeType: fileData.type,
          galleryId: storageData.$id,
          blurHash: blurhash,
        },
      })

      handleFinish(storageData.$id)
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "type" in error &&
        error.type === "storage_file_type_unsupported"
      ) {
        showAlert("FAILED", "Unsupported file type.")
      } else {
        Sentry.captureException(error)
        showAlert("FAILED", "Error uploading image.")
      }
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <FeatureAccess featureName={"gallery"}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View className={"mx-8 flex-1"}>
          <View className={"flex-1"}>
            <View className={"mt-8"}>
              {page === 1 && <H2>Want to upload an image?</H2>}
              {page === 2 && <H2>Please provide more details</H2>}
              {page === 1 && (
                <Muted>
                  You can select an image from your camera roll to upload to the
                  gallery.
                </Muted>
              )}
              {page === 2 && (
                <Muted>Thanks for sharing, please continue to submit.</Muted>
              )}
            </View>
            {page === 1 && (
              <>
                <View className={"items-center justify-center py-8"}>
                  <Button onPress={() => void pickImage()}>
                    <Text>Pick an image from camera roll</Text>
                  </Button>
                </View>

                <View className={"items-center"}>
                  <Muted
                    onPress={() =>
                      void openBrowser("https://headpat.place/legal/eula")
                    }
                  >
                    Please make sure to follow the EULA.
                  </Muted>
                </View>
              </>
            )}

            {page === 2 && (
              <View className={"gap-4 py-8"}>
                <>
                  <View>
                    <Label nativeID={"title"}>Title:</Label>
                    <Input
                      nativeID={"title"}
                      inputMode={"text"}
                      value={title}
                      onChangeText={(text) => setTitle(text)}
                      placeholder="Title"
                    />
                  </View>
                  <View>
                    <Label nativeID={"nsfwCheckbox"}>Is this NSFW?</Label>
                    <Checkbox
                      className={"p-4"}
                      checked={nsfw}
                      onCheckedChange={setNsfw}
                    />
                  </View>
                  <View>
                    <Label nativeID={"description"}>Description:</Label>
                    <Textarea
                      placeholder="Write some stuff..."
                      nativeID={"description"}
                      value={description}
                      onChangeText={(text) => setDescription(text)}
                      numberOfLines={4}
                      multiline={true}
                      style={{ height: 100 }}
                    />
                  </View>
                </>
              </View>
            )}
          </View>
          <View style={{ marginBottom: 40 }} className={"gap-4"}>
            <>
              {isUploading && <Progress value={progress} />}
              <Button variant={"outline"} onPress={handleClose}>
                <Text>Cancel</Text>
              </Button>
              {page === 2 && (
                <>
                  <Button
                    disabled={isUploading}
                    onPress={() => void uploadImageAsync()}
                  >
                    <Text>Submit</Text>
                  </Button>
                  <Button onPress={() => setPage(1)}>
                    <Text>Back</Text>
                  </Button>
                </>
              )}
            </>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </FeatureAccess>
  )
}
