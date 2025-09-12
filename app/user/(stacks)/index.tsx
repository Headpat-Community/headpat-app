import React from "react"
import { FlashList } from "@shopify/flash-list"
import { databases } from "~/lib/appwrite-client"
import * as Sentry from "@sentry/react-native"
import { UserDataDocumentsType, UserDataType } from "~/lib/types/collections"
import { Query } from "react-native-appwrite"
import UserItem from "~/components/user/UserItem"
import { i18n } from "~/components/system/i18n"
import { useAlertModal } from "~/components/contexts/AlertModalProvider"
import { Text } from "~/components/ui/text"
import { View } from "react-native"
import { useInfiniteQuery } from "@tanstack/react-query"

const PAGE_SIZE = 50

export default function UserListPage() {
  const { showAlert } = useAlertModal()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["users"],
    queryFn: async ({ pageParam = 0 }) => {
      try {
        const data: UserDataType = await databases.listRows({
          databaseId: "hp_db",
          tableId: "userdata",
          queries: [
            Query.orderDesc("$createdAt"),
            Query.limit(PAGE_SIZE),
            Query.offset(pageParam * PAGE_SIZE),
          ],
        })

        return data.rows
      } catch (error) {
        showAlert("FAILED", "Failed to fetch users. Please try again later.")
        Sentry.captureException(error)
        throw error
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === PAGE_SIZE ? allPages.length : undefined
    },
    initialPageParam: 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
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

  const renderItem = ({ item }: { item: UserDataDocumentsType }) => (
    <UserItem user={item} />
  )

  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <View style={{ flex: 1, width: "100%", maxWidth: 400 }}>
        <FlashList
          data={users}
          keyExtractor={(item) => item.$id}
          renderItem={renderItem}
          onRefresh={onRefresh}
          refreshing={isRefetching}
          numColumns={3}
          estimatedItemSize={150}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? <Text>{i18n.t("main.loading")}</Text> : null
          }
        />
      </View>
    </View>
  )
}
