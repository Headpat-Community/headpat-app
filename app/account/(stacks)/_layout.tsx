import React from 'react'
import { Stack } from 'expo-router'

const _layout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="userprofile/(tabs)" />
      <Stack.Screen name="security/index" />
    </Stack>
  )
}

export default _layout
