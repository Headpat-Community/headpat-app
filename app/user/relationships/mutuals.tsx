import { toast } from '~/lib/toast'
import { database } from '~/lib/appwrite-client'
import { Query } from 'react-native-appwrite'
import { useUser } from '~/components/contexts/UserContext'
import React, { useCallback, useEffect, useState } from 'react'
import { UserData, Followers } from '~/lib/types/collections'
import * as Sentry from '@sentry/react-native'
import UserItem from '~/components/user/UserItem'
import { FlatList, RefreshControl, ScrollView, Text, View } from 'react-native'
import { H1, Muted } from '~/components/ui/typography'

export default function FollowersPage() {
  const [mutuals, setMutuals] = useState<Followers.FollowerType | null>(null)
  const [mutualData, setMutualData] = useState<
    UserData.UserDataDocumentsType[] | null
  >(null)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [loadingMore, setLoadingMore] = useState<boolean>(false)
  const [offset, setOffset] = useState<number>(0)
  const { current } = useUser()

  const onRefresh = async () => {
    setRefreshing(true)
    setOffset(0)
    await fetchUsers(0)
    setRefreshing(false)
  }

  const fetchUsers = useCallback(
    async (newOffset: number = 0) => {
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

        //setMutuals({ ...data, documents: uniqueMutualsList })
        if (newOffset === 0) {
          setMutuals({ ...data, documents: uniqueMutualsList })
        } else {
          setMutuals({
            ...data,
            documents: [...(mutuals?.documents || []), ...uniqueMutualsList],
          })
        }
      } catch (error) {
        toast('Failed to fetch users. Please try again later.')
        Sentry.captureException(error)
      }
    },
    [current]
  )

  const loadMore = async () => {
    if (!loadingMore) {
      setLoadingMore(true)
      const newOffset = offset + 20
      setOffset(newOffset)
      await fetchUsers(newOffset)
      setLoadingMore(false)
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

  useEffect(() => {
    if (!current?.$id) return
    fetchUsers().then()
  }, [current, fetchUsers])

  if (!current?.$id)
    return (
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className={'flex-1 justify-center items-center'}>
          <View className={'p-4 native:pb-24 max-w-md gap-6'}>
            <View className={'gap-1'}>
              <H1 className={'text-foreground text-center'}>Mutuals</H1>
              <Muted className={'text-base text-center'}>
                You need to be logged in to see your mutuals.
              </Muted>
            </View>
          </View>
        </View>
      </ScrollView>
    )

  const renderItem = ({ item }: { item: UserData.UserDataDocumentsType }) => (
    <UserItem user={item} />
  )

  return (
    <FlatList
      data={mutualData}
      keyExtractor={(item) => item.$id}
      renderItem={renderItem}
      onRefresh={onRefresh}
      refreshing={refreshing}
      numColumns={3}
      contentContainerStyle={{ justifyContent: 'space-between' }}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={loadingMore ? <Text>Loading...</Text> : null}
    />
  )
}
