import * as Sentry from "@sentry/react-native"
import { FlashList } from "@shopify/flash-list"
import * as VideoThumbnails from "expo-video-thumbnails"
import React from "react"
import { Dimensions, Text, View } from "react-native"
import { ImageFormat, Query } from "react-native-appwrite"
import { useAlertModal } from "~/components/contexts/AlertModalProvider"
import { useUser } from "~/components/contexts/UserContext"
import FeatureAccess from "~/components/FeatureAccess"
import GalleryItem from "~/components/gallery/GalleryItem"
import { i18n } from "~/components/system/i18n"
import { Skeleton } from "~/components/ui/skeleton"
import { databases } from "~/lib/appwrite-client"
import {
  GalleryDocumentsType,
  GalleryPrefsDocumentsType,
} from "~/lib/types/collections"

export default function GalleryPage() {
  const { current } = useUser()

  const [images, setImages] = React.useState<GalleryDocumentsType[]>([])
  const [imagePrefs, setImagePrefs] = React.useState<
    Record<string, GalleryPrefsDocumentsType>
  >({})
  const [refreshing, setRefreshing] = React.useState<boolean>(false)
  const [thumbnails, setThumbnails] = React.useState<Record<string, string>>({})
  const [currentPage, setCurrentPage] = React.useState<number>(1)
  const [totalPages, setTotalPages] = React.useState<number>(1)
  const [loadingMore, setLoadingMore] = React.useState<boolean>(false)
  const [isLoading, setIsLoading] = React.useState<boolean>(true)
  const [error, setError] = React.useState<string | null>(null)
  const { showAlert } = useAlertModal()
  const { width } = Dimensions.get("window")
  const maxColumns = width > 600 ? 4 : 2
  const pageSize = 48 // Number of items per page
  const widthColumns = width > 600 ? "24%" : "48%"

  const fetchGallery = React.useCallback(
    async (page = 1, append = false) => {
      try {
        setIsLoading(true)
        setError(null)
        const offset = (page - 1) * pageSize
        const nsfwPreference = current?.prefs.nsfw ?? false

        // Try a simpler query first to see if we can get any data
        const query = [
          Query.limit(pageSize),
          Query.offset(offset),
          Query.orderDesc("$createdAt"),
        ]

        // Only add NSFW filter if user has explicitly disabled NSFW content
        if (!nsfwPreference) {
          query.push(Query.equal("nsfw", false))
        }

        const [imageData, imagePrefsData]: any = await Promise.all([
          databases.listRows({
            databaseId: "hp_db",
            tableId: "gallery-images",
            queries: query,
          }),
          databases.listRows({
            databaseId: "hp_db",
            tableId: "gallery-prefs",
            queries: [Query.limit(5000)],
          }),
        ])

        if (!imageData?.rows) {
          console.error("No image data received")
          setError("No gallery data available")
          return
        }

        const parsedImagePrefs = imagePrefsData.rows.reduce(
          (
            acc: Record<string, GalleryPrefsDocumentsType>,
            pref: GalleryPrefsDocumentsType
          ) => {
            acc[pref.galleryId] = pref
            return acc
          },
          {} as Record<string, GalleryPrefsDocumentsType>
        )

        setImagePrefs(
          parsedImagePrefs as Record<string, GalleryPrefsDocumentsType>
        )

        if (append) {
          setImages((prevImages) => [...prevImages, ...imageData.rows])
        } else {
          setImages(imageData.rows as GalleryDocumentsType[])
        }

        setTotalPages(Math.ceil(imageData.total / pageSize))

        imageData.rows.forEach((image: GalleryDocumentsType) => {
          if (image.mimeType?.includes("video")) {
            void generateThumbnail(image.$id)
          }
        })
      } catch (error) {
        console.error("Error fetching gallery:", error)
        setError("Failed to load gallery")
        showAlert("FAILED", "Failed to fetch gallery. Please try again later.")
        Sentry.captureException(error)
      } finally {
        setIsLoading(false)
      }
    },
    [current, pageSize]
  )

  const getGalleryUrl = React.useCallback(
    (galleryId: string, _output: ImageFormat = ImageFormat.Jpeg): string => {
      if (!galleryId) return ""
      try {
        // Use the same pattern as getAvatarImageUrlView
        const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/v1/storage/buckets/gallery/files/${galleryId}/view?project=hp-main`
        return url
      } catch (error) {
        console.error("Error generating URL for", galleryId, ":", error)
        return ""
      }
    },
    []
  )

  const onRefresh = async () => {
    setRefreshing(true)
    setCurrentPage(1)
    await fetchGallery(1, false)
    setRefreshing(false)
  }

  const loadMore = async () => {
    if (!loadingMore && currentPage < totalPages) {
      setLoadingMore(true)
      const nextPage = currentPage + 1
      setCurrentPage(nextPage)
      await fetchGallery(nextPage, true)
      setLoadingMore(false)
    }
  }

  React.useEffect(() => {
    void fetchGallery(1, false)
  }, [current])

  const generateThumbnail = React.useCallback(async (galleryId: string) => {
    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/v1/storage/buckets/gallery/files/${galleryId}/view?project=hp-main`
      )
      setThumbnails((prevThumbnails) => ({
        ...prevThumbnails,
        [galleryId]: uri,
      }))
    } catch (e) {
      console.warn("Failed to generate thumbnail for", galleryId, ":", e)
    }
  }, [])

  // Show error state
  if (error && !isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 16, marginBottom: 10 }}>{error}</Text>
        <Text
          style={{ color: "#007AFF", fontSize: 16 }}
          onPress={() => void fetchGallery(1, false)}
        >
          Tap to retry
        </Text>
      </View>
    )
  }

  // Show loading state
  if (isLoading && images.length === 0) {
    return (
      <View style={{ flex: 1 }}>
        {Array.from({ length: 16 }).map((_, index) => (
          <View
            key={index}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            {[...Array(2)].map((_, i) => (
              <View
                key={i}
                style={{
                  position: "relative",
                  width: widthColumns,
                  height: 200,
                  margin: 5,
                }}
              >
                <Skeleton className={"h-full w-full"} />
              </View>
            ))}
          </View>
        ))}
      </View>
    )
  }

  // Show empty state
  if (!isLoading && images.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 16, textAlign: "center", marginBottom: 10 }}>
          No gallery images found
        </Text>
        <Text style={{ fontSize: 14, textAlign: "center", color: "#666" }}>
          Try refreshing or check your connection
        </Text>
        <Text
          style={{ color: "#007AFF", fontSize: 16, marginTop: 10 }}
          onPress={() => void fetchGallery(1, false)}
        >
          Refresh
        </Text>
      </View>
    )
  }

  return (
    <FeatureAccess featureName={"gallery"}>
      <View style={{ flex: 1 }}>
        <FlashList
          data={images}
          keyExtractor={(item) => item.$id}
          renderItem={({ item }) => (
            <GalleryItem
              image={item}
              thumbnail={thumbnails[item.$id]}
              getGalleryUrl={getGalleryUrl}
              imagePrefs={imagePrefs}
            />
          )}
          onRefresh={() => void onRefresh()}
          refreshing={refreshing}
          numColumns={maxColumns}
          onEndReached={() => void loadMore()}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View
                style={{
                  padding: 10,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text>{i18n.t("main.loading")}</Text>
              </View>
            ) : null
          }
        />
      </View>
    </FeatureAccess>
  )
}
