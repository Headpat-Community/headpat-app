import { RefreshControl, View } from 'react-native'
import { H1 } from '~/components/ui/typography'
import React, { useCallback, useMemo } from 'react'
import { Announcements } from '~/lib/types/collections'
import { databases } from '~/lib/appwrite-client'
import { Query } from 'react-native-appwrite'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'
import { captureException } from '@sentry/react-native'
import SlowInternet from '~/components/views/SlowInternet'
import { ScrollView } from 'react-native-gesture-handler'
import { Text } from '~/components/ui/text'
import AnnouncementItem from '~/components/FlatlistItems/AnnouncementItem'
import { useFocusEffect } from '@react-navigation/core'
import { i18n } from '~/components/system/i18n'
import { FlashList } from '@shopify/flash-list'
import {
  useInfiniteQuery,
  useQueryClient,
  InfiniteData
} from '@tanstack/react-query'

const PAGE_SIZE = 50

type AnnouncementPage = {
  total: number
  documents: Announcements.AnnouncementDocumentsType[]
}

export default function AnnouncementsPage() {
  const { showAlert } = useAlertModal()
  const queryClient = useQueryClient()

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isRefetching } =
    useInfiniteQuery<
      AnnouncementPage,
      Error,
      InfiniteData<AnnouncementPage>,
      string[],
      number
    >({
      queryKey: ['announcements'],
      queryFn: async ({ pageParam = 0 }) => {
        try {
          const currentDate = new Date()
          const queries = [
            Query.orderAsc('validUntil'),
            Query.greaterThanEqual('validUntil', currentDate.toISOString()),
            Query.limit(PAGE_SIZE),
            Query.offset(pageParam)
          ]

          const data =
            await databases.listDocuments<Announcements.AnnouncementDocumentsType>(
              'hp_db',
              'announcements',
              queries
            )

          if (!data || !data.documents) {
            throw new Error('Invalid response from server')
          }

          return {
            total: data.total,
            documents: data.documents
          }
        } catch (error) {
          console.error('Error fetching announcements:', error)
          showAlert(
            'FAILED',
            'Failed to fetch announcements. Please try again later.'
          )
          captureException(error)
          return {
            total: 0,
            documents: []
          }
        }
      },
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.documents.length === PAGE_SIZE
          ? allPages.length * PAGE_SIZE
          : undefined
      },
      initialPageParam: 0,
      staleTime: 1000 * 60 * 5 // 5 minutes
    })

  const onRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['announcements'] })
  }, [queryClient])

  useFocusEffect(
    useCallback(() => {
      onRefresh()
    }, [onRefresh])
  )

  const renderItem = useCallback(
    ({ item }: { item: Announcements.AnnouncementDocumentsType }) => (
      <AnnouncementItem announcement={item} />
    ),
    []
  )

  const keyExtractor = useCallback(
    (item: Announcements.AnnouncementDocumentsType) => item.$id,
    []
  )

  const estimatedItemSize = useMemo(() => 200, []) // Adjust based on your average item height

  const announcements = data?.pages[0]
  const allDocuments = data?.pages.flatMap((page) => page.documents) ?? []

  if (isRefetching && !announcements) {
    return <SlowInternet />
  }

  if ((!isRefetching && announcements?.total === 0) || !announcements) {
    return (
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
        }
        contentInsetAdjustmentBehavior={'automatic'}
      >
        <View className={'flex flex-1 justify-center items-center h-full'}>
          <View className={'p-4 gap-6 text-center'}>
            <H1 className={'text-2xl font-semibold'}>Empty here..</H1>
            <Text className={'text-muted-foreground'}>
              Sorry, there are no announcements available at the moment.
            </Text>
          </View>
        </View>
      </ScrollView>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <FlashList
        data={!isRefetching ? allDocuments : []}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        estimatedItemSize={estimatedItemSize}
        onRefresh={onRefresh}
        refreshing={isRefetching}
        contentContainerStyle={{ padding: 8 }}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
          }
        }}
        onEndReachedThreshold={0.5}
        contentInsetAdjustmentBehavior={'automatic'}
        ListFooterComponent={
          isFetchingNextPage ? <Text>{i18n.t('main.loading')}</Text> : null
        }
      />
    </View>
  )
}
