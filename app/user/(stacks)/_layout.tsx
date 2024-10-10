import React from 'react'
import { Stack } from 'expo-router'
import { HeaderSidebarBackButton } from '~/components/data/DrawerScreensData'

function _layout() {
  return (
    <Stack initialRouteName={'index'}>
      <Stack.Screen
        name="index"
        options={{
          headerTitle: 'Users',
          headerLargeTitle: true,
          headerLeft: () => <HeaderSidebarBackButton />,
        }}
      />
      <Stack.Screen
        name="[userId]/index"
        options={{
          headerTitle: '',
          headerLeft: () => <HeaderSidebarBackButton />,
        }}
      />
      <Stack.Screen name="[userId]/relationships/followers/index" />
      <Stack.Screen name="[userId]/relationships/following/index" />
    </Stack>
  )
}

export default _layout
