import React, { useCallback, useMemo } from 'react'
import { ScrollView, View } from 'react-native'
import { functions } from '~/lib/appwrite-client'
import * as Sentry from '@sentry/react-native'
import { Community } from '~/lib/types/collections'
import { ExecutionMethod } from 'react-native-appwrite'
import CommunityItem from '~/components/community/CommunityItem'
import { Skeleton } from '~/components/ui/skeleton'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'
import { i18n } from '~/components/system/i18n'
import { FlashList } from '@shopify/flash-list'
import { Text } from '~/components/ui/text'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'

const PAGE_SIZE = 20

export default function CommunitiesPage() {
  const { showAlert } = useAlertModal()
  const queryClient = useQueryClient()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['communities'],
    queryFn: async ({ pageParam = 0 }) => {
      try {
        const data = await functions.createExecution(
          'community-endpoints',
          '',
          false,
          `/communities?limit=${PAGE_SIZE}&offset=${pageParam}`,
          ExecutionMethod.GET
        )
        return JSON.parse(
          data.responseBody
        ) as Community.CommunityDocumentsType[]
      } catch (error) {
        showAlert(
          'FAILED',
          'Failed to fetch communities. Please try again later.'
        )
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
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const communities = data?.pages.flat() ?? []

  const renderItem = useCallback(
    ({ item }: { item: Community.CommunityDocumentsType }) => (
      <CommunityItem community={item} />
    ),
    []
  )

  const keyExtractor = useCallback(
    (item: Community.CommunityDocumentsType) => item.$id,
    []
  )

  const estimatedItemSize = useMemo(() => 100, [])

  if (isLoading) {
    return (
      <ScrollView contentInsetAdjustmentBehavior={'automatic'}>
        {Array.from({ length: 8 }).map((_, index) => (
          <View key={index} className="px-4 py-2">
            <View className="flex flex-row items-center">
              <Skeleton className="w-20 h-20 rounded-2xl" />
              <View className="ml-4 flex-1">
                <Skeleton className="w-32 h-5 rounded" />
                <Skeleton className="w-24 h-4 mt-1 rounded" />
                <View className="flex flex-row items-center mt-2">
                  <Skeleton className="w-4 h-4 rounded" />
                  <Skeleton className="w-8 h-4 ml-2 rounded" />
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <FlashList
        data={communities}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        onRefresh={() => {
          queryClient.invalidateQueries({
            queryKey: ['communities'],
          })
        }}
        refreshing={isRefetching}
        estimatedItemSize={estimatedItemSize}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage && hasNextPage ? (
            <Text className="p-4 text-center">{i18n.t('main.loading')}</Text>
          ) : null
        }
        contentInsetAdjustmentBehavior={'automatic'}
      />
    </View>
  )
}
