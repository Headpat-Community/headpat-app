const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')

// eslint-disable-next-line no-undef
const defaultConfig = getDefaultConfig(__dirname)
defaultConfig.resolver.sourceExts.push('cjs')

module.exports = withNativeWind(defaultConfig, { input: './global.css' })
