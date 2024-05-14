import { View } from 'react-native'
import { H1 } from '~/components/ui/typography'
import { Card, CardContent, CardFooter, CardTitle } from '~/components/ui/card'
import { Text } from '~/components/ui/text'
import { ClockIcon } from 'lucide-react-native'
import { useColorScheme } from '~/lib/useColorScheme'

export default function EventsPage() {
  const { isDarkColorScheme } = useColorScheme()
  const icon_color = isDarkColorScheme ? 'white' : 'black'

  return (
    <View>
      <Card>
        <CardContent>
          <CardTitle>
            <Text>Event Name</Text>
          </CardTitle>
          <Text className={'flex justify-center mt-1'}>
            <ClockIcon size={12} color={icon_color} />
            Test
          </Text>
          <Text className={'flex justify-center mt-1'}>
            <ClockIcon size={12} color={icon_color} />
            Test
          </Text>
          <CardFooter className={'p-0 mt-1'}>
            <Text>Footer</Text>
          </CardFooter>
        </CardContent>
      </Card>
    </View>
  )
}
