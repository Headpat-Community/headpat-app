import { useState } from 'react'
import * as ImagePicker from 'expo-image-picker'
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
import FeatureAccess from '~/components/FeatureAccess'
import { z } from 'zod'
import { Progress } from '~/components/ui/progress'

const gallerySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(32, 'Name is too long'),
  longText: z.string().trim().max(2048, 'Description is too long').optional(),
})

export default function GalleryAdd() {
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset>(null)
  const [page, setPage] = useState<number>(1)
  const [title, setTitle] = useState<string>('')
  const [nsfw, setNsfw] = useState<boolean>(false)
  const [description, setDescription] = useState<string>('')
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)
  const { showAlertModal } = useAlertModal()
  const { current } = useUser()

  const openBrowser = async (url: string) => {
    await WebBrowser.openBrowserAsync(url)
  }

  const maxFileSize = 8 * 1024 * 1024 // 8 MB in bytes

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos', 'livePhotos'],
        allowsEditing: true,
        quality: 0.9,
        videoQuality: 1,
      })

      if (result?.assets?.length === 0 || !result?.assets[0].uri) {
        showAlertModal('FAILED', 'No image selected!')
        return
      }

      if (result?.assets[0]?.fileSize > maxFileSize) {
        showAlertModal(
          'FAILED',
          'Image size is too large. Has to be under 8 MB'
        )
        return
      }

      setImage(result.assets[0])
      setPage(2)
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
    setIsUploading(true)
    if (!image.uri) {
      showAlertModal('FAILED', 'Please select an image to upload!')
      setIsUploading(false)
      return
    }

    try {
      gallerySchema.parse({ name: title, longText: description })
    } catch (error) {
      showAlertModal('FAILED', error.errors[0].message)
      setIsUploading(false)
      return
    }

    try {
      // name is galleryFile + mimeType
      const name =
        image.fileName || 'galleryFile.' + image.mimeType.split('/')[1]
      const fileData = {
        name: image.fileName || name,
        type: image.mimeType,
        size: image.fileSize,
        uri: image.uri,
      }

      const storageData = await storage.createFile(
        'gallery',
        ID.unique(),
        fileData,
        undefined,
        (progress) => {
          setProgress(progress.progress)
        }
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
    } catch (error) {
      if (error.type === 'storage_file_type_unsupported') {
        showAlertModal('FAILED', 'Unsupported file type.')
      } else {
        console.log(error.type)
        Sentry.captureException(error)
        showAlertModal('FAILED', 'Error uploading image.')
      }
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <FeatureAccess featureName={'gallery'}>
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
              {isUploading && <Progress value={progress} />}
              <Button variant={'outline'} onPress={handleClose}>
                <Text>Cancel</Text>
              </Button>
              {page === 2 && (
                <>
                  <Button disabled={isUploading} onPress={uploadImageAsync}>
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
    </FeatureAccess>
  )
}
