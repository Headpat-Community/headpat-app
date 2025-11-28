import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { Alert } from "react-native"
import {
  requestForegroundPermissionsAsync,
  requestBackgroundPermissionsAsync,
  getForegroundPermissionsAsync,
  getBackgroundPermissionsAsync,
  startLocationUpdatesAsync,
  stopLocationUpdatesAsync,
  Accuracy,
} from "expo-location"
import { type BackgroundTaskStatus, getStatusAsync } from "expo-background-task"
import { isTaskRegisteredAsync } from "expo-task-manager"
import { databases } from "~/lib/appwrite-client"
import { useUser } from "~/components/contexts/UserContext"
import { addBreadcrumb, captureException } from "@sentry/react-native"
import * as Location from "expo-location"

interface LocationContextValue {
  status: BackgroundTaskStatus | null
  isRegistered: boolean
  checkStatus: () => Promise<void>
  requestPermissions: () => Promise<void>
  registerBackgroundFetch: () => Promise<void>
  unregisterBackgroundFetch: () => Promise<void>
}

const LocationContext = createContext<LocationContextValue | undefined>(
  undefined
)

export const useLocation = (): LocationContextValue => {
  const context = useContext(LocationContext)
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider")
  }
  return context
}

interface LocationProviderProps {
  children: React.ReactNode
}

export const LocationProvider: React.FC<LocationProviderProps> = ({
  children,
}) => {
  const [status, setStatus] = useState<BackgroundTaskStatus | null>(null)
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null)
  const { current } = useUser()

  useEffect(() => {
    const initializeStatus = async () => {
      await checkStatus()
    }
    void initializeStatus()
  }, [])

  const checkStatus = async () => {
    const BackgroundStatus = await getStatusAsync()
    const isRegisteredTask = await isTaskRegisteredAsync(
      "background-location-task"
    )
    setStatus(BackgroundStatus)
    setIsRegistered(isRegisteredTask)

    if (!isRegisteredTask) {
      await databases
        .deleteRow({
          databaseId: "hp_db",
          tableId: "locations",
          rowId: current?.$id ?? "",
        })
        .catch(() => {
          return
        })
    }
  }

  const requestPermissions = async () => {
    // Ensure the app shows a prominent disclosure before requesting permissions
    // The UI (LocationFrontPermissionModal) will call this request after user agrees.
    const { granted: fgGranted } = await requestForegroundPermissionsAsync()
    if (!fgGranted) {
      Alert.alert(
        "Location Access Required",
        "Headpat requires your location to share with users."
      )
      return
    }
    const { granted: bgGranted } = await requestBackgroundPermissionsAsync()
    if (!bgGranted) {
      Alert.alert(
        "Location Access Required",
        "You need to enable background location access in settings to share your location with users."
      )
      return
    }
  }

  const registerBackgroundFetch = async () => {
    addBreadcrumb({
      message: "registerBackgroundFetch",
      level: "info",
    })
    if (isRegistered) {
      await checkStatus()
      Alert.alert("Error", "You are already sharing your location.")
      return
    }
    if (!current?.$id) {
      setIsRegistered(false)
      Alert.alert("Error", "No user ID found. Are you logged in?")
      return
    }

    addBreadcrumb({
      message: "requestPermissions",
      level: "info",
    })
    await requestPermissions()

    const foreground = await getForegroundPermissionsAsync()
    const background = await getBackgroundPermissionsAsync()
    if (
      foreground.status !== Location.PermissionStatus.GRANTED ||
      background.status !== Location.PermissionStatus.GRANTED
    ) {
      Alert.alert("Error", "Location permissions not granted")
      return
    }

    try {
      await databases.getRow({
        databaseId: "hp_db",
        tableId: "locations",
        rowId: current.$id,
      })
    } catch {
      await databases.createRow({
        databaseId: "hp_db",
        tableId: "locations",
        rowId: current.$id,
        data: {
          long: null,
          lat: null,
        },
      })
    }

    addBreadcrumb({
      message: "startLocationUpdatesAsync",
      level: "info",
    })
    await startLocationUpdatesAsync("background-location-task", {
      accuracy: Accuracy.Balanced,
      showsBackgroundLocationIndicator: false,
      pausesUpdatesAutomatically: true,
      distanceInterval: 10,
      timeInterval: 10000,
    }).catch((e: unknown) => {
      captureException(e)
      Alert.alert("Error", "Failed to start location updates")
      return
    })

    setIsRegistered(true)
    await checkStatus()
  }

  const unregisterBackgroundFetch = async () => {
    addBreadcrumb({
      message: "unregisterBackgroundFetch",
      level: "info",
    })
    if (!isRegistered) {
      await checkStatus()
      Alert.alert("Error", "You are not sharing your location.")
      return
    }
    await stopLocationUpdatesAsync("background-location-task")

    try {
      console.log("deleting location document")
      await databases.deleteRow({
        databaseId: "hp_db",
        tableId: "locations",
        rowId: current?.$id ?? "",
      })
    } catch (e) {
      console.error("Failed to delete document:", e)
      captureException(e)
    }

    setIsRegistered(false)
    await checkStatus()
  }

  return (
    <LocationContext.Provider
      value={{
        status,
        isRegistered: isRegistered ?? false,
        checkStatus,
        requestPermissions,
        registerBackgroundFetch,
        unregisterBackgroundFetch,
      }}
    >
      {children}
    </LocationContext.Provider>
  )
}
