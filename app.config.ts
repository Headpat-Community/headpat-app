export default ({ config }) => ({
  ...config,
  name: 'Headpat',
  slug: 'headpat-app',
  version: '0.8.8',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'headpatapp',
  userInterfaceStyle: 'automatic',
  runtimeVersion: {
    policy: 'appVersion',
  },
  splash: {
    image: './assets/images/headpat_splash.png',
    resizeMode: 'cover',
    backgroundColor: '#000000',
  },
  notification: {
    icon: './assets/images/headpat_logo.png',
    iosDisplayInForeground: true,
  },
  githubUrl: 'https://github.com/Headpat-Community/headpat-app',
  assetBundlePatterns: ['**/*'],
  ios: {
    entitlements: {
      'aps-environment': 'production',
    },
    supportsTablet: true,
    bundleIdentifier: 'com.headpat.app',
    usesAppleSignIn: true,
    googleServicesFile: './GoogleService-Info.plist',
    config: {
      usesNonExemptEncryption: false,
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
    },
    appStoreUrl: 'https://apps.apple.com/app/headpat/id6502715063',
    infoPlist: {
      UIBackgroundModes: ['fetch', 'remote-notification', 'processing'],
      NSLocationWhenInUseUsageDescription:
        'This app requires access to your location to show you on the map.',
      NSLocationAlwaysAndWhenInUseUsageDescription:
        'This app requires access to your location to show you on the map.',
      NSLocationAlwaysUsageDescription:
        'This app requires access to your location to show you on the map.',
      BGTaskSchedulerPermittedIdentifiers: [
        'com.headpat.app.location',
        'com.headpat.app.fetch',
      ],
    },
    associatedDomains: [
      'applinks:headpat.app',
      'applinks:headpat.place',
      'applinks:headpat.space',
      'applinks:headpat.dev',
      'applinks:api.headpat.place',
      'applinks:api.headpat.space',
      'applinks:api.headpat.dev',
    ],
    appleTeamId: 'S243K37R5M',
  },
  android: {
    permissions: [
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.ACCESS_BACKGROUND_LOCATION',
      'android.permission.WAKE_LOCK',
    ],
    icon: './assets/images/headpat_logo.png',
    googleServicesFile: './google-services.json',
    adaptiveIcon: {
      foregroundImage: './assets/images/headpat_logo.png',
      backgroundColor: '#ffffff',
    },
    config: {
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_API_KEY || '',
      },
    },
    package: 'com.headpat.app',
  },
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: '904378a3-321c-4abe-9c08-48274d5f6267',
    },
  },
  owner: 'expo-headpat',
  plugins: [
    '@react-native-firebase/app',
    '@react-native-firebase/messaging',
    'expo-localization',
    'expo-apple-authentication',
    'expo-background-fetch',
    [
      'expo-task-manager',
      {
        ios: {
          minimumOSVersion: '15',
        },
      },
    ],
    [
      'expo-background-fetch',
      {
        ios: {
          minimumOSVersion: '15',
        },
      },
    ],
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission:
          'Allow Headpat to share your location with other users so they can see you on the map.',
        locationAlwaysPermission:
          'Allow Headpat to share your location with other users so they can see you on the map.',
        locationWhenInUsePermission:
          'Allow Headpat to use your location to see yourself on the map.',
        isIosBackgroundLocationEnabled: true,
        isAndroidBackgroundLocationEnabled: true,
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission:
          'The app accesses your photos to let you share them with your fellow friends.',
      },
    ],
    [
      'expo-sqlite',
      {
        enableFTS: true,
        useSQLCipher: true,
      },
    ],
    [
      'expo-build-properties',
      {
        ios: {
          useFrameworks: 'static',
          deploymentTarget: '15.1',
        },
      },
    ],
    'expo-video',
    'expo-router',
    'expo-secure-store',
    'expo-sqlite',
    'expo-font',
  ],
})
