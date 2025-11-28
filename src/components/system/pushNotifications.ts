import messaging, {
  type FirebaseMessagingTypes,
  getMessaging
} from '@react-native-firebase/messaging'
import * as Device from 'expo-device'
import { Platform } from 'react-native'
import { PermissionsAndroid } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

export async function requestUserPermission() {
  if (!Device.isDevice) {
    //Alert.alert('Push Notifications are not supported on this device')
    return
  }

  let authStatus: FirebaseMessagingTypes.AuthorizationStatus
  if (Platform.OS === 'android') {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    )
    authStatus =
      result === PermissionsAndroid.RESULTS.GRANTED
        ? messaging.AuthorizationStatus.AUTHORIZED
        : messaging.AuthorizationStatus.DENIED
  } else {
    authStatus = await messaging().requestPermission()
  }

  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL

  if (enabled) {
    await getFcmToken()
  } else {
    //Alert.alert('Push Notifications permission denied')
  }
}

const getFcmToken = async () => {
  const messagingInstance = getMessaging()
  if (!messagingInstance.isDeviceRegisteredForRemoteMessages) {
    await messagingInstance.registerDeviceForRemoteMessages()
  }
  // wait 500ms for the device to be registered
  await new Promise((resolve) => setTimeout(resolve, 500))
  const fcmToken = await messagingInstance.getToken()
  if (fcmToken) {
    await AsyncStorage.setItem('fcmToken', fcmToken)
  } else {
    console.log('Failed to get FCM token')
  }
}
