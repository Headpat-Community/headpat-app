import AsyncStorage from '@react-native-async-storage/async-storage'
import { captureException } from '@sentry/react-native'
import type React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import { ID } from 'react-native-appwrite'
import { account } from '~/lib/appwrite-client'
import type { AccountPrefs, AccountType } from '~/lib/types/collections'

interface UserContextValue {
  current: AccountPrefs | null
  setUser: React.Dispatch<React.SetStateAction<AccountType | null>>
  isLoadingUser: boolean
  login: (email: string, password: string) => Promise<void>
  loginOAuth: (userId: string, secret: string) => Promise<void>
  logout: () => Promise<void>
  register: (email: string, password: string, username: string) => Promise<void>
}

const UserContext = createContext<UserContextValue | undefined>(undefined)

export function useUser(): UserContextValue {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export function UserProvider(props: any) {
  const [user, setUser] = useState<AccountType | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(false)

  async function login(email: string, password: string) {
    await account.createEmailPasswordSession({
      email,
      password,
    })
    const accountData = await account.get()
    setUser(accountData)
    await loggedInPushNotifications()
  }

  async function loginOAuth(userId: string, secret: string) {
    await account.createSession({
      userId,
      secret,
    })
    const accountData = await account.get()
    setUser(accountData)
    await loggedInPushNotifications()
  }

  async function logout() {
    try {
      await account.deleteSession({
        sessionId: 'current',
      })
      setUser(null)
    } catch {
      setUser(null)
    }
  }

  async function register(email: string, password: string, username: string) {
    await account.create({
      userId: ID.unique(),
      email,
      password,
      name: username,
    })
    await login(email, password)
  }

  async function init() {
    try {
      setIsLoadingUser(true)
      const loggedIn = await account.get()
      setUser(loggedIn)
      await AsyncStorage.setItem('userId', loggedIn.$id)
      setIsLoadingUser(false)
      await loggedInPushNotifications()
    } catch {
      setUser(null)
      setIsLoadingUser(false)
    }
  }

  useEffect(() => {
    void init()
  }, [])

  return (
    <UserContext.Provider
      value={{
        current: user as AccountPrefs | null,
        setUser,
        isLoadingUser,
        login,
        loginOAuth,
        logout,
        register,
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
  if (!fcmToken) return
  const targetId = await AsyncStorage.getItem('targetId')
  let session: AccountPrefs
  try {
    session = await account.get()
    if (!session.$id) return // User is not logged in
  } catch {
    return
  }

  // Check if the target is already in the user's account
  const target = session.targets.find((t) => t.$id === targetId)
  if (target) return

  try {
    // Create a new push target
    const target = await account.createPushTarget({
      targetId: ID.unique(),
      identifier: fcmToken,
      providerId: '66bcfc3b0028d9fb7a68', // FCM Appwrite Provider ID
    })
    await AsyncStorage.setItem('targetId', target.$id)
  } catch (error) {
    console.error('Failed to create push target in Appwrite:', error)
    captureException(error)
  }
}
