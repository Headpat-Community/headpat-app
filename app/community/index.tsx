import { captureException } from "@sentry/react-native"
import { FlashList } from "@shopify/flash-list"
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query"
import React, { useCallback } from "react"
import { ScrollView, View } from "react-native"
import { ExecutionMethod } from "react-native-appwrite"
import CommunityItem from "~/components/community/CommunityItem"
import { useAlertModal } from "~/components/contexts/AlertModalProvider"
import { i18n } from "~/components/system/i18n"
import { Skeleton } from "~/components/ui/skeleton"
import { Text } from "~/components/ui/text"
import { functions } from "~/lib/appwrite-client"
import { CommunityDocumentsType } from "~/lib/types/collections"

const PAGE_SIZE = 20

export default function CommunitiesPage() {
  const { showAlert } = useAlertModal()
  const queryClient = useQueryClient()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["communities"],
    queryFn: async ({ pageParam = 0 }) => {
      try {
        const data = await functions.createExecution({
          functionId: "community-endpoints",
          async: false,
          xpath: `/communities?limit=${PAGE_SIZE}&offset=${pageParam}`,
          method: ExecutionMethod.GET,
        })
        return JSON.parse(data.responseBody) as CommunityDocumentsType[]
      } catch (error) {
        showAlert(
          "FAILED",
          "Failed to fetch communities. Please try again later."
        )
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
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const communities = data?.pages.flat() ?? []

  const renderItem = useCallback(
    ({ item }: { item: CommunityDocumentsType }) => (
      <CommunityItem community={item} />
    ),
    []
  )

  const keyExtractor = useCallback(
    (item: CommunityDocumentsType) => item.$id,
    []
  )

  if (isLoading) {
    return (
      <ScrollView contentInsetAdjustmentBehavior={"automatic"}>
        {Array.from({ length: 10 }).map((_, index) => (
          <View key={index} className="px-4 py-2">
            <View className="flex flex-row items-center">
              <Skeleton className="h-20 w-20 rounded-2xl" />
              <View className="ml-4 flex-1">
                <Skeleton className="h-5 w-32 rounded" />
                <Skeleton className="mt-1 h-4 w-24 rounded" />
                <View className="mt-2 flex flex-row items-center">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="ml-2 h-4 w-8 rounded" />
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <FlashList
        data={communities}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        onRefresh={() => {
          void queryClient.invalidateQueries({
            queryKey: ["communities"],
          })
        }}
        refreshing={isRefetching}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            void fetchNextPage()
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage && hasNextPage ? (
            <Text className="p-4 text-center">{i18n.t("main.loading")}</Text>
          ) : null
        }
        contentInsetAdjustmentBehavior={"automatic"}
      />
    </View>
  )
}
