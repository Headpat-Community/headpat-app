import React, { useEffect, useState } from 'react'
import { FlatList } from 'react-native'
import { database } from '~/lib/appwrite-client'
import { toast } from '~/lib/toast'
import * as Sentry from '@sentry/react-native'
import { UserData } from '~/lib/types/collections'
import { Query } from 'react-native-appwrite'
import UserItem from '~/components/user/UserItem'
import { Text } from 'react-native'

export default function UserListPage() {
  const [users, setUsers] = useState<UserData.UserDataDocumentsType[]>([])
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [loadingMore, setLoadingMore] = useState<boolean>(false)
  const [offset, setOffset] = useState<number>(0)

  const fetchUsers = async (newOffset: number = 0) => {
    try {
      const data: UserData.UserDataType = await database.listDocuments(
        'hp_db',
        'userdata',
        [
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
  }

  const onRefresh = async () => {
    setRefreshing(true)
    setOffset(0)
    await fetchUsers(0)
    setRefreshing(false)
  }

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
    fetchUsers(0).then()
  }, [])

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
      contentInsetAdjustmentBehavior={'automatic'}
    />
  )
}
