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
import { useGlobalSearchParams } from 'expo-router'
import { database } from '~/lib/appwrite-client'
import { Community } from '~/lib/types/collections'
import { useFocusEffect } from '@react-navigation/core'
import { z } from 'zod'
import { toast } from '~/lib/toast'
import * as Sentry from '@sentry/react-native'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'

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
        await database.updateDocument(
          'hp_db',
          'community-settings',
          `${local?.communityId}`,
          {
            isFindable: communitySettings.isFindable,
            hasPublicPage: communitySettings.hasPublicPage,
            nsfw: communitySettings.nsfw,
          }
        )
        showAlertModal('SUCCESS', 'Community settings updated successfully.')
      } catch (error) {
        showAlertModal('FAILED', 'Failed to save community settings')
        Sentry.captureException(error)
      }
    } catch (error) {
      console.error(error)
      Sentry.captureException(error)
      showAlertModal('FAILED', 'An error occurred. Please try again later.')
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
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
