import { Modal, RefreshControl, TouchableOpacity, View } from 'react-native'
import { database } from '~/lib/appwrite-client'
import Gallery from 'react-native-awesome-gallery'
import { ScrollView } from 'react-native-gesture-handler'
import { useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import {
  GalleryImagesDocumentsType,
  UserDataDocumentsType,
} from '~/lib/types/collections'
import { Image } from 'expo-image'
import { Text } from '~/components/ui/text'
import { H4, Muted } from '~/components/ui/typography'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { timeSince } from '~/components/calculateTimeLeft'

export default function HomeView() {
  const local = useLocalSearchParams()
  const [image, setImage] = useState<GalleryImagesDocumentsType>(null)
  const [userData, setUserData] = useState<UserDataDocumentsType>(null)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [modalVisible, setModalVisible] = useState(false)

  const fetchGallery = async () => {
    try {
      setRefreshing(true)
      const data: GalleryImagesDocumentsType = await database.getDocument(
        'hp_db',
        'gallery-images',
        `${local.galleryId}`
      )

      setImage(data)

      const userData: UserDataDocumentsType = await database.getDocument(
        'hp_db',
        'userdata',
        data.userId
      )
      setUserData(userData)
      setRefreshing(false)
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
  }, [local.galleryId])

  const getGalleryUrl = (galleryId: string) => {
    if (!galleryId) return
    return `https://api.headpat.de/v1/storage/buckets/gallery/files/${galleryId}/view?project=6557c1a8b6c2739b3ecf`
  }

  const handleModalImage = (galleryId: string) => {
    if (!galleryId) return
    return [
      `https://api.headpat.de/v1/storage/buckets/gallery/files/${galleryId}/view?project=6557c1a8b6c2739b3ecf`,
    ]
  }

  const getUserAvatar = (userAvatarId: string) => {
    if (!userAvatarId) return
    return `https://api.headpat.de/v1/storage/buckets/avatars/files/${userAvatarId}/preview?project=6557c1a8b6c2739b3ecf&width=128&height=128`
  }

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={{ flex: 1 }}>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Image
            source={{ uri: getGalleryUrl(image?.galleryId) }}
            style={{ height: 300 }}
            contentFit={'contain'}
          />
        </TouchableOpacity>

        <H4 className={'text-center'}>{image?.name}</H4>
        <View className={'mt-8 px-8'}>
          <Muted className={'pb-4'}>Uploaded by</Muted>
          <View className={'flex-row flex-wrap items-center justify-between'}>
            <View className={'flex-row items-center gap-4'}>
              <Avatar
                alt={userData?.displayName || 'Unknown name'}
                style={{ width: 44, height: 44 }}
              >
                <AvatarImage
                  source={{ uri: getUserAvatar(userData?.avatarId) }}
                />
                <AvatarFallback>HP</AvatarFallback>
              </Avatar>
              <Text>{userData?.displayName}</Text>
            </View>
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
