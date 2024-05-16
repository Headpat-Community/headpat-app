import { View } from 'react-native'
import { H1, Muted } from '~/components/ui/typography'
import { Button } from '~/components/ui/button'
import { useUser } from '~/components/contexts/UserContext'
import { Text } from '~/components/ui/text'
import { router } from 'expo-router'

export default function AccountPage() {
  const { logout }: any = useUser()

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <View className="flex-1 justify-center items-center">
      <View className="p-4 native:pb-24 max-w-md gap-6">
        <View className="gap-1">
          <H1 className="text-foreground text-center">Account</H1>
          <Muted className="text-base text-center">
            This is the account page
          </Muted>
          <Button onPress={handleLogout}>
            <Text>Logout</Text>
          </Button>
        </View>
      </View>
    </View>
  )
}
