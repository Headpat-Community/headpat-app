import { functions } from '~/lib/appwrite-client'
import { ExecutionMethod } from 'react-native-appwrite'
import React from 'react'
import { UserData } from '~/lib/types/collections'
import * as Sentry from '@sentry/react-native'
import UserItem from '~/components/user/UserItem'
import { FlatList, RefreshControl, ScrollView, Text, View } from 'react-native'
import { H1, Muted } from '~/components/ui/typography'
import { router, useLocalSearchParams } from 'expo-router'
import { Skeleton } from '~/components/ui/skeleton'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'
import { i18n } from '~/components/system/i18n'
import { useInfiniteQuery } from '@tanstack/react-query'

const PAGE_SIZE = 20

export default function FollowingPage() {
  const local = useLocalSearchParams()
  const { showAlert, hideAlert } = useAlertModal()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
    refetch,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['followers', local?.userId],
    queryFn: async ({ pageParam = 0 }) => {
      if (!local?.userId) {
        throw new Error('User ID is required')
      }

      showAlert('LOADING', 'Fetching users...')
      try {
        const data = await functions.createExecution(
          'user-endpoints',
          '',
          false,
          `/user/followers?userId=${local.userId}&limit=${PAGE_SIZE}&offset=${pageParam * PAGE_SIZE}`,
          ExecutionMethod.GET
        )
        const response: UserData.UserDataDocumentsType[] = JSON.parse(
          data.responseBody
        )
        hideAlert()
        return response
      } catch (error) {
        hideAlert()
        Sentry.captureException(error)
        showAlert('FAILED', 'Failed to fetch users. Please try again later.')
        throw error
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === PAGE_SIZE ? allPages.length : undefined
    },
    initialPageParam: 0,
    enabled: !!local?.userId,
  })

  const users = data?.pages.flat() ?? []

  const onRefresh = () => {
    refetch()
  }

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }

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

  if (isLoading) {
    return (
      <View style={{ flex: 1 }}>
        {Array.from({ length: 16 }).map((_, index) => (
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

  if (users.length === 0)
    return (
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
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
      refreshing={isRefetching}
      numColumns={3}
      contentContainerStyle={{ justifyContent: 'space-between' }}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isFetchingNextPage && hasNextPage ? (
          <Text>{i18n.t('main.loading')}</Text>
        ) : null
      }
    />
  )
}
