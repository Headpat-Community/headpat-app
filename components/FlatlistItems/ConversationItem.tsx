import React, { useCallback } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { Link } from 'expo-router'
import { UsersIcon } from 'lucide-react-native'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import {
  getAvatarImageUrlPreview,
  getCommunityAvatarUrlPreview
} from '~/components/api/getStorageItem'
import { Muted } from '../ui/typography'
import { Text } from '~/components/ui/text'
import { Card, CardContent } from '~/components/ui/card'
import { Community, Messaging, UserData } from '~/lib/types/collections'
import { useTimeSince } from '../calculateTimeLeft'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle
} from '~/components/ui/alert-dialog'
import { Button } from '~/components/ui/button'
import { functions } from '~/lib/appwrite-client'
import { ExecutionMethod } from 'react-native-appwrite'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'
import * as Sentry from '@sentry/react-native'

const ConversationItem = React.memo(
  ({
    item,
    displayData,
    isLoading
  }: {
    item: Messaging.MessageConversationsDocumentsType
    displayData:
      | UserData.UserDataDocumentsType
      | Community.CommunityDocumentsType
    isLoading: boolean
  }) => {
    const isCommunity = !!displayData?.name
    const timeSince = useTimeSince(item?.$updatedAt)
    const [openModal, setOpenModal] = React.useState(false)
    const { showAlert } = useAlertModal()

    const deleteConversation = async () => {
      try {
        const data = await functions.createExecution(
          'user-endpoints',
          '',
          false,
          `/user/chat/conversation?conversationId=${item?.$id}`,
          ExecutionMethod.DELETE
        )
        const response = JSON.parse(data.responseBody)
        if (response.type === 'unauthorized') {
          showAlert('FAILED', 'Unauthorized')
        } else if (response.type === 'userchat_conversation_deleted') {
          showAlert('SUCCESS', 'Conversation deleted successfully')
        } else if (response.type === 'userchat_failed_to_delete_conversation') {
          showAlert('FAILED', 'Failed to delete the conversation')
        }
      } catch (e) {
        Sentry.captureException(e)
        showAlert('FAILED', 'An error occurred while deleting the conversation')
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
                  gap: 12
                }}
              >
                <Button variant={'destructive'} onPress={deleteConversation}>
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
            pathname: '/chat/[conversationId]',
            params: { conversationId: item?.$id }
          }}
          asChild
        >
          <TouchableOpacity
            onLongPress={!isCommunity ? handleLongPress : undefined}
          >
            <Card className={'rounded-none'}>
              <CardContent className={'pt-4 pb-4'}>
                <View className={'flex flex-row items-center'}>
                  <View>
                    <Avatar
                      style={{ width: 64, height: 64 }}
                      alt={
                        isCommunity
                          ? displayData?.name
                          : displayData?.displayName
                      }
                    >
                      <AvatarImage
                        src={
                          isLoading
                            ? require('~/assets/logos/hp_logo_x512.webp')
                            : isCommunity
                              ? getCommunityAvatarUrlPreview(
                                  displayData?.avatarId,
                                  'width=100&height=100'
                                )
                              : getAvatarImageUrlPreview(
                                  displayData?.avatarId,
                                  'width=100&height=100'
                                ) || require('~/assets/logos/hp_logo_x512.webp')
                        }
                      />
                      <AvatarFallback>
                        <Text>
                          {isCommunity
                            ? displayData?.name?.charAt(0)
                            : displayData?.displayName?.charAt(0)}
                        </Text>
                      </AvatarFallback>
                    </Avatar>
                    {isCommunity && (
                      <View className="absolute bottom-0.5 -right-0.5 bg-primary text-primary-foreground rounded-full p-0.5">
                        <UsersIcon size={16} color={'white'} />
                      </View>
                    )}
                  </View>
                  <View className={'flex-row justify-between'}>
                    <View className="ml-4 flex-1">
                      <View>
                        <Text className="font-semibold">
                          {isCommunity
                            ? displayData?.name
                            : displayData?.displayName}
                        </Text>
                      </View>
                      <Muted className="text-sm">{item?.lastMessage}</Muted>
                    </View>
                    <View
                      style={{
                        marginRight: 48
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

ConversationItem.displayName = 'ConversationItem'

export default ConversationItem
