import { functions } from '~/lib/appwrite-client'
import { ExecutionMethod } from 'react-native-appwrite'
import React from 'react'
import { UserData } from '~/lib/types/collections'
import { captureException } from '@sentry/react-native'
import UserItem from '~/components/user/UserItem'
import { FlatList, RefreshControl, ScrollView, Text, View } from 'react-native'
import { H1, Muted } from '~/components/ui/typography'
import { useLocalSearchParams } from 'expo-router'
import { Skeleton } from '~/components/ui/skeleton'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'
import { i18n } from '~/components/system/i18n'
import { useInfiniteQuery } from '@tanstack/react-query'

const PAGE_SIZE = 20

export default function FollowingPage() {
  const local = useLocalSearchParams()
  const { showAlert } = useAlertModal()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['community-followers', local.communityId],
    queryFn: async ({ pageParam = 0 }) => {
      try {
        const data = await functions.createExecution(
          'community-endpoints',
          '',
          false,
          `/community/followers?communityId=${local?.communityId}&limit=${PAGE_SIZE}&offset=${pageParam}`,
          ExecutionMethod.GET
        )
        return JSON.parse(data.responseBody) as UserData.UserDataDocumentsType[]
      } catch (error) {
        showAlert('FAILED', 'Failed to fetch users. Please try again later.')
        captureException(error)
        return []
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === PAGE_SIZE
        ? allPages.length * PAGE_SIZE
        : undefined
    },
    initialPageParam: 0,
    enabled: !!local?.communityId,
  })

  const users = data?.pages.flat() ?? []

  if (!local?.communityId)
    return (
      <ScrollView
        contentContainerClassName={'flex-1 justify-center items-center h-full'}
      >
        <View className={'p-4 native:pb-24 max-w-md gap-6'}>
          <View className={'gap-1'}>
            <H1 className={'text-foreground text-center'}>Followers</H1>
            <Muted className={'text-base text-center'}>
              This community does not exist.
            </Muted>
          </View>
        </View>
      </ScrollView>
    )

  if (isLoading) {
    return (
      <View style={{ flex: 1 }}>
        {Array.from({ length: 16 }).map((_, index) => (
          <View
            key={index}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              margin: 10,
            }}
          >
            {[...Array(3)].map((_, i) => (
              <View
                key={i}
                style={{
                  width: 100,
                  height: 100,
                }}
              >
                <Skeleton className={'w-full h-full rounded-3xl'} />
              </View>
            ))}
          </View>
        ))}
      </View>
    )
  }

  if (users.length === 0)
    return (
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        <View className={'flex-1 justify-center items-center'}>
          <View className={'p-4 native:pb-24 max-w-md gap-6'}>
            <View className={'gap-1'}>
              <H1 className={'text-foreground text-center'}>Followers</H1>
              <Muted className={'text-base text-center'}>
                This community does not have any followers.
              </Muted>
            </View>
          </View>
        </View>
      </ScrollView>
    )

  const renderItem = ({ item }: { item: UserData.UserDataDocumentsType }) => (
    <UserItem user={item} />
  )

  return (
    <FlatList
      data={users}
      keyExtractor={(item) => item.$id}
      renderItem={renderItem}
      onRefresh={refetch}
      refreshing={isRefetching}
      numColumns={3}
      contentContainerStyle={{ justifyContent: 'space-between' }}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      }}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isFetchingNextPage && hasNextPage ? (
          <Text>{i18n.t('main.loading')}</Text>
        ) : null
      }
    />
  )
}
