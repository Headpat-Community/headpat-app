import React, { useState, useCallback } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { Text } from '~/components/ui/text'
import { timeSince } from '~/components/calculateTimeLeft'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog'
import { Button } from '~/components/ui/button'
import { useUser } from '~/components/contexts/UserContext'
import { databases } from '~/lib/appwrite-client'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'
import ReportMessageModal from '~/components/messaging/moderation/ReportMessageModal'
import { Link } from 'expo-router'
import { Muted } from '~/components/ui/typography'
import { UserData } from '~/lib/types/collections'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { getAvatarImageUrlPreview } from '~/components/api/getStorageItem'
import { useQuery } from '@tanstack/react-query'

const MessageItem = ({ message }) => {
  const { current } = useUser()
  const { showAlert } = useAlertModal()
  const [openModal, setOpenModal] = useState(false)
  const [openReportModal, setOpenReportModal] = useState(false)

  const { data: userData } = useQuery<UserData.UserDataDocumentsType>({
    queryKey: ['user', message.senderId],
    queryFn: async () => {
      const response = await databases.getDocument(
        'hp_db',
        'userdata',
        message.senderId
      )
      return response as UserData.UserDataDocumentsType
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const handleLongPress = useCallback(() => {
    setOpenModal(true)
  }, [])

  const deleteMessage = async () => {
    try {
      await databases.deleteDocument('hp_db', 'messages', message.$id)
    } catch (e) {
      if (e.code === 401) {
        showAlert('FAILED', 'You are not authorized to delete this message')
      } else {
        showAlert('FAILED', 'An error occurred while deleting the message')
      }
    }
  }

  const handleReportModal = () => {
    setOpenReportModal(true)
    setOpenModal(false)
  }

  return (
    <>
      <ReportMessageModal
        open={openReportModal}
        setOpen={setOpenReportModal}
        message={message}
      />
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
              {current.$id === message.senderId && (
                <Button variant={'destructive'} onPress={deleteMessage}>
                  <Text>Delete</Text>
                </Button>
              )}
              <Button variant={'destructive'} onPress={handleReportModal}>
                <Text>Report</Text>
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
      <TouchableOpacity onLongPress={handleLongPress}>
        <View
          style={styles.messageContainer}
          className={message.$id.includes('pending_') ? 'animate-pulse' : ''}
        >
          <Link
            href={{
              pathname: '/user/(stacks)/[userId]',
              params: { userId: userData?.$id },
            }}
          >
            <Avatar
              style={{ width: 48, height: 48 }}
              alt={userData?.displayName}
            >
              <AvatarImage
                src={getAvatarImageUrlPreview(
                  userData?.avatarId,
                  'width=50&height=50'
                )}
              />
              <AvatarFallback>
                <Text>{userData?.displayName?.charAt(0)}</Text>
              </AvatarFallback>
            </Avatar>
          </Link>
          <View style={styles.messageContent}>
            <View style={styles.header}>
              <Text style={styles.senderName}>{userData?.displayName}</Text>
              <Muted style={styles.timestamp}>
                {timeSince(message.$createdAt)}
              </Muted>
            </View>
            <Text style={styles.messageText}>{message.body}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </>
  )
}

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'flex-start',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  messageContent: {
    marginLeft: 10,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  senderName: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
  },
  messageText: {
    fontSize: 14,
  },
})

export default MessageItem
