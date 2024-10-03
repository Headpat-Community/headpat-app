import { Tabs } from 'expo-router'
import { CogIcon, ServerCogIcon } from 'lucide-react-native'

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'General',
          tabBarIcon({ color, size }) {
            return <CogIcon color={color} size={size} />
          },
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="advanced"
        options={{
          title: 'Advanced',
          tabBarIcon({ color, size }) {
            return <ServerCogIcon color={color} size={size} />
          },
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="avatarAdd/index"
        options={{
          title: 'Avatar Add',
          href: null,
        }}
      />
      <Tabs.Screen
        name="bannerAdd/index"
        options={{
          title: 'Banner Add',
          href: null,
        }}
      />
    </Tabs>
  )
}
