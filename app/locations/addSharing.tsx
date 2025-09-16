import DateTimePicker from "@react-native-community/datetimepicker"
import { useFocusEffect } from "@react-navigation/core"
import * as Sentry from "@sentry/react-native"
import { FlashList } from "@shopify/flash-list"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { router } from "expo-router"
import { ArrowLeftIcon } from "lucide-react-native"
import React from "react"
import { ScrollView, View } from "react-native"
import { ID, Query } from "react-native-appwrite"
import { useAlertModal } from "~/components/contexts/AlertModalProvider"
import { useUser } from "~/components/contexts/UserContext"
import ConfirmSharingItem from "~/components/FlatlistItems/ConfirmSharingItem"
import LocationSearchItem from "~/components/FlatlistItems/LocationSearchItem"
import { RadioGroupItemWithLabel } from "~/components/RadioGroupItemWithLabel"
import { i18n } from "~/components/system/i18n"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { RadioGroup } from "~/components/ui/radio-group"
import { Text } from "~/components/ui/text"
import { H1, Muted } from "~/components/ui/typography"
import { databases } from "~/lib/appwrite-client"
import { useDebounce } from "~/lib/hooks/useDebounce"
import {
  CommunityDocumentsType,
  UserDataDocumentsType,
} from "~/lib/types/collections"
import { useColorScheme } from "~/lib/useColorScheme"

export default function AddSharing() {
  const [page, setPage] = React.useState(0)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedTime, setSelectedTime] = React.useState<Date | null>(null)
  const [selectedItems, setSelectedItems] = React.useState<
    { id: string; isCommunity: boolean }[]
  >([])
  const [selectedDuration, setSelectedDuration] = React.useState("7d")
  const [showCustomPicker, setShowCustomPicker] = React.useState(false)
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const { showAlert } = useAlertModal()
  const { current } = useUser()
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? "white" : "black"
  const [dateOpen, setDateOpen] = React.useState(false)
  const [timeOpen, setTimeOpen] = React.useState(false)
  const queryClient = useQueryClient()

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["location-share-search", debouncedSearchTerm],
    queryFn: async () => {
      if (!debouncedSearchTerm) return []

      try {
        const alreadyShared = await databases.listRows({
          databaseId: "hp_db",
          tableId: "locations-permissions",
          queries: [Query.limit(1000)],
        })

        const alreadySharedUserIds = alreadyShared.rows
          .filter((item) => !item.isCommunity)
          .map((item) => item.requesterId)

        const alreadySharedCommunityIds = alreadyShared.rows
          .filter((item) => item.isCommunity)
          .map((item) => item.requesterId)

        const userQueries = [
          Query.search("displayName", debouncedSearchTerm),
          ...(current?.$id ? [Query.notEqual("$id", current.$id)] : []),
          ...alreadySharedUserIds.map((id) =>
            Query.notEqual("$id", id as string)
          ),
          Query.limit(10),
        ]

        const communityQueries = [
          Query.search("name", debouncedSearchTerm),
          ...alreadySharedCommunityIds.map((id) =>
            Query.notEqual("$id", id as string)
          ),
          Query.limit(10),
        ]

        const [resultsUsers, resultsCommunity] = await Promise.all([
          databases.listRows({
            databaseId: "hp_db",
            tableId: "userdata",
            queries: userQueries,
          }),
          databases.listRows({
            databaseId: "hp_db",
            tableId: "community",
            queries: communityQueries,
          }),
        ])

        const [userDataResults, communityDataResults] = await Promise.all([
          Promise.all(
            resultsUsers.rows.map(async (item) => {
              return await queryClient.fetchQuery({
                queryKey: ["user", item.$id],
                queryFn: async () => {
                  const data = await databases.getRow({
                    databaseId: "hp_db",
                    tableId: "userdata",
                    rowId: item.$id,
                  })
                  return data as unknown as UserDataDocumentsType
                },
                staleTime: 1000 * 60 * 5, // 5 minutes
              })
            })
          ),
          Promise.all(
            resultsCommunity.rows.map(async (item) => {
              return await queryClient.fetchQuery({
                queryKey: ["community", item.$id],
                queryFn: async () => {
                  const data = await databases.getRow({
                    databaseId: "hp_db",
                    tableId: "community",
                    rowId: item.$id,
                  })
                  return data as unknown as CommunityDocumentsType
                },
                staleTime: 1000 * 60 * 5, // 5 minutes
              })
            })
          ),
        ])

        return [...userDataResults, ...communityDataResults]
      } catch (error) {
        console.error("Error searching users:", error)
        Sentry.captureException(error)
        showAlert("FAILED", i18n.t("location.add.failedToSearch"))
        throw error
      }
    },
    enabled: !!debouncedSearchTerm,
  })

  // Memoize the handleSelectItem function
  const handleSelectItem = React.useCallback((item: any) => {
    setSelectedItems((prevSelectedItems) => {
      const isCommunity = !!item?.name
      const itemId = item.$id

      if (
        prevSelectedItems.some((selectedItem) => selectedItem.id === itemId)
      ) {
        return prevSelectedItems.filter(
          (selectedItem) => selectedItem.id !== itemId
        )
      } else {
        return [...prevSelectedItems, { id: itemId, isCommunity }]
      }
    })
  }, [])

  // Memoize the handleRemoveItem function
  const handleRemoveItem = React.useCallback((itemId: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== itemId))
  }, [])

  // Memoize the calculateEndTime function
  const calculateEndTime = React.useCallback(
    (duration: string) => {
      const now = new Date()
      switch (duration) {
        case "1h":
          return new Date(now.getTime() + 60 * 60 * 1000)
        case "24h":
          return new Date(now.getTime() + 24 * 60 * 60 * 1000)
        case "7d":
          return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        case "30d":
          return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        case "unlimited":
          return new Date("2100-01-01T00:00:00.000Z")
        default:
          return selectedTime
      }
    },
    [selectedTime]
  )

  // Memoize the handleDurationChange function
  const handleDurationChange = React.useCallback(
    (duration: string) => {
      setSelectedDuration(duration)
      if (duration === "custom") {
        setShowCustomPicker(true)
      } else {
        const newTime = calculateEndTime(duration)
        setSelectedTime(newTime)
        setShowCustomPicker(false)
      }
    },
    [calculateEndTime]
  )

  const handleBack = () => {
    setPage(0)
  }

  const handleNext = () => {
    if (selectedItems.length === 0) {
      showAlert("FAILED", i18n.t("location.add.failedToSelect"))
      return
    }
    setPage(page + 1)
  }

  const handleConfirm = async () => {
    if (selectedItems.length === 0) {
      showAlert("FAILED", i18n.t("location.add.failedToSelect"))
      return
    }

    setPage(2)

    try {
      const result = await Promise.all(
        selectedItems.map((selectedItem) => {
          const documentData = {
            sharerUserId: current?.$id,
            isCommunity: selectedItem.isCommunity,
            requesterId: selectedItem.id,
            timeUntil:
              calculateEndTime(selectedDuration)?.toISOString() ??
              new Date().toISOString(),
          }
          return databases.createRow({
            databaseId: "hp_db",
            tableId: "locations-permissions",
            rowId: ID.unique(),
            data: documentData,
          })
        })
      )

      if (result.length > 0) {
        router.push("locations/share")
      }
    } catch (error) {
      router.back()
      console.error("Error sharing location", error)
      showAlert("FAILED", i18n.t("location.add.failedToShare"))
      Sentry.captureException(error)
    }
  }

  const renderSearchItem = React.useCallback(
    ({ item }: { item: any }) => (
      <LocationSearchItem
        item={item}
        isSelected={selectedItems.some(
          (selectedItem) => selectedItem.id === item.$id
        )}
        onSelectItem={() => handleSelectItem(item)}
      />
    ),
    [selectedItems, handleSelectItem]
  )

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        setSearchTerm("")
        setSelectedItems([])
        setSelectedTime(null)
        setPage(0)
      }
    }, [])
  )

  return (
    <>
      {page === 0 && (
        <View>
          <>
            <Input
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder={i18n.t("location.add.search")}
              className={"rounded-none"}
            />
            {searchTerm && (
              <View className={"h-fit"}>
                {isLoading ? (
                  <View>
                    <Text>{i18n.t("main.loading")}</Text>
                  </View>
                ) : (
                  <View className="h-full">
                    <FlashList
                      data={searchResults}
                      keyExtractor={(item) => item.$id}
                      renderItem={renderSearchItem}
                      className={"mb-24"}
                      extraData={selectedItems}
                    />
                  </View>
                )}
              </View>
            )}
          </>
        </View>
      )}

      {page === 1 && (
        <ScrollView>
          <View className="flex-1 items-center justify-center">
            <View className="native:pb-24 max-w-md gap-4 p-4">
              <View className="gap-1">
                <H1 className="text-center text-foreground">
                  {i18n.t("location.add.selectDuration")}
                </H1>
                <Muted className="text-center text-base">
                  {i18n.t("location.add.selectDurationDescription")}
                </Muted>
              </View>
              <View className="">
                <RadioGroup
                  value={selectedDuration}
                  onValueChange={handleDurationChange}
                >
                  <RadioGroupItemWithLabel
                    value="1h"
                    label={i18n.t("location.add.1hour")}
                    description={i18n.t("location.add.1hourDescription")}
                    onLabelPress={() => handleDurationChange("1h")}
                  />
                  <RadioGroupItemWithLabel
                    value="24h"
                    label={i18n.t("location.add.24hours")}
                    description={i18n.t("location.add.24hoursDescription")}
                    onLabelPress={() => handleDurationChange("24h")}
                  />
                  <RadioGroupItemWithLabel
                    value="7d"
                    label={i18n.t("location.add.7days")}
                    description={i18n.t("location.add.7daysDescription")}
                    onLabelPress={() => handleDurationChange("7d")}
                  />
                  <RadioGroupItemWithLabel
                    value="30d"
                    label={i18n.t("location.add.30days")}
                    description={i18n.t("location.add.30daysDescription")}
                    onLabelPress={() => handleDurationChange("30d")}
                  />
                  <RadioGroupItemWithLabel
                    value="unlimited"
                    label={i18n.t("location.add.unlimited")}
                    description={i18n.t("location.add.unlimitedDescription")}
                    onLabelPress={() => handleDurationChange("unlimited")}
                  />
                  <RadioGroupItemWithLabel
                    value="custom"
                    label={i18n.t("location.add.custom")}
                    description={i18n.t("location.add.customDescription")}
                    onLabelPress={() => handleDurationChange("custom")}
                  />
                </RadioGroup>
              </View>

              {showCustomPicker && (
                <View className="mt-4 w-full gap-4">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-lg font-semibold">
                      {i18n.t("location.add.customDateTime")}
                    </Text>
                    <Button
                      variant="outline"
                      size="sm"
                      onPress={() => setDateOpen(true)}
                    >
                      <Text>{i18n.t("location.add.selectDate")}</Text>
                    </Button>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-lg font-semibold">
                      {i18n.t("location.add.selectedTime")}
                    </Text>
                    <Button
                      variant="outline"
                      size="sm"
                      onPress={() => setTimeOpen(true)}
                    >
                      <Text>{i18n.t("location.add.selectTime")}</Text>
                    </Button>
                  </View>
                  <View className="rounded-lg bg-muted p-4">
                    <Text className="text-center text-lg">
                      {selectedTime?.toLocaleDateString() ??
                        i18n.t("location.add.noDateSelected")}{" "}
                      at{" "}
                      {selectedTime?.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      }) ?? i18n.t("location.add.noTimeSelected")}
                    </Text>
                  </View>
                </View>
              )}

              {dateOpen && (
                <DateTimePicker
                  value={selectedTime ?? new Date()}
                  mode="date"
                  minimumDate={new Date()}
                  onChange={(_, date) => {
                    setDateOpen(false)
                    if (date) {
                      setSelectedTime(date)
                      setTimeOpen(true)
                    }
                  }}
                />
              )}
              {timeOpen && (
                <DateTimePicker
                  value={selectedTime ?? new Date()}
                  mode="time"
                  onChange={(_, time) => {
                    setTimeOpen(false)
                    if (time) {
                      const newTime = new Date(selectedTime ?? new Date())
                      newTime.setHours(time.getHours())
                      newTime.setMinutes(time.getMinutes())
                      setSelectedTime(newTime)
                    }
                  }}
                />
              )}
            </View>
          </View>
        </ScrollView>
      )}
      {page === 2 && (
        <>
          <View className="flex-1">
            <View className="native:pb-24 gap-4 p-4">
              <View className="gap-1">
                <H1 className="text-center text-foreground">
                  {i18n.t("location.add.confirmSharing")}
                </H1>
                <Muted className="text-center text-base">
                  {i18n.t("location.add.confirmSharingDescription")}
                </Muted>
              </View>

              <View className="w-full">
                {selectedItems.map((item) => {
                  const user = searchResults?.find((u) => u.$id === item.id)
                  if (!user) return null

                  return (
                    <ConfirmSharingItem
                      key={item.id}
                      item={user}
                      onRemove={() => handleRemoveItem(item.id)}
                    />
                  )
                })}
              </View>

              <View className="mt-4">
                <Muted className="text-center">
                  {i18n.t("location.add.locationWillBeSharedUntil")}
                  {selectedDuration === "custom"
                    ? (selectedTime?.toLocaleDateString() ?? "") +
                      " at " +
                      (selectedTime?.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      }) ?? "")
                    : selectedDuration === "unlimited"
                      ? "January 1, 2100"
                      : i18n.t("location.add.theSelectedDurationExpires")}
                </Muted>
              </View>
            </View>
          </View>

          <Button
            className={
              "absolute bottom-4 left-6 mb-4 h-12 w-12 flex-row items-center justify-center gap-2 self-start rounded border border-primary bg-primary"
            }
            onPress={handleBack}
          >
            <ArrowLeftIcon color={theme} />
          </Button>
          <Button
            className={
              "absolute bottom-4 right-6 mb-4 h-12 w-32 flex-row items-center justify-center gap-2 self-end rounded border border-primary bg-primary"
            }
            onPress={() => void handleConfirm()}
          >
            <Text>{i18n.t("main.confirm")}</Text>
          </Button>
        </>
      )}
      {selectedItems.length > 0 && page === 0 && (
        <Button
          className={
            "absolute bottom-4 right-6 mb-4 h-12 w-32 flex-row items-center justify-center gap-2 self-end rounded border border-primary bg-primary"
          }
          onPress={handleNext}
        >
          <Text>{i18n.t("main.next")}</Text>
        </Button>
      )}
      {selectedItems.length > 0 && page === 1 && (
        <>
          <Button
            className={
              "absolute bottom-4 left-6 mb-4 h-12 w-12 flex-row items-center justify-center gap-2 self-start rounded border border-primary bg-primary"
            }
            onPress={handleBack}
          >
            <ArrowLeftIcon color={theme} />
          </Button>
          <Button
            className={
              "absolute bottom-4 right-6 mb-4 h-12 w-32 flex-row items-center justify-center gap-2 self-end rounded border border-primary bg-primary"
            }
            onPress={handleNext}
          >
            <Text>{i18n.t("main.next")}</Text>
          </Button>
        </>
      )}
    </>
  )
}
