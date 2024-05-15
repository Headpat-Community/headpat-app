import { RefreshControl, ScrollView, View } from 'react-native'
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
import { EventsType } from '~/lib/types/collections'

export default function EventsPage() {
  const { isDarkColorScheme } = useColorScheme()
  const icon_color = isDarkColorScheme ? 'white' : 'black'
  const [events, setEvents] = useState<EventsType>()
  const [refreshing, setRefreshing] = useState(false)

  const fetchEvents = () => {
    fetch('https://headpat.de/api/events')
      .then((response) => response.json())
      .then((data) => setEvents(data))
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchEvents()
    setRefreshing(false)
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      className={'mt-2'}
    >
      <View className={'gap-4 mx-2'}>
        {events &&
          events.documents.map((event, index) => {
            const formatDate = (date: Date) => {
              const day = date.getDate().toString().padStart(2, '0')
              const month = (date.getMonth() + 1).toString().padStart(2, '0') // Months are 0-based in JavaScript
              const year = date.getFullYear()
              const hours = date.getHours().toString().padStart(2, '0')
              const minutes = date.getMinutes().toString().padStart(2, '0')
              return `${day}/${month}/${year} - ${hours}:${minutes}`
            }

            return (
              <Card key={index}>
                <CardContent>
                  <CardTitle className={'justify-between mt-2 text-xl'}>
                    {event.title}
                  </CardTitle>
                  <CardDescription className={'mt-1'}>
                    {event.description}
                    {event.description}
                    {event.description}
                    {event.description}
                    {event.description}
                    {event.description}
                    {event.description}
                  </CardDescription>
                  <CardFooter
                    className={'p-0 mt-4 justify-between flex flex-wrap'}
                  >
                    <CardDescription>
                      <MapPinIcon size={12} color={icon_color} />{' '}
                      {event.location}
                    </CardDescription>
                    <CardDescription>
                      <ClockIcon size={12} color={icon_color} />{' '}
                      {formatDate(new Date(event.date))}
                    </CardDescription>
                  </CardFooter>
                </CardContent>
              </Card>
            )
          })}
      </View>
    </ScrollView>
  )
}
