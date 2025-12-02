import * as Sentry from '@sentry/react-native'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'gt-react-native'
import React from 'react'
import { View } from 'react-native'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Separator } from '~/components/ui/separator'
import { Switch } from '~/components/ui/switch'
import { Text } from '~/components/ui/text'
import { databases } from '~/lib/appwrite-client'
import type { AccountType, LocationDocumentsType } from '~/lib/types/collections'

export default function SettingsModal({
  openModal,
  setOpenModal,
  userStatus,
  current,
}: {
  openModal: boolean
  setOpenModal: (openModal: boolean) => void
  userStatus: LocationDocumentsType
  current: AccountType
}) {
  const queryClient = useQueryClient()
  const { showAlert } = useAlertModal()
  const [currentStatus, setCurrentStatus] = React.useState<LocationDocumentsType>(userStatus)
  const prevOpenModal = React.useRef(openModal)
  const t = useTranslations()
  React.useEffect(() => {
    if (openModal && !prevOpenModal.current) {
      setCurrentStatus(userStatus)
    }
    prevOpenModal.current = openModal
  }, [openModal, userStatus])

  const updateMutation = useMutation({
    mutationFn: async (data: { status: string; statusColor: string }) => {
      if (!current.$id) throw new Error('No user ID')
      await databases.updateRow({
        databaseId: 'hp_db',
        tableId: 'locations',
        rowId: current.$id,
        data: data,
      })
      return data
    },
    onSuccess: () => {
      showAlert('SUCCESS', 'Status updated successfully')
      void queryClient.invalidateQueries({ queryKey: ['locations'] })
    },
    onError: (error) => {
      showAlert('FAILED', 'Failed to update status')
      Sentry.captureException(error)
    },
  })

  const saveStatus = async () => {
    try {
      await updateMutation.mutateAsync({
        status: currentStatus.status ?? '',
        statusColor: currentStatus.statusColor ?? '',
      })
      setOpenModal(false)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <AlertDialog onOpenChange={setOpenModal} open={openModal}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('location.map.status.title')}</AlertDialogTitle>
          <AlertDialogDescription>{t('location.map.status.description')}</AlertDialogDescription>
        </AlertDialogHeader>
        <View className={'gap-4'}>
          <View className="gap-2">
            <Label nativeID={'status'}>Status</Label>
            <Input
              nativeID={'status'}
              value={currentStatus.status ?? ''}
              onChangeText={(text) =>
                setCurrentStatus({
                  ...currentStatus,
                  status: text,
                })
              }
              maxLength={40}
            />
          </View>
          <Separator />
          <View className="flex-row items-center gap-2">
            <Switch
              nativeID={'doNotDisturb'}
              checked={currentStatus.statusColor === 'red'}
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
              {t('location.map.status.doNotDisturb')}
            </Label>
          </View>
        </View>
        <AlertDialogFooter>
          <AlertDialogAction onPress={() => void saveStatus()} disabled={updateMutation.isPending}>
            <Text>{t('location.map.status.apply')}</Text>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
