import React from 'react'
import { TouchableWithoutFeedback, View } from 'react-native'
import { Image } from 'expo-image'
import { Link } from 'expo-router'
import { Text } from '~/components/ui/text'
import { Community } from '~/lib/types/collections'
import { UserIcon } from 'lucide-react-native'
import { useColorScheme } from '~/lib/useColorScheme'

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
      <Link
        href={{
          pathname: '/community/[communityId]',
          params: { communityId: community?.$id },
        }}
        asChild
      >
        <TouchableWithoutFeedback>
          <View className={'px-4 m-4 w-full flex flex-row items-center'}>
            <Image
              source={
                getUserAvatar(community?.avatarId) ||
                require('../../assets/images/headpat_logo.png')
              }
              style={{
                width: 100,
                height: 100,
                borderRadius: 25,
              }}
              contentFit={'cover'}
            />
            <View className={'flex flex-col gap-3 ml-6'}>
              <Text className={'font-bold'}>{community?.name}</Text>
              <Text className={''}>{community?.status}</Text>
              <View className={'flex flex-row items-center gap-4'}>
                <View className={'flex flex-row items-center gap-2'}>
                  <UserIcon color={theme} />
                  <Text className={'flex items-center gap-2'}>
                    {community?.followersCount}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Link>
    )
  }
)

export default CommunityItem
