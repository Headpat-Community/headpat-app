import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { Link } from 'expo-router'
import { Notifications } from '~/lib/types/collections'
import { ClockIcon } from 'lucide-react-native'
import { useColorScheme } from '~/lib/useColorScheme'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from '~/components/ui/card'
import { Muted } from '~/components/ui/typography'
import { formatDate } from '~/components/calculateTimeLeft'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Text } from '~/components/ui/text'

const CommunityItem = React.memo(
  ({
    notification,
  }: {
    notification: Notifications.NotificationsDocumentsType
  }) => {
    const getUserAvatar = (avatarId: string) => {
      if (!avatarId) return require('~/assets/pfp-placeholder.png')
      return `https://api.headpat.place/v1/storage/buckets/avatars/files/${avatarId}/preview?project=hp-main&width=250&height=250`
    }
    const { isDarkColorScheme } = useColorScheme()
    const theme = isDarkColorScheme ? 'white' : 'black'

    return (
      <Link
        href={{
          pathname: '/user/(stacks)/[userId]',
          params: { userId: notification.userData.$id },
        }}
        asChild
      >
        <TouchableOpacity>
          <Card>
            <CardContent className={'pb-0'}>
              <View className={'flex flex-row items-center my-4'}>
                <Avatar alt={'User Avatar'}>
                  <AvatarImage
                    src={getUserAvatar(notification.userData.avatarId) || null}
                  />
                  <AvatarFallback>
                    {notification.userData.displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Muted className={'ml-4'}>
                  {notification?.userData?.displayName || 'Someone'} followed
                  you! 🎉
                </Muted>
              </View>
            </CardContent>
          </Card>
        </TouchableOpacity>
      </Link>
    )
  }
)

export default CommunityItem
