import { useFocusEffect } from '@react-navigation/core'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { BackgroundTaskStatus } from 'expo-background-task'
import { router } from 'expo-router'
import { useTranslations } from 'gt-react-native'
import { ArrowDownIcon, NavigationIcon, NavigationOffIcon, PlusIcon } from 'lucide-react-native'
import React from 'react'
import { FlatList, View } from 'react-native'
import { Query } from 'react-native-appwrite'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'
import { useLocation } from '~/components/contexts/SharingContext'
import LocationSharedItem from '~/components/FlatlistItems/LocationSharedItem'
import { Button } from '~/components/ui/button'
import { Skeleton } from '~/components/ui/skeleton'
import { Text } from '~/components/ui/text'
import { H1, H3, Muted } from '~/components/ui/typography'
import { databases } from '~/lib/appwrite-client'
import type { CommunityDocumentsType } from '~/lib/types/collections'
import { useColorScheme } from '~/lib/useColorScheme'

export default function ShareLocationView() {
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? 'white' : 'black'
  const [refreshing, setRefreshing] = React.useState(false)
  const { showAlert } = useAlertModal()
  const queryClient = useQueryClient()
  const t = useTranslations()
  const { status, isRegistered, checkStatus, registerBackgroundFetch, unregisterBackgroundFetch } =
    useLocation()

  const { data: sharedItems, isLoading } = useQuery({
    queryKey: ['location-permissions'],
    queryFn: async () => {
      const result = await databases.listRows({
        databaseId: 'hp_db',
        tableId: 'locations-permissions',
        queries: [
          Query.limit(1000),
          Query.select(['$id', 'isCommunity', 'requesterId', 'timeUntil']),
        ],
      })

      const items = await Promise.all(
        result.rows.map(async (item: any) => {
          if (item.isCommunity) {
            const communityData = await queryClient.fetchQuery({
              queryKey: ['community', item.requesterId],
              queryFn: async () => {
                const response = await databases.getRow({
                  databaseId: 'hp_db',
                  tableId: 'community',
                  rowId: item.requesterId,
                })
                return response as unknown as CommunityDocumentsType
              },
              staleTime: 1000 * 60 * 5, // 5 minutes
            })

            return {
              ...communityData,
              documentId: item.$id,
              timeUntil: item.timeUntil,
              isCommunity: true,
            }
          } else {
            const userData = await queryClient.fetchQuery({
              queryKey: ['user', item.requesterId],
              queryFn: async () => {
                const response = await databases.getRow({
                  databaseId: 'hp_db',
                  tableId: 'userdata',
                  rowId: item.requesterId,
                })
                return response
              },
              staleTime: 1000 * 60 * 5, // 5 minutes
            })

            return {
              ...userData,
              documentId: item.$id,
              timeUntil: item.timeUntil,
              isCommunity: false,
            }
          }
        }),
      )

      // Sort items by timeUntil
      return items.sort(
        (a, b) =>
          new Date(a.timeUntil as string | number | Date).getTime() -
          new Date(b.timeUntil as string | number | Date).getTime(),
      )
    },
  })

  useFocusEffect(
    React.useCallback(() => {
      const initializeStatus = async () => {
        await checkStatus()
        void queryClient.invalidateQueries({
          queryKey: ['location-permissions'],
        })
      }
      void initializeStatus().then()
    }, [checkStatus, queryClient]),
  )

  const handleRemoveItem = (documentId: string) => {
    queryClient.setQueryData(['location-permissions'], (old: any[]) =>
      old.filter((user) => user.documentId !== documentId),
    )
  }

  const renderConversationItem = ({ item }: { item: any }) => (
    <LocationSharedItem
      documentId={item.documentId}
      timeUntil={item.timeUntil}
      item={item}
      onRemove={handleRemoveItem}
    />
  )

  const sharingButtonHandle = () => {
    if (status === BackgroundTaskStatus.Available) {
      if (isRegistered) {
        void unregisterBackgroundFetch().then()
      } else {
        void registerBackgroundFetch().then()
      }
    } else {
      showAlert('FAILED', 'Location sharing is not available')
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    void queryClient.invalidateQueries({ queryKey: ['location-permissions'] })
    setRefreshing(false)
  }

  return (
    <>
      {isLoading && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {Array.from({ length: 8 }).map((_, index) => (
            <View
              className={'m-4 flex w-full flex-row items-center px-4'}
              key={`skeleton-${index.toString()}`}
            >
              <Skeleton className="h-[100px] w-[100px] rounded-3xl" />
              <View className={'ml-6 flex flex-col gap-3'}>
                <Skeleton className="h-[20px] w-[150px] rounded" />
                <Skeleton className="h-[20px] w-[100px] rounded" />
                <View className={'flex flex-row items-center gap-4'}>
                  <View className={'flex flex-row items-center gap-2'}>
                    <Skeleton className="h-[20px] w-[20px] rounded-full" />
                    <Skeleton className="h-[20px] w-[50px] rounded" />
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
      {!isRegistered ? (
        <View className={'flex-1 items-center justify-center'}>
          <H1 className={'text-center'}>{t('location.share.title')}</H1>
          <Muted>BETA</Muted>
          <View className={'m-3 flex items-center gap-4'}>
            <Muted>
              {status === BackgroundTaskStatus.Available
                ? t('location.share.sharing.enabled')
                : t('location.share.sharing.disabled')}
            </Muted>
            <Muted>{t('location.share.description')}</Muted>
          </View>
        </View>
      ) : !isLoading && sharedItems?.length === 0 ? (
        <View className={'flex-1 items-center justify-center'}>
          <H3>{t('location.share.nobody.title')}</H3>
          <View className={'m-3 flex items-center gap-4'}>
            <Muted>{t('location.share.nobody.description')}</Muted>
          </View>
          <View
            className={
              'absolute bottom-16 right-6 mb-4 h-12 w-12 flex-row items-center justify-center gap-2 self-end rounded'
            }
          >
            <ArrowDownIcon color={theme} size={32} />
          </View>
        </View>
      ) : (
        <FlatList
          data={sharedItems}
          keyExtractor={(item) => item.documentId}
          renderItem={renderConversationItem}
          onRefresh={onRefresh}
          refreshing={refreshing}
          contentContainerStyle={{ paddingBottom: 100 }} // Add padding to the bottom
        />
      )}
      <Button
        className={
          'absolute bottom-4 mb-4 h-12 w-64 flex-row items-center justify-center gap-2 self-center rounded border border-border bg-card'
        }
        onPress={sharingButtonHandle}
      >
        {status === BackgroundTaskStatus.Available ? (
          <NavigationIcon className={'h-4 w-4'} color={theme} size={16} />
        ) : (
          <NavigationOffIcon className={'h-4 w-4'} color={theme} size={16} />
        )}
        <Text className={'items-center text-center font-bold text-foreground'}>
          {status === BackgroundTaskStatus.Available
            ? isRegistered
              ? t('location.share.button.stop')
              : t('location.share.button.start')
            : t('location.share.button.unavailable')}
        </Text>
      </Button>

      {isRegistered && (
        <Button
          className={
            'absolute bottom-4 right-6 mb-4 h-12 w-12 flex-row items-center justify-center gap-2 self-end rounded border border-border bg-card'
          }
          onPress={() =>
            router.push({
              pathname: '/locations/addSharing',
            })
          }
        >
          <PlusIcon color={theme} size={16} />
        </Button>
      )}
    </>
  )
}
