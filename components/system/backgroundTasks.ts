import * as TaskManager from 'expo-task-manager'
import * as Sentry from '@sentry/react-native'
import * as Location from 'expo-location'
import kv from 'expo-sqlite/kv-store'
import { databases, account } from '~/lib/appwrite-client'

const LOCATION_TASK_NAME = 'background-location-task'

TaskManager.defineTask(
  LOCATION_TASK_NAME,
  // @ts-ignore
  async ({ data: { locations }, error }) => {
    if (error) {
      console.error('Location task error:', error)
      Sentry.captureException(error)
      return Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME)
    }

    try {
      // Check if user is authenticated
      const session = await account.getSession('current')
      if (!session) {
        console.log('No active session, stopping location updates')
        return Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME)
      }

      // Get user ID from session instead of KV store
      const userId = session.userId
      if (!userId) {
        console.error('No user ID found in session')
        return Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME)
      }

      // Make API calls to update location document
      await databases.updateDocument('hp_db', 'locations', userId, {
        long: locations[0].coords.longitude,
        lat: locations[0].coords.latitude,
        updatedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Error in background location task:', error)
      Sentry.captureException(error)

      // If unauthorized, stop the task
      if (error.code === 401) {
        console.log('Unauthorized, stopping location updates')
        return Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME)
      }
    }
  }
)
