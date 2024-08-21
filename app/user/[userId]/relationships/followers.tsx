import { toast } from '~/lib/toast'
import { database } from '~/lib/appwrite-client'
import { Query } from 'react-native-appwrite'
import React, { useCallback, useEffect, useState } from 'react'
import { Followers, UserData } from '~/lib/types/collections'
import * as Sentry from '@sentry/react-native'
import UserItem from '~/components/user/UserItem'
import { FlatList, RefreshControl, ScrollView, Text, View } from 'react-native'
import { H1, Muted } from '~/components/ui/typography'
import { useLocalSearchParams } from 'expo-router'

export default function FollowingPage() {
  const [users, setUsers] = useState<UserData.UserDataDocumentsType[]>(null)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [loadingMore, setLoadingMore] = useState<boolean>(false)
  const [offset, setOffset] = useState<number>(0)
  const local = useLocalSearchParams()

  useEffect(() => {
    setUsers([]) // Clear the old users
    setOffset(0) // Reset the offset
  }, [local?.userId])

  const onRefresh = async () => {
    setRefreshing(true)
    setOffset(0)
    await fetchUsers(0)
    setRefreshing(false)
  }

  const fetchUsers = useCallback(
    async (newOffset: number = 0) => {
      let isMounted = true

      try {
        const data: Followers.FollowerType = await database.listDocuments(
          'hp_db',
          'followers',
          [
            Query.equal('followerId', local?.userId),
            Query.orderDesc('$createdAt'),
            Query.limit(20),
            Query.offset(newOffset),
          ]
        )

        if (!isMounted) return // Prevent state updates if unmounted

        const newUsers = await fetchUserDataForUsers(data.documents)

        if (newOffset === 0) {
          setUsers(newUsers)
        } else {
          setUsers((prevUsers) => [...prevUsers, ...newUsers])
        }
      } catch (error) {
        toast('Failed to fetch users. Please try again later.')
        Sentry.captureException(error)
      }

      return () => {
        isMounted = false // Set the flag to false on unmount
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [local?.userId]
  )

  const fetchUserDataForUsers = async (users: any[]) => {
    try {
      const userDataPromises = users.map((user) =>
        fetchUserDataForId(user.userId)
      )
      const usersData = await Promise.all(userDataPromises)
      return usersData.filter((userData) => userData !== undefined)
    } catch (error) {
      toast('Failed to fetch user data. Please try again later.')
      Sentry.captureException(error)
      return []
    }
  }

  const fetchUserDataForId = async (userId: string) => {
    try {
      const result: UserData.UserDataType = await database.listDocuments(
        'hp_db',
        'userdata',
        [Query.equal('$id', userId)]
      )
      return result.documents[0]
    } catch (error) {
      toast('Failed to fetch user data. Please try again later.')
      Sentry.captureException(error)
    }
  }

  const loadMore = async () => {
    if (!loadingMore) {
      setLoadingMore(true)
      const newOffset = offset + 20
      setOffset(newOffset)
      await fetchUsers(newOffset)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    if (!local?.userId) return
    fetchUsers().then()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local?.userId])

  if (!local?.userId)
    return (
      <ScrollView
        contentContainerClassName={'flex-1 justify-center items-center h-full'}
      >
        <View className={'p-4 native:pb-24 max-w-md gap-6'}>
          <View className={'gap-1'}>
            <H1 className={'text-foreground text-center'}>Followers</H1>
            <Muted className={'text-base text-center'}>
              This user does not exist.
            </Muted>
          </View>
        </View>
      </ScrollView>
    )

  if (refreshing)
    return (
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerClassName={'flex-1 justify-center items-center h-full'}
      >
        <View className={'p-4 native:pb-24 max-w-md gap-6'}>
          <View className={'gap-1'}>
            <H1 className={'text-foreground text-center'}>Followers</H1>
            <Muted className={'text-base text-center'}>Loading...</Muted>
          </View>
        </View>
      </ScrollView>
    )

  if (refreshing && users && users.length === 0)
    return (
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className={'flex-1 justify-center items-center'}>
          <View className={'p-4 native:pb-24 max-w-md gap-6'}>
            <View className={'gap-1'}>
              <H1 className={'text-foreground text-center'}>Followers</H1>
              <Muted className={'text-base text-center'}>
                This user does not have any followers.
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
      data={users}
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
