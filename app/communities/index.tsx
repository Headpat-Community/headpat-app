import React, { useCallback, useEffect, useState } from 'react'
import { FlatList, Text, View, ScrollView, RefreshControl } from 'react-native'
import { functions } from '~/lib/appwrite-client'
import { toast } from '~/lib/toast'
import * as Sentry from '@sentry/react-native'
import { Community } from '~/lib/types/collections'
import { ExecutionMethod } from 'react-native-appwrite'
import CommunityItem from '~/components/community/CommunityItem'
import { H1, Muted } from '~/components/ui/typography'

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<
    Community.CommunityDocumentsType[]
  >([])
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [loadingMore, setLoadingMore] = useState<boolean>(false)
  const [offset, setOffset] = useState<number>(0)
  const [hasMore, setHasMore] = useState<boolean>(true)

  // Fetch communities function
  const fetchCommunities = useCallback(async (newOffset: number = 0) => {
    try {
      const data = await functions.createExecution(
        'community-endpoints',
        '',
        false,
        `/communities?limit=20&offset=${newOffset}`, // Fetch with pagination
        ExecutionMethod.GET
      )
      const newCommunities: Community.CommunityDocumentsType[] = JSON.parse(
        data.responseBody
      )

      if (newOffset === 0) {
        setCommunities(newCommunities)
      } else {
        setCommunities((prevCommunities) => [
          ...prevCommunities,
          ...newCommunities,
        ])
      }

      // Check if more communities are available
      setHasMore(newCommunities.length === 20)
    } catch (error) {
      toast('Failed to fetch communities. Please try again later.')
      Sentry.captureException(error)
    } finally {
      setRefreshing(false)
      setLoadingMore(false)
    }
  }, [])

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
    fetchCommunities(0)
  }, [fetchCommunities])

  const renderItem = ({ item }: { item: Community.CommunityDocumentsType }) => (
    <CommunityItem community={item} />
  )

  if (refreshing && communities.length === 0)
    return (
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <View
          style={{ padding: 16, paddingBottom: 96, maxWidth: 400, gap: 16 }}
        >
          <View style={{ gap: 4 }}>
            <H1 style={{ textAlign: 'center', color: '#000' }}>Communities</H1>
            <Muted style={{ textAlign: 'center', fontSize: 16 }}>
              Loading...
            </Muted>
          </View>
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
        loadingMore && hasMore ? <Text>Loading...</Text> : null
      }
    />
  )
}
