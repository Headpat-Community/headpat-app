import { useFocusEffect } from '@react-navigation/core'
import { captureException } from '@sentry/react-native'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import React, { useCallback } from 'react'
import { FlatList, RefreshControl, ScrollView, View } from 'react-native'
import { ExecutionMethod } from 'react-native-appwrite'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'
import EventItem from '~/components/FlatlistItems/EventItem'
import { i18n } from '~/components/system/i18n'
import { Text } from '~/components/ui/text'
import { Muted } from '~/components/ui/typography'
import { functions } from '~/lib/appwrite-client'
import { Events } from '~/lib/types/collections'

interface EventsListProps {
  endpoint: string
}

const EventsList: React.FC<EventsListProps> = ({ endpoint }) => {
  const { showAlert, hideAlert } = useAlertModal()
  const queryClient = useQueryClient()

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isRefetching } =
    useInfiniteQuery<Events.EventsDocumentsType[]>({
      queryKey: ['events', endpoint],
      queryFn: async ({ pageParam = 0 }) => {
        try {
          const data = await functions.createExecution(
            'event-endpoints',
            '',
            false,
            `${endpoint}?offset=${pageParam}&limit=20`,
            ExecutionMethod.GET
          )
          const response: Events.EventsDocumentsType[] = JSON.parse(
            data.responseBody
          )
          return response
        } catch (error) {
          showAlert('FAILED', 'Failed to fetch events. Please try again later.')
          captureException(error)
          return []
        } finally {
          hideAlert()
        }
      },
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.length === 20 ? allPages.length * 20 : undefined
      },
      initialPageParam: 0,
      staleTime: 1000 * 60 * 5 // 5 minutes
    })

  const onRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['events', endpoint] })
  }, [queryClient, endpoint])

  useFocusEffect(
    useCallback(() => {
      onRefresh()
    }, [onRefresh])
  )

  const events = data?.pages.flat() ?? []

  if (events.length === 0) {
    return (
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
        }
      >
        <View className={'flex-1 justify-center items-center'}>
          <View className={'p-4 native:pb-24 max-w-md gap-6'}>
            <View className={'gap-1'}>
              <Muted className={'text-base text-center'}>
                No events available
              </Muted>
            </View>
          </View>
        </View>
      </ScrollView>
    )
  }

  return (
    <View className={'flex-1'}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.$id}
        onRefresh={onRefresh}
        refreshing={isRefetching}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          flexGrow: 1
        }}
        contentInsetAdjustmentBehavior={'automatic'}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? <Text>{i18n.t('main.loading')}</Text> : null
        }
        renderItem={({ item }) => <EventItem event={item} />}
      />
    </View>
  )
}

export default EventsList
