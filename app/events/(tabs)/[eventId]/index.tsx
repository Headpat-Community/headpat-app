import { RefreshControl, ScrollView, View } from 'react-native'
import { H1, H3, Muted } from '~/components/ui/typography'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { Events } from '~/lib/types/collections'
import { database } from '~/lib/appwrite-client'
import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '~/components/ui/card'
import { Text } from '~/components/ui/text'
import { formatDate } from '~/components/calculateTimeLeft'
import { Separator } from '~/components/ui/separator'
import { Badge } from '~/components/ui/badge'
import { useColorScheme } from '~/lib/useColorScheme'
import { TouchableOpacity } from '@gorhom/bottom-sheet'
import { ArrowLeftIcon } from 'lucide-react-native'
import HTMLView from 'react-native-htmlview'
import sanitizeHtml from 'sanitize-html'

function HeaderSidebarBackButton({ type }: { type?: string }) {
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? 'white' : 'black'
  return (
    <View style={{ paddingLeft: 16 }}>
      <TouchableOpacity
        onPress={() => {
          type === 'upcoming'
            ? router.navigate(`/events/(tabs)/upcoming`)
            : router.back()
        }}
      >
        <ArrowLeftIcon aria-label={'Go back'} size={20} color={theme} />
      </TouchableOpacity>
    </View>
  )
}

export default function EventPage() {
  const local = useLocalSearchParams()
  const [event, setEvent] = useState<Events.EventsDocumentsType>(null)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? 'white' : 'black'

  const fetchEvents = async () => {
    try {
      setRefreshing(true)
      const data: Events.EventsDocumentsType = await database.getDocument(
        'hp_db',
        'events',
        `${local.eventId}`
      )

      setEvent(data)
      setRefreshing(false)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchEvents().then()
    setRefreshing(false)
  }

  useEffect(() => {
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
            headerTitle: 'Event',
            headerLeft: () => <HeaderSidebarBackButton />,
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
        <Stack.Screen
          options={{
            headerTitle: 'Event',
            headerLeft: () => <HeaderSidebarBackButton />,
          }}
        />
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
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Stack.Screen
        options={{
          headerTitle: 'Event',
          headerLeft: () => (
            <HeaderSidebarBackButton type={local.type as string} />
          ),
        }}
      />
      <View className={'gap-4 mx-2 mt-4'}>
        <H3 className={'text-foreground text-center'}>{event?.title}</H3>
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
                    color: 'blue',
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
  )
}
