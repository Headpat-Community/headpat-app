import { captureException } from "@sentry/react-native"
import { useQuery } from "@tanstack/react-query"
import * as Location from "expo-location"
import { LocationObjectCoords } from "expo-location"
import { router, useLocalSearchParams } from "expo-router"
import { MapPinIcon } from "lucide-react-native"
import React, { useMemo, useState } from "react"
import { FlatList, ScrollView, TouchableOpacity, View } from "react-native"
import { Query } from "react-native-appwrite"
import { formatDateLocale } from "~/components/calculateTimeLeft"
import { useAlertModal } from "~/components/contexts/AlertModalProvider"
import { i18n } from "~/components/system/i18n"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { Text } from "~/components/ui/text"
import { Muted } from "~/components/ui/typography"
import { databases } from "~/lib/appwrite-client"
import { EventsDocumentsType, EventsType } from "~/lib/types/collections"
import { calculateDistance, getEventCenterCoordinates } from "~/lib/utils"

interface EventWithDistance extends EventsDocumentsType {
  distance: number
}

export default function NearbyEventsPage() {
  const { showAlert } = useAlertModal()
  const params = useLocalSearchParams()
  const [requestingLocation, setRequestingLocation] = useState(false)
  const [localUserLocation, setLocalUserLocation] =
    useState<LocationObjectCoords | null>(null)

  // Parse user location from params
  const userLocation = useMemo(() => {
    if (params.latitude && params.longitude) {
      return {
        latitude: parseFloat(params.latitude as string),
        longitude: parseFloat(params.longitude as string),
      }
    }
    return localUserLocation
  }, [params.latitude, params.longitude, localUserLocation])

  const requestLocationPermission = async () => {
    try {
      setRequestingLocation(true)
      const { status } = await Location.requestForegroundPermissionsAsync()

      if (status === Location.PermissionStatus.GRANTED) {
        // Get current location
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        })
        setLocalUserLocation(location.coords)
        showAlert("SUCCESS", i18n.t("location.nearbyEvents.locationGranted"))
      } else {
        showAlert("FAILED", i18n.t("location.nearbyEvents.locationDenied"))
      }
    } catch (error) {
      captureException(error)
      showAlert("FAILED", i18n.t("location.nearbyEvents.locationFailed"))
    } finally {
      setRequestingLocation(false)
    }
  }

  const { data: events, isLoading } = useQuery<EventsType>({
    queryKey: ["events"],
    queryFn: async () => {
      try {
        const currentDate = new Date()
        const data: EventsType = await databases.listRows({
          databaseId: "hp_db",
          tableId: "events",
          queries: [
            Query.limit(1000),
            Query.orderAsc("date"),
            Query.greaterThanEqual("dateUntil", currentDate.toISOString()),
            Query.or([
              Query.equal("locationZoneMethod", "circle"),
              Query.equal("locationZoneMethod", "polygon"),
            ]),
          ],
        })
        return data
      } catch (error) {
        showAlert("FAILED", i18n.t("location.map.failedToFetchEvents"))
        captureException(error)
        throw error
      }
    },
  })

  const eventsWithDistance = useMemo(() => {
    if (!userLocation || !events?.rows.length) return []

    const eventsWithDistances: EventWithDistance[] = events.rows
      .map((event) => {
        const eventCenter = getEventCenterCoordinates(event)
        if (!eventCenter) return null // Skip virtual events

        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          eventCenter.latitude,
          eventCenter.longitude
        )

        return {
          ...event,
          distance,
        }
      })
      .filter((event): event is EventWithDistance => event !== null)
      .sort((a, b) => a.distance - b.distance) // Sort by distance, closest first

    return eventsWithDistances
  }, [events, userLocation])

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m away`
    }
    return `${distance.toFixed(1)}km away`
  }

  const handleEventPress = (event: EventWithDistance) => {
    const eventCenter = getEventCenterCoordinates(event)
    if (eventCenter) {
      // Navigate back to map with event location
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

  const renderEventItem = ({ item }: { item: EventWithDistance }) => (
    <TouchableOpacity onPress={() => handleEventPress(item)} className="mb-3">
      <Card className="mx-4">
        <CardContent className="p-4">
          <View className="flex-row items-start justify-between">
            <View className="mr-3 flex-1">
              <Text className="mb-1 text-lg font-semibold">{item.title}</Text>
              <Text className="mb-2 text-sm text-gray-600">{item.label}</Text>
              <Text className="text-xs text-gray-500">
                {formatDateLocale(new Date(item.date))} -{" "}
                {formatDateLocale(new Date(item.dateUntil))}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-sm font-medium text-blue-600">
                {formatDistance(item.distance)}
              </Text>
            </View>
          </View>
          {item.description && (
            <Text className="mt-2 text-sm text-gray-700" numberOfLines={2}>
              {item.description.replace(/<[^>]*>/g, "")}
            </Text>
          )}
        </CardContent>
      </Card>
    </TouchableOpacity>
  )

  const renderEmptyState = () => (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View className="flex-1 items-center justify-center px-4">
        <View className="items-center space-y-4">
          <MapPinIcon size={64} color="#9CA3AF" />
          <Muted className="text-center text-lg">
            {userLocation
              ? i18n.t("location.nearbyEvents.noEvents")
              : i18n.t("location.nearbyEvents.noLocation")}
          </Muted>
          {!userLocation && (
            <View className="mt-6">
              <Button
                onPress={() => void requestLocationPermission()}
                disabled={requestingLocation}
                className="px-6"
              >
                <Text className="font-semibold text-white">
                  {requestingLocation
                    ? i18n.t("location.nearbyEvents.requesting")
                    : i18n.t("location.nearbyEvents.enableLocation")}
                </Text>
              </Button>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  )

  return (
    <View className="flex-1">
      {/* Content */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text>{i18n.t("main.loading")}</Text>
        </View>
      ) : eventsWithDistance.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={eventsWithDistance}
          renderItem={renderEventItem}
          keyExtractor={(item) => item.$id}
          contentContainerStyle={{
            paddingVertical: 16,
          }}
          showsVerticalScrollIndicator={true}
        />
      )}
    </View>
  )
}
