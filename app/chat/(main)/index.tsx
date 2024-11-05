import { router } from 'expo-router'
import { FlatList } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { databases, functions } from '~/lib/appwrite-client'
import { ExecutionMethod, Query } from 'react-native-appwrite'
import { Messaging } from '~/lib/types/collections'
import ConversationItem from '~/components/FlatlistItems/ConversationItem'
import { useRealtimeChat } from '~/lib/hooks/useRealtimeChat'
import { useUser } from '~/components/contexts/UserContext'
import { useDataCache } from '~/components/contexts/DataCacheContext'
import { Input } from '~/components/ui/input'
import { useDebounce } from '~/lib/hooks/useDebounce'

export default function ConversationsView() {
  const [refreshing, setRefreshing] = useState(false)
  const [displayData, setDisplayData] = useState({})
  const [isModalOpen, setIsModalOpen] = useState(false)
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
  }, [fetchInitialData])

  const createConversation = async (recipientId: string) => {
    try {
      const data = await functions.createExecution(
        'user-endpoints',
        '',
        false,
        `/user/chat/conversation?recipientId=${recipientId}`,
        ExecutionMethod.POST
      )
      const response = JSON.parse(data.responseBody)
      console.log(response)
      if (response.type === 'userchat_missing_recipient_id') {
        console.error('Missing recipient ID')
        return
      } else if (response.type === 'userchat_recipient_does_not_exist') {
        console.error('Recipient does not exist')
        return
      } else if (response.type === 'userchat_messaging_disabled') {
        console.error('Messaging is currently disabled')
        return
      } else if (
        response.type === 'userchat_recipient_cannot_be_the_same_as_the_user'
      ) {
        console.error('Cannot create conversation with yourself')
        return
      } else {
        router.push({
          pathname: '/chat/[conversationId]',
          params: { conversationId: response.$id },
        })
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error fetching conversation.', error)
    }
  }

  const renderItem = ({
    item,
  }: {
    item: Messaging.MessageConversationsDocumentsType
  }) => <ConversationItem displayData={displayData[item.$id]} />

  return (
    <>
      <Input
        value={searchTerm}
        onChangeText={setSearchTerm}
        placeholder="Search users..."
      />
      <FlatList
        data={debouncedSearchTerm ? searchResults : conversations}
        keyExtractor={(item) => item.$id}
        renderItem={renderItem}
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
    </>
  )
}
