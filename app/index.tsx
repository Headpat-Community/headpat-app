import { RefreshControl, ScrollView, View } from 'react-native'
import { Text } from '~/components/ui/text'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
} from '~/components/ui/card'
import {
  CalendarClockIcon,
  ClockIcon,
  LayoutDashboardIcon,
  MapPinIcon,
  MapPinnedIcon,
  MegaphoneIcon,
} from 'lucide-react-native'
import { useColorScheme } from '~/lib/useColorScheme'
import { useUser } from '~/components/contexts/UserContext'
import { useCallback, useEffect, useState } from 'react'
import {
  EventsDocumentsType,
  EventsType,
  UserDataDocumentsType,
} from '~/lib/types/collections'
import { database } from '~/lib/appwrite-client'
import { H4 } from '~/components/ui/typography'
import { Separator } from '~/components/ui/separator'
import { Query } from 'react-native-appwrite'
import { calculateTimeLeft } from '~/components/calculateTimeLeft'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { TouchableOpacity } from '@gorhom/bottom-sheet'
import { useFocusEffect } from '@react-navigation/core'
import * as Sentry from '@sentry/react-native'

export default function HomeView() {
  const [userData, setUserData] = useState<UserDataDocumentsType>(null)
  const [nextEvent, setNextEvent] = useState<EventsDocumentsType>(null)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? 'white' : 'black'
  const user: any = useUser()

  const onRefresh = () => {
    setRefreshing(true)
    fetchNextEvent().then()
    setRefreshing(false)
  }

  const getAvatarUrl = (avatarId: string) => {
    if (!avatarId) return
    return `https://api.headpat.de/v1/storage/buckets/avatars/files/${avatarId}/preview?project=6557c1a8b6c2739b3ecf&width=300&height=300`
  }

  const fetchNextEvent = async () => {
    try {
      const data: EventsType = await database.listDocuments('hp_db', 'events', [
        Query.orderAsc('date'),
        Query.greaterThanEqual('date', new Date().toISOString()),
        Query.limit(1),
      ])

      if (data?.documents?.length > 0) {
        setNextEvent(data.documents[0])
      } else {
        setNextEvent(null)
      }
    } catch (error) {
      //console.error(error)
      Sentry.captureException(error)
    }
  }

  useEffect(() => {
    if (user?.current?.$id) {
      const fetchUserData = async () => {
        try {
          const data: UserDataDocumentsType = await database.getDocument(
            'hp_db',
            'userdata',
            `${user?.current?.$id}`
          )
          setUserData(data)
        } catch (error) {
          Sentry.captureException(error)
          return
        }
      }
      fetchUserData().then()
    }
  }, [user])

  useFocusEffect(
    useCallback(() => {
      fetchNextEvent().then()
    }, [])
  )

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="justify-center items-center">
        {user?.current?.$id ? (
          <>
            <Image
              source={
                getAvatarUrl(userData?.avatarId) ||
                require('~/assets/pfp-placeholder.png')
              }
              style={{
                width: 100,
                height: 100,
                borderRadius: 25,
                marginTop: 20,
              }}
            />
            {userData?.displayName ? (
              <H4 className={'mt-2'}>Welcome back, {userData?.displayName}</H4>
            ) : (
              <H4 className={'mt-2'}>Welcome back!</H4>
            )}
          </>
        ) : (
          <H4 className={'mt-10'}>Welcome to Headpat!</H4>
        )}

        <Card className={'w-3/4 mt-8'}>
          <TouchableOpacity onPress={() => router.navigate('/gallery')}>
            <CardContent className={'p-0'}>
              <CardFooter className={'mt-2 text-xl flex pb-4'}>
                <LayoutDashboardIcon
                  size={20}
                  color={theme}
                  style={{
                    marginRight: 4,
                  }}
                />
                <Text>Gallery</Text>
              </CardFooter>
              <CardFooter
                className={'p-0 pb-2 justify-between flex flex-wrap ml-7'}
              >
                <CardDescription>
                  <Text>The place for all the pictures.</Text>
                </CardDescription>
              </CardFooter>
            </CardContent>
          </TouchableOpacity>
        </Card>

        <Card className={'w-3/4 mt-4'}>
          <TouchableOpacity onPress={() => router.navigate('/friends')}>
            <CardContent className={'p-0'}>
              <CardFooter className={'mt-2 text-xl flex pb-4'}>
                <MapPinnedIcon
                  size={20}
                  color={theme}
                  style={{
                    marginRight: 4,
                  }}
                />
                <Text>Friend locations</Text>
              </CardFooter>
              <CardFooter
                className={'p-0 pb-2 justify-between flex flex-wrap mx-7'}
              >
                <CardDescription>
                  <Text>Find your friends!</Text>
                </CardDescription>
                <CardDescription>
                  <Text>a</Text>
                </CardDescription>
              </CardFooter>
            </CardContent>
          </TouchableOpacity>
        </Card>

        <Card className={'w-3/4 mt-4'}>
          <TouchableOpacity onPress={() => router.navigate('/announcements')}>
            <CardContent className={'p-0'}>
              <CardFooter className={'mt-2 text-xl flex pb-4'}>
                <MegaphoneIcon
                  size={20}
                  color={theme}
                  style={{
                    marginRight: 4,
                  }}
                />
                <Text>Announcements</Text>
              </CardFooter>
              <CardFooter
                className={'p-0 pb-2 justify-between flex flex-wrap ml-7'}
              >
                <CardDescription>
                  <Text>Stay updated with our news.</Text>
                </CardDescription>
              </CardFooter>
            </CardContent>
          </TouchableOpacity>
        </Card>

        <Card className={'w-3/4 mt-4'}>
          <TouchableOpacity onPress={() => router.navigate('/events/(tabs)')}>
            <CardContent className={'p-0'}>
              <CardFooter className={'mt-2 text-xl flex pb-4'}>
                <CalendarClockIcon
                  size={20}
                  color={theme}
                  style={{
                    marginRight: 4,
                  }}
                />
                <Text>Events</Text>
              </CardFooter>
              <CardFooter className={'p-0 justify-between flex flex-wrap ml-7'}>
                <CardDescription>
                  <Text>Looking for fun?</Text>
                </CardDescription>
              </CardFooter>
              {nextEvent && (
                <>
                  <CardFooter className={'mt-4'}>
                    <Separator />
                  </CardFooter>
                  <CardFooter className={'p-0 flex flex-wrap ml-7 mb-2'}>
                    <CardDescription>
                      <ClockIcon size={12} color={theme} /> {nextEvent?.title} -{' '}
                      {calculateTimeLeft(nextEvent?.date, nextEvent?.dateUntil)}
                    </CardDescription>
                  </CardFooter>
                  {nextEvent?.locationZoneMethod === 'virtual' && (
                    <CardFooter className={'p-0 flex flex-wrap ml-7 mt-1 pb-2'}>
                      <CardDescription>
                        <MapPinIcon size={12} color={theme} />{' '}
                        {nextEvent?.location}
                      </CardDescription>
                    </CardFooter>
                  )}
                </>
              )}
            </CardContent>
          </TouchableOpacity>
        </Card>
      </View>
    </ScrollView>
  )
}
