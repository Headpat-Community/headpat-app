import { RefreshControl, ScrollView, View } from 'react-native'
import { H1, H3, Muted } from '~/components/ui/typography'
import { useLocalSearchParams } from 'expo-router'
import { Announcements } from '~/lib/types/collections'
import { databases } from '~/lib/appwrite-client'
import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '~/components/ui/card'
import { Text } from '~/components/ui/text'
import { formatDate } from '~/components/calculateTimeLeft'
import { Separator } from '~/components/ui/separator'
import { Badge } from '~/components/ui/badge'
import sanitizeHtml from 'sanitize-html'
import HTMLView from 'react-native-htmlview'
import { useColorScheme } from '~/lib/useColorScheme'
import { i18n } from '~/components/system/i18n'

export default function AnnouncementSinglePage() {
  const local = useLocalSearchParams()
  const [announcement, setAnnouncement] =
    useState<Announcements.AnnouncementDocumentsType>(null)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? 'white' : 'black'

  const fetchAnnouncement = async () => {
    try {
      setRefreshing(true)
      const data: Announcements.AnnouncementDocumentsType =
        await databases.getDocument(
          'hp_db',
          'announcements',
          `${local.announcementId}`
        )

      setAnnouncement(data)
      setRefreshing(false)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
              <Muted className={'text-base text-center'}>
                {i18n.t('main.loading')}
              </Muted>
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

  const sanitizedDescription = sanitizeHtml(announcement.description)

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
  )
}
