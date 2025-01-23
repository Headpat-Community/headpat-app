import React from 'react'
import { View, Text } from 'react-native'
import { Button } from '~/components/ui/button'
import { IconType } from '~/lib/types/IconTypes'
import { Image as ExpoImage } from 'expo-image'

type SocialLoginButtonProps = {
  color: string
  onPress: () => void
  Icon?: IconType
  Image?: React.ReactNode
  title: string
}

const SocialLoginButton: React.FC<SocialLoginButtonProps> = ({
  color,
  onPress,
  Icon,
  Image,
  title,
}) => {
  return (
    <Button
      className={`w-36 border dark:border-white`}
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
        {Icon && <Icon size={16} color={'white'} />}
        {Image && (
          <ExpoImage
            source={Image}
            alt={`Eurofurence logo`}
            style={{ width: 16, height: 16, borderRadius: 50 }}
          />
        )}
        <Text className={'text-white'}>{title}</Text>
      </View>
    </Button>
  )
}

export default SocialLoginButton
