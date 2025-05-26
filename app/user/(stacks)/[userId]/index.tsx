import {
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
  Dimensions
} from 'react-native'
import { H3, Muted } from '~/components/ui/typography'
import { Link, useLocalSearchParams } from 'expo-router'
import React, { Suspense } from 'react'
import { UserData } from '~/lib/types/collections'
import { databases } from '~/lib/appwrite-client'
import { Image } from 'expo-image'
import { Text } from '~/components/ui/text'
import {
  CakeIcon,
  EyeIcon,
  MapPinIcon,
  ScanEyeIcon,
  TagIcon
} from 'lucide-react-native'
import { useColorScheme } from '~/lib/useColorScheme'
import { calculateBirthday } from '~/components/calculateTimeLeft'
import TelegramIcon from '~/components/icons/TelegramIcon'
import DiscordIcon from '~/components/icons/DiscordIcon'
import XIcon from '~/components/icons/XIcon'
import TwitchIcon from '~/components/icons/TwitchIcon'
import FuraffinityIcon from '~/components/icons/FuraffinityIcon'
import * as WebBrowser from 'expo-web-browser'
import * as Sentry from '@sentry/react-native'
import * as Clipboard from 'expo-clipboard'
import { useUser } from '~/components/contexts/UserContext'
import { Query } from 'react-native-appwrite'
import sanitizeHtml from 'sanitize-html'
import HTMLView from 'react-native-htmlview'
import { Badge } from '~/components/ui/badge'
import { Skeleton } from '~/components/ui/skeleton'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'
import { useQuery } from '@tanstack/react-query'
import UserActions from '~/components/user/UserActions'
import BlueskyIcon from '~/components/icons/BlueskyIcon'

export default function UserPage() {
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? 'white' : 'black'
  const local = useLocalSearchParams()
  const { current } = useUser()
  const { showAlert } = useAlertModal()

  const {
    data: userData,
    isLoading,
    isRefetching,
    refetch
  } = useQuery<UserData.UserProfileDocumentsType>({
    queryKey: ['user', local?.userId],
    queryFn: async () => {
      try {
        const [userData, followers, following, isFollowing] = await Promise.all(
          [
            // Get user data
            databases.getDocument<UserData.UserProfileDocumentsType>(
              'hp_db',
              'userdata',
              local?.userId as string
            ),
            // Get followers
            databases.listDocuments('hp_db', 'followers', [
              Query.equal('followerId', local?.userId),
              Query.limit(1)
            ]),
            // Get following
            databases.listDocuments('hp_db', 'followers', [
              Query.equal('userId', local?.userId),
              Query.limit(1)
            ]),
            databases.listDocuments('hp_db', 'followers', [
              Query.and([
                Query.equal('userId', local?.userId),
                Query.equal('followerId', current?.$id)
              ])
            ])
          ]
        )

        // Combine the data
        const combinedData: UserData.UserProfileDocumentsType = {
          ...userData,
          isFollowing: isFollowing.total > 0,
          followersCount: followers.total,
          followingCount: following.total
        }

        return combinedData
      } catch (error) {
        console.error('Error fetching user data:', error)
        Sentry.captureException(error)
        throw error
      }
    },
    enabled: !!local?.userId,
    // For social media, we want to keep data fresh
    staleTime: 300 * 1000, // Consider data stale after 5 minutes
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnReconnect: true // Refetch when network reconnects
  })

  const getUserAvatar = (avatarId: string) => {
    return avatarId
      ? `${process.env.EXPO_PUBLIC_BACKEND_URL}/v1/storage/buckets/avatars/files/${avatarId}/view?project=hp-main`
      : null
  }

  const getUserBanner = (bannerId: string) => {
    return bannerId
      ? `${process.env.EXPO_PUBLIC_BACKEND_URL}/v1/storage/buckets/banners/files/${bannerId}/preview?project=hp-main&width=1200&height=250&output=webp`
      : null
  }

  if (isLoading || !userData)
    return (
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
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

  const sanitizedBio = sanitizeHtml(userData.bio)
  const { width } = Dimensions.get('window')
  const bannerHeight = width > 600 ? 250 : 100

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
    >
      {userData.prefs?.isBlocked && (
        <Badge variant={'destructive'}>
          <Text>User is blocked</Text>
        </Badge>
      )}
      {userData?.profileBannerId && (
        <View className={''}>
          <Image
            source={getUserBanner(userData?.profileBannerId)}
            alt={`${userData?.displayName || userData?.profileUrl}'s banner`}
            style={{ width: '100%', height: bannerHeight }}
            contentFit={'contain'}
          />
        </View>
      )}
      <View className={'mx-6 my-4 flex-row items-center gap-4'}>
        <Image
          source={
            getUserAvatar(userData?.avatarId) ||
            require('~/assets/pfp-placeholder.png')
          }
          alt={`${userData?.displayName}'s avatar`}
          style={{ width: 100, height: 100, borderRadius: 50 }}
          contentFit={'cover'}
        />
        <View>
          <View className={'flex-row flex-wrap'}>
            <H3>{userData?.displayName}</H3>
          </View>
          <Text className={'mb-4 flex-row flex-wrap'}>{userData?.status}</Text>
          <View className={'flex-row gap-2'}>
            <Suspense>
              <UserActions userData={userData} current={current} />
            </Suspense>
          </View>
        </View>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1 }}>
          <View className={'mx-10 my-4 flex-row justify-between gap-4'}>
            <View>
              {userData?.location && (
                <Muted className={'mb-2'}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MapPinIcon
                      size={12}
                      title={'Location'}
                      color={theme}
                      style={{ marginRight: 4 }}
                    />
                    <Muted>{userData?.location}</Muted>
                  </View>
                </Muted>
              )}
              {!userData?.birthday?.includes('1900-01-01') && (
                <Muted className={'mb-2'}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <CakeIcon
                      size={12}
                      color={theme}
                      style={{ marginRight: 4 }}
                    />
                    <Muted>
                      {calculateBirthday(new Date(userData?.birthday))}
                    </Muted>
                  </View>
                </Muted>
              )}
              {userData?.pronouns && (
                <Muted className={'mb-2'}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TagIcon
                      size={12}
                      color={theme}
                      title={'Pronouns'}
                      style={{ marginRight: 4 }}
                    />
                    <Muted>{userData?.pronouns}</Muted>
                  </View>
                </Muted>
              )}
            </View>
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <View className={'mx-10 my-4 flex-row justify-between gap-4'}>
            <View>
              <Muted style={{ marginBottom: 8 }}>
                <Link href={`/user/${userData?.$id}/relationships/followers`}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <EyeIcon
                      size={12}
                      title={'Location'}
                      color={theme}
                      style={{ marginRight: 4 }}
                    />
                    <Muted>{userData?.followersCount} Followers</Muted>
                  </View>
                </Link>
              </Muted>
              <Muted style={{ marginBottom: 8 }}>
                <Link href={`/user/${userData?.$id}/relationships/following`}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <ScanEyeIcon
                      size={12}
                      color={theme}
                      style={{ marginRight: 4 }}
                    />
                    <Muted>{userData?.followingCount} Following</Muted>
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
            a: { color: 'hsl(208, 100%, 50%)' }
          }}
          textComponentProps={{ style: { color: theme } }}
        />
      </View>
      <View className={'mx-10 my-4 gap-4'}>
        {userData?.telegramname && (
          <TouchableOpacity
            className={'flex-row items-center gap-4'}
            onPress={() =>
              WebBrowser.openBrowserAsync(
                `https://t.me/${userData?.telegramname}`
              )
            }
          >
            <TelegramIcon
              size={32}
              color={theme}
              title={'Telegram'}
              style={{ marginRight: 4 }}
            />
            <Text>{userData?.telegramname}</Text>
          </TouchableOpacity>
        )}
        {userData?.discordname && (
          <TouchableOpacity
            className={'flex-row items-center gap-4'}
            onPress={() => {
              Clipboard.setStringAsync(userData?.discordname).then()
              showAlert('INFO', 'Copied name!')
            }}
          >
            <DiscordIcon
              size={32}
              color={theme}
              title={'Discord'}
              style={{ marginRight: 4 }}
            />
            <Text>{userData?.discordname}</Text>
          </TouchableOpacity>
        )}
        {userData?.X_name && (
          <TouchableOpacity
            className={'flex-row items-center gap-4'}
            onPress={() =>
              WebBrowser.openBrowserAsync(`https://x.com/${userData?.X_name}`)
            }
          >
            <XIcon
              size={32}
              color={theme}
              title={'X'}
              style={{ marginRight: 4 }}
            />
            <Text>{userData?.X_name}</Text>
          </TouchableOpacity>
        )}
        {userData?.twitchname && (
          <TouchableOpacity
            className={'flex-row items-center gap-4'}
            onPress={() =>
              WebBrowser.openBrowserAsync(
                `https://twitch.tv/${userData?.twitchname}`
              )
            }
          >
            <TwitchIcon
              size={32}
              color={theme}
              title={'Twitch'}
              style={{ marginRight: 4 }}
            />
            <Text>{userData?.twitchname}</Text>
          </TouchableOpacity>
        )}
        {userData?.furaffinityname && (
          <TouchableOpacity
            className={'flex-row items-center gap-4'}
            onPress={() =>
              WebBrowser.openBrowserAsync(
                `https://furaffinity.net/user/${userData?.furaffinityname}`
              )
            }
          >
            <FuraffinityIcon
              size={32}
              color={theme}
              title={'Furaffinity'}
              style={{ marginRight: 4 }}
            />
            <Text>{userData?.furaffinityname}</Text>
          </TouchableOpacity>
        )}
        {userData?.blueskyname && (
          <TouchableOpacity
            className={'flex-row items-center gap-4'}
            onPress={() =>
              WebBrowser.openBrowserAsync(
                `https://bsky.app/profile/${userData?.blueskyname}`
              )
            }
          >
            <BlueskyIcon
              size={32}
              color={theme}
              title={'Bluesky'}
              style={{ marginRight: 4 }}
            />
            <Text>{userData?.blueskyname}</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  )
}
