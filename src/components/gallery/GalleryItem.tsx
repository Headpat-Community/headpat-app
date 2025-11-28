import { Image } from "expo-image"
import { router } from "expo-router"
import React from "react"
import { Dimensions, TouchableWithoutFeedback, View } from "react-native"
import { ImageFormat } from "react-native-appwrite"
import { Badge } from "~/components/ui/badge"
import { Skeleton } from "~/components/ui/skeleton"
import { Text } from "~/components/ui/text"
import type {
  GalleryDocumentsType,
  GalleryPrefsDocumentsType,
} from "~/lib/types/collections"

interface GalleryItemProps {
  image: GalleryDocumentsType
  thumbnail: string
  getGalleryUrl: (id: string, format?: ImageFormat) => string
  imagePrefs?: Record<string, GalleryPrefsDocumentsType>
}

const GalleryItem = React.memo(
  ({ image, thumbnail, getGalleryUrl, imagePrefs }: GalleryItemProps) => {
    const format = image.mimeType?.split("/").pop()
    let imageFormat: ImageFormat | undefined
    if (format) {
      // ImageFormat is an enum where values are lowercase strings (e.g., ImageFormat.Jpeg = "jpeg").
      // We check if the extracted format string matches any of the enum's values.
      const validFormats = Object.values(ImageFormat) as string[]
      if (validFormats.includes(format)) {
        imageFormat = format as ImageFormat
      }
    }

    // Get device dimensions
    const { width } = Dimensions.get("window")

    // Define height based on device size
    const widthColumns = width > 600 ? "50%" : "100%"
    const isHidden: boolean = imagePrefs?.[image.$id]?.isHidden ?? false

    const imageUrl = image.mimeType?.includes("video")
      ? thumbnail
      : getGalleryUrl(image.galleryId, imageFormat)

    return (
      <TouchableWithoutFeedback
        onPress={() => {
          router.push({
            pathname: "/gallery/(stacks)/[galleryId]",
            params: { galleryId: image.$id },
          })
        }}
      >
        <View
          style={{
            position: "relative",
            width: widthColumns,
            height: 200,
            marginBottom: 10,
          }}
        >
          {isHidden ? (
            <View>
              <Skeleton className={"h-full w-full"}>
                <Badge className={"w-full"}>
                  <Text>Image is hidden</Text>
                </Badge>
              </Skeleton>
            </View>
          ) : (
            <>
              <Image
                source={
                  image.mimeType?.includes("video")
                    ? { uri: thumbnail }
                    : { uri: imageUrl }
                }
                alt={image.name}
                style={{ width: "100%", height: "100%" }}
                contentFit={"cover"}
                placeholder={require("~/assets/pfp-placeholder.png")}
                onError={(error) => {
                  console.error(
                    "Image loading error for",
                    image.$id,
                    ":",
                    error
                  )
                }}
              />
              {image.mimeType?.includes("gif") && (
                <Badge
                  className={"absolute border-2 border-primary bg-secondary"}
                >
                  <Text className={"text-primary"}>GIF</Text>
                </Badge>
              )}
              {image.mimeType?.includes("video") && (
                <Badge
                  className={"absolute border-2 border-primary bg-secondary"}
                >
                  <Text className={"text-primary"}>Video</Text>
                </Badge>
              )}
            </>
          )}
        </View>
      </TouchableWithoutFeedback>
    )
  }
)

export default GalleryItem
