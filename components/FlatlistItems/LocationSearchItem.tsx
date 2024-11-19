import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Text } from '~/components/ui/text'
import { Card, CardContent } from '~/components/ui/card'
import { Community, UserData } from '~/lib/types/collections'
import { CheckIcon, UsersIcon } from 'lucide-react-native'
import {
  getAvatarImageUrlPreview,
  getCommunityAvatarUrlPreview,
} from '~/components/api/getStorageItem'
import { useColorScheme } from '~/lib/useColorScheme'

const LocationSearchItem = React.memo(
  ({
    item,
    isSelected,
    onSelectItem,
  }: {
    item: UserData.UserDataDocumentsType | Community.CommunityDocumentsType
    isSelected: boolean
    onSelectItem: () => void
  }) => {
    console.log(item)
    const { isDarkColorScheme } = useColorScheme()
    const theme = isDarkColorScheme ? 'white' : 'black'
    const isCommunity = !!item?.name

    return (
      <TouchableOpacity onPress={onSelectItem}>
        <Card className={`rounded-none`}>
          <CardContent className={'pt-4 pb-4'}>
            <View className={'flex flex-row items-center'}>
              <View>
                <Avatar
                  style={{ width: 64, height: 64 }}
                  alt={isCommunity ? item.name : item.displayName}
                >
                  <AvatarImage
                    src={
                      isCommunity
                        ? getCommunityAvatarUrlPreview(
                            item?.avatarId,
                            'width=100&height=100'
                          )
                        : getAvatarImageUrlPreview(
                            item?.avatarId,
                            'width=100&height=100'
                          ) || null
                    }
                  />
                  <AvatarFallback>
                    <Text>
                      {isCommunity
                        ? item.name.charAt(0)
                        : item?.displayName?.charAt(0)}
                    </Text>
                  </AvatarFallback>
                </Avatar>
                {isCommunity && (
                  <View className="absolute bottom-0.5 -right-0.5 bg-primary text-primary-foreground rounded-full p-0.5">
                    <UsersIcon size={16} color={'white'} />
                  </View>
                )}
              </View>
              <View className={'flex-row justify-between'}>
                <View className="ml-4 flex-1">
                  <View>
                    <Text className="font-semibold">
                      {isCommunity ? item.name : item.displayName}
                    </Text>
                  </View>
                </View>
                {isSelected && (
                  <View className="ml-4 mr-16">
                    <CheckIcon color={theme} />
                  </View>
                )}
              </View>
            </View>
          </CardContent>
        </Card>
      </TouchableOpacity>
    )
  }
)

LocationSearchItem.displayName = 'LocationSearchItem'

export default LocationSearchItem
