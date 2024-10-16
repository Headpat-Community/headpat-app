import { Tabs } from 'expo-router'
import { MapIcon, PersonStandingIcon } from 'lucide-react-native'
import { useUser } from '~/components/contexts/UserContext'

export default function TabsLayout() {
  const { current } = useUser()
  return (
    <Tabs backBehavior={'history'}>
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
        name="share"
        options={{
          title: 'Share my location',
          tabBarIcon({ color, size }) {
            return <PersonStandingIcon color={color} size={size} />
          },
          href: current?.$id ? `/locations/share/` : null,
          headerShown: false,
        }}
      />
    </Tabs>
  )
}
