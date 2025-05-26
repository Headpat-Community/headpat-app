import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '~/components/ui/alert-dialog'
import { Text } from '~/components/ui/text'
import React, { useState } from 'react'
import { Community } from '~/lib/types/collections'
import { View } from 'react-native'
import { RadioGroup } from '~/components/ui/radio-group'
import { Input } from '~/components/ui/input'
import * as Sentry from '@sentry/react-native'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'
import { reportCommunity } from '~/components/community/api/reportCommunity'
import { RadioGroupItemWithLabel } from '~/components/RadioGroupItemWithLabel'

export default function ReportCommunityModal({
  open,
  setOpen,
  community
}: {
  open: boolean
  setOpen: (open: boolean) => void
  community: Community.CommunityDocumentsType
}) {
  const [reportReason, setReportReason] = useState<string>('')
  const [otherReason, setOtherReason] = useState<string>('')
  const { showAlert, hideAlert } = useAlertModal()

  const reportUser = async () => {
    showAlert('LOADING', 'Reporting community...')
    try {
      const data = await reportCommunity({
        reportedCommunityId: community.$id,
        reason: reportReason === 'Other' ? otherReason : reportReason
      })
      setOpen(false)
      hideAlert()
      if (data.type === 'report_success') {
        showAlert('SUCCESS', 'Thanks for keeping the community safe!')
        setReportReason('')
        setOtherReason('')
      } else {
        Sentry.captureException(data)
        showAlert('FAILED', 'Failed to report user. Please try again later.')
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
    <>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className={'w-full'}>
          <AlertDialogHeader>
            <AlertDialogTitle>Report {community?.name}</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            What is the reason for reporting this community?
          </AlertDialogDescription>
          <View className={'z-50'}>
            <RadioGroup
              value={reportReason}
              onValueChange={setReportReason}
              className="gap-3"
            >
              <RadioGroupItemWithLabel
                value="Inappropriate content"
                onLabelPress={onLabelPress('Inappropriate content')}
              />
              <RadioGroupItemWithLabel
                value="NSFW content without tag"
                onLabelPress={onLabelPress('Spam')}
              />
              <RadioGroupItemWithLabel
                value="Harassment"
                onLabelPress={onLabelPress('Harassment')}
              />
              <RadioGroupItemWithLabel
                value="Other"
                onLabelPress={onLabelPress('Other')}
              />
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
              onPress={reportUser}
              disabled={
                !reportReason || (reportReason === 'Other' && !otherReason)
              }
            >
              <Text className={'text-white'}>Report</Text>
            </AlertDialogAction>
            <AlertDialogCancel>
              <Text>Cancel</Text>
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
