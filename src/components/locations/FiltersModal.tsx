import React from "react"
import { View } from "react-native"
import { i18n } from "~/components/system/i18n"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog"
import { Label } from "~/components/ui/label"
import { Switch } from "~/components/ui/switch"
import { Text } from "~/components/ui/text"
import { useFilters } from "~/lib/hooks/useFilters"

export default function FiltersModal({
  openModal,
  setOpenModal,
}: {
  openModal: boolean
  setOpenModal: (open: boolean) => void
}) {
  const { filters, setFilters } = useFilters()

  return (
    <AlertDialog onOpenChange={setOpenModal} open={openModal}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {i18n.t("location.map.filters.title")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {i18n.t("location.map.filters.description")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <View className={"gap-4"}>
          <View className="flex-row items-center gap-2">
            <Switch
              nativeID={"showEvents"}
              checked={filters.showEvents}
              onCheckedChange={() =>
                setFilters((prev) => ({
                  ...prev,
                  showEvents: !prev.showEvents,
                }))
              }
            />
            <Label
              nativeID={"showEvents"}
              onPress={() => {
                setFilters((prev) => ({
                  ...prev,
                  showEvents: !prev.showEvents,
                }))
              }}
            >
              {i18n.t("location.map.filters.showEvents")}
            </Label>
          </View>
          <View className="flex-row items-center gap-2">
            <Switch
              nativeID={"showMutuals"}
              checked={filters.showUsers}
              onCheckedChange={() =>
                setFilters((prev) => ({
                  ...prev,
                  showUsers: !prev.showUsers,
                }))
              }
            />
            <Label
              nativeID={"showMutuals"}
              onPress={() =>
                setFilters((prev) => ({
                  ...prev,
                  showUsers: !prev.showUsers,
                }))
              }
            >
              {i18n.t("location.map.filters.showUsers")}
            </Label>
          </View>
        </View>
        <AlertDialogFooter>
          <AlertDialogAction>
            <Text>Close</Text>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
