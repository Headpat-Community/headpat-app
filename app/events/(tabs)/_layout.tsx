import { Tabs } from 'expo-router'
import { CalendarClockIcon, CalendarIcon } from 'lucide-react-native'

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Active',
          tabBarIcon({ color, size }) {
            return <CalendarIcon color={color} size={size} />
          },
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="upcoming"
        options={{
          title: 'Upcoming',
          tabBarIcon({ color, size }) {
            return <CalendarClockIcon color={color} size={size} />
          },
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="archived"
        options={{
          title: 'Archived',
          tabBarIcon({ color, size }) {
            return <CalendarClockIcon color={color} size={size} />
          },
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="[eventId]/index"
        options={{
          href: null,
          title: 'Event Detail',
          headerTitleAlign: 'left',
        }}
      />
    </Tabs>
  )
}
