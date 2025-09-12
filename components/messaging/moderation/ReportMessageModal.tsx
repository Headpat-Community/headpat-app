import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog"
import { Text } from "~/components/ui/text"
import React, { useState } from "react"
import { MessagesDocumentsType } from "~/lib/types/collections"
import { View } from "react-native"
import { RadioGroup } from "~/components/ui/radio-group"
import { Input } from "~/components/ui/input"
import * as Sentry from "@sentry/react-native"
import { useAlertModal } from "~/components/contexts/AlertModalProvider"
import { RadioGroupItemWithLabel } from "~/components/RadioGroupItemWithLabel"
import { ExecutionMethod } from "react-native-appwrite"
import { functions } from "~/lib/appwrite-client"

export default function ReportMessageModal({
  open,
  setOpen,
  message,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  message: MessagesDocumentsType
}) {
  const [reportReason, setReportReason] = useState<string>("")
  const [otherReason, setOtherReason] = useState<string>("")
  const { showAlert, hideAlert } = useAlertModal()

  const reportUser = async () => {
    showAlert("LOADING", "Reporting message...")
    try {
      const body = {
        reportedMessageId: message.$id,
        conversationId: message.conversationId,
        message: message.body,
        reason: reportReason === "Other" ? otherReason : reportReason,
      }
      const data = await functions.createExecution({
        functionId: "moderation-endpoints",
        body: JSON.stringify(body),
        async: false,
        xpath: `/moderation/report/message`,
        method: ExecutionMethod.POST,
      })
      const response = JSON.parse(data.responseBody)
      setOpen(false)
      hideAlert()
      if (response.type === "report_success") {
        showAlert("SUCCESS", "Thanks for keeping the community safe!")
        setReportReason("")
        setOtherReason("")
      } else if (response.type === "report_error") {
        showAlert("FAILED", "An error occurred while reporting the message")
        Sentry.captureException(response)
      }
    } catch (e) {
      hideAlert()
      console.error(e)
      showAlert("FAILED", "An error occurred while reporting the message")
      Sentry.captureException(e)
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
        <AlertDialogContent className={"w-full"}>
          <AlertDialogHeader>
            <AlertDialogTitle>Report message</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            What is the reason for reporting this message?
          </AlertDialogDescription>
          <View className={"z-50"}>
            <RadioGroup
              value={reportReason}
              onValueChange={setReportReason}
              className="gap-3"
            >
              <RadioGroupItemWithLabel
                value="Hate speech or discrimination"
                onLabelPress={onLabelPress("Hate speech or discrimination")}
              />
              <RadioGroupItemWithLabel
                value="Harassment or bullying"
                onLabelPress={onLabelPress("Harassment or bullying")}
              />
              <RadioGroupItemWithLabel
                value="Explicit sexual content"
                onLabelPress={onLabelPress("Explicit sexual content")}
              />
              <RadioGroupItemWithLabel
                value="Violence or threats"
                onLabelPress={onLabelPress("Violence or threats")}
              />
              <RadioGroupItemWithLabel
                value="Spam or scam"
                onLabelPress={onLabelPress("Spam or scam")}
              />
              <RadioGroupItemWithLabel
                value="Personal information"
                onLabelPress={onLabelPress("Personal information")}
              />
              <RadioGroupItemWithLabel
                value="Impersonation"
                onLabelPress={onLabelPress("Impersonation")}
              />
              <RadioGroupItemWithLabel
                value="Other"
                onLabelPress={onLabelPress("Other")}
              />
              {reportReason === "Other" && (
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
              className={"bg-destructive"}
              onPress={() => void reportUser()}
              disabled={
                !reportReason || (reportReason === "Other" && !otherReason)
              }
            >
              <Text className={"text-white"}>Report</Text>
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
