import {
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native'
import { H1, Muted } from '~/components/ui/typography'
import { useColorScheme } from '~/lib/useColorScheme'
import { useEffect, useState } from 'react'
import { UserDataType } from '~/lib/types/collections'
import { database } from '~/lib/appwrite-client'
import { Query } from 'react-native-appwrite'
import { toast } from '~/lib/toast'
import * as Sentry from '@sentry/react-native'
import { Text } from '~/components/ui/text'
import { Image } from 'expo-image'
import { Link } from 'expo-router'

export default function UserListPage() {
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? 'white' : 'black'
  const [users, setUsers] = useState<UserDataType>(null)
  const [refreshing, setRefreshing] = useState<boolean>(false)

  const fetchUsers = async () => {
    try {
      const data: UserDataType = await database.listDocuments(
        'hp_db',
        'userdata',
        [Query.orderDesc('$createdAt')]
      )

      setUsers(data)
    } catch (error) {
      toast('Failed to fetch mutuals. Please try again later.')
      Sentry.captureException(error)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchUsers().then()
    setRefreshing(false)
  }

  useEffect(() => {
    fetchUsers().then()
  }, [])

  const getUserAvatar = (avatarId: string) => {
    if (!avatarId) return
    return `https://api.headpat.de/v1/storage/buckets/avatars/files/${avatarId}/preview?project=6557c1a8b6c2739b3ecf&width=250&height=250`
  }

  if (!users)
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
              Fetching users... Please wait.
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
      {users.documents.map((user, index) => {
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
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 25,
                  alignSelf: 'center',
                }}
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
