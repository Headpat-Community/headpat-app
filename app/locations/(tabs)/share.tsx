import React from 'react'
import { Alert, StyleSheet, View } from 'react-native'
import { Text } from '~/components/ui/text'
import { database } from '~/lib/appwrite-client'
import { useUser } from '~/components/contexts/UserContext'
import * as Location from 'expo-location'
import * as BackgroundFetch from 'expo-background-fetch'
import * as TaskManager from 'expo-task-manager'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { H1, Muted } from '~/components/ui/typography'
import { Button } from '~/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog'

export default function ShareLocationView() {
  const [isRegistered, setIsRegistered] = React.useState(false)
  const [status, setStatus] = React.useState(null)
  const [modalOpen, setModalOpen] = React.useState(false)
  const { current } = useUser()

  React.useEffect(() => {
    checkStatusAsync().then()
  }, [])

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
    await AsyncStorage.setItem('userId', userId)
    //await requestPermissions()
    let foreground = await Location.getForegroundPermissionsAsync()
    let background = await Location.getBackgroundPermissionsAsync()
    if (foreground.status !== 'granted' || background.status !== 'granted') {
      setModalOpen(true)
      return
    }

    await Location.startLocationUpdatesAsync('background-location-task', {
      accuracy: Location.Accuracy.High,
      showsBackgroundLocationIndicator: true,
      distanceInterval: 10,
      timeInterval: 10000,
    })
  }

  async function unregisterBackgroundFetchAsync() {
    const userId = await AsyncStorage.getItem('userId')
    await Location.stopLocationUpdatesAsync('background-location-task')

    try {
      await database.deleteDocument('hp_db', 'locations', userId)
      return
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
      await registerBackgroundFetchAsync(current.$id)
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
        <Text>
          Background status:{' '}
          <Text style={styles.boldText}>
            {status && BackgroundFetch.BackgroundFetchStatus[status]}
          </Text>
        </Text>
      </View>
      <Button onPress={toggleFetchTask}>
        <Text>{isRegistered ? 'Disable sharing' : 'Enable sharing'}</Text>
      </Button>
      <Muted className={'p-4'}>
        NOTE: Please only enable this for conventions or other kinds of events.
        In the future you will be able to properly select users to share your
        location with. For now, it will be shared with all users.
      </Muted>
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
