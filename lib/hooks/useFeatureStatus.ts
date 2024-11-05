import { useState, useEffect } from 'react'
import { Config } from '~/lib/types/collections'
import { databases } from '~/lib/appwrite-client'

export const useFeatureStatus = (feature: string) => {
  const [featureStatus, setFeatureStatus] =
    useState<Config.ConfigFeaturesDocumentsType>(null)

  useEffect(() => {
    const fetchFeatureStatus = async () => {
      try {
        const data: Config.ConfigFeaturesDocumentsType =
          await databases.getDocument('config', 'features', feature)
        setFeatureStatus(data)
      } catch (error) {
        console.error('Error fetching feature status', error)
      }
    }

    fetchFeatureStatus().then()
  }, [feature])

  return featureStatus
}
