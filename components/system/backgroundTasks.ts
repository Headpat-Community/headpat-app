import * as TaskManager from 'expo-task-manager'
import * as Sentry from '@sentry/react-native'
import * as Location from 'expo-location'
import kv from 'expo-sqlite/kv-store'
import { databases } from '~/lib/appwrite-client'
import { TaskManagerTaskBody } from 'expo-task-manager'

type BackgroundLocationTaskData = {
  locations: Location.LocationObject[]
}

TaskManager.defineTask(
  'background-location-task',
  async ({
    data: { locations },
    error,
  }: TaskManagerTaskBody<BackgroundLocationTaskData>) => {
    if (error) {
      console.error(error)
      Sentry.captureException(error)
      return Location.stopLocationUpdatesAsync('background-location-task')
    }

    // Use the user data from the task
    const userId = await kv.getItem('userId')
    //const preciseLocation = await kv.getItem('preciseLocation')

    if (!userId) {
      return Location.stopLocationUpdatesAsync('background-location-task')
    }

    // Make API calls to update location document
    try {
      await databases.updateDocument('hp_db', 'locations', userId, {
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
