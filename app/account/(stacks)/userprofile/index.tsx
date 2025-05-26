import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  TouchableWithoutFeedback,
  View
} from 'react-native'
import { Text } from '~/components/ui/text'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { account, databases } from '~/lib/appwrite-client'
import { Separator } from '~/components/ui/separator'
import { H1, H4, Muted } from '~/components/ui/typography'
import React, { useCallback, useState } from 'react'
import { useUser } from '~/components/contexts/UserContext'
import * as Sentry from '@sentry/react-native'
import { UserData } from '~/lib/types/collections'
import { useFocusEffect } from '@react-navigation/core'
import { Checkbox } from '~/components/ui/checkbox'
import { z } from 'zod'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'
import { router } from 'expo-router'
import DatePicker from 'react-native-date-picker'
import { Textarea } from '~/components/ui/textarea'
import SlowInternet from '~/components/views/SlowInternet'

const schema = z.object({
  profileUrl: z
    .string()
    .min(1, 'Profile URL cannot be blank')
    .max(48, 'Max length is 48'),
  displayName: z
    .string()
    .min(3, 'Display Name should be at least 3 characters')
    .max(48, 'Max length is 48'),
  status: z.string().max(24, 'Max length is 24'),
  pronouns: z.string().max(16, 'Max length is 16'),
  birthday: z.string().max(32, 'Max length is 32'),
  location: z.string().max(48, 'Max length is 48'),
  bio: z.string().max(2048, 'Max length is 2048')
})

export default function UserprofilePage() {
  const [isDisabled, setIsDisabled] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const { setUser, current } = useUser()

  const [showDatePicker, setShowDatePicker] = useState(false)
  const [userData, setUserData] =
    useState<UserData.UserDataDocumentsType | null>(null)
  const [nsfw, setNsfw] = useState<boolean>(false)
  const [indexable, setIndexable] = useState<boolean>(false)
  const { showAlert } = useAlertModal()

  const fetchUserData = async () => {
    try {
      const data: UserData.UserDataDocumentsType = await databases.getDocument(
        'hp_db',
        'userdata',
        current.$id
      )
      setUserData(data)
      setNsfw(current.prefs.nsfw)
      setIndexable(current.prefs.indexingEnabled)
    } catch (error) {
      showAlert('FAILED', 'Failed to fetch user data. Please try again later.')
      Sentry.captureException(error)
    } finally {
      setRefreshing(false)
    }
  }

  const memoizedCallback = useCallback(() => {
    setRefreshing(true)
    if (current) fetchUserData().then()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current])

  useFocusEffect(memoizedCallback)

  const handleUpdate = async () => {
    try {
      setIsDisabled(true)

      try {
        schema.parse(userData)
      } catch (error) {
        showAlert('FAILED', error.errors[0].message)
        setIsDisabled(false)
        return
      }

      try {
        await databases.updateDocument('hp_db', 'userdata', current.$id, {
          profileUrl: userData.profileUrl,
          displayName: userData.displayName,
          status: userData.status,
          pronouns: userData.pronouns,
          birthday: userData.birthday,
          location: userData.location,
          bio: userData.bio
        })
        showAlert('SUCCESS', 'User data updated successfully.')
      } catch (error) {
        showAlert('FAILED', 'Failed to save user data')
        Sentry.captureException(error)
      }
      setIsDisabled(false)
    } catch (error) {
      setIsDisabled(false)
      console.error(error)
      Sentry.captureException(error)
      showAlert('FAILED', 'An error occurred. Please try again later.')
    }
  }

  const handlePrefs = async (newNsfw: boolean, newIndexable: boolean) => {
    const prefs = current.prefs
    const body = {
      ...prefs,
      nsfw: newNsfw,
      indexingEnabled: newIndexable
    }
    try {
      await account.updatePrefs(body)
      setUser((prev: any) => ({
        ...prev,
        prefs: body
      }))
      showAlert('SUCCESS', 'Preference updated successfully.')
    } catch (error) {
      showAlert('FAILED', 'Failed to update preference.')
      console.error(error)
      Sentry.captureException(error)
    }
  }

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchUserData().then()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const changeNsfw = async (e: boolean) => {
    setNsfw(e)
    handlePrefs(e, indexable).then()
  }

  const changeIndexable = async (e: boolean) => {
    setIndexable(e)
    handlePrefs(nsfw, e).then()
  }

  if (!userData) return <SlowInternet />

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View className="mx-4 gap-4 mt-4 mb-8">
            <View className={'flex-row gap-8'}>
              <View className={'w-full gap-4'}>
                <View>
                  <H4>Change avatar</H4>
                  <Muted>Want to change your looks? Upload a new avatar.</Muted>
                </View>
                <Separator className={'w-[100px]'} />
                <View>
                  <Button
                    onPress={() =>
                      router.push('/account/(stacks)/userprofile/avatarAdd')
                    }
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
                    onPress={() =>
                      router.push('/account/(stacks)/userprofile/bannerAdd')
                    }
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
                    checked={nsfw}
                    onCheckedChange={(e) => changeNsfw(e)}
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
                    Checking this box will enable your profile to be indexed by
                    search engines.
                  </Muted>
                </View>
                <Separator className={'w-[100px]'} />
                <View>
                  <Checkbox
                    nativeID={'index'}
                    checked={indexable}
                    onCheckedChange={(e) => changeIndexable(e)}
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
                    Your Profile URL is the link that you can share with others
                    to showcase your profile.
                  </Muted>
                </View>
                <Separator className={'w-[100px]'} />
                <View>
                  <View
                    className={
                      'flex-row items-center h-10 native:h-12 rounded-md border border-input bg-background px-3 text-base lg:text-sm native:text-lg native:leading-[1.25] text-foreground placeholder:text-muted-foreground file:border-0 file:bg-transparent file:font-medium'
                    }
                  >
                    <Text style={{ color: '#A0A0A0' }}>
                      headpat.place/user/
                    </Text>
                    <Input
                      style={{ flex: 1 }}
                      nativeID={'profileUrl'}
                      className={'border-0 bg-transparent'}
                      textContentType={'name'}
                      onChangeText={(text) =>
                        setUserData({ ...userData, profileUrl: text })
                      }
                      value={userData.profileUrl}
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
                    onChange={(e) =>
                      setUserData({
                        ...userData,
                        displayName: e.nativeEvent.text
                      })
                    }
                    textContentType={'name'}
                    value={userData.displayName}
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
                    onChange={(e) =>
                      setUserData({ ...userData, status: e.nativeEvent.text })
                    }
                    value={userData.status}
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
                    onChange={(e) =>
                      setUserData({ ...userData, pronouns: e.nativeEvent.text })
                    }
                    value={userData.pronouns}
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
                  {showDatePicker && (
                    <>
                      <DatePicker
                        date={new Date(userData.birthday)}
                        onDateChange={(date) => {
                          setUserData({
                            ...userData,
                            birthday: date.toISOString()
                          })
                        }}
                        mode="date"
                      />
                    </>
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
                    onChange={(e) =>
                      setUserData({
                        ...userData,
                        location: e.nativeEvent.text
                      })
                    }
                    textContentType={'location'}
                    value={userData.location}
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
                    onChange={(e) =>
                      setUserData({
                        ...userData,
                        bio: e.nativeEvent.text
                      })
                    }
                    value={userData.bio}
                    numberOfLines={4}
                    multiline={true}
                    maxLength={2048}
                  />
                </View>
              </View>
            </View>
            <View>
              <Button onPress={handleUpdate} disabled={isDisabled}>
                <Text>Save</Text>
              </Button>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
