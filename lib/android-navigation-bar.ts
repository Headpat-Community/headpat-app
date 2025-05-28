import {
  setButtonStyleAsync,
  setBackgroundColorAsync
} from 'expo-navigation-bar'
import { Platform } from 'react-native'
import { NAV_THEME } from '~/lib/constants'

export async function setAndroidNavigationBar(theme: 'light' | 'dark') {
  if (Platform.OS !== 'android') return
  await setButtonStyleAsync(theme === 'dark' ? 'light' : 'dark')
  await setBackgroundColorAsync(
    theme === 'dark' ? NAV_THEME.dark.background : NAV_THEME.light.background
  )
}
