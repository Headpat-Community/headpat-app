import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { Link } from 'expo-router'
import { Notifications } from '~/lib/types/collections'
import { Card, CardContent } from '~/components/ui/card'
import { Muted } from '~/components/ui/typography'
import { formatDate } from '~/components/calculateTimeLeft'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Text } from '~/components/ui/text'

// eslint-disable-next-line react/display-name
const NotificationItem = React.memo(
  ({
    notification,
  }: {
    notification: Notifications.NotificationsDocumentsType
  }) => {
    const getUserAvatar = (avatarId: string) => {
      if (!avatarId) return require('~/assets/pfp-placeholder.png')
      return `https://api.headpat.place/v1/storage/buckets/avatars/files/${avatarId}/preview?project=hp-main&width=250&height=250`
    }

    return notification.userData ? (
      <Link
        href={{
          pathname: '/user/(stacks)/[userId]',
          params: { userId: notification.userData.$id },
        }}
        asChild
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
                    {notification.userData.displayName
                      .charAt(0)
                      .toUpperCase() || 'U'}
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
      </Link>
    ) : (
      <Card className={'my-2'}>
        <CardContent className={'pb-0'}>
          <View className={'flex flex-row items-center my-4'}>
            <View className={''}>
              <Avatar alt={'User Avatar'}>
                <AvatarFallback>{'U'}</AvatarFallback>
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
