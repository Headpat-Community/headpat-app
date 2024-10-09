import { Stack } from 'expo-router'
import React from 'react'

function _layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[galleryId]" />
    </Stack>
  )
}

export default _layout
