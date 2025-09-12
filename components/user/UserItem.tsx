import React from "react"
import { View } from "react-native"
import { Image } from "expo-image"
import { Text } from "~/components/ui/text"
import { UserDataDocumentsType } from "~/lib/types/collections"
import { Pressable } from "react-native-gesture-handler"
import { router } from "expo-router"

// eslint-disable-next-lin react/display-name
const UserItem = React.memo(({ user }: { user: UserDataDocumentsType }) => {
  const getUserAvatar = (avatarId: string) => {
    if (!avatarId) return require("~/assets/pfp-placeholder.png")
    return `${process.env.EXPO_PUBLIC_BACKEND_URL}/v1/storage/buckets/avatars/files/${avatarId}/preview?project=hp-main&width=250&height=250`
  }

  return (
    <Pressable
      onPress={() => {
        router.push({
          pathname: "/user/(stacks)/[userId]",
          params: { userId: user.$id },
        })
      }}
      style={{ flex: 1 }}
    >
      <View className="items-center p-2" style={{ flex: 1 }}>
        <Image
          source={
            getUserAvatar(user.avatarId ?? "") ??
            require("~/assets/pfp-placeholder.png")
          }
          style={{
            width: 100,
            height: 100,
            borderRadius: 25,
          }}
          contentFit={"cover"}
        />
        <Text
          className="mt-2 text-center"
          numberOfLines={1}
          style={{ width: 100 }}
        >
          {user.displayName}
        </Text>
      </View>
    </Pressable>
  )
})

export default UserItem
