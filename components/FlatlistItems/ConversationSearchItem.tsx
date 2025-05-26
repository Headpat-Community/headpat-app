import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Text } from '~/components/ui/text'
import { Card, CardContent } from '~/components/ui/card'
import { UserData } from '~/lib/types/collections'
import { functions } from '~/lib/appwrite-client'
import { ExecutionMethod } from 'react-native-appwrite'
import { router } from 'expo-router'

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
        params: { conversationId: response.$id }
      })
    }
  } catch (error) {
    console.error('Error fetching conversation.', error)
  }
}

const ConversationSearchItem = React.memo(
  ({ item }: { item: UserData.UserDataDocumentsType }) => {
    const getUserAvatar = (avatarId: string) => {
      return `${process.env.EXPO_PUBLIC_BACKEND_URL}/v1/storage/buckets/avatars/files/${avatarId}/preview?project=hp-main&width=100&height=100`
    }

    return (
      <TouchableOpacity onPress={() => createConversation(item?.$id)}>
        <Card>
          <CardContent className={'pt-4 pb-4'}>
            <View className={'flex flex-row items-center'}>
              <View>
                <Avatar
                  className="h-16 w-16"
                  alt={item?.displayName || item?.profileUrl}
                >
                  <AvatarImage src={getUserAvatar(item?.avatarId)} />
                  <AvatarFallback>
                    <Text>{item?.displayName?.charAt(0)}</Text>
                  </AvatarFallback>
                </Avatar>
              </View>
              <View className={'flex flex-row justify-between'}>
                <View className="ml-4 flex-1">
                  <View>
                    <Text className="font-semibold">{item?.displayName}</Text>
                  </View>
                </View>
              </View>
            </View>
          </CardContent>
        </Card>
      </TouchableOpacity>
    )
  }
)

ConversationSearchItem.displayName = 'ConversationSearchItem'

export default ConversationSearchItem
