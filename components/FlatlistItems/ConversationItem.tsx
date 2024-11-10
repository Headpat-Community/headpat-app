import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { Link } from 'expo-router'
import { UsersIcon } from 'lucide-react-native'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import {
  getAvatarImageUrlPreview,
  getCommunityAvatarUrlPreview,
} from '~/components/api/getStorageItem'
import { Muted } from '../ui/typography'
import { Text } from '~/components/ui/text'
import { Card, CardContent } from '~/components/ui/card'
import { Community, Messaging, UserData } from '~/lib/types/collections'
import { useTimeSince } from '../calculateTimeLeft'

const ConversationItem = React.memo(
  ({
    item,
    displayData,
    isLoading,
  }: {
    item: Messaging.MessageConversationsDocumentsType
    displayData:
      | UserData.UserDataDocumentsType
      | Community.CommunityDocumentsType
    isLoading: boolean
  }) => {
    const isCommunity = !!displayData?.name
    const timeSince = useTimeSince(item?.$updatedAt)

    return (
      <Link
        href={{
          pathname: '/chat/[conversationId]',
          params: { conversationId: item?.$id },
        }}
        asChild
      >
        <TouchableOpacity>
          <Card>
            <CardContent className={'pt-4 pb-4'}>
              <View className={'flex flex-row items-center'}>
                <View>
                  <Avatar
                    style={{ width: 64, height: 64 }}
                    alt={
                      isCommunity ? displayData?.name : displayData?.displayName
                    }
                  >
                    <AvatarImage
                      src={
                        isLoading
                          ? // is required to prevent the avatar from not loading
                            null
                          : isCommunity
                          ? getCommunityAvatarUrlPreview(
                              displayData?.avatarId,
                              'width=100&height=100'
                            )
                          : getAvatarImageUrlPreview(
                              displayData?.avatarId,
                              'width=100&height=100'
                            ) || null
                      }
                    />
                    <AvatarFallback>
                      <Text>
                        {isCommunity
                          ? displayData?.name?.charAt(0)
                          : displayData?.displayName?.charAt(0)}
                      </Text>
                    </AvatarFallback>
                  </Avatar>
                  {isCommunity && (
                    <View className="absolute bottom-0 left-10 bg-primary text-primary-foreground rounded-full p-0.5">
                      <UsersIcon size={16} color={'white'} />
                    </View>
                  )}
                </View>
                <View className={'flex flex-row justify-between'}>
                  <View className="ml-4 flex-1">
                    <View>
                      <Text className="font-semibold">
                        {isCommunity
                          ? displayData?.name
                          : displayData?.displayName}
                      </Text>
                    </View>
                    <Muted className="text-sm">{item?.lastMessage}</Muted>
                  </View>
                  <View className="ml-4 mr-12">
                    <View>
                      <Text className="font-semibold">{timeSince}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </CardContent>
          </Card>
        </TouchableOpacity>
      </Link>
    )
  }
)

ConversationItem.displayName = 'ConversationItem'

export default ConversationItem
