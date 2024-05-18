import { View } from 'react-native'
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
import AppleIcon from '~/components/icons/AppleIcon'
import DiscordIcon from '~/components/icons/DiscordIcon'
import GithubIcon from '~/components/icons/GithubIcon'
import GoogleIcon from '~/components/icons/GoogleIcon'
import SpotifyIcon from '~/components/icons/SpotifyIcon'
import SocialLoginButton from '~/components/SocialLoginButton'
import * as Linking from 'expo-linking'
import { getQueryParams } from 'expo-auth-session/build/QueryParams'
import { makeRedirectUri } from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'

export default function ModalScreen() {
  const { login, current }: any = useUser()

  const [data, setData] = useState({
    email: '',
    password: '',
  })
  const [currentData, setCurrentData] =
    useState<Models.User<Models.Preferences> | null>(current)

  useEffect(() => {
    setCurrentData(current)
  }, [current])

  useEffect(() => {
    if (currentData) router.push('/account')
  }, [])

  const handleEmailLogin = async () => {
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

  const redirectTo = makeRedirectUri()
  console.log(redirectTo)

  const createSessionFromUrl = async (url: string) => {
    const params = getQueryParams(url)

    if (params.errorCode) throw new Error(params.errorCode)
    const { access_token, refresh_token } = params.params
    console.log(access_token, refresh_token)
    if (!access_token) return
  }

  const handleOAuth2Login = async (provider: OAuthProvider) => {
    try {
      const data = account.createOAuth2Session(
        provider,
        'http://65e2126e0f1d5cc19391.functions.fayevr.dev/createOAuthSession'
      )
      //const dataResponse = Linking.openURL(`${data}`)
      //console.log(dataResponse)
      const res = await WebBrowser.openAuthSessionAsync(`${data}`, redirectTo)

      console.log(res)
      if (res.type === 'success') {
        const { url } = res
        console.log(url)
        await createSessionFromUrl(url)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const url = Linking.useURL()
  console.log({ url })
  if (url) createSessionFromUrl(url).then()

  return (
    <View className="flex-1 justify-center items-center">
      <View className="p-4 native:pb-24 max-w-md gap-6">
        <View className="gap-1">
          <H1 className="text-foreground text-center">Login</H1>
          <Muted className="text-base text-center">
            Enter you data below to register your account
          </Muted>
          <Muted className="text-base text-center">No account yet?</Muted>
          <Button variant={'ghost'} onPress={() => router.push('/register')}>
            <Text>Register</Text>
          </Button>
        </View>
        <Input
          textContentType={'emailAddress'}
          placeholder={'Email'}
          onChangeText={(newEmail) => setData({ ...data, email: newEmail })}
        />
        <Input
          textContentType={'password'}
          placeholder={'Password'}
          secureTextEntry={true}
          onChangeText={(newPassword) =>
            setData({ ...data, password: newPassword })
          }
        />

        <Button onPress={handleEmailLogin}>
          <Text>Login</Text>
        </Button>
        <View className="flex-row items-center gap-3">
          <View className="flex-1 h-px bg-muted" />
          <Muted>OR CONTINUE WITH</Muted>
          <View className="flex-1 h-px bg-muted" />
        </View>
        <View
          className={'flex flex-row flex-wrap gap-2 mx-auto justify-center'}
        >
          <SocialLoginButton
            provider={OAuthProvider.Discord}
            color="#5865F2"
            onPress={() => handleOAuth2Login(OAuthProvider.Discord)}
            Icon={DiscordIcon}
            title="Discord"
          />
          <SocialLoginButton
            provider={OAuthProvider.Apple}
            color="#000000"
            onPress={() => handleOAuth2Login(OAuthProvider.Apple)}
            Icon={AppleIcon}
            title="Apple"
          />
          <SocialLoginButton
            provider={OAuthProvider.Github}
            color="#24292F"
            onPress={() => handleOAuth2Login(OAuthProvider.Github)}
            Icon={GithubIcon}
            title="GitHub"
          />
          <SocialLoginButton
            provider={OAuthProvider.Google}
            color="#131314"
            onPress={() => handleOAuth2Login(OAuthProvider.Google)}
            Icon={GoogleIcon}
            title="Google"
          />
          <SocialLoginButton
            provider={OAuthProvider.Spotify}
            color="#1DB954"
            onPress={() => handleOAuth2Login(OAuthProvider.Spotify)}
            Icon={SpotifyIcon}
            title="Spotify"
          />
        </View>
      </View>
    </View>
  )
}
