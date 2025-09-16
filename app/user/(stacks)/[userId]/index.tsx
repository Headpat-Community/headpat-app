import * as Sentry from "@sentry/react-native"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import * as Clipboard from "expo-clipboard"
import { Image } from "expo-image"
import { Link, useLocalSearchParams } from "expo-router"
import * as WebBrowser from "expo-web-browser"
import {
  CakeIcon,
  EyeIcon,
  MapPinIcon,
  ScanEyeIcon,
  TagIcon,
} from "lucide-react-native"
import React, { Suspense } from "react"
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native"
import { Query } from "react-native-appwrite"
import HTMLView from "react-native-htmlview"
import sanitizeHtml from "sanitize-html"
import { calculateBirthday } from "~/components/calculateTimeLeft"
import { useAlertModal } from "~/components/contexts/AlertModalProvider"
import { useUser } from "~/components/contexts/UserContext"
import BlueskyIcon from "~/components/icons/BlueskyIcon"
import DiscordIcon from "~/components/icons/DiscordIcon"
import FuraffinityIcon from "~/components/icons/FuraffinityIcon"
import TelegramIcon from "~/components/icons/TelegramIcon"
import TwitchIcon from "~/components/icons/TwitchIcon"
import XIcon from "~/components/icons/XIcon"
import { Badge } from "~/components/ui/badge"
import { Skeleton } from "~/components/ui/skeleton"
import { Text } from "~/components/ui/text"
import { H3, Muted } from "~/components/ui/typography"
import UserActions from "~/components/user/UserActions"
import { databases } from "~/lib/appwrite-client"
import {
  UserPrefsDocumentsType,
  UserProfileDocumentsType,
} from "~/lib/types/collections"
import { useColorScheme } from "~/lib/useColorScheme"

export default function UserPage() {
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? "white" : "black"
  const local = useLocalSearchParams()
  const { current } = useUser()
  const { showAlert } = useAlertModal()
  const qc = useQueryClient()

  const {
    data: userData,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery<UserProfileDocumentsType>({
    queryKey: ["user", local.userId],
    queryFn: async () => {
      try {
        const [userData, followers, following, isFollowing] = await Promise.all(
          [
            // Get user data
            databases.getRow<UserProfileDocumentsType>({
              databaseId: "hp_db",
              tableId: "userdata",
              rowId: local.userId as string,
            }),
            // Get followers
            databases.listRows({
              databaseId: "hp_db",
              tableId: "followers",
              queries: [
                Query.equal("followerId", local.userId),
                Query.limit(1),
              ],
            }),
            // Get following
            databases.listRows({
              databaseId: "hp_db",
              tableId: "followers",
              queries: [Query.equal("userId", local.userId), Query.limit(1)],
            }),
            current?.$id
              ? databases.listRows({
                  databaseId: "hp_db",
                  tableId: "followers",
                  queries: [
                    Query.and([
                      Query.equal("userId", local.userId as string),
                      Query.equal("followerId", current.$id),
                    ]),
                  ],
                })
              : { total: 0 },
          ]
        )

        // Combine the data
        const combinedData: UserProfileDocumentsType = {
          ...userData,
          isFollowing: isFollowing.total > 0,
          followersCount: followers.total,
          followingCount: following.total,
        }

        if (!current) {
          // Merge any local override for blocking (set while signed out)
          try {
            const userIdStr =
              typeof local.userId === "string"
                ? local.userId
                : Array.isArray(local.userId)
                  ? local.userId[0]
                  : ""
            const localPrefs = qc.getQueryData<{ isBlocked?: boolean }>([
              "user",
              userIdStr,
              "localPrefs",
            ])
            if (localPrefs?.isBlocked !== undefined) {
              combinedData.prefs = {
                ...(combinedData.prefs ?? {}),
                isBlocked: localPrefs.isBlocked,
              } as unknown as UserPrefsDocumentsType
            }
          } catch (_e) {
            // ignore errors
          }
        }

        return combinedData
      } catch (error) {
        console.error("Error fetching user data:", error)
        Sentry.captureException(error)
        throw error
      }
    },
    enabled: !!local.userId,
    // For social media, we want to keep data fresh
    staleTime: 300 * 1000, // Consider data stale after 5 minutes
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnReconnect: true, // Refetch when network reconnects
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
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => void refetch()}
          />
        }
      >
        <View style={{ padding: 16, gap: 16 }}>
          <Skeleton className={"h-24 w-full"} />
          <View style={{ flexDirection: "row", gap: 16 }}>
            <Skeleton className={"h-24 w-24 rounded-[48px]"} />
            <View style={{ flex: 1, gap: 8 }}>
              <Skeleton className={"h-6 w-[50%]"} />
              <Skeleton className={"h-4 w-[75%]"} />
              <Skeleton className={"h-4 w-[33%]"} />
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 16 }}>
            <View style={{ flex: 1, gap: 8 }}>
              <Skeleton className={"h-4 w-full"} />
              <Skeleton className={"h-4 w-[75%]"} />
            </View>
            <View style={{ flex: 1, gap: 8 }}>
              <Skeleton className={"h-4 w-full"} />
              <Skeleton className={"h-4 w-[75%]"} />
            </View>
          </View>
          <View style={{ gap: 8 }}>
            <Skeleton className={"h-4 w-full"} />
            <Skeleton className={"h-4 w-full"} />
            <Skeleton className={"h-4 w-[83%]"} />
          </View>
          <View style={{ gap: 16 }}>
            <Skeleton className={"h-6 w-full"} />
            <Skeleton className={"h-6 w-full"} />
            <Skeleton className={"h-6 w-full"} />
          </View>
        </View>
      </ScrollView>
    )

  const sanitizedBio = sanitizeHtml(userData.bio ?? "")
  const { width } = Dimensions.get("window")
  const bannerHeight = width > 600 ? 250 : 100

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
        />
      }
    >
      {userData.prefs?.isBlocked && (
        <Badge variant={"destructive"}>
          <Text>User is blocked</Text>
        </Badge>
      )}
      {userData.profileBannerId && (
        <View className={""}>
          <Image
            source={getUserBanner(userData.profileBannerId)}
            alt={`${userData.displayName || userData.profileUrl}'s banner`}
            style={{ width: "100%", height: bannerHeight }}
            contentFit={"contain"}
          />
        </View>
      )}
      <View className={"mx-6 my-4 flex-row items-center gap-4"}>
        <Image
          source={
            getUserAvatar(userData.avatarId ?? "") ??
            require("~/assets/pfp-placeholder.png")
          }
          alt={`${userData.displayName}'s avatar`}
          style={{ width: 100, height: 100, borderRadius: 50 }}
          contentFit={"cover"}
        />
        <View>
          <View className={"flex-row flex-wrap"}>
            <H3>{userData.displayName}</H3>
          </View>
          <Text className={"mb-4 flex-row flex-wrap"}>{userData.status}</Text>
          <View className={"flex-row gap-2"}>
            <Suspense>
              <UserActions userData={userData} current={current} />
            </Suspense>
          </View>
        </View>
      </View>
      <View style={{ flexDirection: "row" }}>
        <View style={{ flex: 1 }}>
          <View className={"mx-10 my-4 flex-row justify-between gap-4"}>
            <View>
              {userData.location && (
                <Muted className={"mb-2"}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <MapPinIcon
                      size={12}
                      title={"Location"}
                      color={theme}
                      style={{ marginRight: 4 }}
                    />
                    <Muted>{userData.location}</Muted>
                  </View>
                </Muted>
              )}
              {!userData.birthday?.includes("1900-01-01") && (
                <Muted className={"mb-2"}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <CakeIcon
                      size={12}
                      color={theme}
                      style={{ marginRight: 4 }}
                    />
                    <Muted>
                      {calculateBirthday(new Date(userData.birthday ?? ""))}
                    </Muted>
                  </View>
                </Muted>
              )}
              {userData.pronouns && (
                <Muted className={"mb-2"}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TagIcon
                      size={12}
                      color={theme}
                      title={"Pronouns"}
                      style={{ marginRight: 4 }}
                    />
                    <Muted>{userData.pronouns}</Muted>
                  </View>
                </Muted>
              )}
            </View>
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <View className={"mx-10 my-4 flex-row justify-between gap-4"}>
            <View>
              <Muted style={{ marginBottom: 8 }}>
                <Link href={`/user/${userData.$id}/relationships/followers`}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <EyeIcon
                      size={12}
                      title={"Location"}
                      color={theme}
                      style={{ marginRight: 4 }}
                    />
                    <Muted>{userData.followersCount} Followers</Muted>
                  </View>
                </Link>
              </Muted>
              <Muted style={{ marginBottom: 8 }}>
                <Link href={`/user/${userData.$id}/relationships/following`}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <ScanEyeIcon
                      size={12}
                      color={theme}
                      style={{ marginRight: 4 }}
                    />
                    <Muted>{userData.followingCount} Following</Muted>
                  </View>
                </Link>
              </Muted>
            </View>
          </View>
        </View>
      </View>
      <View className={"mx-10 mb-4"}>
        <HTMLView
          value={sanitizedBio}
          stylesheet={{
            p: { color: theme },
            a: { color: "hsl(208, 100%, 50%)" },
          }}
          textComponentProps={{ style: { color: theme } }}
        />
      </View>
      <View className={"mx-10 my-4 gap-4"}>
        {[
          {
            key: "telegram",
            name: userData.telegramname,
            icon: TelegramIcon,
            title: "Telegram",
            action: (name: string) =>
              WebBrowser.openBrowserAsync(`https://t.me/${name}`),
          },
          {
            key: "discord",
            name: userData.discordname,
            icon: DiscordIcon,
            title: "Discord",
            action: (name: string) => {
              void Clipboard.setStringAsync(name)
              showAlert("INFO", "Copied name!")
            },
          },
          {
            key: "x",
            name: userData.X_name,
            icon: XIcon,
            title: "X",
            action: (name: string) =>
              WebBrowser.openBrowserAsync(`https://x.com/${name}`),
          },
          {
            key: "twitch",
            name: userData.twitchname,
            icon: TwitchIcon,
            title: "Twitch",
            action: (name: string) =>
              WebBrowser.openBrowserAsync(`https://twitch.tv/${name}`),
          },
          {
            key: "furaffinity",
            name: userData.furaffinityname,
            icon: FuraffinityIcon,
            title: "Furaffinity",
            action: (name: string) =>
              WebBrowser.openBrowserAsync(
                `https://furaffinity.net/user/${name}`
              ),
          },
          {
            key: "bluesky",
            name: userData.blueskyname,
            icon: BlueskyIcon,
            title: "Bluesky",
            action: (name: string) =>
              WebBrowser.openBrowserAsync(`https://bsky.app/profile/${name}`),
          },
        ]
          .filter((social) => social.name)
          .map((social) => {
            const IconComponent = social.icon
            return (
              <TouchableOpacity
                key={social.key}
                className={"flex-row items-center gap-4"}
                onPress={() => social.action(social.name ?? "")}
              >
                <IconComponent
                  size={32}
                  color={theme}
                  title={social.title}
                  style={{ marginRight: 4 }}
                />
                <Text>{social.name}</Text>
              </TouchableOpacity>
            )
          })}
      </View>
    </ScrollView>
  )
}
