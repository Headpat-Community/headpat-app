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
          ? [
              Query.limit(pageSize),
              Query.offset(offset),
              Query.orderDesc('$createdAt'),
            ]
          : [
              Query.limit(pageSize),
              Query.offset(offset),
              Query.equal('nsfw', false),
              Query.orderDesc('$createdAt'),
            ]

        const [imageData, imagePrefsData]: any = await Promise.all([
          databases.listDocuments('hp_db', 'gallery-images', query),
          databases.listDocuments('hp_db', 'gallery-prefs', [
            Query.limit(5000),
          ]),
        ])

        const parsedImagePrefs = imagePrefsData.documents.reduce(
          (
            acc: Gallery.GalleryDocumentsType,
            pref: Gallery.GalleryPrefsDocumentsType
          ) => {
            acc[pref.galleryId] = pref
            return acc
          },
          {}
        )

        setImagePrefs(parsedImagePrefs)

        if (append) {
          setImages((prevImages) => [...prevImages, ...imageData.documents])
        } else {
          setImages(imageData.documents)
        }

        setTotalPages(Math.ceil(imageData.total / pageSize))

        imageData.documents.forEach((image) => {
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
        [galleryId]: uri,
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
              marginBottom: 10,
            }}
          >
            {[...Array(2)].map((_, i) => (
              <View
                key={i}
                style={{
                  position: 'relative',
                  width: widthColumns,
                  height: 200,
                  margin: 5,
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
                  alignItems: 'center',
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
