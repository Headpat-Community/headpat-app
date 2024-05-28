import React from 'react'
import { Alert, Button, StyleSheet, View } from 'react-native'
import { Text } from '~/components/ui/text'
import { database } from '~/lib/appwrite-client'
import { useUser } from '~/components/contexts/UserContext'
import * as Location from 'expo-location'
import * as BackgroundFetch from 'expo-background-fetch'
import * as TaskManager from 'expo-task-manager'
import AsyncStorage from '@react-native-async-storage/async-storage'

const LOCATION_TASK_NAME = 'background-location-task'

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  console.log('Received new locations', data)

  if (error) {
    return BackgroundFetch.BackgroundFetchResult.Failed
  }

  // Use the user data from the task
  const userId = await AsyncStorage.getItem('userId')

  // Get current location
  const location = await Location.getCurrentPositionAsync({})

  // Make API calls to update or create location document
  await database
    .updateDocument('hp_db', 'locations', userId, {
      long: location.coords.longitude,
      lat: location.coords.latitude,
    })
    .catch(async () => {
      await database.createDocument('hp_db', 'locations', userId, {
        long: location.coords.longitude,
        lat: location.coords.latitude,
        timeUntilEnd: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
    })
})

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

  await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
    accuracy: Location.Accuracy.High,
    showsBackgroundLocationIndicator: true,
    distanceInterval: 10,
    timeInterval: 10000,
  })
}

async function unregisterBackgroundFetchAsync() {
  const userId = await AsyncStorage.getItem('userId')
  await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME)

  await database.deleteDocument('hp_db', 'locations', userId)
}

export default function ShareLocationView() {
  const [isRegistered, setIsRegistered] = React.useState(false)
  const [status, setStatus] = React.useState(null)
  const user: any = useUser()

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
      if (user.current.$id) {
        await registerBackgroundFetchAsync(user.current.$id)
      } else {
        Alert.alert('Error', 'Please log in to share location')
      }
    }

    await checkStatusAsync()
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
