import DateTimePicker from '@react-native-community/datetimepicker'
import { useFocusEffect } from '@react-navigation/core'
import { captureException } from '@sentry/react-native'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import React, { useCallback, useState } from 'react'
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { z } from 'zod'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'
import { useUser } from '~/components/contexts/UserContext'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { Input } from '~/components/ui/input'
import { Separator } from '~/components/ui/separator'
import { Text } from '~/components/ui/text'
import { Textarea } from '~/components/ui/textarea'
import { H1, H4, Muted } from '~/components/ui/typography'
import SlowInternet from '~/components/views/SlowInternet'
import { account, databases } from '~/lib/appwrite-client'
import type { UserDataDocumentsType } from '~/lib/types/collections'

const schema = z.object({
  profileUrl: z
    .string()
    .min(1, 'Profile URL cannot be blank')
    .max(48, 'Max length is 48')
    .nullable(),
  displayName: z
    .string()
    .min(3, 'Display Name should be at least 3 characters')
    .max(48, 'Max length is 48')
    .nullable(),
  status: z.string().max(24, 'Max length is 24').optional().nullable(),
  pronouns: z.string().max(16, 'Max length is 16').optional().nullable(),
  birthday: z.string().max(32, 'Max length is 32').optional().nullable(),
  location: z.string().max(48, 'Max length is 48').optional().nullable(),
  bio: z.string().max(2048, 'Max length is 2048').optional().nullable(),
})

export default function UserprofilePage() {
  const [isDisabled, setIsDisabled] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const { setUser, current } = useUser()
  const { showAlert } = useAlertModal()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<UserDataDocumentsType | null>(null)

  const {
    data: userData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['user', current?.$id],
    queryFn: async () => {
      if (!current?.$id) throw new Error('No user ID')
      const data = await databases.getRow({
        databaseId: 'hp_db',
        tableId: 'userdata',
        rowId: current.$id,
      })
      return data as unknown as UserDataDocumentsType
    },
    enabled: !!current?.$id,
  })

  // Update form data when userData changes
  React.useEffect(() => {
    if (userData) {
      setFormData(userData)
    }
  }, [userData])

  const updateMutation = useMutation({
    mutationFn: async (data: UserDataDocumentsType) => {
      if (!current?.$id) throw new Error('No user ID')
      // Validate the data
      schema.parse(data)
      // Update the document
      await databases.updateRow({
        databaseId: 'hp_db',
        tableId: 'userdata',
        rowId: current.$id,
        data: {
          profileUrl: data.profileUrl,
          displayName: data.displayName,
          status: data.status,
          pronouns: data.pronouns,
          birthday: data.birthday,
          location: data.location,
          bio: data.bio,
        },
      })
      return data
    },
    onSuccess: () => {
      showAlert('SUCCESS', 'User data updated successfully.')
      void queryClient.invalidateQueries({ queryKey: ['user', current?.$id] })
    },
    onError: (error) => {
      if (error instanceof z.ZodError) {
        showAlert('FAILED', error.message)
      } else {
        showAlert('FAILED', 'Failed to save user data')
        captureException(error)
      }
    },
  })

  const handleUpdate = async () => {
    if (!formData) return
    setIsDisabled(true)
    try {
      await updateMutation.mutateAsync(formData)
    } finally {
      setIsDisabled(false)
    }
  }

  const handlePrefs = async (newNsfw: boolean, newIndexable: boolean) => {
    if (!current) return
    const prefs = current.prefs
    const body = {
      ...prefs,
      nsfw: newNsfw,
      indexingEnabled: newIndexable,
    }
    try {
      await account.updatePrefs({
        prefs: {
          ...prefs,
          nsfw: newNsfw,
          indexingEnabled: newIndexable,
        },
      })
      setUser((prev: any) => ({
        ...prev,
        prefs: body,
      }))
      showAlert('SUCCESS', 'Preference updated successfully.')
    } catch (error) {
      showAlert('FAILED', 'Failed to update preference.')
      console.error(error)
      captureException(error)
    }
  }

  useFocusEffect(
    useCallback(() => {
      void refetch()
    }, [refetch]),
  )

  if (isLoading || !userData || !current?.$id) return <SlowInternet />

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => void refetch()} />}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View className="mx-4 mb-8 mt-4 gap-4">
            <View className={'flex-row gap-8'}>
              <View className={'w-full gap-4'}>
                <View>
                  <H4>Change avatar</H4>
                  <Muted>Want to change your looks? Upload a new avatar.</Muted>
                </View>
                <Separator className={'w-[100px]'} />
                <View>
                  <Button
                    onPress={() => router.push('/account/(stacks)/userprofile/avatarAdd')}
                    disabled={isDisabled}
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
                  <Muted>Change the top banner on your profile page!</Muted>
                </View>
                <Separator className={'w-[100px]'} />
                <View>
                  <Button
                    onPress={() => router.push('/account/(stacks)/userprofile/bannerAdd')}
                    disabled={isDisabled}
                  >
                    <Text>Upload new</Text>
                  </Button>
                </View>
              </View>
            </View>
            <Separator />
            <View className={'flex'}>
              <View>
                <H1>Preferences</H1>
                <Muted>Change your preferences here.</Muted>
              </View>
            </View>
            <Separator />
            <View className={'flex-row gap-8'}>
              <View className={'w-full gap-4'}>
                <View>
                  <H4>Enable NSFW?</H4>
                  <Muted>Dangerous! Only enable if you are 18+.</Muted>
                </View>
                <Separator className={'w-[100px]'} />
                <View>
                  <Checkbox
                    nativeID={'nsfw'}
                    checked={current.prefs.nsfw}
                    onCheckedChange={(e) => void handlePrefs(e, current.prefs.indexingEnabled)}
                    className={'p-4'}
                  />
                </View>
              </View>
            </View>

            <View className={'flex-row gap-8'}>
              <View className={'w-full gap-4'}>
                <View>
                  <H4>Index profile?</H4>
                  <Muted>
                    Checking this box will enable your profile to be indexed by search engines.
                  </Muted>
                </View>
                <Separator className={'w-[100px]'} />
                <View>
                  <Checkbox
                    nativeID={'index'}
                    checked={current.prefs.indexingEnabled}
                    onCheckedChange={(e) => void handlePrefs(current.prefs.nsfw, e)}
                    className={'p-4'}
                  />
                </View>
              </View>
            </View>
            <Separator />
            <View className={'flex'}>
              <View>
                <H1>Profile</H1>
                <Muted>Update your profile information here.</Muted>
              </View>
            </View>
            <Separator />
            <View className={'flex-row gap-8'}>
              <View className={'w-full gap-4'}>
                <View>
                  <H4>Profile URL</H4>
                  <Muted>
                    Your Profile URL is the link that you can share with others to showcase your
                    profile.
                  </Muted>
                </View>
                <Separator className={'w-[100px]'} />
                <View>
                  <View
                    className={
                      'native:h-12 native:text-lg native:leading-[1.25] h-10 flex-row items-center rounded-md border border-input bg-background px-3 text-base text-foreground file:border-0 file:bg-transparent file:font-medium placeholder:text-muted-foreground lg:text-sm'
                    }
                  >
                    <Text style={{ color: '#A0A0A0' }}>headpat.place/user/</Text>
                    <Input
                      style={{ flex: 1 }}
                      nativeID={'profileUrl'}
                      className={'border-0 bg-transparent'}
                      textContentType={'name'}
                      onChangeText={(text) =>
                        setFormData((prev) => (prev ? { ...prev, profileUrl: text } : null))
                      }
                      value={formData?.profileUrl}
                    />
                  </View>
                </View>
              </View>
            </View>
            <Separator />
            <View className={'flex-row gap-8'}>
              <View className={'w-full gap-4'}>
                <View>
                  <H4>Display name</H4>
                  <Muted>What do you want to be called?</Muted>
                </View>
                <Separator className={'w-[100px]'} />
                <View>
                  <Input
                    nativeID={'displayName'}
                    onChangeText={(text) =>
                      setFormData((prev) => (prev ? { ...prev, displayName: text } : null))
                    }
                    textContentType={'name'}
                    value={formData?.displayName}
                  />
                </View>
              </View>
            </View>
            <Separator />
            <View className={'flex-row gap-8'}>
              <View className={'w-full gap-4'}>
                <View>
                  <H4>Status</H4>
                  <Muted>What are you up to?</Muted>
                </View>
                <Separator className={'w-[100px]'} />
                <View>
                  <Input
                    nativeID={'status'}
                    onChangeText={(text) =>
                      setFormData((prev) => (prev ? { ...prev, status: text } : null))
                    }
                    value={formData?.status ?? ''}
                  />
                </View>
              </View>
            </View>
            <Separator />
            <View className={'flex-row gap-8'}>
              <View className={'w-full gap-4'}>
                <View>
                  <H4>Pronouns</H4>
                  <Muted>What are your pronouns?</Muted>
                </View>
                <Separator className={'w-[100px]'} />
                <View>
                  <Input
                    nativeID={'pronouns'}
                    onChangeText={(text) =>
                      setFormData((prev) => (prev ? { ...prev, pronouns: text } : null))
                    }
                    value={formData?.pronouns ?? ''}
                    maxLength={16}
                  />
                </View>
              </View>
            </View>
            <Separator />
            <View className={'flex-row gap-8'}>
              <View className={'w-full gap-4'}>
                <View>
                  <H4>Birthday</H4>
                  <Muted>When were you born?</Muted>
                </View>
                <Separator className={'w-[100px]'} />
                <View>
                  <Button onPress={() => setShowDatePicker(!showDatePicker)}>
                    <Text>{showDatePicker ? 'Cancel' : 'Select date'}</Text>
                  </Button>
                  {formData?.birthday && (
                    <Text className="mt-2">
                      Current birthday: {new Date(formData.birthday).toLocaleDateString()}
                    </Text>
                  )}
                  {showDatePicker && (
                    <DateTimePicker
                      value={new Date(formData?.birthday ?? '')}
                      mode="date"
                      onChange={(_, date) => {
                        if (date) {
                          setFormData((prev) =>
                            prev ? { ...prev, birthday: date.toISOString() } : null,
                          )
                        }
                      }}
                    />
                  )}
                </View>
              </View>
            </View>
            <Separator />
            <View className={'flex-row gap-8'}>
              <View className={'w-full gap-4'}>
                <View>
                  <H4>Location</H4>
                  <Muted>Where are you located?</Muted>
                </View>
                <Separator className={'w-[100px]'} />
                <View>
                  <Input
                    nativeID={'location'}
                    onChangeText={(text) =>
                      setFormData((prev) => (prev ? { ...prev, location: text } : null))
                    }
                    textContentType={'location'}
                    value={formData?.location ?? ''}
                    maxLength={48}
                  />
                </View>
              </View>
            </View>
            <Separator />
            <View className={'flex-row gap-8'}>
              <View className={'w-full gap-4'}>
                <View>
                  <H4>Bio</H4>
                  <Muted>Tell us about yourself!</Muted>
                </View>
                <Separator className={'w-[100px]'} />
                <View>
                  <Textarea
                    nativeID={'bio'}
                    onChangeText={(text) => {
                      setFormData((prev) => (prev ? { ...prev, bio: text } : null))
                    }}
                    value={formData?.bio ?? ''}
                    numberOfLines={4}
                    multiline={true}
                    maxLength={2048}
                  />
                </View>
              </View>
            </View>
            <View>
              <Button onPress={() => void handleUpdate()} disabled={isDisabled}>
                <Text>Save</Text>
              </Button>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
