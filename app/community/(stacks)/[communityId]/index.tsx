import { RefreshControl, ScrollView, View, Dimensions } from "react-native"
import { H1, H3, Muted } from "~/components/ui/typography"
import { Link, useLocalSearchParams } from "expo-router"
import React, { Suspense, useCallback } from "react"
import { CommunityDocumentsType } from "~/lib/types/collections"
import { functions } from "~/lib/appwrite-client"
import { Image } from "expo-image"
import { Text } from "~/components/ui/text"
import { EyeIcon } from "lucide-react-native"
import { useColorScheme } from "~/lib/useColorScheme"
import { captureException } from "@sentry/react-native"
import { useUser } from "~/components/contexts/UserContext"
import { ExecutionMethod } from "react-native-appwrite"
import sanitizeHtml from "sanitize-html"
import HTMLView from "react-native-htmlview"
import { Badge } from "~/components/ui/badge"
import { Skeleton } from "~/components/ui/skeleton"
import { hasAdminPanelAccess } from "~/components/community/hasPermission"
import CommunityActions from "~/components/community/CommunityActions"
import { useQuery } from "@tanstack/react-query"

export default function UserPage() {
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? "white" : "black"
  const local = useLocalSearchParams()
  const { current } = useUser()

  const {
    data: communityData,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["community", local.communityId],
    queryFn: async () => {
      try {
        const data = await functions.createExecution({
          functionId: "community-endpoints",
          async: false,
          xpath: `/community?communityId=${local.communityId as string}`,
          method: ExecutionMethod.GET,
        })
        const dataCommunityJson = JSON.parse(data.responseBody)
        console.log(dataCommunityJson)
        return dataCommunityJson as CommunityDocumentsType
      } catch (error) {
        captureException(error)
        throw error
      }
    },
    //staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnMount: true,
  })

  const { data: permissions } = useQuery({
    queryKey: ["community-permissions", communityData?.roles],
    queryFn: () => {
      if (!communityData?.roles) {
        return false
      }
      const hasAccess = hasAdminPanelAccess(communityData.roles)
      return hasAccess
    },
    enabled: !!communityData?.roles,
  })

  const getAvatar = useCallback((avatarId: string) => {
    return avatarId
      ? `${process.env.EXPO_PUBLIC_BACKEND_URL}/v1/storage/buckets/community-avatars/files/${avatarId}/view?project=hp-main`
      : null
  }, [])

  const getBanner = useCallback((bannerId: string) => {
    return bannerId
      ? `${process.env.EXPO_PUBLIC_BACKEND_URL}/v1/storage/buckets/community-banners/files/${bannerId}/preview?project=hp-main&width=1200&height=250&output=webp`
      : null
  }, [])

  if (isLoading)
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

  if (!communityData)
    return (
      <ScrollView
        contentContainerClassName={"flex-1 justify-center items-center h-full"}
      >
        <View className={"native:pb-24 max-w-md gap-6 p-4"}>
          <View className={"gap-1"}>
            <H1 className={"text-center text-foreground"}>Community</H1>
            <Muted className={"text-center text-base"}>
              This community does not exist.
            </Muted>
          </View>
        </View>
      </ScrollView>
    )

  const sanitizedBio = sanitizeHtml(communityData.description)
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
      {communityData.prefs && communityData.prefs.isBlocked && (
        <Badge variant={"destructive"}>
          <Text>Community is blocked</Text>
        </Badge>
      )}
      {communityData.bannerId && (
        <View className={"flex-1 items-center justify-center"}>
          <Image
            source={getBanner(communityData.bannerId)}
            alt={`${communityData.name}'s banner`}
            style={{ width: "100%", height: bannerHeight }}
            contentFit={"contain"}
          />
        </View>
      )}
      <View className={"mx-6 my-4 flex-row items-center gap-4"}>
        <Image
          source={
            getAvatar(communityData.avatarId) ??
            require("~/assets/pfp-placeholder.png")
          }
          alt={`${communityData.name}'s avatar`}
          style={{ width: 100, height: 100, borderRadius: 50 }}
          contentFit={"cover"}
        />
        <View>
          <View className={"flex-row flex-wrap"}>
            <H3>{communityData.name}</H3>
          </View>
          <Text className={"mb-4 flex-row flex-wrap"}>
            {communityData.status}
          </Text>
          <View className={"flex-row gap-2"}>
            <Suspense>
              <CommunityActions
                data={communityData}
                hasPermissions={permissions ?? false}
                current={current}
              />
            </Suspense>
          </View>
        </View>
      </View>
      <View style={{ flexDirection: "row" }}>
        <View style={{ flex: 1 }}>
          <View className={"mx-10 my-4 flex-row justify-between gap-4"}>
            <View>
              <Muted style={{ marginBottom: 8 }}>
                <Link
                  href={`/community/${communityData.$id}/relationships/followers`}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <EyeIcon
                      size={12}
                      title={"Location"}
                      color={theme}
                      style={{ marginRight: 4 }}
                    />
                    <Muted>{communityData.followersCount} Followers</Muted>
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
    </ScrollView>
  )
}
