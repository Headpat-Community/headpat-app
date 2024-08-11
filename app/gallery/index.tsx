import React, { useEffect, useState, useCallback } from 'react'
import { FlatList } from 'react-native'
import { database } from '~/lib/appwrite-client'
import { toast } from '~/lib/toast'
import * as Sentry from '@sentry/react-native'
import { Gallery } from '~/lib/types/collections'
import { Query } from 'react-native-appwrite'
import * as VideoThumbnails from 'expo-video-thumbnails'
import { useUser } from '~/components/contexts/UserContext'
import { useBackHandler } from '@react-native-community/hooks'
import { useNavigation } from '@react-navigation/native'
import GalleryItem from '~/components/gallery/GalleryItem'
import { Text } from 'react-native'

export default function GalleryPage() {
  const { current } = useUser()

  const [images, setImages] = useState<Gallery.GalleryDocumentsType[]>([])
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [thumbnails, setThumbnails] = useState<{ [key: string]: string }>({})
  const [offset, setOffset] = useState<number>(0)
  const [loadingMore, setLoadingMore] = useState<boolean>(false)

  const fetchGallery = useCallback(
    async (newOffset: number = 0) => {
      try {
        const nsfwPreference = current?.prefs?.nsfw ?? false
        let query = nsfwPreference
          ? [Query.limit(10), Query.offset(newOffset)]
          : [
              Query.limit(10),
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
      } catch (error) {
        toast('Failed to fetch gallery. Please try again later.')
        Sentry.captureException(error)
      }
    },
    [current]
  )

  const getGalleryUrl = useCallback((galleryId: string) => {
    if (!galleryId) return
    return `https://api.headpat.de/v1/storage/buckets/gallery/files/${galleryId}/preview?project=6557c1a8b6c2739b3ecf&width=400&height=400`
  }, [])

  const onRefresh = async () => {
    setRefreshing(true)
    setOffset(0)
    await fetchGallery(0)
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
    fetchGallery().then()
  }, [current, fetchGallery])

  const generateThumbnail = useCallback(async (galleryId: string) => {
    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(
        `https://api.headpat.de/v1/storage/buckets/gallery/files/${galleryId}/view?project=6557c1a8b6c2739b3ecf`
      )
      setThumbnails((prevThumbnails) => ({
        ...prevThumbnails,
        [galleryId]: uri,
      }))
    } catch (e) {
      console.warn(e)
    }
  }, [])

  const navigation = useNavigation()

  useBackHandler(() => {
    if (navigation.canGoBack()) {
      navigation.goBack()
      return true
    }
    return false
  })

  const renderItem = ({ item }) => (
    <GalleryItem
      image={item}
      thumbnail={thumbnails[item.$id]}
      getGalleryUrl={getGalleryUrl}
    />
  )

  return (
    <FlatList
      data={images}
      keyExtractor={(item) => item.$id}
      renderItem={renderItem}
      onRefresh={onRefresh}
      refreshing={refreshing}
      numColumns={2}
      contentContainerStyle={{ justifyContent: 'space-between' }}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={loadingMore ? <Text>Loading...</Text> : null}
    />
  )
}
