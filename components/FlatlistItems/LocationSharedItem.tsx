import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { UsersIcon } from 'lucide-react-native'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import {
  getAvatarImageUrlPreview,
  getCommunityAvatarUrlPreview,
} from '~/components/api/getStorageItem'
import { Muted } from '../ui/typography'
import { Text } from '~/components/ui/text'
import { Card, CardContent } from '~/components/ui/card'
import { useTimeLeft } from '../calculateTimeLeft'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog'
import { Button } from '~/components/ui/button'
import { databases } from '~/lib/appwrite-client'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'
import * as Sentry from '@sentry/react-native'
import { Community, UserData } from '~/lib/types/collections'

const LocationSharedItem = React.memo(
  ({
    documentId,
    timeUntil,
    item,
    onRemove,
  }: {
    documentId: string
    timeUntil: string
    item: UserData.UserDataDocumentsType | Community.CommunityDocumentsType
    onRemove: (documentId: string) => void
  }) => {
    const isCommunity = !!item?.name
    const timeLeft = useTimeLeft(timeUntil)
    const [openModal, setOpenModal] = React.useState(false)
    const { showAlert } = useAlertModal()

    const stopSharing = async () => {
      try {
        await databases.deleteDocument(
          'hp_db',
          'locations-permissions',
          documentId
        )
        showAlert(
          'SUCCESS',
          'Removed location sharing with ' + isCommunity
            ? item?.name
            : item?.displayName
        )
        onRemove(documentId)
      } catch (e) {
        console.log(e)
        Sentry.captureException(e)
        showAlert('FAILED', 'An error occurred while deleting the conversation')
      } finally {
        setOpenModal(false)
      }
    }

    const handleLongPress = React.useCallback(() => {
      setOpenModal(true)
    }, [])

    return (
      <>
        <AlertDialog open={openModal} onOpenChange={setOpenModal}>
          <AlertDialogContent className={'w-96'}>
            <AlertDialogTitle>Moderation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to stop sharing your location with{' '}
              {isCommunity ? item?.name : item?.displayName}?
            </AlertDialogDescription>
            <View>
              <TouchableOpacity
                style={{
                  gap: 12,
                }}
              >
                <Button variant={'destructive'} onPress={stopSharing}>
                  <Text>Stop sharing</Text>
                </Button>
              </TouchableOpacity>
            </View>
            <AlertDialogFooter>
              <AlertDialogCancel>
                <Text>Cancel</Text>
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <TouchableOpacity onLongPress={handleLongPress}>
          <Card className={'rounded-none'}>
            <CardContent className={'pt-4 pb-4'}>
              <View className={'flex flex-row items-center'}>
                <View>
                  <Avatar
                    style={{ width: 64, height: 64 }}
                    alt={isCommunity ? item?.name : item?.displayName}
                  >
                    <AvatarImage
                      src={
                        isCommunity
                          ? getCommunityAvatarUrlPreview(
                              item?.avatarId,
                              'width=100&height=100'
                            )
                          : getAvatarImageUrlPreview(
                              item?.avatarId,
                              'width=100&height=100'
                            ) || null
                      }
                    />
                    <AvatarFallback>
                      <Text>
                        {isCommunity
                          ? item?.name?.charAt(0)
                          : item?.displayName?.charAt(0)}
                      </Text>
                    </AvatarFallback>
                  </Avatar>
                  {isCommunity && (
                    <View className="absolute bottom-0.5 -right-0.5 bg-primary text-primary-foreground rounded-full p-0.5">
                      <UsersIcon size={16} color={'white'} />
                    </View>
                  )}
                </View>
                <View className={'flex-row justify-between'}>
                  <View className="ml-4 flex-1">
                    <View>
                      <Text className="font-semibold">
                        {isCommunity ? item?.name : item?.displayName}
                      </Text>
                    </View>
                    <Muted className="text-sm">{item?.lastMessage}</Muted>
                  </View>
                  <View
                    style={{
                      marginRight: 48,
                    }}
                  >
                    <Text className="font-semibold">{timeLeft}</Text>
                  </View>
                </View>
              </View>
            </CardContent>
          </Card>
        </TouchableOpacity>
      </>
    )
  }
)

LocationSharedItem.displayName = 'LocationSharedItem'

export default LocationSharedItem
