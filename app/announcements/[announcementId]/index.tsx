import { RefreshControl, ScrollView, View } from 'react-native'
import { H1, H3, Muted } from '~/components/ui/typography'
import { useLocalSearchParams } from 'expo-router'
import { AnnouncementsDocumentsType } from '~/lib/types/collections'
import { database } from '~/lib/appwrite-client'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '~/components/ui/card'
import { Text } from '~/components/ui/text'
import { formatDate } from '~/components/events/calculateTimeLeft'
import { Separator } from '~/components/ui/separator'
import { Badge } from '~/components/ui/badge'

export default function AnnouncementSinglePage() {
  const local = useLocalSearchParams()
  const [announcement, setAnnouncement] =
    useState<AnnouncementsDocumentsType>(null)
  const [refreshing, setRefreshing] = useState<boolean>(false)

  const fetchAnnouncement = async () => {
    try {
      setRefreshing(true)
      const data: AnnouncementsDocumentsType = await database.getDocument(
        'hp_db',
        'announcements',
        `${local.announcementId}`
      )

      setAnnouncement(data)
      setRefreshing(false)
    } catch (error) {
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchAnnouncement().then()
    setRefreshing(false)
  }

  useEffect(() => {
    fetchAnnouncement().then()
  }, [local.announcementId])

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
              <H1 className={'text-foreground text-center'}>Announcement</H1>
              <Muted className={'text-base text-center'}>Loading...</Muted>
            </View>
          </View>
        </View>
      </ScrollView>
    )

  if (!announcement)
    return (
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className={'flex-1 justify-center items-center h-full'}>
          <View className={'p-4 native:pb-24 max-w-md gap-6'}>
            <View className={'gap-1'}>
              <H1 className={'text-foreground text-center'}>Announcement</H1>
              <Muted className={'text-base text-center'}>
                Announcement unavailable. Does it even exist?
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
        <H3 className={'text-foreground text-center'}>{announcement?.title}</H3>
        {announcement?.sideText && (
          <Badge>
            <Text>{announcement?.sideText}</Text>
          </Badge>
        )}
        <Separator />
        <View className={'flex-row justify-between gap-4'}>
          <Card className={'flex-1 p-0'}>
            <CardContent className={'p-6'}>
              <Text className={'font-bold text-center'}>Valid until: </Text>
              <Text className={'text-center'}>
                {formatDate(new Date(announcement?.validUntil))}
              </Text>
            </CardContent>
          </Card>
        </View>

        <View>
          <Card className={'flex-1 p-0'}>
            <CardContent className={'p-6'}>
              <Text>
                {announcement?.description || 'No description given.'}
              </Text>
            </CardContent>
          </Card>
        </View>
      </View>
    </ScrollView>
  )
}
