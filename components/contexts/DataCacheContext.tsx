import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react'
import kv from 'expo-sqlite/kv-store'

const CACHE_EXPIRATION_TIME = 24 * 60 * 60 * 1000 // 24 hours
const MAX_CACHE_SIZE = 1000 // Maximum number of items per store
const BATCH_SIZE = 50 // Number of items to process in batch operations
const storeNames = ['users', 'communities', 'notifications']

type DataCacheContextType = {
  getCache: <T>(storeName: string, key: string) => Promise<CacheItem<T> | null>
  saveCache: <T>(storeName: string, key: string, data: T) => Promise<void>
  removeCache: (storeName: string, key: string) => Promise<void>
  getCacheSync: <T>(storeName: string, key: string) => CacheItem<T> | null
  getAllCache: <T>(storeName: string) => Promise<CacheItem<T>[]>
  saveAllCache: <T>(storeName: string, data: T[]) => Promise<void>
  clearExpiredCache: () => Promise<void>
}

type CacheItem<T> = {
  id: string
  data: T
  timestamp: number
  lastAccessed: number
}

type CacheStore = {
  [key: string]: CacheItem<any>
}

const DataCacheContext = createContext<DataCacheContextType | undefined>(undefined)

export const DataCacheProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cacheData, setCacheData] = useState<Record<string, CacheStore>>({})
  const [loading, setLoading] = useState(true)
  const cacheRef = useRef<Record<string, CacheStore>>({})
  const initializationPromise = useRef<Promise<void> | null>(null)

  const isCacheExpired = useCallback((timestamp: number) => {
    return Date.now() - timestamp > CACHE_EXPIRATION_TIME
  }, [])

  const initializeCache = useCallback(async () => {
    if (initializationPromise.current) {
      return initializationPromise.current
    }

    initializationPromise.current = (async () => {
      try {
        const cachePromises = storeNames.map((storeName) =>
          kv.getItem(storeName)
        )
        const cacheResults = await Promise.all(cachePromises)

        const newCacheData = cacheResults.reduce((acc, cache, index) => {
          const storeName = storeNames[index]
          const parsedCache = cache ? JSON.parse(cache) : {}
          acc[storeName] = parsedCache
          return acc
        }, {} as Record<string, CacheStore>)

        cacheRef.current = newCacheData
        setCacheData(newCacheData)
      } catch (error) {
        console.error('Error initializing cache:', error)
        // Initialize empty cache stores on error
        const emptyCache = storeNames.reduce((acc, storeName) => {
          acc[storeName] = {}
          return acc
        }, {} as Record<string, CacheStore>)
        cacheRef.current = emptyCache
        setCacheData(emptyCache)
      } finally {
        setLoading(false)
      }
    })()

    return initializationPromise.current
  }, [])

  useEffect(() => {
    initializeCache()
  }, [initializeCache])

  const cleanupExpiredItems = useCallback(async (storeName: string) => {
    const store = cacheRef.current[storeName]
    if (!store) return

    const expiredKeys = Object.entries(store)
      .filter(([_, item]) => isCacheExpired(item.timestamp))
      .map(([key]) => key)

    if (expiredKeys.length > 0) {
      const newStore = { ...store }
      expiredKeys.forEach((key) => delete newStore[key])
      cacheRef.current[storeName] = newStore
      setCacheData((prev) => ({ ...prev, [storeName]: newStore }))
      await kv.setItem(storeName, JSON.stringify(newStore))
    }
  }, [isCacheExpired])

  const getAllCache = useCallback(
    async <T,>(storeName: string): Promise<CacheItem<T>[]> => {
      await cleanupExpiredItems(storeName)
      const store = cacheRef.current[storeName] || {}
      return Object.values(store) as CacheItem<T>[]
    },
    [cleanupExpiredItems]
  )

  const getCache = useCallback(
    async <T,>(
      storeName: string,
      key: string
    ): Promise<CacheItem<T> | null> => {
      const store = cacheRef.current[storeName]
      if (!store) return null

      const item = store[key]
      if (!item) return null

      if (isCacheExpired(item.timestamp)) {
        await cleanupExpiredItems(storeName)
        return null
      }

      // Update last accessed time
      item.lastAccessed = Date.now()
      await saveCache(storeName, key, item.data)
      return item as CacheItem<T>
    },
    [isCacheExpired, cleanupExpiredItems]
  )

  const saveAllCache = useCallback(async <T,>(storeName: string, data: T[]) => {
    const store = cacheRef.current[storeName] || {}
    const now = Date.now()

    // Process in batches to avoid memory issues
    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      const batch = data.slice(i, i + BATCH_SIZE)
      batch.forEach((item) => {
        const id = (item as any).$id
        if (id) {
          store[id] = {
            id,
            data: item,
            timestamp: now,
            lastAccessed: now,
          }
        }
      })
    }

    // Enforce cache size limit
    if (Object.keys(store).length > MAX_CACHE_SIZE) {
      const sortedItems = Object.entries(store)
        .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed)
      const itemsToKeep = sortedItems.slice(-MAX_CACHE_SIZE)
      const newStore = Object.fromEntries(itemsToKeep)
      cacheRef.current[storeName] = newStore
    } else {
      cacheRef.current[storeName] = store
    }

    setCacheData((prev) => ({ ...prev, [storeName]: cacheRef.current[storeName] }))
    await kv.setItem(storeName, JSON.stringify(cacheRef.current[storeName]))
  }, [])

  const saveCache = useCallback(
    async <T,>(storeName: string, key: string, data: T) => {
      const store = cacheRef.current[storeName] || {}
      const now = Date.now()

      store[key] = {
        id: key,
        data,
        timestamp: now,
        lastAccessed: now,
      }

      // Enforce cache size limit
      if (Object.keys(store).length > MAX_CACHE_SIZE) {
        const sortedItems = Object.entries(store)
          .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed)
        const itemsToKeep = sortedItems.slice(-MAX_CACHE_SIZE)
        const newStore = Object.fromEntries(itemsToKeep)
        cacheRef.current[storeName] = newStore
      } else {
        cacheRef.current[storeName] = store
      }

      setCacheData((prev) => ({ ...prev, [storeName]: cacheRef.current[storeName] }))
      await kv.setItem(storeName, JSON.stringify(cacheRef.current[storeName]))
    },
    []
  )

  const removeCache = useCallback(async (storeName: string, key: string) => {
    const store = cacheRef.current[storeName]
    if (!store) return

    delete store[key]
    cacheRef.current[storeName] = store
    setCacheData((prev) => ({ ...prev, [storeName]: store }))
    await kv.setItem(storeName, JSON.stringify(store))
  }, [])

  const getCacheSync = useCallback(
    <T,>(storeName: string, key: string): CacheItem<T> | null => {
      const store = cacheRef.current[storeName]
      if (!store) return null

      const item = store[key]
      if (!item || isCacheExpired(item.timestamp)) return null

      return item as CacheItem<T>
    },
    [isCacheExpired]
  )

  const clearExpiredCache = useCallback(async () => {
    await Promise.all(storeNames.map(cleanupExpiredItems))
  }, [cleanupExpiredItems])

  const contextValue = useMemo(
    () => ({
      getCache,
      saveCache,
      removeCache,
      getCacheSync,
      getAllCache,
      saveAllCache,
      clearExpiredCache,
    }),
    [
      getCache,
      saveCache,
      removeCache,
      getCacheSync,
      getAllCache,
      saveAllCache,
      clearExpiredCache,
    ]
  )

  return (
    <DataCacheContext.Provider value={contextValue}>
      {loading ? null : children}
    </DataCacheContext.Provider>
  )
}

export const useDataCache = () => {
  const context = useContext(DataCacheContext)
  if (!context) {
    throw new Error('useDataCache must be used within a DataCacheProvider')
  }
  return context
}
