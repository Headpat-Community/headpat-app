import {ID, Models} from 'react-native-appwrite'
import {createContext, useContext, useEffect, useState} from 'react'
import {account} from '~/lib/appwrite-client'
import {toast} from '~/lib/toast'

// TODO: Check this out, proper typing.
// @ts-ignore
const UserContext = createContext()

export function useUser() {
  return useContext(UserContext)
}

export function UserProvider(props: any) {
  const [user, setUser] = useState<Models.Session | Models.User<Models.Preferences>>()

  async function login(email: string, password: string) {
    const loggedIn = await account.createEmailPasswordSession(email, password)
    setUser(loggedIn)
    toast('Welcome back. You are logged in!')
  }

  async function loginOAuth(userId: string, secret: string) {
    const loggedIn = await account.createSession(userId, secret)
    setUser(loggedIn)
    toast('Welcome back. You are logged in!')
  }

  async function logout() {
    await account.deleteSession('current')
    setUser(null)
    toast('Logged out.')
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
          value={{current: user, login, loginOAuth, logout, register, toast}}
      >
        {props.children}
      </UserContext.Provider>
  )
}
