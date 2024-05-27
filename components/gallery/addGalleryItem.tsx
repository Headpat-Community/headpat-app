import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog'
import { useColorScheme } from '~/lib/useColorScheme'
import { PlusIcon } from 'lucide-react-native'
import * as React from 'react'
import { Text } from '~/components/ui/text'
import { TouchableOpacity, View } from 'react-native'
import { useState } from 'react'
import * as ImagePicker from 'expo-image-picker'
import { Label } from '~/components/ui/label'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { toast } from '~/lib/toast'
import { Checkbox } from '~/components/ui/checkbox'
import { Textarea } from '~/components/ui/textarea'

export default function AddGalleryItem() {
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? 'white' : 'black'
  const [image, setImage] = useState(null)
  const [page, setPage] = useState(1)
  const [title, setTitle] = useState('')
  const [nsfw, setNsfw] = useState(false)
  const [description, setDescription] = useState('')

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
    })

    if (!result.canceled) {
      const image = result.assets[0]
      const maxResolution = 5000 * 5000
      const maxFileSize = 8 * 1024 * 1024 // 4MB in bytes

      if (image.width * image.height > maxResolution) {
        toast('Image resolution is too large')
      }

      if (image.fileSize > maxFileSize) {
        toast('Image file size is too large')
      }

      if (
        image.width * image.height <= maxResolution &&
        image.fileSize <= maxFileSize
      ) {
        setImage(image.uri)
        setPage(2)
      }
    }
  }

  const handleClose = () => {
    setImage(null)
    setPage(1)
  }

  return (
    <AlertDialog onOpenChange={handleClose}>
      <AlertDialogTrigger asChild>
        <TouchableOpacity>
          <PlusIcon
            aria-label={'Add gallery item'}
            title={'Add gallery item'}
            size={20}
            color={theme}
          />
        </TouchableOpacity>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          {page === 1 && (
            <AlertDialogTitle>Want to upload an image?</AlertDialogTitle>
          )}
          {page === 2 && (
            <AlertDialogTitle>Please provide more details</AlertDialogTitle>
          )}
          {page === 1 && (
            <AlertDialogDescription>
              You can select an image from your camera roll to upload to the
              gallery.
            </AlertDialogDescription>
          )}
          {page === 2 && (
            <AlertDialogDescription>
              Thanks for sharing, please continue to submit.
            </AlertDialogDescription>
          )}
          {page === 1 && (
            <View className={'items-center justify-center my-8'}>
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
                    className={'container'}
                    onChangeText={setTitle}
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
                    onChangeText={setDescription}
                    aria-labelledby="description"
                  />
                </View>
              </>
            </View>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            <Text>Cancel</Text>
          </AlertDialogCancel>
          {page === 2 && (
            <AlertDialogAction>
              <Text>Submit</Text>
            </AlertDialogAction>
          )}
          <Button onPress={handleClose}>
            <Text>Back</Text>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
