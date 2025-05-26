import { Tabs } from 'expo-router'
import { MapIcon, RadioIcon } from 'lucide-react-native'

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="newest"
        options={{
          title: 'Newest',
          tabBarIcon({ color, size }) {
            return <MapIcon color={color} size={size} />
          },
          headerShown: false
        }}
      />
      <Tabs.Screen
        name="random"
        options={{
          title: 'Random',
          tabBarIcon({ color, size }) {
            return <RadioIcon color={color} size={size} />
          },
          headerShown: false
        }}
      />
    </Tabs>
  )
}
