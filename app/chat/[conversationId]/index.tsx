import React, { useCallback, useEffect, useRef, useState } from 'react'
import { FlatList, View, Platform, KeyboardAvoidingView } from 'react-native'
import { Stack, useLocalSearchParams } from 'expo-router'
import { Text } from '~/components/ui/text'
import { useFocusEffect } from '@react-navigation/core'
import { useUser } from '~/components/contexts/UserContext'
import { useRealtimeChat } from '~/lib/hooks/useRealtimeChat'
import { useDataCache } from '~/components/contexts/DataCacheContext'
import { databases, functions } from '~/lib/appwrite-client'
import { Community, Messaging, UserData } from '~/lib/types/collections'
import { ExecutionMethod, Query } from 'react-native-appwrite'
import MessageItem from '~/components/FlatlistItems/MessageItem'
import { Input } from '~/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import {
  getAvatarImageUrlPreview,
  getCommunityAvatarUrlPreview,
} from '~/components/api/getStorageItem'
import { z } from 'zod'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'
import { Button } from '~/components/ui/button'
import { SendIcon } from 'lucide-react-native'
import { useColorScheme } from '~/lib/useColorScheme'

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
  const { getCache, getCacheSync, saveCache } = useDataCache()
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
  const [lastFetchedIndex, setLastFetchedIndex] = useState<number | null>(null)
  const flatListRef = useRef<FlatList>(null)
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? 'white' : 'black'

  const fetchMessages = useCallback(
    async (reset = false) => {
      if (!hasMore && !reset) return
      if (!local?.conversationId) return

      const limit = 25
      const offset = reset ? 0 : page * limit

      try {
        const result: Messaging.MessagesType = await databases.listDocuments(
          'hp_db',
          'messages',
          [
            Query.equal('conversationId', `${local.conversationId}`),
            Query.orderAsc('$createdAt'),
            Query.limit(limit),
            Query.offset(offset),
          ]
        )

        const newMessages = result.documents

        if (!newMessages) {
          console.error('newMessages is undefined')
          return
        }

        // Sort messages by $createdAt
        newMessages.sort(
          (a, b) =>
            new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime()
        )

        // Fetch user data for any new message senders
        const newParticipants = newMessages.map((msg) => msg.senderId)
        const participantPromises = newParticipants.map(async (userId) => {
          if (getCache && saveCache && !(await getCache('users', userId))) {
            await databases
              .getDocument('hp_db', 'userdata', userId)
              .then((userData) => {
                saveCache('users', userId, userData)
              })
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
    [local?.conversationId, hasMore, page, setMessages, getCache, saveCache]
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
        if (!(await getCache('communities', conversationData.communityId))) {
          await databases
            .getDocument('hp_db', 'community', conversationData.communityId)
            .then((communityData) => {
              saveCache(
                'communities',
                conversationData.communityId,
                communityData
              )
            })
        }
      }

      const messageParticipants = messages.map((msg) => msg.senderId)
      const conversationParticipants = conversationData.participants || []
      const allParticipants = [
        ...new Set([...messageParticipants, ...conversationParticipants]),
      ]

      const participantPromises = allParticipants.map(async (userId) => {
        if (!(await getCache('users', userId))) {
          await databases
            .getDocument('hp_db', 'userdata', userId)
            .then((userData) => {
              saveCache('users', userId, userData)
            })
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
    }
  }, [fetchMessages, local?.conversationId, messages, getCache, saveCache])

  useEffect(() => {
    fetchConversation().then()
  }, [local?.conversationId])

  useEffect(() => {
    const fetchParticipantsData = async () => {
      const promises = participants.map((userId) => {
        if (!getCache('users', userId)) {
          return databases
            .getDocument('hp_db', 'userdata', userId)
            .then((userData) => {
              saveCache('users', userId, userData)
            })
        }
        return Promise.resolve()
      })
      await Promise.all(promises)
    }

    if (participants.length > 0) {
      fetchParticipantsData().then()
    }
  }, [getCache, participants, saveCache])

  /*
  useEffect(() => {
    if (participants.length > 0) {
      Promise.all(participants.map(fetchUserData)).then()
    }
  }, [])
   */

  useFocusEffect(
    useCallback(() => {
      fetchConversation().then()
    }, [])
  )

  const getUserAvatar = (userId: string) => {
    if (!userId) return undefined
    const userCache = getCacheSync<UserData.UserDataDocumentsType>(
      'users',
      userId
    )
    return getAvatarImageUrlPreview(
      userCache?.data?.avatarId,
      'width=100&height=100'
    )
  }

  const getConversationAvatar = () => {
    if (communityId) {
      const communityCache = getCacheSync<Community.CommunityDocumentsType>(
        'communities',
        communityId
      )

      return getCommunityAvatarUrlPreview(
        communityCache?.data?.avatarId,
        'width=100&height=100'
      )
    }
    return getUserAvatar(participants.find((id) => id !== current.$id) || '')
  }

  const getConversationName = () => {
    if (communityId) {
      const communityCache = getCacheSync<Community.CommunityDocumentsType>(
        'communities',
        communityId
      )

      return communityCache?.data?.name
    }
    const userCache = getCacheSync<UserData.UserDataDocumentsType>(
      'users',
      participants.find((id) => id !== current.$id) || ''
    )
    return userCache?.data?.displayName
  }

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      const timeout = setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: false })
      }, 250) // 100 milliseconds delay

      return () => clearTimeout(timeout)
    }
  }, [messages])

  const handleScroll = (event: any) => {
    const { contentOffset } = event.nativeEvent
    if (contentOffset.y <= 0) {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
      setScrollTimeout(
        setTimeout(() => {
          fetchMessages().then(() => {
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

  const sendMessage = async () => {
    //const maxFileSize = 8 * 1024 * 1024 // 8 MB in bytes
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

      const response = JSON.parse(data.responseBody)
      if (response.code === 500) {
        showAlertModal('FAILED', 'An error occurred while sending the message')
        return
      } else if (response.type === 'userchat_user_not_in_conversation') {
        showAlertModal('FAILED', 'You are not in this conversation')
        return
      } else if (response.type === 'userchat_message_sent') {
        // Clear the message and attachments
        setMessageText('')
        setAttachments([])
      }
    } catch (error) {
      // Remove the pending message in case of error
      setMessages((prev) =>
        prev.filter((msg) => msg.$id !== `pending_${Date.now()}`)
      )
      if (error instanceof z.ZodError) {
        showAlertModal('FAILED', error.errors[0].message)
      } else {
        showAlertModal('FAILED', 'An error occurred while sending the message')
        console.error('Error sending message:', error)
      }
    }
  }

  const renderItem = ({ item }) => {
    if (!item) return null
    return <MessageItem message={item} />
  }

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
        <View className={'flex-row p-4 items-center mb-2'}>
          <View className={'flex-1 flex-row items-center px-2'}>
            <Input
              className={'flex-1 mr-2.5'}
              value={messageText}
              onChangeText={setMessageText}
              placeholder="Type a message"
            />
            <Button
              variant={'ghost'}
              size={'icon'}
              onPress={sendMessage}
              className={'active:bg-transparent'}
            >
              <SendIcon color={theme} />
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}
