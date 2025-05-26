import { Tabs } from 'expo-router'
import {
  CalendarCheck2Icon,
  CalendarClockIcon,
  CalendarIcon
} from 'lucide-react-native'
import FeatureAccess from '~/components/FeatureAccess'
import { i18n } from '~/components/system/i18n'

export default function TabsLayout() {
  return (
    <FeatureAccess featureName={'events'}>
      <Tabs backBehavior={'history'}>
        <Tabs.Screen
          name="index"
          options={{
            title: i18n.t('events.tabs.active'),
            tabBarIcon({ color, size }) {
              return <CalendarIcon color={color} size={size} />
            }
          }}
        />
        <Tabs.Screen
          name="upcoming"
          options={{
            title: i18n.t('events.tabs.upcoming'),
            tabBarIcon({ color, size }) {
              return <CalendarClockIcon color={color} size={size} />
            }
          }}
        />
        <Tabs.Screen
          name="archived"
          options={{
            title: i18n.t('events.tabs.archived'),
            tabBarIcon({ color, size }) {
              return <CalendarCheck2Icon color={color} size={size} />
            }
          }}
        />
        <Tabs.Screen
          name="[eventId]/index"
          options={{
            href: null,
            title: 'Event Detail'
          }}
        />
      </Tabs>
    </FeatureAccess>
  )
}
