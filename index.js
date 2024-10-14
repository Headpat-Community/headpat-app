import './globals.css'
import 'react-native-url-polyfill/auto'
import * as Sentry from '@sentry/react-native'

import { registerRootComponent } from 'expo'
import { ExpoRoot } from 'expo-router'

// https://docs.expo.dev/router/reference/troubleshooting/#expo_router_app_root-not-defined

// Must be exported or Fast Refresh won't update the context
export function App() {
  Sentry.init({
    dsn: 'https://ced9dff6e3abde898b0326c222866bc0@sentry.fayevr.dev/10',
  })

  const ctx = require.context('./app')
  return <ExpoRoot context={ctx} />
}

registerRootComponent(App)
