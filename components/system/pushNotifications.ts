import messaging from '@react-native-firebase/messaging'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Device from 'expo-device'

export async function requestUserPermission() {
  if (!Device.isDevice) {
    //Alert.alert('Push Notifications are not supported on this device')
    return
  }

  const authStatus = await messaging().requestPermission()
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
  const fcmToken = await messaging().getToken()
  if (fcmToken) {
    await AsyncStorage.setItem('fcmToken', fcmToken)
  } else {
    console.log('Failed to get FCM token')
  }
}
