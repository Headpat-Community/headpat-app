import React, { useCallback, useEffect, useState } from 'react'
import { FlatList, Text, View, ScrollView } from 'react-native'
import { functions } from '~/lib/appwrite-client'
import * as Sentry from '@sentry/react-native'
import { Notifications } from '~/lib/types/collections'
import { Skeleton } from '~/components/ui/skeleton'
import NotificationItem from '~/components/FlatlistItems/NotificationItem'
import { ExecutionMethod } from 'react-native-appwrite'
import { useUser } from '~/components/contexts/UserContext'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'
import { useFocusEffect } from '@react-navigation/core'
import { router } from 'expo-router'
import { useDataCache } from '~/components/contexts/DataCacheContext'
import { i18n } from '~/components/system/i18n'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<
    Notifications.NotificationsDocumentsType[]
  >([])
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [loadingMore, setLoadingMore] = useState<boolean>(false)
  const [offset, setOffset] = useState<number>(0)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const { showAlert } = useAlertModal()
  const { current } = useUser()
  const { getAllCache, saveAllCache } = useDataCache()

  const fetchNotifications = useCallback(
    async (newOffset: number = 0) => {
      const cachedNotifications =
        await getAllCache<Notifications.NotificationsDocumentsType>(
          'notifications'
        )
      if (cachedNotifications && typeof cachedNotifications === 'object') {
        const notificationsArray = Object.values(cachedNotifications).map(
          (item) => item.data
        )
        setNotifications(notificationsArray)
        setRefreshing(false)
      }
      try {
        const data = await functions.createExecution(
          'user-endpoints',
          '',
          false,
          `/user/notifications`,
          ExecutionMethod.GET
        )
        const response: Notifications.NotificationsDocumentsType[] = JSON.parse(
          data.responseBody
        )

        if (newOffset === 0) {
          setNotifications(response)
          saveAllCache('notifications', response)
        } else {
          saveAllCache('notifications', [...notifications, ...response])
          setNotifications((prev) => [...prev, ...response])
        }

        setHasMore(response.length === 20)
      } catch (error) {
        console.log(error)
        showAlert(
          'FAILED',
          'Failed to fetch notifications. Please try again later.'
        )
        Sentry.captureException(error)
      } finally {
        setRefreshing(false)
        setLoadingMore(false)
      }
    },
    [current?.$id, getAllCache, saveAllCache]
  )

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true)
    setOffset(0)
    await fetchNotifications(0)
  }

  // Handle loading more communities
  const loadMore = async () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true)
      const newOffset = offset + 20
      setOffset(newOffset)
      await fetchNotifications(newOffset)
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      if (!current) {
        router.push('/login')
      }
    }, [current])
  )

  // Initial fetch when component mounts
  useEffect(() => {
    setRefreshing(true)
    fetchNotifications(0).then()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.$id])

  const renderItem = ({
    item,
  }: {
    item: Notifications.NotificationsDocumentsType
  }) => <NotificationItem notification={item} />

  if (refreshing || !notifications.length)
    return (
      <ScrollView>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {Array.from({ length: 8 }).map((_, index) => (
            <View
              className={'px-4 m-4 w-full flex flex-row items-center'}
              key={index}
            >
              <Skeleton className="w-[100px] h-[100px] rounded-3xl" />
              <View className={'flex flex-col gap-3 ml-6'}>
                <Skeleton className="w-[150px] h-[20px] rounded" />
                <Skeleton className="w-[100px] h-[20px] rounded" />
                <View className={'flex flex-row items-center gap-4'}>
                  <View className={'flex flex-row items-center gap-2'}>
                    <Skeleton className="w-[20px] h-[20px] rounded-full" />
                    <Skeleton className="w-[50px] h-[20px] rounded" />
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    )

  return (
    <FlatList
      data={notifications}
      keyExtractor={(item) => item.$id}
      renderItem={renderItem}
      onRefresh={onRefresh}
      refreshing={refreshing}
      numColumns={1}
      contentContainerStyle={{ justifyContent: 'space-between' }}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        loadingMore && hasMore ? <Text>{i18n.t('main.loading')}</Text> : null
      }
    />
  )
}
