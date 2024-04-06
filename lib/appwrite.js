import { Client, Account, Database } from 'react-native-appwrite'
// Init your Web SDK
const client = new Client()

client
  .setEndpoint('https://api.headpat.de/v1') // Your Appwrite Endpoint
  .setProject('6557c1a8b6c2739b3ecf') // Your project ID
  .setPlatform('com.headpat.app') // Your application ID or bundle ID.

export const account = new Account(client)
export const database = new Database(client)
