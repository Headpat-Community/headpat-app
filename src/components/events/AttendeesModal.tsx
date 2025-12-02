import { router } from 'expo-router'
import { useTranslations } from 'gt-react-native'
import type React from 'react'
import { FlatList, TouchableOpacity, View } from 'react-native'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Text } from '~/components/ui/text'
import type { UserDataDocumentsType } from '~/lib/types/collections'

interface AttendeesModalProps {
  isOpen: boolean
  onClose: () => void
  attendees: UserDataDocumentsType[]
  showFriendsOnly?: boolean
}

const AttendeesModal: React.FC<AttendeesModalProps> = ({
  isOpen,
  onClose,
  attendees,
  showFriendsOnly = true,
}) => {
  const t = useTranslations()
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

  const renderAttendee = ({ item }: { item: UserDataDocumentsType }) => (
    <TouchableOpacity
      onPress={() => handleUserPress(item.$id)}
      className="flex-row items-center border-b border-gray-100 p-3"
    >
      <Avatar className="mr-3 h-12 w-12" alt={item.displayName || 'User'}>
        <AvatarImage
          source={{
            uri: getUserAvatar(item.avatarId) ?? 'invalid-uri',
          }}
        />
        <AvatarFallback>
          <Text className="text-sm">{item.displayName.charAt(0) || 'U'}</Text>
        </AvatarFallback>
      </Avatar>

      <View className="flex-1">
        <Text className="text-base font-semibold">{item.displayName || 'Unknown User'}</Text>
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
      <DialogContent className="max-h-[80%] w-[90%] max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <View className="min-h-[200px] flex-1">
          {attendees.length === 0 ? (
            <View className="flex-1 items-center justify-center py-8">
              <Text className="text-center text-gray-500">
                {showFriendsOnly
                  ? t('events.attendees.noFriendsAttending')
                  : t('events.attendees.noAttendeesYet')}
              </Text>
            </View>
          ) : (
            <FlatList
              data={attendees}
              renderItem={renderAttendee}
              keyExtractor={(item) => item.$id}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{
                paddingBottom: 8,
              }}
            />
          )}
        </View>
      </DialogContent>
    </Dialog>
  )
}

export default AttendeesModal
