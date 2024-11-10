import { router } from 'expo-router'
import { FlatList, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { databases, functions } from '~/lib/appwrite-client'
import { ExecutionMethod, Query } from 'react-native-appwrite'
import { Messaging, UserData } from '~/lib/types/collections'
import ConversationItem from '~/components/FlatlistItems/ConversationItem'
import { useRealtimeChat } from '~/lib/hooks/useRealtimeChat'
import { useUser } from '~/components/contexts/UserContext'
import { useDataCache } from '~/components/contexts/DataCacheContext'
import { Input } from '~/components/ui/input'
import { useDebounce } from '~/lib/hooks/useDebounce'
import { Text } from '~/components/ui/text'
import ConversationSearchItem from '~/components/FlatlistItems/ConversationSearchItem'
import { useFocusEffect } from '@react-navigation/core'
import FeatureAccess from '~/components/FeatureAccess'

export default function ConversationsView() {
  const [refreshing, setRefreshing] = useState(false)
  const [displayData, setDisplayData] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const { conversations, fetchInitialData } = useRealtimeChat()
  const { fetchCommunityData, fetchUserData } = useDataCache()
  const { current } = useUser()

  useEffect(() => {
    const updateDisplayUsers = async () => {
      const newDisplayUsers = {}
      for (const conversation of conversations) {
        if (conversation.communityId) {
          const communityData = await fetchCommunityData(
            conversation.communityId
          )
          if (communityData) {
            newDisplayUsers[conversation.$id] = {
              isCommunity: true,
              ...communityData,
            }
          }
        } else if (conversation.participants) {
          const otherParticipantId = conversation.participants.find(
            (participant) => participant !== current.$id
          )
          if (otherParticipantId) {
            const userData = await fetchUserData(otherParticipantId)
            if (userData) {
              newDisplayUsers[conversation.$id] = userData
            }
          }
        }
      }
      setDisplayData(newDisplayUsers)
    }

    updateDisplayUsers().then()
  }, [conversations, current, fetchCommunityData, fetchUserData])

  useEffect(() => {
    const searchUsers = async () => {
      if (debouncedSearchTerm) {
        setIsLoading(true)
        try {
          const results = await databases.listDocuments('hp_db', 'userdata', [
            Query.contains('profileUrl', debouncedSearchTerm),
          ])
          const userDataResults = await Promise.all(
            results.documents.map(async (user) => {
              return await fetchUserData(user.$id)
            })
          )
          setSearchResults(userDataResults)
        } catch (error) {
          console.error('Error searching users', error)
        } finally {
          setIsLoading(false)
        }
      } else {
        setSearchResults([])
      }
    }

    searchUsers().then()
  }, [debouncedSearchTerm, fetchUserData])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchInitialData().then(() => setRefreshing(false))
  }, [])

  useFocusEffect(
    useCallback(() => {
      setSearchTerm('')
      onRefresh()
    }, [])
  )

  const renderConversationItem = ({
    item,
  }: {
    item: Messaging.MessageConversationsDocumentsType
  }) => (
    <ConversationItem
      item={item}
      displayData={displayData[item.$id]}
      isLoading={isLoading}
    />
  )

  const renderSearchItem = ({
    item,
  }: {
    item: UserData.UserDataDocumentsType
  }) => <ConversationSearchItem item={item} />

  return (
    <FeatureAccess featureName={'messaging'}>
      <Input
        value={searchTerm}
        onChangeText={setSearchTerm}
        placeholder="Search users..."
      />
      {searchTerm ? (
        <View>
          {isLoading ? (
            <View>
              <Text>Loading...</Text>
            </View>
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.$id}
              renderItem={renderSearchItem}
            />
          )}
        </View>
      ) : (
        <FlatList
          data={debouncedSearchTerm ? searchResults : conversations}
          keyExtractor={(item) => item.$id}
          renderItem={renderConversationItem}
          onRefresh={onRefresh}
          refreshing={refreshing}
          numColumns={1}
          contentContainerStyle={{ justifyContent: 'space-between' }}
          //onEndReached={loadMore}
          //onEndReachedThreshold={0.5}
          //ListFooterComponent={
          //  loadingMore && hasMore ? <Text>Loading...</Text> : null
          //}
        />
      )}
    </FeatureAccess>
  )
}
