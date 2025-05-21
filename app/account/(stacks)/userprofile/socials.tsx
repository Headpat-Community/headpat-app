import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { Text } from '~/components/ui/text'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { databases } from '~/lib/appwrite-client'
import { Separator } from '~/components/ui/separator'
import { H4 } from '~/components/ui/typography'
import React, { useCallback, useState } from 'react'
import { useUser } from '~/components/contexts/UserContext'
import * as Sentry from '@sentry/react-native'
import { UserData } from '~/lib/types/collections'
import { useFocusEffect } from '@react-navigation/core'
import { z } from 'zod'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'
import SlowInternet from '~/components/views/SlowInternet'

const schema = z.object({
  telegramname: z.string().max(32, 'Max length is 32'),
  discordname: z.string().max(32, 'Max length is 32'),
  furaffinityname: z.string().max(32, 'Max length is 32'),
  X_name: z.string().max(32, 'Max length is 32'),
  twitchname: z.string().max(32, 'Max length is 32'),
})

export default function UserprofilePage() {
  const [isDisabled, setIsDisabled] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const { current } = useUser()

  const [userData, setUserData] =
    useState<UserData.UserDataDocumentsType | null>(null)
  const { showAlert } = useAlertModal()

  const fetchUserData = async () => {
    try {
      const data: UserData.UserDataDocumentsType = await databases.getDocument(
        'hp_db',
        'userdata',
        current.$id
      )
      setUserData(data)
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
    setIsDisabled(true)

    try {
      // parse the data
      schema.parse(userData)
    } catch (error) {
      showAlert('FAILED', error.errors[0].message)
      setIsDisabled(false)
      return
    }

    try {
      await databases.updateDocument('hp_db', 'userdata', current.$id, {
        discordname: userData.discordname,
        telegramname: userData.telegramname,
        furaffinityname: userData.furaffinityname,
        X_name: userData.X_name,
        twitchname: userData.twitchname,
      })
      showAlert('SUCCESS', 'User data updated successfully.')
    } catch (error) {
      console.log(error)
      showAlert('FAILED', 'Failed to save social data')
      Sentry.captureException(error)
    } finally {
      setIsDisabled(false)
    }
  }

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchUserData().then()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
                  <H4>Discord</H4>
                </View>
                <Separator className={'w-[100px]'} />
                <View>
                  <View
                    className={
                      'flex-row items-center h-10 native:h-12 rounded-md border border-input bg-background px-3 text-base lg:text-sm native:text-lg native:leading-[1.25] text-foreground placeholder:text-muted-foreground file:border-0 file:bg-transparent file:font-medium'
                    }
                  >
                    <Text style={{ color: '#A0A0A0' }}>@</Text>
                    <Input
                      style={{ flex: 1 }}
                      nativeID={'discordname'}
                      className={'border-0 bg-transparent'}
                      textContentType={'name'}
                      onChangeText={(text) =>
                        setUserData({ ...userData, discordname: text })
                      }
                      value={userData.discordname}
                    />
                  </View>
                </View>
              </View>
            </View>
            <Separator />
            <View className={'w-full gap-4'}>
              <View>
                <H4>Telegram</H4>
              </View>
              <Separator className={'w-[100px]'} />
              <View>
                <View
                  className={
                    'flex-row items-center h-10 native:h-12 rounded-md border border-input bg-background px-3 text-base lg:text-sm native:text-lg native:leading-[1.25] text-foreground placeholder:text-muted-foreground file:border-0 file:bg-transparent file:font-medium'
                  }
                >
                  <Text style={{ color: '#A0A0A0' }}>@</Text>
                  <Input
                    style={{ flex: 1 }}
                    nativeID={'telegramname'}
                    className={'border-0 bg-transparent'}
                    textContentType={'name'}
                    onChangeText={(text) =>
                      setUserData({ ...userData, telegramname: text })
                    }
                    value={userData.telegramname}
                  />
                </View>
              </View>
            </View>
            <Separator />
            <View className={'w-full gap-4'}>
              <View>
                <H4>Furaffinity</H4>
              </View>
              <Separator className={'w-[100px]'} />
              <View>
                <View
                  className={
                    'flex-row items-center h-10 native:h-12 rounded-md border border-input bg-background px-3 text-base lg:text-sm native:text-lg native:leading-[1.25] text-foreground placeholder:text-muted-foreground file:border-0 file:bg-transparent file:font-medium'
                  }
                >
                  <Text style={{ color: '#A0A0A0' }}>@</Text>
                  <Input
                    style={{ flex: 1 }}
                    nativeID={'furaffinity'}
                    className={'border-0 bg-transparent'}
                    textContentType={'name'}
                    onChangeText={(text) =>
                      setUserData({ ...userData, furaffinityname: text })
                    }
                    value={userData.furaffinityname}
                  />
                </View>
              </View>
            </View>
            <Separator />
            <View className={'w-full gap-4'}>
              <View>
                <H4>X/Twitter</H4>
              </View>
              <Separator className={'w-[100px]'} />
              <View>
                <View
                  className={
                    'flex-row items-center h-10 native:h-12 rounded-md border border-input bg-background px-3 text-base lg:text-sm native:text-lg native:leading-[1.25] text-foreground placeholder:text-muted-foreground file:border-0 file:bg-transparent file:font-medium'
                  }
                >
                  <Text style={{ color: '#A0A0A0' }}>@</Text>
                  <Input
                    style={{ flex: 1 }}
                    nativeID={'xname'}
                    className={'border-0 bg-transparent'}
                    textContentType={'name'}
                    onChangeText={(text) =>
                      setUserData({ ...userData, X_name: text })
                    }
                    value={userData.X_name}
                  />
                </View>
              </View>
            </View>
            <Separator />
            <View className={'w-full gap-4'}>
              <View>
                <H4>Twitch</H4>
              </View>
              <Separator className={'w-[100px]'} />
              <View>
                <View
                  className={
                    'flex-row items-center h-10 native:h-12 rounded-md border border-input bg-background px-3 text-base lg:text-sm native:text-lg native:leading-[1.25] text-foreground placeholder:text-muted-foreground file:border-0 file:bg-transparent file:font-medium'
                  }
                >
                  <Text style={{ color: '#A0A0A0' }}>@</Text>
                  <Input
                    style={{ flex: 1 }}
                    nativeID={'twitchname'}
                    className={'border-0 bg-transparent'}
                    textContentType={'name'}
                    onChangeText={(text) =>
                      setUserData({ ...userData, twitchname: text })
                    }
                    value={userData.twitchname}
                  />
                </View>
              </View>
            </View>
            <Separator />
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
