import React, { useCallback, useEffect, useState } from 'react'
import { Dimensions, FlatList, Text, View } from 'react-native'
import { database, functions, storage } from '~/lib/appwrite-client'
import * as Sentry from '@sentry/react-native'
import { Gallery } from '~/lib/types/collections'
import { ExecutionMethod, ImageFormat, Query } from 'react-native-appwrite'
import * as VideoThumbnails from 'expo-video-thumbnails'
import { useUser } from '~/components/contexts/UserContext'
import GalleryItem from '~/components/gallery/GalleryItem'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'

export default function GalleryPage() {
  const { current } = useUser()

  const [images, setImages] = useState<Gallery.GalleryDocumentsType[]>([])
  const [imagePrefs, setImagePrefs] = useState<{ [key: string]: any }>({})
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [thumbnails, setThumbnails] = useState<{ [key: string]: string }>({})
  const [offset, setOffset] = useState<number>(0)
  const [loadingMore, setLoadingMore] = useState<boolean>(false)
  const { hideLoadingModal, showLoadingModal, showAlertModal } = useAlertModal()
  const { width } = Dimensions.get('window')
  const maxColumns = width > 600 ? 4 : 2
  const startCount = width > 600 ? 27 : 9

  const fetchGallery = useCallback(
    async (newOffset: number = 0, limit: number = 10) => {
      try {
        const nsfwPreference = current?.prefs?.nsfw ?? false
        let query = nsfwPreference
          ? [Query.limit(limit), Query.offset(newOffset)]
          : [
              Query.limit(limit),
              Query.offset(newOffset),
              Query.equal('nsfw', false),
            ]

        const [imageData, imagePrefsData]: any = await Promise.all([
          database.listDocuments('hp_db', 'gallery-images', query),
          functions.createExecution(
            'gallery-endpoints',
            '',
            false,
            `/gallery/prefs/all`,
            ExecutionMethod.GET
          ),
        ])

        const parsedImagePrefs = JSON.parse(
          imagePrefsData.responseBody
        ).documents.reduce((acc, pref) => {
          acc[pref.galleryId] = pref
          return acc
        }, {})

        setImagePrefs(parsedImagePrefs)

        if (newOffset === 0) {
          setImages(imageData.documents)
        } else {
          setImages((prevImages) => [...prevImages, ...imageData.documents])
        }

        imageData.documents.forEach((image) => {
          if (image.mimeType.includes('video')) {
            generateThumbnail(image.$id)
          }
        })
      } catch (error) {
        showAlertModal(
          'FAILED',
          'Failed to fetch gallery. Please try again later.'
        )
        Sentry.captureException(error)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [current]
  )

  const getGalleryUrl = useCallback(
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
    await fetchGallery(0, 9)
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

  useEffect(() => {
    showLoadingModal()
    fetchGallery(0, startCount).then()
    hideLoadingModal()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, startCount])

  const generateThumbnail = useCallback(async (galleryId: string) => {
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

  const renderItem = ({ item }) => {
    const pref = imagePrefs[item.$id]
    return (
      <GalleryItem
        image={item}
        thumbnail={thumbnails[item.$id]}
        getGalleryUrl={getGalleryUrl}
        isHidden={pref?.isHidden}
      />
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={images}
        keyExtractor={(item) => item.$id}
        renderItem={renderItem}
        onRefresh={onRefresh}
        refreshing={refreshing}
        numColumns={maxColumns}
        contentContainerStyle={{ flexGrow: 1 }}
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
              <Text>Loading...</Text>
            </View>
          )
        }
      />
    </View>
  )
}
