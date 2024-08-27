import React from 'react'
import { TouchableWithoutFeedback, View } from 'react-native'
import { Image } from 'expo-image'
import { Link } from 'expo-router'
import { Badge } from '~/components/ui/badge'
import { Text } from '~/components/ui/text'

const GalleryItem = React.memo(({ image, thumbnail, getGalleryUrl }: any) => {
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
                    uri: getGalleryUrl(image.$id),
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
