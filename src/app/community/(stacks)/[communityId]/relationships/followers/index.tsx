import { captureException } from '@sentry/react-native'
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
  const { showAlert } = useAlertModal()
  const t = useTranslations()
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isRefetching, isLoading, refetch } =
    useInfiniteQuery({
      queryKey: ['community-followers', local.communityId],
      queryFn: async ({ pageParam = 0 }) => {
        try {
          const data = await functions.createExecution({
            functionId: 'community-endpoints',
            async: false,
            xpath: `/community/followers?communityId=${local.communityId as string}&limit=${PAGE_SIZE}&offset=${pageParam}`,
            method: ExecutionMethod.GET,
          })
          return JSON.parse(data.responseBody) as UserDataDocumentsType[]
        } catch (error) {
          showAlert('FAILED', 'Failed to fetch users. Please try again later.')
          captureException(error)
          return []
        }
      },
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.length === PAGE_SIZE ? allPages.length * PAGE_SIZE : undefined
      },
      initialPageParam: 0,
      enabled: !!local.communityId,
    })

  const users = data?.pages.flat() ?? []

  if (!local.communityId)
    return (
      <ScrollView contentContainerClassName={'flex-1 justify-center items-center h-full'}>
        <View className={'native:pb-24 max-w-md gap-6 p-4'}>
          <View className={'gap-1'}>
            <H1 className={'text-center text-foreground'}>Followers</H1>
            <Muted className={'text-center text-base'}>This community does not exist.</Muted>
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
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />
        }
      >
        <View className={'flex-1 items-center justify-center'}>
          <View className={'native:pb-24 max-w-md gap-6 p-4'}>
            <View className={'gap-1'}>
              <H1 className={'text-center text-foreground'}>Followers</H1>
              <Muted className={'text-center text-base'}>
                This community does not have any followers.
              </Muted>
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
      onRefresh={() => void refetch()}
      refreshing={isRefetching}
      numColumns={3}
      contentContainerStyle={{ justifyContent: 'space-between' }}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) {
          void fetchNextPage()
        }
      }}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isFetchingNextPage && hasNextPage ? <Text>{t('main.loading')}</Text> : null
      }
    />
  )
}
