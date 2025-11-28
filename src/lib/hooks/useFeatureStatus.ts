import { useEffect, useState } from "react"
import { databases } from "~/lib/appwrite-client"
import type { ConfigFeaturesDocumentsType } from "~/lib/types/collections"

export const useFeatureStatus = (feature: string) => {
  const [featureStatus, setFeatureStatus] =
    useState<ConfigFeaturesDocumentsType | null>(null)

  useEffect(() => {
    const fetchFeatureStatus = async () => {
      try {
        const data: ConfigFeaturesDocumentsType = await databases.getRow({
          databaseId: "config",
          tableId: "features",
          rowId: feature,
        })
        setFeatureStatus(data)
      } catch (error) {
        console.error("Error fetching feature status", error)
      }
    }

    void fetchFeatureStatus()
  }, [feature])

  return featureStatus
}
