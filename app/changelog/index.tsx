import React, { useEffect, useState } from 'react'
import { Changelog } from '~/lib/types/collections'
import { FlatList, View } from 'react-native'
import { Text } from '~/components/ui/text'
import { H1 } from '~/components/ui/typography'
import { database } from '~/lib/appwrite-client'
import * as Sentry from '@sentry/react-native'
import { Query } from 'react-native-appwrite'
import ChangelogItem from '~/components/FlatlistItems/ChangelogItem'

export default function ListComponent() {
  const [openVersions, setOpenVersions] = useState<string[]>([])
  const [changelogData, setChangelogData] =
    useState<Changelog.ChangelogDocumentsType[]>()
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = async () => {
    try {
      const changelogData: Changelog.ChangelogType =
        await database.listDocuments('hp_db', 'changelog', [
          Query.orderDesc('version'),
        ])

      setChangelogData(changelogData.documents)
    } catch (error) {
      Sentry.captureException(error)
    } finally {
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchData().then()
  }

  useEffect(() => {
    setRefreshing(true)
    fetchData().then()
  }, [])

  const toggleVersion = (version: string) => {
    setOpenVersions((prev) =>
      prev.includes(version)
        ? prev.filter((v) => v !== version)
        : [...prev, version]
    )
  }

  if (refreshing && (!changelogData || changelogData.length === 0)) {
    return (
      <View className={'flex flex-1 justify-center items-center h-full'}>
        <View className={'p-4 gap-6 text-center'}>
          <H1 className={'text-2xl font-semibold'}>Loading...</H1>
          <Text className={'text-muted-foreground'}>
            Please wait while we fetch the latest updates.
          </Text>
        </View>
      </View>
    )
  }

  if (!refreshing && (!changelogData || changelogData.length === 0)) {
    return (
      <View className={'flex flex-1 justify-center items-center h-full'}>
        <View className={'p-4 gap-6 text-center'}>
          <H1 className={'text-2xl font-semibold'}>Oh no!</H1>
          <Text className={'text-muted-foreground'}>
            Sorry, there are no updates available at the moment.
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View className="h-full">
      <FlatList
        data={changelogData}
        keyExtractor={(item) => item.$id}
        onRefresh={onRefresh}
        refreshing={refreshing}
        contentContainerStyle={{ padding: 8 }}
        contentInsetAdjustmentBehavior={'automatic'}
        renderItem={({ item }) => (
          <ChangelogItem
            changelog={item}
            openVersions={openVersions}
            toggleVersion={toggleVersion}
          />
        )}
      />
    </View>
  )
}
