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
 * This data is returned from the API within the `documents` array.
 * @see EventsType
 */
export interface EventsDocumentsType extends Models.Document {
  title: string
  label: string
  description: string
  location: string
  date: string
  dateUntil: string
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
 * This data is returned from the API by calling the userData function.
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
