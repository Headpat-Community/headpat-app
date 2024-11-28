import { RefreshControl, ScrollView, View } from 'react-native'
import { H1, Muted } from '~/components/ui/typography'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { Events } from '~/lib/types/collections'
import { databases, functions } from '~/lib/appwrite-client'
import React from 'react'
import { Card, CardContent } from '~/components/ui/card'
import { Text } from '~/components/ui/text'
import { formatDate } from '~/components/calculateTimeLeft'
import { Separator } from '~/components/ui/separator'
import { Badge } from '~/components/ui/badge'
import { useColorScheme } from '~/lib/useColorScheme'
import HTMLView from 'react-native-htmlview'
import sanitizeHtml from 'sanitize-html'
import { UsersIcon } from 'lucide-react-native'
import { Skeleton } from '~/components/ui/skeleton'
import { ExecutionMethod } from 'react-native-appwrite'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'
import { useFocusEffect } from '@react-navigation/core'
import { Button } from '~/components/ui/button'

export default function EventPage() {
  const local = useLocalSearchParams()
  const [event, setEvent] = React.useState<Events.EventsDocumentsType>(null)
  const [refreshing, setRefreshing] = React.useState<boolean>(true)
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? 'white' : 'black'
  const { showAlertModal, hideLoadingModal } = useAlertModal()

  const fetchEvents = async () => {
    try {
      const document: Events.EventsDocumentsType = await databases.getDocument(
        'hp_db',
        'events',
        `${local?.eventId}`
      )

      setEvent(document)
      setRefreshing(false)

      const eventResponse = await functions.createExecution(
        'event-endpoints',
        '',
        false,
        `/event/attendees?eventId=${local?.eventId}`,
        ExecutionMethod.GET
      )
      const event = JSON.parse(eventResponse.responseBody)
      setEvent({
        ...document,
        attendees: event.attendees,
        isAttending: event.isAttending,
      })
    } catch {
      showAlertModal('FAILED', 'Failed to fetch event data.')
      setRefreshing(false)
    }
  }

  const attendEvent = async () => {
    try {
      const eventResponse = await functions.createExecution(
        'event-endpoints',
        '',
        false,
        `/event/attendee?eventId=${local?.eventId}`,
        ExecutionMethod.POST
      )
      const event = JSON.parse(eventResponse.responseBody)
      console.log(event)

      if (event.type === 'event_attendee_add_already_added') {
        showAlertModal('FAILED', 'You are already attending this event.')
      } else if (event.type === 'event_attendee_add_success') {
        setEvent((prev) => ({
          ...prev,
          attendees: Array.isArray(prev.attendees)
            ? prev.attendees
            : prev.attendees + 1,
          isAttending: true,
        }))
        hideLoadingModal()
      } else {
        showAlertModal(
          'FAILED',
          'Failed to attend event. Please try again later.'
        )
      }
    } catch {
      showAlertModal('FAILED', 'Failed to fetch event data.')
    }
  }

  const removeAttendee = async () => {
    console.log('removeAttendee')
    try {
      const eventResponse = await functions.createExecution(
        'event-endpoints',
        '',
        false,
        `/event/attendee?eventId=${local?.eventId}`,
        ExecutionMethod.DELETE
      )
      const event = JSON.parse(eventResponse.responseBody)
      console.log(event)

      if (event.type === 'event_attendee_remove_not_found') {
        return showAlertModal('FAILED', 'You are not attending this event.')
      } else if (event.type === 'event_attendee_remove_success') {
        setEvent((prev) => ({
          ...prev,
          attendees: Array.isArray(prev.attendees)
            ? prev.attendees
            : prev.attendees - 1,
          isAttending: false,
        }))
        hideLoadingModal()
      } else {
        showAlertModal('FAILED', 'Failed to remove attendee.')
      }
    } catch {
      showAlertModal('FAILED', 'Failed to remove attendee.')
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchEvents().then()
  }

  useFocusEffect(
    React.useCallback(() => {
      if (!local?.eventId)
        return () => {
          showAlertModal('FAILED', 'Event ID not found.')
          setEvent(null)
          router.back()
        }
      fetchEvents().then()
      return () => {
        setEvent(null)
      }
    }, [local?.eventId])
  )

  if (refreshing)
    return (
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerClassName={'flex-1 justify-center items-center h-full'}
      >
        <Stack.Screen
          options={{
            headerTitle: 'What is this event?',
          }}
        />
        <View className={'p-4 native:pb-24 max-w-md gap-6'}>
          <View className={'gap-1'}>
            <H1 className={'text-foreground text-center'}>Event</H1>
            <Muted className={'text-base text-center'}>Loading...</Muted>
          </View>
        </View>
      </ScrollView>
    )

  if (!refreshing && !event)
    return (
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerClassName={'flex-1 justify-center items-center h-full'}
      >
        <View className={'p-4 native:pb-24 max-w-md gap-6'}>
          <View className={'gap-1'}>
            <H1 className={'text-foreground text-center'}>Event</H1>
            <Muted className={'text-base text-center'}>
              Event unavailable. Does it even exist?
            </Muted>
          </View>
        </View>
      </ScrollView>
    )

  const sanitizedDescription = sanitizeHtml(event.description)

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: event?.title || 'Event',
        }}
      />
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className={'gap-4 mx-2 mt-4'}>
          {event?.label && (
            <Badge>
              <Text>{event?.label}</Text>
            </Badge>
          )}
          <Separator />
          <View className={'flex-row justify-between gap-4'}>
            <Card className={'flex-1 p-0'}>
              <CardContent className={'p-6'}>
                <Text className={'font-bold'}>Start: </Text>
                <Text>{formatDate(new Date(event?.date))}</Text>
              </CardContent>
            </Card>

            <Card className={'flex-1 p-0'}>
              <CardContent className={'p-6'}>
                <Text className={'font-bold'}>End: </Text>
                <Text>{formatDate(new Date(event?.dateUntil))}</Text>
              </CardContent>
            </Card>
          </View>

          <View>
            <Card className={'flex-1 p-0'}>
              <CardContent className={'p-6'}>
                <Text className={'font-bold'}>Location: </Text>
                <Text>{event?.location || 'No location given.'}</Text>
              </CardContent>
            </Card>
          </View>

          <View>
            <Card className={'flex-1 p-0'}>
              <CardContent className={'p-6'}>
                <HTMLView
                  value={sanitizedDescription}
                  stylesheet={{
                    p: {
                      color: theme,
                    },
                    a: {
                      color: 'hsl(208, 100%, 50%)',
                    },
                  }}
                  textComponentProps={{
                    style: {
                      color: theme,
                    },
                  }}
                />
              </CardContent>
            </Card>
          </View>

          <View>
            {event?.attendees == null ? (
              <View className={'flex-row gap-2 justify-center items-center'}>
                <Skeleton
                  className={
                    'h-12 w-full self-center rounded border border-border'
                  }
                />
              </View>
            ) : (
              <Button
                variant={'default'}
                className={'flex-1 p-0'}
                onPress={event.isAttending ? removeAttendee : attendEvent}
                disabled={new Date() > new Date(event?.dateUntil)}
              >
                <Text className={'font-bold'}>
                  {new Date() > new Date(event?.dateUntil)
                    ? 'Event has ended!'
                    : event?.attendees === 0
                      ? 'Be the first to attend!'
                      : event?.isAttending
                        ? 'Currently attending'
                        : 'Attend this event!'}
                </Text>
              </Button>
            )}
          </View>
        </View>
      </ScrollView>

      {event.attendees === null || event.attendees === undefined ? (
        <Skeleton
          className={
            'absolute flex-row gap-2 bottom-4 mb-4 justify-center items-center h-12 w-64  self-center rounded border border-border'
          }
        />
      ) : (
        <View
          className={
            'absolute flex-row gap-2 bottom-4 mb-4 justify-center items-center h-12 w-64 bg-card self-center rounded border border-border'
          }
        >
          <UsersIcon className={'h-4 w-4'} color={theme} size={16} />
          <Text className={'text-center font-bold items-center'}>
            {event.attendees}
          </Text>
        </View>
      )}
    </>
  )
}
