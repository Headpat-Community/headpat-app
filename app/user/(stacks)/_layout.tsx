import React from 'react'
import { Stack } from 'expo-router'

const _layout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="list/index" />
      <Stack.Screen name="[userId]/index" />
      <Stack.Screen name="[userId]/relationships/followers/index" />
      <Stack.Screen name="[userId]/relationships/following/index" />
    </Stack>
  )
}

export default _layout
