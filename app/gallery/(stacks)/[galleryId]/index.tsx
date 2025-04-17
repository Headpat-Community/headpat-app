import {
  Dimensions,
  Modal,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import { databases, functions } from '~/lib/appwrite-client'
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
import { ExecutionMethod } from 'react-native-appwrite'
import * as Sentry from '@sentry/react-native'
import { Badge } from '~/components/ui/badge'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'
import { Blurhash } from 'react-native-blurhash'

export default function HomeView() {
  const local = useLocalSearchParams()
  const [image, setImage] = useState<GalleryType.GalleryDocumentsType>(null)
  const [imagePrefs, setImagePrefs] = useState(null)
  const [userData, setUserData] = useState<UserData.UserDataDocumentsType>(null)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [moderationModalOpen, setModerationModalOpen] = useState(false)
  const [reportGalleryModalOpen, setReportGalleryModalOpen] = useState(false)
  const ref = useRef(null)
  const { showAlert, hideAlert } = useAlertModal()
  const { current } = useUser()

  // Get device dimensions
  const { width } = Dimensions.get('window')

  // Define height based on device size
  const imageHeight = width > 600 ? 600 : 300

  const fetchGallery = async () => {
    try {
      setRefreshing(true)
      const [imageData, imagePrefs]: any = await Promise.all([
        databases.getDocument('hp_db', 'gallery-images', `${local.galleryId}`),
        functions.createExecution(
          'gallery-endpoints',
          '',
          false,
          `/gallery/prefs?galleryId=${local?.galleryId}`,
          ExecutionMethod.GET
        ),
      ])

      setImage(imageData)
      setImagePrefs(JSON.parse(imagePrefs.responseBody))

      const userData: UserData.UserDataDocumentsType =
        await databases.getDocument('hp_db', 'userdata', imageData.userId)
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [player])
  )

  const handleReport = useCallback(() => {
    setModerationModalOpen(false)
    setReportGalleryModalOpen(true)
  }, [])

  const handleHide = useCallback(async () => {
    setModerationModalOpen(false)
    showAlert('LOADING', 'Please wait...')
    try {
      const data = await functions.createExecution(
        'gallery-endpoints',
        JSON.stringify({
          galleryId: image.$id,
          isHidden: !imagePrefs?.isHidden,
        }),
        false,
        `/gallery/prefs`,
        ExecutionMethod.PUT
      )
      const response = JSON.parse(data.responseBody)
      hideAlert()
      if (response.code === 200) {
        showAlert(
          'SUCCESS',
          `${imagePrefs?.isHidden ? 'Unhidden' : 'Hidden'} image successfully`
        )
        setImagePrefs({ ...imagePrefs, isHidden: !imagePrefs?.isHidden })
        //router.back()
      } else {
        showAlert('FAILED', 'Failed to hide image. Please try again later.')
      }
    } catch (error) {
      console.log(error)
      showAlert(
        'FAILED',
        `Failed to ${
          imagePrefs?.isHidden ? 'unhide' : 'hide'
        } image. Please try again later.`
      )
      Sentry.captureException(error)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image, imagePrefs])

  if (refreshing) {
    return (
      <View className={'mt-4'}>
        <View className={'gap-y-4 justify-center items-center mx-6'}>
          <Skeleton className={'w-full h-96'} />
          <Skeleton className={'w-[200px] h-8'} />
        </View>
        <View className={'mt-4 mx-6'}>
          <Skeleton className={'w-full h-24'} />
        </View>
        <View className={'mt-8 px-8'}>
          <Muted className={'pb-4'}>Uploaded by</Muted>
          <View className={'flex-row flex-wrap items-center justify-between'}>
            <View className={'flex-row items-center gap-4'}>
              <Skeleton className={'w-10 h-10 rounded-[10px]'} />
              <Skeleton className={'w-24 h-4'} />
            </View>
            <View>
              <Skeleton className={'w-24 h-4'} />
            </View>
          </View>
        </View>
      </View>
    )
  }

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {imagePrefs?.isHidden && (
        <Badge variant={'destructive'}>
          <Text>Image is hidden</Text>
        </Badge>
      )}
      <View style={{ flex: 1 }}>
        {imagePrefs?.isHidden ? (
          image?.blurHash ? (
            <Blurhash
              blurhash={image.blurHash}
              style={{ height: imageHeight, width: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <Skeleton className={'h-72'} />
          )
        ) : image?.mimeType.includes('video') ? (
          <VideoView
            ref={ref}
            style={styles.video}
            player={player}
            allowsFullscreen
            allowsPictureInPicture
          />
        ) : image?.nsfw ? (
          image?.blurHash ? (
            <Blurhash
              blurhash={image.blurHash}
              style={{ height: imageHeight, width: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Image
                source={{ uri: getGalleryUrl(image?.galleryId) }}
                style={{ height: imageHeight }}
                contentFit={'contain'}
              />
            </TouchableOpacity>
          )
        ) : (
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Image
              source={{ uri: getGalleryUrl(image?.galleryId) }}
              style={{ height: imageHeight }}
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
          {current?.$id && (
            <>
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
                  <Button
                    className={'text-center flex flex-row items-center'}
                    variant={'destructive'}
                    onPress={handleHide}
                  >
                    <Text>{imagePrefs?.isHidden ? 'Unhide' : 'Hide'}</Text>
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
            </>
          )}
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
