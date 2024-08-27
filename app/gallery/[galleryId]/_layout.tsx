import { Stack } from 'expo-router'
import React from 'react'

function GalleryLayout() {
  console.log('gallery layout')
  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
      <Stack.Screen name="index" />
    </Stack>
  )
}

export default GalleryLayout
