import { ID } from 'react-native-appwrite'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { account } from '~/lib/appwrite-client'
import { toast } from '~/lib/toast'
import { Account } from '~/lib/types/collections'
import AsyncStorage from '@react-native-async-storage/async-storage'

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
    const pushToken = await AsyncStorage.getItem('pushToken')
    await account.createEmailPasswordSession(email, password)
    const accountData = await account.get()
    setUser(accountData)
    await account.createPushTarget(ID.unique(), pushToken)
    if (pushToken) {
      alert('Push token found')
    }
  }

  async function loginOAuth(userId: string, secret: string) {
    const pushToken = await AsyncStorage.getItem('pushToken')
    await account.createSession(userId, secret)
    const accountData = await account.get()
    setUser(accountData)
    await account.createPushTarget(ID.unique(), pushToken)
  }

  async function logout() {
    await account.deleteSession('current')
    setUser(null)
  }

  async function register(email: string, password: string, username: string) {
    const pushToken = await AsyncStorage.getItem('pushToken')
    await account.create(ID.unique(), email, password, username)
    await login(email, password)
  }

  async function init() {
    const pushToken = await AsyncStorage.getItem('pushToken')
    console.log(pushToken)
    try {
      const loggedIn = await account.get()
      setUser(loggedIn)
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
