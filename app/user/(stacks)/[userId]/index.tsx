import {
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native'
import { H3, Muted } from '~/components/ui/typography'
import { Link, useLocalSearchParams } from 'expo-router'
import React, { Suspense, useCallback, useEffect, useState } from 'react'
import { UserData } from '~/lib/types/collections'
import { functions } from '~/lib/appwrite-client'
import { Image } from 'expo-image'
import { Text } from '~/components/ui/text'
import {
  CakeIcon,
  EyeIcon,
  MapPinIcon,
  ScanEyeIcon,
  TagIcon,
} from 'lucide-react-native'
import { useColorScheme } from '~/lib/useColorScheme'
import { calculateBirthday } from '~/components/calculateTimeLeft'
import TelegramIcon from '~/components/icons/TelegramIcon'
import DiscordIcon from '~/components/icons/DiscordIcon'
import XIcon from '~/components/icons/XIcon'
import TwitchIcon from '~/components/icons/TwitchIcon'
import FuraffinityIcon from '~/components/icons/FuraffinityIcon'
import { toast } from '~/lib/toast'
import * as WebBrowser from 'expo-web-browser'
import * as Sentry from '@sentry/react-native'
import * as Clipboard from 'expo-clipboard'
import { useUser } from '~/components/contexts/UserContext'
import { ExecutionMethod } from 'react-native-appwrite'
import sanitizeHtml from 'sanitize-html'
import HTMLView from 'react-native-htmlview'
import { Badge } from '~/components/ui/badge'
import { Skeleton } from '~/components/ui/skeleton'
import UserActions from '~/components/user/UserActions'
import { Drawer } from '~/components/Drawer'

export default function UserPage() {
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? 'white' : 'black'

  const local = useLocalSearchParams()
  const [userData, setUserData] = useState<UserData.UserDataDocumentsType>(null)
  const [userPrefs, setUserPrefs] =
    useState<UserData.UserPrefsDocumentsType>(null)
  const [isFollowing, setIsFollowing] = useState<boolean>(false)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const { current } = useUser()

  const fetchUser = async () => {
    try {
      setRefreshing(true)
      const [dataUser, dataPrefs] = await Promise.all([
        functions.createExecution(
          'user-endpoints',
          '',
          false,
          `/user?userId=${local?.userId}`,
          ExecutionMethod.GET
        ),
        functions.createExecution(
          'user-endpoints',
          '',
          false,
          `/user/prefs?userId=${local?.userId}`,
          ExecutionMethod.GET
        ),
      ])
      setUserData(JSON.parse(dataUser.responseBody))
      setUserPrefs(JSON.parse(dataPrefs.responseBody))
      setRefreshing(false)
    } catch (error) {
      Sentry.captureException(error)
    } finally {
    }
  }

  const getUserAvatar = useCallback((avatarId: string) => {
    if (!avatarId) return null
    return `https://api.headpat.place/v1/storage/buckets/avatars/files/${avatarId}/view?project=hp-main`
  }, [])

  const getUserBanner = useCallback((bannerId: string) => {
    if (!bannerId) return null
    return `https://api.headpat.place/v1/storage/buckets/banners/files/${bannerId}/preview?project=hp-main&width=1200&height=250&output=webp`
  }, [])

  const onRefresh = () => {
    setRefreshing(true)
    fetchUser().then()
    setRefreshing(false)
  }

  useEffect(() => {
    fetchUser().then()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local.userId])

  if (refreshing || !userData)
    return (
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={{ padding: 16, gap: 16 }}>
          {/* Banner Skeleton */}
          <Skeleton className={'w-full h-24'} />

          {/* Avatar and Details Skeleton */}
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <Skeleton className={'w-24 h-24 rounded-[48px]'} />
            <View style={{ flex: 1, gap: 8 }}>
              <Skeleton className={'w-[50%] h-6'} />
              <Skeleton className={'w-[75%] h-4'} />
              <Skeleton className={'w-[33%] h-4'} />
            </View>
          </View>

          {/* Extra Info Skeleton */}
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

          {/* Bio Section Skeleton */}
          <View style={{ gap: 8 }}>
            <Skeleton className={'w-full h-4'} />
            <Skeleton className={'w-full h-4'} />
            <Skeleton className={'w-[83%] h-4'} />
          </View>

          {/* Social Links Skeleton */}
          <View style={{ gap: 16 }}>
            <Skeleton className={'w-full h-6'} />
            <Skeleton className={'w-full h-6'} />
            <Skeleton className={'w-full h-6'} />
          </View>
        </View>
      </ScrollView>
    )

  const sanitizedBio = sanitizeHtml(userData.bio)

  return (
    <>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {userPrefs?.isBlocked && (
          <Badge variant={'destructive'}>
            <Text>User is blocked</Text>
          </Badge>
        )}
        {/* Banner section */}
        {userData?.profileBannerId && (
          <View className={'flex-1 justify-center items-center'}>
            <Image
              source={getUserBanner(userData?.profileBannerId)}
              alt={`${userData?.displayName}'s banner`}
              style={{ width: '100%', height: 100 }}
              contentFit={'contain'}
            />
          </View>
        )}
        {/* Avatar section */}
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
            <Text className={'mb-4 flex-row flex-wrap'}>
              {userData?.status}
            </Text>
            <View className={'flex-row gap-2'}>
              <Suspense>
                <UserActions
                  userData={userData}
                  userPrefs={userPrefs}
                  setUserPrefs={setUserPrefs}
                  isFollowing={isFollowing}
                  setIsFollowing={setIsFollowing}
                  current={current}
                />
              </Suspense>
            </View>
          </View>
        </View>
        {/* Extra info section */}
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1 }}>
            <View className={'mx-10 my-4 flex-row justify-between gap-4'}>
              <View>
                <Muted className={'mb-2'}>
                  {!userData?.location ? null : (
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <MapPinIcon
                        size={12}
                        title={'Location'}
                        color={theme}
                        style={{
                          marginRight: 4,
                        }}
                      />
                      <Muted>{userData?.location}</Muted>
                    </View>
                  )}
                </Muted>
                <Muted className={'mb-2'}>
                  {/* If birthday includes 1900-01-01 then don't show */}
                  {userData?.birthday.includes('1900-01-01') ? null : (
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <CakeIcon
                        size={12}
                        color={theme}
                        style={{
                          marginRight: 4,
                        }}
                      />
                      <Muted>
                        {calculateBirthday(new Date(userData?.birthday))}
                      </Muted>
                    </View>
                  )}
                </Muted>
                <Muted className={'mb-2'}>
                  {!userData?.pronouns ? null : (
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <TagIcon
                        size={12}
                        color={theme}
                        title={'Pronouns'}
                        style={{
                          marginRight: 4,
                        }}
                      />
                      <Muted>{userData?.pronouns}</Muted>
                    </View>
                  )}
                </Muted>
                <Muted className={'text-center mb-2'}>{/* For later */}</Muted>
              </View>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <View className={'mx-10 my-4 flex-row justify-between gap-4'}>
              <View>
                <Muted style={{ marginBottom: 8 }}>
                  <Link href={`/user/${userData?.$id}/relationships/followers`}>
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
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
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
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

        {/* Bio section */}
        <View className={'mx-10 mb-4'}>
          <HTMLView
            value={sanitizedBio}
            stylesheet={{
              p: {
                color: theme,
              },
              a: {
                color: 'blue',
              },
            }}
            textComponentProps={{
              style: {
                color: theme,
              },
            }}
          />
        </View>

        {/* Social section */}
        <View className={'mx-10 my-4 gap-4'}>
          {!userData?.telegramname ? null : (
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
                style={{
                  marginRight: 4,
                }}
              />
              <Text>{userData?.telegramname}</Text>
            </TouchableOpacity>
          )}

          {!userData?.discordname ? null : (
            <TouchableOpacity
              className={'flex-row items-center gap-4'}
              onPress={() => {
                Clipboard.setStringAsync(userData?.discordname).then()
                toast('Copied name!')
              }}
            >
              <DiscordIcon
                size={32}
                color={theme}
                title={'Discord'}
                style={{
                  marginRight: 4,
                }}
              />
              <Text>{userData?.discordname}</Text>
            </TouchableOpacity>
          )}

          {!userData?.X_name ? null : (
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
                style={{
                  marginRight: 4,
                }}
              />
              <Text>{userData?.X_name}</Text>
            </TouchableOpacity>
          )}

          {!userData?.twitchname ? null : (
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
                style={{
                  marginRight: 4,
                }}
              />
              <Text>{userData?.twitchname}</Text>
            </TouchableOpacity>
          )}

          {!userData?.furaffinityname ? null : (
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
                style={{
                  marginRight: 4,
                }}
              />
              <Text>{userData?.furaffinityname}</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </>
  )
}
