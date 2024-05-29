import {
  RefreshControl,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { Image } from 'expo-image'
import { database } from '~/lib/appwrite-client'
import { ScrollView } from 'react-native-gesture-handler'
import { Link, router } from 'expo-router'
import { useEffect, useState } from 'react'
import { toast } from '~/lib/toast'
import * as Sentry from '@sentry/react-native'
import {
  GalleryImagesDocumentsType,
  GalleryImagesType,
} from '~/lib/types/collections'
import { Query } from 'react-native-appwrite'
import * as VideoThumbnails from 'expo-video-thumbnails'
import { Badge } from '~/components/ui/badge'
import { Text } from '~/components/ui/text'
import { useUser } from '~/components/contexts/UserContext'
import { useBackHandler } from '@react-native-community/hooks'
import { useNavigation } from '@react-navigation/native'

export default function GalleryPage() {
  const { current } = useUser()

  const [images, setImages] = useState<GalleryImagesDocumentsType[]>([])
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [thumbnails, setThumbnails] = useState<{ [key: string]: string }>({})

  const fetchGallery = async () => {
    try {
      const nsfwPreference = current?.prefs?.nsfw ?? false
      let query = nsfwPreference ? [] : [Query.equal('nsfw', false)]

      const data: GalleryImagesType = await database.listDocuments(
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

  const onRefresh = () => {
    setRefreshing(true)
    fetchGallery().then()
    setRefreshing(false)
  }

  useEffect(() => {
    fetchGallery().then()
  }, [])

  useEffect(() => {
    fetchGallery().then()
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
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className={'flex-1 flex-row flex-wrap my-4 justify-between mx-0.5'}>
        {images.map((image, index) => (
          <Link
            href={{
              pathname: '/gallery/[galleryId]',
              params: { galleryId: image.$id },
            }}
            key={index}
            asChild
          >
            <TouchableWithoutFeedback>
              <View
                style={{
                  position: 'relative',
                  width: '49%',
                  height: 200,
                  marginBottom: 10,
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
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 50,
  },
  video: {
    width: 350,
    height: 275,
  },
  controlsContainer: {
    padding: 10,
  },
})
