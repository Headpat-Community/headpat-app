import React, { Suspense, useCallback, useState } from 'react'
import { Button } from '~/components/ui/button'
import { toast } from '~/lib/toast'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from '~/components/ui/alert-dialog'
import {
  ShieldAlertIcon,
  UserPlusIcon,
  MailIcon,
  UserMinusIcon,
} from 'lucide-react-native'
import { blockUser } from '~/components/user/api/blockUser'
import { View } from 'react-native'
import { Text } from '~/components/ui/text'
import { useColorScheme } from '~/lib/useColorScheme'
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

const UserActions: React.FC<UserActionsProps> = React.memo(
  ({ userData, setUserData, current }) => {
    const [moderationModalOpen, setModerationModalOpen] = useState(false)
    const [reportUserModalOpen, setReportUserModalOpen] = useState(false)
    const { isDarkColorScheme } = useColorScheme()
    const themeButtons = isDarkColorScheme ? 'black' : 'white'
    const { showLoadingModal, hideLoadingModal, showAlertModal } =
      useAlertModal()

    const handleFollow = useCallback(() => {
      if (userData.isFollowing) {
        showLoadingModal()
        removeFollow(userData?.$id).then(() => {
          hideLoadingModal()
          setUserData((prev) => ({ ...prev, isFollowing: false }))
          showAlertModal(
            'SUCCESS',
            `You have unfollowed ${userData?.displayName}.`
          )
        })
      } else {
        showLoadingModal()
        addFollow(userData?.$id).then(() => {
          hideLoadingModal()
          setUserData((prev) => ({ ...prev, isFollowing: true }))
          showAlertModal(
            'SUCCESS',
            `You are now following ${userData?.displayName}.`
          )
        })
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userData])

    const handleMessage = useCallback(() => {
      toast('Ha! You thought this was a real button!')
    }, [])

    const handleReport = useCallback(() => {
      setModerationModalOpen(false)
      setReportUserModalOpen(true)
    }, [])

    const handleBlockClick = useCallback(() => {
      setModerationModalOpen(false)
      showLoadingModal()
      blockUser({
        userId: userData?.$id,
        isBlocked: !userData?.prefs?.isBlocked,
      }).then((response) => {
        hideLoadingModal()
        setUserData((prev) => ({ ...prev, prefs: response }))
        showAlertModal(
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
            <UserMinusIcon color={themeButtons} />
          ) : (
            <UserPlusIcon color={themeButtons} />
          )}
        </Button>
        <Button className={'text-center'} onPress={handleMessage}>
          <MailIcon color={themeButtons} />
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
