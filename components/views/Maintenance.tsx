import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Button } from '~/components/ui/button'
import { H1, H3, P } from '~/components/ui/typography'
import { router } from 'expo-router'
import { Text } from '~/components/ui/text'

export default function Maintenance() {
  return (
    <View style={styles.container}>
      <H1>503</H1>
      <H3>Page is under maintenance!</H3>
      <P className="text-center text-muted-foreground mt-2">
        This page is not available at the moment. {'\n'}
        We&apos;ll be back online shortly.
      </P>
      <Button
        variant="outline"
        onPress={() => router.back()}
        className={'mt-4'}
      >
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
    padding: 16
  }
})
