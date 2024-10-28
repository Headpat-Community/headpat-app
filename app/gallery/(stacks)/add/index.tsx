import { useState } from 'react'
import * as ImagePicker from 'react-native-image-crop-picker'
import { toast } from '~/lib/toast'
import { Keyboard, TouchableWithoutFeedback, View } from 'react-native'
import { Text } from '~/components/ui/text'
import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'
import { Input } from '~/components/ui/input'
import { Checkbox } from '~/components/ui/checkbox'
import { Textarea } from '~/components/ui/textarea'
import * as React from 'react'
import { H2, Muted } from '~/components/ui/typography'
import { router } from 'expo-router'
import { databases, storage } from '~/lib/appwrite-client'
import { ID } from 'react-native-appwrite'
import { useUser } from '~/components/contexts/UserContext'
import * as Sentry from '@sentry/react-native'
import * as WebBrowser from 'expo-web-browser'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'

export default function GalleryAdd() {
  const [image, setImage] = useState<ImagePicker.ImageOrVideo>(null)
  const [page, setPage] = useState(1)
  const [title, setTitle] = useState('')
  const [nsfw, setNsfw] = useState(false)
  const [description, setDescription] = useState('')
  const { showLoadingModal, hideLoadingModal, showAlertModal } = useAlertModal()
  const { current } = useUser()

  const openBrowser = async (url: string) => {
    await WebBrowser.openBrowserAsync(url)
  }

  const maxFileSize = 8 * 1024 * 1024 // 8 MB in bytes
  const maxResolution = 8 * 1024 * 1024

  const pickImage = async () => {
    try {
      let result = await ImagePicker.openPicker({
        mediaType: 'any',
        compressImageQuality: 0.9,
        compressVideoPreset: 'MediumQuality',
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
        setPage(2)
      }
    } catch (error) {
      console.log(error)
      //showAlertModal('FAILED', 'Error picking image.')
      //Sentry.captureException(error)
    }
  }

  const handleClose = () => {
    setImage(null)
    setPage(1)
    router.back()
  }

  const handleFinish = (galleryId: string) => {
    setImage(null)
    setPage(1)
    router.push(`/gallery/${galleryId}`)
  }

  async function uploadImageAsync() {
    showLoadingModal()
    if (!image.path) {
      showAlertModal('FAILED', 'Please select an image to upload')
      return
    }
    if (!title || title.length <= 3) {
      toast('Please provide a valid title.')
      return
    }

    try {
      const fileData = {
        name: image.filename,
        type: image.mime,
        size: image.size,
        uri: image.path,
      }

      if (image.size > maxFileSize) {
        showAlertModal(
          'FAILED',
          'Image size is too large. Has to be under 8 MB'
        )
        return
      }

      const storageData = await storage.createFile(
        'gallery',
        ID.unique(),
        fileData
      )

      await databases.createDocument(
        'hp_db',
        'gallery-images',
        storageData.$id,
        {
          name: title,
          longText: description,
          nsfw: nsfw,
          userId: current.$id,
          mimeType: fileData.type,
          galleryId: storageData.$id,
        }
      )

      handleFinish(storageData.$id)
      hideLoadingModal()
    } catch (error) {
      //console.log(error)
      showAlertModal('FAILED', 'Error picking image.')
      Sentry.captureException(error)
    }
  }

  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View className={'mx-8 flex-1'}>
          <View className={'flex-1'}>
            <View className={'mt-8'}>
              {page === 1 && <H2>Want to upload an image?</H2>}
              {page === 2 && <H2>Please provide more details</H2>}
              {page === 1 && (
                <Muted>
                  You can select an image from your camera roll to upload to the
                  gallery.
                </Muted>
              )}
              {page === 2 && (
                <Muted>Thanks for sharing, please continue to submit.</Muted>
              )}
            </View>
            {page === 1 && (
              <>
                <View className={'items-center justify-center py-8'}>
                  <Button onPress={pickImage}>
                    <Text>Pick an image from camera roll</Text>
                  </Button>
                </View>

                <View className={'items-center'}>
                  <Muted
                    onPress={() =>
                      openBrowser('https://headpat.place/legal/eula')
                    }
                  >
                    Please make sure to follow the EULA.
                  </Muted>
                </View>
              </>
            )}

            {page === 2 && (
              <View className={'gap-4 py-8'}>
                <>
                  <View>
                    <Label nativeID={'title'}>Title:</Label>
                    <Input
                      nativeID={'title'}
                      inputMode={'text'}
                      value={title}
                      onChangeText={(text) => setTitle(text)}
                      placeholder="Title"
                    />
                  </View>
                  <View>
                    <Label nativeID={'nsfwCheckbox'}>Is this NSFW?</Label>
                    <Checkbox
                      className={'p-4'}
                      checked={nsfw}
                      onCheckedChange={setNsfw}
                    />
                  </View>
                  <View>
                    <Label nativeID={'description'}>Description:</Label>
                    <Textarea
                      placeholder="Write some stuff..."
                      nativeID={'description'}
                      value={description}
                      onChangeText={(text) => setDescription(text)}
                      numberOfLines={4}
                      multiline={true}
                      style={{ height: 100 }}
                    />
                  </View>
                </>
              </View>
            )}
          </View>
          <View style={{ marginBottom: 40 }} className={'gap-4'}>
            <>
              <Button variant={'outline'} onPress={handleClose}>
                <Text>Cancel</Text>
              </Button>
              {page === 2 && (
                <>
                  <Button onPress={uploadImageAsync}>
                    <Text>Submit</Text>
                  </Button>
                  <Button onPress={() => setPage(1)}>
                    <Text>Back</Text>
                  </Button>
                </>
              )}
            </>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </>
  )
}
