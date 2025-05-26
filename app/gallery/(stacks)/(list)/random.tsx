import React from 'react'
import { Dimensions, Text, View } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { databases, storage } from '~/lib/appwrite-client'
import * as Sentry from '@sentry/react-native'
import { Gallery } from '~/lib/types/collections'
import { ImageFormat, Query } from 'react-native-appwrite'
import * as VideoThumbnails from 'expo-video-thumbnails'
import { useUser } from '~/components/contexts/UserContext'
import GalleryItem from '~/components/gallery/GalleryItem'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'
import { Skeleton } from '~/components/ui/skeleton'
import FeatureAccess from '~/components/FeatureAccess'
import { i18n } from '~/components/system/i18n'
import { useRouter } from 'expo-router'

export default function GalleryPage() {
  const { current } = useUser()
  const router = useRouter()

  const [images, setImages] = React.useState<Gallery.GalleryDocumentsType[]>([])
  const [imagePrefs, setImagePrefs] = React.useState<{
    [key: string]: Gallery.GalleryPrefsDocumentsType
  }>({})
  const [refreshing, setRefreshing] = React.useState<boolean>(false)
  const [thumbnails, setThumbnails] = React.useState<{ [key: string]: string }>(
    {}
  )
  const [currentPage, setCurrentPage] = React.useState<number>(1)
  const [totalPages, setTotalPages] = React.useState<number>(1)
  const [loadingMore, setLoadingMore] = React.useState<boolean>(false)
  const [seenItems, setSeenItems] = React.useState<Set<string>>(new Set())
  const { showAlert } = useAlertModal()
  const { width } = Dimensions.get('window')
  const maxColumns = width > 600 ? 4 : 2
  const pageSize = 48 // Number of items per page
  const widthColumns = width > 600 ? '24%' : '48%'

  const fetchGallery = React.useCallback(
    async (page: number = 1, append: boolean = false) => {
      try {
        const offset = (page - 1) * pageSize
        const nsfwPreference = current?.prefs?.nsfw ?? false
        let query = nsfwPreference
          ? [Query.limit(pageSize), Query.offset(offset)]
          : [
              Query.limit(pageSize),
              Query.offset(offset),
              Query.equal('nsfw', false)
            ]

        // Get total count first
        const totalCount = await databases.listDocuments(
          'hp_db',
          'gallery-images',
          [Query.limit(1)]
        )
        setTotalPages(Math.ceil(totalCount.total / pageSize))

        // If we're on page 1, fetch and shuffle all items
        if (page === 1) {
          setSeenItems(new Set()) // Reset seen items when going back to page 1
          const allGallery = await databases.listDocuments(
            'hp_db',
            'gallery-images',
            [Query.limit(1000)]
          )
          const allDocuments =
            allGallery.documents as unknown as Gallery.GalleryDocumentsType[]
          const shuffled = [...allDocuments].sort(() => Math.random() - 0.5)

          // Store the first page and seen items
          const firstPage = shuffled.slice(0, pageSize)
          setImages(firstPage)
          setSeenItems(new Set(firstPage.map((item) => item.$id)))

          // Fetch image prefs
          const imagePrefsData = await databases.listDocuments(
            'hp_db',
            'gallery-prefs',
            [Query.limit(5000)]
          )
          const parsedImagePrefs = imagePrefsData.documents.reduce(
            (
              acc: { [key: string]: Gallery.GalleryPrefsDocumentsType },
              pref: Gallery.GalleryPrefsDocumentsType
            ) => {
              acc[pref.galleryId] = pref
              return acc
            },
            {}
          )
          setImagePrefs(parsedImagePrefs)

          // Generate thumbnails for videos
          firstPage.forEach((image) => {
            if (image.mimeType.includes('video')) {
              generateThumbnail(image.$id)
            }
          })
          return
        }

        // For subsequent pages, fetch items we haven't seen yet
        const unseenFilters = [...query]
        if (seenItems.size > 0) {
          // Create an array of notEqual queries for each seen item
          const notEqualQueries = Array.from(seenItems).map((id) =>
            Query.notEqual('$id', id)
          )
          // Add all notEqual queries using Query.and
          unseenFilters.push(Query.and(notEqualQueries))
        }

        const newGallery = await databases.listDocuments(
          'hp_db',
          'gallery-images',
          unseenFilters
        )

        // If we've seen all items, reset seen items and fetch from the beginning
        if (newGallery.documents.length === 0) {
          setSeenItems(new Set())
          const allGallery = await databases.listDocuments(
            'hp_db',
            'gallery-images',
            [Query.limit(1000)]
          )
          const allDocuments =
            allGallery.documents as unknown as Gallery.GalleryDocumentsType[]
          const shuffled = [...allDocuments].sort(() => Math.random() - 0.5)
          const pageItems = shuffled.slice(0, pageSize)

          if (append) {
            setImages((prevImages) => [...prevImages, ...pageItems])
          } else {
            setImages(pageItems)
          }
          setSeenItems(new Set(pageItems.map((item) => item.$id)))

          // Fetch image prefs
          const imagePrefsData = await databases.listDocuments(
            'hp_db',
            'gallery-prefs',
            [Query.limit(5000)]
          )
          const parsedImagePrefs = imagePrefsData.documents.reduce(
            (
              acc: { [key: string]: Gallery.GalleryPrefsDocumentsType },
              pref: Gallery.GalleryPrefsDocumentsType
            ) => {
              acc[pref.galleryId] = pref
              return acc
            },
            {}
          )
          setImagePrefs(parsedImagePrefs)

          // Generate thumbnails for videos
          pageItems.forEach((image) => {
            if (image.mimeType.includes('video')) {
              generateThumbnail(image.$id)
            }
          })
          return
        }

        const newDocuments =
          newGallery.documents as unknown as Gallery.GalleryDocumentsType[]
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
        const imagePrefsData = await databases.listDocuments(
          'hp_db',
          'gallery-prefs',
          [Query.limit(5000)]
        )
        const parsedImagePrefs = imagePrefsData.documents.reduce(
          (
            acc: { [key: string]: Gallery.GalleryPrefsDocumentsType },
            pref: Gallery.GalleryPrefsDocumentsType
          ) => {
            acc[pref.galleryId] = pref
            return acc
          },
          {}
        )
        setImagePrefs(parsedImagePrefs)

        // Generate thumbnails for videos
        pageItems.forEach((image) => {
          if (image.mimeType.includes('video')) {
            generateThumbnail(image.$id)
          }
        })
      } catch (error) {
        console.log(error)
        showAlert('FAILED', 'Failed to fetch gallery. Please try again later.')
        Sentry.captureException(error)
      }
    },
    [current, pageSize]
  )

  const getGalleryUrl = React.useCallback(
    (galleryId: string, output: ImageFormat = ImageFormat.Jpeg) => {
      if (!galleryId) return
      const data = storage.getFilePreview(
        'gallery',
        `${galleryId}`,
        400,
        400,
        undefined,
        50,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        output
      )
      return data.href
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
    fetchGallery(1, false)
  }, [current])

  const generateThumbnail = React.useCallback(async (galleryId: string) => {
    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/v1/storage/buckets/gallery/files/${galleryId}/view?project=hp-main`
      )
      setThumbnails((prevThumbnails) => ({
        ...prevThumbnails,
        [galleryId]: uri
      }))
    } catch (e) {
      console.warn(e)
    }
  }, [])

  if (!images || images.length === 0) {
    return (
      <View style={{ flex: 1 }}>
        {Array.from({ length: 16 }).map((_, index) => (
          <View
            key={index}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 10
            }}
          >
            {[...Array(2)].map((_, i) => (
              <View
                key={i}
                style={{
                  position: 'relative',
                  width: widthColumns,
                  height: 200,
                  margin: 5
                }}
              >
                <Skeleton className={'w-full h-full'} />
              </View>
            ))}
          </View>
        ))}
      </View>
    )
  }

  return (
    <FeatureAccess featureName={'gallery'}>
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
          onRefresh={onRefresh}
          refreshing={refreshing}
          estimatedItemSize={200}
          numColumns={maxColumns}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore && (
              <View
                style={{
                  padding: 10,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Text>{i18n.t('main.loading')}</Text>
              </View>
            )
          }
        />
      </View>
    </FeatureAccess>
  )
}
