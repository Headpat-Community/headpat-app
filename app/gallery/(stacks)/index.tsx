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

export default function GalleryPage() {
  const { current } = useUser()

  const [images, setImages] = React.useState<Gallery.GalleryDocumentsType[]>([])
  const [imagePrefs, setImagePrefs] = React.useState<{
    [key: string]: Gallery.GalleryPrefsDocumentsType
  }>({})
  const [refreshing, setRefreshing] = React.useState<boolean>(false)
  const [thumbnails, setThumbnails] = React.useState<{ [key: string]: string }>(
    {}
  )
  const [offset, setOffset] = React.useState<number>(0)
  const [loadingMore, setLoadingMore] = React.useState<boolean>(false)
  const { showAlert } = useAlertModal()
  const { width } = Dimensions.get('window')
  const maxColumns = width > 600 ? 4 : 2
  const startCount = width > 600 ? 27 : 9
  // Define height based on device size
  const widthColumns = width > 600 ? '24%' : '48%'

  const shuffleArray = (array: any) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
    return array
  }

  const fetchGallery = React.useCallback(
    async (newOffset: number = 0, limit: number = 20) => {
      try {
        const nsfwPreference = current?.prefs?.nsfw ?? false
        let query = nsfwPreference
          ? [
              Query.limit(limit),
              Query.offset(newOffset),
              Query.orderDesc('$createdAt'),
            ]
          : [
              Query.limit(limit),
              Query.offset(newOffset),
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

        const shuffledImages = shuffleArray(imageData.documents)

        if (newOffset === 0) {
          setImages(shuffledImages)
        } else {
          setImages((prevImages) => [...prevImages, ...shuffledImages])
        }

        shuffledImages.forEach((image) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [current]
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
    setOffset(0)
    await fetchGallery(0, 5000)
    setRefreshing(false)
  }

  const loadMore = async () => {
    if (!loadingMore) {
      setLoadingMore(true)
      const newOffset = offset + 10
      setOffset(newOffset)
      await fetchGallery(newOffset)
      setLoadingMore(false)
    }
  }

  React.useEffect(() => {
    // TODO: Use this in the future
    //fetchGallery(0, startCount).then()
    fetchGallery(0, 5000).then()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, startCount])

  const generateThumbnail = React.useCallback(async (galleryId: string) => {
    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(
        `https://api.headpat.place/v1/storage/buckets/gallery/files/${galleryId}/view?project=hp-main`
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
