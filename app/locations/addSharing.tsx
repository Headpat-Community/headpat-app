import React from 'react'
import { databases } from '~/lib/appwrite-client'
import { ID, Query } from 'react-native-appwrite'
import { useDataCache } from '~/components/contexts/DataCacheContext'
import { useDebounce } from '~/lib/hooks/useDebounce'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'
import LocationSearchItem from '~/components/FlatlistItems/LocationSearchItem'
import { Input } from '~/components/ui/input'
import { FlatList, View } from 'react-native'
import { Text } from '~/components/ui/text'
import { useFocusEffect } from '@react-navigation/core'
import { i18n } from '~/components/system/i18n'
import { Button } from '~/components/ui/button'
import { router } from 'expo-router'
import { useUser } from '~/components/contexts/UserContext'
import { ArrowLeftIcon } from 'lucide-react-native'
import { useColorScheme } from '~/lib/useColorScheme'
import { H2, Muted } from '~/components/ui/typography'
import DatePicker from 'react-native-date-picker'
import * as Sentry from '@sentry/react-native'
import { Community } from '~/lib/types/collections'

export default function AddSharing() {
  const [page, setPage] = React.useState(0)
  const [searchResults, setSearchResults] = React.useState([])
  const [searchTerm, setSearchTerm] = React.useState('')
  const [selectedTime, setSelectedTime] = React.useState(new Date())
  const [selectedItems, setSelectedItems] = React.useState([])
  const { getCache, saveCache } = useDataCache()
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const { showAlertModal } = useAlertModal()
  const [isLoading, setIsLoading] = React.useState(false)
  const { current } = useUser()
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? 'white' : 'black'
  const [dateOpen, setDateOpen] = React.useState(false)
  const [timeOpen, setTimeOpen] = React.useState(false)

  React.useEffect(() => {
    const searchUsers = async () => {
      if (!debouncedSearchTerm) {
        setSearchResults([])
        return
      }

      setIsLoading(true)
      try {
        const alreadyShared = await databases.listDocuments(
          'hp_db',
          'locations-permissions',
          [Query.limit(1000)]
        )
        const alreadySharedUserIds = alreadyShared.documents
          .filter((item) => !item.isCommunity)
          .map((item) => item.requesterId)

        const alreadySharedCommunityIds = alreadyShared.documents
          .filter((item) => item.isCommunity)
          .map((item) => item.requesterId)

        const userQueries = [
          Query.contains('profileUrl', debouncedSearchTerm),
          Query.notEqual('$id', current.$id),
          ...alreadySharedUserIds.map((id) => Query.notEqual('$id', id)),
          Query.limit(10),
        ]

        const communityQueries = [
          Query.contains('name', debouncedSearchTerm),
          ...alreadySharedCommunityIds.map((id) => Query.notEqual('$id', id)),
          Query.limit(10),
        ]

        const [resultsUsers, resultsCommunity] = await Promise.all([
          databases.listDocuments('hp_db', 'userdata', userQueries),
          databases.listDocuments('hp_db', 'community', communityQueries),
        ])

        const [userDataResults, communityDataResults] = await Promise.all([
          Promise.all(
            resultsUsers.documents.map(async (user) => {
              let userData: any = await getCache('users', user.$id)
              userData = userData?.data
              if (!userData) {
                userData = await databases.getDocument(
                  'hp_db',
                  'userdata',
                  user.$id
                )
                saveCache('users', user.$id, userData)
              }
              return userData
            })
          ),
          Promise.all(
            resultsCommunity.documents.map(async (community) => {
              let communityData: any =
                await getCache<Community.CommunityDocumentsType>(
                  'communities',
                  community.$id
                )
              communityData = communityData?.data
              if (!communityData) {
                communityData = await databases.getDocument(
                  'hp_db',
                  'community',
                  community.$id
                )
                saveCache('communities', community.$id, communityData)
              }
              return communityData
            })
          ),
        ])

        setSearchResults([...userDataResults, ...communityDataResults])
      } catch (error) {
        console.error('Error searching users', error)
      } finally {
        setIsLoading(false)
      }
    }

    searchUsers().then()
  }, [current.$id, debouncedSearchTerm, getCache, saveCache])

  const handleSelectItem = (item: any) => {
    setSelectedItems((prevSelectedItems) => {
      const isCommunity = !!item?.name
      const itemId = item.$id

      if (
        prevSelectedItems.some((selectedItem) => selectedItem.id === itemId)
      ) {
        return prevSelectedItems.filter(
          (selectedItem) => selectedItem.id !== itemId
        )
      } else {
        return [...prevSelectedItems, { id: itemId, isCommunity }]
      }
    })
  }

  const handleBack = () => {
    setPage(0)
  }

  const handleNext = () => {
    if (selectedItems.length === 0) {
      showAlertModal('FAILED', 'Please select at least one user or community')
      return
    }
    setPage(1)
  }

  const handleConfirm = async () => {
    if (selectedItems.length === 0) {
      showAlertModal('FAILED', 'Please select at least one user or community')
      return
    }

    setPage(2)

    try {
      const result = await Promise.all(
        selectedItems.map((selectedItem) => {
          const documentData = {
            sharerUserId: current.$id,
            isCommunity: selectedItem.isCommunity,
            requesterId: selectedItem.id,
            timeUntil: selectedTime || new Date(),
          }
          return databases.createDocument(
            'hp_db',
            'locations-permissions',
            ID.unique(),
            documentData
          )
        })
      )

      if (result.length > 0) {
        router.push('locations/share')
      }
    } catch (error) {
      router.back()
      console.error('Error sharing location', error)
      showAlertModal('FAILED', 'Failed to share location')
      Sentry.captureException(error)
    }
  }

  const renderSearchItem = ({ item }) => (
    <LocationSearchItem
      item={item.data}
      isSelected={selectedItems.some(
        (selectedItem) => selectedItem.id === item.data.$id
      )}
      onSelectItem={() => handleSelectItem(item.data)}
    />
  )

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        setSearchTerm('')
        setSelectedItems([])
        setSelectedTime(null)
        setPage(0)
      }
    }, [])
  )

  return (
    <>
      {page === 0 && (
        <View>
          <>
            <Input
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder={i18n.t('location.add.search')}
              className={'rounded-none'}
            />
            {searchTerm && (
              <View className={'h-fit'}>
                {isLoading ? (
                  <View>
                    <Text>Loading...</Text>
                  </View>
                ) : (
                  <FlatList
                    data={searchResults}
                    keyExtractor={(item) => item.data.$id}
                    renderItem={renderSearchItem}
                    className={'mb-24'}
                  />
                )}
              </View>
            )}
          </>
        </View>
      )}

      {page === 1 && (
        <View className={'flex-1 justify-center items-center'}>
          <Text>
            Thanks! Please choose how long you want to share your location with
            them.
          </Text>
          <Button onPress={() => setDateOpen(true)}>
            <Text>Select date and time</Text>
          </Button>
          <DatePicker
            modal
            open={dateOpen}
            date={selectedTime || new Date()}
            mode="date"
            onConfirm={(date) => {
              setDateOpen(false)
              setSelectedTime(date)
              setTimeOpen(true)
            }}
            onCancel={() => {
              setDateOpen(false)
            }}
          />
          <DatePicker
            modal
            open={timeOpen}
            date={selectedTime || new Date()}
            mode="time"
            onConfirm={(time) => {
              setTimeOpen(false)
              selectedTime.setHours(time.getHours())
              selectedTime.setMinutes(time.getMinutes())
              setSelectedTime(selectedTime)
            }}
            onCancel={() => {
              setTimeOpen(false)
            }}
          />
        </View>
      )}
      {page === 2 && (
        <View className={'flex-1 justify-center items-center'}>
          <H2>Please wait...</H2>
          <View className={'m-3 gap-4 flex items-center'}>
            <Muted>
              Your location is being shared with the selected users...
            </Muted>
          </View>
        </View>
      )}
      {selectedItems.length > 0 && page === 0 && (
        <Button
          className={
            'absolute flex-row gap-2 bottom-4 right-6 mb-4 justify-center items-center h-12 w-32 self-end bg-primary rounded border border-primary'
          }
          onPress={handleNext}
        >
          <Text>Next</Text>
        </Button>
      )}
      {selectedItems.length > 0 && page === 1 && (
        <>
          <Button
            className={
              'absolute flex-row gap-2 left-6 bottom-4 mb-4 justify-center items-center h-12 w-12 self-start bg-primary rounded border border-primary'
            }
            onPress={handleBack}
          >
            <ArrowLeftIcon color={theme} />
          </Button>
          <Button
            className={
              'absolute flex-row gap-2 bottom-4 right-6 mb-4 justify-center items-center h-12 w-32 self-end bg-primary rounded border border-primary'
            }
            onPress={handleConfirm}
          >
            <Text>Confirm</Text>
          </Button>
        </>
      )}
    </>
  )
}
