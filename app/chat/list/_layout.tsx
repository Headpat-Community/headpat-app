import { Tabs } from 'expo-router'
import { MapIcon, PersonStandingIcon } from 'lucide-react-native'
import { HeaderSidebarBackButton } from '~/components/data/DrawerScreensData'
import React from 'react'
import { ProfileThemeToggle } from '~/components/ThemeToggle'

export default function TabsLayout() {
  return (
    <Tabs backBehavior={'initialRoute'} initialRouteName={'index'}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Conversations',
          tabBarIcon({ color, size }) {
            return <PersonStandingIcon color={color} size={size} />
          },
          headerLeftContainerStyle: { paddingLeft: 15 },
          headerRightContainerStyle: { paddingRight: 15 },
          headerLeft: () => <HeaderSidebarBackButton />,
          headerRight: () => <ProfileThemeToggle />
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon({ color, size }) {
            return <MapIcon color={color} size={size} />
          },
          headerLeftContainerStyle: { paddingLeft: 15 },
          headerRightContainerStyle: { paddingRight: 15 },
          headerLeft: () => <HeaderSidebarBackButton />,
          headerRight: () => <ProfileThemeToggle />,
          href: null
        }}
      />
    </Tabs>
  )
}
