import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog'
import { View } from 'react-native'
import { Switch } from '~/components/ui/switch'
import { Label } from '~/components/ui/label'
import { Text } from '~/components/ui/text'
import React from 'react'

export default function FiltersModal({
  openModal,
  setOpenModal,
  filters,
  setFilters,
}) {
  return (
    <AlertDialog onOpenChange={setOpenModal} open={openModal}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Need to change filters?</AlertDialogTitle>
          <AlertDialogDescription>
            Please select the filters you want to apply.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <View className={'gap-4'}>
          <View className="flex-row items-center gap-2">
            <Switch
              nativeID={'showEvents'}
              checked={filters.showEvents}
              onCheckedChange={() =>
                setFilters((prev) => ({
                  ...prev,
                  showEvents: !prev.showEvents,
                }))
              }
            />
            <Label
              nativeID={'showEvents'}
              onPress={() => {
                setFilters((prev) => ({
                  ...prev,
                  showEvents: !prev.showEvents,
                }))
              }}
            >
              Show events
            </Label>
          </View>
          <View className="flex-row items-center gap-2">
            <Switch
              nativeID={'showMutuals'}
              checked={filters.showUsers}
              onCheckedChange={() =>
                setFilters((prev) => ({
                  ...prev,
                  showUsers: !prev.showUsers,
                }))
              }
            />
            <Label
              nativeID={'showMutuals'}
              onPress={() =>
                setFilters((prev) => ({
                  ...prev,
                  showUsers: !prev.showUsers,
                }))
              }
            >
              Show Users
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
