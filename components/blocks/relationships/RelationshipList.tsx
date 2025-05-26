import { functions } from '~/lib/appwrite-client'
import { ExecutionMethod } from 'react-native-appwrite'
import { useUser } from '~/components/contexts/UserContext'
import React, { useCallback, useMemo } from 'react'
import { UserData } from '~/lib/types/collections'
import * as Sentry from '@sentry/react-native'
import UserItem from '~/components/user/UserItem'
import { ScrollView, Text, View, RefreshControl } from 'react-native'
import { H1, Muted } from '~/components/ui/typography'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'
import { router } from 'expo-router'
import { Skeleton } from '~/components/ui/skeleton'
import { i18n } from '~/components/system/i18n'
import { FlashList } from '@shopify/flash-list'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'

const PAGE_SIZE = 100

type RelationshipType = 'mutuals' | 'following' | 'followers'

interface RelationshipListProps {
  type: RelationshipType
  title: string
  emptyMessage: string
}

export default function RelationshipList({
  type,
  title,
  emptyMessage
}: RelationshipListProps) {
  const { showAlert } = useAlertModal()
  const { current } = useUser()
  const queryClient = useQueryClient()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
    isLoading,
    refetch
  } = useInfiniteQuery({
    queryKey: [type, current?.$id],
    queryFn: async ({ pageParam = 0 }) => {
      if (!current?.$id) {
        showAlert('FAILED', 'You are not logged in.')
        router.back()
        return []
      }

      try {
        const endpoint =
          type === 'mutuals'
            ? `/user/mutuals?limit=${PAGE_SIZE}&offset=${pageParam}`
            : `/user/${type}?userId=${current?.$id}&limit=${PAGE_SIZE}&offset=${pageParam}`

        const data = await functions.createExecution(
          'user-endpoints',
          '',
          false,
          endpoint,
          ExecutionMethod.GET
        )
        return JSON.parse(data.responseBody) as UserData.UserDataDocumentsType[]
      } catch (error) {
        showAlert('FAILED', 'Failed to fetch users. Please try again later.')
        Sentry.captureException(error)
        return []
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === PAGE_SIZE
        ? allPages.length * PAGE_SIZE
        : undefined
    },
    initialPageParam: 0,
    enabled: !!current?.$id,
    staleTime: 1000 * 60 * 5 // 5 minutes
  })

  const users = data?.pages.flat() ?? []

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

  const estimatedItemSize = useMemo(() => 100, [])

  if (isLoading) {
    return (
      <View style={{ flex: 1 }}>
        {Array.from({ length: 30 }).map((_, index) => (
          <View
            key={index}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              margin: 10
            }}
          >
            {[...Array(3)].map((_, i) => (
              <View
                key={i}
                style={{
                  width: 100,
                  height: 100
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

  if (!isLoading && users.length === 0) {
    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              queryClient.invalidateQueries({
                queryKey: [type, current?.$id]
              })
            }}
          />
        }
      >
        <View className={'flex-1 justify-center items-center'}>
          <View className={'p-4 native:pb-24 max-w-md gap-6'}>
            <View className={'gap-1'}>
              <H1 className={'text-foreground text-center'}>{title}</H1>
              <Muted className={'text-base text-center'}>{emptyMessage}</Muted>
            </View>
          </View>
        </View>
      </ScrollView>
    )
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={() => {
            queryClient.invalidateQueries({
              queryKey: [type, current?.$id]
            })
          }}
        />
      }
    >
      <View style={{ flex: 1, minHeight: '100%' }}>
        <FlashList
          data={users}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          estimatedItemSize={estimatedItemSize}
          numColumns={3}
          contentContainerStyle={{ padding: 8 }}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage()
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage && hasNextPage ? (
              <Text>{i18n.t('main.loading')}</Text>
            ) : null
          }
        />
      </View>
    </ScrollView>
  )
}
