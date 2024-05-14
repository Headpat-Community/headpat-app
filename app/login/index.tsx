import { View } from 'react-native'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Text } from '~/components/ui/text'
import { H1, Muted } from '~/components/ui/typography'
import { useState } from 'react'
import { account } from '~/lib/appwrite-client'

export default function ModalScreen() {
  const [data, setData] = useState({
    email: '',
    password: '',
  })

  const handleSession = async () => {
    console.log(data)
  }

  const handleOAuth2Login = async (provider: string) => {
    console.log(provider)
    account.createEmailSession(data.email, data.password)
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
            onPress={() => handleOAuth2Login('discord')}
          >
            <Text className={'text-white'}>Discord</Text>
          </Button>
          <Button
            className={'w-32 bg-[#000000] border dark:border-white'}
            onPress={() => handleOAuth2Login('apple')}
          >
            <Text className={'text-white'}>Apple</Text>
          </Button>
          <Button
            className={'w-32 bg-[#24292F] border dark:border-white'}
            onPress={() => handleOAuth2Login('github')}
          >
            <Text className={'text-white'}>Github</Text>
          </Button>
          <Button
            className={'w-32 bg-[#131314] border dark:border-white'}
            onPress={() => handleOAuth2Login('google')}
          >
            <Text className={'text-white'}>Google</Text>
          </Button>
          <Button
            className={'w-32 bg-[#1DB954] border dark:border-white'}
            onPress={() => handleOAuth2Login('spotify')}
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
