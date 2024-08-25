import { ID } from 'react-native-appwrite'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { account } from '~/lib/appwrite-client'
import { toast } from '~/lib/toast'
import { Account } from '~/lib/types/collections'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Sentry from '@sentry/react-native'

interface UserContextValue {
  current: Account.AccountType | null
  setUser: React.Dispatch<React.SetStateAction<Account.AccountType | null>>
  login: (email: string, password: string) => Promise<void>
  loginOAuth: (userId: string, secret: string) => Promise<void>
  logout: () => Promise<void>
  register: (email: string, password: string, username: string) => Promise<void>
  toast: (message: string) => void
}

// TODO: Check this out, proper typing.
// @ts-ignore
const UserContext = createContext<UserContextValue | undefined>(undefined)

export function useUser(): UserContextValue {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export function UserProvider(props: any) {
  const [user, setUser] = useState(null)

  async function login(email: string, password: string) {
    await account.createEmailPasswordSession(email, password)
    const accountData = await account.get()
    setUser(accountData)
    await loggedInPushNotifications()
  }

  async function loginOAuth(userId: string, secret: string) {
    await account.createSession(userId, secret)
    const accountData = await account.get()
    setUser(accountData)
    await loggedInPushNotifications()
  }

  async function logout() {
    await account.deleteSession('current')
    setUser(null)
  }

  async function register(email: string, password: string, username: string) {
    await account.create(ID.unique(), email, password, username)
    await login(email, password)
  }

  async function init() {
    try {
      const loggedIn = await account.get()
      setUser(loggedIn)
      await loggedInPushNotifications()
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setUser(null)
    }
  }

  useEffect(() => {
    init().then()
  }, [])

  return (
    <UserContext.Provider
      value={{
        current: user,
        setUser,
        login,
        loginOAuth,
        logout,
        register,
        toast,
      }}
    >
      {props.children}
    </UserContext.Provider>
  )
}

const loggedInPushNotifications = async () => {
  const fcmToken = await AsyncStorage.getItem('fcmToken')
  if (!fcmToken) return
  await updatePushTargetWithAppwrite(fcmToken)
}

export const updatePushTargetWithAppwrite = async (fcmToken: string) => {
  // If is simulator, don't update push target
  const targetId = await AsyncStorage.getItem('targetId')
  if (!fcmToken) return

  try {
    const session = await account.get()

    if (!session) return // User is not logged in

    if (!targetId) {
      // Create a new push target
      const target = await account.createPushTarget(
        ID.unique(),
        fcmToken,
        '66bcfc3b0028d9fb7a68'
      )
      await AsyncStorage.setItem('targetId', target.$id)
    } else {
      // Update the existing push target
      await account.updatePushTarget(targetId, fcmToken)
    }
  } catch (error) {
    console.error('Failed to update push target in Appwrite:', error)
    Sentry.captureException(error)
  }
}
