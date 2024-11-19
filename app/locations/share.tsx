import React from 'react'
import { FlatList, View } from 'react-native'
import { Text } from '~/components/ui/text'
import { H1, H3, Muted } from '~/components/ui/typography'
import { Button } from '~/components/ui/button'
import { useLocation } from '~/components/contexts/SharingContext'
import { useFocusEffect } from '@react-navigation/core'
import {
  ArrowDownIcon,
  NavigationIcon,
  NavigationOffIcon,
  PlusIcon,
} from 'lucide-react-native'
import { useColorScheme } from '~/lib/useColorScheme'
import { databases } from '~/lib/appwrite-client'
import { Query } from 'react-native-appwrite'
import LocationSharedItem from '~/components/FlatlistItems/LocationSharedItem'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'
import { router } from 'expo-router'
import { i18n } from '~/components/system/i18n'
import { useDataCache } from '~/components/contexts/DataCacheContext'
import { Skeleton } from '~/components/ui/skeleton'
import { Community } from '~/lib/types/collections'

export default function ShareLocationView() {
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? 'white' : 'black'
  const [refreshing, setRefreshing] = React.useState(false)
  const [sharedItems, setSharedItems] = React.useState([])
  const { showAlertModal } = useAlertModal()
  const { getCache, saveCache } = useDataCache()
  const {
    status,
    isRegistered,
    checkStatus,
    registerBackgroundFetch,
    unregisterBackgroundFetch,
  } = useLocation()

  useFocusEffect(
    React.useCallback(() => {
      checkStatus().then()
      fetchShared().then()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  )

  const fetchShared = React.useCallback(async () => {
    // Clear existing state before fetching new data
    setSharedItems([])

    const result = await databases.listDocuments(
      'hp_db',
      'locations-permissions',
      [
        Query.limit(1000),
        Query.select(['$id', 'isCommunity', 'requesterId', 'timeUntil']),
      ]
    )

    const items = []

    for (const item of result.documents) {
      if (item.isCommunity) {
        let cache: any = await getCache('communities', item.requesterId)
        if (!cache) {
          const response: Community.CommunityDocumentsType =
            await databases.getDocument('hp_db', 'community', item.requesterId)
          saveCache('communities', item.requesterId, response)
          cache = response
        }
        const communityData = cache.data
        items.push({
          ...communityData,
          documentId: item.$id,
          timeUntil: item.timeUntil,
          isCommunity: true,
        })
      } else {
        let cache: any = await getCache('users', item.requesterId)
        if (!cache) {
          const response: any = await databases.getDocument(
            'hp_db',
            'user',
            item.requesterId
          )
          saveCache('users', item.requesterId, response)
          cache = response
        }
        const userDataResults = cache.data
        items.push({
          ...userDataResults,
          documentId: item.$id,
          timeUntil: item.timeUntil,
          isCommunity: false,
        })
      }
    }

    // Sort items by timeUntil
    items.sort(
      (a, b) =>
        new Date(a.timeUntil).getTime() - new Date(b.timeUntil).getTime()
    )

    // Update state with new data
    setSharedItems(items)
    setRefreshing(false)
  }, [getCache, saveCache])

  const handleRemoveItem = (documentId: string) => {
    setSharedItems((prevUsers) =>
      prevUsers.filter((user) => user.documentId !== documentId)
    )
  }

  const renderConversationItem = ({ item }) => (
    <LocationSharedItem
      documentId={item.documentId}
      timeUntil={item.timeUntil}
      item={item.data}
      onRemove={handleRemoveItem}
    />
  )

  const sharingButtonHandle = () => {
    if (status === 3) {
      if (isRegistered) {
        unregisterBackgroundFetch().then()
      } else {
        registerBackgroundFetch().then()
      }
    } else {
      showAlertModal('FAILED', 'Location sharing is not available')
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchShared().then()
  }

  return (
    <>
      {refreshing && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {Array.from({ length: 8 }).map((_, index) => (
            <View
              className={'px-4 m-4 w-full flex flex-row items-center'}
              key={index}
            >
              <Skeleton className="w-[100px] h-[100px] rounded-3xl" />
              <View className={'flex flex-col gap-3 ml-6'}>
                <Skeleton className="w-[150px] h-[20px] rounded" />
                <Skeleton className="w-[100px] h-[20px] rounded" />
                <View className={'flex flex-row items-center gap-4'}>
                  <View className={'flex flex-row items-center gap-2'}>
                    <Skeleton className="w-[20px] h-[20px] rounded-full" />
                    <Skeleton className="w-[50px] h-[20px] rounded" />
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
      {!isRegistered ? (
        <>
          <View className={'flex-1 justify-center items-center'}>
            <H1>{i18n.t('location.share.title')}</H1>
            <Muted>BETA</Muted>
            <View className={'m-3 gap-4 flex items-center'}>
              <Muted>
                {isRegistered
                  ? i18n.t('location.share.sharing.enabled')
                  : i18n.t('location.share.sharing.disabled')}
              </Muted>
              <Muted>{i18n.t('location.share.description')}</Muted>
            </View>
          </View>
        </>
      ) : !refreshing && sharedItems.length === 0 ? (
        <View className={'flex-1 justify-center items-center'}>
          <H3>{i18n.t('location.share.nobody.title')}</H3>
          <View className={'m-3 gap-4 flex items-center'}>
            <Muted>{i18n.t('location.share.nobody.description')}</Muted>
          </View>
          <View
            className={
              'absolute flex-row gap-2 bottom-16 mb-4 justify-center items-center h-12 w-12 right-6 self-end rounded'
            }
          >
            <ArrowDownIcon
              className={'animate-bounce'}
              color={theme}
              size={32}
            />
          </View>
        </View>
      ) : (
        <FlatList
          data={[...sharedItems]}
          keyExtractor={(item) => item.documentId}
          renderItem={renderConversationItem}
          onRefresh={onRefresh}
          refreshing={refreshing}
          contentContainerStyle={{ paddingBottom: 100 }} // Add padding to the bottom
        />
      )}
      <Button
        className={
          'absolute flex-row gap-2 bottom-4 mb-4 justify-center items-center h-12 w-64 bg-card self-center rounded border border-border'
        }
        onPress={sharingButtonHandle}
      >
        {status === 3 ? (
          <NavigationIcon className={'h-4 w-4'} color={theme} size={16} />
        ) : (
          <NavigationOffIcon className={'h-4 w-4'} color={theme} size={16} />
        )}
        <Text className={'text-center font-bold items-center text-foreground'}>
          {status === 3
            ? isRegistered
              ? i18n.t('location.share.button.stop')
              : i18n.t('location.share.button.start')
            : i18n.t('location.share.button.unavailable')}
        </Text>
      </Button>

      {isRegistered && (
        <Button
          className={
            'absolute flex-row gap-2 bottom-4 mb-4 justify-center items-center h-12 w-12 right-6 bg-card self-end rounded border border-border'
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