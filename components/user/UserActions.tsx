import React, { Suspense, useCallback, useState } from 'react'
import { Button } from '~/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog'
import {
  MailIcon,
  ShieldAlertIcon,
  UserMinusIcon,
  UserPlusIcon,
} from 'lucide-react-native'
import { blockUser } from '~/components/user/api/blockUser'
import { View } from 'react-native'
import { Text } from '~/components/ui/text'
import { Account, UserData } from '~/lib/types/collections'
import { addFollow } from '~/components/user/api/addFollow'
import { removeFollow } from '~/components/user/api/removeFollow'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'

const ReportUserModal = React.lazy(
  () => import('~/components/user/moderation/ReportUserModal')
)

interface UserActionsProps {
  userData: UserData.UserDataDocumentsType
  setUserData: React.Dispatch<
    React.SetStateAction<UserData.UserProfileDocumentsType>
  >
  current: Account.AccountType | null
}

// eslint-disable-next-line react/display-name
const UserActions: React.FC<UserActionsProps> = React.memo(
  ({ userData, setUserData, current }) => {
    const [moderationModalOpen, setModerationModalOpen] = useState(false)
    const [reportUserModalOpen, setReportUserModalOpen] = useState(false)
    const { showAlert, hideAlert } = useAlertModal()

    const handleFollow = useCallback(() => {
      if (userData.isFollowing) {
        showAlert('LOADING', 'Unfollowing...')
        removeFollow(userData?.$id).then(() => {
          hideAlert()
          setUserData((prev) => ({ ...prev, isFollowing: false }))
          showAlert('SUCCESS', `You have unfollowed ${userData?.displayName}.`)
        })
      } else {
        showAlert('LOADING', 'Following...')
        addFollow(userData?.$id).then(() => {
          hideAlert()
          setUserData((prev) => ({ ...prev, isFollowing: true }))
          showAlert(
            'SUCCESS',
            `You are now following ${userData?.displayName}.`
          )
        })
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userData])

    const handleMessage = useCallback(() => {
      showAlert('INFO', 'Ha! You thought this was a real button!')
    }, [])

    const handleReport = useCallback(() => {
      setModerationModalOpen(false)
      setReportUserModalOpen(true)
    }, [])

    const handleBlockClick = useCallback(() => {
      setModerationModalOpen(false)
      showAlert('LOADING', 'Processing...')
      blockUser({
        userId: userData?.$id,
        isBlocked: !userData?.prefs?.isBlocked,
      }).then((response) => {
        hideAlert()
        setUserData((prev) => ({ ...prev, prefs: response }))
        showAlert(
          'SUCCESS',
          userData?.prefs?.isBlocked
            ? `You have unblocked ${userData?.displayName}.`
            : `You have blocked ${userData?.displayName}.`
        )
      })
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userData])

    if (current?.$id === userData?.$id) return null

    return (
      <>
        <Suspense>
          <ReportUserModal
            open={reportUserModalOpen}
            setOpen={setReportUserModalOpen}
            user={userData}
          />
        </Suspense>
        <Button className={'text-center'} onPress={handleFollow}>
          {userData.isFollowing ? (
            <UserMinusIcon color={'white'} />
          ) : (
            <UserPlusIcon color={'white'} />
          )}
        </Button>
        <Button className={'text-center'} onPress={handleMessage}>
          <MailIcon color={'white'} />
        </Button>

        <AlertDialog
          onOpenChange={setModerationModalOpen}
          open={moderationModalOpen}
        >
          <AlertDialogTrigger asChild>
            <Button className={'text-center'} variant={'destructive'}>
              <ShieldAlertIcon color={'white'} />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className={'w-full'}>
            <AlertDialogHeader>
              <AlertDialogTitle>Moderation</AlertDialogTitle>
              <AlertDialogDescription>
                What would you like to do?
              </AlertDialogDescription>
              <View className={'gap-4'}>
                <Button
                  className={'text-center flex flex-row items-center'}
                  variant={'destructive'}
                  onPress={handleReport}
                >
                  <Text>Report</Text>
                </Button>
                <Button
                  className={'text-center flex flex-row items-center'}
                  variant={'destructive'}
                  onPress={handleBlockClick}
                >
                  <Text>
                    {userData?.prefs?.isBlocked ? 'Unblock' : 'Block'}
                  </Text>
                </Button>
              </View>
            </AlertDialogHeader>
            <AlertDialogFooter className={'mt-8'}>
              <AlertDialogAction>
                <Text>Cancel</Text>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }
)

export default UserActions
