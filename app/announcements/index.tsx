import { RefreshControl, FlatList, View } from 'react-native'
import { H1 } from '~/components/ui/typography'
import React, { useCallback, useState } from 'react'
import { Announcements } from '~/lib/types/collections'
import { database } from '~/lib/appwrite-client'
import { Query } from 'react-native-appwrite'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'
import * as Sentry from '@sentry/react-native'
import SlowInternet from '~/components/views/SlowInternet'
import { ScrollView } from 'react-native-gesture-handler'
import { Text } from '~/components/ui/text'
import AnnouncementItem from '~/components/FlatlistItems/AnnouncementItem'
import { useFocusEffect } from '@react-navigation/core'

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] =
    useState<Announcements.AnnouncementDataType>(null)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const { showAlertModal } = useAlertModal()

  const fetchAnnouncements = async () => {
    try {
      const currentDate = new Date()

      const data: Announcements.AnnouncementDataType =
        await database.listDocuments('hp_db', 'announcements', [
          Query.orderAsc('validUntil'),
          Query.greaterThanEqual('validUntil', currentDate.toISOString()),
        ])

      setAnnouncements(data)
    } catch (error) {
      showAlertModal(
        'FAILED',
        'Failed to fetch events. Please try again later.'
      )
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
    //setRefreshing(true)
    fetchAnnouncements().then()
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
      data={announcements?.documents}
      keyExtractor={(item) => item.$id}
      onRefresh={onRefresh}
      refreshing={refreshing}
      contentContainerStyle={{ padding: 8 }}
      contentInsetAdjustmentBehavior={'automatic'}
      renderItem={({ item }) => <AnnouncementItem announcement={item} />}
    />
  )
}
