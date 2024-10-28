import { RefreshControl, ScrollView, View } from 'react-native'
import { H1, Muted } from '~/components/ui/typography'
import { Stack, useLocalSearchParams } from 'expo-router'
import { Events } from '~/lib/types/collections'
import { databases, functions } from '~/lib/appwrite-client'
import React, { useEffect, useState } from 'react'
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

export default function EventPage() {
  const local = useLocalSearchParams()
  const [event, setEvent] = useState<Events.EventsDocumentsType>(null)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? 'white' : 'black'

  const fetchEvents = async () => {
    try {
      const document: Events.EventsDocumentsType = await databases.getDocument(
        'hp_db',
        'events',
        `${local?.eventId}`
      )

      setEvent(document)

      const eventResponse = await functions.createExecution(
        'event-endpoints',
        '',
        false,
        `/event/attendees?eventId=${local?.eventId}`,
        ExecutionMethod.GET
      )
      const event = JSON.parse(eventResponse.responseBody)
      setEvent({ ...document, attendees: event })
    } catch {
      setRefreshing(false)
    } finally {
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchEvents().then()
  }

  useEffect(() => {
    setRefreshing(true)
    fetchEvents().then()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local.eventId])

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

  if (!event)
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
