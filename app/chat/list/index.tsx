import { FlatList, View } from 'react-native'
import React, { useMemo, useCallback } from 'react'
import { databases } from '~/lib/appwrite-client'
import { Query } from 'react-native-appwrite'
import { Community, Messaging, UserData } from '~/lib/types/collections'
import ConversationItem from '~/components/FlatlistItems/ConversationItem'
import { useRealtimeChat } from '~/lib/hooks/useRealtimeChat'
import { useUser } from '~/components/contexts/UserContext'
import { Input } from '~/components/ui/input'
import { useDebounce } from '~/lib/hooks/useDebounce'
import { Text } from '~/components/ui/text'
import ConversationSearchItem from '~/components/FlatlistItems/ConversationSearchItem'
import { useFocusEffect } from '@react-navigation/core'
import FeatureAccess from '~/components/FeatureAccess'
import * as Sentry from '@sentry/react-native'
import { i18n } from '~/components/system/i18n'
import { useQuery, useQueryClient } from '@tanstack/react-query'

export default function ConversationsView() {
  const [refreshing, setRefreshing] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const { conversations, fetchInitialData } = useRealtimeChat()
  const { current } = useUser()
  const queryClient = useQueryClient()

  // Memoize the conversation IDs to prevent unnecessary re-renders
  const conversationIds = useMemo(
    () => conversations.map((c) => c.$id),
    [conversations]
  )

  const { data: displayData, isLoading } = useQuery({
    queryKey: ['conversation-display-data', conversationIds],
    queryFn: async () => {
      const newDisplayUsers = {}
      const promises = conversations.map(async (conversation) => {
        if (conversation.communityId) {
          const communityData = await queryClient.fetchQuery({
            queryKey: ['community', conversation.communityId],
            queryFn: async () => {
              const response = await databases.getDocument(
                'hp_db',
                'community',
                conversation.communityId
              )
              return response as Community.CommunityDocumentsType
            },
            staleTime: 1000 * 60 * 5, // 5 minutes
          })
          if (communityData) {
            newDisplayUsers[conversation.$id] = {
              isCommunity: true,
              ...communityData,
            }
          }
        } else if (conversation.participants) {
          const otherParticipantId = conversation.participants.find(
            (participant) => participant !== current.$id
          )
          if (otherParticipantId) {
            const userData = await queryClient.fetchQuery({
              queryKey: ['user', otherParticipantId],
              queryFn: async () => {
                const response = await databases.getDocument(
                  'hp_db',
                  'userdata',
                  otherParticipantId
                )
                return response as UserData.UserDataDocumentsType
              },
              staleTime: 1000 * 60 * 5, // 5 minutes
            })
            if (userData) {
              newDisplayUsers[conversation.$id] = userData
            }
          }
        }
      })

      await Promise.all(promises)
      return newDisplayUsers
    },
    enabled: conversations.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['user-search', debouncedSearchTerm],
    queryFn: async () => {
      if (!debouncedSearchTerm) return []
      try {
        const results = await databases.listDocuments('hp_db', 'userdata', [
          Query.contains('profileUrl', debouncedSearchTerm),
        ])
        const userDataResults = await Promise.all(
          results.documents.map(async (user) => {
            return await databases.getDocument('hp_db', 'userdata', user.$id)
          })
        )
        return userDataResults as UserData.UserDataDocumentsType[]
      } catch (error) {
        Sentry.captureException(error)
        console.error('Error searching users', error)
        throw error
      }
    },
    enabled: !!debouncedSearchTerm,
  })

  const refreshData = useCallback(async () => {
    try {
      setRefreshing(true)
      await fetchInitialData()
      await queryClient.invalidateQueries({
        queryKey: ['conversation-display-data'],
      })
    } finally {
      setRefreshing(false)
    }
  }, [fetchInitialData, queryClient])

  const onRefresh = useCallback(() => {
    refreshData()
  }, [refreshData])

  // Reset search and refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setSearchTerm('')
      refreshData()
    }, [refreshData])
  )

  const renderConversationItem = useCallback(
    ({ item }: { item: Messaging.MessageConversationsDocumentsType }) => (
      <ConversationItem
        item={item}
        displayData={displayData?.[item.$id]}
        isLoading={isLoading}
      />
    ),
    [displayData, isLoading]
  )

  const renderSearchItem = useCallback(
    ({ item }: { item: UserData.UserDataDocumentsType }) => (
      <ConversationSearchItem item={item} />
    ),
    []
  )

  return (
    <FeatureAccess featureName={'messaging'}>
      <Input
        value={searchTerm}
        onChangeText={setSearchTerm}
        placeholder="Search users..."
        className={'rounded-none'}
      />
      {searchTerm ? (
        <View>
          {isSearching ? (
            <View>
              <Text>{i18n.t('main.loading')}</Text>
            </View>
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.$id}
              renderItem={renderSearchItem}
            />
          )}
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.$id}
          renderItem={renderConversationItem}
          onRefresh={onRefresh}
          refreshing={refreshing}
          numColumns={1}
          contentContainerStyle={{ justifyContent: 'space-between' }}
        />
      )}
    </FeatureAccess>
  )
}
