import type { QueryClient } from '@tanstack/react-query'
import { View } from 'react-native'
import { Input } from '~/components/ui/input'
import { Separator } from '~/components/ui/separator'
import { Text } from '~/components/ui/text'
import { H4 } from '~/components/ui/typography'
import type { UserDataDocumentsType } from '~/lib/types/collections'

interface SocialInputProps {
  title: string
  fieldName: keyof Pick<
    UserDataDocumentsType,
    'discordname' | 'telegramname' | 'furaffinityname' | 'X_name' | 'twitchname' | 'blueskyname'
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
              'native:h-12 native:text-lg native:leading-[1.25] h-10 flex-row items-center rounded-md border border-input bg-background px-3 text-base text-foreground file:border-0 file:bg-transparent file:font-medium placeholder:text-muted-foreground lg:text-sm'
            }
          >
            {showAtPrefix && <Text style={{ color: '#A0A0A0' }}>@</Text>}
            <Input
              style={{ flex: 1 }}
              nativeID={fieldName}
              className={'border-0 bg-transparent'}
              textContentType={'name'}
              onChangeText={(text) =>
                queryClient.setQueryData(['user', userId], (old: UserDataDocumentsType) => ({
                  ...old,
                  [fieldName]: text,
                }))
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
