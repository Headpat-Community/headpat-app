import { ID } from 'react-native-appwrite'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { account } from '~/lib/appwrite-client'
import { toast } from '~/lib/toast'
import { UserAccountType } from '~/lib/types/collections'

interface UserContextValue {
  current: UserAccountType | null
  setUser: React.Dispatch<React.SetStateAction<UserAccountType | null>>
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
    const loggedIn = await account.createEmailPasswordSession(email, password)
    setUser(loggedIn)
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
    } catch (err) {
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
