import { Tabs } from 'expo-router'
import { LayoutPanelLeft, MenuSquare } from '~/components/Icons'
import { LoginView } from '~/components/views/LoginView'
import { ThemeToggle } from '~/components/ThemeToggle'
import { View } from 'react-native'

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Gallery',
          tabBarIcon({ color, size }) {
            return <LayoutPanelLeft color={color} size={size} />
          },
          headerLeft: () => <LoginView />,
          headerRight: () => <ThemeToggle />,
        }}
      />
      <Tabs.Screen
        name="components"
        options={{
          title: 'Components',
          tabBarIcon({ color, size }) {
            return <MenuSquare color={color} size={size} />
          },
          headerRight: () => <ThemeToggle />,
        }}
      />
    </Tabs>
  )
}
