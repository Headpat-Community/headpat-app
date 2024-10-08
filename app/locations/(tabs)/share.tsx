import React from 'react'
import { Alert, StyleSheet, View } from 'react-native'
import { Text } from '~/components/ui/text'
import { database } from '~/lib/appwrite-client'
import { useUser } from '~/components/contexts/UserContext'
import * as Location from 'expo-location'
import * as BackgroundFetch from 'expo-background-fetch'
import * as TaskManager from 'expo-task-manager'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { H1, H3, Muted } from '~/components/ui/typography'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog'
import { useFocusEffect } from '@react-navigation/native'
import { Separator } from '~/components/ui/separator'

export default function ShareLocationView() {
  const [isRegistered, setIsRegistered] = React.useState(false)
  const [status, setStatus] = React.useState(null)
  const [modalOpen, setModalOpen] = React.useState(false)
  const { current } = useUser()

  useFocusEffect(
    React.useCallback(() => {
      // TODO: Remove this when permissions are properly implemented
      checkStatusAsync().then(() => {
        if (current && status?.available && isRegistered) {
          unregisterBackgroundFetchAsync().then()
        }
      })
    }, [current, isRegistered, status])
  )

  const checkStatusAsync = async () => {
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
    await toggleFetchTask()
  }

  async function registerBackgroundFetchAsync(userId: string) {
    if (!userId) {
      setIsRegistered(false)
      return Alert.alert('Error', 'No user ID found. Are you logged in?')
    }
    await AsyncStorage.setItem('userId', userId)
    //const preciseLocationItem = await AsyncStorage.getItem('preciseLocation')

    let foreground = await Location.getForegroundPermissionsAsync()
    let background = await Location.getBackgroundPermissionsAsync()
    if (foreground.status !== 'granted' || background.status !== 'granted') {
      setModalOpen(true)
      return
    }

    await Location.startLocationUpdatesAsync('background-location-task', {
      accuracy: Location.Accuracy.Balanced,
      showsBackgroundLocationIndicator: false,
      //pausesUpdatesAutomatically: true,
      //activityType: Location.ActivityType.Other,
      distanceInterval: 10,
      timeInterval: 10000,
    })
  }

  async function unregisterBackgroundFetchAsync() {
    const userId = await AsyncStorage.getItem('userId')
    await Location.stopLocationUpdatesAsync('background-location-task')

    try {
      return await database.deleteDocument('hp_db', 'locations', userId)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      return
    }
  }

  const toggleFetchTask = async () => {
    if (!current) {
      Alert.alert('Error', 'Please log in to share location')
      return
    }

    if (isRegistered) {
      await unregisterBackgroundFetchAsync()
    } else {
      if (current) {
        await registerBackgroundFetchAsync(current.$id)
      } else {
        Alert.alert('Error', 'Please log in to share location')
      }
    }

    await checkStatusAsync()
  }

  return (
    <View style={styles.screen}>
      {modalOpen && (
        <AlertDialog onOpenChange={setModalOpen} open={modalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Headpat needs permission</AlertDialogTitle>
              <AlertDialogDescription>
                In order to share your location with users, we need your
                permission to access your location in the foreground and
                background.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction
                onPress={async () => {
                  let { status } =
                    await Location.requestForegroundPermissionsAsync()
                  if (status === 'granted') {
                    await requestPermissions()
                  }
                  setModalOpen(false)
                }}
              >
                <Text>Continue</Text>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      <H1>Location Sharing</H1>
      <Muted>BETA</Muted>
      <View style={styles.textContainer}>
        <Muted>
          {isRegistered
            ? 'You are currently sharing your location with other users.'
            : 'You are not sharing your location with other users.'}
        </Muted>
        <Muted>
          {status?.available
            ? 'Background fetch is available.'
            : 'Background fetch is not available.'}
        </Muted>
      </View>
      <Separator className={'my-4'} />
      <H3>Thanks for trying out sharing!</H3>
      <Muted className={'p-4 px-7'}>
        For now, location sharing is turned off due to privacy. It will be
        turned back on when permissions have been properly implemented!
      </Muted>
      {/*
      <Button onPress={toggleFetchTask}>
        <Text>{isRegistered ? 'Disable sharing' : 'Enable sharing'}</Text>
      </Button>
      */}
      <Separator className={'my-4'} />
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
