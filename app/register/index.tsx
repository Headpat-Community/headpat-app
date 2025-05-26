import { Linking, View } from 'react-native'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Text } from '~/components/ui/text'
import { H1, Muted } from '~/components/ui/typography'
import { useEffect, useState } from 'react'
import { account } from '~/lib/appwrite-client'
import { useUser } from '~/components/contexts/UserContext'
import { router } from 'expo-router'
import { OAuthProvider } from 'react-native-appwrite'
import { makeRedirectUri } from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'
import * as Sentry from '@sentry/react-native'
import MicrosoftIcon from '~/components/icons/MicrosoftIcon'
import TwitchIcon from '~/components/icons/TwitchIcon'
import FeatureAccess from '~/components/FeatureAccess'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'
import { SocialLoginGrid } from '~/components/SocialLoginGrid'
import DiscordIcon from '~/components/icons/DiscordIcon'
import AppleIcon from '~/components/icons/AppleIcon'
import GithubIcon from '~/components/icons/GithubIcon'
import GoogleIcon from '~/components/icons/GoogleIcon'
import SpotifyIcon from '~/components/icons/SpotifyIcon'
import { ScrollView } from 'react-native-gesture-handler'
import { z } from 'zod'

const registerSchema = z.object({
  username: z.string().min(3, 'Username should be at least 3 characters'),
  email: z.string().min(1, 'E-Mail is required').email('Invalid email format'),
  password: z.string().min(8, 'Password should be at least 8 characters')
})

export default function RegisterScreen() {
  const { current, loginOAuth, register } = useUser()
  const { showAlert } = useAlertModal()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')

  useEffect(() => {
    if (current) {
      router.push('/account')
    }
    // Don't add current, as it will cause user to be redirected to account page twice after login
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleEmailLogin = async () => {
    try {
      const validatedData = registerSchema.parse({
        email,
        password,
        username
      })
      await register(
        validatedData.email,
        validatedData.password,
        validatedData.username
      )
      router.push('/account')
    } catch (error) {
      Sentry.captureException(error)

      if (error instanceof z.ZodError) {
        showAlert('FAILED', error.errors[0].message)
      } else if (error.type === 'general_argument_invalid') {
        showAlert('FAILED', 'Invalid E-Mail or password.')
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
        router.push('/account')
      }
    } catch (error) {
      showAlert('FAILED', 'An error occurred.')
      Sentry.captureException(error)
    }
  }

  return (
    <FeatureAccess featureName={'register'}>
      <ScrollView>
        <View className="flex-1 justify-center items-center">
          <View className="p-4 native:pb-24 max-w-md gap-6">
            <View className="gap-1">
              <Muted className="text-base text-center">
                Enter you data below to create an account
              </Muted>
              <Muted className="text-base text-center">
                Already have an account?
              </Muted>
              <Button
                variant={'outline'}
                onPress={() => router.replace('/login')}
              >
                <Text>Login</Text>
              </Button>
            </View>
            <Input
              textContentType={'username'}
              placeholder={'Username'}
              onChangeText={setUsername}
            />
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
              maxLength={256}
            />

            <Button onPress={handleEmailLogin}>
              <Text>Register</Text>
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

            <View>
              <Muted className="text-center">
                By creating an account, you agree to our{' '}
                <Muted
                  className="underline"
                  onPress={() =>
                    Linking.openURL(
                      'https://headpat.place/legal/termsofservice.pdf'
                    )
                  }
                >
                  Terms of Service
                </Muted>{' '}
                and{' '}
                <Muted
                  className="underline"
                  onPress={() =>
                    Linking.openURL('https://headpat.place/legal/privacypolicy')
                  }
                >
                  Privacy Policy
                </Muted>
              </Muted>
            </View>
          </View>
        </View>
      </ScrollView>
    </FeatureAccess>
  )
}
