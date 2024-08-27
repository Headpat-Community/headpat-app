import { Stack } from 'expo-router'
import React from 'react'

function _layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[announcementId]/index" />
    </Stack>
  )
}

export default _layout
