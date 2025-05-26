import { View } from 'react-native'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Text } from '~/components/ui/text'
import { H1, Muted } from '~/components/ui/typography'
import React from 'react'
import { account } from '~/lib/appwrite-client'
import { useUser } from '~/components/contexts/UserContext'
import { router } from 'expo-router'
import { OAuthProvider } from 'react-native-appwrite'
import AppleIcon from '~/components/icons/AppleIcon'
import DiscordIcon from '~/components/icons/DiscordIcon'
import GithubIcon from '~/components/icons/GithubIcon'
import GoogleIcon from '~/components/icons/GoogleIcon'
import SpotifyIcon from '~/components/icons/SpotifyIcon'
import TwitchIcon from '~/components/icons/TwitchIcon'
import MicrosoftIcon from '~/components/icons/MicrosoftIcon'
import { makeRedirectUri } from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'
import * as Sentry from '@sentry/react-native'
import { useFocusEffect } from '@react-navigation/core'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'
import { ScrollView } from 'react-native-gesture-handler'
import { SocialLoginGrid } from '~/components/SocialLoginGrid'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().min(1, 'E-Mail is required').email('Invalid email format'),
  password: z.string().min(8, 'Password should be at least 8 characters')
})

export default function LoginScreen() {
  const { current, login, loginOAuth } = useUser()
  const { showAlert } = useAlertModal()

  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')

  useFocusEffect(
    React.useCallback(() => {
      if (current) {
        router.back()
      }
    }, [current])
  )

  const handleEmailLogin = async () => {
    try {
      const validatedData = loginSchema.parse({
        email,
        password
      })
      await login(validatedData.email, validatedData.password)
    } catch (error) {
      if (error instanceof z.ZodError) {
        showAlert('FAILED', error.errors[0].message)
      } else if (error.type === 'user_invalid_credentials') {
        showAlert('FAILED', 'E-Mail or Password incorrect.')
      } else if (error.type === 'user_blocked') {
        showAlert('FAILED', 'User is blocked.')
      } else {
        showAlert('FAILED', 'E-Mail or Password incorrect.')
      }
    }
  }

  WebBrowser.maybeCompleteAuthSession()
  const redirectTo = makeRedirectUri()
  const redirect = redirectTo.includes('exp://')
    ? redirectTo
    : `${redirectTo}headpat.app`

  const handleOAuth2Login = async (provider: OAuthProvider) => {
    try {
      const data = account.createOAuth2Token(provider, `${redirect}`)
      const res = await WebBrowser.openAuthSessionAsync(
        `${data}`,
        `${redirectTo}`
      )

      if (res.type === 'success') {
        const { url } = res
        const urlWithoutFragment = url.split('#')[0]

        const params = new URLSearchParams(urlWithoutFragment.split('?')[1])
        const secret = params.get('secret')
        const userId = params.get('userId')

        await loginOAuth(userId, secret)
        router.replace('/')
      }
    } catch (error) {
      showAlert('FAILED', 'An error occurred.')
      Sentry.captureException(error)
    }
  }

  return (
    <ScrollView>
      <View className="flex-1 justify-center items-center">
        <View className="p-4 native:pb-24 max-w-md gap-4">
          <View className="gap-1">
            <Muted className="text-base text-center">
              Enter you data below to login your account
            </Muted>
            <Muted className="text-base text-center">No account yet?</Muted>
            <Button
              variant={'outline'}
              onPress={() => router.replace('/register')}
            >
              <Text>Register</Text>
            </Button>
          </View>
          <Input
            textContentType={'emailAddress'}
            placeholder={'Email'}
            onChangeText={setEmail}
          />
          <Input
            textContentType={'password'}
            placeholder={'Password'}
            secureTextEntry={true}
            onChangeText={setPassword}
          />

          <Button onPress={handleEmailLogin}>
            <Text>Login</Text>
          </Button>

          <SocialLoginGrid
            onLogin={handleOAuth2Login}
            buttons={[
              {
                provider: OAuthProvider.Discord,
                color: '#5865F2',
                Icon: DiscordIcon,
                title: 'Discord'
              },
              {
                provider: OAuthProvider.Oidc,
                color: '#005953',
                Image: require('~/assets/logos/eurofurence.webp'),
                title: 'Eurofurence'
              },
              {
                provider: OAuthProvider.Github,
                color: '#24292F',
                Icon: GithubIcon,
                title: 'GitHub'
              },
              {
                provider: OAuthProvider.Apple,
                color: '#000000',
                Icon: AppleIcon,
                title: 'Apple'
              },
              {
                provider: OAuthProvider.Google,
                color: '#131314',
                Icon: GoogleIcon,
                title: 'Google'
              },
              {
                provider: OAuthProvider.Spotify,
                color: '#1DB954',
                Icon: SpotifyIcon,
                title: 'Spotify'
              },
              {
                provider: OAuthProvider.Microsoft,
                color: '#01A6F0',
                Icon: MicrosoftIcon,
                title: 'Microsoft'
              },
              {
                provider: OAuthProvider.Twitch,
                color: '#6441A5',
                Icon: TwitchIcon,
                title: 'Twitch'
              }
            ]}
          />
        </View>
      </View>
    </ScrollView>
  )
}
