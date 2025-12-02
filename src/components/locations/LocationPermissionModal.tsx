import * as Location from 'expo-location'
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

export function LocationFrontPermissionModal({
  openModal,
  setOpenModal,
  onAgree,
  onDecline,
}: {
  openModal: boolean
  setOpenModal: (open: boolean) => void
  onAgree?: () => void
  onDecline?: () => void
}) {
  return (
    <AlertDialog onOpenChange={setOpenModal} open={openModal}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Headpat needs permission</AlertDialogTitle>
          <AlertDialogDescription>
            Headpat requires access to your precise device location to show you on the map and to
            provide location-based features. When you agree we will collect and store your location
            on our servers to display your approximate position to other users. Your location data
            may be stored until you stop sharing or delete your account. Do you agree to share your
            location for these purposes?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onPress={() => {
              void (async () => {
                await Location.requestForegroundPermissionsAsync()
                setOpenModal(false)
                if (onAgree) onAgree()
              })()
            }}
          >
            <Text>I Agree</Text>
          </AlertDialogAction>
          <AlertDialogAction
            onPress={() => {
              setOpenModal(false)
              if (onDecline) onDecline()
            }}
          >
            <Text>Decline</Text>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function LocationBackgroundPermissionModal({
  openModal,
  setOpenModal,
  onAgree,
  onDecline,
}: {
  openModal: boolean
  setOpenModal: (open: boolean) => void
  onAgree?: () => void
  onDecline?: () => void
}) {
  return (
    <AlertDialog onOpenChange={setOpenModal} open={openModal}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Headpat needs permission</AlertDialogTitle>
          <AlertDialogDescription>
            To continuously share your location with other users we need background location access.
            This allows Headpat to collect and update your location while the app is not in the
            foreground. We store and transmit this location data to our backend so other users can
            see your approximate position while sharing is active. Do you agree to enable background
            location sharing?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onPress={() => {
              void (async () => {
                await Location.requestBackgroundPermissionsAsync()
                setOpenModal(false)
                if (onAgree) onAgree()
              })()
            }}
          >
            <Text>I Agree</Text>
          </AlertDialogAction>
          <AlertDialogAction
            onPress={() => {
              setOpenModal(false)
              if (onDecline) onDecline()
            }}
          >
            <Text>Decline</Text>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
