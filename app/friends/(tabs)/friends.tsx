import {
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native'
import { H1, Muted } from '~/components/ui/typography'
import { useColorScheme } from '~/lib/useColorScheme'
import { useEffect, useState } from 'react'
import {
  FriendsDocumentsType,
  FriendsType,
  UserDataDocumentsType,
} from '~/lib/types/collections'
import { database } from '~/lib/appwrite-client'
import { Query } from 'react-native-appwrite'
import { toast } from '~/lib/toast'
import * as Sentry from '@sentry/react-native'
import { Text } from '~/components/ui/text'
import { Image } from 'expo-image'
import { Link, router } from 'expo-router'

export default function FriendsPage() {
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? 'white' : 'black'
  const [friends, setFriends] = useState<FriendsType>(null)
  const [friendData, setFriendData] = useState<UserDataDocumentsType>(null)
  const [refreshing, setRefreshing] = useState<boolean>(false)

  const fetchFriends = async () => {
    try {
      const data: FriendsType = await database.listDocuments('hp_db', 'friends')

      setFriends(data)
    } catch (error) {
      toast('Failed to fetch friends. Please try again later.')
      Sentry.captureException(error)
    }
  }

  const fetchUserdataForFriends = async (friends: string[]) => {
    try {
      const promises = friends.map((friendId) =>
        database.listDocuments('hp_db', 'userdata', [
          Query.equal('$id', friendId),
        ])
      )

      const results = await Promise.all(promises)
      return results.map((result) => result.documents[0])
    } catch (error) {
      toast('Failed to fetch userdata for friends. Please try again later.')
      Sentry.captureException(error)
    }
  }

  useEffect(() => {
    const fetchAllFriendData = async () => {
      if (friends && friends.documents) {
        const allFriendData: any = await Promise.all(
          friends.documents.map((friend: any) =>
            fetchUserdataForFriends(friend.friends)
          )
        )
        setFriendData(allFriendData[0])
      }
    }

    fetchAllFriendData().then()
  }, [friends])

  const onRefresh = () => {
    setRefreshing(true)
    fetchFriends().then()
    setRefreshing(false)
  }

  useEffect(() => {
    fetchFriends().then()
  }, [])

  const getUserAvatar = (avatarId: string) => {
    if (!avatarId) return
    return `https://api.headpat.de/v1/storage/buckets/avatars/files/${avatarId}/preview?project=6557c1a8b6c2739b3ecf&width=250&height=250`
  }

  if (friends?.total === 0)
    return (
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerClassName={'flex-1 justify-center items-center h-full'}
      >
        <View className={'p-4 native:pb-24 max-w-md gap-6'}>
          <View className={'gap-1'}>
            <H1 className={'text-foreground text-center'}>No friends!</H1>
            <Muted className={'text-base text-center'}>
              Looks like you don't have any friends yet. Add some friends to see
              them here!
            </Muted>
          </View>
        </View>
      </ScrollView>
    )

  if (!friendData)
    return (
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerClassName={'flex-1 justify-center items-center h-full'}
      >
        <View className={'p-4 native:pb-24 max-w-md gap-6'}>
          <View className={'gap-1'}>
            <H1 className={'text-foreground text-center'}>Loading...</H1>
            <Muted className={'text-base text-center'}>
              Fetching your friends...
            </Muted>
          </View>
        </View>
      </ScrollView>
    )

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
      }}
    >
      {friendData.map((user, index) => {
        return (
          <Link
            href={{
              pathname: '/user/[userId]',
              params: { userId: user.$id },
            }}
            key={index}
            asChild
          >
            <TouchableOpacity
              style={{ width: '30%', margin: '1.66%', padding: 10 }}
            >
              <Image
                source={
                  getUserAvatar(user?.avatarId) ||
                  require('~/assets/pfp-placeholder.png')
                }
                style={{ width: '100%', height: 100, borderRadius: 25 }}
                contentFit={'cover'}
              />
              <Text className={'text-center mt-2'}>{user.displayName}</Text>
            </TouchableOpacity>
          </Link>
        )
      })}
    </ScrollView>
  )
}
