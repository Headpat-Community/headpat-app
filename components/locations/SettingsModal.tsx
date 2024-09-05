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
import { Label } from '~/components/ui/label'
import { Text } from '~/components/ui/text'
import React from 'react'
import { Input } from '~/components/ui/input'
import { database } from '~/lib/appwrite-client'
import { Switch } from '~/components/ui/switch'

export default function SettingsModal({
  openModal,
  setOpenModal,
  userStatus,
  setUserStatus,
  current,
}) {
  const saveStatus = async () => {
    try {
      await database.updateDocument('hp_db', 'locations', current.$id, {
        status: userStatus.status,
        statusColor: userStatus.statusColor,
      })
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <AlertDialog onOpenChange={setOpenModal} open={openModal}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>What are you up to?</AlertDialogTitle>
          <AlertDialogDescription>
            Let others know what you are up to. You can always change this
            later.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <View className={'gap-4'}>
          <View className="gap-2">
            <Label nativeID={'status'}>Status</Label>
            <Input
              nativeID={'status'}
              value={userStatus?.status}
              onChange={(e) =>
                setUserStatus({ ...userStatus, status: e.nativeEvent.text })
              }
              maxLength={40}
            />
          </View>
          <View className="flex-row items-center gap-2">
            <Switch
              nativeID={'doNotDisturb'}
              checked={userStatus?.statusColor === 'red'}
              onCheckedChange={() =>
                setUserStatus((prev) => ({
                  ...prev,
                  statusColor: prev.statusColor === 'red' ? 'green' : 'red',
                }))
              }
            />
            <Label
              nativeID={'doNotDisturb'}
              onPress={() => {
                setUserStatus((prev) => ({
                  ...prev,
                  statusColor: prev.statusColor === 'red' ? 'green' : 'red',
                }))
              }}
            >
              Do not disturb
            </Label>
          </View>
        </View>
        <AlertDialogFooter>
          <AlertDialogAction onPress={saveStatus}>
            <Text>Apply</Text>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
