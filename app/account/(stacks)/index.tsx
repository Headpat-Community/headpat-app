import { router } from "expo-router"
import {
  BringToFrontIcon,
  CookieIcon,
  LogOutIcon,
  MegaphoneIcon,
  ShieldAlertIcon,
} from "lucide-react-native"
import { TouchableOpacity, View } from "react-native"
import { useAlertModal } from "~/components/contexts/AlertModalProvider"
import { useUser } from "~/components/contexts/UserContext"
import { Card, CardContent, CardFooter, CardTitle } from "~/components/ui/card"
import { useColorScheme } from "~/lib/useColorScheme"

export default function AccountPage() {
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? "white" : "black"
  const { logout } = useUser()
  const { showAlert } = useAlertModal()

  const handleLogout = async () => {
    try {
      await logout()
      router.dismissAll()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <View className="mx-4 mt-4 gap-4">
      <TouchableOpacity onPress={() => router.push("/account/userprofile")}>
        <Card>
          <CardContent className={"py-8"}>
            <CardFooter className={"flex flex-wrap justify-between p-0"}>
              <CardTitle>User Profile</CardTitle>
              <CardTitle>
                <BringToFrontIcon size={32} color={theme} />
              </CardTitle>
            </CardFooter>
          </CardContent>
        </Card>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/account/security")}>
        <Card>
          <CardContent className={"py-8"}>
            <CardFooter className={"flex flex-wrap justify-between p-0"}>
              <CardTitle>Login & Security</CardTitle>
              <CardTitle>
                <ShieldAlertIcon size={32} color={theme} />
              </CardTitle>
            </CardFooter>
          </CardContent>
        </Card>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => showAlert("INFO", "Coming soon!")}>
        <Card>
          <CardContent className={"py-8"}>
            <CardFooter className={"flex flex-wrap justify-between p-0"}>
              <CardTitle>Privacy & sharing</CardTitle>
              <CardTitle>
                <CookieIcon size={32} color={theme} />
              </CardTitle>
            </CardFooter>
          </CardContent>
        </Card>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => showAlert("INFO", "Coming soon!")}>
        <Card>
          <CardContent className={"py-8"}>
            <CardFooter className={"flex flex-wrap justify-between p-0"}>
              <CardTitle>Notifications</CardTitle>
              <CardTitle>
                <MegaphoneIcon size={32} color={theme} />
              </CardTitle>
            </CardFooter>
          </CardContent>
        </Card>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => void handleLogout()}>
        <Card>
          <CardContent className={"py-8"}>
            <CardFooter className={"flex flex-wrap justify-between p-0"}>
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
