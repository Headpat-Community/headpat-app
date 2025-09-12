import { useFocusEffect } from "@react-navigation/core"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { MapPinIcon, UsersIcon } from "lucide-react-native"
import React from "react"
import {
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native"
import { ExecutionMethod } from "react-native-appwrite"
import HTMLView from "react-native-htmlview"
import sanitizeHtml from "sanitize-html"
import { formatDate } from "~/components/calculateTimeLeft"
import { useAlertModal } from "~/components/contexts/AlertModalProvider"
import { useUser } from "~/components/contexts/UserContext"
import { i18n } from "~/components/system/i18n"
import { Badge } from "~/components/ui/badge"
import { Card, CardContent } from "~/components/ui/card"
import { Separator } from "~/components/ui/separator"
import { Skeleton } from "~/components/ui/skeleton"
import { Text } from "~/components/ui/text"
import { databases, functions } from "~/lib/appwrite-client"
import { EventsDocumentsType } from "~/lib/types/collections"

import { useColorScheme } from "~/lib/useColorScheme"
import { getEventCenterCoordinates } from "~/lib/utils"
import AttendeesAvatars from "~/components/events/AttendeesAvatars"

export default function EventPage() {
  const local = useLocalSearchParams()
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? "white" : "black"
  const { showAlert } = useAlertModal()
  const { current } = useUser()
  const queryClient = useQueryClient()

  const {
    data: event,
    isLoading,
    isRefetching,
  } = useQuery({
    queryKey: ["event", local.eventId],
    queryFn: async () => {
      try {
        const document: EventsDocumentsType = await databases.getRow({
          databaseId: "hp_db",
          tableId: "events",
          rowId: local.eventId as string,
        })

        let attendeesData = {
          attendees: 0,
          attendeesList: [],
          isAttending: false,
        }

        try {
          const eventResponse = await functions.createExecution({
            functionId: "event-endpoints",
            body: "",
            async: false,
            xpath: `/event/attendees?eventId=${local.eventId as string}`,
            method: ExecutionMethod.GET,
          })
          const eventData = JSON.parse(eventResponse.responseBody)
          attendeesData = {
            attendees: eventData?.attendees ?? 0,
            attendeesList: eventData?.attendeesList ?? [],
            isAttending: eventData?.isAttending ?? false,
          }
        } catch (attendeesError) {
          console.warn("Failed to fetch attendees data:", attendeesError)
          // Continue with default values
        }

        const result = {
          ...document,
          attendees: attendeesData.attendees,
          attendeesList: attendeesData.attendeesList,
          isAttending: attendeesData.isAttending,
        }

        return result
      } catch (error) {
        showAlert("FAILED", i18n.t("events.failedtofetch"))
        throw error
      }
    },
    enabled: !!local.eventId,
    retry: 3,
    refetchOnMount: "always",
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const attendMutation = useMutation({
    mutationFn: async () => {
      const eventResponse = await functions.createExecution({
        functionId: "event-endpoints",
        body: "",
        async: false,
        xpath: `/event/attendee?eventId=${local.eventId as string}`,
        method: ExecutionMethod.POST,
      })
      return JSON.parse(eventResponse.responseBody)
    },
    onSuccess: (data) => {
      if (data.type === "event_attendee_add_success") {
        queryClient.setQueryData(
          ["event", local.eventId as string],
          (old: any) => ({
            ...old,
            attendees: (Number(old.attendees) || 0) + 1,
            isAttending: true,
          })
        )
      } else if (data.type === "event_ended") {
        showAlert("FAILED", i18n.t("time.eventHasEnded"))
      } else {
        showAlert("FAILED", i18n.t("events.failedToAttend"))
      }
    },
    onError: () => {
      showAlert("FAILED", i18n.t("events.failedToFetch"))
    },
  })

  const unattendMutation = useMutation({
    mutationFn: async () => {
      const eventResponse = await functions.createExecution({
        functionId: "event-endpoints",
        body: "",
        async: false,
        xpath: `/event/attendee?eventId=${local.eventId as string}`,
        method: ExecutionMethod.DELETE,
      })
      return JSON.parse(eventResponse.responseBody)
    },
    onSuccess: (data) => {
      if (data.type === "event_attendee_remove_success") {
        queryClient.setQueryData(
          ["event", local.eventId as string],
          (old: any) => ({
            ...old,
            attendees: Math.max(0, (Number(old.attendees) || 0) - 1),
            isAttending: false,
          })
        )
      } else if (data.type === "event_ended") {
        showAlert("FAILED", i18n.t("time.eventHasEnded"))
      } else {
        showAlert("FAILED", i18n.t("events.failedCancelAttendance"))
      }
    },
    onError: () => {
      showAlert("FAILED", i18n.t("events.failedToFetch"))
    },
  })

  useFocusEffect(
    React.useCallback(() => {
      if (!local.eventId) {
        showAlert("FAILED", i18n.t("events.idNotFound"))
      }
    }, [local.eventId, showAlert])
  )

  // Check if core event data is loaded (attendees data now has defaults)
  const isDataComplete =
    event?.$id && // Ensure the event object has a valid ID
    event.date &&
    event.dateUntil &&
    event.description // Allow empty description

  if (isLoading || !isDataComplete) {
    return (
      <>
        <Stack.Screen
          options={{
            headerTitle: event?.title ?? i18n.t("events.whatIsThisEvent"),
          }}
        />
        <ScrollView
          className={"flex-1"}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() =>
                void queryClient.invalidateQueries({
                  queryKey: ["event", local.eventId],
                })
              }
            />
          }
        >
          <View className={"mx-4 mt-4 gap-4 pb-20"}>
            <Skeleton className={"h-6 w-20"} />
            <Separator />
            <View className={"flex-row justify-between gap-4"}>
              <Card className={"flex-1 p-0"}>
                <CardContent className={"p-6"}>
                  <Skeleton className={"mb-2 h-4 w-12"} />
                  <Skeleton className={"h-4 w-24"} />
                </CardContent>
              </Card>
              <Card className={"flex-1 p-0"}>
                <CardContent className={"p-6"}>
                  <Skeleton className={"mb-2 h-4 w-8"} />
                  <Skeleton className={"h-4 w-24"} />
                </CardContent>
              </Card>
            </View>
            <Card className={"flex-1 p-0"}>
              <CardContent className={"p-6"}>
                <Skeleton className={"mb-2 h-4 w-16"} />
                <Skeleton className={"h-4 w-32"} />
              </CardContent>
            </Card>
            <Skeleton className={"h-12 w-full"} />
            <Card className={"flex-1 p-0"}>
              <CardContent className={"p-6"}>
                <Skeleton className={"mb-2 h-4 w-full"} />
                <Skeleton className={"mb-2 h-4 w-full"} />
                <Skeleton className={"h-4 w-3/4"} />
              </CardContent>
            </Card>
            <View className={"mt-6"}>
              <Skeleton className={"h-12 w-full"} />
            </View>
          </View>
        </ScrollView>
      </>
    )
  }

  // Safely process event data now that we know it's complete
  const sanitizedDescription = sanitizeHtml(event.description || "")
  const isEventEnded = new Date(event.dateUntil) < new Date()

  // Ensure attendees is always a number for display
  const attendeesCount =
    typeof event.attendees === "number" ? event.attendees : 0
  const attendeesList = event.attendeesList

  const handleViewOnMap = () => {
    const eventCenter = getEventCenterCoordinates(event)
    if (eventCenter) {
      router.push({
        pathname: "/locations",
        params: {
          focusLatitude: eventCenter.latitude.toString(),
          focusLongitude: eventCenter.longitude.toString(),
          focusEventId: event.$id,
        },
      })
    }
  }

  const hasLocation = getEventCenterCoordinates(event) !== null

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: event.title || i18n.t("events.event"),
        }}
      />
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() =>
              void queryClient.invalidateQueries({
                queryKey: ["event", local.eventId],
              })
            }
          />
        }
      >
        {isDataComplete ? (
          <View className={"mx-4 mt-4 gap-4 pb-20"}>
            {event.label && (
              <Badge>
                <Text>{event.label}</Text>
              </Badge>
            )}
            <Separator />
            <View className={"flex-row justify-between gap-4"}>
              <Card className={"flex-1 p-0"}>
                <CardContent className={"p-6"}>
                  <Text className={"font-bold"}>
                    {i18n.t("events.start")}:{" "}
                  </Text>
                  <Text>{formatDate(new Date(event.date))}</Text>
                </CardContent>
              </Card>

              <Card className={"flex-1 p-0"}>
                <CardContent className={"p-6"}>
                  <Text className={"font-bold"}>{i18n.t("events.end")}: </Text>
                  <Text>{formatDate(new Date(event.dateUntil))}</Text>
                </CardContent>
              </Card>
            </View>

            <View>
              <Card className={"flex-1 p-0"}>
                <CardContent className={"p-6"}>
                  <Text className={"font-bold"}>
                    {i18n.t("events.location")}:{" "}
                  </Text>
                  <Text>
                    {event.location
                      ? event.location
                      : i18n.t("events.noLocationGiven")}
                  </Text>
                </CardContent>
              </Card>
            </View>

            {hasLocation && (
              <View>
                <TouchableOpacity
                  className={
                    "flex-row items-center justify-center gap-2 rounded-md bg-muted p-4"
                  }
                  onPress={handleViewOnMap}
                >
                  <MapPinIcon size={20} color={theme} />
                  <Text className={"text-center font-semibold"}>
                    {i18n.t("events.viewOnMap")}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

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

            <View className={"mt-6"}>
              <TouchableOpacity
                className={
                  "items-center justify-center rounded-md bg-primary p-4"
                }
                onPress={
                  !current
                    ? () => router.push("/login")
                    : isEventEnded
                      ? undefined
                      : event.isAttending
                        ? () => unattendMutation.mutate()
                        : () => attendMutation.mutate()
                }
                disabled={
                  isEventEnded ||
                  attendMutation.isPending ||
                  unattendMutation.isPending
                }
              >
                <Text className={"text-center font-bold text-white"}>
                  {isEventEnded
                    ? i18n.t("events.eventHasEnded")
                    : event.isAttending
                      ? i18n.t("events.cancelAttendance")
                      : event.attendees === 0
                        ? i18n.t("events.beFirstAttend")
                        : i18n.t("events.attendEvent")}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Attendees Avatars */}
            {(attendeesList.length > 0 || attendeesCount > 0) && (
              <View className={"mt-4"}>
                <AttendeesAvatars
                  attendees={attendeesList}
                  maxVisible={10}
                  fallbackCount={attendeesCount}
                />
              </View>
            )}
          </View>
        ) : null}
      </ScrollView>

      <View
        className={
          "absolute bottom-4 mb-4 h-12 w-64 flex-row items-center justify-center gap-2 self-center rounded border border-border bg-card"
        }
      >
        <UsersIcon className={"h-4 w-4"} color={theme} size={16} />
        <Text className={"items-center text-center font-bold"}>
          {attendeesCount}
        </Text>
      </View>
    </>
  )
}
