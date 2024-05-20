import {
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from '~/components/ui/card'
import { ClockIcon, MapPinIcon } from 'lucide-react-native'
import { useColorScheme } from '~/lib/useColorScheme'
import { useEffect, useState } from 'react'
import { database } from '~/lib/appwrite-client'
import { EventsDocumentsType, EventsType } from '~/lib/types/collections'
import { H1, H3, Muted } from '~/components/ui/typography'
import { Query } from 'react-native-appwrite'
import { calculateTimeLeft, formatDate } from '~/components/calculateTimeLeft'
import { toast } from '~/lib/toast'
import { Link } from 'expo-router'

export default function EventsPage() {
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? 'white' : 'black'
  const [events, setEvents] = useState<EventsDocumentsType[]>([])
  const [refreshing, setRefreshing] = useState<boolean>(false)

  const fetchEvents = async () => {
    try {
      const currentDate = new Date()

      const data: EventsType = await database.listDocuments('hp_db', 'events', [
        Query.orderAsc('date'),
        Query.greaterThanEqual('date', currentDate.toISOString()),
      ])

      setEvents(
        data.documents.filter((event) => {
          const eventDateUntil = new Date(event.dateUntil)
          return eventDateUntil > currentDate
        })
      )
    } catch (error) {
      toast('Failed to fetch events. Please try again later.')
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchEvents().then()
    setRefreshing(false)
  }

  useEffect(() => {
    fetchEvents().then()
  }, [])

  if (events?.length === 0 || !events)
    return (
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className={'flex-1 justify-center items-center'}>
          <View className={'p-4 native:pb-24 max-w-md gap-6'}>
            <View className={'gap-1'}>
              <H1 className={'text-foreground text-center'}>Events</H1>
              <Muted className={'text-base text-center'}>
                No upcoming events
              </Muted>
            </View>
          </View>
        </View>
      </ScrollView>
    )

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      className={'mt-2'}
    >
      <View className={'gap-4 mx-2'}>
        <H3 className={'text-foreground text-center'}>Upcoming Events</H3>

        {events &&
          events?.map((event, index) => {
            return (
              <Link
                href={{
                  pathname: '/events/[eventId]',
                  params: { eventId: event.$id },
                }}
                asChild
                key={index}
              >
                <TouchableOpacity>
                  <Card>
                    <CardContent>
                      <CardTitle className={'justify-between mt-2 text-xl'}>
                        {event.title}
                      </CardTitle>
                      <CardFooter
                        className={'p-0 mt-2 justify-between flex flex-wrap'}
                      >
                        <CardDescription>
                          <ClockIcon size={12} color={theme} />{' '}
                          {formatDate(new Date(event.date))}
                        </CardDescription>
                        <CardDescription>
                          {calculateTimeLeft(event.date, event.dateUntil)}
                        </CardDescription>
                      </CardFooter>

                      <CardFooter className={'p-0 mt-2 flex flex-wrap'}>
                        <CardDescription>
                          <MapPinIcon size={12} color={theme} />{' '}
                          {event.location}
                        </CardDescription>
                      </CardFooter>
                    </CardContent>
                  </Card>
                </TouchableOpacity>
              </Link>
            )
          })}
      </View>
    </ScrollView>
  )
}
