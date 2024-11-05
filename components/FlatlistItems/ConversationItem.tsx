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
import { Community, UserData } from '~/lib/types/collections'
import { timeSince } from '~/components/calculateTimeLeft'

const ConversationItem = React.memo(
  ({
    displayData,
  }: {
    displayData:
      | UserData.UserDataDocumentsType
      | Community.CommunityDocumentsType
  }) => {
    const isCommunity = !!displayData?.name

    return (
      <Link
        href={{
          pathname: '/chat/(main)/[conversationId]',
          params: { conversationId: displayData?.$id },
        }}
        asChild
      >
        <TouchableOpacity>
          <Card>
            <CardContent className={'pt-4 pb-4'}>
              <View className={'flex flex-row items-center'}>
                <View>
                  <Avatar
                    className="h-16 w-16"
                    alt={
                      isCommunity ? displayData?.name : displayData?.displayName
                    }
                  >
                    <AvatarImage
                      src={
                        isCommunity
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
                    <Muted className="text-sm">
                      {displayData?.lastMessage}
                    </Muted>
                  </View>
                  <View className="ml-4 mr-12">
                    <View>
                      <Text className="font-semibold">
                        {timeSince(displayData?.$updatedAt)}
                      </Text>
                    </View>
                    <Muted className="text-sm">
                      {displayData?.lastMessage}
                    </Muted>
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
