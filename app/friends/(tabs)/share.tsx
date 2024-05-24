import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import { H1 } from '~/components/ui/typography'
import { Button } from '~/components/ui/button'
import { Text } from '~/components/ui/text'
import { database } from '~/lib/appwrite-client'
import { useUser } from '~/components/contexts/UserContext'
import * as Location from 'expo-location'
import * as BackgroundFetch from 'expo-background-fetch'
import * as TaskManager from 'expo-task-manager'

const LOCATION_TASK_NAME = 'background-location-task'

TaskManager.defineTask(LOCATION_TASK_NAME, async () => {
  console.log('test')
  const { status } = await Location.requestForegroundPermissionsAsync()
  if (status !== 'granted') {
    return BackgroundFetch.BackgroundFetchResult.Failed
  }

  const location = await Location.getCurrentPositionAsync({})
  const { current }: any = useUser()
  console.log('doing stuff')
  try {
    await database.updateDocument('hp_db', 'locations', current.userId, {
      long: location.coords.longitude,
      lat: location.coords.latitude,
    })
  } catch (error) {
    console.error('Error updating location', error)
    await database.createDocument('hp_db', 'locations', current.userId, {
      long: location.coords.longitude,
      lat: location.coords.latitude,
    })
  }

  return BackgroundFetch.BackgroundFetchResult.NewData
})

export default function SharePage() {
  const [sharing, setSharing] = useState<boolean>(false)
  const [debug, setDebug] = useState<any>(null)

  const startSharingLocation = async () => {
    setSharing(true)
    const data = await BackgroundFetch.registerTaskAsync(LOCATION_TASK_NAME, {
      minimumInterval: 10, // seconds,
    })
    console.log(data)
    setDebug(data)
  }

  const stopSharingLocation = async () => {
    setSharing(false)
    await BackgroundFetch.unregisterTaskAsync(LOCATION_TASK_NAME)
  }

  return (
    <View className={'flex-1 justify-center items-center h-full'}>
      <View className={'p-4 native:pb-24 max-w-md gap-6'}>
        <View className={'gap-1'}>
          <H1 className={'text-foreground text-center'}>Share my location</H1>
          <Button
            className={'text-base text-center'}
            onPress={sharing ? stopSharingLocation : startSharingLocation}
          >
            <Text>{sharing ? 'Stop Sharing' : 'Start Sharing'}</Text>
            <Text>{debug}</Text>
          </Button>
        </View>
      </View>
    </View>
  )
}
