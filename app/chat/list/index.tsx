import { FlatList, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { databases } from '~/lib/appwrite-client'
import { Query } from 'react-native-appwrite'
import { Community, Messaging, UserData } from '~/lib/types/collections'
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
  const { getCache, saveCache } = useDataCache()
  const { current } = useUser()

  useEffect(() => {
    const updateDisplayUsers = async () => {
      const newDisplayUsers = {}
      for (const conversation of conversations) {
        if (conversation.communityId) {
          let communityData = await getCache<Community.CommunityDocumentsType>(
            'communities',
            conversation.communityId
          ).then((res) => res?.data)
          if (!communityData) {
            const response: Community.CommunityDocumentsType =
              await databases.getDocument(
                'hp_db',
                'community',
                conversation.communityId
              )
            saveCache('communities', conversation.communityId, response)
            communityData = response
          }
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
            let userData = await getCache<UserData.UserDataDocumentsType>(
              'users',
              otherParticipantId
            ).then((res) => res?.data)
            if (!userData) {
              const response: UserData.UserDataDocumentsType =
                await databases.getDocument(
                  'hp_db',
                  'userdata',
                  otherParticipantId
                )
              saveCache('users', otherParticipantId, response)
              userData = response
            }
            if (userData) {
              newDisplayUsers[conversation.$id] = userData
            }
          }
        }
      }
      setDisplayData(newDisplayUsers)
    }

    updateDisplayUsers().then()
  }, [conversations, current, getCache, saveCache])

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
              return await databases.getDocument('hp_db', 'userdata', user.$id)
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
  }, [debouncedSearchTerm])

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
        className={'rounded-none'}
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
          data={searchTerm ? searchResults : conversations}
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
