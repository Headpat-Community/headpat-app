import { Stack } from 'expo-router'
import React from 'react'

function _layout() {
  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
      <Stack.Screen name="[communityId]/index" />
      <Stack.Screen name="[communityId]/relationships/followers/index" />
      <Stack.Screen name="[communityId]/admin" />
    </Stack>
  )
}

export default _layout
