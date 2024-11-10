import React, { useEffect, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { useDataCache } from '~/components/contexts/DataCacheContext'
import { Image } from 'expo-image'
import { Text } from '~/components/ui/text'
import { formatDate } from '~/components/calculateTimeLeft'

const MessageItem = ({ message }) => {
  const { userCache, fetchUserData } = useDataCache()
  const [userData, setUserData] = useState(userCache[message.senderId])

  useEffect(() => {
    const userId = message.senderId
    fetchUserData(userId).then((data) => {
      setUserData(data)
    })
  }, [fetchUserData, message.senderId, userCache])

  return (
    <View
      style={styles.messageContainer}
      className={message.$id.includes('pending_') ? 'animate-pulse' : ''}
    >
      <Image
        source={{
          uri: userData?.avatarId
            ? `https://api.headpat.place/v1/storage/buckets/avatars/files/${userData.avatarId}/preview?project=hp-main&width=40&height=40`
            : undefined,
        }}
        style={styles.avatar}
      />
      <View style={styles.messageContent}>
        <View style={styles.header}>
          <Text style={styles.senderName}>{userData?.displayName}</Text>
          <Text style={styles.timestamp}>
            {formatDate(new Date(message.$createdAt))}
          </Text>
        </View>
        <Text style={styles.messageText}>{message.body}</Text>
      </View>
    </View>
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
    color: '#888',
  },
  messageText: {
    fontSize: 14,
  },
})

export default MessageItem
