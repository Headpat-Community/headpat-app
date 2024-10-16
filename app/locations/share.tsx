import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Text } from '~/components/ui/text'
import { H1, H3, Muted } from '~/components/ui/typography'
import { Separator } from '~/components/ui/separator'
import { Button } from '~/components/ui/button'
import { useLocation } from '~/components/contexts/SharingContext'
import { useFocusEffect } from '@react-navigation/core'

export default function ShareLocationView() {
  const {
    status,
    isRegistered,
    checkStatus,
    registerBackgroundFetch,
    unregisterBackgroundFetch,
  } = useLocation()

  useFocusEffect(
    React.useCallback(() => {
      checkStatus().then()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  )

  return (
    <View style={styles.screen}>
      <H1>Location Sharing</H1>
      <Muted>BETA</Muted>
      <View className={'m-3'}>
        <Muted>
          {isRegistered
            ? 'You are currently sharing your location with other users.'
            : 'You are not sharing your location with other users.'}
        </Muted>
        <Muted>
          {status === 3 ? 'Sharing is available.' : 'Sharing is not available.'}
        </Muted>
      </View>
      <Button
        onPress={
          isRegistered ? unregisterBackgroundFetch : registerBackgroundFetch
        }
      >
        <Text>Enable location sharing</Text>
      </Button>
      <Separator className={'my-4'} />
      <H3>Thanks for trying out sharing!</H3>
      <Muted className={'p-4 px-7'}>
        For now, location sharing is turned off due to privacy. It will be
        turned back on when permissions have been properly implemented!
      </Muted>
      {/*
      <Button onPress={toggleFetchTask}>
        <Text>{isRegistered ? 'Disable sharing' : 'Enable sharing'}</Text>
      </Button>
      */}
      <Separator className={'my-4'} />
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boldText: {
    fontWeight: 'bold',
  },
})
