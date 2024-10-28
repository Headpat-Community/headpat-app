import React, { createContext, useContext, useEffect, useState } from 'react'
import { Alert } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Location from 'expo-location'
import * as BackgroundFetch from 'expo-background-fetch'
import * as TaskManager from 'expo-task-manager'
import { databases } from '~/lib/appwrite-client'

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

  useEffect(() => {
    checkStatus().then()
  }, [])

  const checkStatus = async () => {
    const status = await BackgroundFetch.getStatusAsync()
    const isRegistered = await TaskManager.isTaskRegisteredAsync(
      'background-location-task'
    )
    setStatus(status)
    setIsRegistered(isRegistered)
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
    const userId = await AsyncStorage.getItem('userId')
    if (!userId) {
      setIsRegistered(false)
      return Alert.alert('Error', 'No user ID found. Are you logged in?')
    }

    await requestPermissions()

    let foreground = await Location.getForegroundPermissionsAsync()
    let background = await Location.getBackgroundPermissionsAsync()
    if (foreground.status !== 'granted' || background.status !== 'granted') {
      return
    }

    try {
      await databases.getDocument('hp_db', 'locations', userId)
    } catch {
      await databases.createDocument('hp_db', 'locations', userId, {
        long: null,
        lat: null,
        timeUntilEnd: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
    }

    await Location.startLocationUpdatesAsync('background-location-task', {
      accuracy: Location.Accuracy.Balanced,
      showsBackgroundLocationIndicator: false,
      distanceInterval: 10,
      timeInterval: 10000,
    })

    setIsRegistered(true)
    checkStatus().then()
  }

  const unregisterBackgroundFetch = async () => {
    const userId = await AsyncStorage.getItem('userId')
    await Location.stopLocationUpdatesAsync('background-location-task')

    try {
      await databases.deleteDocument('hp_db', 'locations', userId)
    } catch (e) {
      console.error('Failed to delete document:', e)
    }

    setIsRegistered(false)
    checkStatus().then()
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
