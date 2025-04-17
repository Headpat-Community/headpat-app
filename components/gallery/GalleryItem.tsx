import React from 'react'
import { Dimensions, TouchableWithoutFeedback, View } from 'react-native'
import { Image } from 'expo-image'
import { Link } from 'expo-router'
import { Badge } from '~/components/ui/badge'
import { Text } from '~/components/ui/text'
import { ImageFormat } from 'react-native-appwrite'
import { Skeleton } from '~/components/ui/skeleton'
import { Gallery } from '~/lib/types/collections'

type GalleryItemProps = {
  image: Gallery.GalleryDocumentsType
  thumbnail: string
  getGalleryUrl: (id: string, format?: ImageFormat) => string
  imagePrefs: { [key: string]: Gallery.GalleryPrefsDocumentsType }
}

// eslint-disable-next-line react/display-name
const GalleryItem = React.memo(
  ({ image, thumbnail, getGalleryUrl, imagePrefs }: GalleryItemProps) => {
    const format = image.mimeType?.split('/').pop()
    const imageFormat = format
      ? (ImageFormat[
          format.charAt(0).toUpperCase() + format.slice(1)
        ] as ImageFormat)
      : undefined

    // Get device dimensions
    const { width } = Dimensions.get('window')

    // Define height based on device size
    const widthColumns = width > 600 ? '50%' : '100%'
    const isHidden: boolean = imagePrefs[image.$id]?.isHidden

    return (
      <TouchableWithoutFeedback>
        <Link
          href={{
            pathname: '/gallery/(stacks)/[galleryId]',
            params: { galleryId: image.$id },
          }}
          asChild
        >
          <View
            style={{
              position: 'relative',
              width: widthColumns,
              height: 200,
              marginBottom: 10,
            }}
          >
            {isHidden ? (
              <View>
                <Skeleton className={'w-full h-full'}>
                  <Badge className={'w-full'}>
                    <Text>Image is hidden</Text>
                  </Badge>
                </Skeleton>
              </View>
            ) : (
              <>
                <Image
                  source={
                    image.mimeType.includes('video')
                      ? { uri: thumbnail }
                      : {
                          uri: getGalleryUrl(image.$id, imageFormat),
                        }
                  }
                  alt={image.name}
                  style={{ width: '100%', height: '100%' }}
                  contentFit={'contain'}
                />
                {image.mimeType.includes('gif') && (
                  <Badge
                    className={'absolute border-2 bg-secondary border-primary'}
                  >
                    <Text className={'text-primary'}>GIF</Text>
                  </Badge>
                )}
                {image.mimeType.includes('video') && (
                  <Badge
                    className={'absolute border-2 bg-secondary border-primary'}
                  >
                    <Text className={'text-primary'}>Video</Text>
                  </Badge>
                )}
              </>
            )}
          </View>
        </Link>
      </TouchableWithoutFeedback>
    )
  }
)

export default GalleryItem
