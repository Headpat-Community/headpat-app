import React, { useEffect } from 'react'
import { Alert, StyleSheet, View } from 'react-native'
import { Text } from '~/components/ui/text'
import { database } from '~/lib/appwrite-client'
import { useUser } from '~/components/contexts/UserContext'
import * as Location from 'expo-location'
import * as BackgroundFetch from 'expo-background-fetch'
import * as TaskManager from 'expo-task-manager'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { H1, Muted } from '~/components/ui/typography'
import { Button } from '~/components/ui/button'
import { useIsFocused } from '@react-navigation/native'

export default function ShareLocationView() {
  const [isRegistered, setIsRegistered] = React.useState(false)
  const [status, setStatus] = React.useState(null)
  const user = useUser()

  React.useEffect(() => {
    checkStatusAsync().then()
  }, [])

  const checkStatusAsync = async () => {
    const status = await BackgroundFetch.getStatusAsync()
    const isRegistered = await TaskManager.isTaskRegisteredAsync(
      'background-location-task'
    )
    setStatus(status)
    setIsRegistered(isRegistered)
  }
  async function registerBackgroundFetchAsync(userId: string) {
    const { granted: fgGranted } =
      await Location.requestForegroundPermissionsAsync()
    if (!fgGranted) {
      return Alert.alert('Required', 'Please grant GPS Location')
    }
    const { granted: bgGranted } =
      await Location.requestBackgroundPermissionsAsync()

    if (!bgGranted) {
      return Alert.alert(
        'Location Access Required',
        'Headpat requires location even when the App is backgrounded.'
      )
    }

    await AsyncStorage.setItem('userId', userId)

    await Location.startLocationUpdatesAsync('background-location-task', {
      accuracy: Location.Accuracy.High,
      showsBackgroundLocationIndicator: true,
      distanceInterval: 10,
      timeInterval: 10000,
    })
    console.log('Location updates started')
  }
  const focus = useIsFocused()
  useEffect(() => {
    async function test() {
      const res = await Location.hasStartedLocationUpdatesAsync(
        'background-location-task'
      )
      console.log(res)
    }
    test()
  }, [status, focus])
  async function unregisterBackgroundFetchAsync() {
    const userId = await AsyncStorage.getItem('userId')
    await Location.stopLocationUpdatesAsync('background-location-task')

    await database.deleteDocument('hp_db', 'locations', userId).catch(() => {
      return
    })
  }

  const toggleFetchTask = async () => {
    if (isRegistered) {
      await unregisterBackgroundFetchAsync()
    } else {
      if (user?.current) {
        await registerBackgroundFetchAsync(user.current.$id)
      } else {
        Alert.alert('Error', 'Please log in to share location')
      }
    }

    await checkStatusAsync()
  }

  return (
    <View style={styles.screen}>
      <H1>Location Sharing</H1>
      <Muted>BETA</Muted>
      <View style={styles.textContainer}>
        <Text>
          Background status:{' '}
          <Text style={styles.boldText}>
            {status && BackgroundFetch.BackgroundFetchStatus[status]}
          </Text>
        </Text>
      </View>
      <Button onPress={toggleFetchTask}>
        <Text>{isRegistered ? 'Disable sharing' : 'Enable sharing'}</Text>
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    margin: 10,
  },
  boldText: {
    fontWeight: 'bold',
  },
})
