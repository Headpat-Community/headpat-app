import { Tabs } from 'expo-router'
import { MapIcon, PersonStandingIcon, UsersIcon } from 'lucide-react-native'

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Map',
          tabBarIcon({ color, size }) {
            return <MapIcon color={color} size={size} />
          },
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="mutualsList"
        options={{
          title: 'Mutuals',
          tabBarIcon({ color, size }) {
            return <UsersIcon color={color} size={size} />
          },
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="share"
        options={{
          title: 'Share my location',
          tabBarIcon({ color, size }) {
            return <PersonStandingIcon color={color} size={size} />
          },
          headerShown: false,
        }}
      />
    </Tabs>
  )
}
