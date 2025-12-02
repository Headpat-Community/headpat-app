import * as Sentry from '@sentry/react-native'
import { useState } from 'react'
import { View } from 'react-native'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'
import { RadioGroupItemWithLabel } from '~/components/RadioGroupItemWithLabel'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog'
import { Input } from '~/components/ui/input'
import { RadioGroup } from '~/components/ui/radio-group'
import { Text } from '~/components/ui/text'
import { reportUserProfile } from '~/components/user/api/reportUserProfile'
import type { UserDataDocumentsType } from '~/lib/types/collections'

export default function ReportUserModal({
  open,
  setOpen,
  user,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  user: UserDataDocumentsType
}) {
  const [reportReason, setReportReason] = useState<string>('')
  const [otherReason, setOtherReason] = useState<string>('')
  const { showAlert, hideAlert } = useAlertModal()

  const reportUser = async () => {
    showAlert('LOADING', 'Reporting user...')
    try {
      const data = await reportUserProfile({
        reportedUserId: user.$id,
        reason: reportReason === 'Other' ? otherReason : reportReason,
      })
      setOpen(false)
      hideAlert()
      if (data.type === 'report_success') {
        showAlert('SUCCESS', 'Thanks for keeping the community safe!')
        setReportReason('')
        setOtherReason('')
      }
    } catch (e) {
      hideAlert()
      Sentry.captureException(e)
      showAlert('FAILED', 'Failed to report user. Please try again later.')
    }
  }

  function onLabelPress(label: string) {
    return () => {
      setReportReason(label)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className={'w-full'}>
        <AlertDialogHeader>
          <AlertDialogTitle>Report {user.displayName}</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription>What is the reason for reporting this user?</AlertDialogDescription>
        <View className={'z-50'}>
          <RadioGroup value={reportReason} onValueChange={setReportReason} className="gap-3">
            <RadioGroupItemWithLabel
              value="Inappropriate content"
              onLabelPress={onLabelPress('Inappropriate content')}
            />
            <RadioGroupItemWithLabel value="Spam" onLabelPress={onLabelPress('Spam')} />
            <RadioGroupItemWithLabel value="Harassment" onLabelPress={onLabelPress('Harassment')} />
            <RadioGroupItemWithLabel
              value="Impersonation"
              onLabelPress={onLabelPress('Impersonation')}
            />
            <RadioGroupItemWithLabel value="Other" onLabelPress={onLabelPress('Other')} />
            {reportReason === 'Other' && (
              <Input
                placeholder="Please specify"
                value={otherReason}
                onChangeText={setOtherReason}
              />
            )}
          </RadioGroup>
        </View>
        <AlertDialogFooter>
          <AlertDialogAction
            className={'bg-destructive'}
            onPress={() => void reportUser()}
            disabled={!reportReason || (reportReason === 'Other' && !otherReason)}
          >
            <Text className={'text-white'}>Report</Text>
          </AlertDialogAction>
          <AlertDialogCancel>
            <Text>Cancel</Text>
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
