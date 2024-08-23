import {
  Keyboard,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { Text } from '~/components/ui/text'
import { Label } from '~/components/ui/label'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { account, database } from '~/lib/appwrite-client'
import { Separator } from '~/components/ui/separator'
import { H1, H4, Muted } from '~/components/ui/typography'
import React, { useCallback, useState } from 'react'
import { toast } from '~/lib/toast'
import { useUser } from '~/components/contexts/UserContext'
import * as Sentry from '@sentry/react-native'
import { UserData } from '~/lib/types/collections'
import { useFocusEffect } from '@react-navigation/core'
import { Checkbox } from '~/components/ui/checkbox'
import { z } from 'zod'

export default function UserprofilePage() {
  const [isDisabled, setIsDisabled] = useState(false)
  const { setUser, current } = useUser()

  const [userData, setUserData] =
    useState<UserData.UserDataDocumentsType | null>(null)
  const [nsfw, setNsfw] = useState<boolean>(false)
  const [profileUrl, setProfileUrl] = useState<string>('')
  const [displayName, setDisplayName] = useState<string>('')
  const [status, setStatus] = useState<string>('')
  const [pronouns, setPronouns] = useState<string>('')

  const fetchUserData = async () => {
    try {
      const data: UserData.UserDataDocumentsType = await database.getDocument(
        'hp_db',
        'userdata',
        current.$id
      )
      setUserData(data)
      setStatus(data.status)
      setPronouns(data.pronouns)
      setDisplayName(data.displayName)
      setProfileUrl(data.profileUrl)
      setNsfw(current.prefs.nsfw)
    } catch (error) {
      toast('Failed to fetch userdata. Please try again later.')
      Sentry.captureException(error)
    }
  }

  const memoizedCallback = useCallback(() => {
    if (current) fetchUserData().then()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current])

  useFocusEffect(memoizedCallback)

  const handleUpdate = async (name: string, value: string) => {
    try {
      setIsDisabled(true)
      const schemaDefinitions = {
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
      }

      // Dynamically create a schema with only the field that needs validation
      const dynamicSchema = z.object({
        [name]: schemaDefinitions[name],
      })

      try {
        // Validate only the field that triggered the event
        dynamicSchema.parse({ [name]: value })
      } catch (error) {
        toast(error.errors[0].message)
        return
      }

      try {
        await database.updateDocument('hp_db', 'userdata', current.$id, {
          [name]: value,
        })
        toast('Data saved successfully')
        setTimeout(() => {
          setIsDisabled(false)
        }, 2000)
      } catch (error) {
        Sentry.captureException(error)
        toast('Failed to save employee data')
        setTimeout(() => {
          setIsDisabled(false)
        }, 2000)
      }
    } catch (error) {
      console.error(error)
      Sentry.captureException(error)
      toast('An error occurred. Please try again later.')
      setTimeout(() => {
        setIsDisabled(false)
      }, 2000)
    }
  }

  const handleNsfw = async () => {
    setIsDisabled(true)
    const prefs = current.prefs
    const body = {
      ...prefs,
      nsfw: nsfw,
    }
    try {
      await account.updatePrefs(body)
      setUser((prev: any) => ({
        ...prev,
        prefs: body,
      }))
      toast('NSFW preference updated successfully.')
      setUser((prev: any) => ({
        ...prev,
        prefs: body,
      }))
      setTimeout(() => {
        setIsDisabled(false)
      }, 2000)
    } catch (error) {
      toast(error.message)
      console.error(error)
      Sentry.captureException(error)
      setTimeout(() => {
        setIsDisabled(false)
      }, 2000)
    }
  }

  if (!userData)
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
    <ScrollView>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View className="mx-4 gap-4 mt-4 mb-8">
          <View className={'flex-row gap-8'}>
            <View className={'w-full gap-4'}>
              <View>
                <H4>Enable NSFW?</H4>
                <Muted>Dangerous! Only enable if you are 18+.</Muted>
              </View>
              <Separator className={'w-[100px]'} />
              <View>
                <Label nativeID={'nsfw'}>NSFW</Label>
                <Checkbox
                  nativeID={'nsfw'}
                  checked={nsfw}
                  onCheckedChange={(e) => setNsfw(e)}
                />
              </View>
              <View>
                <Button onPress={handleNsfw} disabled={isDisabled}>
                  <Text>Save</Text>
                </Button>
              </View>
            </View>
          </View>
          <Separator />
          <View className={'flex-row gap-8'}>
            <View className={'w-full gap-4'}>
              <View>
                <H4>Profile URL</H4>
                <Muted>
                  Your Profile URL is the link that you can share with others to
                  showcase your profile.
                </Muted>
              </View>
              <Separator className={'w-[100px]'} />
              <View>
                <Label nativeID={'profileUrl'}>New URL</Label>
                <View
                  className={
                    'flex-row items-center web:flex h-10 native:h-12 web:w-full rounded-md border border-input bg-background px-3 web:py-2 text-base lg:text-sm native:text-lg native:leading-[1.25] text-foreground placeholder:text-muted-foreground web:ring-offset-background file:border-0 file:bg-transparent file:font-medium web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2'
                  }
                >
                  <Text style={{ color: '#A0A0A0' }}>
                    https://headpat.de/user/
                  </Text>
                  <Input
                    style={{ flex: 1 }}
                    nativeID={'profileUrl'}
                    className={'border-0 bg-transparent'}
                    textContentType={'name'}
                    onChangeText={(text) => setProfileUrl(text)}
                    value={profileUrl}
                  />
                </View>
              </View>
              <View>
                <Button
                  onPress={() => handleUpdate('profileUrl', profileUrl)}
                  disabled={isDisabled || profileUrl.length < 3}
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
                <H4>Display name</H4>
                <Muted>What do you want to be called?</Muted>
              </View>
              <Separator className={'w-[100px]'} />
              <View>
                <Label nativeID={'displayName'}>Name</Label>
                <Input
                  nativeID={'displayName'}
                  onChange={(e) => setDisplayName(e.nativeEvent.text)}
                  textContentType={'name'}
                  value={displayName}
                />
              </View>
              <View>
                <Button
                  onPress={() => handleUpdate('displayName', displayName)}
                  disabled={isDisabled || displayName.length < 3}
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
                <Muted>What are you up to?</Muted>
              </View>
              <Separator className={'w-[100px]'} />
              <View>
                <Label nativeID={'status'}>Status</Label>
                <Input
                  nativeID={'status'}
                  onChange={(e) => setStatus(e.nativeEvent.text)}
                  value={status}
                />
              </View>
              <View>
                <Button
                  onPress={() => handleUpdate('status', status)}
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
                <H4>Pronouns</H4>
                <Muted>What are your pronouns?</Muted>
              </View>
              <Separator className={'w-[100px]'} />
              <View>
                <Label nativeID={'pronouns'}>Pronouns</Label>
                <Input
                  nativeID={'pronouns'}
                  onChange={(e) => setPronouns(e.nativeEvent.text)}
                  value={pronouns}
                  maxLength={16}
                />
              </View>
              <View>
                <Button
                  onPress={() => handleUpdate('pronouns', pronouns)}
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
  )
}
