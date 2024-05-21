import { View } from 'react-native'
import { H1, Muted } from '~/components/ui/typography'

export default function CommunitiesPage() {
  return (
    <View className={'flex-1 justify-center items-center h-full'}>
      <View className={'p-4 native:pb-24 max-w-md gap-6'}>
        <View className={'gap-1'}>
          <H1 className={'text-foreground text-center'}>Communities</H1>
          <Muted className={'text-base text-center'}>
            Communities are not available yet. Stay tuned!
          </Muted>
        </View>
      </View>
    </View>
  )
}
