import {
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native'
import { H1, H3, Muted } from '~/components/ui/typography'
import { useEffect, useState } from 'react'
import { Announcements } from '~/lib/types/collections'
import { database } from '~/lib/appwrite-client'
import { Query } from 'react-native-appwrite'
import { Link } from 'expo-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from '~/components/ui/card'
import { ClockIcon } from 'lucide-react-native'
import { formatDate } from '~/components/calculateTimeLeft'
import { useColorScheme } from '~/lib/useColorScheme'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'
import * as Sentry from '@sentry/react-native'

export default function AnnouncementsPage() {
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? 'white' : 'black'
  const [announcements, setAnnouncements] =
    useState<Announcements.AnnouncementDataType>(null)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const { showLoadingModal, showAlertModal, hideLoadingModal } = useAlertModal()

  const fetchAnnouncements = async () => {
    showLoadingModal()
    try {
      const currentDate = new Date()

      const data: Announcements.AnnouncementDataType =
        await database.listDocuments('hp_db', 'announcements', [
          Query.orderAsc('validUntil'),
          Query.greaterThanEqual('validUntil', currentDate.toISOString()),
        ])

      setAnnouncements(data)
      hideLoadingModal()
    } catch (error) {
      showAlertModal(
        'FAILED',
        'Failed to fetch events. Please try again later.'
      )
      Sentry.captureException(error)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchAnnouncements().then()
    setRefreshing(false)
  }

  useEffect(() => {
    fetchAnnouncements().then()
  }, [])

  if (announcements?.total === 0 || !announcements)
    return (
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className={'flex-1 justify-center items-center'}>
          <View className={'p-4 native:pb-24 max-w-md gap-6'}>
            <View className={'gap-1'}>
              <H1 className={'text-foreground text-center'}>Anouncements</H1>
              <Muted className={'text-base text-center'}>
                Currently there are no announcements, check back later!
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
        <H3 className={'text-foreground text-center'}>Currently active</H3>
        {announcements &&
          announcements?.documents?.map((announcement, index) => {
            return (
              <Link
                href={{
                  pathname: '/announcements/(stacks)/[announcementId]',
                  params: { announcementId: announcement.$id },
                }}
                asChild
                key={index}
              >
                <TouchableOpacity>
                  <Card>
                    <CardContent>
                      <CardTitle className={'justify-between mt-2 text-xl'}>
                        {announcement.title}
                      </CardTitle>
                      <CardDescription>
                        <Muted>{announcement?.sideText}</Muted>
                      </CardDescription>
                      <CardFooter
                        className={'p-0 mt-2 justify-between flex flex-wrap'}
                      >
                        <CardDescription>
                          <ClockIcon size={12} color={theme} />{' '}
                          {formatDate(new Date(announcement.validUntil))}
                        </CardDescription>
                      </CardFooter>
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
