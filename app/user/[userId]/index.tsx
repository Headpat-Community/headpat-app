import {
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native'
import { H1, H3, Muted } from '~/components/ui/typography'
import { useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { UserData } from '~/lib/types/collections'
import { database } from '~/lib/appwrite-client'
import { Image } from 'expo-image'
import { Text } from '~/components/ui/text'
import { Button } from '~/components/ui/button'
import { CakeIcon, MapPinIcon, TagIcon } from 'lucide-react-native'
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

export default function UserPage() {
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? 'white' : 'black'
  const local = useLocalSearchParams()
  const [userData, setUserData] = useState<UserData.UserDataDocumentsType>(null)
  const [refreshing, setRefreshing] = useState<boolean>(false)

  const fetchUser = async () => {
    try {
      setRefreshing(true)
      const data: UserData.UserDataDocumentsType = await database.getDocument(
        'hp_db',
        'userdata',
        `${local.userId}`
      )

      setUserData(data)
      setRefreshing(false)
    } catch (error) {
      setRefreshing(false)
      Sentry.captureException(error)
    }
  }

  const getUserAvatar = (avatarId: string) => {
    if (!avatarId) return
    return `https://api.headpat.de/v1/storage/buckets/avatars/files/${avatarId}/view?project=6557c1a8b6c2739b3ecf`
  }

  const getUserBanner = (bannerId: string) => {
    if (!bannerId) return
    return `https://api.headpat.de/v1/storage/buckets/banners/files/${bannerId}/preview?project=6557c1a8b6c2739b3ecf&width=1280&height=720`
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchUser().then()
    setRefreshing(false)
  }

  useEffect(() => {
    fetchUser().then()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local.userId])

  if (refreshing)
    return (
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className={'flex-1 justify-center items-center h-full'}>
          <View className={'p-4 native:pb-24 max-w-md gap-6'}>
            <View className={'gap-1'}>
              <H1 className={'text-foreground text-center'}>Loading...</H1>
              <Muted className={'text-base text-center'}>
                Please wait while we load the user's data.
              </Muted>
            </View>
          </View>
        </View>
      </ScrollView>
    )

  if (!userData)
    return (
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className={'flex-1 justify-center items-center h-full'}>
          <View className={'p-4 native:pb-24 max-w-md gap-6'}>
            <View className={'gap-1'}>
              <H1 className={'text-foreground text-center'}>User Not Found</H1>
              <Muted className={'text-base text-center'}>
                It seems like the user does not exist. Hurry up and create one!
              </Muted>
            </View>
          </View>
        </View>
      </ScrollView>
    )

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Banner section */}
      {!userData?.profileBannerId ? null : (
        <View className={'flex-1 justify-center items-center'}>
          <Image
            source={
              getUserBanner(userData?.profileBannerId) ||
              require('~/assets/pfp-placeholder.png')
            }
            alt={`${userData?.displayName}'s banner`}
            style={{ width: '100%', height: 100 }}
            contentFit={'cover'}
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
          <Text className={'mb-4 flex-row flex-wrap'}>{userData?.status}</Text>
          <View className={'flex-row gap-2'}>
            <Button
              className={'text-center w-28'}
              onPress={() => toast('Ha! You thought this was a real button!')}
            >
              <Text>Follow</Text>
            </Button>
            <Button
              className={'text-center w-28'}
              onPress={() => toast('Ha! You thought this was a real button!')}
            >
              <Text>Message</Text>
            </Button>
          </View>
        </View>
      </View>
      {/* Extra info section */}
      <View
        className={'mx-10 my-4 flex-row justify-between items-center gap-4'}
      >
        <View>
          <Muted className={'text-center mb-2'}>
            {!userData?.location ? null : (
              <>
                <MapPinIcon
                  size={12}
                  title={'Location'}
                  color={theme}
                  style={{
                    marginRight: 4,
                  }}
                />
                {userData?.location}
              </>
            )}
          </Muted>
          <Muted className={'text-center mb-2'}>
            {/* If birthday includes 1900-01-01 then don't show */}
            {userData?.birthday.includes('1900-01-01') ? null : (
              <>
                <CakeIcon
                  size={12}
                  color={theme}
                  style={{
                    marginRight: 4,
                  }}
                />
                {calculateBirthday(new Date(userData?.birthday))}
              </>
            )}
          </Muted>
        </View>
        <View>
          <Muted className={'text-center mb-2'}>
            {!userData?.pronouns ? null : (
              <>
                <TagIcon
                  size={12}
                  color={theme}
                  title={'Pronouns'}
                  style={{
                    marginRight: 4,
                  }}
                />
                {userData?.pronouns}
              </>
            )}
          </Muted>
          <Muted className={'text-center mb-2'}>{/* For later */}</Muted>
        </View>
      </View>

      {/* Bio section */}
      <View className={'mx-10 mb-4'}>
        <Text>{userData?.bio}</Text>
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
  )
}
