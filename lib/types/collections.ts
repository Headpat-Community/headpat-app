import { Models } from 'react-native-appwrite'

/**
 * This data is returned from the API by calling their own account data.
 * @see EventsDocumentsType
 */
export interface EventsType {
  total: number
  documents: EventsDocumentsType[]
}

/**
 * This data is returned from the API within the EventsType `documents` array.
 * @see EventsType
 */
export interface EventsDocumentsType extends Models.Document {
  title: string
  label: string
  description: string
  location: string
  locationZoneMethod: 'virtual' | 'circle' | 'polygon'
  coordinates: string[]
  circleRadius: number
  date: string
  dateUntil: string
}

/**
 * This data is returned from the API by calling the announcements endpoint.
 * @see AnnouncementsDocumentsType
 */
export interface AnnouncementsType {
  total: number
  documents: AnnouncementsDocumentsType[]
}

/**
 * This data is returned from the API within the AnnouncementsType `documents` array.
 * @see AnnouncementsType
 */
export interface AnnouncementsDocumentsType extends Models.Document {
  title: string
  sideText: string
  description: string
  validUntil: string
  userData: UserDataDocumentsType
}

/**
 * This data is returned from the API by calling their own account data.
 */
export interface UserAccountType extends Models.User<Models.Preferences> {
  prefs: {
    nsfw: boolean
  }
}

/**
 * This data is returned from the API by calling the userdata endpoint.
 * @see UserDataDocumentsType
 */
export interface UserDataType {
  total: number
  documents: UserDataDocumentsType[]
}

/**
 * This data is returned from the API within the UserDataType `documents` array.
 * @see UserDataType
 */
export interface UserDataDocumentsType extends Models.Document {
  avatarId: string | null
  profileBannerId: string | null
  status: string | null
  displayName: string
  bio: string | null
  birthday: string | null
  profileUrl: string
  pronouns: string | null
  discordname: string | null
  telegramname: string | null
  furaffinityname: string | null
  X_name: string | null
  twitchname: string | null
  pats: number | 0
  location: string | null
  hideLocation: boolean
  hideBirthday: boolean
  hidePats: boolean
}

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
  userData: UserDataDocumentsType
}

/**
 * This data is returned from the API by calling the gallery-images endpoint.
 * @see GalleryImagesType
 */
export interface GalleryImagesType {
  total: number
  documents: GalleryImagesDocumentsType[]
}

/**
 * This data is returned from the API within the GalleryImagesType `documents` array.
 * @see GalleryImagesType
 */
export interface GalleryImagesDocumentsType extends Models.Document {
  galleryId: string
  name: string
  userId: string
  imgAlt: string
  longText: string
  nsfw: boolean
  tags: string[]
  mimeType: string
}

/**
 * This data is returned from the API by calling the friends endpoint.
 * @see FriendsDocumentsType
 */
export interface FriendsType {
  total: number
  documents: FriendsDocumentsType[]
}

/**
 * This data is returned from the API within the FriendsType `documents` array.
 * @see FriendsType
 */
export interface FriendsDocumentsType extends Models.Document {
  friends: string[]
}
