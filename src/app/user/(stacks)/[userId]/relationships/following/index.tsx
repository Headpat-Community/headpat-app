import * as Sentry from '@sentry/react-native'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useLocalSearchParams } from 'expo-router'
import { useTranslations } from 'gt-react-native'
import { FlatList, RefreshControl, ScrollView, Text, View } from 'react-native'
import { ExecutionMethod } from 'react-native-appwrite'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'
import { Skeleton } from '~/components/ui/skeleton'
import { H1, Muted } from '~/components/ui/typography'
import UserItem from '~/components/user/UserItem'
import { functions } from '~/lib/appwrite-client'
import type { UserDataDocumentsType } from '~/lib/types/collections'

const PAGE_SIZE = 20

export default function FollowingPage() {
  const local = useLocalSearchParams()
  const { showAlert, hideAlert } = useAlertModal()
  const t = useTranslations()
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isRefetching, refetch, isLoading } =
    useInfiniteQuery({
      queryKey: ['following', local.userId],
      queryFn: async ({ pageParam = 0 }) => {
        if (!local.userId) {
          throw new Error('User ID is required')
        }

        showAlert('LOADING', 'Fetching users...')
        try {
          const data = await functions.createExecution({
            functionId: 'user-endpoints',
            async: false,
            method: ExecutionMethod.GET,
            xpath: `/user/following?userId=${local.userId as string}&limit=${PAGE_SIZE}&offset=${pageParam * PAGE_SIZE}`,
          })
          const response: UserDataDocumentsType[] = JSON.parse(data.responseBody)
          hideAlert()
          return response
        } catch (error) {
          hideAlert()
          Sentry.captureException(error)
          showAlert('FAILED', 'Failed to fetch users. Please try again later.')
          throw error
        }
      },
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.length === PAGE_SIZE ? allPages.length : undefined
      },
      initialPageParam: 0,
      enabled: !!local.userId,
    })

  const users = data?.pages.flat() ?? []

  const onRefresh = () => {
    void refetch()
  }

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage()
    }
  }

  if (!local.userId)
    return (
      <ScrollView contentContainerClassName={'flex-1 justify-center items-center h-full'}>
        <View className={'native:pb-24 max-w-md gap-6 p-4'}>
          <View className={'gap-1'}>
            <H1 className={'text-center text-foreground'}>Following</H1>
            <Muted className={'text-center text-base'}>This user does not exist.</Muted>
          </View>
        </View>
      </ScrollView>
    )

  if (isLoading) {
    return (
      <View style={{ flex: 1 }}>
        {Array.from({ length: 16 }).map((_, index) => (
          <View
            key={`skeleton-${index.toString()}`}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              margin: 10,
            }}
          >
            {[...Array(3)].map((_, i) => (
              <View
                key={`skeleton-${i.toString()}`}
                style={{
                  width: 100,
                  height: 100,
                }}
              >
                <Skeleton className={'h-full w-full rounded-3xl'} />
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
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />}
      >
        <View className={'flex-1 items-center justify-center'}>
          <View className={'native:pb-24 max-w-md gap-6 p-4'}>
            <View className={'gap-1'}>
              <H1 className={'text-center text-foreground'}>Following</H1>
              <Muted className={'text-center text-base'}>This user is not following anyone.</Muted>
            </View>
          </View>
        </View>
      </ScrollView>
    )

  const renderItem = ({ item }: { item: UserDataDocumentsType }) => <UserItem user={item} />

  return (
    <FlatList
      data={users}
      keyExtractor={(item) => item.$id}
      renderItem={renderItem}
      onRefresh={onRefresh}
      refreshing={isRefetching}
      numColumns={3}
      contentContainerStyle={{ justifyContent: 'space-between' }}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isFetchingNextPage && hasNextPage ? <Text>{t('main.loading')}</Text> : null
      }
    />
  )
}
