import { ScrollView, View } from 'react-native'
import { Text } from '~/components/ui/text'
import { Label } from '~/components/ui/label'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { account, functions } from '~/lib/appwrite-client'
import { Separator } from '~/components/ui/separator'
import { H4, Muted } from '~/components/ui/typography'
import { useState } from 'react'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'
import { ExecutionMethod } from 'react-native-appwrite'
import * as Sentry from '@sentry/react-native'
import { router } from 'expo-router'
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
import { useUser } from '~/components/contexts/UserContext'

export default function SecurityPage() {
  const [email, setEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const { showLoadingModal, showAlertModal } = useAlertModal()
  const { setUser } = useUser()

  const changeEmail = async () => {
    showLoadingModal()
    try {
      await account.updateEmail(email, emailPassword)
      showAlertModal('SUCCESS', 'Email changed successfully')
      setEmail('')
      setEmailPassword('')
    } catch (error) {
      showAlertModal('FAILED', error.message)
      console.error(error)
    }
  }

  const changePassword = async () => {
    showLoadingModal()
    try {
      await account.updatePassword(newPassword, oldPassword)
      showAlertModal('SUCCESS', 'Password changed successfully')
      setOldPassword('')
      setNewPassword('')
    } catch (error) {
      showAlertModal('FAILED', error.message)
      console.error(error)
    }
  }

  const deleteAccount = async () => {
    showLoadingModal()
    try {
      await functions.createExecution(
        'user-endpoints',
        '',
        true,
        '/deleteAccount',
        ExecutionMethod.DELETE
      )
      router.navigate('/')
      showAlertModal(
        'SUCCESS',
        'Account deletion is in progress. You will be logged out.'
      )
      setUser(null)
    } catch (error) {
      showAlertModal('FAILED', error.message)
      Sentry.captureException(error)
    }
  }

  return (
    <ScrollView>
      <View className="mx-4 gap-4 mt-4 mb-8">
        <View className={'flex-row gap-8'}>
          <View className={'w-full gap-4'}>
            <View>
              <H4>Change E-Mail</H4>
              <Muted>You can change your E-Mail here.</Muted>
            </View>
            <Separator className={'w-[100px]'} />
            <View>
              <Label nativeID={'email'}>New E-Mail</Label>
              <Input
                nativeID={'email'}
                onChange={(e) => setEmail(e.nativeEvent.text)}
                textContentType={'emailAddress'}
                value={email}
              />
            </View>
            <View>
              <Label nativeID={'email'}>Current Password</Label>
              <Input
                nativeID={'email'}
                textContentType={'password'}
                passwordRules={'minlength: 8'}
                secureTextEntry
                onChange={(e) => setEmailPassword(e.nativeEvent.text)}
                value={emailPassword}
              />
            </View>
            <View>
              <Button onPress={changeEmail}>
                <Text>Save</Text>
              </Button>
            </View>
          </View>
        </View>
        <Separator />
        <View className={'flex-row gap-8'}>
          <View className={'w-full gap-4'}>
            <View>
              <H4>Change password</H4>
              <Muted>You can change your password here.</Muted>
            </View>
            <Separator className={'w-[100px]'} />
            <View>
              <Label nativeID={'email'}>Current password</Label>
              <Input
                nativeID={'email'}
                textContentType={'password'}
                secureTextEntry
                passwordRules={'minlength: 8'}
                onChange={(e) => setOldPassword(e.nativeEvent.text)}
                value={oldPassword}
              />
            </View>
            <View>
              <Label nativeID={'email'}>New Password</Label>
              <Input
                nativeID={'email'}
                textContentType={'newPassword'}
                secureTextEntry
                passwordRules={'minlength: 8'}
                onChange={(e) => setNewPassword(e.nativeEvent.text)}
                value={newPassword}
              />
            </View>
            <View>
              <Button onPress={changePassword}>
                <Text>Save</Text>
              </Button>
            </View>
          </View>
        </View>
        <Separator />
        <View className={'flex-row gap-8'}>
          <View className={'w-full gap-4'}>
            <View>
              <H4>Delete account</H4>
              <Muted>
                This action is irreversible. All your data will be lost.
              </Muted>
            </View>
            <View>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant={'destructive'}>
                    <Text>Delete Account</Text>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <H4>Are you sure?</H4>
                  </AlertDialogHeader>
                  <AlertDialogDescription>
                    <Text>
                      <Text className={'text-destructive'}>Warning:</Text> This
                      action is irreversible. All your data will be lost.
                    </Text>
                  </AlertDialogDescription>
                  <View className={'flex-col'}>
                    <View style={{ marginBottom: 8 }}>
                      <Text>The following will be deleted:</Text>
                      <Text>
                        <Text className={'text-destructive'}>•</Text> Your
                        account
                      </Text>
                      <Text>
                        <Text className={'text-destructive'}>•</Text> Your
                        public profile
                      </Text>
                      <Text>
                        <Text className={'text-destructive'}>•</Text> Your
                        preferences
                      </Text>
                      <Text>
                        <Text className={'text-destructive'}>•</Text> Your
                        sessions
                      </Text>
                      <Text>
                        <Text className={'text-destructive'}>•</Text> Your
                        gallery images
                      </Text>
                      <Text></Text>
                    </View>
                    <View style={{ marginBottom: 8 }}>
                      <Text>
                        If you are sure you want to delete your account, please
                        confirm below.
                      </Text>
                    </View>
                  </View>
                  <AlertDialogFooter>
                    <AlertDialogCancel>
                      <Text>Cancel</Text>
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className={'bg-destructive'}
                      onPress={deleteAccount}
                    >
                      <Text className={'text-white'}>Confirm deletion</Text>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}