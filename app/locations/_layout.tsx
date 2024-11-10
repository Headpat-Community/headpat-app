import { Tabs } from 'expo-router'
import { MapIcon, PersonStandingIcon } from 'lucide-react-native'
import { useUser } from '~/components/contexts/UserContext'
import FeatureAccess from '~/components/FeatureAccess'

export default function TabsLayout() {
  const { current } = useUser()
  return (
    <FeatureAccess featureName={'locationSharing'}>
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
    </FeatureAccess>
  )
}
