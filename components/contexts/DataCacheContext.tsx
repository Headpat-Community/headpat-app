import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Community, UserData } from '~/lib/types/collections'
import { databases } from '~/lib/appwrite-client'

const MAX_USER_CACHE = 250
const MAX_COMMUNITY_CACHE = 50
const CACHE_EXPIRATION_TIME = 24 * 60 * 60 * 1000 // 24 hours

type DataCacheContextType = {
  userCache: Record<
    string,
    { data: UserData.UserDataDocumentsType; timestamp: number }
  >
  communityCache: Record<
    string,
    {
      data: Community.CommunityDocumentsType
      timestamp: number
    }
  >
  fetchUserData: (userId: string) => Promise<{
    data: UserData.UserDataDocumentsType
    timestamp: number
  } | null>
  fetchCommunityData: (communityId: string) => Promise<{
    data: Community.CommunityDocumentsType
    timestamp: number
  } | null>
  updateUserCache: (
    userId: string,
    data: UserData.UserDataDocumentsType
  ) => void
  updateCommunityCache: (
    communityId: string,
    data: Community.CommunityDocumentsType
  ) => void
}

const DataCacheContext = createContext<DataCacheContextType | undefined>(
  undefined
)

const manageCacheSize = async (cacheKey: string, maxSize: number) => {
  const cache = await AsyncStorage.getItem(cacheKey)
  if (cache) {
    const parsedCache = JSON.parse(cache)
    if (Object.keys(parsedCache).length > maxSize) {
      const sortedKeys = Object.keys(parsedCache).sort(
        (a, b) => parsedCache[a].timestamp - parsedCache[b].timestamp
      )
      const keysToRemove = sortedKeys.slice(
        0,
        Object.keys(parsedCache).length - maxSize
      )
      keysToRemove.forEach((key) => delete parsedCache[key])
      await AsyncStorage.setItem(cacheKey, JSON.stringify(parsedCache))
    }
  }
}

const isCacheExpired = (timestamp: number) => {
  return Date.now() - timestamp > CACHE_EXPIRATION_TIME
}

export const DataCacheProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userCache, setUserCache] = useState<
    Record<string, { data: UserData.UserDataDocumentsType; timestamp: number }>
  >({})
  const [communityCache, setCommunityCache] = useState<
    Record<
      string,
      { data: Community.CommunityDocumentsType; timestamp: number }
    >
  >({})

  const fetchUserData = useCallback(async (userId: string) => {
    if (!userId) {
      return null
    }
    const cacheKey = 'userCache'
    const cachedData = await AsyncStorage.getItem(cacheKey)
    const parsedCache = cachedData ? JSON.parse(cachedData) : {}

    if (parsedCache[userId] && !isCacheExpired(parsedCache[userId].timestamp)) {
      return parsedCache[userId]
    }

    try {
      const userData = (await databases.getDocument(
        'hp_db',
        'userdata',
        userId
      )) as UserData.UserDataDocumentsType
      const cacheEntry = { data: userData, timestamp: Date.now() }
      parsedCache[userId] = cacheEntry
      await AsyncStorage.setItem(cacheKey, JSON.stringify(parsedCache))
      await manageCacheSize(cacheKey, MAX_USER_CACHE)
      setUserCache((prevCache) => ({
        ...prevCache,
        [userId]: cacheEntry,
      }))
      return cacheEntry
    } catch (error) {
      console.error('Error fetching user data:', error)
      return null
    }
  }, [])

  const fetchCommunityData = useCallback(async (communityId: string) => {
    const cacheKey = 'communityCache'
    const cachedData = await AsyncStorage.getItem(cacheKey)
    const parsedCache = cachedData ? JSON.parse(cachedData) : {}

    if (
      parsedCache[communityId] &&
      !isCacheExpired(parsedCache[communityId].timestamp)
    ) {
      return parsedCache[communityId]
    }

    try {
      const communityData = (await databases.getDocument(
        'hp_db',
        'community',
        communityId
      )) as Community.CommunityDocumentsType
      const cacheEntry = { data: communityData, timestamp: Date.now() }
      parsedCache[communityId] = cacheEntry
      await AsyncStorage.setItem(cacheKey, JSON.stringify(parsedCache))
      await manageCacheSize(cacheKey, MAX_COMMUNITY_CACHE)
      setCommunityCache(parsedCache)
      return cacheEntry
    } catch (error) {
      console.error('Error fetching community data:', error)
      return null
    }
  }, [])

  const updateUserCache = useCallback(
    (userId: string, data: UserData.UserDataDocumentsType) => {
      const cacheKey = 'userCache'
      const cacheEntry = { data, timestamp: Date.now() }
      setUserCache((prevCache) => ({
        ...prevCache,
        [userId]: cacheEntry,
      }))
      AsyncStorage.setItem(
        cacheKey,
        JSON.stringify({ ...userCache, [userId]: cacheEntry })
      ).then()
    },
    [userCache]
  )

  const updateCommunityCache = useCallback(
    (communityId: string, data: Community.CommunityDocumentsType) => {
      const cacheKey = 'communityCache'
      const cacheEntry = { data, timestamp: Date.now() }
      setCommunityCache((prevCache) => ({
        ...prevCache,
        [communityId]: cacheEntry,
      }))
      AsyncStorage.setItem(
        cacheKey,
        JSON.stringify({ ...communityCache, [communityId]: cacheEntry })
      ).then()
    },
    [communityCache]
  )

  useEffect(() => {
    const initCache = async () => {
      try {
        const userCacheKey = 'userCache'
        const communityCacheKey = 'communityCache'

        const [userCacheData, communityCacheData] = await Promise.all([
          AsyncStorage.getItem(userCacheKey),
          AsyncStorage.getItem(communityCacheKey),
        ])

        if (userCacheData) {
          const parsedUserCache = JSON.parse(userCacheData)
          setUserCache(parsedUserCache)
        }

        if (communityCacheData) {
          const parsedCommunityCache = JSON.parse(communityCacheData)
          setCommunityCache(parsedCommunityCache)
        }
      } catch (error) {
        console.error('Error initializing cache:', error)
      }
    }

    initCache().then()
  }, [])

  return (
    <DataCacheContext.Provider
      value={{
        userCache,
        communityCache,
        fetchUserData,
        fetchCommunityData,
        updateUserCache,
        updateCommunityCache,
      }}
    >
      {children}
    </DataCacheContext.Provider>
  )
}

export const useDataCache = () => {
  const context = useContext(DataCacheContext)
  if (context === undefined) {
    throw new Error('useDataCache must be used within a DataCacheProvider')
  }
  return context
}
