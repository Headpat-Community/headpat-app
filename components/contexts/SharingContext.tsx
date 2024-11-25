import React, { createContext, useContext, useEffect, useState } from 'react'
import { Alert } from 'react-native'
import * as Location from 'expo-location'
import * as BackgroundFetch from 'expo-background-fetch'
import * as TaskManager from 'expo-task-manager'
import { databases } from '~/lib/appwrite-client'
import { useUser } from '~/components/contexts/UserContext'
import * as Sentry from '@sentry/react-native'
import { toast } from '~/lib/toast'

interface LocationContextValue {
  status: BackgroundFetch.BackgroundFetchStatus | null
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
    throw new Error('useLocation must be used within a LocationProvider')
  }
  return context
}

interface LocationProviderProps {
  children: React.ReactNode
}

export const LocationProvider: React.FC<LocationProviderProps> = ({
  children,
}) => {
  const [status, setStatus] =
    useState<BackgroundFetch.BackgroundFetchStatus | null>(null)
  const [isRegistered, setIsRegistered] = useState(false)
  const { current } = useUser()

  useEffect(() => {
    const initializeStatus = async () => {
      await checkStatus()
    }
    initializeStatus().then()
  }, [])

  const checkStatus = async () => {
    const backgroundStatus = await BackgroundFetch.getStatusAsync()
    setStatus(backgroundStatus)
    if (backgroundStatus !== BackgroundFetch.BackgroundFetchStatus.Available) {
      return toast(
        'Background fetch is restricted. Headpat requires background fetch to share your location.'
      )
    }
    const isDefined = TaskManager.isTaskDefined('background-location-task')
    if (!isDefined) {
      TaskManager.defineTask('background-location-task', async () => {
        return
      })
    }
    const isRegisteredTask = await TaskManager.isTaskRegisteredAsync(
      'background-location-task'
    )
    setIsRegistered(isRegisteredTask)
    Sentry.captureMessage(`Location sharing status: ${isRegisteredTask}`)

    if (!isRegisteredTask) {
      await databases
        .deleteDocument('hp_db', 'locations', current?.$id)
        .catch(() => {
          return
        })
    }
  }

  const requestPermissions = async () => {
    const { granted: fgGranted } =
      await Location.requestForegroundPermissionsAsync()
    if (!fgGranted) {
      return Alert.alert(
        'Location Access Required',
        'Headpat requires your location to share with users.'
      )
    }
    const { granted: bgGranted } =
      await Location.requestBackgroundPermissionsAsync()
    if (!bgGranted) {
      return Alert.alert(
        'Location Access Required',
        'You need to enable background location access in settings to share your location with users.'
      )
    }
  }

  const registerBackgroundFetch = async () => {
    if (isRegistered) {
      await checkStatus()
      return Alert.alert('Error', 'You are already sharing your location.')
    }
    if (!current.$id) {
      setIsRegistered(false)
      return Alert.alert('Error', 'No user ID found. Are you logged in?')
    }

    await requestPermissions()

    let foreground = await Location.getForegroundPermissionsAsync()
    let background = await Location.getBackgroundPermissionsAsync()
    if (foreground.status !== 'granted' || background.status !== 'granted') {
      return Alert.alert('Error', 'Location permissions not granted')
    }

    try {
      await databases.getDocument('hp_db', 'locations', current.$id)
    } catch {
      await databases.createDocument('hp_db', 'locations', current.$id, {
        long: null,
        lat: null,
        timeUntilEnd: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
    }

    await Location.startLocationUpdatesAsync('background-location-task', {
      accuracy: Location.Accuracy.Balanced,
      showsBackgroundLocationIndicator: false,
      pausesUpdatesAutomatically: true,
      distanceInterval: 10,
      timeInterval: 10000,
    }).catch((e) => {
      Sentry.captureException(e)
      Alert.alert('Error', 'Failed to start location updates')
      return
    })

    setIsRegistered(true)
    await checkStatus()
  }

  const unregisterBackgroundFetch = async () => {
    if (!isRegistered) {
      await checkStatus()
      return Alert.alert('Error', 'You are not sharing your location.')
    }
    await Location.stopLocationUpdatesAsync('background-location-task')

    try {
      await databases.deleteDocument('hp_db', 'locations', current?.$id)
    } catch (e) {
      console.error('Failed to delete document:', e)
    }

    setIsRegistered(false)
    await checkStatus()
  }

  return (
    <LocationContext.Provider
      value={{
        status,
        isRegistered,
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
