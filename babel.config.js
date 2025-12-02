import gtPlugin from 'gt-react-native/plugin'
import { createRequire } from 'module';
import gtConfig from './gt.config.json' with { type: 'json' };

const require = createRequire(import.meta.url);

export default function (api) {
  api.cache(true)
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      "react-native-worklets/plugin",
      [
        gtPlugin,
        {
          locales: [gtConfig.defaultLocale, ...gtConfig.locales],
          entryPointFilePath: require.resolve('expo-router/entry'),
        },
      ],

    ],
  }
}
