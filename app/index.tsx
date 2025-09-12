import { RefreshControl, ScrollView, View } from "react-native"
import { CardDescription, CardFooter } from "~/components/ui/card"
import {
  CalendarClockIcon,
  ClockIcon,
  LayoutDashboardIcon,
  MapPinIcon,
  MapPinnedIcon,
  MegaphoneIcon,
  UserIcon,
  BellIcon,
} from "lucide-react-native"
import { useColorScheme } from "~/lib/useColorScheme"
import { useUser } from "~/components/contexts/UserContext"
import { EventsDocumentsType } from "~/lib/types/collections"
import { databases, functions } from "~/lib/appwrite-client"
import { H4 } from "~/components/ui/typography"
import { ExecutionMethod } from "react-native-appwrite"
import { calculateTimeLeftEvent } from "~/components/calculateTimeLeft"
import { Image } from "expo-image"
import { useFocusEffect } from "@react-navigation/core"
import { captureException } from "@sentry/react-native"
import { Skeleton } from "~/components/ui/skeleton"
import { i18n } from "~/components/system/i18n"
import React from "react"
import { HomeCard } from "~/components/home/home-card"
import { useQuery, useQueryClient } from "@tanstack/react-query"

export default function HomeView() {
  const [refreshing, setRefreshing] = React.useState<boolean>(false)
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? "white" : "black"
  const { current, isLoadingUser } = useUser()
  const queryClient = useQueryClient()

  const getAvatarUrl = (avatarId: string) => {
    if (!avatarId) return
    return `${process.env.EXPO_PUBLIC_BACKEND_URL}/v1/storage/buckets/avatars/files/${avatarId}/preview?project=hp-main&width=300&height=300`
  }

  const { data: nextEvent } = useQuery({
    queryKey: ["nextEvent"],
    queryFn: async () => {
      try {
        const data = await functions.createExecution({
          functionId: "event-endpoints",
          async: false,
          xpath: "/event/next",
          method: ExecutionMethod.GET,
        })
        const response: EventsDocumentsType = JSON.parse(data.responseBody)
        return response.title ? response : null
      } catch (error) {
        console.error(error)
        captureException(error)
        return null
      }
    },
    enabled: true,
    staleTime: 1000 * 60 * 5, // 2 minutes
  })

  const { data: userData } = useQuery({
    queryKey: ["userData", current?.$id],
    queryFn: async () => {
      if (!current?.$id) return null
      try {
        return await databases.getRow({
          databaseId: "hp_db",
          tableId: "userdata",
          rowId: current.$id,
        })
      } catch (error) {
        captureException(error)
        return null
      }
    },
    enabled: !!current?.$id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true)
    try {
      // Invalidate and refetch both queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["nextEvent"] }),
        queryClient.invalidateQueries({ queryKey: ["userData", current?.$id] }),
      ])
    } finally {
      setRefreshing(false)
    }
  }, [queryClient, current?.$id])

  useFocusEffect(
    React.useCallback(() => {
      void queryClient.invalidateQueries({ queryKey: ["nextEvent"] })
    }, [queryClient])
  )

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => void onRefresh()}
        />
      }
    >
      <View className="mb-4 items-center justify-center">
        {isLoadingUser ? (
          <View className={"m-4 flex w-full flex-col items-center px-4"}>
            <Skeleton className="mt-4 h-[100px] w-[100px] rounded-3xl" />
            <Skeleton className="mt-2 h-[20px] w-[150px] rounded" />
          </View>
        ) : current ? (
          <>
            <Image
              source={
                getAvatarUrl(userData?.avatarId as string) ??
                require("~/assets/pfp-placeholder.png")
              }
              style={{
                width: 100,
                height: 100,
                borderRadius: 25,
                marginTop: 20,
              }}
            />
            {userData?.displayName ? (
              <H4 className={"mt-2"}>
                {i18n.t("home.welcomeback")}, {userData.displayName}
              </H4>
            ) : (
              <H4 className={"mt-2"}>{i18n.t("home.welcomeback")}</H4>
            )}
          </>
        ) : (
          <H4 className={"mt-10"}>{i18n.t("home.welcomenew")}</H4>
        )}

        {current && (
          <HomeCard
            title={i18n.t("screens.profile")}
            description={i18n.t("home.profiledescription")}
            icon={UserIcon}
            route={`/user/${current.$id}`}
            theme={theme}
          />
        )}

        <HomeCard
          title={i18n.t("screens.notifications")}
          description={i18n.t("home.notificationsdescription")}
          icon={BellIcon}
          route={current ? "/notifications" : "/login"}
          theme={theme}
        />

        <HomeCard
          title={i18n.t("screens.gallery")}
          description={i18n.t("home.gallerydescription")}
          icon={LayoutDashboardIcon}
          route="/gallery/(stacks)/(list)/newest"
          theme={theme}
        />

        <HomeCard
          title={i18n.t("screens.locations")}
          description={i18n.t("home.locationsdescription")}
          icon={MapPinnedIcon}
          route="/locations"
          theme={theme}
        />

        <HomeCard
          title={i18n.t("screens.announcements")}
          description={i18n.t("home.announcementsdescription")}
          icon={MegaphoneIcon}
          route="/announcements"
          theme={theme}
        />

        <HomeCard
          title={i18n.t("screens.events")}
          description={i18n.t("home.eventsDescription")}
          icon={CalendarClockIcon}
          route="/events/(tabs)"
          theme={theme}
          showSeparator={!!nextEvent}
          additionalContent={
            nextEvent ? (
              <>
                <CardFooter className={"mb-2 ml-7 flex flex-wrap p-0"}>
                  <CardDescription>
                    <ClockIcon size={12} color={theme} /> {nextEvent.title} -{" "}
                    {calculateTimeLeftEvent(
                      nextEvent.date,
                      nextEvent.dateUntil
                    )}
                  </CardDescription>
                </CardFooter>
                {nextEvent.locationZoneMethod === "virtual" && (
                  <CardFooter className={"ml-7 mt-1 flex flex-wrap p-0 pb-2"}>
                    <CardDescription>
                      <MapPinIcon size={12} color={theme} />{" "}
                      {nextEvent.location}
                    </CardDescription>
                  </CardFooter>
                )}
              </>
            ) : null
          }
        />
      </View>
    </ScrollView>
  )
}
