import { Link, Stack } from 'expo-router'
import { View } from 'react-native'
import { Text } from '~/components/ui/text'
import { Image } from 'expo-image'

export default function NotFoundScreen() {
  const blurhash =
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj['

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
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
