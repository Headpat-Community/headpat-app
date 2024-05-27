import {
  Button,
  RefreshControl,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { Image } from 'expo-image'
import { database } from '~/lib/appwrite-client'
import { ScrollView } from 'react-native-gesture-handler'
import { Link } from 'expo-router'
import { useColorScheme } from '~/lib/useColorScheme'
import { useEffect, useRef, useState } from 'react'
import { toast } from '~/lib/toast'
import * as Sentry from '@sentry/react-native'
import {
  GalleryImagesDocumentsType,
  GalleryImagesType,
} from '~/lib/types/collections'
import { Query } from 'react-native-appwrite'
import { useVideoPlayer, VideoView } from 'expo-video'

export default function GalleryPage() {
  const videoSource =
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'

  const [images, setImages] = useState<GalleryImagesDocumentsType[]>([])
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [isPlaying, setIsPlaying] = useState(true)
  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = true
    player.play()
  })
  const ref = useRef(null)

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

  useEffect(() => {
    const subscription = player.addListener('playingChange', (isPlaying) => {
      setIsPlaying(isPlaying)
    })

    return () => {
      subscription.remove()
    }
  }, [player])

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
              {image.mimeType === 'video/mp4' ? (
                <>
                  <VideoView
                    ref={ref}
                    style={styles.video}
                    player={player}
                    allowsFullscreen
                    allowsPictureInPicture
                  />
                  <View style={styles.controlsContainer}>
                    <Button
                      title={isPlaying ? 'Pause' : 'Play'}
                      onPress={() => {
                        if (isPlaying) {
                          player.pause()
                        } else {
                          player.play()
                        }
                        setIsPlaying(!isPlaying)
                      }}
                    />
                  </View>
                </>
              ) : (
                <Image
                  source={getGalleryUrl(image.$id)}
                  alt={image.name}
                  style={{ width: '48%', height: 200, borderRadius: 4 }}
                  contentFit={'contain'}
                />
              )}
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
