import { Tabs } from 'expo-router'
import { MapIcon, PersonStandingIcon } from 'lucide-react-native'
import { useUser } from '~/components/contexts/UserContext'
import { HeaderSidebarBackButton } from '~/components/data/DrawerScreensData'
import React from 'react'

export default function TabsLayout() {
  const { current } = useUser()
  return (
    <Tabs backBehavior={'history'} initialRouteName={'index'}>
      <Tabs.Screen
        name="contacts"
        options={{
          title: 'Contacts',
          tabBarIcon({ color, size }) {
            return <PersonStandingIcon color={color} size={size} />
          },
          headerLeftContainerStyle: { paddingLeft: 15 },
          headerRightContainerStyle: { paddingRight: 15 },
          headerLeft: () => <HeaderSidebarBackButton />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chat',
          tabBarIcon({ color, size }) {
            return <MapIcon color={color} size={size} />
          },
          headerLeftContainerStyle: { paddingLeft: 15 },
          headerRightContainerStyle: { paddingRight: 15 },
          headerLeft: () => <HeaderSidebarBackButton />,
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
        }}
      />
    </Tabs>
  )
}
