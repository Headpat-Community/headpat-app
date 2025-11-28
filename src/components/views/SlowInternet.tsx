import { View } from 'react-native'
import { H1, Muted } from '~/components/ui/typography'
import React from 'react'
import { i18n } from '~/components/system/i18n'

export default function SlowInternet() {
  return (
    <View className={'flex-1 justify-center items-center'}>
      <View className={'p-4 native:pb-24 max-w-md gap-6'}>
        <View className={'gap-1'}>
          <H1 className={'text-foreground text-center'}>
            {i18n.t('main.loading')}
          </H1>
          <Muted className={'text-base text-center'}>
            Looks like you have some slow internet.. Please wait.
          </Muted>
        </View>
      </View>
    </View>
  )
}
