import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import kv from 'expo-sqlite/kv-store'

const CACHE_EXPIRATION_TIME = 24 * 60 * 60 * 1000 // 24 hours
const storeNames = ['users', 'communities']

type DataCacheContextType = {
  getCache: <T>(storeName: string, key: string) => Promise<CacheItem<T> | null>
  saveCache: <T>(storeName: string, key: string, data: T) => void
  removeCache: (storeName: string, key: string) => void
  getCacheSync: <T>(storeName: string, key: string) => CacheItem<T> | null
  getAllCache: <T>(storeName: string) => Promise<CacheItem<T>[]>
  saveAllCache: <T>(storeName: string, data: T[]) => void
}

type CacheItem<T> = {
  id: string
  data: T
  timestamp: number
}

const DataCacheContext = createContext<DataCacheContextType | undefined>(
  undefined
)

export const DataCacheProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cacheData, setCacheData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initCache = async () => {
      try {
        const cachePromises = storeNames.map((storeName) =>
          kv.getItem(storeName)
        )
        const cacheResults = await Promise.all(cachePromises)

        const formattedCacheData = cacheResults.reduce((acc, cache, index) => {
          const storeName = storeNames[index]
          const parsedCache = cache ? JSON.parse(cache) : {}
          Object.keys(parsedCache).forEach((key) => {
            acc[`${storeName}-${key}`] = parsedCache[key]
          })
          return acc
        }, {})

        setCacheData((prev) => ({
          ...prev,
          ...formattedCacheData,
        }))
      } catch (error) {
        console.error('Error initializing cache:', error)
      } finally {
        setLoading(false)
      }
    }

    initCache().then()
  }, [])

  const isCacheExpired = (timestamp: number) => {
    return Date.now() - timestamp > CACHE_EXPIRATION_TIME
  }

  const getAllCache = useCallback(
    async <T,>(storeName: string): Promise<CacheItem<T>[]> => {
      const cache = await kv.getItem(storeName)
      return cache ? JSON.parse(cache) : []
    },
    []
  )

  const getCache = useCallback(
    async <T,>(
      storeName: string,
      key: string
    ): Promise<CacheItem<T> | null> => {
      const cache = await kv.getItem(storeName)
      if (!cache) return null

      const parsedCache = JSON.parse(cache)
      const item = parsedCache[key]

      if (item && !isCacheExpired(item.timestamp)) {
        return item
      }

      // Remove expired item lazily
      if (item) {
        delete parsedCache[key]
        await kv.setItem(storeName, JSON.stringify(parsedCache))
      }
      return null
    },
    []
  )

  const saveAllCache = useCallback(async <T,>(storeName: string, data: T[]) => {
    const cache = data.reduce((acc, item) => {
      acc[item['id']] = { data: item, timestamp: Date.now() }
      return acc
    }, {})

    await kv.setItem(storeName, JSON.stringify(cache))
    setCacheData((prev) => ({ ...prev, ...cache }))
  }, [])

  const saveCache = useCallback(
    async <T,>(storeName: string, key: string, data: T) => {
      const cacheItem = { data, timestamp: Date.now() }
      const cache = await kv.getItem(storeName)
      const parsedCache = cache ? JSON.parse(cache) : {}

      parsedCache[key] = cacheItem
      await kv.setItem(storeName, JSON.stringify(parsedCache))
      setCacheData((prev) => ({ ...prev, [`${storeName}-${key}`]: cacheItem }))
    },
    []
  )

  const removeCache = useCallback(async (storeName: string, key: string) => {
    const cache = await kv.getItem(storeName)
    if (!cache) return

    const parsedCache = JSON.parse(cache)
    delete parsedCache[key]
    await kv.setItem(storeName, JSON.stringify(parsedCache))

    setCacheData((prev) => {
      const newData = { ...prev }
      delete newData[`${storeName}-${key}`]
      return newData
    })
  }, [])

  const getCacheSync = useCallback(
    <T,>(storeName: string, key: string): CacheItem<T> | null => {
      const cacheKey = `${storeName}-${key}`
      const item = cacheData[cacheKey]
      if (item && !isCacheExpired(item.timestamp)) {
        return item
      }
      return null
    },
    [cacheData]
  )

  const contextValue = useMemo(
    () => ({
      getCache,
      saveCache,
      removeCache,
      getCacheSync,
      getAllCache,
      saveAllCache,
    }),
    [getCache, saveCache, removeCache, getCacheSync, getAllCache, saveAllCache]
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
