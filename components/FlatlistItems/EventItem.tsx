import React from 'react'
import { TouchableOpacity } from 'react-native'
import { Events } from '~/lib/types/collections'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from '~/components/ui/card'
import { ClockIcon, MapPinIcon, UsersIcon } from 'lucide-react-native'
import { useColorScheme } from '~/lib/useColorScheme'
import { Link } from 'expo-router'
import {
  calculateTimeLeft,
  formatDateLocale,
} from '~/components/calculateTimeLeft'

// eslint-disable-next-line react/display-name
const EventItem = React.memo(
  ({ event }: { event: Events.EventsDocumentsType }) => {
    const { isDarkColorScheme } = useColorScheme()
    const theme = isDarkColorScheme ? 'white' : 'black'

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
              <CardTitle className={'justify-between mt-2 text-xl'}>
                {event.title}
              </CardTitle>
              <CardFooter className={'p-0 mt-2 justify-between flex flex-wrap'}>
                <CardDescription>
                  <ClockIcon size={12} color={theme} />{' '}
                  {formatDateLocale(new Date(event.date))}
                </CardDescription>
                <CardDescription>
                  {calculateTimeLeft(event.date, event.dateUntil)}
                </CardDescription>
              </CardFooter>

              {event.location && (
                <CardFooter className={'p-0 mt-2 flex flex-wrap'}>
                  <CardDescription>
                    <MapPinIcon size={12} color={theme} /> {event.location}
                  </CardDescription>
                </CardFooter>
              )}

              <CardFooter className={'p-0 mt-2 flex flex-wrap'}>
                <CardDescription>
                  <UsersIcon size={12} color={theme} /> {event.attendees}
                </CardDescription>
              </CardFooter>
            </CardContent>
          </Card>
        </TouchableOpacity>
      </Link>
    )
  }
)

export default EventItem
