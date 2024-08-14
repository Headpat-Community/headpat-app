import {
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native'
import { H1, Muted } from '~/components/ui/typography'
import { useEffect, useState } from 'react'
import { Followers, UserData } from '~/lib/types/collections'
import { database } from '~/lib/appwrite-client'
import { Query } from 'react-native-appwrite'
import { toast } from '~/lib/toast'
import * as Sentry from '@sentry/react-native'
import { Text } from '~/components/ui/text'
import { Image } from 'expo-image'
import { Link } from 'expo-router'
import { useUser } from '~/components/contexts/UserContext'

export default function MutualsPage() {
  const { current } = useUser()
  const [mutuals, setMutuals] = useState<Followers.FollowerType>(null)
  const [mutualData, setMutualData] =
    useState<UserData.UserDataDocumentsType>(null)
  const [refreshing, setRefreshing] = useState<boolean>(false)

  const fetchMutuals = async () => {
    try {
      const data: Followers.FollowerType = await database.listDocuments(
        'hp_db',
        'followers'
      )

      // Filtering to find mutuals
      const mutualsList = data.documents.filter((follower) => {
        const followsYou = data.documents.some(
          (otherFollower) =>
            otherFollower.userId === follower.followerId && // They follow you
            otherFollower.followerId === current.$id // Current user is followed by them
        )
        const youFollow = data.documents.some(
          (otherFollower) =>
            otherFollower.userId === current.$id && // Current user follows
            otherFollower.followerId === follower.userId // Follower is followed by you
        )

        return followsYou && youFollow
      })

      // Remove duplicates based on `userId`
      const uniqueMutualsList = mutualsList.filter(
        (mutual, index, self) =>
          index === self.findIndex((m) => m.followerId === mutual.followerId)
      )

      setMutuals({ ...data, documents: uniqueMutualsList })
    } catch (error) {
      toast('Failed to fetch mutuals. Please try again later.')
      Sentry.captureException(error)
    }
  }

  const fetchUserdataForId = async (userId: string) => {
    try {
      const result = await database.listDocuments('hp_db', 'userdata', [
        Query.equal('$id', userId),
      ])
      return result.documents[0]
    } catch (error) {
      toast('Failed to fetch userdata for mutuals. Please try again later.')
      Sentry.captureException(error)
    }
  }

  useEffect(() => {
    const fetchAllMutualData = async () => {
      if (mutuals && mutuals.documents) {
        const allMutualData: any = await Promise.all(
          mutuals.documents.map((mutual: any) =>
            fetchUserdataForId(mutual.followerId)
          )
        )
        setMutualData(allMutualData)
      }
    }

    fetchAllMutualData().then()
  }, [mutuals])

  const onRefresh = () => {
    setRefreshing(true)
    fetchMutuals().then(() => setRefreshing(false))
  }

  useEffect(() => {
    fetchMutuals().then()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getUserAvatar = (avatarId: string) => {
    if (!avatarId) return
    return `https://api.headpat.de/v1/storage/buckets/avatars/files/${avatarId}/preview?project=hp-main&width=250&height=250`
  }

  if (mutuals?.documents?.length === 0)
    return (
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerClassName={'flex-1 justify-center items-center h-full'}
      >
        <View className={'p-4 native:pb-24 max-w-md gap-6'}>
          <View className={'gap-1'}>
            <H1 className={'text-foreground text-center'}>No mutuals!</H1>
            <Muted className={'text-base text-center'}>
              Looks like you don't have any mutuals yet.
            </Muted>
          </View>
        </View>
      </ScrollView>
    )

  if (!mutualData || mutualData.length === 0)
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
              Fetching your mutuals...
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
      {mutualData.map((user: UserData.UserDataDocumentsType, index: number) => {
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
