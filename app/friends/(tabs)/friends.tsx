import { RefreshControl, ScrollView, View } from 'react-native'
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

export default function FriendsPage() {
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? 'white' : 'black'
  const [friends, setFriends] = useState<any>(null)
  const [friendData, setFriendData] = useState<UserDataDocumentsType[]>([])
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

  const fetchUserdataForFriends = async (friendIds: string[]) => {
    try {
      const promises = friendIds.map((friendId) =>
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
        const allFriendData = await Promise.all(
          friends.documents.map((friend: any) =>
            fetchUserdataForFriends(friend.friendIds)
          )
        )
        setFriendData(allFriendData)
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

  if (!friends)
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

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerClassName={'flex-row flex-wrap justify-between'}
    >
      {friendData.map((data, index) => (
        <View key={index} className={'w-[30%] m-[1.66%]'}>
          <Text>{data.displayName}</Text>
          <Text>{data.bio}</Text>
        </View>
      ))}
    </ScrollView>
  )
}
