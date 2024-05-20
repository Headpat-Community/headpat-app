import { RefreshControl, TouchableWithoutFeedback, View } from 'react-native'
import { Image } from 'expo-image'
import { database } from '~/lib/appwrite-client'
import { ScrollView } from 'react-native-gesture-handler'
import { Link } from 'expo-router'
import { useColorScheme } from '~/lib/useColorScheme'
import { useEffect, useState } from 'react'
import { toast } from '~/lib/toast'
import * as Sentry from '@sentry/react-native'
import {
  GalleryImagesDocumentsType,
  GalleryImagesType,
} from '~/lib/types/collections'
import { Query } from 'react-native-appwrite'

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImagesDocumentsType[]>([])
  const [refreshing, setRefreshing] = useState<boolean>(false)

  const fetchGallery = async () => {
    try {
      const data: GalleryImagesType = await database.listDocuments(
        'hp_db',
        'gallery-images',
        [Query.equal('nsfw', false)]
      )

      setImages(data.documents)
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

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className={'flex-1 flex-row flex-wrap mt-4 gap-4'}>
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
              <Image
                source={getGalleryUrl(image.galleryId)}
                style={{ width: '48%', height: 200, borderRadius: 4 }}
                contentFit={'contain'}
              />
            </TouchableWithoutFeedback>
          </Link>
        ))}
      </View>
    </ScrollView>
  )
}
