import React, { useCallback, useEffect, useState } from 'react'
import { ScrollView, View } from 'react-native'
import { functions } from '~/lib/appwrite-client'
import * as Sentry from '@sentry/react-native'
import { Community } from '~/lib/types/collections'
import { ExecutionMethod } from 'react-native-appwrite'
import CommunityItem from '~/components/community/CommunityItem'
import { Skeleton } from '~/components/ui/skeleton'
import { useDataCache } from '~/components/contexts/DataCacheContext'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'
import { i18n } from '~/components/system/i18n'
import { FlashList } from '@shopify/flash-list'
import { Text } from '~/components/ui/text'

export default function CommunitiesPage() {
  const { saveAllCache } = useDataCache()
  const [communities, setCommunities] = useState<
    Community.CommunityDocumentsType[]
  >([])
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [loadingMore, setLoadingMore] = useState<boolean>(false)
  const [offset, setOffset] = useState<number>(0)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const { showAlert } = useAlertModal()

  // Fetch communities function
  const fetchCommunities = useCallback(
    async (newOffset: number = 0, limit: number = 50) => {
      try {
        const data = await functions.createExecution(
          'community-endpoints',
          '',
          false,
          `/communities?limit=${limit}&offset=${newOffset}`, // Fetch with pagination
          ExecutionMethod.GET
        )
        const newCommunities: Community.CommunityDocumentsType[] = JSON.parse(
          data.responseBody
        )

        if (newOffset === 0) {
          setCommunities(newCommunities)
          saveAllCache('communities', newCommunities)
        } else {
          saveAllCache('communities', [...communities, ...newCommunities])
          setCommunities((prevCommunities) => [
            ...prevCommunities,
            ...newCommunities,
          ])
        }

        setHasMore(newCommunities.length === 20)
      } catch (error) {
        showAlert(
          'FAILED',
          'Failed to fetch notifications. Please try again later.'
        )
        Sentry.captureException(error)
      } finally {
        setRefreshing(false)
        setLoadingMore(false)
      }
    },
    [saveAllCache]
  )

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true)
    setOffset(0)
    await fetchCommunities(0)
  }

  // Handle loading more communities
  const loadMore = async () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true)
      const newOffset = offset + 20
      setOffset(newOffset)
      await fetchCommunities(newOffset)
    }
  }

  // Initial fetch when component mounts
  useEffect(() => {
    setRefreshing(true)
    fetchCommunities(0).then()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const renderItem = ({ item }: { item: Community.CommunityDocumentsType }) => (
    <CommunityItem community={item} />
  )

  if (refreshing || !communities.length)
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

  return (
    <View style={{ flex: 1 }}>
      <FlashList
        data={communities}
        keyExtractor={(item) => item.$id}
        renderItem={renderItem}
        onRefresh={onRefresh}
        refreshing={refreshing}
        estimatedItemSize={100}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore && hasMore ? (
            <Text className="p-4 text-center">{i18n.t('main.loading')}</Text>
          ) : null
        }
        contentInsetAdjustmentBehavior={'automatic'}
      />
    </View>
  )
}
