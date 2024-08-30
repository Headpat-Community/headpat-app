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
import { database, storage } from '~/lib/appwrite-client'
import { ID } from 'react-native-appwrite'
import { Progress } from '~/components/ui/progress'
import { useUser } from '~/components/contexts/UserContext'
import * as Sentry from '@sentry/react-native'

export default function GalleryAdd() {
  const [image, setImage] = useState<ImagePicker.ImageOrVideo>(null)
  const [page, setPage] = useState(1)
  const [title, setTitle] = useState('')
  const [nsfw, setNsfw] = useState(false)
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const { current } = useUser()

  const pickImage = async () => {
    let result = await ImagePicker.openPicker({
      mediaType: 'any',
    })

    if (result) {
      const maxResolution = 5000 * 5000
      const maxFileSize = 8 * 1024 * 1024 // 8MB in bytes

      if (result.width * result.height > maxResolution) {
        toast('Image resolution is too large')
      }

      if (result.size > maxFileSize) {
        toast('Image file size is too large')
      }

      if (
        result.width * result.height <= maxResolution &&
        result.size <= maxFileSize
      ) {
        setImage(result)
        setPage(2)
      }
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

  async function compressImage(uri: string) {
    const compressedImage = await ImagePicker.openCropper({
      path: uri,
      width: 800,
      height: 800,
      compressImageQuality: 0.7,
    })
    return compressedImage
  }

  async function uploadImageAsync() {
    if (!image.path) {
      toast('Please select an image to upload')
      return
    }
    if (!title || title.length <= 3) {
      toast('Please provide a valid title.')
      return
    }

    try {
      const compressedImage = await compressImage(image.path)
      const fileData = {
        name: image.filename,
        type: image.mime,
        uri: compressedImage.path,
      }
      setUploading(true)
      const storageData = await storage.createFile(
        'gallery',
        ID.unique(),
        fileData,
        [],
        (event) => setProgress(event.progress)
      )

      await database.createDocument(
        'hp_db',
        'gallery-images',
        storageData.$id,
        {
          name: title,
          longText: description,
          nsfw: nsfw,
          userId: current.$id,
          mimeType: image.mime,
          galleryId: storageData.$id,
        }
      )

      handleFinish(storageData.$id)
    } catch (error) {
      setUploading(false)
      console.log(error)
      toast('Error uploading image')
      Sentry.captureException(error)
    }
  }

  if (uploading) {
    return (
      <View>
        <Text>Uploading... Please wait.</Text>
        <Progress value={progress} />
      </View>
    )
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
              <View className={'items-center justify-center py-8'}>
                <Button onPress={pickImage}>
                  <Text>Pick an image from camera roll</Text>
                </Button>
              </View>
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
