import { View } from 'react-native'
import { useColorScheme } from '~/lib/useColorScheme'
import { Text } from '~/components/ui/text'

export default function CompletedAlert() {
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? 'white' : 'black'

  return (
    <View style={{ backgroundColor: theme }}>
      <Text>Completed</Text>
    </View>
  )
}
