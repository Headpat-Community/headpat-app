import * as Sentry from "@sentry/react-native"
import { Link } from "expo-router"
import { UsersIcon } from "lucide-react-native"
import React, { useCallback } from "react"
import { TouchableOpacity, View } from "react-native"
import { ExecutionMethod } from "react-native-appwrite"
import {
  getAvatarImageUrlPreview,
  getCommunityAvatarUrlPreview,
} from "~/components/api/getStorageItem"
import { useAlertModal } from "~/components/contexts/AlertModalProvider"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { Text } from "~/components/ui/text"
import { functions } from "~/lib/appwrite-client"
import {
  CommunityDocumentsType,
  MessageConversationsDocumentsType,
  UserDataDocumentsType,
} from "~/lib/types/collections"
import { useTimeSince } from "../calculateTimeLeft"
import { Muted } from "../ui/typography"

const ConversationItem = React.memo(
  ({
    item,
    displayData,
    isLoading,
  }: {
    item: MessageConversationsDocumentsType
    displayData: UserDataDocumentsType | CommunityDocumentsType
    isLoading: boolean
  }) => {
    const isCommunity = !!(displayData as CommunityDocumentsType).name || false
    const timeSince = useTimeSince(item.$updatedAt)
    const [openModal, setOpenModal] = React.useState(false)
    const { showAlert } = useAlertModal()

    const deleteConversation = async () => {
      try {
        const data = await functions.createExecution({
          functionId: "user-endpoints",
          async: false,
          xpath: `/user/chat/conversation?conversationId=${item.$id}`,
          method: ExecutionMethod.DELETE,
        })
        const response = JSON.parse(data.responseBody)
        if (response.type === "unauthorized") {
          showAlert("FAILED", "Unauthorized")
        } else if (response.type === "userchat_conversation_deleted") {
          showAlert("SUCCESS", "Conversation deleted successfully")
        } else if (response.type === "userchat_failed_to_delete_conversation") {
          showAlert("FAILED", "Failed to delete the conversation")
        }
      } catch (e) {
        Sentry.captureException(e)
        showAlert("FAILED", "An error occurred while deleting the conversation")
      } finally {
        setOpenModal(false)
      }
    }

    const handleLongPress = useCallback(() => {
      setOpenModal(true)
    }, [])

    return (
      <>
        <AlertDialog open={openModal} onOpenChange={setOpenModal}>
          <AlertDialogContent>
            <AlertDialogTitle>Moderation</AlertDialogTitle>
            <AlertDialogDescription>
              What would you like to do?
            </AlertDialogDescription>
            <View>
              <TouchableOpacity
                style={{
                  gap: 12,
                }}
              >
                <Button
                  variant={"destructive"}
                  onPress={() => void deleteConversation()}
                >
                  <Text>Delete</Text>
                </Button>
              </TouchableOpacity>
            </View>
            <AlertDialogFooter>
              <AlertDialogCancel>
                <Text>Cancel</Text>
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Link
          href={{
            pathname: "/chat/[conversationId]",
            params: { conversationId: item.$id },
          }}
          asChild
        >
          <TouchableOpacity
            onLongPress={!isCommunity ? handleLongPress : undefined}
          >
            <Card className={"rounded-none"}>
              <CardContent className={"pb-4 pt-4"}>
                <View className={"flex flex-row items-center"}>
                  <View>
                    <Avatar
                      style={{ width: 64, height: 64 }}
                      alt={
                        isCommunity
                          ? ((displayData as CommunityDocumentsType).name ?? "")
                          : (displayData as UserDataDocumentsType).displayName
                      }
                    >
                      <AvatarImage
                        src={
                          isLoading
                            ? require("~/assets/logos/hp_logo_x512.webp")
                            : isCommunity
                              ? getCommunityAvatarUrlPreview(
                                  (displayData as CommunityDocumentsType)
                                    .avatarId,
                                  "width=100&height=100"
                                )
                              : getAvatarImageUrlPreview(
                                  displayData.avatarId ?? "",
                                  "width=100&height=100"
                                ) || require("~/assets/logos/hp_logo_x512.webp")
                        }
                      />
                      <AvatarFallback>
                        <Text>
                          {isCommunity
                            ? (
                                displayData as CommunityDocumentsType
                              ).name?.charAt(0)
                            : (
                                displayData as UserDataDocumentsType
                              ).displayName.charAt(0)}
                        </Text>
                      </AvatarFallback>
                    </Avatar>
                    {isCommunity && (
                      <View className="absolute -right-0.5 bottom-0.5 rounded-full bg-primary p-0.5 text-primary-foreground">
                        <UsersIcon size={16} color={"white"} />
                      </View>
                    )}
                  </View>
                  <View className={"flex-row justify-between"}>
                    <View className="ml-4 flex-1">
                      <View>
                        <Text className="font-semibold">
                          {isCommunity
                            ? (displayData as CommunityDocumentsType).name
                            : (displayData as UserDataDocumentsType)
                                .displayName}
                        </Text>
                      </View>
                      <Muted className="text-sm">{item.lastMessage}</Muted>
                    </View>
                    <View
                      style={{
                        marginRight: 48,
                      }}
                    >
                      <Text className="font-semibold">{timeSince}</Text>
                    </View>
                  </View>
                </View>
              </CardContent>
            </Card>
          </TouchableOpacity>
        </Link>
      </>
    )
  }
)

ConversationItem.displayName = "ConversationItem"

export default ConversationItem
