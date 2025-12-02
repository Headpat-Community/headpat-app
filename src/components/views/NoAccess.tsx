import { router } from 'expo-router'
import { StyleSheet, View } from 'react-native'
import { Button } from '~/components/ui/button'
import { Text } from '~/components/ui/text'
import { H1, H3, P } from '~/components/ui/typography'

export default function NoAccess() {
  return (
    <View style={styles.container}>
      <H1>401</H1>
      <H3>Unauthorized</H3>
      <P className="text-center text-muted-foreground mt-2">
        You don&apos;t have the required permissions to access this page.
      </P>
      <Button variant="outline" onPress={() => router.back()} className={'mt-4'}>
        <Text>Go back</Text>
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
})
