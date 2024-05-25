import React from 'react'
import { Alert, Button, StyleSheet, View } from 'react-native'
import { H1 } from '~/components/ui/typography'
import { Text } from '~/components/ui/text'
import { database } from '~/lib/appwrite-client'
import { useUser } from '~/components/contexts/UserContext'
import * as Location from 'expo-location'
import * as BackgroundFetch from 'expo-background-fetch'
import * as TaskManager from 'expo-task-manager'

const LOCATION_TASK_NAME = 'background-location-task'

TaskManager.defineTask(LOCATION_TASK_NAME, async (locations) => {
  console.log('Received new locations', locations)

  let { status } = await Location.requestForegroundPermissionsAsync()
  const { current }: any = useUser() // Move the hook here
  console.log('current', current)

  if (status !== 'granted') {
    return BackgroundFetch.BackgroundFetchResult.Failed
  }

  // Get current location
  const location = await Location.getCurrentPositionAsync({})

  // Make API calls to update or create location document
  try {
    await database.updateDocument('hp_db', 'locations', current.$id, {
      long: location.coords.longitude,
      lat: location.coords.latitude,
    })
  } catch (error) {
    console.error('Error updating location', error)
    await database.createDocument('hp_db', 'locations', current.$id, {
      long: location.coords.longitude,
      lat: location.coords.latitude,
      timeUntilEnd: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })
  }
})

async function registerBackgroundFetchAsync() {
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
      'App requires location even when the App is backgrounded.'
    )
  }

  await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
    accuracy: Location.Accuracy.High,
  })
}

async function unregisterBackgroundFetchAsync() {
  await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME)
}

export default function ShareLocationView() {
  const [isRegistered, setIsRegistered] = React.useState(false)
  const [status, setStatus] = React.useState(null)
  const [debug, setDebug] = React.useState('')

  React.useEffect(() => {
    checkStatusAsync().then()
  }, [])

  const checkStatusAsync = async () => {
    const status = await BackgroundFetch.getStatusAsync()
    const isRegistered = await TaskManager.isTaskRegisteredAsync(
      LOCATION_TASK_NAME
    )
    setStatus(status)
    setIsRegistered(isRegistered)
  }

  const toggleFetchTask = async () => {
    if (isRegistered) {
      await unregisterBackgroundFetchAsync()
    } else {
      await registerBackgroundFetchAsync()
    }

    checkStatusAsync()
  }

  return (
    <View style={styles.screen}>
      <View style={styles.textContainer}>
        <Text>
          Background fetch status:{' '}
          <Text style={styles.boldText}>
            {status && BackgroundFetch.BackgroundFetchStatus[status]}
          </Text>
        </Text>
        <Text>
          Background fetch task name:{' '}
          <Text style={styles.boldText}>
            {isRegistered ? LOCATION_TASK_NAME : 'Not registered yet!'}
          </Text>
        </Text>
      </View>
      <View style={styles.textContainer}>{debug}</View>
      <Button
        title={
          isRegistered
            ? 'Unregister BackgroundFetch task'
            : 'Register BackgroundFetch task'
        }
        onPress={toggleFetchTask}
      />
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
