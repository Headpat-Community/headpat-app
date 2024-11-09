import { View } from 'react-native'
import { Stack, useLocalSearchParams } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import { Text } from '~/components/ui/text'
import { useFocusEffect } from '@react-navigation/core'
import { useUser } from '~/components/contexts/UserContext'
import { useRealtimeChat } from '~/lib/hooks/useRealtimeChat'
import { useDataCache } from '~/components/contexts/DataCacheContext'
import { databases } from '~/lib/appwrite-client'
import { Messaging } from '~/lib/types/collections'
import { Query } from 'react-native-appwrite'
import { getCommunityAvatarUrlPreview } from '~/components/api/getStorageItem'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'

export default function ChatView() {
  const local = useLocalSearchParams()
  const { current } = useUser()
  const { messages, setMessages } = useRealtimeChat()
  const { userCache, communityCache, fetchUserData, fetchCommunityData } =
    useDataCache()
  const [participants, setParticipants] = useState<string[]>([])
  const [communityId, setCommunityId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)

  const fetchMessages = useCallback(
    async (reset = false) => {
      if (!hasMore && !reset) return

      const limit = 25
      const offset = reset ? 0 : page * limit

      try {
        const result = await databases.listDocuments('hp_db', 'messages', [
          Query.equal('conversationId', local?.conversationId),
          Query.orderAsc('$createdAt'),
          Query.limit(limit),
          Query.offset(offset),
        ])

        const newMessages =
          result.documents as Messaging.MessagesType['documents']

        // Fetch user data for any new message senders
        const newParticipants = newMessages.map((msg) => msg.senderId)
        const participantPromises = newParticipants.map(async (userId) => {
          if (!userCache[userId]) {
            await fetchUserData(userId)
          }
        })
        await Promise.all(participantPromises)

        setMessages((prevMessages) =>
          reset ? newMessages : [...prevMessages, ...newMessages]
        )
        setHasMore(newMessages.length === limit)
        setPage((prevPage) => (reset ? 1 : prevPage + 1))
      } catch (error) {
        console.error('Error fetching messages:', error)
      }
    },
    [
      local?.conversationId,
      hasMore,
      page,
      setMessages,
      userCache,
      fetchUserData,
    ]
  )

  const fetchConversation = useCallback(async () => {
    setIsLoading(true)
    try {
      await fetchMessages(true)

      const conversationData: Messaging.MessageConversationsDocumentsType =
        await databases.getDocument(
          'hp_db',
          'messages-conversations',
          local?.conversationId.toString()
        )

      if (conversationData.communityId) {
        setCommunityId(conversationData.communityId)
        if (!communityCache[conversationData.communityId]) {
          await fetchCommunityData(conversationData.communityId)
        }
      }

      const messageParticipants = messages.map((msg) => msg.senderId)
      const conversationParticipants = conversationData.participants || []
      const allParticipants = [
        ...new Set([...messageParticipants, ...conversationParticipants]),
      ]

      const participantPromises = allParticipants.map(async (userId) => {
        if (!userCache[userId]) {
          await fetchUserData(userId)
        }
      })

      await Promise.all(participantPromises)

      setParticipants(
        conversationData.communityId
          ? messageParticipants
          : conversationData.participants || []
      )
    } catch (error) {
      console.error('Error fetching conversation:', error)
    } finally {
      setIsLoading(false)
    }
  }, [
    fetchMessages,
    local?.conversationId,
    communityCache,
    fetchCommunityData,
    messages,
    userCache,
    fetchUserData,
  ])

  useEffect(() => {
    const fetchParticipantsData = async () => {
      const promises = participants.map((userId) => {
        if (!userCache[userId]) {
          return fetchUserData(userId)
        }
        return Promise.resolve()
      })
      await Promise.all(promises)
    }

    if (participants.length > 0) {
      fetchParticipantsData().then()
    }
  }, [participants, userCache])

  useFocusEffect(
    useCallback(() => {
      fetchConversation().then()
    }, [])
  )

  const getConversationAvatar = () => {
    if (communityId && communityCache[communityId]) {
      return getCommunityAvatarUrlPreview(
        communityCache[communityId].avatarId,
        'width=100&height=100'
      )
    }
    const test = getUserAvatar(
      participants.find((id) => id !== current.$id) || ''
    )
    console.log(test)
  }

  const getConversationName = () => {
    if (communityId && communityCache[communityId]) {
      return communityCache[communityId].name
    }
    return userCache[participants.find((id) => id !== current.$id) || '']
      ?.displayName
  }

  const getUserAvatar = (userId: string) => {
    const user = userCache[userId]
    if (!user) return undefined
    if (!user.avatarId) return undefined
    return `https://api.headpat.place/v1/storage/buckets/avatars/files/${user.avatarId}/preview?project=hp-main&width=100&height=100`
  }

  return (
    <View>
      <Stack.Screen
        options={{
          headerTitle: (props) => (
            <>
              <Avatar alt={'Avatar'}>
                <AvatarImage
                  source={{
                    uri: getConversationAvatar(),
                  }}
                  style={{ width: 24, height: 24 }}
                />
                <AvatarFallback>
                  <Text>{'A'}</Text>
                </AvatarFallback>
              </Avatar>
              <Text>{getConversationName()}</Text>
            </>
          ),
        }}
      />
      <Text>Hi</Text>
    </View>
  )
}
