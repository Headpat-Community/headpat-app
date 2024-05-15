import { View } from 'react-native'
import { H1, Muted } from '~/components/ui/typography'

export default function AccountPage() {
  return (
    <View className="flex-1 justify-center items-center">
      <View className="p-4 native:pb-24 max-w-md gap-6">
        <View className="gap-1">
          <H1 className="text-foreground text-center">Account</H1>
          <Muted className="text-base text-center">
            This is the account page
          </Muted>
        </View>
      </View>
    </View>
  )
}
