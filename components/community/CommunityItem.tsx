import React from 'react'
import { View } from 'react-native'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { Text } from '~/components/ui/text'
import { Community } from '~/lib/types/collections'
import { UserIcon } from 'lucide-react-native'
import { useColorScheme } from '~/lib/useColorScheme'
import { Pressable } from 'react-native-gesture-handler'

// eslint-disable-next-line react/display-name
const CommunityItem = React.memo(
  ({ community }: { community: Community.CommunityDocumentsType }) => {
    const getUserAvatar = (avatarId: string) => {
      if (!avatarId) return require('~/assets/pfp-placeholder.png')
      return `https://api.headpat.place/v1/storage/buckets/community-avatars/files/${avatarId}/preview?project=hp-main&width=250&height=250`
    }
    const { isDarkColorScheme } = useColorScheme()
    const theme = isDarkColorScheme ? 'white' : 'black'

    return (
      <View className="px-4 py-2">
        <Pressable
          onPress={() =>
            router.push({
              pathname: '/community/[communityId]',
              params: { communityId: community?.$id },
            })
          }
        >
          <View className="flex flex-row items-center">
            <Image
              source={
                getUserAvatar(community?.avatarId) ||
                require('~/assets/logos/hp_logo_x512.webp')
              }
              style={{
                width: 80,
                height: 80,
                borderRadius: 20,
              }}
              contentFit={'cover'}
            />
            <View className="ml-4 flex-1">
              <Text className="text-lg font-medium">{community?.name}</Text>
              <Text className="text-sm text-gray-500 mt-1">
                {community?.status}
              </Text>
              <View className="flex flex-row items-center mt-2">
                <UserIcon size={16} color={theme} />
                <Text className="ml-2">{community?.followersCount}</Text>
              </View>
            </View>
          </View>
        </Pressable>
      </View>
    )
  }
)

export default CommunityItem
