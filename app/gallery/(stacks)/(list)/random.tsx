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
  const [seenItems, setSeenItems] = React.useState<Set<string>>(new Set())
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
        const query = nsfwPreference
          ? [Query.limit(pageSize), Query.offset(offset)]
          : [
              Query.limit(pageSize),
              Query.offset(offset),
              Query.equal("nsfw", false),
            ]

        // Get total count first
        const totalCount = await databases.listRows({
          databaseId: "hp_db",
          tableId: "gallery-images",
          queries: [Query.limit(1)],
        })
        setTotalPages(Math.ceil(totalCount.total / pageSize))

        // If we're on page 1, fetch and shuffle all items
        if (page === 1) {
          setSeenItems(new Set()) // Reset seen items when going back to page 1
          const allGallery = await databases.listRows({
            databaseId: "hp_db",
            tableId: "gallery-images",
            queries: [Query.limit(1000)],
          })
          const allDocuments =
            allGallery.rows as unknown as GalleryDocumentsType[]
          const shuffled = [...allDocuments].sort(() => Math.random() - 0.5)

          // Store the first page and seen items
          const firstPage = shuffled.slice(0, pageSize)
          setImages(firstPage)
          setSeenItems(new Set(firstPage.map((item) => item.$id)))

          // Fetch image prefs
          const imagePrefsData = await databases.listRows({
            databaseId: "hp_db",
            tableId: "gallery-prefs",
            queries: [Query.limit(5000)],
          })
          const parsedImagePrefs = imagePrefsData.rows.reduce(
            (acc: Record<string, GalleryPrefsDocumentsType>, pref: any) => {
              acc[pref.galleryId] = pref as GalleryPrefsDocumentsType
              return acc
            },
            {}
          )
          setImagePrefs(parsedImagePrefs)

          // Generate thumbnails for videos
          firstPage.forEach((image) => {
            if (image.mimeType?.includes("video")) {
              void generateThumbnail(image.$id)
            }
          })
          return
        }

        // For subsequent pages, fetch items we haven't seen yet
        const unseenFilters = [...query]
        if (seenItems.size > 0) {
          // Create an array of notEqual queries for each seen item
          const notEqualQueries = Array.from(seenItems).map((id) =>
            Query.notEqual("$id", id)
          )
          // Add all notEqual queries using Query.and
          unseenFilters.push(Query.and(notEqualQueries))
        }

        const newGallery = await databases.listRows({
          databaseId: "hp_db",
          tableId: "gallery-images",
          queries: unseenFilters,
        })

        // If we've seen all items, reset seen items and fetch from the beginning
        if (newGallery.rows.length === 0) {
          setSeenItems(new Set())
          const allGallery = await databases.listRows({
            databaseId: "hp_db",
            tableId: "gallery-images",
            queries: [Query.limit(1000)],
          })
          const allDocuments =
            allGallery.rows as unknown as GalleryDocumentsType[]
          const shuffled = [...allDocuments].sort(() => Math.random() - 0.5)
          const pageItems = shuffled.slice(0, pageSize)

          if (append) {
            setImages((prevImages) => [...prevImages, ...pageItems])
          } else {
            setImages(pageItems)
          }
          setSeenItems(new Set(pageItems.map((item) => item.$id)))

          // Fetch image prefs
          const imagePrefsData = await databases.listRows({
            databaseId: "hp_db",
            tableId: "gallery-prefs",
            queries: [Query.limit(5000)],
          })
          const parsedImagePrefs = imagePrefsData.rows.reduce(
            (acc: Record<string, GalleryPrefsDocumentsType>, pref: any) => {
              acc[pref.galleryId] = pref as GalleryPrefsDocumentsType
              return acc
            },
            {}
          )
          setImagePrefs(parsedImagePrefs)

          // Generate thumbnails for videos
          pageItems.forEach((image) => {
            if (image.mimeType?.includes("video")) {
              void generateThumbnail(image.$id)
            }
          })
          return
        }

        const newDocuments =
          newGallery.rows as unknown as GalleryDocumentsType[]
        const shuffled = [...newDocuments].sort(() => Math.random() - 0.5)
        const pageItems = shuffled.slice(0, pageSize)

        // Update seen items and gallery
        if (append) {
          setImages((prevImages) => [...prevImages, ...pageItems])
        } else {
          setImages(pageItems)
        }
        setSeenItems(
          (prev) => new Set([...prev, ...pageItems.map((item) => item.$id)])
        )

        // Fetch image prefs
        const imagePrefsData = await databases.listRows({
          databaseId: "hp_db",
          tableId: "gallery-prefs",
          queries: [Query.limit(5000)],
        })
        const parsedImagePrefs = imagePrefsData.rows.reduce(
          (acc: Record<string, GalleryPrefsDocumentsType>, pref: any) => {
            acc[pref.galleryId] = pref as GalleryPrefsDocumentsType
            return acc
          },
          {}
        )
        setImagePrefs(parsedImagePrefs)

        // Generate thumbnails for videos
        pageItems.forEach((image) => {
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

  const onRefresh = () => {
    setRefreshing(true)
    setCurrentPage(1)
    void fetchGallery(1, false)
    setRefreshing(false)
  }

  const loadMore = () => {
    if (!loadingMore && currentPage < totalPages) {
      setLoadingMore(true)
      const nextPage = currentPage + 1
      setCurrentPage(nextPage)
      void fetchGallery(nextPage, true)
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
          onRefresh={() => onRefresh()}
          refreshing={refreshing}
          numColumns={maxColumns}
          onEndReached={() => loadMore()}
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
