import React, { createContext, useContext, useState, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Community, UserData } from '~/lib/types/collections'
import { databases } from '~/lib/appwrite-client'

const MAX_USER_CACHE = 50
const MAX_COMMUNITY_CACHE = 50
const CACHE_EXPIRATION_TIME = 24 * 60 * 60 * 1000 // 24 hours

type DataCacheContextType = {
  userCache: Record<string, UserData.UserDataDocumentsType>
  communityCache: Record<string, Community.CommunityDocumentsType>
  fetchUserData: (
    userId: string
  ) => Promise<UserData.UserDataDocumentsType | null>
  fetchCommunityData: (
    communityId: string
  ) => Promise<Community.CommunityDocumentsType | null>
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
    Record<string, UserData.UserDataDocumentsType>
  >({})
  const [communityCache, setCommunityCache] = useState<
    Record<string, Community.CommunityDocumentsType>
  >({})

  const fetchUserData = useCallback(async (userId: string) => {
    const cacheKey = 'userCache'
    const cachedData = await AsyncStorage.getItem(cacheKey)
    const parsedCache = cachedData ? JSON.parse(cachedData) : {}

    if (parsedCache[userId] && !isCacheExpired(parsedCache[userId].timestamp)) {
      return parsedCache[userId].data
    }

    try {
      const userData = (await databases.getDocument(
        'hp_db',
        'userdata',
        userId
      )) as UserData.UserDataDocumentsType
      parsedCache[userId] = { data: userData, timestamp: Date.now() }
      await AsyncStorage.setItem(cacheKey, JSON.stringify(parsedCache))
      await manageCacheSize(cacheKey, MAX_USER_CACHE)
      setUserCache(parsedCache)
      return userData
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
      return parsedCache[communityId].data
    }

    try {
      const communityData = (await databases.getDocument(
        'hp_db',
        'community',
        communityId
      )) as Community.CommunityDocumentsType
      parsedCache[communityId] = {
        data: communityData,
        timestamp: Date.now(),
      }
      await AsyncStorage.setItem(cacheKey, JSON.stringify(parsedCache))
      await manageCacheSize(cacheKey, MAX_COMMUNITY_CACHE)
      setCommunityCache(parsedCache)
      return communityData
    } catch (error) {
      console.error('Error fetching community data:', error)
      return null
    }
  }, [])

  return (
    <DataCacheContext.Provider
      value={{ userCache, communityCache, fetchUserData, fetchCommunityData }}
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
