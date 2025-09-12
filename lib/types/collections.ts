import { Models } from "react-native-appwrite"

export interface HeadpatException {
  error: string
  type: string
  code: number
}

export interface StorageError {
  type:
    | "storage_file_empty"
    | "storage_invalid_file_size"
    | "storage_file_type_unsupported"
    | "storage_invalid_file"
    | "storage_device_not_found"
  error: string
  code: number
}

export type AccountType = Models.User<Models.Preferences>

/**
 * This data is returned from the API by calling their own account data.
 * @see AccountType
 */
export interface AccountPrefs extends AccountType {
  /**
   * The user's preferences.
   */
  prefs: {
    // The user's nsfw preference.
    nsfw: boolean
    indexingEnabled: boolean
  }
}

export interface MessagesType {
  total: number
  rows: MessagesDocumentsType[]
}

export interface MessagesDocumentsType extends Models.Row {
  /**
   * The user ID of the sender.
   */
  senderId: string
  /**
   * The body of the message.
   */
  body: string
  /**
   * The conversation ID.
   */
  conversationId: string
  /**
   * The message type.
   */
  messageType:
    | "text"
    | "location"
    | "contact"
    | "sticker"
    | "reply"
    | "forward"
    | "file"
  /**
   * Attachment IDs of the message.
   */
  attachments: string[]
}

export interface MessageConversationsType {
  total: number
  rows: MessageConversationsDocumentsType[]
}

export interface MessageConversationsDocumentsType extends Models.Row {
  /**
   * The user IDs of the participants in the conversation.
   */
  participants: string[]
  /**
   * If the conversation is a group conversation.
   */
  communityId: string
  /**
   * The last message in the conversation.
   */
  lastMessage: string
  /**
   * The community data of the conversation.
   */
  community: CommunityDocumentsType | null
}

export interface FollowerType {
  total: number
  rows: FollowerDocumentsType[]
}

export interface FollowerDocumentsType extends Models.Row {
  /**
   * The user ID of the user that is following.
   */
  userId: string
  /**
   * The user ID of the user that is being followed.
   */
  followerId: string
}

/**
 * This data is returned from the API by calling the userdata endpoint.
 */
export interface UserDataType {
  total: number
  rows: UserDataDocumentsType[]
}

/**
 * This data is returned from the API by calling the userData function.
 * @see UserDataType
 */
export interface UserDataDocumentsType extends Models.Row {
  /**
   * The avatar ID of the user.
   */
  avatarId: string | null
  /**
   * The banner ID of the user.
   */
  profileBannerId: string | null
  /**
   * The user's status.
   */
  status: string | null
  /**
   * The user's display name.
   */
  displayName: string
  /**
   * The user's bio.
   */
  bio: string | null
  /**
   * The user's birthday.
   * @example '2000-01-01T00:00:00:000Z'
   */
  birthday: string | null
  /**
   * The user's profile URL.
   */
  profileUrl: string
  /**
   * The user's pronouns.
   */
  pronouns: string | null
  /**
   * The user's discord username. (Not the ID)
   */
  discordname: string | null
  /**
   * The user's telegram name.
   */
  telegramname: string | null
  /**
   * The user's furaffinity name.
   */
  furaffinityname: string | null
  /**
   * The user's x/twitter name.
   */
  X_name: string | null
  /**
   * The user's twitch name.
   */
  twitchname: string | null
  /**
   * The user's bluesky name.
   */
  blueskyname: string | null
  /**
   * The user's location.
   */
  location: string | null
  /**
   * The user's badges.
   */
  badges: string[]
  /**
   * The user's followers count.
   */
  followersCount: number
  /**
   * The user's following count.
   */
  followingCount: number
}

/**
 * This data is returned from the API by calling the userprefs endpoint.
 * @see UserDataDocumentsType
 */
export interface UserPrefsType {
  total: number
  rows: UserPrefsDocumentsType[]
}

/**
 * This data is returned from the API within the `documents` array.
 * @see UserPrefsType
 */
export interface UserPrefsDocumentsType extends Models.Row {
  /**
   * The user ID of the user.
   */
  userId: string
  /**
   * The user's notes.
   */
  notes: string
  /**
   * The user's favorite status.
   */
  isFavorited: boolean
  /**
   * The user's blocked status.
   */
  isBlocked: boolean
  /**
   * The user's muted status.
   */
  isMuted: boolean
  /**
   * The user's nickname.
   */
  nickName: string
}

/**
 * This data is returned from the API within the `documents` array.
 * @see UserPrefsType
 */
export interface UserProfileDocumentsType extends UserDataDocumentsType {
  /**
   * The user ID of the user.
   */
  prefs: UserPrefsDocumentsType
  isFollowing: boolean
}

/**
 * This data is returned from the API by calling the userSettings endpoint.
 * @see UserSettingsDocumentsType
 */
export interface UserSettingsType {
  total: number
  rows: UserSettingsDocumentsType[]
}

/**
 * This data is returned from the API within the `documents` array.
 * @see UserSettingsType
 */
export interface UserSettingsDocumentsType extends Models.Row {
  roles: string[]
}

/**
 * This data is returned from the API by calling the location endpoint.
 * @see LocationDocumentsType
 */
export interface LocationType {
  total: number
  rows: LocationDocumentsType[]
}

/**
 * This data is returned in the friends/map view.
 * @see UserDataDocumentsType
 */
export interface LocationDocumentsType extends Models.Row {
  /**
   * The user's latitude
   */
  lat: number
  /**
   * The user's longitude
   */
  long: number
  /**
   * The user's status message when sharing location
   */
  status: string | null
  /**
   * The color for the user's status indicator
   */
  statusColor: string | null
  userData: UserDataDocumentsType
}

/**
 * This data is returned from the API by calling the getAnnouncements function.
 * @see AnnouncementDocumentsType
 */
export interface AnnouncementDataType {
  total: number
  rows: AnnouncementDocumentsType[]
}

/**
 * This data is returned from the API within the `documents` array.
 * @see AnnouncementDataType
 * @see UserDataType
 * @interface
 * @since 2.0.0
 */
export interface AnnouncementDocumentsType extends Models.Row {
  /**
   * The title of the announcement.
   */
  title: string | null
  /**
   * The side text of the announcement.
   */
  sideText: string | null
  /**
   * The description of the announcement.
   */
  description: string
  /**
   * Until when the announcement is valid.
   */
  validUntil: Date
  /**
   * The user data of the user that created the announcement.
   */
  userData: UserDataDocumentsType
}

/**
 * This data is returned from the API by calling the gallery endpoint.
 * @see GalleryDocumentsType
 * @interface
 * @since 2.0.0
 */
export interface GalleryType {
  total: number
  rows: GalleryDocumentsType[]
}

/**
 * This data is returned from the API within the `documents` array.
 * @see GalleryType
 * @interface
 * @since 2.0.0
 */
export interface GalleryDocumentsType extends Models.Row {
  /**
   * The gallery ID.
   */
  galleryId: string
  /**
   * The name of the gallery item.
   */
  name: string
  /**
   * The user ID of the user that created the gallery.
   */
  userId: string
  /**
   * The description of the gallery item.
   */
  longText: string
  /**
   * If the gallery item is nsfw.
   */
  nsfw: boolean
  /**
   * The tags of the gallery item.
   */
  tags: string[]
  /**
   * The file extension/mimetype of the gallery item.
   */
  mimeType: string
  /**
   * The blurhash of the gallery item.
   */
  blurHash: string
}

/**
 * This data is returned from the API by calling the gallery-prefs endpoint.
 * @see GalleryPrefsDocumentsType
 * @interface
 * @since 2.0.0
 */
export interface GalleryPrefsType {
  total: number
  rows: GalleryPrefsDocumentsType[]
}

export interface GalleryPrefsDocumentsType extends Models.Row {
  /**
   * The user ID.
   */
  userId: string
  /**
   * The gallery ID.
   */
  galleryId: string
  /**
   * If user has hidden the gallery item.
   */
  isHidden: boolean
}

/**
 * This data is returned from the API by calling the events endpoint.
 * @see EventsDocumentsType
 * @interface
 * @since 2.0.0
 */
export interface EventsType {
  total: number
  rows: EventsDocumentsType[]
}

/**
 * This data is returned from the API within the `documents` array.
 * @see EventsType
 * @interface
 * @since 2.0.0
 */
export interface EventsDocumentsType extends Models.Row {
  /**
   * The title of the event.
   */
  title: string
  /**
   * The community name connected to the event.
   */
  label: string
  /**
   * The description of the event.
   */
  description: string
  /**
   * The date the event starts.
   */
  date: string
  /**
   * The date the event ends.
   */
  dateUntil: string
  /**
   * The location of the event.
   * Only if the locationZoneMethod is set to 'virtual'!
   */
  location: string
  /**
   * The location zone method.
   */
  locationZoneMethod: "polygon" | "circle" | "virtual"
  /**
   * The location zone coordinates.
   * Only if the locationZoneMethod is set to 'polygon' or 'circle'!
   */
  coordinates: string[]
  /**
   * The location zone radius.
   * Only if the locationZoneMethod is set to 'circle'!
   */
  circleRadius: number
  /**
   * User IDs of attendees or the maximum amount of attendees.
   */
  attendees: string[] | number
  /**
   * The community ID connected to the event.
   */
  communityId: string
  /**
   * Maximum amount of attendees.
   */
  visitorCapacity: number
  /**
   * Images of the event.
   */
  images: string[]
}

export interface CommunityType {
  total: number
  rows: CommunityDocumentsType[]
}

export interface CommunityDocumentsType extends Models.Row {
  /**
   * The name of the community.
   */
  name: string
  /**
   * The description of the community.
   */
  description: string
  /**
   * The tags of the community for searching.
   */
  tags: string[]
  /**
   * The banner ID of the community
   */
  bannerId: string
  /**
   * The avatar ID of the community.
   */
  avatarId: string
  /**
   * The status of the community.
   */
  status: string
  /**
   * The community settings.
   */
  communitySettings: CommunitySettingsDocumentsType
  /**
   * The amount of followers the community has.
   */
  followersCount: number
  /**
   * If user is following the community.
   */
  isFollowing: boolean
  /**
   * The community preferences.
   */
  prefs: CommunityPrefsDocumentsType
  /**
   * The roles of the community.
   */
  roles?: string[]
}

export interface CommunityPrefsType {
  total: number
  rows: CommunityPrefsDocumentsType[]
}

export interface CommunityPrefsDocumentsType extends Models.Row {
  /**
   * The community ID.
   */
  communityId: string
  /**
   * If the community is blocked.
   */
  isBlocked?: boolean
  /**
   * If the community is muted.
   */
  isMuted?: boolean
}

export interface CommunitySettingsType {
  total: number
  rows: CommunitySettingsDocumentsType[]
}

export interface CommunitySettingsDocumentsType extends Models.Row {
  /**
   * If the community is indexed by search engines and findable.
   */
  isFindable: boolean
  /**
   * If the community is publicly accessible.
   */
  hasPublicPage: boolean
  /**
   * If the community is nsfw.
   */
  nsfw: boolean
}

export interface CommunityFollowersType {
  total: number
  rows: CommunityFollowersDocuments[]
}

export interface CommunityFollowersDocuments extends Models.Row {
  userId: string
  communityId: string
}

export interface NotificationsType {
  total: number
  rows: NotificationsDocumentsType[]
}

export interface NotificationsDocumentsType extends Models.Row {
  /**
   * The title of the notification.
   */
  message: string
  /**
   * The user ID of the user that received the notification.
   */
  userId: string
  /**
   * The description of the notification.
   */
  read: boolean
  /**
   * The date the notification was created.
   */
  type: "newFollower" | "newMessage" | "newEvent" | "newAnnouncement"
  /**
   * The user data of the user
   */
  userData: UserDataDocumentsType
}

export interface ConfigFeaturesType {
  total: number
  rows: ConfigFeaturesDocumentsType[]
}

export interface ConfigFeaturesDocumentsType extends Models.Row {
  isEnabled: boolean
  type: "public" | "earlyaccess" | "staff" | "dev"
}

export interface ChangelogType {
  total: number
  rows: ChangelogDocumentsType[]
}

export interface ChangelogDocumentsType extends Models.Row {
  /**
   * The title of the change
   */
  title: string
  /**
   * The version of the change
   */
  version: string
  /**
   * The date the change was made
   */
  date: string
  /**
   * The description of the change
   */
  description: string
  /**
   * List of improvements made in the web version
   */
  improvementsWeb: string[]
  /**
   * List of bugfixes made in the web version
   */
  bugfixesWeb: string[]
  /**
   * List of new features made in the web version
   */
  featuresWeb: string[]
  /**
   * List of improvements made in the mobile version
   */
  improvementsApp: string[]
  /**
   * List of bugfixes made in the mobile version
   */
  bugfixesApp: string[]
  /**
   * List of new features made in the mobile version
   */
  featuresApp: string[]
  /**
   * If the change is a draft
   */
  draft: boolean
  /**
   * The type of the change
   */
  type: "web" | "app"
}
