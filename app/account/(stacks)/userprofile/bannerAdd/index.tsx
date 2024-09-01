import * as React from 'react'
import { useState } from 'react'
import { Keyboard, TouchableWithoutFeedback, View } from 'react-native'
import { Text } from '~/components/ui/text'
import { Button } from '~/components/ui/button'
import { H2, Muted } from '~/components/ui/typography'
import { router } from 'expo-router'
import { functions, storage } from '~/lib/appwrite-client'
import { ExecutionMethod, ID } from 'react-native-appwrite'
import * as Sentry from '@sentry/react-native'
import * as ImagePicker from 'react-native-image-crop-picker'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'

export default function BannerAdd() {
  const [image, setImage] = useState<ImagePicker.ImageOrVideo>(null)
  const { showLoadingModal, hideLoadingModal, showAlertModal } = useAlertModal()
  const maxFileSize = 5 * 1024 * 1024 // 1.5 MB in bytes
  const maxResolution = 8 * 1024 * 1024

  const pickImage = async () => {
    try {
      let result = await ImagePicker.openPicker({
        mediaType: 'photo',
      })

      if (!result || !result?.path) {
        showAlertModal('FAILED', 'No image selected!')
        return
      }

      if (result.width + result.height > maxResolution) {
        showAlertModal('FAILED', 'Image resolution is too large.')
        return
      }

      if (result.width + result.height <= maxResolution) {
        setImage(result)
        await uploadImageAsync()
      }
    } catch (error) {
      console.log(error)
      //showAlertModal('FAILED', 'Error picking image.')
      //Sentry.captureException(error)
    }
  }

  const handleClose = () => {
    setImage(null)
    router.back()
  }

  const handleFinish = () => {
    setImage(null)
    router.back()
  }

  async function compressImage(uri: string) {
    return await ImagePicker.openCropper({
      path: uri,
      mediaType: 'photo',
      width: 2400,
      height: 500,
      compressImageQuality: 0.8,
    })
  }

  async function uploadImageAsync() {
    if (!image.path) {
      showAlertModal('FAILED', 'Please select an image to upload')
      return
    }

    try {
      const compressedImage = await compressImage(image.path)

      if (compressedImage.size > maxFileSize) {
        showAlertModal(
          'FAILED',
          'Image size is too large. Has to be under 1.5 MB'
        )
        return
      }

      const fileData = {
        name: image.filename,
        type: compressedImage.mime,
        size: compressedImage.size,
        uri: compressedImage.path,
      }
      showLoadingModal()
      const storageData = await storage.createFile(
        'banners',
        ID.unique(),
        fileData
      )

      await functions.createExecution(
        'user-endpoints',
        '',
        false,
        `/user/uploadBanner?profileBannerId=${storageData.$id}`,
        ExecutionMethod.POST
      )

      hideLoadingModal()
      handleFinish()
    } catch (error) {
      console.log(error)
      //showAlertModal('FAILED', 'Error picking image.')
      //Sentry.captureException(error)
    }
  }

  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View className={'mx-8 flex-1'}>
          <View className={'flex-1'}>
            <View className={'mt-8'}>
              <H2>Want to upload a banner?</H2>
              <Muted>
                You can select an image from your camera roll to upload as your
                banner.
              </Muted>
            </View>
            <View className={'items-center justify-center py-8'}>
              <Button onPress={pickImage}>
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
    </>
  )
}
