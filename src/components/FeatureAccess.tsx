import { router } from 'expo-router'
import { type ReactNode, useEffect, useState } from 'react'
import { useUser } from '~/components/contexts/UserContext'
import Maintenance from '~/components/views/Maintenance'
import NoAccess from '~/components/views/NoAccess'
import { useFeatureStatus } from '~/lib/hooks/useFeatureStatus'

interface FeatureAccessProps {
  featureName: string
  children: ReactNode
}

const FeatureAccess = ({ featureName, children }: FeatureAccessProps) => {
  const [cachedFeatureStatuses, setCachedFeatureStatuses] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(true)
  const featureStatus = useFeatureStatus(featureName)
  const { current } = useUser()

  useEffect(() => {
    if (featureStatus) {
      setCachedFeatureStatuses((prevStatuses) => ({
        ...prevStatuses,
        [featureName]: featureStatus,
      }))
      setIsLoading(false)
    }
  }, [featureStatus, featureName])

  const cachedFeatureStatus = cachedFeatureStatuses[featureName]

  useEffect(() => {
    if (!isLoading && !current && cachedFeatureStatus?.type !== 'public') {
      router.push('/login')
    }
  }, [current, cachedFeatureStatus, isLoading])

  if (isLoading || !cachedFeatureStatus) {
    return null
  }

  if (cachedFeatureStatus?.type === 'public') {
    return children
  }

  if (!cachedFeatureStatus?.isEnabled && !current?.labels.includes('dev')) {
    return <Maintenance />
  } else if (
    cachedFeatureStatus?.type === 'earlyaccess' &&
    !(current?.labels.includes(`${featureName}Beta`) || current?.labels.includes('dev'))
  ) {
    return <NoAccess />
  } else if (
    cachedFeatureStatus?.type === 'staff' &&
    !(current?.labels.includes('staff') || current?.labels.includes('dev'))
  ) {
    return <NoAccess />
  } else if (cachedFeatureStatus?.type === 'dev' && !current?.labels.includes('dev')) {
    return <NoAccess />
  }

  return children
}

export default FeatureAccess
