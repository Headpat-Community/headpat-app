import React from 'react'
import { TouchableWithoutFeedback, View } from 'react-native'
import { Image } from 'expo-image'
import { Link } from 'expo-router'
import { Text } from '~/components/ui/text'
import { UserData } from '~/lib/types/collections'

const UserItem = React.memo(
  ({ user }: { user: UserData.UserDataDocumentsType }) => {
    const getUserAvatar = (avatarId: string) => {
      if (!avatarId) return require('~/assets/pfp-placeholder.png')
      return `https://api.headpat.place/v1/storage/buckets/avatars/files/${avatarId}/preview?project=hp-main&width=250&height=250`
    }

    return (
      <Link
        href={{
          pathname: '/user/(stacks)/[userId]',
          params: { userId: user.$id },
        }}
        asChild
      >
        <TouchableWithoutFeedback>
          <View className={'w-[30%] m-[1.66%] p-2.5 items-center'}>
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
  }
)

export default UserItem
