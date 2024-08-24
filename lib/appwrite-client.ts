import {
  Client,
  Account,
  Databases,
  Functions,
  Storage,
} from 'react-native-appwrite'

export const client = new Client()

client
  .setEndpoint('https://api.headpat.place/v1') // Your Appwrite Endpoint
  .setProject('hp-main') // Your project ID
  .setPlatform('com.headpat.app') // Your application ID or bundle ID.

export const account = new Account(client)
export const database = new Databases(client)
export const functions = new Functions(client)
export const storage = new Storage(client)
