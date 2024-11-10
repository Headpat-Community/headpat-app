import { Stack } from 'expo-router'
import React from 'react'
import FeatureAccess from '~/components/FeatureAccess'

function Layout() {
  return (
    <FeatureAccess featureName={'gallery'}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </FeatureAccess>
  )
}

export default Layout
