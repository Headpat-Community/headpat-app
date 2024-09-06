import { Tabs } from 'expo-router'
import { MapIcon, RadioIcon } from 'lucide-react-native'

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'User Settings',
          tabBarIcon({ color, size }) {
            return <MapIcon color={color} size={size} />
          },
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="socials"
        options={{
          title: 'Socials',
          tabBarIcon({ color, size }) {
            return <RadioIcon color={color} size={size} />
          },
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="avatarAdd/index"
        options={{
          title: 'Avatar Add',
          headerShown: false,
          href: null,
        }}
      />
      <Tabs.Screen
        name="bannerAdd/index"
        options={{
          title: 'Banner Add',
          headerShown: false,
          href: null,
        }}
      />
    </Tabs>
  )
}
