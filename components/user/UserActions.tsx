import React, { Suspense, useCallback, useState } from "react"
import { Button } from "~/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog"
import {
  MailIcon,
  ShieldAlertIcon,
  UserMinusIcon,
  UserPlusIcon,
} from "lucide-react-native"
import { blockUser } from "~/components/user/api/blockUser"
import { View } from "react-native"
import { Text } from "~/components/ui/text"
import { AccountType, UserProfileDocumentsType } from "~/lib/types/collections"
import { addFollow } from "~/components/user/api/addFollow"
import { removeFollow } from "~/components/user/api/removeFollow"
import { useAlertModal } from "~/components/contexts/AlertModalProvider"
import ReportUserModal from "~/components/user/moderation/ReportUserModal"
import { useMutation, useQueryClient } from "@tanstack/react-query"

interface UserActionsProps {
  userData: UserProfileDocumentsType
  current: AccountType | null
}

const UserActions: React.FC<UserActionsProps> = React.memo(
  ({ userData, current }) => {
    const [moderationModalOpen, setModerationModalOpen] = useState(false)
    const [reportUserModalOpen, setReportUserModalOpen] = useState(false)
    const [isBlockedLocal, setIsBlockedLocal] = useState<boolean | null>(
      userData.prefs?.isBlocked ?? null
    )
    const { showAlert, hideAlert } = useAlertModal()
    const queryClient = useQueryClient()

    const followMutation = useMutation({
      mutationFn: async () => {
        showAlert("LOADING", "Following...")
        await addFollow(userData.$id)
      },
      onSuccess: () => {
        hideAlert()
        queryClient.setQueryData(
          ["user", userData.$id],
          (old: UserProfileDocumentsType) => ({
            ...old,
            isFollowing: true,
          })
        )
        showAlert("SUCCESS", `You are now following ${userData.displayName}.`)
      },
      onError: () => {
        hideAlert()
        showAlert("FAILED", "Failed to follow user. Please try again later.")
      },
    })

    const unfollowMutation = useMutation({
      mutationFn: async () => {
        showAlert("LOADING", "Unfollowing...")
        await removeFollow(userData.$id)
      },
      onSuccess: () => {
        hideAlert()
        queryClient.setQueryData(
          ["user", userData.$id],
          (old: UserProfileDocumentsType) => ({
            ...old,
            isFollowing: false,
          })
        )
        showAlert("SUCCESS", `You have unfollowed ${userData.displayName}.`)
      },
      onError: () => {
        hideAlert()
        showAlert("FAILED", "Failed to unfollow user. Please try again later.")
      },
    })

    const blockMutation = useMutation({
      mutationFn: async (isBlocked: boolean) => {
        showAlert("LOADING", "Processing...")
        const response = await blockUser({
          userId: userData.$id,
          isBlocked,
        })
        return response
      },
      onSuccess: (response) => {
        hideAlert()
        queryClient.setQueryData(
          ["user", userData.$id],
          (old: UserProfileDocumentsType) => ({
            ...old,
            prefs: response,
          })
        )
        setIsBlockedLocal(!!response?.isBlocked)
        showAlert(
          "SUCCESS",
          response.isBlocked
            ? `You have blocked ${userData.displayName}.`
            : `You have unblocked ${userData.displayName}.`
        )
      },
      onError: () => {
        hideAlert()
        showAlert(
          "FAILED",
          "Failed to update block status. Please try again later."
        )
      },
    })

    const handleFollow = useCallback(() => {
      if (!current) {
        showAlert("FAILED", "You must be logged in to follow a user")
        return
      }
      if (userData.isFollowing) {
        unfollowMutation.mutate()
      } else {
        followMutation.mutate()
      }
    }, [
      userData.isFollowing,
      followMutation,
      unfollowMutation,
      current,
      showAlert,
    ])

    const handleMessage = useCallback(() => {
      showAlert("INFO", "Ha! You thought this was a real button!")
    }, [showAlert])

    const handleReport = useCallback(() => {
      setModerationModalOpen(false)
      setReportUserModalOpen(true)
    }, [])

    const handleBlockClick = useCallback(() => {
      setModerationModalOpen(false)
      const currentBlocked =
        isBlockedLocal ?? userData.prefs?.isBlocked ?? false
      const desiredBlocked = !currentBlocked

      if (!current) {
        // Not signed in: persist in react-query local key so PersistQueryClientProvider keeps it
        const localKey = ["user", userData.$id, "localPrefs"]
        queryClient.setQueryData(localKey, { isBlocked: desiredBlocked })

        // Also update main user cache so UI updates immediately
        queryClient.setQueryData(
          ["user", userData.$id],
          (old: UserProfileDocumentsType) => ({
            ...old,
            prefs: {
              ...(old.prefs ?? {}),
              isBlocked: desiredBlocked,
            },
          })
        )

        setIsBlockedLocal(desiredBlocked)
        showAlert(
          "SUCCESS",
          desiredBlocked
            ? `You have blocked ${userData.displayName}.`
            : `You have unblocked ${userData.displayName}.`
        )
        return
      }

      // Logged in: call API and update server-side prefs
      blockMutation.mutate(desiredBlocked)
    }, [blockMutation, current, isBlockedLocal, queryClient, userData])

    const effectiveBlocked =
      isBlockedLocal ?? userData.prefs?.isBlocked ?? false

    if (current?.$id === userData.$id) return null

    return (
      <>
        <Suspense>
          <ReportUserModal
            open={reportUserModalOpen}
            setOpen={setReportUserModalOpen}
            user={userData}
          />
        </Suspense>
        <Button className={"text-center"} onPress={handleFollow}>
          {userData.isFollowing ? (
            <UserMinusIcon color={"white"} />
          ) : (
            <UserPlusIcon color={"white"} />
          )}
        </Button>
        <Button className={"text-center"} onPress={handleMessage}>
          <MailIcon color={"white"} />
        </Button>

        <AlertDialog
          onOpenChange={setModerationModalOpen}
          open={moderationModalOpen}
        >
          <AlertDialogTrigger asChild>
            <Button className={"text-center"} variant={"destructive"}>
              <ShieldAlertIcon color={"white"} />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className={"w-full"}>
            <AlertDialogHeader>
              <AlertDialogTitle>Moderation</AlertDialogTitle>
              <AlertDialogDescription>
                What would you like to do?
              </AlertDialogDescription>
              <View className={"gap-4"}>
                <Button
                  className={"flex flex-row items-center text-center"}
                  variant={"destructive"}
                  onPress={handleReport}
                >
                  <Text>Report</Text>
                </Button>
                <Button
                  className={"flex flex-row items-center text-center"}
                  variant={"destructive"}
                  onPress={handleBlockClick}
                >
                  <Text>{effectiveBlocked ? "Unblock" : "Block"}</Text>
                </Button>
              </View>
            </AlertDialogHeader>
            <AlertDialogFooter className={"mt-8"}>
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
