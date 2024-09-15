import React, { useEffect, useRef } from 'react'
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
  const [currentStatus, setCurrentStatus] = React.useState(userStatus)
  const prevOpenModal = useRef(openModal)

  useEffect(() => {
    if (openModal && !prevOpenModal.current) {
      setCurrentStatus(userStatus)
    }
    prevOpenModal.current = openModal
  }, [openModal, userStatus])

  const saveStatus = async () => {
    try {
      await database.updateDocument('hp_db', 'locations', current.$id, {
        status: currentStatus.status,
        statusColor: currentStatus.statusColor,
      })
      setUserStatus(currentStatus)
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
              value={currentStatus?.status}
              onChange={(e) =>
                setCurrentStatus({
                  ...currentStatus,
                  status: e.nativeEvent.text,
                })
              }
              maxLength={40}
            />
          </View>
          <View className="flex-row items-center gap-2">
            <Switch
              nativeID={'doNotDisturb'}
              checked={currentStatus?.statusColor === 'red'}
              onCheckedChange={() =>
                setCurrentStatus((prev) => ({
                  ...prev,
                  statusColor: prev.statusColor === 'red' ? 'green' : 'red',
                }))
              }
            />
            <Label
              nativeID={'doNotDisturb'}
              onPress={() => {
                setCurrentStatus((prev) => ({
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
