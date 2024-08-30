import {
  Modal,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import { database, storage } from '~/lib/appwrite-client'
import Gallery from 'react-native-awesome-gallery'
import { ScrollView } from 'react-native-gesture-handler'
import { Link, router, useLocalSearchParams } from 'expo-router'
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

export default function HomeView() {
  const local = useLocalSearchParams()
  const [image, setImage] = useState<GalleryType.GalleryDocumentsType>(null)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [modalVisible, setModalVisible] = useState(false)
  const ref = useRef(null)
  const { hideLoadingModal, showLoadingModal, showAlertModal } = useAlertModal()
  const { current } = useUser()

  const fetchGallery = async () => {
    try {
      setRefreshing(true)
      showLoadingModal()
      const data: GalleryType.GalleryDocumentsType = await database.getDocument(
        'hp_db',
        'gallery-images',
        `${local.galleryId}`
      )

      setImage(data)
      setRefreshing(false)
      hideLoadingModal()
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      showAlertModal('FAILED', 'Failed to fetch gallery data.')
      setRefreshing(false)
    }
  }

  const saveGallery = async () => {
    try {
      await database.updateDocument(
        'hp_db',
        'gallery-images',
        `${local.galleryId}`,
        {
          name: image.name,
          longText: image.longText,
        }
      )

      showAlertModal('SUCCESS', 'Gallery data saved successfully.')
      router.back()
    } catch (error) {
      showAlertModal('FAILED', 'Failed to save gallery data.')
      Sentry.captureException(error)
    }
  }

  const deleteGalleryImage = async () => {
    showLoadingModal()
    try {
      await database.deleteDocument(
        'hp_db',
        'gallery-images',
        `${local.galleryId}`
      )
      await storage.deleteFile('gallery-images', `${local.galleryId}`)
      showAlertModal('SUCCESS', 'Gallery data deleted successfully.')
      router.navigate('/gallery/(stacks)/')
    } catch (error) {
      showAlertModal('FAILED', 'Failed to delete gallery data.')
      Sentry.captureException(error)
    }
  }

  const onRefresh = () => {
    fetchGallery().then()
  }

  useEffect(() => {
    showLoadingModal()
    fetchGallery().then()
    hideLoadingModal()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local.galleryId])

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
            <Input defaultValue={image?.name || ''} />
          </View>
          <View className={'mt-4'}>
            <Label nativeID={'gallery-longText'}>Description</Label>
            <Textarea defaultValue={image?.longText || ''} />
          </View>
          <Button className={'mt-8'} onPress={deleteGalleryImage}>
            <Text>Save</Text>
          </Button>
          <Button
            variant={'destructive'}
            className={'mt-8'}
            onPress={saveGallery}
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
