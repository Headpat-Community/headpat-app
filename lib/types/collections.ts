import { Models } from 'react-native-appwrite'

export interface EventsType {
  total: number
  documents: EventsDocumentsType[]
}

export interface EventsDocumentsType extends Models.Document {
  title: string
  label: string
  description: string
  location: string
  date: string
  dateUntil: string
}
