import {
  Modal,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import { database } from '~/lib/appwrite-client'
import Gallery from 'react-native-awesome-gallery'
import { ScrollView } from 'react-native-gesture-handler'
import { Link, useLocalSearchParams } from 'expo-router'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Gallery as GalleryType, UserData } from '~/lib/types/collections'
import { Image } from 'expo-image'
import { Text } from '~/components/ui/text'
import { H4, Muted } from '~/components/ui/typography'
import { timeSince } from '~/components/calculateTimeLeft'
import { useVideoPlayer, VideoView } from 'expo-video'
import { useFocusEffect } from '@react-navigation/core'
import { Skeleton } from '~/components/ui/skeleton'
import { useUser } from '~/components/contexts/UserContext'
import { Button } from '~/components/ui/button'
import ReportGalleryModal from '~/components/gallery/moderation/ReportGalleryModal'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog'
import { ShieldAlertIcon } from 'lucide-react-native'

export default function HomeView() {
  const local = useLocalSearchParams()
  const [image, setImage] = useState<GalleryType.GalleryDocumentsType>(null)
  const [userData, setUserData] = useState<UserData.UserDataDocumentsType>(null)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [moderationModalOpen, setModerationModalOpen] = useState(false)
  const [reportGalleryModalOpen, setReportGalleryModalOpen] = useState(false)
  const ref = useRef(null)
  const { current } = useUser()

  const fetchGallery = async () => {
    try {
      setRefreshing(true)
      const data: GalleryType.GalleryDocumentsType = await database.getDocument(
        'hp_db',
        'gallery-images',
        `${local.galleryId}`
      )

      setImage(data)

      const userData: UserData.UserDataDocumentsType =
        await database.getDocument('hp_db', 'userdata', data.userId)
      setUserData(userData)
      setRefreshing(false)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchGallery().then()
    setRefreshing(false)
  }

  useEffect(() => {
    fetchGallery().then()
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

  const getUserAvatar = (userAvatarId: string) => {
    if (!userAvatarId) return
    return `https://api.headpat.place/v1/storage/buckets/avatars/files/${userAvatarId}/preview?project=hp-main&width=128&height=128`
  }

  const player = useVideoPlayer(
    getGalleryUrl(`${local.galleryId}`),
    (player) => {
      player.loop = true
      player.staysActiveInBackground = false
    }
  )

  useFocusEffect(
    useCallback(() => {
      return () => {
        //if (player.playing) player.pause()
      }
    }, [player])
  )

  const handleReport = useCallback(() => {
    setModerationModalOpen(false)
    setReportGalleryModalOpen(true)
  }, [])

  if (refreshing) {
    return (
      <View style={{ flex: 1 }}>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Skeleton className={'w-full'} />
        </TouchableOpacity>
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

        <View className={'flex-row justify-center items-center my-4 gap-x-4'}>
          {current?.$id === image?.userId && (
            <Link
              href={{
                pathname: '/gallery/(stacks)/[galleryId]/edit',
                params: { galleryId: image?.$id },
              }}
              asChild
            >
              <Button>
                <Text>Edit</Text>
              </Button>
            </Link>
          )}
          <ReportGalleryModal
            image={image}
            open={reportGalleryModalOpen}
            setOpen={setReportGalleryModalOpen}
          />
          <AlertDialog
            onOpenChange={setModerationModalOpen}
            open={moderationModalOpen}
          >
            <AlertDialogTrigger asChild>
              <Button className={'text-center'} variant={'destructive'}>
                <ShieldAlertIcon color={'white'} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className={'w-full'}>
              <AlertDialogHeader>
                <AlertDialogTitle>Moderation</AlertDialogTitle>
                <AlertDialogDescription>
                  What would you like to do?
                </AlertDialogDescription>
                <View className={'gap-4'}>
                  <Button
                    className={'text-center flex flex-row items-center'}
                    variant={'destructive'}
                    onPress={handleReport}
                  >
                    <Text>Report</Text>
                  </Button>
                </View>
              </AlertDialogHeader>
              <AlertDialogFooter className={'mt-8'}>
                <AlertDialogAction>
                  <Text>Cancel</Text>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </View>

        <H4 className={'text-center mx-8'}>{image?.name}</H4>
        {image?.longText && (
          <Text className={'mx-8 mt-4'}>{image?.longText}</Text>
        )}
        <View className={'mt-8 px-8'}>
          <Muted className={'pb-4'}>Uploaded by</Muted>
          <View className={'flex-row flex-wrap items-center justify-between'}>
            <Link
              href={{
                pathname: '/user/(stacks)/[userId]',
                params: { userId: image?.userId },
              }}
              asChild
            >
              <TouchableOpacity>
                <View className={'flex-row items-center gap-4'}>
                  <Image
                    source={
                      getUserAvatar(userData?.avatarId) ||
                      require('~/assets/pfp-placeholder.png')
                    }
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                    }}
                  />
                  <Text>{userData?.displayName}</Text>
                </View>
              </TouchableOpacity>
            </Link>

            <View>
              <Text>{timeSince(image?.$createdAt)}</Text>
            </View>
          </View>
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
