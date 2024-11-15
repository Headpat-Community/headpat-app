import React, { ReactNode, useEffect, useState } from 'react'
import { router } from 'expo-router'
import { useUser } from './contexts/UserContext'
import { useFeatureStatus } from '~/lib/hooks/useFeatureStatus'
import Maintenance from '~/components/views/Maintenance'
import NoAccess from './views/NoAccess'

interface FeatureAccessProps {
  featureName: string
  children: ReactNode
}

const FeatureAccess = ({ featureName, children }: FeatureAccessProps) => {
  const [cachedFeatureStatuses, setCachedFeatureStatuses] = useState<{
    [key: string]: any
  }>({})
  const featureStatus = useFeatureStatus(featureName)
  const { current } = useUser()

  useEffect(() => {
    if (featureStatus) {
      setCachedFeatureStatuses((prevStatuses) => ({
        ...prevStatuses,
        [featureName]: featureStatus,
      }))
    }
  }, [featureStatus, featureName])

  const cachedFeatureStatus = cachedFeatureStatuses[featureName]

  if (!cachedFeatureStatus) {
    return null
  }

  if (!current) {
    router.push('/login')
    return null
  }

  if (!cachedFeatureStatus?.isEnabled && !current.labels?.includes('dev')) {
    return <Maintenance />
  } else if (
    cachedFeatureStatus?.type === 'earlyaccess' &&
    !(
        current.labels?.includes(`${featureName}Beta`) ||
        current.labels?.includes('dev')
    )
  ) {
    return <NoAccess />
  } else if (
    cachedFeatureStatus?.type === 'staff' &&
    !(current.labels?.includes('staff') || current.labels?.includes('dev'))
  ) {
    return <NoAccess />
  } else if (
    cachedFeatureStatus?.type === 'dev' &&
    !current.labels?.includes('dev')
  ) {
    return <NoAccess />
  }

  return children
}

export default FeatureAccess
