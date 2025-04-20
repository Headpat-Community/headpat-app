import { RefreshControl, ScrollView, View } from 'react-native'
import { CardDescription, CardFooter } from '~/components/ui/card'
import {
  CalendarClockIcon,
  ClockIcon,
  LayoutDashboardIcon,
  MapPinIcon,
  MapPinnedIcon,
  MegaphoneIcon,
  UserIcon,
  BellIcon,
} from 'lucide-react-native'
import { useColorScheme } from '~/lib/useColorScheme'
import { useUser } from '~/components/contexts/UserContext'
import { Events, UserData } from '~/lib/types/collections'
import { databases, functions } from '~/lib/appwrite-client'
import { H4 } from '~/components/ui/typography'
import { ExecutionMethod } from 'react-native-appwrite'
import { calculateTimeLeftEvent } from '~/components/calculateTimeLeft'
import { Image } from 'expo-image'
import { useFocusEffect } from '@react-navigation/core'
import * as Sentry from '@sentry/react-native'
import { Skeleton } from '~/components/ui/skeleton'
import { i18n } from '~/components/system/i18n'
import React from 'react'
import { HomeCard } from '~/components/home/home-card'

export default function HomeView() {
  const [userData, setUserData] =
    React.useState<UserData.UserDataDocumentsType>(null)
  const [nextEvent, setNextEvent] =
    React.useState<Events.EventsDocumentsType>(null)
  const [refreshing, setRefreshing] = React.useState<boolean>(false)
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
        '/event/next',
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

  React.useEffect(() => {
    if (current?.$id) {
      fetchUserData().then()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current])

  const fetchUserData = async () => {
    try {
      const data: UserData.UserDataDocumentsType = await databases.getDocument(
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
    React.useCallback(() => {
      fetchNextEvent().then()
    }, [])
  )

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="justify-center items-center mb-4">
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
              <H4 className={'mt-2'}>
                {i18n.t('home.welcomeback')}, {userData?.displayName}
              </H4>
            ) : (
              <H4 className={'mt-2'}>{i18n.t('home.welcomeback')}</H4>
            )}
          </>
        ) : (
          <H4 className={'mt-10'}>{i18n.t('home.welcomenew')}</H4>
        )}

        {current && (
          <HomeCard
            title={i18n.t('screens.profile')}
            description={i18n.t('home.profiledescription')}
            icon={UserIcon}
            route={current ? `/user/${current.$id}` : '/login'}
            theme={theme}
          />
        )}

        <HomeCard
          title={i18n.t('screens.notifications')}
          description={i18n.t('home.notificationsdescription')}
          icon={BellIcon}
          route={current ? '/notifications' : '/login'}
          theme={theme}
        />

        <HomeCard
          title="Gallery"
          description={i18n.t('home.gallerydescription')}
          icon={LayoutDashboardIcon}
          route="/gallery/(stacks)"
          theme={theme}
        />

        <HomeCard
          title="Locations"
          description={i18n.t('home.locationsdescription')}
          icon={MapPinnedIcon}
          route="/locations"
          theme={theme}
        />

        <HomeCard
          title="Announcements"
          description={i18n.t('home.announcementsdescription')}
          icon={MegaphoneIcon}
          route="/announcements"
          theme={theme}
        />

        <HomeCard
          title="Events"
          description={i18n.t('home.eventsDescription')}
          icon={CalendarClockIcon}
          route="/events/(tabs)"
          theme={theme}
          showSeparator={!!nextEvent}
          additionalContent={
            nextEvent && (
              <>
                <CardFooter className={'p-0 flex flex-wrap ml-7 mb-2'}>
                  <CardDescription>
                    <ClockIcon size={12} color={theme} /> {nextEvent?.title} -{' '}
                    {calculateTimeLeftEvent(
                      nextEvent?.date,
                      nextEvent?.dateUntil
                    )}
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
            )
          }
        />
      </View>
    </ScrollView>
  )
}
