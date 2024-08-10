import { ID } from 'react-native-appwrite'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { account } from '~/lib/appwrite-client'
import { toast } from '~/lib/toast'
import { Account } from '~/lib/types/collections'

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
    //toast('Welcome back. You are logged in!')
  }

  async function loginOAuth(userId: string, secret: string) {
    const loggedIn = await account.createSession(userId, secret)
    setUser(loggedIn)
    //toast('Welcome back. You are logged in!')
  }

  async function logout() {
    await account.deleteSession('current')
    setUser(null)
    //toast('Logged out.')
  }

  async function register(email: string, password: string, username: string) {
    await account.create(ID.unique(), email, password, username)
    await login(email, password)
    toast('Account created!')
  }

  async function init() {
    try {
      const loggedIn = await account.get()
      setUser(loggedIn)
      //toast('Welcome back. You are logged in!')
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
