import { toast } from '~/lib/toast'
import { functions } from '~/lib/appwrite-client'
import { ExecutionMethod } from 'react-native-appwrite'
import React, { useCallback, useEffect, useState } from 'react'
import { UserData } from '~/lib/types/collections'
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
  const [hasMore, setHasMore] = useState<boolean>(true)
  const local = useLocalSearchParams()

  useEffect(() => {
    setUsers([]) // Clear the old users
    setOffset(0) // Reset the offset
    setHasMore(true) // Reset hasMore
  }, [local?.userId])

  const onRefresh = async () => {
    setRefreshing(true)
    setOffset(0)
    await fetchUsers(0)
    setRefreshing(false)
  }

  const fetchUsers = useCallback(
    async (newOffset: number = 0) => {
      try {
        const data = await functions.createExecution(
          '65e2126d9e431eb3c473',
          '',
          false,
          `/user/following?userId=${local?.userId}&limit=20&offset=${newOffset}`,
          ExecutionMethod.GET
        )
        const response: UserData.UserDataDocumentsType[] = JSON.parse(
          data.responseBody
        )

        if (newOffset === 0) {
          setUsers(response)
        } else {
          setUsers((prevUsers) => [...prevUsers, ...response])
        }

        // Update hasMore based on the response length
        setHasMore(response.length === 20)
      } catch (error) {
        toast('Failed to fetch users. Please try again later.')
        Sentry.captureException(error)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [local?.userId]
  )

  const loadMore = async () => {
    if (!loadingMore && hasMore) {
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
            <H1 className={'text-foreground text-center'}>Following</H1>
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
            <H1 className={'text-foreground text-center'}>Following</H1>
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
              <H1 className={'text-foreground text-center'}>Following</H1>
              <Muted className={'text-base text-center'}>
                This user does not follow anyone.
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
      ListFooterComponent={
        loadingMore && hasMore ? <Text>Loading...</Text> : null
      }
    />
  )
}
