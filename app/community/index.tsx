import React, { useCallback, useEffect, useState } from 'react'
import { FlatList, ScrollView, Text, View } from 'react-native'
import { functions } from '~/lib/appwrite-client'
import * as Sentry from '@sentry/react-native'
import { Community } from '~/lib/types/collections'
import { ExecutionMethod } from 'react-native-appwrite'
import CommunityItem from '~/components/community/CommunityItem'
import { Skeleton } from '~/components/ui/skeleton'
import { useDataCache } from '~/components/contexts/DataCacheContext'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'
import { i18n } from '~/components/system/i18n'

export default function CommunitiesPage() {
  const { getAllCache, saveAllCache } = useDataCache()
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
      const cachedCommunities =
        await getAllCache<Community.CommunityDocumentsType>('communities')
      if (cachedCommunities && typeof cachedCommunities === 'object') {
        const communitiesArray = Object.values(cachedCommunities).map(
          (item) => item.data
        )
        setCommunities(communitiesArray)
        setRefreshing(false)
      }
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
    [getAllCache, saveAllCache]
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
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {Array.from({ length: 8 }).map((_, index) => (
            <View
              className={'px-4 m-4 w-full flex flex-row items-center'}
              key={index}
            >
              <Skeleton className="w-[100px] h-[100px] rounded-3xl" />
              <View className={'flex flex-col gap-3 ml-6'}>
                <Skeleton className="w-[150px] h-[20px] rounded" />
                <Skeleton className="w-[100px] h-[20px] rounded" />
                <View className={'flex flex-row items-center gap-4'}>
                  <View className={'flex flex-row items-center gap-2'}>
                    <Skeleton className="w-[20px] h-[20px] rounded-full" />
                    <Skeleton className="w-[50px] h-[20px] rounded" />
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    )

  return (
    <FlatList
      data={communities}
      keyExtractor={(item) => item.$id}
      renderItem={renderItem}
      onRefresh={onRefresh}
      refreshing={refreshing}
      numColumns={1}
      contentContainerStyle={{ justifyContent: 'space-between' }}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        loadingMore && hasMore ? <Text>{i18n.t('main.loading')}</Text> : null
      }
      contentInsetAdjustmentBehavior={'automatic'}
    />
  )
}
