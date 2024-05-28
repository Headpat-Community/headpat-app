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
import { database } from '~/lib/appwrite-client'
import { Separator } from '~/components/ui/separator'
import { H1, H4, Muted } from '~/components/ui/typography'
import { useCallback, useState } from 'react'
import { toast } from '~/lib/toast'
import { useUser } from '~/components/contexts/UserContext'
import * as Sentry from '@sentry/react-native'
import { UserDataDocumentsType } from '~/lib/types/collections'
import { useFocusEffect } from '@react-navigation/core'

export default function UserprofilePage() {
  const [isDisabled, setIsDisabled] = useState(false)
  const { current }: any = useUser()

  const [userData, setUserData] = useState<UserDataDocumentsType | null>(null)
  const [profileUrl, setProfileUrl] = useState<string>('')
  const [displayName, setDisplayName] = useState<string>('')
  const [status, setStatus] = useState<string>('')
  const [pronouns, setPronouns] = useState<string>('')

  const fetchUserData = async () => {
    try {
      const data: UserDataDocumentsType = await database.getDocument(
        'hp_db',
        'userdata',
        current.$id
      )
      setUserData(data)
      setStatus(data.status)
      setPronouns(data.pronouns)
    } catch (error) {
      toast('Failed to fetch userdata for friends. Please try again later.')
      Sentry.captureException(error)
    }
  }

  const memoizedCallback = useCallback(() => {
    if (current) fetchUserData().then()
  }, [current])

  useFocusEffect(memoizedCallback)

  const changeProfileUrl = async () => {
    try {
      await database.updateDocument('hp_db', 'userdata', current.$id, {
        profileUrl: profileUrl,
      })
      toast('Profile URL changed successfully')
      setProfileUrl('')
    } catch (error) {
      toast(error.message)
      console.error(error)
    }
  }

  const changeStatus = async () => {
    try {
      await database.updateDocument('hp_db', 'userdata', current.$id, {
        status: status,
      })
      toast('Status changed successfully')
    } catch (error) {
      toast(error.message)
      console.error(error)
    }
  }

  const changeDisplayName = async () => {
    try {
      await database.updateDocument('hp_db', 'userdata', current.$id, {
        displayName: displayName,
      })
      toast('Display Name changed successfully')
    } catch (error) {
      toast(error.message)
      console.error(error)
    }
  }

  const changePronouns = async () => {
    try {
      await database.updateDocument('hp_db', 'userdata', current.$id, {
        pronouns: pronouns,
      })
      toast('Pronouns changed successfully')
    } catch (error) {
      toast(error.message)
      console.error(error)
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
                    placeholder={userData?.profileUrl || ''}
                  />
                </View>
              </View>
              <View>
                <Button
                  onPress={changeProfileUrl}
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
                  placeholder={userData?.displayName || ''}
                />
              </View>
              <View>
                <Button
                  onPress={changeDisplayName}
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
                <Button onPress={changeStatus} disabled={isDisabled}>
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
                <Button onPress={changePronouns} disabled={isDisabled}>
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
