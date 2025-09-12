import React, { useCallback, useRef, useState } from 'react'
import { FlatList, View, Platform, KeyboardAvoidingView } from 'react-native'
import { Stack, useLocalSearchParams } from 'expo-router'
import { Text } from '~/components/ui/text'
import { useFocusEffect } from '@react-navigation/core'
import { useUser } from '~/components/contexts/UserContext'
import { useRealtimeChat } from '~/lib/hooks/useRealtimeChat'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'
import { databases, functions } from '~/lib/appwrite-client'
import { Community, Messaging, UserData } from '~/lib/types/collections'
import { ExecutionMethod, Query } from 'react-native-appwrite'
import MessageItem from '~/components/FlatlistItems/MessageItem'
import { Input } from '~/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import {
  getAvatarImageUrlPreview,
  getCommunityAvatarUrlPreview
} from '~/components/api/getStorageItem'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import { SendIcon } from 'lucide-react-native'
import { useColorScheme } from '~/lib/useColorScheme'
import { captureException } from '@sentry/react-native'
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query'

const schema = z.object({
  message: z
    .string()
    .trim()
    .max(2048, 'Message: Max length is 2048')
    .min(1, 'Message: Min length is 1'),
  attachments: z.array(z.instanceof(File)).optional()
})

const MESSAGES_PER_PAGE = 1000

export default function ChatView() {
  const local = useLocalSearchParams()
  const { current } = useUser()
  const { messages, setMessages } = useRealtimeChat()
  const { showAlert } = useAlertModal()
  const [messageText, setMessageText] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const [initialScrollDone, setInitialScrollDone] = useState(false)
  const [scrollTimeout, setScrollTimeout] = useState<NodeJS.Timeout | null>(
    null
  )
  const flatListRef = useRef<FlatList>(null)
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? 'white' : 'black'
  const queryClient = useQueryClient()

  const { data: conversationData, isLoading: isLoadingConversation } = useQuery(
    {
      queryKey: ['conversation', local?.conversationId],
      queryFn: async () => {
        const data: Messaging.MessageConversationsDocumentsType =
          await databases.getDocument(
            'hp_db',
            'messages-conversations',
            `${local?.conversationId}`
          )
        return data
      },
      enabled: !!local?.conversationId
    }
  )

  const {
    data: messagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['messages', local?.conversationId],
    queryFn: async ({ pageParam = 0 }) => {
      const result = await databases.listDocuments('hp_db', 'messages', [
        Query.equal('conversationId', `${local?.conversationId}`),
        Query.orderAsc('$createdAt'),
        Query.limit(MESSAGES_PER_PAGE),
        Query.offset(pageParam * MESSAGES_PER_PAGE)
      ])
      return result.documents as unknown as Messaging.MessagesDocumentsType[]
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === MESSAGES_PER_PAGE
        ? allPages.length * MESSAGES_PER_PAGE
        : undefined
    },
    initialPageParam: 0,
    enabled: !!local?.conversationId
  })

  const { data: communityData } = useQuery({
    queryKey: ['community', conversationData?.communityId],
    queryFn: async () => {
      if (!conversationData?.communityId) return null
      const data = await databases.getDocument(
        'hp_db',
        'community',
        conversationData.communityId
      )
      return data as unknown as Community.CommunityDocumentsType
    },
    enabled: !!conversationData?.communityId
  })

  const { data: otherUserData } = useQuery({
    queryKey: [
      'user',
      conversationData?.participants?.find((id) => id !== current.$id)
    ],
    queryFn: async () => {
      const otherUserId = conversationData?.participants?.find(
        (id) => id !== current.$id
      )
      if (!otherUserId) return null
      const data: UserData.UserDataDocumentsType = await databases.getDocument(
        'hp_db',
        'userdata',
        otherUserId
      )
      return data
    },
    enabled: !!conversationData?.participants?.find((id) => id !== current.$id)
  })

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: {
      message: string
      attachments: File[]
      messageType: string
    }) => {
      let endpointUrl = `/user/chat/message?conversationId=${local?.conversationId}`
      if (!conversationData?.communityId) {
        const recipientId = conversationData?.participants?.find(
          (id) => id !== current.$id
        )
        if (recipientId) {
          endpointUrl += `&recipientId=${recipientId}`
        }
      }

      const data = await functions.createExecution(
        'user-endpoints',
        JSON.stringify(messageData),
        false,
        endpointUrl,
        ExecutionMethod.POST
      )
      return JSON.parse(data.responseBody)
    },
    onSuccess: (response) => {
      if (response.code === 500) {
        showAlert('FAILED', 'An error occurred while sending the message')
      } else if (response.type === 'userchat_user_not_in_conversation') {
        showAlert('FAILED', 'You are not in this conversation')
      } else if (response.type === 'userchat_message_sent') {
        setMessageText('')
        setAttachments([])
        queryClient.invalidateQueries({
          queryKey: ['messages', local?.conversationId]
        })
      }
    },
    onError: (error) => {
      captureException(error)
      showAlert('FAILED', 'An error occurred while sending the message')
    }
  })

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({
        queryKey: ['conversation', local?.conversationId]
      })
      queryClient.invalidateQueries({
        queryKey: ['messages', local?.conversationId]
      })
    }, [local?.conversationId, queryClient])
  )

  const getConversationAvatar = () => {
    if (conversationData?.communityId) {
      return getCommunityAvatarUrlPreview(
        communityData?.avatarId,
        'width=100&height=100'
      )
    }
    return getAvatarImageUrlPreview(
      otherUserData?.avatarId,
      'width=100&height=100'
    )
  }

  const getConversationName = () => {
    if (conversationData?.communityId) {
      return communityData?.name
    }
    return otherUserData?.displayName
  }

  const handleScroll = (event: any) => {
    const { contentOffset } = event.nativeEvent
    if (contentOffset.y <= 0) {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
      setScrollTimeout(
        setTimeout(() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
          }
        }, 100)
      )
    }
  }

  const sendMessage = async () => {
    try {
      schema.parse({ message: messageText, attachments })

      // Create a pending message
      const pendingMessage: Messaging.MessagesDocumentsType = {
        $id: `pending_${Date.now()}`,
        body: messageText,
        senderId: current.$id || '',
        conversationId: `${local?.conversationId}`,
        messageType: 'text',
        attachments: [],
        $collectionId: 'messages',
        $databaseId: 'hp_db',
        $permissions: [],
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
        $sequence: 0
      }
      setMessages((prev) => [...prev, pendingMessage])

      await sendMessageMutation.mutateAsync({
        message: messageText,
        attachments: [],
        messageType: 'text'
      })

      // Remove the pending message
      setMessages((prev) =>
        prev.filter((msg) => msg.$id !== pendingMessage.$id)
      )
    } catch (error) {
      if (error instanceof z.ZodError) {
        showAlert('FAILED', error.errors[0].message)
      } else {
        captureException(error)
        showAlert('FAILED', 'An error occurred while sending the message')
      }
    }
  }

  const renderItem = ({ item }) => {
    if (!item) return null
    return <MessageItem message={item} />
  }

  const allMessages = messagesData?.pages.flat() || []

  return (
    <View className={'flex-1'}>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <View className={'flex flex-row items-center'}>
              <Avatar alt={'Avatar'}>
                <AvatarImage
                  source={{
                    uri: getConversationAvatar()
                  }}
                  style={{ width: 32, height: 32, borderRadius: 50 }}
                />
                <AvatarFallback>
                  <Text>{getConversationName()}</Text>
                </AvatarFallback>
              </Avatar>
              <Text style={{ marginLeft: 8, fontSize: 16 }}>
                {getConversationName()}
              </Text>
            </View>
          )
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={[...messages, ...allMessages]}
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
              disabled={sendMessageMutation.isPending}
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
