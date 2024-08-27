import React from 'react'
import { TouchableWithoutFeedback, View } from 'react-native'
import { Image } from 'expo-image'
import { Link } from 'expo-router'
import { Badge } from '~/components/ui/badge'
import { Text } from '~/components/ui/text'
import { ImageFormat } from 'react-native-appwrite'

const GalleryItem = React.memo(({ image, thumbnail, getGalleryUrl }: any) => {
  const format = image.mimeType?.split('/').pop()
  const imageFormat = format
    ? (ImageFormat[
        format.charAt(0).toUpperCase() + format.slice(1)
      ] as ImageFormat)
    : undefined
  return (
    <Link
      href={{
        pathname: '/gallery/(stacks)/[galleryId]',
        params: { galleryId: image.$id },
      }}
      asChild
    >
      <TouchableWithoutFeedback>
        <View
          style={{
            position: 'relative',
            width: '48%',
            height: 200,
            marginBottom: 10,
            margin: 5,
          }}
        >
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
            <Badge className={'absolute border-2 bg-secondary border-primary'}>
              <Text className={'text-primary'}>GIF</Text>
            </Badge>
          )}
          {image.mimeType.includes('video') && (
            <Badge className={'absolute border-2 bg-secondary border-primary'}>
              <Text className={'text-primary'}>Video</Text>
            </Badge>
          )}
        </View>
      </TouchableWithoutFeedback>
    </Link>
  )
})

export default GalleryItem
