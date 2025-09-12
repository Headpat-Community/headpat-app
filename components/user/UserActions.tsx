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
  AlertDialogTrigger
} from '~/components/ui/alert-dialog'
import {
  MailIcon,
  ShieldAlertIcon,
  UserMinusIcon,
  UserPlusIcon
} from 'lucide-react-native'
import { blockUser } from '~/components/user/api/blockUser'
import { View } from 'react-native'
import { Text } from '~/components/ui/text'
import { Account, UserData } from '~/lib/types/collections'
import { addFollow } from '~/components/user/api/addFollow'
import { removeFollow } from '~/components/user/api/removeFollow'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'
import ReportUserModal from '~/components/user/moderation/ReportUserModal'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface UserActionsProps {
  userData: UserData.UserProfileDocumentsType
  current: Account.AccountType | null
}

// eslint-disable-next-line react/display-name
const UserActions: React.FC<UserActionsProps> = React.memo(
  ({ userData, current }) => {
    const [moderationModalOpen, setModerationModalOpen] = useState(false)
    const [reportUserModalOpen, setReportUserModalOpen] = useState(false)
    const { showAlert, hideAlert } = useAlertModal()
    const queryClient = useQueryClient()

    const followMutation = useMutation({
      mutationFn: async () => {
        showAlert('LOADING', 'Following...')
        await addFollow(userData.$id)
      },
      onSuccess: () => {
        hideAlert()
        queryClient.setQueryData(
          ['user', userData.$id],
          (old: UserData.UserProfileDocumentsType) => ({
            ...old,
            isFollowing: true
          })
        )
        showAlert('SUCCESS', `You are now following ${userData.displayName}.`)
      },
      onError: () => {
        hideAlert()
        showAlert('FAILED', 'Failed to follow user. Please try again later.')
      }
    })

    const unfollowMutation = useMutation({
      mutationFn: async () => {
        showAlert('LOADING', 'Unfollowing...')
        await removeFollow(userData.$id)
      },
      onSuccess: () => {
        hideAlert()
        queryClient.setQueryData(
          ['user', userData.$id],
          (old: UserData.UserProfileDocumentsType) => ({
            ...old,
            isFollowing: false
          })
        )
        showAlert('SUCCESS', `You have unfollowed ${userData.displayName}.`)
      },
      onError: () => {
        hideAlert()
        showAlert('FAILED', 'Failed to unfollow user. Please try again later.')
      }
    })

    const blockMutation = useMutation({
      mutationFn: async () => {
        showAlert('LOADING', 'Processing...')
        const response = await blockUser({
          userId: userData.$id,
          isBlocked: !userData.prefs?.isBlocked
        })
        return response
      },
      onSuccess: (response) => {
        hideAlert()
        queryClient.setQueryData(
          ['user', userData.$id],
          (old: UserData.UserProfileDocumentsType) => ({
            ...old,
            prefs: response
          })
        )
        showAlert(
          'SUCCESS',
          userData.prefs?.isBlocked
            ? `You have unblocked ${userData.displayName}.`
            : `You have blocked ${userData.displayName}.`
        )
      },
      onError: () => {
        hideAlert()
        showAlert(
          'FAILED',
          'Failed to update block status. Please try again later.'
        )
      }
    })

    const handleFollow = useCallback(() => {
      if (userData.isFollowing) {
        unfollowMutation.mutate()
      } else {
        followMutation.mutate()
      }
    }, [userData.isFollowing, followMutation, unfollowMutation])

    const handleMessage = useCallback(() => {
      showAlert('INFO', 'Ha! You thought this was a real button!')
    }, [showAlert])

    const handleReport = useCallback(() => {
      setModerationModalOpen(false)
      setReportUserModalOpen(true)
    }, [])

    const handleBlockClick = useCallback(() => {
      setModerationModalOpen(false)
      blockMutation.mutate()
    }, [blockMutation])

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
