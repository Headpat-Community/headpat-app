import React from 'react'
import { useState } from 'react'
import { Keyboard, TouchableWithoutFeedback, View } from 'react-native'
import { Text } from '~/components/ui/text'
import { Button } from '~/components/ui/button'
import { H2, Muted } from '~/components/ui/typography'
import { router, useGlobalSearchParams } from 'expo-router'
import { databases, functions, storage } from '~/lib/appwrite-client'
import { ExecutionMethod, ID } from 'react-native-appwrite'
import { captureException } from '@sentry/react-native'
import {
  openPicker,
  openCropper,
  ImageOrVideo
} from 'react-native-image-crop-picker'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'

export default function AvatarAdd() {
  const [image, setImage] = useState<ImageOrVideo>(null)
  const { showAlert, hideAlert } = useAlertModal()
  const maxFileSize = 1.5 * 1024 * 1024 // 1.5 MB in bytes
  const local = useGlobalSearchParams()

  const pickImage = async () => {
    try {
      let result = await openPicker({
        mediaType: 'photo',
        writeTempFile: true
      })

      if (!result || !result?.path) {
        showAlert('FAILED', 'No image selected!')
        return
      }

      setImage(result)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      //showAlert('FAILED', 'Error picking image.')
      //Sentry.captureException(error)
    }
  }

  async function upload() {
    await uploadImageAsync()
  }

  React.useEffect(() => {
    if (image) {
      upload().then()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image])

  const handleClose = () => {
    setImage(null)
    router.back()
  }

  const handleFinish = () => {
    setImage(null)
    router.back()
  }

  async function compressImage(uri: string) {
    return await openCropper({
      path: uri,
      mediaType: 'photo',
      width: 512,
      height: 512,
      compressImageQuality: 0.7
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
      const file = {
        name: image.filename || 'upload' + Math.random().toString(16) + '.jpg',
        type: compressedImage.mime,
        size: compressedImage.size,
        uri: compressedImage.path
      }

      showAlert('LOADING', 'Uploading image...')

      const data = await functions.createExecution(
        'community-endpoints',
        '',
        false,
        `/community/upload?communityId=${local?.communityId}&type=avatar`,
        ExecutionMethod.POST
      )
      const response = JSON.parse(data.responseBody)

      if (response.type === 'community_upload_missing_id') {
        hideAlert()
        return showAlert(
          'FAILED',
          'Community ID is missing. Please try again later.'
        )
      } else if (response.type === 'unauthorized') {
        hideAlert()
        return showAlert('FAILED', 'You are not authorized to upload.')
      } else if (response.type === 'community_upload_missing_type') {
        hideAlert()
        return showAlert(
          'FAILED',
          'Missing upload type. Please try again later.'
        )
      }

      const fileData = storage.createFile(
        'community-avatars',
        ID.unique(),
        file
      )

      fileData.then(
        async function (response) {
          // Update the user's avatarId
          await databases.updateDocument(
            'hp_db',
            'community',
            `${local?.communityId}`,
            {
              avatarId: response.$id
            }
          )

          showAlert('SUCCESS', 'Your avatar has been uploaded successfully.')

          await functions.createExecution(
            'community-endpoints',
            '',
            true,
            `/community/upload/finish?communityId=${local?.communityId}`,
            ExecutionMethod.POST
          )
          hideAlert()
          handleFinish()
        },
        function (error) {
          hideAlert()
          if (error.type === 'storage_file_empty') {
            showAlert('FAILED', 'Missing file.')
          } else if (error.type === 'storage_invalid_file_size') {
            showAlert(
              'FAILED',
              'The file size is either not valid or exceeds the maximum allowed size.'
            )
          } else if (error.type === 'storage_file_type_unsupported') {
            showAlert('FAILED', 'The given file extension is not supported.')
          } else if (error.type === 'storage_invalid_file') {
            showAlert(
              'FAILED',
              'The uploaded file is invalid. Please check the file and try again.'
            )
          } else if (error.type === 'storage_device_not_found') {
            showAlert(
              'FAILED',
              'The requested storage device could not be found.'
            )
          } else {
            showAlert('FAILED', 'Error uploading image.')
            captureException(error)
          }
        }
      )
    } catch (error) {
      showAlert('FAILED', 'Error uploading image.')
      captureException(error)
    }
  }

  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View className={'mx-8 flex-1'}>
          <View className={'flex-1'}>
            <View className={'mt-8'}>
              <H2>Want to upload an avatar?</H2>
              <Muted>
                You can select an image from your camera roll to upload as your
                avatar.
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
