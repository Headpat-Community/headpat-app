import { Link } from 'expo-router'
import { useTranslations } from 'gt-react-native'
import { ClockIcon, MapPinIcon, UsersIcon } from 'lucide-react-native'
import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { calculateTimeLeftEvent, formatDateLocale } from '~/components/calculateTimeLeft'
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from '~/components/ui/card'
import { Text } from '~/components/ui/text'
import type { EventsDocumentsType } from '~/lib/types/collections'
import { useColorScheme } from '~/lib/useColorScheme'

const EventItem = React.memo(({ event }: { event: EventsDocumentsType }) => {
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? 'white' : 'black'
  const t = useTranslations()

  return (
    <Link
      href={{
        pathname: '/events/[eventId]',
        params: { eventId: event.$id, type: 'index' },
      }}
      asChild
    >
      <TouchableOpacity className={'my-2'}>
        <Card>
          <CardContent>
            <CardTitle className={'mt-2 justify-between text-xl'}>{event.title}</CardTitle>
            <CardFooter className={'mt-2 flex flex-wrap justify-between p-0'}>
              <CardDescription>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <ClockIcon size={12} color={theme} />
                  <Text style={{ marginLeft: 4 }}>{formatDateLocale(new Date(event.date))}</Text>
                </View>
              </CardDescription>
              <CardDescription>
                <Text>{calculateTimeLeftEvent(t, event.date, event.dateUntil)}</Text>
              </CardDescription>
            </CardFooter>

            {event.location && (
              <CardFooter className={'mt-2 flex flex-wrap p-0'}>
                <CardDescription>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MapPinIcon size={12} color={theme} />
                    <Text style={{ marginLeft: 4 }}>{event.location}</Text>
                  </View>
                </CardDescription>
              </CardFooter>
            )}

            <CardFooter className={'mt-2 flex flex-wrap p-0'}>
              <CardDescription>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <UsersIcon size={12} color={theme} />
                  <Text style={{ marginLeft: 4 }}>{event.attendees}</Text>
                </View>
              </CardDescription>
            </CardFooter>
          </CardContent>
        </Card>
      </TouchableOpacity>
    </Link>
  )
})

export default EventItem
