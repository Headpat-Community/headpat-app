import * as React from 'react'
import { useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native'
import { Text } from '~/components/ui/text'
import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'
import { Input } from '~/components/ui/input'
import { Checkbox } from '~/components/ui/checkbox'
import { Textarea } from '~/components/ui/textarea'
import { H2, Muted } from '~/components/ui/typography'
import { router } from 'expo-router'
import { functions } from '~/lib/appwrite-client'
import * as Sentry from '@sentry/react-native'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'
import { ExecutionMethod, Models } from 'react-native-appwrite'
import { HeadpatException } from '~/lib/types/collections'

export default function GalleryAdd() {
  const [page, setPage] = useState(1)
  const [communityData, setCommunityData] = React.useState({
    name: '',
    description: '',
    isPrivate: false,
    nsfw: false,
  })
  const { showAlert, hideAlert } = useAlertModal()

  const handleSubmit = async () => {
    showAlert('LOADING', 'Creating community...')
    try {
      const data = await functions.createExecution(
        'community-endpoints',
        JSON.stringify(communityData),
        false,
        `/community/create`,
        ExecutionMethod.POST
      )
      const resultCreate: Models.Team<Models.Preferences> | HeadpatException =
        JSON.parse(data.responseBody)

      hideAlert()

      if ('type' in resultCreate) {
        if (resultCreate.type === 'community_create_unauthorized') {
          showAlert(
            'FAILED',
            'You are not signed in. Please sign in to create a community.'
          )
          return
        } else if (resultCreate.type === 'community_create_no_name') {
          showAlert('FAILED', 'No name provided for the community.')
        }
      } else {
        showAlert('SUCCESS', 'Community created successfully')
        // @ts-ignore
        router.navigate(`/community/${resultCreate.$id}`)
      }

      showAlert('SUCCESS', 'Community created successfully')
    } catch (error) {
      hideAlert()
      showAlert('FAILED', 'Failed to create community')
      Sentry.captureException(error)
    }
  }

  const handleClose = () => {
    setPage(1)
    router.back()
  }

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView>
          <View className={'mx-8 flex-1'}>
            <View className={'flex-1'}>
              <View className={'mt-8'}>
                {page === 1 && <H2>Want to create a community?</H2>}
                {page === 2 && <H2>Please provide more details</H2>}
                {page === 1 && (
                  <Muted>
                    You can select an image from your camera roll to upload to
                    the gallery.
                  </Muted>
                )}
                {page === 2 && (
                  <Muted>Thanks for sharing, please continue to submit.</Muted>
                )}
              </View>
              {page === 1 && (
                <View className={'mt-4 gap-y-4'}>
                  <View className={'items-center justify-center'}>
                    <View className={'w-full'}>
                      <Label nativeID={'name'}>Name:</Label>
                      <Input
                        value={communityData.name}
                        className={'w-full'}
                        onChangeText={(text) => {
                          setCommunityData({
                            ...communityData,
                            name: text,
                          })
                        }}
                      />
                    </View>
                  </View>
                  <View className={'items-center justify-center'}>
                    <View className={'w-full'}>
                      <Label nativeID={'name'}>Description:</Label>
                      <Textarea
                        value={communityData.description}
                        className={'w-full'}
                        onChangeText={(text) => {
                          setCommunityData({
                            ...communityData,
                            description: text,
                          })
                        }}
                      />
                    </View>
                  </View>
                </View>
              )}

              {page === 2 && (
                <View className={'gap-4 py-8'}>
                  <>
                    <View>
                      <Label nativeID={'isPrivate'}>
                        Is community private?
                      </Label>
                      <Checkbox
                        nativeID={'isPrivate'}
                        className={'p-4'}
                        checked={communityData.isPrivate}
                        onCheckedChange={() => {
                          setCommunityData({
                            ...communityData,
                            isPrivate: !communityData.isPrivate,
                          })
                        }}
                      />
                    </View>
                    <View>
                      <Label nativeID={'nsfw'}>Is this community NSFW?</Label>
                      <Checkbox
                        nativeID={'nsfw'}
                        className={'p-4'}
                        checked={communityData.nsfw}
                        onCheckedChange={() => {
                          setCommunityData({
                            ...communityData,
                            nsfw: !communityData.nsfw,
                          })
                        }}
                      />
                    </View>
                  </>
                </View>
              )}
            </View>
            <View style={{ marginBottom: 40 }} className={'gap-4 mt-8'}>
              <>
                {page === 1 && (
                  <Button onPress={() => setPage(2)}>
                    <Text>Next</Text>
                  </Button>
                )}
                <Button variant={'outline'} onPress={handleClose}>
                  <Text>Cancel</Text>
                </Button>
                {page === 2 && (
                  <>
                    <Button onPress={handleSubmit}>
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
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  )
}
