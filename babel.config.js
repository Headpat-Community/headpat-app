import gtPlugin from 'gt-react-native/plugin'
import { createRequire } from 'node:module'
import gtConfig from './gt.config.json' with { type: 'json' }

const require = createRequire(import.meta.url)

export default function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-worklets/plugin',
      [
        gtPlugin,
        {
          locales: [gtConfig.defaultLocale, ...gtConfig.locales],
          projectId: gtConfig.projectId,
          runtimeUrl: gtConfig.runtimeUrl,
          loadDictionaryPath: './src/loadDictionary.ts',
          entryPointFilePath: require.resolve('expo-router/entry'),
        },
      ],
    ],
  }
}
