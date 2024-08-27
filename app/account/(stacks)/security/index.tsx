import { View } from 'react-native'
import { Text } from '~/components/ui/text'
import { Label } from '~/components/ui/label'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { account } from '~/lib/appwrite-client'
import { Separator } from '~/components/ui/separator'
import { H4, Muted } from '~/components/ui/typography'
import { useState } from 'react'
import { toast } from '~/lib/toast'

export default function SecurityPage() {
  const [email, setEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const changeEmail = async () => {
    try {
      await account.updateEmail(email, emailPassword)
      toast('E-Mail changed successfully')
      setEmail('')
      setEmailPassword('')
    } catch (error) {
      toast(error.message)
      console.error(error)
    }
  }

  const changePassword = async () => {
    try {
      await account.updatePassword(newPassword, oldPassword)
      toast('Password changed successfully')
      setOldPassword('')
      setNewPassword('')
    } catch (error) {
      toast(error.message)
      console.error(error)
    }
  }

  return (
    <View className="mx-4 gap-4 mt-4">
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
    </View>
  )
}
