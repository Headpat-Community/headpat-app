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
import { Events, UserData } from '~/lib/types/collections'
import { database, functions } from '~/lib/appwrite-client'
import { H4 } from '~/components/ui/typography'
import { Separator } from '~/components/ui/separator'
import { ExecutionMethod } from 'react-native-appwrite'
import { calculateTimeLeft } from '~/components/calculateTimeLeft'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { TouchableOpacity } from '@gorhom/bottom-sheet'
import { useFocusEffect } from '@react-navigation/core'
import * as Sentry from '@sentry/react-native'
import { Skeleton } from '~/components/ui/skeleton'

export default function HomeView() {
  const [userData, setUserData] = useState<UserData.UserDataDocumentsType>(null)
  const [nextEvent, setNextEvent] = useState<Events.EventsDocumentsType>(null)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? 'white' : 'black'
  const { current, isLoadingUser } = useUser()

  const onRefresh = () => {
    setRefreshing(true)
    fetchUserData().then()
    fetchNextEvent().then()
    setRefreshing(false)
  }

  const getAvatarUrl = (avatarId: string) => {
    if (!avatarId) return
    return `https://api.headpat.place/v1/storage/buckets/avatars/files/${avatarId}/preview?project=hp-main&width=300&height=300`
  }

  const fetchNextEvent = async () => {
    try {
      const data = await functions.createExecution(
        'event-endpoints',
        '',
        false,
        '/getNextEvent',
        ExecutionMethod.GET
      )
      const response: Events.EventsDocumentsType = JSON.parse(data.responseBody)

      if (response?.title) {
        setNextEvent(response)
      } else {
        setNextEvent(null)
      }
    } catch (error) {
      console.error(error)
      Sentry.captureException(error)
    }
  }

  useEffect(() => {
    if (current?.$id) {
      fetchUserData().then()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current])

  const fetchUserData = async () => {
    try {
      const data: UserData.UserDataDocumentsType = await database.getDocument(
        'hp_db',
        'userdata',
        `${current.$id}`
      )
      setUserData(data)
    } catch (error) {
      Sentry.captureException(error)
    }
  }

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
        {isLoadingUser ? (
          <View className={'px-4 m-4 w-full flex flex-col items-center'}>
            <Skeleton className="w-[100px] h-[100px] rounded-3xl mt-4" />
            <Skeleton className="w-[150px] h-[20px] rounded mt-2" />
          </View>
        ) : current ? (
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
          <TouchableOpacity onPress={() => router.push('/gallery/(stacks)')}>
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
          <TouchableOpacity onPress={() => router.push('/locations')}>
            <CardContent className={'p-0'}>
              <CardFooter className={'mt-2 text-xl flex pb-4'}>
                <MapPinnedIcon
                  size={20}
                  color={theme}
                  style={{
                    marginRight: 4,
                  }}
                />
                <Text>Locations</Text>
              </CardFooter>
              <CardFooter
                className={'p-0 pb-2 justify-between flex flex-wrap mx-7'}
              >
                <CardDescription>
                  <Text>Find your mutuals!</Text>
                </CardDescription>
                <CardDescription>
                  <Text>
                    {/* Amount of location users sharing with user */}
                  </Text>
                </CardDescription>
              </CardFooter>
            </CardContent>
          </TouchableOpacity>
        </Card>

        <Card className={'w-3/4 mt-4'}>
          <TouchableOpacity onPress={() => router.push('/announcements')}>
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
          <TouchableOpacity onPress={() => router.push('/events/(tabs)')}>
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
              <CardFooter
                className={'p-0 justify-between flex flex-wrap ml-7 pb-2'}
              >
                <CardDescription>
                  <Text>Looking for fun?</Text>
                </CardDescription>
              </CardFooter>
              {nextEvent && (
                <>
                  <CardFooter className={'pt-2'}>
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
