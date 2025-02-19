import {
  Modal,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import { databases, storage } from '~/lib/appwrite-client'
import Gallery from 'react-native-awesome-gallery'
import { ScrollView } from 'react-native-gesture-handler'
import { Link, router, useGlobalSearchParams } from 'expo-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Gallery as GalleryType } from '~/lib/types/collections'
import { Image } from 'expo-image'
import { Text } from '~/components/ui/text'
import { useVideoPlayer, VideoView } from 'expo-video'
import { useFocusEffect } from '@react-navigation/core'
import { Skeleton } from '~/components/ui/skeleton'
import { Label } from '~/components/ui/label'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Button } from '~/components/ui/button'
import { useUser } from '~/components/contexts/UserContext'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'
import * as Sentry from '@sentry/react-native'
import { z } from 'zod'

const gallerySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(32, 'Name is too long'),
  longText: z.string().trim().max(2048, 'Description is too long').optional(),
})

export default function HomeView() {
  const local = useGlobalSearchParams()
  const [image, setImage] = useState<GalleryType.GalleryDocumentsType>(null)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [modalVisible, setModalVisible] = useState(false)
  const ref = useRef(null)
  const { showAlert } = useAlertModal()
  const { current } = useUser()

  const fetchGallery = async () => {
    try {
      setRefreshing(true)
      const data: GalleryType.GalleryDocumentsType =
        await databases.getDocument(
          'hp_db',
          'gallery-images',
          `${local?.galleryId}`
        )

      setImage(data)
      setRefreshing(false)
    } catch (error) {
      console.log(error)
      showAlert('FAILED', 'Failed to fetch gallery data. Does it exist?')
      setRefreshing(false)
    }
  }

  const saveGallery = async () => {
    try {
      gallerySchema.parse({
        name: image.name,
        longText: image.longText,
      })

      await databases.updateDocument(
        'hp_db',
        'gallery-images',
        `${local.galleryId}`,
        {
          name: image.name,
          longText: image.longText || '',
        }
      )

      showAlert('SUCCESS', 'Gallery data saved successfully.')
      router.back()
    } catch (error) {
      if (error instanceof z.ZodError) {
        showAlert('FAILED', error.errors.map((e) => e.message).join(', '))
      } else {
        showAlert('FAILED', 'Failed to save gallery data.')
        Sentry.captureException(error)
      }
    }
  }

  const deleteGalleryImage = async () => {
    try {
      await databases.deleteDocument(
        'hp_db',
        'gallery-images',
        `${local.galleryId}`
      )
      await storage.deleteFile('gallery', `${local.galleryId}`)
      showAlert('SUCCESS', 'Gallery data deleted successfully.')
      // I have no clue how to go back 3 times...
      router.navigate('/')
    } catch (error) {
      showAlert('FAILED', 'Failed to delete gallery data.')
      Sentry.captureException(error)
    }
  }

  const onRefresh = () => {
    fetchGallery().then()
  }

  const getGalleryUrl = (galleryId: string) => {
    if (!galleryId) return
    return `https://api.headpat.place/v1/storage/buckets/gallery/files/${galleryId}/view?project=hp-main`
  }

  const handleModalImage = (galleryId: string) => {
    if (!galleryId) return
    return [
      `https://api.headpat.place/v1/storage/buckets/gallery/files/${galleryId}/view?project=hp-main`,
    ]
  }

  const player = useVideoPlayer(
    getGalleryUrl(`${local.galleryId}`),
    (player) => {
      player.loop = true
      player.staysActiveInBackground = false
    }
  )

  useEffect(() => {
    if (current && image) {
      if (current.$id !== image?.userId) {
        router.push('/login')
      }
    }
  }, [current, image])

  useFocusEffect(
    useCallback(() => {
      fetchGallery().then()
      return () => {
        //if (player.playing) player.pause()
      }
    }, [])
  )

  if (!current) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>You need to be logged in to view this page!</Text>
        <Link href={'/login'}>
          <Text>Go to login</Text>
        </Link>
      </View>
    )
  }

  if (refreshing) {
    return (
      <View style={{ flex: 1 }}>
        <Skeleton className={'w-full'} />
      </View>
    )
  }

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={{ flex: 1 }}>
        {image?.mimeType.includes('video') ? (
          <VideoView
            ref={ref}
            style={styles.video}
            player={player}
            allowsFullscreen
            allowsPictureInPicture
          />
        ) : (
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Image
              source={{ uri: getGalleryUrl(image?.galleryId) }}
              style={{ height: 300 }}
              contentFit={'contain'}
            />
          </TouchableOpacity>
        )}

        <View className={'mt-8 px-8'}>
          <View>
            <Label nativeID={'gallery-name'}>Name</Label>
            <Input
              value={image?.name || ''}
              onChangeText={(text) => {
                setImage({
                  ...image,
                  name: text,
                })
              }}
            />
          </View>
          <View className={'mt-4'}>
            <Label nativeID={'gallery-longText'}>Description</Label>
            <Textarea
              value={image?.longText || ''}
              onChangeText={(text) => {
                setImage({
                  ...image,
                  longText: text,
                })
              }}
              numberOfLines={4}
              multiline={true}
            />
          </View>
          <Button className={'mt-8'} onPress={saveGallery}>
            <Text>Save</Text>
          </Button>
          <Button
            variant={'destructive'}
            className={'mt-8'}
            onPress={deleteGalleryImage}
          >
            <Text>Delete</Text>
          </Button>
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible)
          }}
        >
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <Gallery
              data={handleModalImage(image?.galleryId)}
              onSwipeToClose={() => setModalVisible(false)}
            />
          </View>
        </Modal>
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
    height: 300,
  },
  controlsContainer: {
    padding: 10,
  },
})
