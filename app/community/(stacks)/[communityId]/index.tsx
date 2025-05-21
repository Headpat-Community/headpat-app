import { RefreshControl, ScrollView, View, Dimensions } from 'react-native'
import { H1, H3, Muted } from '~/components/ui/typography'
import { Link, useLocalSearchParams } from 'expo-router'
import React, { Suspense, useEffect, useState } from 'react'
import { Community } from '~/lib/types/collections'
import { functions } from '~/lib/appwrite-client'
import { Image } from 'expo-image'
import { Text } from '~/components/ui/text'
import { EyeIcon } from 'lucide-react-native'
import { useColorScheme } from '~/lib/useColorScheme'
import * as Sentry from '@sentry/react-native'
import { useUser } from '~/components/contexts/UserContext'
import { ExecutionMethod } from 'react-native-appwrite'
import sanitizeHtml from 'sanitize-html'
import HTMLView from 'react-native-htmlview'
import { Badge } from '~/components/ui/badge'
import { Skeleton } from '~/components/ui/skeleton'
import { hasAdminPanelAccess } from '~/components/community/hasPermission'
import { useDataCache } from '~/components/contexts/DataCacheContext'
import CommunityActions from '~/components/community/CommunityActions'

export default function UserPage() {
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? 'white' : 'black'
  const local = useLocalSearchParams()
  const [communityData, setCommunityData] =
    useState<Community.CommunityDocumentsType>(null)
  const [hasPermissions, setHasPermissions] = useState<boolean>(false)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const { current } = useUser()
  const { getCache, saveCache } = useDataCache()

  const fetchCommunity = async () => {
    setRefreshing(true)
    const cache = await getCache<Community.CommunityDocumentsType>(
      'communities',
      `${local?.communityId}`
    )
    if (cache) {
      setCommunityData(cache?.data)
      setRefreshing(false)
      setHasPermissions(await hasAdminPanelAccess(cache?.data?.roles))
    }

    try {
      const data = await functions.createExecution(
        'community-endpoints',
        '',
        false,
        `/community?communityId=${local?.communityId}`,
        ExecutionMethod.GET
      )
      const dataCommunityJson = JSON.parse(data.responseBody)

      saveCache('communities', `${local?.communityId}`, dataCommunityJson)
      setCommunityData(dataCommunityJson)
      setHasPermissions(await hasAdminPanelAccess(dataCommunityJson.roles))
    } catch (error) {
      Sentry.captureException(error)
    } finally {
      setRefreshing(false)
    }
  }

  const getAvatar = (avatarId: string) => {
    return avatarId
      ? `https://api.headpat.place/v1/storage/buckets/community-avatars/files/${avatarId}/view?project=hp-main`
      : null
  }

  const getBanner = (bannerId: string) => {
    return bannerId
      ? `https://api.headpat.place/v1/storage/buckets/community-banners/files/${bannerId}/preview?project=hp-main&width=1200&height=250&output=webp`
      : null
  }

  useEffect(() => {
    fetchCommunity().then()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local.communityId])

  if (!communityData)
    return (
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchCommunity} />
        }
      >
        <View style={{ padding: 16, gap: 16 }}>
          <Skeleton className={'w-full h-24'} />
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <Skeleton className={'w-24 h-24 rounded-[48px]'} />
            <View style={{ flex: 1, gap: 8 }}>
              <Skeleton className={'w-[50%] h-6'} />
              <Skeleton className={'w-[75%] h-4'} />
              <Skeleton className={'w-[33%] h-4'} />
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <View style={{ flex: 1, gap: 8 }}>
              <Skeleton className={'w-full h-4'} />
              <Skeleton className={'w-[75%] h-4'} />
            </View>
            <View style={{ flex: 1, gap: 8 }}>
              <Skeleton className={'w-full h-4'} />
              <Skeleton className={'w-[75%] h-4'} />
            </View>
          </View>
          <View style={{ gap: 8 }}>
            <Skeleton className={'w-full h-4'} />
            <Skeleton className={'w-full h-4'} />
            <Skeleton className={'w-[83%] h-4'} />
          </View>
          <View style={{ gap: 16 }}>
            <Skeleton className={'w-full h-6'} />
            <Skeleton className={'w-full h-6'} />
            <Skeleton className={'w-full h-6'} />
          </View>
        </View>
      </ScrollView>
    )

  const sanitizedBio = sanitizeHtml(communityData.description)
  const { width } = Dimensions.get('window')
  const bannerHeight = width > 600 ? 250 : 100

  if (!communityData && !refreshing)
    return (
      <ScrollView
        contentContainerClassName={'flex-1 justify-center items-center h-full'}
      >
        <View className={'p-4 native:pb-24 max-w-md gap-6'}>
          <View className={'gap-1'}>
            <H1 className={'text-foreground text-center'}>Followers</H1>
            <Muted className={'text-base text-center'}>
              This user does not exist.
            </Muted>
          </View>
        </View>
      </ScrollView>
    )

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchCommunity} />
      }
    >
      {communityData?.prefs?.isBlocked && (
        <Badge variant={'destructive'}>
          <Text>User is blocked</Text>
        </Badge>
      )}
      {communityData?.bannerId && (
        <View className={'flex-1 justify-center items-center'}>
          <Image
            source={getBanner(communityData?.bannerId)}
            alt={`${communityData?.name}'s banner`}
            style={{ width: '100%', height: bannerHeight }}
            contentFit={'contain'}
          />
        </View>
      )}
      <View className={'mx-6 my-4 flex-row items-center gap-4'}>
        <Image
          source={
            getAvatar(communityData?.avatarId) ||
            require('~/assets/pfp-placeholder.png')
          }
          alt={`${communityData?.name}'s avatar`}
          style={{ width: 100, height: 100, borderRadius: 50 }}
          contentFit={'cover'}
        />
        <View>
          <View className={'flex-row flex-wrap'}>
            <H3>{communityData?.name}</H3>
          </View>
          <Text className={'mb-4 flex-row flex-wrap'}>
            {communityData?.status}
          </Text>
          <View className={'flex-row gap-2'}>
            <Suspense>
              <CommunityActions
                data={communityData}
                setData={setCommunityData}
                hasPermissions={hasPermissions}
                current={current}
              />
            </Suspense>
          </View>
        </View>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1 }}>
          <View className={'mx-10 my-4 flex-row justify-between gap-4'}>
            <View>
              <Muted style={{ marginBottom: 8 }}>
                <Link
                  href={`/community/${communityData?.$id}/relationships/followers`}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <EyeIcon
                      size={12}
                      title={'Location'}
                      color={theme}
                      style={{ marginRight: 4 }}
                    />
                    <Muted>{communityData?.followersCount} Followers</Muted>
                  </View>
                </Link>
              </Muted>
            </View>
          </View>
        </View>
      </View>
      <View className={'mx-10 mb-4'}>
        <HTMLView
          value={sanitizedBio}
          stylesheet={{
            p: { color: theme },
            a: { color: 'hsl(208, 100%, 50%)' },
          }}
          textComponentProps={{ style: { color: theme } }}
        />
      </View>
    </ScrollView>
  )
}
