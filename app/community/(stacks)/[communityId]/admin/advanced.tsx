import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { Text } from '~/components/ui/text'
import { H1, H4, Muted } from '~/components/ui/typography'
import { Separator } from '~/components/ui/separator'
import { Button } from '~/components/ui/button'
import React, { useCallback, useState } from 'react'
import { Switch } from '~/components/ui/switch'
import { router, useGlobalSearchParams } from 'expo-router'
import { database, functions } from '~/lib/appwrite-client'
import { Community } from '~/lib/types/collections'
import { useFocusEffect } from '@react-navigation/core'
import { z } from 'zod'
import { toast } from '~/lib/toast'
import * as Sentry from '@sentry/react-native'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'
import { ExecutionMethod } from 'react-native-appwrite'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog'

const schema = z.object({
  isFindable: z.boolean(),
  hasPublicPage: z.boolean(),
  nsfw: z.boolean(),
})

export default function Page() {
  const [communitySettings, setCommunitySettings] =
    useState<Community.CommunitySettingsDocumentsType>(null)
  const { showLoadingModal, showAlertModal } = useAlertModal()
  const local = useGlobalSearchParams()

  const fetchData = useCallback(async () => {
    const data: Community.CommunitySettingsDocumentsType =
      await database.getDocument(
        'hp_db',
        'community-settings',
        `${local?.communityId}`
      )
    setCommunitySettings(data)
  }, [local.communityId])

  useFocusEffect(
    React.useCallback(() => {
      fetchData().then()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [local.communityId])
  )

  const handleUpdate = async () => {
    showLoadingModal()
    try {
      try {
        // Validate the entire communitySettings object
        schema.parse({
          isFindable: communitySettings.isFindable,
          hasPublicPage: communitySettings.hasPublicPage,
          nsfw: communitySettings.nsfw,
        })
      } catch (error) {
        toast(error.errors[0].message)
        return
      }

      try {
        const data = await functions.createExecution(
          'community-endpoints',
          JSON.stringify(communitySettings),
          false,
          `/community/settings?communityId=${local?.communityId}`,
          ExecutionMethod.PUT
        )
        const response = JSON.parse(data.responseBody)

        if (response.type === 'unauthorized') {
          return showAlertModal('FAILED', 'Unauthorized')
        } else if (response.type === 'community_settings_update_missing_id') {
          return showAlertModal('FAILED', 'Community ID is missing')
        } else if (response.type === 'community_settings_update_error') {
          return showAlertModal(
            'FAILED',
            'Failed to update community settings, please try again later'
          )
        } else if (response.type === 'success') {
          return showAlertModal(
            'SUCCESS',
            'Community settings updated successfully.'
          )
        }
      } catch (error) {
        showAlertModal('FAILED', 'Failed to save community settings')
        Sentry.captureException(error)
      }
    } catch (error) {
      Sentry.captureException(error)
      showAlertModal('FAILED', 'An error occurred. Please try again later.')
    }
  }

  const handleDelete = async () => {
    showLoadingModal()
    try {
      const data = await functions.createExecution(
        'community-endpoints',
        '',
        false,
        `/community?communityId=${local.communityId}`,
        ExecutionMethod.DELETE
      )
      const response = JSON.parse(data.responseBody)

      if (response.type === 'community_delete_missing_id') {
        showAlertModal('FAILED', 'Community ID is missing')
        return
      } else if (response.type === 'unauthorized') {
        showAlertModal('FAILED', 'Unauthorized')
        return
      } else if (response.type === 'community_delete_no_permission') {
        showAlertModal('FAILED', 'No permission')
        return
      } else if (response.type === 'community_delete_error') {
        showAlertModal(
          'FAILED',
          'Failed to delete community, please try again later'
        )
        return
      } else if (response.type === 'community_deleted') {
        router.push('/')
        showAlertModal('SUCCESS', 'Community deleted successfully')
        return
      }
    } catch (error) {
      showAlertModal('FAILED', 'Failed to delete community')
      Sentry.captureException(error)
    }
  }

  if (!communitySettings)
    return (
      <View className={'flex-1 justify-center items-center'}>
        <View className={'p-4 native:pb-24 max-w-md gap-6'}>
          <View className={'gap-1'}>
            <H1 className={'text-foreground text-center'}>Loading...</H1>
            <Muted className={'text-base text-center'}>
              Looks like you have some slow internet.. Please wait.
            </Muted>
          </View>
        </View>
      </View>
    )

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View className="mx-4 gap-4 mt-4 mb-8">
            <View className={'flex-row gap-8'}>
              <View className={'w-full gap-4'}>
                <View>
                  <H4>Is findable?</H4>
                </View>
                <Separator className={'w-[100px]'} />
                <View>
                  <View
                    className={
                      'flex-row items-center h-10 native:h-12 rounded-md bg-background px-3 text-base lg:text-sm native:text-lg native:leading-[1.25] text-foreground placeholder:text-muted-foreground file:border-0 file:bg-transparent file:font-medium'
                    }
                  >
                    <Switch
                      nativeID={'isFindable'}
                      checked={communitySettings?.isFindable}
                      onCheckedChange={() =>
                        setCommunitySettings((prev) => ({
                          ...prev,
                          isFindable: !prev.isFindable,
                        }))
                      }
                    />
                  </View>
                </View>
              </View>
            </View>
            <Separator />
            <View className={'flex-row gap-8'}>
              <View className={'w-full gap-4'}>
                <View>
                  <H4>Has public page?</H4>
                </View>
                <Separator className={'w-[100px]'} />
                <View>
                  <View
                    className={
                      'flex-row items-center h-10 native:h-12 rounded-md bg-background px-3 text-base lg:text-sm native:text-lg native:leading-[1.25] text-foreground placeholder:text-muted-foreground file:border-0 file:bg-transparent file:font-medium'
                    }
                  >
                    <Switch
                      nativeID={'hasPublicPage'}
                      checked={communitySettings?.hasPublicPage}
                      onCheckedChange={() =>
                        setCommunitySettings((prev) => ({
                          ...prev,
                          hasPublicPage: !prev.hasPublicPage,
                        }))
                      }
                    />
                  </View>
                </View>
              </View>
            </View>
            <Separator />
            <View className={'flex-row gap-8'}>
              <View className={'w-full gap-4'}>
                <View>
                  <H4>NSFW?</H4>
                </View>
                <Separator className={'w-[100px]'} />
                <View>
                  <View
                    className={
                      'flex-row items-center h-10 native:h-12 rounded-md bg-background px-3 text-base lg:text-sm native:text-lg native:leading-[1.25] text-foreground placeholder:text-muted-foreground file:border-0 file:bg-transparent file:font-medium'
                    }
                  >
                    <Switch
                      nativeID={'nsfw'}
                      checked={communitySettings?.nsfw}
                      onCheckedChange={() =>
                        setCommunitySettings((prev) => ({
                          ...prev,
                          nsfw: !prev.nsfw,
                        }))
                      }
                    />
                  </View>
                </View>
              </View>
            </View>
            <Separator />
            <Button onPress={handleUpdate}>
              <Text>Save</Text>
            </Button>
            <Muted>
              <Text>
                <Text className={'font-bold'}>Note:</Text> Changes will be
                reflected immediately.
              </Text>
            </Muted>
            <Separator />
            <View>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant={'destructive'}>
                    <Text>Delete community</Text>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <H4>Are you sure?</H4>
                  </AlertDialogHeader>
                  <AlertDialogDescription>
                    <Text>
                      <Text className={'text-destructive'}>Warning:</Text> This
                      action is irreversible. All data will be lost.
                    </Text>
                  </AlertDialogDescription>
                  <View className={'flex-col'}>
                    <View style={{ marginBottom: 8 }}>
                      <Text>The following will be deleted:</Text>
                      <Text>
                        <Text className={'text-destructive'}>•</Text> Your
                        community
                      </Text>
                      <Text>
                        <Text className={'text-destructive'}>•</Text> Community
                        posts
                      </Text>
                      <Text>
                        <Text className={'text-destructive'}>•</Text> Community
                        followers
                      </Text>
                      <Text>
                        <Text className={'text-destructive'}>•</Text> Community
                        settings
                      </Text>
                      <Text>
                        <Text className={'text-destructive'}>•</Text> Everything
                        else that is associated with your community
                      </Text>
                    </View>
                    <View style={{ marginBottom: 8 }}>
                      <Text>
                        If you are sure you want to delete your community,
                        please confirm below.
                      </Text>
                    </View>
                  </View>
                  <AlertDialogFooter>
                    <AlertDialogCancel>
                      <Text>Cancel</Text>
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className={'bg-destructive'}
                      onPress={handleDelete}
                    >
                      <Text className={'text-white'}>Confirm deletion</Text>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}