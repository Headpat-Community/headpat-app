import { Tabs } from 'expo-router'
import { LayoutPanelLeft, MenuSquare } from '~/components/Icons'
import { LoginView } from '~/components/views/LoginView'
import { ThemeToggle } from '~/components/ThemeToggle'

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
        }}
      />
      <Tabs.Screen
        name="components"
        options={{
          title: 'Components',
          tabBarIcon({ color, size }) {
            return <MenuSquare color={color} size={size} />
          },
        }}
      />
    </Tabs>
  )
}
