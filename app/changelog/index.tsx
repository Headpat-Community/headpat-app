import React, { useState } from 'react'
import { Changelog } from '~/lib/types/collections'
import { FlatList, View } from 'react-native'
import { Text } from '~/components/ui/text'
import { H1 } from '~/components/ui/typography'
import { databases } from '~/lib/appwrite-client'
import * as Sentry from '@sentry/react-native'
import { Query } from 'react-native-appwrite'
import ChangelogItem from '~/components/FlatlistItems/ChangelogItem'
import { i18n } from '~/components/system/i18n'
import { useQuery, useQueryClient } from '@tanstack/react-query'

export default function ListComponent() {
  const [openVersions, setOpenVersions] = useState<string[]>([])
  const queryClient = useQueryClient()

  const {
    data: changelogData,
    isLoading,
    isRefetching,
  } = useQuery({
    queryKey: ['changelog'],
    queryFn: async () => {
      try {
        const changelogData: Changelog.ChangelogType =
          await databases.listDocuments('hp_db', 'changelog', [
            Query.orderDesc('version'),
          ])
        return changelogData.documents
      } catch (error) {
        Sentry.captureException(error)
        throw error
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const toggleVersion = (version: string) => {
    setOpenVersions((prev) =>
      prev.includes(version)
        ? prev.filter((v) => v !== version)
        : [...prev, version]
    )
  }

  if (isLoading) {
    return (
      <View className={'flex flex-1 justify-center items-center h-full'}>
        <View className={'p-4 gap-6 text-center'}>
          <H1 className={'text-2xl font-semibold'}>{i18n.t('main.loading')}</H1>
          <Text className={'text-muted-foreground'}>
            Please wait while we fetch the latest updates.
          </Text>
        </View>
      </View>
    )
  }

  if (!isLoading && (!changelogData || changelogData.length === 0)) {
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
        onRefresh={() => {
          queryClient.invalidateQueries({ queryKey: ['changelog'] })
        }}
        refreshing={isRefetching}
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
