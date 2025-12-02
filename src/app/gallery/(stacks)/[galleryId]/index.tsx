import { useFocusEffect } from '@react-navigation/core'
import * as Sentry from '@sentry/react-native'
import { Image } from 'expo-image'
import { Link, useLocalSearchParams } from 'expo-router'
import { useVideoPlayer, VideoView } from 'expo-video'
import { useTranslations } from 'gt-react-native'
import { ShieldAlertIcon } from 'lucide-react-native'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Dimensions, Modal, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native'
import { ExecutionMethod } from 'react-native-appwrite'
import Gallery from 'react-native-awesome-gallery'
import { ScrollView } from 'react-native-gesture-handler'
import { timeSince } from '~/components/calculateTimeLeft'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'
import { useUser } from '~/components/contexts/UserContext'
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
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Skeleton } from '~/components/ui/skeleton'
import { Text } from '~/components/ui/text'
import { H4, Muted } from '~/components/ui/typography'
import { databases, functions } from '~/lib/appwrite-client'
import type {
  GalleryDocumentsType,
  GalleryPrefsDocumentsType,
  UserDataDocumentsType,
} from '~/lib/types/collections'

export default function HomeView() {
  const local = useLocalSearchParams()
  const [image, setImage] = useState<GalleryDocumentsType | null>(null)
  const [imagePrefs, setImagePrefs] = useState<GalleryPrefsDocumentsType | null>(null)
  const [userData, setUserData] = useState<UserDataDocumentsType | null>(null)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [moderationModalOpen, setModerationModalOpen] = useState(false)
  const [reportGalleryModalOpen, setReportGalleryModalOpen] = useState(false)
  const ref = useRef(null)
  const { showAlert, hideAlert } = useAlertModal()
  const { current } = useUser()
  const t = useTranslations()

  // Get device dimensions
  const { width } = Dimensions.get('window')

  // Define height based on device size
  const imageHeight = width > 600 ? 600 : 300

  const fetchGallery = async () => {
    try {
      setRefreshing(true)
      const [imageData, imagePrefs]: any = await Promise.all([
        databases.getRow({
          databaseId: 'hp_db',
          tableId: 'gallery-images',
          rowId: local.galleryId as string,
        }),
        functions.createExecution({
          functionId: 'gallery-endpoints',
          body: '',
          async: false,
          xpath: `/gallery/prefs?galleryId=${local.galleryId as string}`,
          method: ExecutionMethod.GET,
        }),
      ])

      setImage(imageData as GalleryDocumentsType)
      setImagePrefs(JSON.parse(imagePrefs.responseBody as string) as GalleryPrefsDocumentsType)

      const userData: UserDataDocumentsType = await databases.getRow({
        databaseId: 'hp_db',
        tableId: 'userdata',
        rowId: imageData.userId,
      })
      setUserData(userData)
      setRefreshing(false)
    } catch {
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    void fetchGallery()
    setRefreshing(false)
  }

  useEffect(() => {
    void fetchGallery()
  }, [local.galleryId])

  const getGalleryUrl = (galleryId: string | undefined) => {
    if (!galleryId) return
    return `${process.env.EXPO_PUBLIC_BACKEND_URL}/v1/storage/buckets/gallery/files/${galleryId}/view?project=hp-main`
  }

  const handleModalImage = (galleryId: string | undefined) => {
    if (!galleryId) return
    return [
      `${process.env.EXPO_PUBLIC_BACKEND_URL}/v1/storage/buckets/gallery/files/${galleryId}/view?project=hp-main`,
    ]
  }

  const getUserAvatar = (userAvatarId: string) => {
    if (!userAvatarId) return
    return `${process.env.EXPO_PUBLIC_BACKEND_URL}/v1/storage/buckets/avatars/files/${userAvatarId}/preview?project=hp-main&width=128&height=128`
  }

  const player = useVideoPlayer(getGalleryUrl(local.galleryId as string) ?? '', (player) => {
    player.loop = true
    player.staysActiveInBackground = false
  })

  useFocusEffect(
    useCallback(() => {
      return () => {
        //if (player.playing) player.pause()
      }
    }, [player]),
  )

  const handleReport = useCallback(() => {
    setModerationModalOpen(false)
    setReportGalleryModalOpen(true)
  }, [])

  const handleHide = useCallback(async () => {
    setModerationModalOpen(false)
    showAlert('LOADING', 'Please wait...')
    try {
      const data = await functions.createExecution({
        functionId: 'gallery-endpoints',
        body: JSON.stringify({
          galleryId: image?.$id,
          isHidden: !imagePrefs?.isHidden,
        }),
        async: false,
        xpath: `/gallery/prefs`,
        method: ExecutionMethod.PUT,
      })
      const response = JSON.parse(data.responseBody)
      hideAlert()
      if (response.code === 200) {
        showAlert('SUCCESS', `${imagePrefs?.isHidden ? 'Unhidden' : 'Hidden'} image successfully`)
        setImagePrefs(imagePrefs ? { ...imagePrefs, isHidden: !imagePrefs.isHidden } : null)
        //router.back()
      } else {
        showAlert('FAILED', 'Failed to hide image. Please try again later.')
      }
    } catch (error) {
      console.log(error)
      showAlert(
        'FAILED',
        `Failed to ${imagePrefs?.isHidden ? 'unhide' : 'hide'} image. Please try again later.`,
      )
      Sentry.captureException(error)
    }
  }, [image, imagePrefs])

  if (refreshing) {
    return (
      <View className={'mt-4'}>
        <View className={'mx-6 items-center justify-center gap-y-4'}>
          <Skeleton className={'h-96 w-full'} />
          <Skeleton className={'h-8 w-[200px]'} />
        </View>
        <View className={'mx-6 mt-4'}>
          <Skeleton className={'h-24 w-full'} />
        </View>
        <View className={'mt-8 px-8'}>
          <Muted className={'pb-4'}>Uploaded by</Muted>
          <View className={'flex-row flex-wrap items-center justify-between'}>
            <View className={'flex-row items-center gap-4'}>
              <Skeleton className={'h-10 w-10 rounded-[10px]'} />
              <Skeleton className={'h-4 w-24'} />
            </View>
            <View>
              <Skeleton className={'h-4 w-24'} />
            </View>
          </View>
        </View>
      </View>
    )
  }

  if (!image) {
    return (
      <View className={'mt-4'}>
        <View className={'mx-6 items-center justify-center gap-y-4'}>
          <Skeleton className={'h-96 w-full'} />
          <Skeleton className={'h-8 w-[200px]'} />
        </View>
        <View className={'mx-6 mt-4'}>
          <Skeleton className={'h-24 w-full'} />
        </View>
        <View className={'mt-8 px-8'}>
          <Muted className={'pb-4'}>Uploaded by</Muted>
          <View className={'flex-row flex-wrap items-center justify-between'}>
            <View className={'flex-row items-center gap-4'}>
              <Skeleton className={'h-10 w-10 rounded-[10px]'} />
              <Skeleton className={'h-4 w-24'} />
            </View>
            <View>
              <Skeleton className={'h-4 w-24'} />
            </View>
          </View>
        </View>
      </View>
    )
  }

  return (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {imagePrefs?.isHidden && (
        <Badge variant={'destructive'}>
          <Text>Image is hidden</Text>
        </Badge>
      )}
      <View style={{ flex: 1 }}>
        {imagePrefs?.isHidden ? (
          <Skeleton className={'h-72'} />
        ) : image.mimeType?.includes('video') ? (
          <VideoView
            ref={ref}
            style={styles.video}
            player={player}
            allowsFullscreen
            allowsPictureInPicture
          />
        ) : image.nsfw && !current?.prefs.nsfw ? (
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Image
              source={{ uri: getGalleryUrl(image.galleryId) }}
              placeholder={{ blurhash: image.blurHash ?? '' }}
              style={{ height: imageHeight }}
              contentFit={'contain'}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Image
              source={{ uri: getGalleryUrl(image.galleryId) }}
              placeholder={{ blurhash: image.blurHash ?? '' }}
              style={{ height: imageHeight }}
              contentFit={'contain'}
            />
          </TouchableOpacity>
        )}

        <View className={'my-4 flex-row items-center justify-center gap-x-4'}>
          {current?.$id === image.userId && (
            <Link
              href={{
                pathname: '/gallery/(stacks)/[galleryId]/edit',
                params: { galleryId: image.$id },
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
              <AlertDialog onOpenChange={setModerationModalOpen} open={moderationModalOpen}>
                <AlertDialogTrigger asChild>
                  <Button className={'text-center'} variant={'destructive'}>
                    <ShieldAlertIcon color={'white'} />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className={'w-full'}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Moderation</AlertDialogTitle>
                    <AlertDialogDescription>What would you like to do?</AlertDialogDescription>
                    <View className={'gap-4'}>
                      <Button
                        className={'flex flex-row items-center text-center'}
                        variant={'destructive'}
                        onPress={handleReport}
                      >
                        <Text>Report</Text>
                      </Button>
                      <Button
                        className={'flex flex-row items-center text-center'}
                        variant={'destructive'}
                        onPress={() => void handleHide()}
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

        <H4 className={'mx-8 text-center'}>{image.name}</H4>
        {image.longText && <Text className={'mx-8 mt-4'}>{image.longText}</Text>}
        <View className={'mt-8 px-8'}>
          <Muted className={'pb-4'}>Uploaded by</Muted>
          <View className={'flex-row flex-wrap items-center justify-between'}>
            <Link
              href={{
                pathname: '/user/(stacks)/[userId]',
                params: { userId: image.userId },
              }}
              asChild
            >
              <TouchableOpacity>
                <View className={'flex-row items-center gap-4'}>
                  <Image
                    source={
                      userData?.avatarId
                        ? getUserAvatar(userData.avatarId)
                        : require('~/assets/pfp-placeholder.png')
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
              <Text>{timeSince(t, image.$createdAt)}</Text>
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
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Gallery
              data={handleModalImage(image.galleryId) ?? []}
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
