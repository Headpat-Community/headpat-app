import { useTranslations } from 'gt-react-native'
import { View } from 'react-native'
import { H1, Muted } from '~/components/ui/typography'

export default function DoesNotExist() {
  const t = useTranslations()
  return (
    <View className={'flex-1 items-center justify-center'}>
      <View className={'native:pb-24 max-w-md gap-6 p-4'}>
        <View className={'gap-1'}>
          <H1 className={'text-center text-foreground'}>{t('main.doesNotExist')}</H1>
          <Muted className={'text-center text-base'}>{t('main.doesNotExistDescription')}</Muted>
        </View>
      </View>
    </View>
  )
}
