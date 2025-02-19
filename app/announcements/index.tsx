import { RefreshControl, FlatList, View } from 'react-native'
import { H1 } from '~/components/ui/typography'
import React, { useCallback, useState } from 'react'
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

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] =
    useState<Announcements.AnnouncementDataType>(null)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [loadingMore, setLoadingMore] = useState<boolean>(false)
  const [offset, setOffset] = useState<number>(0)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const { showAlert } = useAlertModal()

  const fetchAnnouncements = async (newOffset: number = 0) => {
    try {
      const currentDate = new Date()

      const data: Announcements.AnnouncementDataType =
        await databases.listDocuments('hp_db', 'announcements', [
          Query.orderAsc('validUntil'),
          Query.greaterThanEqual('validUntil', currentDate.toISOString()),
          Query.limit(20),
          Query.offset(newOffset),
        ])

      const newAnnouncements = data.documents

      if (newOffset === 0) {
        setAnnouncements(data)
      } else {
        setAnnouncements((prev) => ({
          ...prev,
          documents: [...prev.documents, ...newAnnouncements],
        }))
      }

      // Check if there are more announcements to load
      setHasMore(newAnnouncements.length === 20)
    } catch (error) {
      showAlert('FAILED', 'Failed to fetch events. Please try again later.')
      Sentry.captureException(error)
    } finally {
      setRefreshing(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      onRefresh()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  )

  const onRefresh = () => {
    setRefreshing(true)
    setOffset(0)
    fetchAnnouncements(0).then()
  }

  const loadMore = async () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true)
      const newOffset = offset + 20
      setOffset(newOffset)
      await fetchAnnouncements(newOffset)
      setLoadingMore(false)
    }
  }

  if (refreshing && !announcements) {
    return <SlowInternet />
  }

  if ((!refreshing && announcements?.total === 0) || !announcements)
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

  return (
    <FlatList
      data={!refreshing && announcements?.documents}
      keyExtractor={(item) => item.$id}
      onRefresh={onRefresh}
      refreshing={refreshing}
      contentContainerStyle={{ padding: 8 }}
      contentInsetAdjustmentBehavior={'automatic'}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        loadingMore ? <Text>{i18n.t('main.loading')}</Text> : null
      }
      renderItem={({ item }) => <AnnouncementItem announcement={item} />}
    />
  )
}
