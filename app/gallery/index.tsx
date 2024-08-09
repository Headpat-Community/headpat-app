import { FlatList, TouchableWithoutFeedback, View } from 'react-native'
import { Image } from 'expo-image'
import { database } from '~/lib/appwrite-client'
import { Link } from 'expo-router'
import { useEffect, useState } from 'react'
import { toast } from '~/lib/toast'
import * as Sentry from '@sentry/react-native'
import { Gallery } from '~/lib/types/collections'
import { Query } from 'react-native-appwrite'
import * as VideoThumbnails from 'expo-video-thumbnails'
import { Badge } from '~/components/ui/badge'
import { Text } from '~/components/ui/text'
import { useUser } from '~/components/contexts/UserContext'
import { useBackHandler } from '@react-native-community/hooks'
import { useNavigation } from '@react-navigation/native'

export default function GalleryPage() {
  const { current } = useUser()

  const [images, setImages] = useState<Gallery.GalleryDocumentsType[]>([])
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [thumbnails, setThumbnails] = useState<{ [key: string]: string }>({})
  const [offset, setOffset] = useState<number>(0)

  const fetchGallery = async () => {
    try {
      const nsfwPreference = current?.prefs?.nsfw ?? false
      let query = nsfwPreference
        ? [Query.limit(10), Query.offset(offset)]
        : [Query.limit(10), Query.offset(offset), Query.equal('nsfw', false)]

      const data: Gallery.GalleryType = await database.listDocuments(
        'hp_db',
        'gallery-images',
        query
      )

      setImages(data.documents)
      data.documents.forEach((image) => {
        if (image.mimeType.includes('video')) {
          generateThumbnail(image.$id)
        }
      })
    } catch (error) {
      toast('Failed to fetch gallery. Please try again later.')
      Sentry.captureException(error)
    }
  }

  const getGalleryUrl = (galleryId: string) => {
    if (!galleryId) return
    return `https://api.headpat.de/v1/storage/buckets/gallery/files/${galleryId}/preview?project=6557c1a8b6c2739b3ecf&width=400&height=400`
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchGallery()
    setRefreshing(false)
  }

  useEffect(() => {
    fetchGallery().then()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset])

  useEffect(() => {
    fetchGallery().then()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current])

  const generateThumbnail = async (galleryId: string) => {
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
  }
  const navigation = useNavigation()

  useBackHandler(() => {
    if (navigation.canGoBack()) {
      navigation.goBack()
      return true
    }
    return false
  })

  return (
    <FlatList
      data={images}
      keyExtractor={(item) => item.$id}
      renderItem={({ item: image }) => (
        <Link
          href={{
            pathname: '/gallery/[galleryId]',
            params: { galleryId: image.$id },
          }}
          asChild
        >
          <TouchableWithoutFeedback>
            <View
              style={{
                position: 'relative',
                width: '48%',
                height: 200,
                marginBottom: 10,
                margin: 5, // Add this line
              }}
            >
              <Image
                source={
                  image.mimeType.includes('video')
                    ? { uri: thumbnails[image.$id] }
                    : { uri: getGalleryUrl(image.$id) }
                }
                alt={image.name}
                style={{ width: '100%', height: '100%' }}
                contentFit={'contain'}
              />
              {image.mimeType.includes('gif') && (
                <Badge
                  className={'absolute border-2 bg-secondary border-primary'}
                >
                  <Text className={'text-primary'}>GIF</Text>
                </Badge>
              )}
              {image.mimeType.includes('video') && (
                <Badge
                  className={'absolute border-2 bg-secondary border-primary'}
                >
                  <Text className={'text-primary'}>Video</Text>
                </Badge>
              )}
            </View>
          </TouchableWithoutFeedback>
        </Link>
      )}
      onRefresh={onRefresh}
      refreshing={refreshing}
      numColumns={2} // for 2 columns
      contentContainerStyle={{ justifyContent: 'space-between' }} // to maintain the space between items
    />
  )
}
