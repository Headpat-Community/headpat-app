import { captureException } from '@sentry/react-native'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { Keyboard, TouchableWithoutFeedback, View } from 'react-native'
import { ExecutionMethod, ID } from 'react-native-appwrite'
import { type ImageOrVideo, openCropper, openPicker } from 'react-native-image-crop-picker'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'
import { Button } from '~/components/ui/button'
import { Text } from '~/components/ui/text'
import { H2, Muted } from '~/components/ui/typography'
import { functions, storage } from '~/lib/appwrite-client'

export default function AvatarAdd() {
  const [image, setImage] = useState<ImageOrVideo>(null as unknown as ImageOrVideo)
  const { showAlert, hideAlert } = useAlertModal()
  const maxFileSize = 1.5 * 1024 * 1024 // 1.5 MB in bytes

  const pickImage = async () => {
    try {
      const result = await openPicker({
        mediaType: 'photo',
        writeTempFile: true,
      })

      if (!result.path) {
        showAlert('FAILED', 'No image selected!')
        return
      }

      setImage(result)
    } catch {
      //showAlertModal('FAILED', 'Error picking image.')
      //Sentry.captureException(error)
    }
  }

  async function upload() {
    await uploadImageAsync()
  }

  React.useEffect(() => {
    void upload().then()
  }, [image])

  const handleClose = () => {
    setImage(null as unknown as ImageOrVideo)
    router.back()
  }

  const handleFinish = () => {
    setImage(null as unknown as ImageOrVideo)
    router.back()
  }

  async function compressImage(uri: string) {
    return await openCropper({
      path: uri,
      mediaType: 'photo',
      width: 512,
      height: 512,
      compressImageQuality: 0.7,
    })
  }

  async function uploadImageAsync() {
    try {
      const compressedImage = await compressImage(image.path)

      if (compressedImage.size > maxFileSize) {
        showAlert('FAILED', 'Image size is too large. Has to be under 1.5 MB')
        return
      }

      // change this to any string of your choice for optonal naming if file name is undefined
      const fileData = {
        name: image.filename ?? `upload${Math.random().toString(16)}.jpg`,
        type: compressedImage.mime,
        size: compressedImage.size,
        uri: compressedImage.path,
      }

      showAlert('LOADING', 'Uploading image...')
      const storageData = await storage.createFile({
        bucketId: 'avatars',
        fileId: ID.unique(),
        file: fileData,
      })
      await functions.createExecution({
        functionId: 'user-endpoints',
        async: false,
        xpath: `/user/uploadAvatar?avatarId=${storageData.$id}`,
        method: ExecutionMethod.POST,
      })

      hideAlert()
      handleFinish()
    } catch (error) {
      showAlert('FAILED', 'Error uploading image.')
      captureException(error)
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className={'mx-8 flex-1'}>
        <View className={'flex-1'}>
          <View className={'mt-8'}>
            <H2>Want to upload an avatar?</H2>
            <Muted>You can select an image from your camera roll to upload as your avatar.</Muted>
          </View>
          <View className={'items-center justify-center py-8'}>
            <Button onPress={() => void pickImage()}>
              <Text>Pick an image from camera roll</Text>
            </Button>
          </View>
        </View>
        <View style={{ marginBottom: 40 }} className={'gap-4'}>
          <Button variant={'outline'} onPress={handleClose}>
            <Text>Cancel</Text>
          </Button>
        </View>
      </View>
    </TouchableWithoutFeedback>
  )
}
