import { toast } from '~/lib/toast'
import { database } from '~/lib/appwrite-client'
import { Query } from 'react-native-appwrite'
import { useUser } from '~/components/contexts/UserContext'
import React, { useCallback, useEffect, useState } from 'react'
import { UserData } from '~/lib/types/collections'
import * as Sentry from '@sentry/react-native'
import UserItem from '~/components/user/UserItem'
import { FlatList, RefreshControl, ScrollView, Text, View } from 'react-native'
import { H1, Muted } from '~/components/ui/typography'

export default function FollowersPage() {
  const [users, setUsers] = useState<UserData.UserDataDocumentsType[]>([])
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [loadingMore, setLoadingMore] = useState<boolean>(false)
  const [offset, setOffset] = useState<number>(0)
  const { current } = useUser()

  const onRefresh = async () => {
    setRefreshing(true)
    setOffset(0)
    await fetchUsers(0)
    setRefreshing(false)
  }

  const fetchUsers = useCallback(
    async (newOffset: number = 0) => {
      try {
        const data: UserData.UserDataType = await database.listDocuments(
          'hp_db',
          'followers',
          [
            Query.equal('followerId', current?.$id),
            Query.orderDesc('$createdAt'),
            Query.limit(20),
            Query.offset(newOffset),
          ]
        )

        const newUsers = data.documents

        if (newOffset === 0) {
          setUsers(newUsers)
        } else {
          setUsers((prevUsers) => [...prevUsers, ...newUsers])
        }
      } catch (error) {
        toast('Failed to fetch users. Please try again later.')
        Sentry.captureException(error)
      }
    },
    [current]
  )

  const loadMore = async () => {
    if (!loadingMore) {
      setLoadingMore(true)
      const newOffset = offset + 20
      setOffset(newOffset)
      await fetchUsers(newOffset)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    if (!current?.$id) return
    fetchUsers().then()
  }, [current, fetchUsers])

  if (!current?.$id)
    return (
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className={'flex-1 justify-center items-center'}>
          <View className={'p-4 native:pb-24 max-w-md gap-6'}>
            <View className={'gap-1'}>
              <H1 className={'text-foreground text-center'}>Followers</H1>
              <Muted className={'text-base text-center'}>
                You need to be logged in to view your followers.
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
      onRefresh={onRefresh}
      refreshing={refreshing}
      numColumns={3}
      contentContainerStyle={{ justifyContent: 'space-between' }}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={loadingMore ? <Text>Loading...</Text> : null}
    />
  )
}
