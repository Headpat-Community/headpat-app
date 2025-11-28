import { reactNativeTracingIntegration } from '@sentry/react-native'
import { init as sentryInit } from '@sentry/react-native/dist/js/sdk'

sentryInit({
  dsn: process.env.SENTRY_DSN,
  /**
   * Set tracesSampleRate to 1.0 to capture 100% of transactions for tracing.
   */
  tracesSampleRate: 1.0,
  /**
   * Set profilesSampleRate to 1.0 to capture 100% of profiles for profiling.
   */
  profilesSampleRate: 1.0,
  enabled: process.env.SENTRY_ENABLED === 'true',
  debug: false,
  integrations: [
    reactNativeTracingIntegration({
      traceFetch: true,
      traceXHR: true
    })
  ]
})
