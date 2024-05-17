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
import { database } from '~/lib/appwrite-client'
import { EventsDocumentsType, EventsType } from '~/lib/types/collections'
import { H1, H3, Muted } from '~/components/ui/typography'
import { Query } from 'react-native-appwrite'

export default function EventsPage() {
  const { isDarkColorScheme } = useColorScheme()
  const icon_color = isDarkColorScheme ? 'white' : 'black'
  const [events, setEvents] = useState<EventsDocumentsType[]>()
  const [refreshing, setRefreshing] = useState<boolean>(false)

  const fetchEvents = async () => {
    try {
      const data: EventsType = await database.listDocuments('hp_db', 'events', [
        Query.orderAsc('date'),
      ])
      const currentDate = new Date()

      setEvents(
        data.documents.filter((event) => {
          const eventDateUntil = new Date(event.dateUntil)
          return eventDateUntil > currentDate
        })
      )
    } catch (error) {
      console.error(error)
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
                No events available
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
            const formatDate = (date: Date) => {
              const day = date.getDate().toString().padStart(2, '0')
              const month = (date.getMonth() + 1).toString().padStart(2, '0') // Months are 0-based in JavaScript
              const year = date.getFullYear()
              const hours = date.getHours().toString().padStart(2, '0')
              const minutes = date.getMinutes().toString().padStart(2, '0')
              return `${day}/${month}/${year} @ ${hours}:${minutes}`
            }

            const calculateTimeLeft = (eventDate: string) => {
              const now = new Date()
              const event = new Date(eventDate)
              const differenceInTime = event.getTime() - now.getTime()

              const differenceInDays = Math.ceil(
                differenceInTime / (1000 * 3600 * 24)
              )
              const differenceInHours = Math.ceil(
                differenceInTime / (1000 * 3600)
              )
              const differenceInMinutes = Math.ceil(
                differenceInTime / (1000 * 60)
              )

              if (differenceInMinutes < 0) {
                return 'Event has ended'
              } else if (differenceInDays > 1) {
                return `${differenceInDays} days left`
              } else if (differenceInHours > 1) {
                return `${differenceInHours} hours left`
              } else {
                return `${differenceInMinutes} minutes left`
              }
            }

            return (
              <Card key={index}>
                <CardContent>
                  <CardTitle className={'justify-between mt-2 text-xl'}>
                    {event.title}
                  </CardTitle>
                  <CardFooter
                    className={'p-0 mt-2 justify-between flex flex-wrap'}
                  >
                    <CardDescription>
                      <ClockIcon size={12} color={icon_color} />{' '}
                      {formatDate(new Date(event.date))}
                    </CardDescription>
                    <CardDescription>
                      {calculateTimeLeft(event.dateUntil)}
                    </CardDescription>
                  </CardFooter>

                  <CardFooter className={'p-0 mt-2 flex flex-wrap'}>
                    <CardDescription>
                      <MapPinIcon size={12} color={icon_color} />{' '}
                      {event.location}
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
