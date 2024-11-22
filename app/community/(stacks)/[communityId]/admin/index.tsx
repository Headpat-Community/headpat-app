import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { Text } from '~/components/ui/text'
import { H4, Muted } from '~/components/ui/typography'
import { Separator } from '~/components/ui/separator'
import { Button } from '~/components/ui/button'
import React, { useCallback, useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import { databases } from '~/lib/appwrite-client'
import { Community } from '~/lib/types/collections'
import { useFocusEffect } from '@react-navigation/core'
import { z } from 'zod'
import { toast } from '~/lib/toast'
import * as Sentry from '@sentry/react-native'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import SlowInternet from '~/components/views/SlowInternet'

const schema = z.object({
  name: z
    .string()
    .min(4, 'Name must be 4 characters or more')
    .max(64, 'Name must be 64 characters or less'),
  status: z.string().max(24, 'Status must be 24 characters or less'),
  description: z
    .string()
    .max(4096, 'Description must be 4096 characters or less'),
})

export default function Page() {
  const local = useLocalSearchParams()
  const [community, setCommunity] =
    useState<Community.CommunityDocumentsType>(null)
  const [isDisabled, setIsDisabled] = useState(false)
  const { showLoadingModal, showAlertModal } = useAlertModal()

  const fetchData = useCallback(async () => {
    const data: Community.CommunityDocumentsType = await databases.getDocument(
      'hp_db',
      'community',
      `${local?.communityId}`
    )
    setCommunity(data)
  }, [local?.communityId])

  useFocusEffect(
    React.useCallback(() => {
      fetchData().then()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [local?.communityId])
  )

  const handleUpdate = async (name: string, value: string) => {
    showLoadingModal()
    try {
      setIsDisabled(true)

      // Dynamically create a schema with only the field that needs validation
      const dynamicSchema = z.object({
        [name]: schema.shape[name],
      })

      try {
        // Validate only the field that triggered the event
        dynamicSchema.parse({ [name]: value })
      } catch (error) {
        toast(error.errors[0].message)
        return
      }

      try {
        await databases.updateDocument(
          'hp_db',
          'community',
          `${local.communityId}`,
          {
            [name]: value,
          }
        )
        showAlertModal('SUCCESS', 'Community data updated successfully.')
      } catch (error) {
        showAlertModal('FAILED', 'Failed to save community data')
        Sentry.captureException(error)
      }
      setIsDisabled(false)
    } catch (error) {
      setIsDisabled(false)
      console.error(error)
      Sentry.captureException(error)
      showAlertModal('FAILED', 'An error occurred. Please try again later.')
    }
  }

  if (!community) return <SlowInternet />

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
                  <H4>Change avatar</H4>
                  <Muted>Change the avatar on your community page!</Muted>
                </View>
                <Separator className={'w-[100px]'} />
                <View>
                  <Button
                    onPress={() =>
                      router.navigate({
                        pathname: '/community/[communityId]/admin/avatarAdd',
                        params: { communityId: local?.communityId },
                      })
                    }
                  >
                    <Text>Upload new</Text>
                  </Button>
                </View>
              </View>
            </View>
            <Separator />
            <View className={'flex-row gap-8'}>
              <View className={'w-full gap-4'}>
                <View>
                  <H4>Change banner</H4>
                  <Muted>Change the top banner on your community page!</Muted>
                </View>
                <Separator className={'w-[100px]'} />
                <View>
                  <Button
                    onPress={() =>
                      router.navigate({
                        pathname: '/community/[communityId]/admin/bannerAdd',
                        params: { communityId: local?.communityId },
                      })
                    }
                  >
                    <Text>Upload new</Text>
                  </Button>
                </View>
              </View>
            </View>
            <Separator />
            <View className={'flex-row gap-8'}>
              <View className={'w-full gap-4'}>
                <View>
                  <H4>Name</H4>
                </View>
                <Separator className={'w-[100px]'} />
                <View>
                  <View
                    className={
                      'flex-row items-center h-10 native:h-12 rounded-md border border-input bg-background px-3 text-base lg:text-sm native:text-lg native:leading-[1.25] text-foreground placeholder:text-muted-foreground file:border-0 file:bg-transparent file:font-medium'
                    }
                  >
                    <Input
                      style={{ flex: 1 }}
                      nativeID={'name'}
                      className={'border-0 bg-transparent'}
                      textContentType={'name'}
                      onChangeText={(text) =>
                        setCommunity({ ...community, name: text })
                      }
                      value={community?.name}
                    />
                  </View>
                </View>
                <View>
                  <Button
                    onPress={() => handleUpdate('name', community.name)}
                    disabled={isDisabled}
                  >
                    <Text>Save</Text>
                  </Button>
                </View>
              </View>
            </View>
            <Separator />
            <View className={'flex-row gap-8'}>
              <View className={'w-full gap-4'}>
                <View>
                  <H4>Status</H4>
                </View>
                <Separator className={'w-[100px]'} />
                <View>
                  <View
                    className={
                      'flex-row items-center h-10 native:h-12 rounded-md border border-input bg-background px-3 text-base lg:text-sm native:text-lg native:leading-[1.25] text-foreground placeholder:text-muted-foreground file:border-0 file:bg-transparent file:font-medium'
                    }
                  >
                    <Input
                      style={{ flex: 1 }}
                      nativeID={'status'}
                      className={'border-0 bg-transparent'}
                      onChangeText={(text) =>
                        setCommunity({ ...community, status: text })
                      }
                      value={community?.status}
                    />
                  </View>
                </View>
                <View>
                  <Button
                    onPress={() => handleUpdate('status', community.status)}
                    disabled={isDisabled}
                  >
                    <Text>Save</Text>
                  </Button>
                </View>
              </View>
            </View>
            <Separator />
            <View className={'flex-row gap-8'}>
              <View className={'w-full gap-4'}>
                <View>
                  <H4>Description</H4>
                </View>
                <Separator className={'w-[100px]'} />
                <View>
                  <Textarea
                    nativeID={'description'}
                    onChange={(e) =>
                      setCommunity({
                        ...community,
                        description: e.nativeEvent.text,
                      })
                    }
                    value={community.description}
                  />
                </View>
                <View>
                  <Button
                    onPress={() =>
                      handleUpdate('description', community.description)
                    }
                    disabled={isDisabled}
                  >
                    <Text>Save</Text>
                  </Button>
                </View>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
