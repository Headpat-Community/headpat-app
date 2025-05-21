import React, { createContext, useContext } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import kv from 'expo-sqlite/kv-store'

const CACHE_EXPIRATION_TIME = 24 * 60 * 60 * 1000 // 24 hours
const MAX_CACHE_SIZE = 1000 // Maximum number of items per store
const storeNames = ['users', 'communities', 'notifications', 'messaging']

type CacheItem<T> = {
  id: string
  data: T
  timestamp: number
  lastAccessed: number
}

type CacheStore = {
  [key: string]: CacheItem<any>
}

type DataCacheContextType = {
  getCache: <T>(storeName: string, key: string) => Promise<CacheItem<T> | null>
  saveCache: <T>(storeName: string, key: string, data: T) => Promise<void>
  removeCache: (storeName: string, key: string) => Promise<void>
  getCacheSync: <T>(storeName: string, key: string) => CacheItem<T> | null
  getAllCache: <T>(storeName: string) => Promise<CacheItem<T>[]>
  saveAllCache: <T>(storeName: string, data: T[]) => Promise<void>
  clearExpiredCache: () => Promise<void>
}

const DataCacheContext = createContext<DataCacheContextType | undefined>(
  undefined
)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: CACHE_EXPIRATION_TIME,
      gcTime: CACHE_EXPIRATION_TIME * 2,
    },
  },
})

const isCacheExpired = (timestamp: number) => {
  return Date.now() - timestamp > CACHE_EXPIRATION_TIME
}

const fetchStore = async (storeName: string): Promise<CacheStore> => {
  const cache = await kv.getItem(storeName)
  return cache ? JSON.parse(cache) : {}
}

export const DataCacheProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const getCache = async <T,>(
    storeName: string,
    key: string
  ): Promise<CacheItem<T> | null> => {
    const store = await queryClient.fetchQuery({
      queryKey: ['cache', storeName],
      queryFn: () => fetchStore(storeName),
    })

    const item = store[key]
    if (!item || isCacheExpired(item.timestamp)) {
      return null
    }

    // Update last accessed time
    item.lastAccessed = Date.now()
    await saveCache(storeName, key, item.data)
    return item as CacheItem<T>
  }

  const saveCache = async <T,>(storeName: string, key: string, data: T) => {
    const store = await queryClient.fetchQuery({
      queryKey: ['cache', storeName],
      queryFn: () => fetchStore(storeName),
    })

    const now = Date.now()
    store[key] = {
      id: key,
      data,
      timestamp: now,
      lastAccessed: now,
    }

    // Enforce cache size limit
    if (Object.keys(store).length > MAX_CACHE_SIZE) {
      const sortedItems = Object.entries(store).sort(
        (a, b) =>
          (a[1] as CacheItem<any>).lastAccessed -
          (b[1] as CacheItem<any>).lastAccessed
      )
      const itemsToKeep = sortedItems.slice(-MAX_CACHE_SIZE)
      const newStore = Object.fromEntries(itemsToKeep)
      await queryClient.setQueryData(['cache', storeName], newStore)
      await kv.setItem(storeName, JSON.stringify(newStore))
    } else {
      await queryClient.setQueryData(['cache', storeName], store)
      await kv.setItem(storeName, JSON.stringify(store))
    }
  }

  const removeCache = async (storeName: string, key: string) => {
    const store = await queryClient.fetchQuery({
      queryKey: ['cache', storeName],
      queryFn: () => fetchStore(storeName),
    })

    delete store[key]
    await queryClient.setQueryData(['cache', storeName], store)
    await kv.setItem(storeName, JSON.stringify(store))
  }

  const getCacheSync = <T,>(
    storeName: string,
    key: string
  ): CacheItem<T> | null => {
    const store = queryClient.getQueryData<CacheStore>(['cache', storeName])
    if (!store) return null

    const item = store[key]
    if (!item || isCacheExpired(item.timestamp)) return null

    return item as CacheItem<T>
  }

  const getAllCache = async <T,>(
    storeName: string
  ): Promise<CacheItem<T>[]> => {
    const store = await queryClient.fetchQuery({
      queryKey: ['cache', storeName],
      queryFn: () => fetchStore(storeName),
    })

    return Object.values(store) as CacheItem<T>[]
  }

  const saveAllCache = async <T,>(storeName: string, data: T[]) => {
    const now = Date.now()
    const store = data.reduce((acc, item) => {
      const id = (item as any).$id
      if (id) {
        acc[id] = {
          id,
          data: item,
          timestamp: now,
          lastAccessed: now,
        }
      }
      return acc
    }, {} as CacheStore)

    // Enforce cache size limit
    if (Object.keys(store).length > MAX_CACHE_SIZE) {
      const sortedItems = Object.entries(store).sort(
        (a, b) =>
          (a[1] as CacheItem<any>).lastAccessed -
          (b[1] as CacheItem<any>).lastAccessed
      )
      const itemsToKeep = sortedItems.slice(-MAX_CACHE_SIZE)
      const newStore = Object.fromEntries(itemsToKeep)
      await queryClient.setQueryData(['cache', storeName], newStore)
      await kv.setItem(storeName, JSON.stringify(newStore))
    } else {
      await queryClient.setQueryData(['cache', storeName], store)
      await kv.setItem(storeName, JSON.stringify(store))
    }
  }

  const clearExpiredCache = async () => {
    await Promise.all(
      storeNames.map(async (storeName) => {
        const store = await queryClient.fetchQuery({
          queryKey: ['cache', storeName],
          queryFn: () => fetchStore(storeName),
        })

        const expiredKeys = Object.entries(store)
          .filter(([_, item]) =>
            isCacheExpired((item as CacheItem<any>).timestamp)
          )
          .map(([key]) => key)

        if (expiredKeys.length > 0) {
          const newStore = { ...store }
          expiredKeys.forEach((key) => delete newStore[key])
          await queryClient.setQueryData(['cache', storeName], newStore)
          await kv.setItem(storeName, JSON.stringify(newStore))
        }
      })
    )
  }

  const contextValue = {
    getCache,
    saveCache,
    removeCache,
    getCacheSync,
    getAllCache,
    saveAllCache,
    clearExpiredCache,
  }

  return (
    <QueryClientProvider client={queryClient}>
      <DataCacheContext.Provider value={contextValue}>
        {children}
      </DataCacheContext.Provider>
    </QueryClientProvider>
  )
}

export const useDataCache = () => {
  const context = useContext(DataCacheContext)
  if (!context) {
    throw new Error('useDataCache must be used within a DataCacheProvider')
  }
  return context
}
