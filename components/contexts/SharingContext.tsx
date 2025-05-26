import React, { createContext, useContext, useEffect, useState } from 'react'
import { Alert } from 'react-native'
import {
  requestForegroundPermissionsAsync,
  requestBackgroundPermissionsAsync,
  getForegroundPermissionsAsync,
  getBackgroundPermissionsAsync,
  startLocationUpdatesAsync,
  stopLocationUpdatesAsync,
  Accuracy
} from 'expo-location'
import { BackgroundFetchStatus, getStatusAsync } from 'expo-background-fetch'
import { isTaskRegisteredAsync } from 'expo-task-manager'
import { databases } from '~/lib/appwrite-client'
import { useUser } from '~/components/contexts/UserContext'
import { addBreadcrumb, captureException } from '@sentry/react-native'

interface LocationContextValue {
  status: BackgroundFetchStatus | null
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
  children
}) => {
  const [status, setStatus] = useState<BackgroundFetchStatus | null>(null)
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null)
  const { current } = useUser()

  useEffect(() => {
    const initializeStatus = async () => {
      await checkStatus()
    }
    initializeStatus().then()
  }, [])

  const checkStatus = async () => {
    const BackgroundStatus = await getStatusAsync()
    const isRegisteredTask = await isTaskRegisteredAsync(
      'background-location-task'
    )
    setStatus(BackgroundStatus)
    setIsRegistered(isRegisteredTask)

    if (BackgroundStatus && !isRegisteredTask) {
      await databases
        .deleteDocument('hp_db', 'locations', current?.$id)
        .catch(() => {
          return
        })
    }
  }

  const requestPermissions = async () => {
    const { granted: fgGranted } = await requestForegroundPermissionsAsync()
    if (!fgGranted) {
      return Alert.alert(
        'Location Access Required',
        'Headpat requires your location to share with users.'
      )
    }
    const { granted: bgGranted } = await requestBackgroundPermissionsAsync()
    if (!bgGranted) {
      return Alert.alert(
        'Location Access Required',
        'You need to enable background location access in settings to share your location with users.'
      )
    }
  }

  const registerBackgroundFetch = async () => {
    addBreadcrumb({
      message: 'registerBackgroundFetch',
      level: 'info'
    })
    if (isRegistered) {
      await checkStatus()
      return Alert.alert('Error', 'You are already sharing your location.')
    }
    if (!current.$id) {
      setIsRegistered(false)
      return Alert.alert('Error', 'No user ID found. Are you logged in?')
    }

    addBreadcrumb({
      message: 'requestPermissions',
      level: 'info'
    })
    await requestPermissions()

    let foreground = await getForegroundPermissionsAsync()
    let background = await getBackgroundPermissionsAsync()
    if (foreground.status !== 'granted' || background.status !== 'granted') {
      return Alert.alert('Error', 'Location permissions not granted')
    }

    try {
      await databases.getDocument('hp_db', 'locations', current.$id)
    } catch {
      await databases.createDocument('hp_db', 'locations', current.$id, {
        long: null,
        lat: null
      })
    }

    addBreadcrumb({
      message: 'startLocationUpdatesAsync',
      level: 'info'
    })
    await startLocationUpdatesAsync('background-location-task', {
      accuracy: Accuracy.Balanced,
      showsBackgroundLocationIndicator: false,
      pausesUpdatesAutomatically: true,
      distanceInterval: 10,
      timeInterval: 10000
    }).catch((e) => {
      captureException(e)
      Alert.alert('Error', 'Failed to start location updates')
      return
    })

    setIsRegistered(true)
    await checkStatus()
  }

  const unregisterBackgroundFetch = async () => {
    addBreadcrumb({
      message: 'unregisterBackgroundFetch',
      level: 'info'
    })
    if (!isRegistered) {
      await checkStatus()
      return Alert.alert('Error', 'You are not sharing your location.')
    }
    await stopLocationUpdatesAsync('background-location-task')

    try {
      console.log('deleting location document')
      await databases.deleteDocument('hp_db', 'locations', current?.$id)
    } catch (e) {
      console.error('Failed to delete document:', e)
      captureException(e)
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
        unregisterBackgroundFetch
      }}
    >
      {children}
    </LocationContext.Provider>
  )
}
