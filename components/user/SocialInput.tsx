import React from 'react'
import { View } from 'react-native'
import { Text } from '~/components/ui/text'
import { Input } from '~/components/ui/input'
import { H4 } from '~/components/ui/typography'
import { Separator } from '~/components/ui/separator'
import { UserData } from '~/lib/types/collections'
import { QueryClient } from '@tanstack/react-query'

interface SocialInputProps {
  title: string
  fieldName: keyof Pick<
    UserData.UserDataDocumentsType,
    | 'discordname'
    | 'telegramname'
    | 'furaffinityname'
    | 'X_name'
    | 'twitchname'
    | 'blueskyname'
  >
  value: string
  userId: string
  queryClient: QueryClient
  showAtPrefix?: boolean
}

export default function SocialInput({
  title,
  fieldName,
  value,
  userId,
  queryClient,
  showAtPrefix = true,
}: SocialInputProps) {
  return (
    <>
      <View className={'w-full gap-4'}>
        <View>
          <H4>{title}</H4>
        </View>
        <Separator className={'w-[100px]'} />
        <View>
          <View
            className={
              'flex-row items-center h-10 native:h-12 rounded-md border border-input bg-background px-3 text-base lg:text-sm native:text-lg native:leading-[1.25] text-foreground placeholder:text-muted-foreground file:border-0 file:bg-transparent file:font-medium'
            }
          >
            {showAtPrefix && <Text style={{ color: '#A0A0A0' }}>@</Text>}
            <Input
              style={{ flex: 1 }}
              nativeID={fieldName}
              className={'border-0 bg-transparent'}
              textContentType={'name'}
              onChangeText={(text) =>
                queryClient.setQueryData(
                  ['user', userId],
                  (old: UserData.UserDataDocumentsType) => ({
                    ...old,
                    [fieldName]: text,
                  })
                )
              }
              value={value}
            />
          </View>
        </View>
      </View>
      <Separator />
    </>
  )
}
