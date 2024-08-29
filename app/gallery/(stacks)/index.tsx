import React, { useCallback, useEffect, useState } from 'react'
import { FlatList, Text, View } from 'react-native'
import { database, storage } from '~/lib/appwrite-client'
import { toast } from '~/lib/toast'
import * as Sentry from '@sentry/react-native'
import { Gallery } from '~/lib/types/collections'
import { ImageFormat, Query } from 'react-native-appwrite'
import * as VideoThumbnails from 'expo-video-thumbnails'
import { useUser } from '~/components/contexts/UserContext'
import GalleryItem from '~/components/gallery/GalleryItem'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'

export default function GalleryPage() {
  const { current } = useUser()

  const [images, setImages] = useState<Gallery.GalleryDocumentsType[]>([])
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [thumbnails, setThumbnails] = useState<{ [key: string]: string }>({})
  const [offset, setOffset] = useState<number>(0)
  const [loadingMore, setLoadingMore] = useState<boolean>(false)
  const { hideLoadingModal, showLoadingModal, showAlertModal } = useAlertModal()

  const fetchGallery = useCallback(
    async (newOffset: number = 0, limit: number = 10) => {
      showLoadingModal()
      try {
        const nsfwPreference = current?.prefs?.nsfw ?? false
        let query = nsfwPreference
          ? [Query.limit(limit), Query.offset(newOffset)]
          : [
              Query.limit(limit),
              Query.offset(newOffset),
              Query.equal('nsfw', false),
            ]

        const data: Gallery.GalleryType = await database.listDocuments(
          'hp_db',
          'gallery-images',
          query
        )

        if (newOffset === 0) {
          setImages(data.documents)
        } else {
          setImages((prevImages) => [...prevImages, ...data.documents])
        }

        data.documents.forEach((image) => {
          if (image.mimeType.includes('video')) {
            generateThumbnail(image.$id)
          }
        })
        hideLoadingModal()
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
    await fetchGallery(0, 8)
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
    fetchGallery(0, 8).then()
    hideLoadingModal()
  }, [current, fetchGallery, hideLoadingModal, showLoadingModal])

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

  const renderItem = ({ item }) => (
    <GalleryItem
      image={item}
      thumbnail={thumbnails[item.$id]}
      getGalleryUrl={getGalleryUrl}
    />
  )

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={images}
        keyExtractor={(item) => item.$id}
        renderItem={renderItem}
        onRefresh={onRefresh}
        refreshing={refreshing}
        numColumns={2}
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
