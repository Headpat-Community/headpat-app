import { FlatList, RefreshControl, ScrollView, View } from 'react-native'
import React, { useCallback } from 'react'
import { functions } from '~/lib/appwrite-client'
import { Events } from '~/lib/types/collections'
import { Muted } from '~/components/ui/typography'
import { ExecutionMethod } from 'react-native-appwrite'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'
import { useFocusEffect } from '@react-navigation/core'
import EventItem from '~/components/FlatlistItems/EventItem'
import { Text } from '~/components/ui/text'
import { i18n } from '~/components/system/i18n'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'

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
        showAlert('LOADING', 'Fetching events...')
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
    <View className={'gap-4 mt-2 mx-2'}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.$id}
        onRefresh={onRefresh}
        refreshing={isRefetching}
        contentContainerStyle={{ padding: 8 }}
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
