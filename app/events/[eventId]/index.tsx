import { RefreshControl, ScrollView, View } from 'react-native'
import { H1, H3, Muted } from '~/components/ui/typography'
import { useLocalSearchParams } from 'expo-router'
import { EventsDocumentsType } from '~/lib/types/collections'
import { database } from '~/lib/appwrite-client'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '~/components/ui/card'
import { Text } from '~/components/ui/text'
import { formatDate } from '~/components/calculateTimeLeft'
import { Separator } from '~/components/ui/separator'
import { Badge } from '~/components/ui/badge'

export default function EventPage() {
  const local = useLocalSearchParams()
  const [event, setEvent] = useState<EventsDocumentsType>(null)
  const [refreshing, setRefreshing] = useState<boolean>(false)

  const fetchEvents = async () => {
    try {
      setRefreshing(true)
      const data: EventsDocumentsType = await database.getDocument(
        'hp_db',
        'events',
        `${local.eventId}`
      )

      setEvent(data)
      setRefreshing(false)
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
  }, [local.eventId])

  if (refreshing)
    return (
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className={'flex-1 justify-center items-center'}>
          <View className={'p-4 native:pb-24 max-w-md gap-6'}>
            <View className={'gap-1'}>
              <H1 className={'text-foreground text-center'}>Event</H1>
              <Muted className={'text-base text-center'}>Loading...</Muted>
            </View>
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
      >
        <View className={'flex-1 justify-center items-center h-full'}>
          <View className={'p-4 native:pb-24 max-w-md gap-6'}>
            <View className={'gap-1'}>
              <H1 className={'text-foreground text-center'}>Event</H1>
              <Muted className={'text-base text-center'}>
                Event unavailable. Does it even exist?
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
    >
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
              <Text>{event?.description || 'No description given.'}</Text>
            </CardContent>
          </Card>
        </View>
      </View>
    </ScrollView>
  )
}
