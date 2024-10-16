import * as TaskManager from 'expo-task-manager'
import * as Sentry from '@sentry/react-native'
import * as Location from 'expo-location'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { database } from '~/lib/appwrite-client'

TaskManager.defineTask(
  'background-location-task',
  // @ts-ignore
  async ({ data: { locations }, error }) => {
    if (error) {
      console.error(error)
      Sentry.captureException(error)
      return Location.stopLocationUpdatesAsync('background-location-task')
    }

    // Use the user data from the task
    const userId = await AsyncStorage.getItem('userId')
    //const preciseLocation = await AsyncStorage.getItem('preciseLocation')

    if (!userId) {
      return Location.stopLocationUpdatesAsync('background-location-task')
    }

    // Make API calls to update location document
    try {
      await database.updateDocument('hp_db', 'locations', userId, {
        long: locations[0].coords.longitude,
        lat: locations[0].coords.latitude,
      })
    } catch (error) {
      console.error(error)
      Sentry.captureException(error)
      return Location.stopLocationUpdatesAsync('background-location-task')
    }
  }
)
