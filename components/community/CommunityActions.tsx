import React, { Suspense, useCallback, useState } from 'react'
import { Button } from '~/components/ui/button'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction
} from '~/components/ui/alert-dialog'
import {
  ShieldAlertIcon,
  UserPlusIcon,
  UserMinusIcon,
  CogIcon
} from 'lucide-react-native'
import { View } from 'react-native'
import { Text } from '~/components/ui/text'
import { Account, Community } from '~/lib/types/collections'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'
import ReportCommunityModal from '~/components/community/moderation/ReportCommunityModal'
import { router } from 'expo-router'
import { functions } from '~/lib/appwrite-client'
import { ExecutionMethod } from 'react-native-appwrite'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface UserActionsProps {
  data: Community.CommunityDocumentsType
  hasPermissions: boolean
  current: Account.AccountType | null
}

// eslint-disable-next-line react/display-name
const UserActions: React.FC<UserActionsProps> = React.memo(
  ({ data, hasPermissions, current }: UserActionsProps) => {
    const [moderationModalOpen, setModerationModalOpen] = useState(false)
    const [reportModalOpen, setReportModalOpen] = useState(false)
    const { showAlert, hideAlert } = useAlertModal()
    const queryClient = useQueryClient()

    const followMutation = useMutation({
      mutationFn: async () => {
        const dataResponse = await functions.createExecution(
          'community-endpoints',
          '',
          false,
          `/community/follow?communityId=${data.$id}`,
          ExecutionMethod.POST
        )
        return JSON.parse(dataResponse.responseBody)
      },
      onMutate: () => {
        showAlert('LOADING', 'Following...')
      },
      onSuccess: (response) => {
        if (response.type === 'unauthorized') {
          showAlert('FAILED', 'You must be logged in to follow a community')
        } else if (response.type === 'community_follow_missing_id') {
          showAlert(
            'FAILED',
            'Community ID is missing. Please try again later.'
          )
        } else if (response.type === 'community_follow_already_following') {
          showAlert('FAILED', 'You are already following this community')
        } else if (response.type === 'community_follow_error') {
          showAlert(
            'FAILED',
            'An error occurred while following this community'
          )
        } else if (response.type === 'community_followed') {
          showAlert('SUCCESS', `You have joined ${data.name}`)
          queryClient.setQueryData(
            ['community', data.$id],
            (old: Community.CommunityDocumentsType) => ({
              ...old,
              isFollowing: true
            })
          )
        }
      },
      onError: () => {
        showAlert('FAILED', 'An error occurred while following this community')
      },
      onSettled: () => {
        hideAlert()
      }
    })

    const unfollowMutation = useMutation({
      mutationFn: async () => {
        const dataResponse = await functions.createExecution(
          'community-endpoints',
          '',
          false,
          `/community/follow?communityId=${data.$id}`,
          ExecutionMethod.DELETE
        )
        return JSON.parse(dataResponse.responseBody)
      },
      onMutate: () => {
        showAlert('LOADING', 'Unfollowing...')
      },
      onSuccess: (response) => {
        if (response.type === 'community_unfollow_missing_id') {
          showAlert(
            'FAILED',
            'Community ID is missing. Please try again later.'
          )
        } else if (response.type === 'community_unfollow_owner') {
          showAlert('FAILED', 'You cannot unfollow a community you own')
        } else if (response.type === 'community_unfollow_unauthorized') {
          showAlert('FAILED', 'You must be logged in to unfollow a community')
        } else if (response.type === 'community_unfollow_not_following') {
          showAlert('FAILED', 'You are not following this community')
        } else if (response.type === 'community_unfollow_error') {
          showAlert(
            'FAILED',
            'An error occurred while unfollowing this community'
          )
        } else {
          showAlert('SUCCESS', `You have left ${data.name}`)
          queryClient.setQueryData(
            ['community', data.$id],
            (old: Community.CommunityDocumentsType) => ({
              ...old,
              isFollowing: false
            })
          )
        }
      },
      onError: () => {
        showAlert(
          'FAILED',
          'An error occurred while unfollowing this community'
        )
      },
      onSettled: () => {
        hideAlert()
      }
    })

    const handleManage = () => {
      router.navigate({
        pathname: `/community/[communityId]/admin`,
        params: { communityId: data.$id }
      })
    }

    const handleReport = useCallback(() => {
      setModerationModalOpen(false)
      setReportModalOpen(true)
    }, [])

    if (current?.$id === data?.$id) return null

    return (
      <>
        <Suspense>
          <ReportCommunityModal
            open={reportModalOpen}
            setOpen={setReportModalOpen}
            community={data}
          />
        </Suspense>
        <Button
          className={'text-center'}
          onPress={
            hasPermissions
              ? handleManage
              : data.isFollowing
                ? () => unfollowMutation.mutate()
                : () => followMutation.mutate()
          }
        >
          {hasPermissions ? (
            <CogIcon color={'white'} />
          ) : data.isFollowing ? (
            <UserMinusIcon color={'white'} />
          ) : (
            <UserPlusIcon color={'white'} />
          )}
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
