import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { Text } from '~/components/ui/text'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { database } from '~/lib/appwrite-client'
import { Separator } from '~/components/ui/separator'
import { H1, H4, Muted } from '~/components/ui/typography'
import React, { useCallback, useState } from 'react'
import { toast } from '~/lib/toast'
import { useUser } from '~/components/contexts/UserContext'
import * as Sentry from '@sentry/react-native'
import { UserData } from '~/lib/types/collections'
import { useFocusEffect } from '@react-navigation/core'
import { z } from 'zod'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'

export default function UserprofilePage() {
  const [isDisabled, setIsDisabled] = useState(false)
  const { current } = useUser()

  const [userData, setUserData] =
    useState<UserData.UserDataDocumentsType | null>(null)
  const { showLoadingModal, showAlertModal, hideLoadingModal } = useAlertModal()

  const fetchUserData = async () => {
    showLoadingModal()
    try {
      const data: UserData.UserDataDocumentsType = await database.getDocument(
        'hp_db',
        'userdata',
        current.$id
      )
      setUserData(data)
      hideLoadingModal()
    } catch (error) {
      showAlertModal(
        'FAILED',
        'Failed to fetch user data. Please try again later.'
      )
      Sentry.captureException(error)
    }
  }

  const memoizedCallback = useCallback(() => {
    if (current) fetchUserData().then()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current])

  useFocusEffect(memoizedCallback)

  const handleUpdate = async (name: string, value: string) => {
    showLoadingModal()
    try {
      setIsDisabled(true)
      const schemaDefinitions = {
        telegramname: z.string().max(32, 'Max length is 32'),
        discordname: z.string().max(32, 'Max length is 32'),
        furaffinityname: z.string().max(32, 'Max length is 32'),
        X_name: z.string().max(32, 'Max length is 32'),
        twitchname: z.string().max(32, 'Max length is 32'),
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
        showAlertModal('SUCCESS', 'User data updated successfully.')
      } catch (error) {
        showAlertModal('FAILED', 'Failed to save social data')
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
                <View>
                  <Button
                    onPress={() =>
                      handleUpdate('discordname', userData.discordname)
                    }
                    disabled={isDisabled}
                  >
                    <Text>Save</Text>
                  </Button>
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
              <View>
                <Button
                  onPress={() =>
                    handleUpdate('telegramname', userData.telegramname)
                  }
                  disabled={isDisabled}
                >
                  <Text>Save</Text>
                </Button>
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
              <View>
                <Button
                  onPress={() =>
                    handleUpdate('furaffinityname', userData.furaffinityname)
                  }
                  disabled={isDisabled}
                >
                  <Text>Save</Text>
                </Button>
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
              <View>
                <Button
                  onPress={() => handleUpdate('X_name', userData.X_name)}
                  disabled={isDisabled}
                >
                  <Text>Save</Text>
                </Button>
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
              <View>
                <Button
                  onPress={() =>
                    handleUpdate('twitchname', userData.twitchname)
                  }
                  disabled={isDisabled}
                >
                  <Text>Save</Text>
                </Button>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
