import React, { useCallback } from 'react'
import { Text, View, ScrollView } from 'react-native'
import { FlashList } from '@shopify/flash-list'
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
import { i18n } from '~/components/system/i18n'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'

export default function NotificationsPage() {
  const { showAlert } = useAlertModal()
  const { current } = useUser()
  const queryClient = useQueryClient()

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isRefetching } =
    useInfiniteQuery<Notifications.NotificationsDocumentsType[]>({
      queryKey: ['notifications', current?.$id],
      queryFn: async ({ pageParam = 0 }) => {
        try {
          const data = await functions.createExecution(
            'user-endpoints',
            '',
            false,
            `/user/notifications?offset=${pageParam}&limit=20`,
            ExecutionMethod.GET
          )
          const response: Notifications.NotificationsDocumentsType[] =
            JSON.parse(data.responseBody)

          return response
        } catch (error) {
          console.error(error)
          showAlert(
            'FAILED',
            'Failed to fetch notifications. Please try again later.'
          )
          Sentry.captureException(error)
          return []
        }
      },
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.length === 20 ? allPages.length * 20 : undefined
      },
      initialPageParam: 0,
      staleTime: 1000 * 60 * 5, // 5 minutes
      enabled: !!current?.$id
    })

  const onRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['notifications', current?.$id] })
  }, [queryClient, current?.$id])

  useFocusEffect(
    React.useCallback(() => {
      if (!current) {
        router.push('/login')
      }
    }, [current])
  )

  const renderItem = useCallback(
    ({ item }: { item: Notifications.NotificationsDocumentsType }) => (
      <NotificationItem notification={item} />
    ),
    []
  )

  const notifications = data?.pages.flat() ?? []

  if (!notifications.length && !isRefetching)
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
    <FlashList
      data={notifications}
      keyExtractor={(item) => item.$id}
      renderItem={renderItem}
      onRefresh={onRefresh}
      refreshing={isRefetching}
      numColumns={1}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      }}
      onEndReachedThreshold={0.5}
      estimatedItemSize={100}
      contentContainerClassName="mt-2 pb-8"
      ListFooterComponent={
        isFetchingNextPage && hasNextPage ? (
          <Text>{i18n.t('main.loading')}</Text>
        ) : null
      }
    />
  )
}
