import { Models } from 'react-native-appwrite'

export interface HeadpatException {
  error: string
  type: string
  code: number
}

export namespace Account {
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
    }
  }
}

export namespace Messaging {
  export interface MessagesType {
    total: number
    documents: MessagesDocumentsType[]
  }

  export interface MessagesDocumentsType extends Models.Document {
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
      | 'text'
      | 'location'
      | 'contact'
      | 'sticker'
      | 'reply'
      | 'forward'
      | 'file'
    /**
     * Attachment IDs of the message.
     */
    attachments: string[]
  }

  export interface MessageConversationsType {
    total: number
    documents: MessageConversationsDocumentsType[]
  }

  export interface MessageConversationsDocumentsType extends Models.Document {
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
    community: Community.CommunityDocumentsType | null
  }
}

export namespace Followers {
  export interface FollowerType {
    total: number
    documents: FollowerDocumentsType[]
  }

  export interface FollowerDocumentsType extends Models.Document {
    /**
     * The user ID of the user that is following.
     */
    userId: string
    /**
     * The user ID of the user that is being followed.
     */
    followerId: string
  }
}

export namespace UserData {
  /**
   * This data is returned from the API by calling the userdata endpoint.
   */
  export interface UserDataType {
    total: number
    documents: UserDataDocumentsType[]
  }

  /**
   * This data is returned from the API by calling the userData function.
   * @see UserDataType
   */
  export interface UserDataDocumentsType extends Models.Document {
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
    documents: UserPrefsDocumentsType[]
  }

  /**
   * This data is returned from the API within the `documents` array.
   * @see UserPrefsType
   */
  export interface UserPrefsDocumentsType extends Models.Document {
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
    documents: UserSettingsDocumentsType[]
  }

  /**
   * This data is returned from the API within the `documents` array.
   * @see UserSettingsType
   */
  export interface UserSettingsDocumentsType extends Models.Document {
    roles: string[]
  }
}

export namespace Location {
  /**
   * This data is returned from the API by calling the location endpoint.
   * @see LocationDocumentsType
   */
  export interface LocationType {
    total: number
    documents: LocationDocumentsType[]
  }

  /**
   * This data is returned in the friends/map view.
   * @see UserDataDocumentsType
   */
  export interface LocationDocumentsType extends Models.Document {
    lat: number
    long: number
    userData: UserData.UserDataDocumentsType
  }
}

export namespace Announcements {
  /**
   * This data is returned from the API by calling the getAnnouncements function.
   * @see AnnouncementDocumentsType
   */
  export interface AnnouncementDataType {
    total: number
    documents: AnnouncementDocumentsType[]
  }

  /**
   * This data is returned from the API within the `documents` array.
   * @see AnnouncementDataType
   * @see UserDataType
   * @interface
   * @since 2.0.0
   */
  export interface AnnouncementDocumentsType extends Models.Document {
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
    userData: UserData.UserDataDocumentsType
  }
}

export namespace Gallery {
  /**
   * This data is returned from the API by calling the gallery endpoint.
   * @see GalleryDocumentsType
   * @interface
   * @since 2.0.0
   */
  export interface GalleryType {
    total: number
    documents: GalleryDocumentsType[]
  }

  /**
   * This data is returned from the API within the `documents` array.
   * @see GalleryType
   * @interface
   * @since 2.0.0
   */
  export interface GalleryDocumentsType extends Models.Document {
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
  }

  /**
   * This data is returned from the API by calling the gallery-prefs endpoint.
   * @see GalleryPrefsDocumentsType
   * @interface
   * @since 2.0.0
   */
  export interface GalleryPrefsType {
    total: number
    documents: GalleryPrefsDocumentsType[]
  }

  export interface GalleryPrefsDocumentsType extends Models.Document {
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
}

export namespace Interactive {
  /**
   * This data is returned from the API by calling the interactive endpoint.
   * @see InteractiveDocumentsType
   * @interface
   * @since 2.0.0
   */
  export interface VotesAnswersType {
    total: number
    documents: VotesAnswersDocumentsType[]
  }

  /**
   * This data is returned from the API within the `documents` array.
   * @see InteractiveType
   * @interface
   * @since 2.0.0
   */
  export interface VotesAnswersDocumentsType extends Models.Document {
    /**
     * The IP address of the user that voted.
     */
    ipAddress: string | null
    /**
     * The question ID of the question that was voted on.
     */
    questionId: string
    /**
     * The answer ID of the answer that was voted on.
     */
    optionId: number
  }

  export interface VotesQuestionsType {
    total: number
    documents: VotesQuestionsDocumentsType[]
  }

  export interface VotesQuestionsDocumentsType extends Models.Document {
    questions: string[]
    order: number
  }

  export interface VotesSystem extends Models.Document {
    questionId: string
    paused: boolean
  }
}

export namespace Events {
  /**
   * This data is returned from the API by calling the events endpoint.
   * @see EventsDocumentsType
   * @interface
   * @since 2.0.0
   */
  export interface EventsType {
    total: number
    documents: EventsDocumentsType[]
  }

  /**
   * This data is returned from the API within the `documents` array.
   * @see EventsType
   * @interface
   * @since 2.0.0
   */
  export interface EventsDocumentsType extends Models.Document {
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
    locationZoneMethod: 'polygon' | 'circle' | 'virtual'
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
}

export namespace Community {
  export interface CommunityType {
    total: number
    documents: CommunityDocumentsType[]
  }

  export interface CommunityDocumentsType extends Models.Document {
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
  }

  export interface CommunitySettingsType {
    total: number
    documents: CommunitySettingsDocumentsType[]
  }

  export interface CommunitySettingsDocumentsType extends Models.Document {
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
    documents: CommunityFollowersDocuments[]
  }

  export interface CommunityFollowersDocuments extends Models.Document {
    userId: string
    communityId: string
  }
}

export namespace Notifications {
  export interface NotificationsType {
    total: number
    documents: NotificationsDocumentsType[]
  }

  export interface NotificationsDocumentsType extends Models.Document {
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
    type: 'newFollower' | 'newMessage' | 'newEvent' | 'newAnnouncement'
    /**
     * The user data of the user
     */
    userData: UserData.UserDataDocumentsType
  }
}

export namespace Config {
  export interface ConfigFeaturesType {
    total: number
    documents: ConfigFeaturesDocumentsType[]
  }

  export interface ConfigFeaturesDocumentsType extends Models.Document {
    isEnabled: boolean
    type: 'public' | 'earlyaccess' | 'staff' | 'dev'
  }
}

export namespace Changelog {
  export interface ChangelogType {
    total: number
    documents: ChangelogDocumentsType[]
  }

  export interface ChangelogDocumentsType extends Models.Document {
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
  }
}
