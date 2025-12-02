import { Tabs } from 'expo-router'
import { useTranslations } from 'gt-react-native'
import { CalendarCheck2Icon, CalendarClockIcon, CalendarIcon } from 'lucide-react-native'
import FeatureAccess from '~/components/FeatureAccess'

export default function TabsLayout() {
  const t = useTranslations()
  return (
    <FeatureAccess featureName={'events'}>
      <Tabs backBehavior={'history'}>
        <Tabs.Screen
          name="index"
          options={{
            title: t('events.tabs.active'),
            tabBarIcon({ color, size }) {
              return <CalendarIcon color={color} size={size} />
            },
          }}
        />
        <Tabs.Screen
          name="upcoming"
          options={{
            title: t('events.tabs.upcoming'),
            tabBarIcon({ color, size }) {
              return <CalendarClockIcon color={color} size={size} />
            },
          }}
        />
        <Tabs.Screen
          name="archived"
          options={{
            title: t('events.tabs.archived'),
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
    </FeatureAccess>
  )
}
