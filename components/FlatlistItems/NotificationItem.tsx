import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { Notifications } from '~/lib/types/collections'
import { Card, CardContent } from '~/components/ui/card'
import { Muted } from '~/components/ui/typography'
import { formatDate } from '~/components/calculateTimeLeft'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Text } from '~/components/ui/text'

// eslint-disable-next-line react/display-name
const NotificationItem = React.memo(
  ({
    notification
  }: {
    notification: Notifications.NotificationsDocumentsType
  }) => {
    const getUserAvatar = (avatarId: string) => {
      if (!avatarId) return require('~/assets/pfp-placeholder.png')
      return `${process.env.EXPO_PUBLIC_BACKEND_URL}/v1/storage/buckets/avatars/files/${avatarId}/preview?project=hp-main&width=250&height=250`
    }

    return notification.userData ? (
      <TouchableOpacity
        onPress={() => {
          router.push({
            pathname: '/user/(stacks)/[userId]',
            params: { userId: notification.userData.$id }
          })
        }}
      >
        <Card className={'my-2'}>
          <CardContent className={'pb-0'}>
            <View className={'flex flex-row items-center my-4'}>
              <View className={''}>
                <Avatar alt={'User Avatar'}>
                  <AvatarImage
                    src={getUserAvatar(notification.userData.avatarId) || null}
                  />
                  <AvatarFallback>
                    <Text>
                      {notification.userData.displayName
                        .charAt(0)
                        .toUpperCase() || 'U'}
                    </Text>
                  </AvatarFallback>
                </Avatar>
              </View>
              <View className={'ml-4'}>
                <Text>
                  {notification?.userData?.displayName || 'Someone'} followed
                  you! 🎉
                </Text>
                <Muted>{formatDate(new Date(notification.$createdAt))}</Muted>
              </View>
            </View>
          </CardContent>
        </Card>
      </TouchableOpacity>
    ) : (
      <Card className={'my-2'}>
        <CardContent className={'pb-0'}>
          <View className={'flex flex-row items-center my-4'}>
            <View className={''}>
              <Avatar alt={'User Avatar'}>
                <AvatarFallback>
                  <Text>{'U'}</Text>
                </AvatarFallback>
              </Avatar>
            </View>
            <View className={'ml-4'}>
              <Text>Deleted User followed you! 🎉</Text>
              <Muted>{formatDate(new Date(notification.$createdAt))}</Muted>
            </View>
          </View>
        </CardContent>
      </Card>
    )
  }
)

export default NotificationItem
