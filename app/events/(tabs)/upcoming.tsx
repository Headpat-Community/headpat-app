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
import { useCallback, useEffect, useState } from 'react'
import { functions } from '~/lib/appwrite-client'
import { Events } from '~/lib/types/collections'
import { H1, H3, Muted } from '~/components/ui/typography'
import { ExecutionMethod } from 'react-native-appwrite'
import {
  calculateTimeLeft,
  formatDateLocale,
} from '~/components/calculateTimeLeft'
import { Link } from 'expo-router'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'
import { useFocusEffect } from '@react-navigation/core'

export default function EventsPage() {
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? 'white' : 'black'
  const [events, setEvents] = useState<Events.EventsDocumentsType[]>([])
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const { showLoadingModal, hideLoadingModal, showAlertModal } = useAlertModal()

  const fetchEvents = async () => {
    try {
      const data = await functions.createExecution(
        'event-endpoints',
        '',
        false,
        '/getUpcomingEvents',
        ExecutionMethod.GET
      )
      const response: Events.EventsDocumentsType[] = JSON.parse(
        data.responseBody
      )

      setEvents(response)
      hideLoadingModal()
      setRefreshing(false)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      showAlertModal(
        'FAILED',
        'Failed to fetch events. Please try again later.'
      )
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchEvents().then()
  }

  useFocusEffect(
    useCallback(() => {
      onRefresh()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  )

  useEffect(() => {
    showLoadingModal()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
              <H1 className={'text-foreground text-center'}>Upcoming</H1>
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
                  params: { eventId: event.$id, type: 'upcoming' },
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
                          {formatDateLocale(new Date(event.date))}
                        </CardDescription>
                        <CardDescription>
                          {calculateTimeLeft(event.date, event.dateUntil, true)}
                        </CardDescription>
                      </CardFooter>

                      {event?.locationZoneMethod === 'virtual' && (
                        <CardFooter className={'p-0 mt-2 flex flex-wrap'}>
                          <CardDescription>
                            <MapPinIcon size={12} color={theme} />{' '}
                            {event.location}
                          </CardDescription>
                        </CardFooter>
                      )}
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
