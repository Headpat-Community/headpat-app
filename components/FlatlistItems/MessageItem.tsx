import React, { useEffect, useState, useCallback } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { useDataCache } from '~/components/contexts/DataCacheContext'
import { Image } from 'expo-image'
import { Text } from '~/components/ui/text'
import { formatDate } from '~/components/calculateTimeLeft'
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

const MessageItem = ({ message }) => {
  const { current } = useUser()
  const { userCache, fetchUserData } = useDataCache()
  const { showAlertModal } = useAlertModal()
  const [userData, setUserData] = useState(userCache[message.senderId]?.data)
  const [openModal, setOpenModal] = useState(false)
  const [openReportModal, setOpenReportModal] = useState(false)

  useEffect(() => {
    const userId = message.senderId
    fetchUserData(userId).then((data) => {
      setUserData(data.data)
    })
  }, [fetchUserData, message.senderId])

  const handleLongPress = useCallback(() => {
    setOpenModal(true)
  }, [])

  const deleteMessage = async () => {
    try {
      await databases.deleteDocument('hp_db', 'messages', message.$id)
    } catch (e) {
      if (e.code === 401) {
        showAlertModal(
          'FAILED',
          'You are not authorized to delete this message'
        )
      } else {
        showAlertModal('FAILED', 'An error occurred while deleting the message')
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
            <Image
              source={{
                uri: userData?.avatarId
                  ? `https://api.headpat.place/v1/storage/buckets/avatars/files/${userData.avatarId}/preview?project=hp-main&width=40&height=40`
                  : undefined,
              }}
              style={styles.avatar}
            />
          </Link>
          <View style={styles.messageContent}>
            <View style={styles.header}>
              <Text style={styles.senderName}>{userData?.displayName}</Text>
              <Muted style={styles.timestamp}>
                {formatDate(new Date(message.$createdAt))}
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
