import React from 'react'
import { View, Text } from 'react-native'
import { Button } from '~/components/ui/button'
import { OAuthProvider } from 'react-native-appwrite'
import { IconType } from '~/lib/types/IconTypes'

type SocialLoginButtonProps = {
  provider: OAuthProvider
  color: string
  onPress: () => void
  Icon: IconType
  title: string
}

const SocialLoginButton: React.FC<SocialLoginButtonProps> = ({
  provider,
  color,
  onPress,
  Icon,
  title,
}) => {
  return (
    <Button
      className={`w-32 border dark:border-white`}
      style={{
        backgroundColor: color,
      }}
      onPress={onPress}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <Icon size={16} color={'white'} />
        <Text className={'text-white'}>{title}</Text>
      </View>
    </Button>
  )
}

export default SocialLoginButton
