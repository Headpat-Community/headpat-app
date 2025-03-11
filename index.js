import './globals.css'
import 'react-native-url-polyfill/auto'
import * as Sentry from '@sentry/react-native'

import { registerRootComponent } from 'expo'
import { ExpoRoot } from 'expo-router'

// https://docs.expo.dev/router/reference/troubleshooting/#expo_router_app_root-not-defined

// Must be exported or Fast Refresh won't update the context
export function App() {
  Sentry.init({
    dsn: 'https://509e7edd878409fed0b19d08c0ee4476@sentry.fayevr.dev/4',
  })

  const ctx = require.context('./app')
  return <ExpoRoot context={ctx} />
}

registerRootComponent(App)
