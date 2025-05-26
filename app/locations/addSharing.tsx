import React from 'react'
import { databases } from '~/lib/appwrite-client'
import { ID, Query } from 'react-native-appwrite'
import { useDebounce } from '~/lib/hooks/useDebounce'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'
import LocationSearchItem from '~/components/FlatlistItems/LocationSearchItem'
import { Input } from '~/components/ui/input'
import { ScrollView, View } from 'react-native'
import { Text } from '~/components/ui/text'
import { useFocusEffect } from '@react-navigation/core'
import { i18n } from '~/components/system/i18n'
import { Button } from '~/components/ui/button'
import { router } from 'expo-router'
import { useUser } from '~/components/contexts/UserContext'
import { ArrowLeftIcon } from 'lucide-react-native'
import { useColorScheme } from '~/lib/useColorScheme'
import { H1, Muted } from '~/components/ui/typography'
import DatePicker from 'react-native-date-picker'
import * as Sentry from '@sentry/react-native'
import { FlashList } from '@shopify/flash-list'
import { RadioGroup } from '~/components/ui/radio-group'
import { RadioGroupItemWithLabel } from '~/components/RadioGroupItemWithLabel'
import ConfirmSharingItem from '~/components/FlatlistItems/ConfirmSharingItem'
import { Community, UserData } from '~/lib/types/collections'
import { useQuery, useQueryClient } from '@tanstack/react-query'

export default function AddSharing() {
  const [page, setPage] = React.useState(0)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [selectedTime, setSelectedTime] = React.useState(null)
  const [selectedItems, setSelectedItems] = React.useState([])
  const [selectedDuration, setSelectedDuration] = React.useState('7d')
  const [showCustomPicker, setShowCustomPicker] = React.useState(false)
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const { showAlert } = useAlertModal()
  const { current } = useUser()
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? 'white' : 'black'
  const [dateOpen, setDateOpen] = React.useState(false)
  const [timeOpen, setTimeOpen] = React.useState(false)
  const queryClient = useQueryClient()

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['location-share-search', debouncedSearchTerm],
    queryFn: async () => {
      if (!debouncedSearchTerm) return []

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
          Query.limit(10)
        ]

        const communityQueries = [
          Query.contains('name', debouncedSearchTerm),
          ...alreadySharedCommunityIds.map((id) => Query.notEqual('$id', id)),
          Query.limit(10)
        ]

        const [resultsUsers, resultsCommunity] = await Promise.all([
          databases.listDocuments('hp_db', 'userdata', userQueries),
          databases.listDocuments('hp_db', 'community', communityQueries)
        ])

        const [userDataResults, communityDataResults] = await Promise.all([
          Promise.all(
            resultsUsers.documents.map(async (item) => {
              return await queryClient.fetchQuery({
                queryKey: ['user', item.$id],
                queryFn: async () => {
                  const data = await databases.getDocument(
                    'hp_db',
                    'userdata',
                    item.$id
                  )
                  return data as UserData.UserDataDocumentsType
                },
                staleTime: 1000 * 60 * 5 // 5 minutes
              })
            })
          ),
          Promise.all(
            resultsCommunity.documents.map(async (item) => {
              return await queryClient.fetchQuery({
                queryKey: ['community', item.$id],
                queryFn: async () => {
                  const data = await databases.getDocument(
                    'hp_db',
                    'community',
                    item.$id
                  )
                  return data as Community.CommunityDocumentsType
                },
                staleTime: 1000 * 60 * 5 // 5 minutes
              })
            })
          )
        ])

        return [...userDataResults, ...communityDataResults]
      } catch (error) {
        console.error('Error searching users:', error)
        Sentry.captureException(error)
        showAlert('FAILED', i18n.t('location.add.failedToSearch'))
        throw error
      }
    },
    enabled: !!debouncedSearchTerm
  })

  // Memoize the handleSelectItem function
  const handleSelectItem = React.useCallback((item: any) => {
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
  }, [])

  // Memoize the handleRemoveItem function
  const handleRemoveItem = React.useCallback((itemId: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== itemId))
  }, [])

  // Memoize the calculateEndTime function
  const calculateEndTime = React.useCallback(
    (duration: string) => {
      const now = new Date()
      switch (duration) {
        case '1h':
          return new Date(now.getTime() + 60 * 60 * 1000)
        case '24h':
          return new Date(now.getTime() + 24 * 60 * 60 * 1000)
        case '7d':
          return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        case '30d':
          return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        case 'unlimited':
          return new Date('2100-01-01T00:00:00.000Z')
        default:
          return selectedTime
      }
    },
    [selectedTime]
  )

  // Memoize the handleDurationChange function
  const handleDurationChange = React.useCallback(
    (duration: string) => {
      setSelectedDuration(duration)
      if (duration === 'custom') {
        setShowCustomPicker(true)
      } else {
        const newTime = calculateEndTime(duration)
        setSelectedTime(newTime)
        setShowCustomPicker(false)
      }
    },
    [calculateEndTime]
  )

  const handleBack = () => {
    setPage(0)
  }

  const handleNext = () => {
    if (selectedItems.length === 0) {
      showAlert('FAILED', i18n.t('location.add.failedToSelect'))
      return
    }
    setPage(page + 1)
  }

  const handleConfirm = async () => {
    if (selectedItems.length === 0) {
      showAlert('FAILED', i18n.t('location.add.failedToSelect'))
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
            timeUntil: calculateEndTime(selectedDuration).toISOString()
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
      showAlert('FAILED', i18n.t('location.add.failedToShare'))
      Sentry.captureException(error)
    }
  }

  const renderSearchItem = React.useCallback(
    ({ item }) => (
      <LocationSearchItem
        item={item}
        isSelected={selectedItems.some(
          (selectedItem) => selectedItem.id === item.$id
        )}
        onSelectItem={() => handleSelectItem(item)}
      />
    ),
    [selectedItems, handleSelectItem]
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
                    <Text>{i18n.t('main.loading')}</Text>
                  </View>
                ) : (
                  <View className="h-full">
                    <FlashList
                      data={searchResults}
                      keyExtractor={(item) => item.$id}
                      renderItem={renderSearchItem}
                      className={'mb-24'}
                      estimatedItemSize={100}
                      extraData={selectedItems}
                    />
                  </View>
                )}
              </View>
            )}
          </>
        </View>
      )}

      {page === 1 && (
        <ScrollView>
          <View className="flex-1 justify-center items-center">
            <View className="p-4 native:pb-24 max-w-md gap-4">
              <View className="gap-1">
                <H1 className="text-foreground text-center">
                  {i18n.t('location.add.selectDuration')}
                </H1>
                <Muted className="text-base text-center">
                  {i18n.t('location.add.selectDurationDescription')}
                </Muted>
              </View>
              <View className="">
                <RadioGroup
                  value={selectedDuration}
                  onValueChange={handleDurationChange}
                >
                  <RadioGroupItemWithLabel
                    value="1h"
                    label={i18n.t('location.add.1hour')}
                    description={i18n.t('location.add.1hourDescription')}
                    onLabelPress={() => handleDurationChange('1h')}
                  />
                  <RadioGroupItemWithLabel
                    value="24h"
                    label={i18n.t('location.add.24hours')}
                    description={i18n.t('location.add.24hoursDescription')}
                    onLabelPress={() => handleDurationChange('24h')}
                  />
                  <RadioGroupItemWithLabel
                    value="7d"
                    label={i18n.t('location.add.7days')}
                    description={i18n.t('location.add.7daysDescription')}
                    onLabelPress={() => handleDurationChange('7d')}
                  />
                  <RadioGroupItemWithLabel
                    value="30d"
                    label={i18n.t('location.add.30days')}
                    description={i18n.t('location.add.30daysDescription')}
                    onLabelPress={() => handleDurationChange('30d')}
                  />
                  <RadioGroupItemWithLabel
                    value="unlimited"
                    label={i18n.t('location.add.unlimited')}
                    description={i18n.t('location.add.unlimitedDescription')}
                    onLabelPress={() => handleDurationChange('unlimited')}
                  />
                  <RadioGroupItemWithLabel
                    value="custom"
                    label={i18n.t('location.add.custom')}
                    description={i18n.t('location.add.customDescription')}
                    onLabelPress={() => handleDurationChange('custom')}
                  />
                </RadioGroup>
              </View>

              {showCustomPicker && (
                <View className="w-full gap-4 mt-4">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-lg font-semibold">
                      {i18n.t('location.add.customDateTime')}
                    </Text>
                    <Button
                      variant="outline"
                      size="sm"
                      onPress={() => setDateOpen(true)}
                    >
                      <Text>{i18n.t('location.add.selectDate')}</Text>
                    </Button>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-lg font-semibold">
                      {i18n.t('location.add.selectedTime')}
                    </Text>
                    <Button
                      variant="outline"
                      size="sm"
                      onPress={() => setTimeOpen(true)}
                    >
                      <Text>{i18n.t('location.add.selectTime')}</Text>
                    </Button>
                  </View>
                  <View className="bg-muted p-4 rounded-lg">
                    <Text className="text-center text-lg">
                      {selectedTime?.toLocaleDateString() ||
                        i18n.t('location.add.noDateSelected')}{' '}
                      at{' '}
                      {selectedTime?.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      }) || i18n.t('location.add.noTimeSelected')}
                    </Text>
                  </View>
                </View>
              )}

              <DatePicker
                modal
                open={dateOpen}
                date={selectedTime || new Date()}
                mode="date"
                minimumDate={new Date()}
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
                  const newTime = new Date(selectedTime || new Date())
                  newTime.setHours(time.getHours())
                  newTime.setMinutes(time.getMinutes())
                  setSelectedTime(newTime)
                }}
                onCancel={() => {
                  setTimeOpen(false)
                }}
              />
            </View>
          </View>
        </ScrollView>
      )}
      {page === 2 && (
        <>
          <View className="flex-1">
            <View className="p-4 native:pb-24 gap-4">
              <View className="gap-1">
                <H1 className="text-foreground text-center">
                  {i18n.t('location.add.confirmSharing')}
                </H1>
                <Muted className="text-base text-center">
                  {i18n.t('location.add.confirmSharingDescription')}
                </Muted>
              </View>

              <View className="w-full">
                {selectedItems.map((item) => {
                  const user = searchResults.find((u) => u.$id === item.id)
                  if (!user) return null

                  return (
                    <ConfirmSharingItem
                      key={item.id}
                      item={user}
                      onRemove={() => handleRemoveItem(item.id)}
                    />
                  )
                })}
              </View>

              <View className="mt-4">
                <Muted className="text-center">
                  {i18n.t('location.add.locationWillBeSharedUntil')}
                  {selectedDuration === 'custom'
                    ? selectedTime?.toLocaleDateString() +
                      ' at ' +
                      selectedTime?.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : selectedDuration === 'unlimited'
                      ? 'January 1, 2100'
                      : i18n.t('location.add.theSelectedDurationExpires')}
                </Muted>
              </View>
            </View>
          </View>

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
            <Text>{i18n.t('main.confirm')}</Text>
          </Button>
        </>
      )}
      {selectedItems.length > 0 && page === 0 && (
        <Button
          className={
            'absolute flex-row gap-2 bottom-4 right-6 mb-4 justify-center items-center h-12 w-32 self-end bg-primary rounded border border-primary'
          }
          onPress={handleNext}
        >
          <Text>{i18n.t('main.next')}</Text>
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
            onPress={handleNext}
          >
            <Text>{i18n.t('main.next')}</Text>
          </Button>
        </>
      )}
    </>
  )
}
