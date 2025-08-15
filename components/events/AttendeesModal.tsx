import React from 'react'
import { FlatList, View, TouchableOpacity } from 'react-native'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '~/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Text } from '~/components/ui/text'
import { UserData } from '~/lib/types/collections'
import { router } from 'expo-router'
import { i18n } from '~/components/system/i18n'

interface AttendeesModalProps {
  isOpen: boolean
  onClose: () => void
  attendees: UserData.UserDataDocumentsType[]
  showFriendsOnly?: boolean
}

const AttendeesModal: React.FC<AttendeesModalProps> = ({
  isOpen,
  onClose,
  attendees,
  showFriendsOnly = true
}) => {
  const getUserAvatar = (avatarId: string | null) => {
    // For mock data or null, return null to use fallback
    if (!avatarId || avatarId === 'mock-avatar') {
      return null
    }
    return `${process.env.EXPO_PUBLIC_BACKEND_URL}/v1/storage/buckets/avatars/files/${avatarId}/preview?project=hp-main&width=100&height=100`
  }

  const handleUserPress = (userId: string) => {
    onClose()
    router.push(`/user/(stacks)/${userId}`)
  }

  const renderAttendee = ({
    item
  }: {
    item: UserData.UserDataDocumentsType
  }) => (
    <TouchableOpacity
      onPress={() => handleUserPress(item.$id)}
      className="flex-row items-center p-3 border-b border-gray-100"
    >
      <Avatar className="w-12 h-12 mr-3" alt={item.displayName || 'User'}>
        <AvatarImage
          source={{
            uri: getUserAvatar(item.avatarId) || 'invalid-uri'
          }}
        />
        <AvatarFallback>
          <Text className="text-sm">{item.displayName?.charAt(0) || 'U'}</Text>
        </AvatarFallback>
      </Avatar>

      <View className="flex-1">
        <Text className="font-semibold text-base">
          {item.displayName || 'Unknown User'}
        </Text>
        {item.status && (
          <Text className="text-sm text-gray-500" numberOfLines={1}>
            {item.status}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  )

  const title = showFriendsOnly
    ? `${attendees.length} ${attendees.length === 1 ? 'Friend' : 'Friends'} Attending`
    : `${attendees.length} ${attendees.length === 1 ? 'Attendee' : 'Attendees'}`

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[90%] max-w-md max-h-[80%]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <View className="flex-1 min-h-[200px]">
          {attendees.length === 0 ? (
            <View className="flex-1 justify-center items-center py-8">
              <Text className="text-gray-500 text-center">
                {showFriendsOnly
                  ? i18n.t('events.attendees.noFriendsAttending')
                  : i18n.t('events.attendees.noAttendeesYet')}
              </Text>
            </View>
          ) : (
            <FlatList
              data={attendees}
              renderItem={renderAttendee}
              keyExtractor={(item) => item.$id}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{
                paddingBottom: 8
              }}
            />
          )}
        </View>
      </DialogContent>
    </Dialog>
  )
}

export default AttendeesModal
