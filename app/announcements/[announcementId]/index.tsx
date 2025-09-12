import { RefreshControl, ScrollView, View } from "react-native"
import { H1, H3, Muted } from "~/components/ui/typography"
import { useLocalSearchParams } from "expo-router"
import { AnnouncementDocumentsType } from "~/lib/types/collections"
import { databases } from "~/lib/appwrite-client"
import React from "react"
import { Card, CardContent } from "~/components/ui/card"
import { Text } from "~/components/ui/text"
import { formatDate } from "~/components/calculateTimeLeft"
import { Separator } from "~/components/ui/separator"
import { Badge } from "~/components/ui/badge"
import sanitizeHtml from "sanitize-html"
import HTMLView from "react-native-htmlview"
import { useColorScheme } from "~/lib/useColorScheme"
import { i18n } from "~/components/system/i18n"
import { useQuery, useQueryClient } from "@tanstack/react-query"

export default function AnnouncementSinglePage() {
  const local = useLocalSearchParams()
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? "white" : "black"
  const queryClient = useQueryClient()

  const { data: announcement, isRefetching } =
    useQuery<AnnouncementDocumentsType>({
      queryKey: ["announcement", local.announcementId],
      queryFn: async () => {
        const data = await databases.getRow({
          databaseId: "hp_db",
          tableId: "announcements",
          rowId: local.announcementId as string,
        })
        return data as unknown as AnnouncementDocumentsType
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    })

  const onRefresh = () => {
    void queryClient.invalidateQueries({
      queryKey: ["announcement", local.announcementId],
    })
  }

  if (isRefetching && !announcement)
    return (
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
        }
      >
        <View className={"flex-1 items-center justify-center"}>
          <View className={"native:pb-24 max-w-md gap-6 p-4"}>
            <View className={"gap-1"}>
              <H1 className={"text-center text-foreground"}>Announcement</H1>
              <Muted className={"text-center text-base"}>
                {i18n.t("main.loading")}
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
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
        }
      >
        <View className={"h-full flex-1 items-center justify-center"}>
          <View className={"native:pb-24 max-w-md gap-6 p-4"}>
            <View className={"gap-1"}>
              <H1 className={"text-center text-foreground"}>Announcement</H1>
              <Muted className={"text-center text-base"}>
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
        <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
      }
    >
      <View className={"mx-2 mt-4 gap-4"}>
        <H3 className={"text-center text-foreground"}>{announcement.title}</H3>
        {announcement.sideText && (
          <Badge>
            <Text>{announcement.sideText}</Text>
          </Badge>
        )}
        <Separator />
        <View className={"flex-row justify-between gap-4"}>
          <Card className={"flex-1 p-0"}>
            <CardContent className={"p-6"}>
              <Text className={"text-center font-bold"}>Valid until: </Text>
              <Text className={"text-center"}>
                {formatDate(new Date(announcement.validUntil))}
              </Text>
            </CardContent>
          </Card>
        </View>

        <View>
          <Card className={"flex-1 p-0"}>
            <CardContent className={"p-6"}>
              <HTMLView
                value={sanitizedDescription}
                stylesheet={{
                  p: {
                    color: theme,
                  },
                  a: {
                    color: "hsl(208, 100%, 50%)",
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
