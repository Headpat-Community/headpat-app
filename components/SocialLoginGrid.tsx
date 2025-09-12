import { ImageSource } from 'expo-image'
import { View } from 'react-native'
import { OAuthProvider } from 'react-native-appwrite'
import { Muted } from '~/components/ui/typography'
import { IconType } from '~/lib/types/IconTypes'
import SocialLoginButton from './SocialLoginButton'

interface SocialLoginGridProps {
  onLogin: (provider: OAuthProvider) => void
  buttons: {
    provider: OAuthProvider
    color: string
    Icon?: IconType
    Image?: ImageSource
    title: string
  }[]
}

export function SocialLoginGrid({ onLogin, buttons }: SocialLoginGridProps) {
  return (
    <>
      <View className="flex-row items-center gap-3">
        <View className="flex-1 h-px bg-muted" />
        <Muted>OR CONTINUE WITH</Muted>
        <View className="flex-1 h-px bg-muted" />
      </View>
      <View className="flex flex-row flex-wrap gap-2 mx-auto justify-center w-full">
        {buttons.map((button, index) => (
          <View key={index} className="flex-1 min-w-[45%]">
            <SocialLoginButton
              color={button.color}
              onPress={() => onLogin(button.provider)}
              Icon={button.Icon}
              Image={button.Image}
              title={button.title}
            />
          </View>
        ))}
      </View>
    </>
  )
}
