import { Link, Stack } from 'expo-router'
import { View } from 'react-native'
import { Text } from '~/components/ui/text'
import { Image } from 'expo-image'

export default function NotFoundScreen() {
  return (
    <>
      <View className="flex-1 justify-center gap-3 items-center">
        <Image
          source={'./assets/images/headpat_logo.png'}
          style={{ width: 200, height: 200 }}
        />
        <Text className="text-3xl">This page doesn't exist.</Text>
        <View className="h-2" />
        <Link href="/">
          <Text>Go Home</Text>
        </Link>
      </View>
    </>
  )
}
