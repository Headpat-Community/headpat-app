import React from "react"
import { TouchableOpacity, View } from "react-native"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Text } from "~/components/ui/text"
import { Card, CardContent } from "~/components/ui/card"
import {
  CommunityDocumentsType,
  UserDataDocumentsType,
} from "~/lib/types/collections"
import { UsersIcon, X } from "lucide-react-native"
import {
  getAvatarImageUrlPreview,
  getCommunityAvatarUrlPreview,
} from "~/components/api/getStorageItem"

const ConfirmSharingItem = React.memo(
  ({
    item,
    onRemove,
  }: {
    item: UserDataDocumentsType | CommunityDocumentsType
    onRemove: () => void
  }) => {
    const isCommunity = !!(item as CommunityDocumentsType).name

    return (
      <Card className={`rounded-none`}>
        <CardContent className={"pb-4 pt-4"}>
          <View className={"flex flex-row items-center"}>
            <View>
              <Avatar
                style={{ width: 64, height: 64 }}
                alt={
                  isCommunity
                    ? (item as CommunityDocumentsType).name
                    : (item as UserDataDocumentsType).displayName
                }
              >
                <AvatarImage
                  src={
                    isCommunity
                      ? getCommunityAvatarUrlPreview(
                          item.avatarId ?? "",
                          "width=100&height=100"
                        )
                      : getAvatarImageUrlPreview(
                          item.avatarId ?? "",
                          "width=100&height=100"
                        ) || undefined
                  }
                />
                <AvatarFallback>
                  <Text>
                    {isCommunity
                      ? (item as CommunityDocumentsType).name.charAt(0)
                      : (item as UserDataDocumentsType).displayName.charAt(0)}
                  </Text>
                </AvatarFallback>
              </Avatar>
              {isCommunity && (
                <View className="absolute -right-0.5 bottom-0.5 rounded-full bg-primary p-0.5 text-primary-foreground">
                  <UsersIcon size={16} color={"white"} />
                </View>
              )}
            </View>
            <View className={"flex-row justify-between"}>
              <View className="ml-4 flex-1">
                <View>
                  <Text className="font-semibold">
                    {isCommunity
                      ? (item as CommunityDocumentsType).name
                      : (item as UserDataDocumentsType).displayName}
                  </Text>
                </View>
              </View>
              <TouchableOpacity className="ml-4 mr-16" onPress={onRemove}>
                <X size={24} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        </CardContent>
      </Card>
    )
  }
)

ConfirmSharingItem.displayName = "ConfirmSharingItem"

export default ConfirmSharingItem
