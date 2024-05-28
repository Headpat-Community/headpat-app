import { TouchableOpacity, View } from 'react-native'
import { useUser } from '~/components/contexts/UserContext'
import { router } from 'expo-router'
import { Card, CardContent, CardFooter, CardTitle } from '~/components/ui/card'
import {
  BringToFrontIcon,
  CookieIcon,
  LogOutIcon,
  MegaphoneIcon,
  ShieldAlertIcon,
} from 'lucide-react-native'
import { useColorScheme } from '~/lib/useColorScheme'
import { toast } from '~/lib/toast'

export default function AccountPage() {
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? 'white' : 'black'
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
    <View className="mx-4 gap-4 mt-4">
      <TouchableOpacity onPress={() => router.push('/account/userprofile')}>
        <Card>
          <CardContent className={'py-8'}>
            <CardFooter className={'p-0 justify-between flex flex-wrap'}>
              <CardTitle>User Profile</CardTitle>
              <CardTitle>
                <BringToFrontIcon size={32} color={theme} />
              </CardTitle>
            </CardFooter>
          </CardContent>
        </Card>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/account/security')}>
        <Card>
          <CardContent className={'py-8'}>
            <CardFooter className={'p-0 justify-between flex flex-wrap'}>
              <CardTitle>Login & Security</CardTitle>
              <CardTitle>
                <ShieldAlertIcon size={32} color={theme} />
              </CardTitle>
            </CardFooter>
          </CardContent>
        </Card>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => toast('Coming soon!')}>
        <Card>
          <CardContent className={'py-8'}>
            <CardFooter className={'p-0 justify-between flex flex-wrap'}>
              <CardTitle>Privacy & sharing</CardTitle>
              <CardTitle>
                <CookieIcon size={32} color={theme} />
              </CardTitle>
            </CardFooter>
          </CardContent>
        </Card>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => toast('Coming soon!')}>
        <Card>
          <CardContent className={'py-8'}>
            <CardFooter className={'p-0 justify-between flex flex-wrap'}>
              <CardTitle>Notifications</CardTitle>
              <CardTitle>
                <MegaphoneIcon size={32} color={theme} />
              </CardTitle>
            </CardFooter>
          </CardContent>
        </Card>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleLogout}>
        <Card>
          <CardContent className={'py-8'}>
            <CardFooter className={'p-0 justify-between flex flex-wrap'}>
              <CardTitle>Logout</CardTitle>
              <CardTitle>
                <LogOutIcon size={32} color={theme} />
              </CardTitle>
            </CardFooter>
          </CardContent>
        </Card>
      </TouchableOpacity>
    </View>
  )
}
