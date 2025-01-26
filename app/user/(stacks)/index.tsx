import React, { useEffect, useState } from 'react'
import { FlatList } from 'react-native'
import { databases } from '~/lib/appwrite-client'
import { toast } from '~/lib/toast'
import * as Sentry from '@sentry/react-native'
import { Community, UserData } from '~/lib/types/collections'
import { Query } from 'react-native-appwrite'
import UserItem from '~/components/user/UserItem'
import { Text } from 'react-native'
import { useDataCache } from '~/components/contexts/DataCacheContext'
import { i18n } from '~/components/system/i18n'

export default function UserListPage() {
  const [users, setUsers] = useState<UserData.UserDataDocumentsType[]>([])
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [loadingMore, setLoadingMore] = useState<boolean>(false)
  const [offset, setOffset] = useState<number>(0)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const { getAllCache, saveAllCache } = useDataCache()

  const fetchUsers = async (newOffset: number = 0) => {
    const cachedUsers =
      await getAllCache<UserData.UserDataDocumentsType>('users')
    console.log(cachedUsers)
    if (cachedUsers && typeof cachedUsers === 'object') {
      const usersArray = Object.values(cachedUsers).map((item) => item.data)
      setUsers(usersArray)
      setRefreshing(false)
    }
    try {
      const data: UserData.UserDataType = await databases.listDocuments(
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
        saveAllCache('users', newUsers)
      } else {
        saveAllCache('users', [...users, ...newUsers])
        setUsers((prevUsers) => [...prevUsers, ...newUsers])
      }

      // Check if there are more users to load
      setHasMore(newUsers.length === 20)
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
    if (!loadingMore && hasMore) {
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
      ListFooterComponent={
        loadingMore ? <Text>{i18n.t('main.loading')}</Text> : null
      }
      contentInsetAdjustmentBehavior={'automatic'}
    />
  )
}
