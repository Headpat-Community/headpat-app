import { View } from 'react-native'
import { H1, Muted } from '~/components/ui/typography'

export default function EventPage() {
  return (
    <View className={'flex-1 justify-center items-center'}>
      <View className={'p-4 native:pb-24 max-w-md gap-6'}>
        <View className={'gap-1'}>
          <H1 className={'text-foreground text-center'}>Announcements</H1>
          <Muted className={'text-base text-center'}>
            Currently there are no announcements, check back later!
          </Muted>
        </View>
      </View>
    </View>
  )
}
