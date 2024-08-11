import React from 'react'
import { TouchableWithoutFeedback, View } from 'react-native'
import { Image } from 'expo-image'
import { Link } from 'expo-router'
import { Text } from '~/components/ui/text'

const UserItem = React.memo(({ user }: any) => {
  const getUserAvatar = (avatarId: string) => {
    if (!avatarId) return require('~/assets/pfp-placeholder.png')
    return `https://api.headpat.de/v1/storage/buckets/avatars/files/${avatarId}/preview?project=6557c1a8b6c2739b3ecf&width=250&height=250`
  }

  return (
    <Link
      href={{
        pathname: '/user/[userId]',
        params: { userId: user.$id },
      }}
      asChild
    >
      <TouchableWithoutFeedback>
        <View
          style={{
            width: '30%',
            margin: '1.66%',
            padding: 10,
            alignItems: 'center',
          }}
        >
          <Image
            source={
              getUserAvatar(user?.avatarId) ||
              require('~/assets/pfp-placeholder.png')
            }
            style={{
              width: 100,
              height: 100,
              borderRadius: 25,
            }}
            contentFit={'cover'}
          />
          <Text className={'text-center mt-2'}>{user?.displayName}</Text>
        </View>
      </TouchableWithoutFeedback>
    </Link>
  )
})

export default UserItem
