import { functions } from '~/lib/appwrite-client'
import { ExecutionMethod } from 'react-native-appwrite'
import { useUser } from '~/components/contexts/UserContext'
import React, { useCallback, useEffect, useState, useMemo } from 'react'
import { UserData } from '~/lib/types/collections'
import * as Sentry from '@sentry/react-native'
import UserItem from '~/components/user/UserItem'
import { RefreshControl, ScrollView, Text, View } from 'react-native'
import { H1, Muted } from '~/components/ui/typography'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'
import { router } from 'expo-router'
import { Skeleton } from '~/components/ui/skeleton'
import { i18n } from '~/components/system/i18n'
import { FlashList } from '@shopify/flash-list'

const PAGE_SIZE = 100

export default function FollowersPage() {
  const [users, setUsers] = useState<UserData.UserDataDocumentsType[]>([])
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [loadingMore, setLoadingMore] = useState<boolean>(false)
  const [offset, setOffset] = useState<number>(0)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const { showAlert } = useAlertModal()
  const { current } = useUser()

  const fetchUsers = useCallback(
    async (newOffset: number = 0) => {
      if (!current?.$id) {
        showAlert('FAILED', 'You are not logged in.')
        router.back()
        return
      }

      try {
        const data = await functions.createExecution(
          'user-endpoints',
          '',
          false,
          `/user/followers?userId=${current?.$id}&limit=${PAGE_SIZE}&offset=${newOffset}`,
          ExecutionMethod.GET
        )
        const response: UserData.UserDataDocumentsType[] = JSON.parse(
          data.responseBody
        )

        if (newOffset === 0) {
          setUsers(response)
        } else {
          setUsers((prev) => [...prev, ...response])
        }

        setHasMore(response.length === PAGE_SIZE)
      } catch (error) {
        showAlert('FAILED', 'Failed to fetch users. Please try again later.')
        Sentry.captureException(error)
      } finally {
        setRefreshing(false)
        setLoadingMore(false)
      }
    },
    [current?.$id, showAlert]
  )

  useEffect(() => {
    setUsers([])
    setOffset(0)
    setHasMore(true)
    if (current?.$id) {
      setRefreshing(true)
      fetchUsers(0)
    }
  }, [current?.$id, fetchUsers])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    setOffset(0)
    fetchUsers(0)
  }, [fetchUsers])

  const loadMore = useCallback(async () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true)
      const newOffset = offset + PAGE_SIZE
      setOffset(newOffset)
      await fetchUsers(newOffset)
    }
  }, [loadingMore, hasMore, offset, fetchUsers])

  const renderItem = useCallback(
    ({ item }: { item: UserData.UserDataDocumentsType }) => (
      <UserItem user={item} />
    ),
    []
  )

  const keyExtractor = useCallback(
    (item: UserData.UserDataDocumentsType) => item.$id,
    []
  )

  const estimatedItemSize = useMemo(() => 100, []) // Adjust based on your UserItem height

  if (refreshing && users.length === 0) {
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

  if (!refreshing && users.length === 0) {
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
  }

  return (
    <View style={{ flex: 1 }}>
      <FlashList
        data={users}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        estimatedItemSize={estimatedItemSize}
        numColumns={3}
        onRefresh={onRefresh}
        refreshing={refreshing}
        contentContainerStyle={{ padding: 8 }}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore && hasMore ? <Text>{i18n.t('main.loading')}</Text> : null
        }
      />
    </View>
  )
}
