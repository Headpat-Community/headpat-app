import { RefreshControl, View } from 'react-native'
import { H1 } from '~/components/ui/typography'
import React, { useCallback, useState, useMemo } from 'react'
import { Announcements } from '~/lib/types/collections'
import { databases } from '~/lib/appwrite-client'
import { Query } from 'react-native-appwrite'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'
import * as Sentry from '@sentry/react-native'
import SlowInternet from '~/components/views/SlowInternet'
import { ScrollView } from 'react-native-gesture-handler'
import { Text } from '~/components/ui/text'
import AnnouncementItem from '~/components/FlatlistItems/AnnouncementItem'
import { useFocusEffect } from '@react-navigation/core'
import { i18n } from '~/components/system/i18n'
import { FlashList } from '@shopify/flash-list'

const PAGE_SIZE = 50

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] =
    useState<Announcements.AnnouncementDataType | null>(null)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [loadingMore, setLoadingMore] = useState<boolean>(false)
  const [offset, setOffset] = useState<number>(0)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const { showAlert } = useAlertModal()

  const fetchAnnouncements = useCallback(
    async (newOffset: number = 0) => {
      try {
        const currentDate = new Date()
        const queries = [
          Query.orderAsc('validUntil'),
          Query.greaterThanEqual('validUntil', currentDate.toISOString()),
          Query.limit(PAGE_SIZE),
          Query.offset(newOffset),
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

        setAnnouncements((prev) => {
          if (newOffset === 0) {
            return {
              total: data.total,
              documents: data.documents,
            }
          }
          return {
            total: data.total,
            documents: [...(prev?.documents || []), ...data.documents],
          }
        })

        setHasMore(data.documents.length === PAGE_SIZE)
      } catch (error) {
        console.error('Error fetching announcements:', error)
        showAlert(
          'FAILED',
          'Failed to fetch announcements. Please try again later.'
        )
        Sentry.captureException(error)
      } finally {
        setRefreshing(false)
        setLoadingMore(false)
      }
    },
    [showAlert]
  )

  useFocusEffect(
    useCallback(() => {
      onRefresh()
    }, [])
  )

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    setOffset(0)
    fetchAnnouncements(0)
  }, [fetchAnnouncements])

  const loadMore = useCallback(async () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true)
      const newOffset = offset + PAGE_SIZE
      setOffset(newOffset)
      await fetchAnnouncements(newOffset)
    }
  }, [loadingMore, hasMore, offset, fetchAnnouncements])

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

  if (refreshing && !announcements) {
    return <SlowInternet />
  }

  if ((!refreshing && announcements?.total === 0) || !announcements) {
    return (
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
        data={!refreshing ? announcements?.documents : []}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        estimatedItemSize={estimatedItemSize}
        onRefresh={onRefresh}
        refreshing={refreshing}
        contentContainerStyle={{ padding: 8 }}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        contentInsetAdjustmentBehavior={'automatic'}
        ListFooterComponent={
          loadingMore ? <Text>{i18n.t('main.loading')}</Text> : null
        }
      />
    </View>
  )
}
