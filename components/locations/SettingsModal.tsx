import React from 'react'
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
import { databases } from '~/lib/appwrite-client'
import { Switch } from '~/components/ui/switch'
import { Separator } from '~/components/ui/separator'
import { i18n } from '~/components/system/i18n'

export default function SettingsModal({
  openModal,
  setOpenModal,
  userStatus,
  setUserStatus,
  current,
}) {
  const [currentStatus, setCurrentStatus] = React.useState(userStatus)
  const prevOpenModal = React.useRef(openModal)

  React.useEffect(() => {
    if (openModal && !prevOpenModal.current) {
      setCurrentStatus(userStatus)
    }
    prevOpenModal.current = openModal
  }, [openModal, userStatus])

  const saveStatus = async () => {
    try {
      await databases.updateDocument('hp_db', 'locations', current.$id, {
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
          <AlertDialogTitle>
            {i18n.t('location.map.status.title')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {i18n.t('location.map.status.description')}
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
          <Separator />
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
              {i18n.t('location.map.status.doNotDisturb')}
            </Label>
          </View>
        </View>
        <AlertDialogFooter>
          <AlertDialogAction onPress={() => saveStatus()}>
            <Text>{i18n.t('location.map.status.apply')}</Text>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
