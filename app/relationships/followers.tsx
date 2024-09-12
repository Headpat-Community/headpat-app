import { toast } from '~/lib/toast'
import { functions } from '~/lib/appwrite-client'
import { ExecutionMethod } from 'react-native-appwrite'
import React, { useEffect, useState } from 'react'
import { UserData } from '~/lib/types/collections'
import * as Sentry from '@sentry/react-native'
import UserItem from '~/components/user/UserItem'
import { FlatList, RefreshControl, ScrollView, Text, View } from 'react-native'
import { H1, Muted } from '~/components/ui/typography'
import { useUser } from '~/components/contexts/UserContext'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'
import { router } from 'expo-router'
import { Skeleton } from '~/components/ui/skeleton'

export default function FollowersPage() {
  const [users, setUsers] = useState<UserData.UserDataDocumentsType[]>(null)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [loadingMore, setLoadingMore] = useState<boolean>(false)
  const [offset, setOffset] = useState<number>(0)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const { showAlertModal } = useAlertModal()
  const { current } = useUser()

  useEffect(() => {
    setUsers([]) // Clear the old users
    setOffset(0) // Reset the offset
    setHasMore(true) // Reset hasMore
  }, [current?.$id])

  const onRefresh = async () => {
    setRefreshing(true)
    setOffset(0)
    await fetchUsers(0)
    setRefreshing(false)
  }

  const fetchUsers = async (newOffset: number = 0) => {
    try {
      const data = await functions.createExecution(
        'user-endpoints',
        '',
        false,
        `/user/followers?userId=${current?.$id}&limit=20&offset=${newOffset}`,
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
  }

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
    setRefreshing(true)
    if (!current.$id) {
      showAlertModal('FAILED', 'You are not logged in.')
      router.back()
      return
    }
    fetchUsers(0).then(() => setRefreshing(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current])

  if (refreshing) {
    return (
      <View style={{ flex: 1 }}>
        {Array.from({ length: 30 }).map((_, index) => (
          <View
            key={index}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              margin: 10,
            }}
          >
            {[...Array(3)].map((_, i) => (
              <View
                key={i}
                style={{
                  width: 100,
                  height: 100,
                }}
              >
                <Skeleton className={'w-full h-full rounded-3xl'} />
              </View>
            ))}
          </View>
        ))}
      </View>
    )
  }

  if (!refreshing && users && users.length === 0)
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
                You have no followers yet.
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
