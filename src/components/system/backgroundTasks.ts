import * as TaskManager from "expo-task-manager"
import * as Sentry from "@sentry/react-native"
import * as Location from "expo-location"
import { databases, account } from "~/lib/appwrite-client"
import type { LocationObjectCoords } from "expo-location"

const LOCATION_TASK_NAME = "background-location-task"

TaskManager.defineTask(
  LOCATION_TASK_NAME,
  async ({
    data: { locations },
    error,
  }: {
    data: { locations: LocationObjectCoords[] }
    error: any
  }) => {
    if (error) {
      console.error("Location task error:", error)
      Sentry.captureException(error)
      return void Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME)
    }

    try {
      // Check if user is authenticated
      const session = await account.getSession({ sessionId: "current" })

      // Get user ID from session instead of KV store
      const userId = session.userId
      if (!userId) {
        console.error("No user ID found in session")
        return void Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME)
      }

      // Make API calls to update location document
      await databases.updateRow({
        databaseId: "hp_db",
        tableId: "locations",
        rowId: userId,
        data: {
          long: locations[0].longitude,
          lat: locations[0].latitude,
        },
      })
    } catch (error) {
      console.error("Error in background location task:", error)
      Sentry.captureException(error)

      // If unauthorized, stop the task
      if ((error as any).code === 401) {
        console.log("Unauthorized, stopping location updates")
        return void Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME)
      }
    }
  }
)
