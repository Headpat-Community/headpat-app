import { Tabs } from 'expo-router'
import {
  CalendarCheck2Icon,
  CalendarClockIcon,
  CalendarIcon,
} from 'lucide-react-native'

export default function TabsLayout() {
  return (
    <Tabs backBehavior={'history'}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Active',
          tabBarIcon({ color, size }) {
            return <CalendarIcon color={color} size={size} />
          },
        }}
      />
      <Tabs.Screen
        name="upcoming"
        options={{
          title: 'Upcoming',
          tabBarIcon({ color, size }) {
            return <CalendarClockIcon color={color} size={size} />
          },
        }}
      />
      <Tabs.Screen
        name="archived"
        options={{
          title: 'Archived',
          tabBarIcon({ color, size }) {
            return <CalendarCheck2Icon color={color} size={size} />
          },
        }}
      />
      <Tabs.Screen
        name="[eventId]/index"
        options={{
          href: null,
          title: 'Event Detail',
        }}
      />
    </Tabs>
  )
}
