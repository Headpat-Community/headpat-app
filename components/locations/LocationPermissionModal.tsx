import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog'
import { Text } from '~/components/ui/text'
import React from 'react'
import * as Location from 'expo-location'

export default function LocationPermissionModal({ openModal, setOpenModal }) {
  return (
    <AlertDialog onOpenChange={setOpenModal} open={openModal}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Headpat needs permission</AlertDialogTitle>
          <AlertDialogDescription>
            Headpat requires your location to show you on the map. You can
            always change this later in your settings.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onPress={async () => {
              await Location.requestForegroundPermissionsAsync()
              setOpenModal(false)
            }}
          >
            <Text>Continue</Text>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
