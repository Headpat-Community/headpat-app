import { Linking, View } from 'react-native'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Text } from '~/components/ui/text'
import { H1, Muted } from '~/components/ui/typography'
import { useEffect, useState } from 'react'
import { account } from '~/lib/appwrite-client'
import { useUser } from '~/components/contexts/UserContext'
import { router } from 'expo-router'
import { Models, OAuthProvider } from 'react-native-appwrite'
import { toast } from '~/lib/toast'
import WebView from 'react-native-webview'

export default function ModalScreen() {
  const { login, current }: any = useUser()
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)

  const [data, setData] = useState({
    email: '',
    password: '',
    username: '',
  })
  const [currentData, setCurrentData] =
    useState<Models.User<Models.Preferences> | null>(current)

  useEffect(() => {
    setCurrentData(current)
  }, [current])

  useEffect(() => {
    if (currentData) router.push('/account')
  }, [])

  const handleSession = async () => {
    try {
      await login(data.email, data.password)
      router.push('/account')
    } catch (error) {
      console.log(error.type, error.message)
      if (error.type == 'user_invalid_credentials') {
        toast('E-Mail or Password incorrect.')
      } else if (error.type == 'user_blocked') {
        toast('User is blocked.')
      } else {
        toast('E-Mail or Password incorrect.')
      }
    }
  }

  const MyWebComponent = () => {
    return (
      <WebView
        source={{ uri: 'https://reactnative.dev/' }}
        style={{ flex: 1 }}
      />
    )
  }

  const handleOAuth2Login = (provider: OAuthProvider) => {
    try {
      const data = account.createOAuth2Session(provider)
      return Linking.openURL(`${data}`)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <View className="flex-1 justify-center items-center">
      <View className="p-4 native:pb-24 max-w-md gap-6">
        <View className="gap-1">
          <H1 className="text-foreground text-center">Login</H1>
          <Muted className="text-base text-center">
            Enter you email below to login your account
          </Muted>
        </View>
        <Input
          textContentType={'emailAddress'}
          placeholder={'Email'}
          onChangeText={(newText) => setData({ ...data, email: newText })}
        />
        <Input
          textContentType={'password'}
          placeholder={'Password'}
          secureTextEntry={true}
          onChangeText={(newPassword) =>
            setData({ ...data, password: newPassword })
          }
        />

        <Button onPress={handleSession}>
          <Text>Login</Text>
        </Button>
        <View className="flex-row items-center gap-3">
          <View className="flex-1 h-px bg-muted" />
          <Muted>OR CONTINUE WITH</Muted>
          <View className="flex-1 h-px bg-muted" />
        </View>
        <View
          className={'flex flex-row flex-wrap p-2 gap-2 mx-auto justify-center'}
        >
          <Button
            className={'w-32 bg-[#5865F2] border dark:border-white'}
            onPress={() => handleOAuth2Login(OAuthProvider.Discord)}
          >
            <Text className={'text-white'}>Discord</Text>
          </Button>
          <Button
            className={'w-32 bg-[#000000] border dark:border-white'}
            onPress={() => handleOAuth2Login(OAuthProvider.Apple)}
          >
            <Text className={'text-white'}>Apple</Text>
          </Button>
          <Button
            className={'w-32 bg-[#24292F] border dark:border-white'}
            onPress={() => handleOAuth2Login(OAuthProvider.Github)}
          >
            <Text className={'text-white'}>Github</Text>
          </Button>
          <Button
            className={'w-32 bg-[#131314] border dark:border-white'}
            onPress={() => handleOAuth2Login(OAuthProvider.Google)}
          >
            <Text className={'text-white'}>Google</Text>
          </Button>
          <Button
            className={'w-32 bg-[#1DB954] border dark:border-white'}
            onPress={() => handleOAuth2Login(OAuthProvider.Spotify)}
          >
            <Text className={'text-white'}>Spotify</Text>
          </Button>
        </View>
        <View>
          <Muted className="text-center">
            By creating an account, you agree to our{' '}
            <Muted className="underline">Terms of Service</Muted> and{' '}
            <Muted className="underline">Privacy Policy</Muted>
          </Muted>
        </View>
      </View>
    </View>
  )
}
