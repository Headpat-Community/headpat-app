import type React from "react"
import { useState } from "react"
import { View, TouchableOpacity } from "react-native"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Text } from "~/components/ui/text"
import type { AccountPrefs, UserDataDocumentsType } from "~/lib/types/collections"
import { i18n } from "~/components/system/i18n"
import AttendeesModal from "~/components/events/AttendeesModal"

interface AttendeesAvatarsProps {
  attendees: UserDataDocumentsType[]
  showFriendsOnly?: boolean
  maxVisible?: number
  fallbackCount?: number
  current?: AccountPrefs
}

const AttendeesAvatars: React.FC<AttendeesAvatarsProps> = ({
  attendees,
  showFriendsOnly = true,
  maxVisible = 10,
  fallbackCount,
  current,
}) => {
  const [modalOpen, setModalOpen] = useState(false)

  const getUserAvatar = (avatarId: string | null) => {
    // For mock data or null, return null to use fallback
    if (!avatarId || avatarId === "mock-avatar") {
      return null
    }
    return `${process.env.EXPO_PUBLIC_BACKEND_URL}/v1/storage/buckets/avatars/files/${avatarId}/preview?project=hp-main&width=100&height=100`
  }

  // If no attendees data but we have a fallback count, show just the count
  if (!attendees.length && !fallbackCount) return null

  const hasAttendeesData = attendees.length > 0
  const displayCount = hasAttendeesData
    ? attendees.length
    : (fallbackCount ?? 0)

  const visibleAttendees = attendees.slice(0, maxVisible)
  const remainingCount = Math.max(0, attendees.length - maxVisible)

  return (
    <>
      <TouchableOpacity
        onPress={() => hasAttendeesData && setModalOpen(true)}
        className="flex-row items-center"
        disabled={!hasAttendeesData}
      >
        <View className="flex-row items-center">
          {hasAttendeesData ? (
            <>
              {visibleAttendees.map((attendee, index) => (
                <View
                  key={attendee.$id}
                  className="rounded-full border-2 border-white"
                  style={{
                    marginLeft: index > 0 ? -12 : 0,
                    zIndex: visibleAttendees.length - index,
                  }}
                >
                  <Avatar
                    alt={attendee.displayName || "User"}
                    className="h-8 w-8"
                  >
                    <AvatarImage
                      source={{
                        uri: getUserAvatar(attendee.avatarId) ?? "invalid-uri",
                      }}
                    />
                    <AvatarFallback>
                      <Text className="text-xs">
                        {attendee.displayName.charAt(0) || "U"}
                      </Text>
                    </AvatarFallback>
                  </Avatar>
                </View>
              ))}

              {remainingCount > 0 && (
                <View
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-200"
                  style={{
                    marginLeft: -12,
                    zIndex: 0,
                  }}
                >
                  <Text className="text-xs font-semibold text-gray-600">
                    +{remainingCount}
                  </Text>
                </View>
              )}
            </>
          ) : null}
        </View>

        <View className="ml-3">
          <Text className="text-sm text-gray-500">
            {current?.$id
              ? `${displayCount} ${displayCount === 1 ? i18n.t("events.attendees.friendAttending") : i18n.t("events.attendees.friendsAttending")}`
              : null}
          </Text>
        </View>
      </TouchableOpacity>

      {hasAttendeesData && (
        <AttendeesModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          attendees={attendees}
          showFriendsOnly={showFriendsOnly}
        />
      )}
    </>
  )
}

export default AttendeesAvatars
