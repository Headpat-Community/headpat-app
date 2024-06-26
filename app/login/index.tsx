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
import { makeRedirectUri } from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'
import * as Sentry from '@sentry/react-native'

export default function ModalScreen() {
  const { current, login, loginOAuth } = useUser()

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
    if (currentData) router.navigate('/account')
  }, [currentData])

  const handleEmailLogin = async () => {
    if (data.email.length < 1) {
      toast('E-Mail is required')
      return
    }
    if (data.password.length < 8) {
      toast('Password should be at least 8 characters')
      return
    }

    try {
      await login(data.email, data.password)
      router.navigate('/account')
    } catch (error) {
      if (error.type === 'user_invalid_credentials') {
        toast('E-Mail or Password incorrect.')
      } else if (error.type === 'user_blocked') {
        toast('User is blocked.')
      } else {
        toast('E-Mail or Password incorrect.')
      }
    }
  }

  WebBrowser.maybeCompleteAuthSession()
  const redirectTo = makeRedirectUri()
  const redirect = redirectTo.includes('exp://')
    ? redirectTo
    : `${redirectTo}headpatapp`

  const handleOAuth2Login = async (provider: OAuthProvider) => {
    try {
      const data = account.createOAuth2Token(provider, `${redirect}`)
      const res = await WebBrowser.openAuthSessionAsync(
        `${data}`,
        `${redirect}`
      )

      if (res.type === 'success') {
        const { url } = res
        const urlWithoutFragment = url.split('#')[0]

        const params = new URLSearchParams(urlWithoutFragment.split('?')[1])
        const secret = params.get('secret')
        const userId = params.get('userId')

        await loginOAuth(userId, secret)
        router.navigate('/account')
      }
    } catch (error) {
      toast('An error occurred.')
      Sentry.captureException(error)
    }
  }

  return (
    <View className="flex-1 justify-center items-center">
      <View className="p-4 native:pb-24 max-w-md gap-6">
        <View className="gap-1">
          <H1 className="text-foreground text-center">Login</H1>
          <Muted className="text-base text-center">
            Enter you data below to register your account
          </Muted>
          <Muted className="text-base text-center">No account yet?</Muted>
          <Button
            variant={'ghost'}
            onPress={() => router.navigate('/register')}
          >
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
