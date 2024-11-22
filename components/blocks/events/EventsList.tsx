import { FlatList, RefreshControl, ScrollView, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { functions } from '~/lib/appwrite-client'
import { Events } from '~/lib/types/collections'
import { Muted } from '~/components/ui/typography'
import { ExecutionMethod } from 'react-native-appwrite'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'
import { useFocusEffect } from '@react-navigation/core'
import EventItem from '~/components/FlatlistItems/EventItem'
import { Text } from '~/components/ui/text'

interface EventsListProps {
  endpoint: string
}

const EventsList: React.FC<EventsListProps> = ({ endpoint }) => {
  const [events, setEvents] = useState<Events.EventsDocumentsType[]>([])
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [loadingMore, setLoadingMore] = useState<boolean>(false)
  const [offset, setOffset] = useState<number>(0)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const { showAlertModal, showLoadingModal, hideLoadingModal } = useAlertModal()

  const fetchEvents = async (newOffset: number = 0) => {
    try {
      const data = await functions.createExecution(
        'event-endpoints',
        '',
        false,
        `${endpoint}?offset=${newOffset}&limit=20`,
        ExecutionMethod.GET
      )
      const response: Events.EventsDocumentsType[] = JSON.parse(
        data.responseBody
      )

      if (newOffset === 0) {
        setEvents(response)
      } else {
        setEvents((prevEvents) => [...prevEvents, ...response])
      }

      setHasMore(response.length === 20)
      hideLoadingModal()
    } catch {
      showAlertModal(
        'FAILED',
        'Failed to fetch events. Please try again later.'
      )
    } finally {
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    setOffset(0)
    fetchEvents(0).then()
  }

  const loadMore = async () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true)
      const newOffset = offset + 20
      setOffset(newOffset)
      await fetchEvents(newOffset)
      setLoadingMore(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      onRefresh()
    }, [])
  )

  useEffect(() => {
    showLoadingModal()
  }, [])

  if (events?.length === 0 || !events)
    return (
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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

  return (
    <View className={'gap-4 mt-2 mx-2'}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.$id}
        onRefresh={onRefresh}
        refreshing={refreshing}
        contentContainerStyle={{ padding: 8 }}
        contentInsetAdjustmentBehavior={'automatic'}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loadingMore ? <Text>Loading...</Text> : null}
        renderItem={({ item }) => <EventItem event={item} />}
      />
    </View>
  )
}

export default EventsList
