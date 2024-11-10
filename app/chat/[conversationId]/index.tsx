import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  FlatList,
  View,
  Button,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from 'react-native'
import { Stack, useLocalSearchParams } from 'expo-router'
import { Text } from '~/components/ui/text'
import { useFocusEffect } from '@react-navigation/core'
import { useUser } from '~/components/contexts/UserContext'
import { useRealtimeChat } from '~/lib/hooks/useRealtimeChat'
import { useDataCache } from '~/components/contexts/DataCacheContext'
import { databases, functions } from '~/lib/appwrite-client'
import { Messaging } from '~/lib/types/collections'
import { ExecutionMethod, Query } from 'react-native-appwrite'
import MessageItem from '~/components/FlatlistItems/MessageItem'
import { Input } from '~/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { getCommunityAvatarUrlPreview } from '~/components/api/getStorageItem'
import { z } from 'zod'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'

const schema = z.object({
  message: z
    .string()
    .trim()
    .max(2048, 'Message: Max length is 2048')
    .min(1, 'Message: Min length is 1'),
  attachments: z.array(z.instanceof(File)).optional(),
})

export default function ChatView() {
  const local = useLocalSearchParams()
  const { current } = useUser()
  const { messages, setMessages } = useRealtimeChat()
  const { userCache, communityCache, fetchUserData, fetchCommunityData } =
    useDataCache()
  const { showAlertModal } = useAlertModal()
  const [participants, setParticipants] = useState<string[]>([])
  const [communityId, setCommunityId] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [messageText, setMessageText] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const [initialScrollDone, setInitialScrollDone] = useState(false)
  const [scrollTimeout, setScrollTimeout] = useState<NodeJS.Timeout | null>(
    null
  )
  const [isFetching, setIsFetching] = useState(false)
  const [lastFetchedIndex, setLastFetchedIndex] = useState<number | null>(null)
  const flatListRef = useRef<FlatList>(null)

  const fetchMessages = useCallback(
    async (reset = false) => {
      if (!hasMore && !reset) return

      const limit = 20
      const offset = reset ? 0 : page * limit

      try {
        const result = await databases.listDocuments('hp_db', 'messages', [
          Query.equal('conversationId', local?.conversationId),
          Query.orderDesc('$createdAt'),
          Query.limit(limit),
          Query.offset(offset),
        ])

        const newMessages =
          result.documents as Messaging.MessagesType['documents']

        // Sort messages by $createdAt
        newMessages.sort(
          (a, b) =>
            new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime()
        )

        // Fetch user data for any new message senders
        const newParticipants = newMessages.map((msg) => msg.senderId)
        const participantPromises = newParticipants.map(async (userId) => {
          if (!userCache[userId]) {
            await fetchUserData(userId)
          }
        })
        await Promise.all(participantPromises)

        setMessages((prevMessages) => {
          const updatedMessages = reset
            ? newMessages
            : [...newMessages, ...prevMessages]

          // Unload the oldest 20 messages if the total exceeds 100
          if (updatedMessages.length > 100) {
            return updatedMessages.slice(0, 100)
          }

          return updatedMessages
        })

        if (newMessages.length > 0) {
          setLastFetchedIndex(newMessages.length - 1)
        }
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
    try {
      await fetchMessages(true)

      const conversationData: Messaging.MessageConversationsDocumentsType =
        await databases.getDocument(
          'hp_db',
          'messages-conversations',
          `${local?.conversationId}`
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

      setParticipants(allParticipants)

      const participantPromises = allParticipants.map(async (userId) => {
        if (!userCache[userId]) {
          await fetchUserData(userId)
        }
      })

      await Promise.all(participantPromises)
    } catch (error) {
      console.error('Error fetching conversation:', error)
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
    if (participants.length > 0) {
      Promise.all(participants.map(fetchUserData)).then()
    }
  }, [fetchUserData, participants])

  useFocusEffect(
    useCallback(() => {
      fetchConversation().then()
      getConversationName()
    }, [])
  )

  const getUserAvatar = useCallback(
    (userId: string) => {
      const user = userCache[userId]
      if (!user) return undefined
      if (!user.avatarId) return undefined
      return `https://api.headpat.place/v1/storage/buckets/avatars/files/${user?.avatarId}/preview?project=hp-main&width=100&height=100`
    },
    [userCache]
  )

  const getConversationAvatar = useCallback(() => {
    if (communityId && communityCache[communityId]) {
      return getCommunityAvatarUrlPreview(
        communityCache[communityId].avatarId,
        'width=100&height=100'
      )
    }
    return getUserAvatar(participants.find((id) => id !== current.$id) || '')
  }, [communityId, communityCache, getUserAvatar, participants, current.$id])

  const getConversationName = useCallback(() => {
    if (communityId && communityCache[communityId]) {
      return communityCache[communityId].name
    }
    return userCache[participants.find((id) => id !== current.$id) || '']
      ?.displayName
  }, [communityId, communityCache, userCache, participants, current.$id])

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      const timeout = setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: false })
      }, 100) // 100 milliseconds delay

      return () => clearTimeout(timeout)
    }
  }, [messages])

  const handleScroll = (event) => {
    const { contentOffset } = event.nativeEvent
    if (contentOffset.y <= 0) {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
      setScrollTimeout(
        setTimeout(() => {
          setIsFetching(true)
          fetchMessages().then(() => {
            setIsFetching(false)
            if (lastFetchedIndex !== null && lastFetchedIndex >= 0 && hasMore) {
              flatListRef.current?.scrollToIndex({
                index: lastFetchedIndex,
                animated: false,
              })
            }
          })
        }, 100) // 100 milliseconds timeout
      )
    }
  }

  const sendMessage = async (event) => {
    const maxFileSize = 8 * 1024 * 1024 // 8 MB in bytes
    const conversationId = `${local?.conversationId}`

    try {
      // Validate the message and attachments
      schema.parse({ message: messageText, attachments })

      // Create a pending message
      const pendingMessage: Messaging.MessagesDocumentsType = {
        $id: `pending_${Date.now()}`,
        body: messageText,
        senderId: current.$id || '',
        conversationId,
        messageType: 'text',
        attachments: [],
        $collectionId: 'messages',
        $databaseId: 'hp_db',
        $permissions: [],
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, pendingMessage]) // Update messages state immediately

      // Prepare the endpoint URL
      let endpointUrl = `/user/chat/message?conversationId=${local?.conversationId}`
      if (!communityId) {
        const recipientId = participants.find((id) => id !== current.$id)
        if (recipientId) {
          endpointUrl += `&recipientId=${recipientId}`
        }
      }

      const data = await functions.createExecution(
        'user-endpoints',
        JSON.stringify({
          message: messageText,
          attachments: [],
          messageType: 'text',
        }),
        false,
        endpointUrl,
        ExecutionMethod.POST
      )

      // After successful send, remove the pending message
      setMessages((prev) =>
        prev.filter((msg) => msg.$id !== pendingMessage.$id)
      )

      // Clear the message and attachments
      setMessageText('')
      setAttachments([])

      const response = JSON.parse(data.responseBody)
      if (response.code === 500) {
        showAlertModal('FAILED', 'An error occurred while sending the message')
        return
      } else if (response.type === 'userchat_user_not_in_conversation') {
        showAlertModal('FAILED', 'You are not in this conversation')
        return
      } else if (response.type === 'userchat_message_sent') {
        // Do nothing
      }
    } catch (error) {
      // Remove the pending message in case of error
      setMessages((prev) =>
        prev.filter((msg) => msg.$id !== `pending_${Date.now()}`)
      )
      if (error instanceof z.ZodError) {
        console.error(error.errors[0].message)
        showAlertModal('FAILED', error.errors[0].message)
      } else {
        showAlertModal('FAILED', 'An error occurred while sending the message')
        console.error('Error sending message:', error)
      }
    }
  }

  const renderItem = ({ item }) => <MessageItem message={item} />

  return (
    <View className={'flex-1'}>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <View className={'flex flex-row items-center'}>
              <Avatar alt={'Avatar'}>
                <AvatarImage
                  source={{
                    uri: getConversationAvatar(),
                  }}
                  style={{ width: 32, height: 32, borderRadius: 12 }}
                />
                <AvatarFallback>
                  <Text>{getConversationName()}</Text>
                </AvatarFallback>
              </Avatar>
              <Text style={{ marginLeft: 8, fontSize: 16 }}>
                {getConversationName()}
              </Text>
            </View>
          ),
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        {isFetching && (
          <View style={styles.loadingContainer}>
            <Text>Loading...</Text>
          </View>
        )}
        <FlatList
          ref={flatListRef}
          data={[...messages]}
          renderItem={renderItem}
          keyExtractor={(item) => item.$id}
          onScroll={handleScroll}
          onContentSizeChange={() => {
            if (!initialScrollDone) {
              flatListRef.current?.scrollToEnd({ animated: false })
              setInitialScrollDone(true)
            }
          }}
          onLayout={() => {
            if (!initialScrollDone) {
              flatListRef.current?.scrollToEnd({ animated: false })
              setInitialScrollDone(true)
            }
          }}
        />
        <View style={styles.inputContainer}>
          <Input
            style={styles.input}
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Type a message"
          />
          <Button title="Send" onPress={sendMessage} />
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
})
