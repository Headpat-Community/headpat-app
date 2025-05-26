import React from 'react'
import { TouchableOpacity } from 'react-native'
import { Link } from 'expo-router'
import { Announcements } from '~/lib/types/collections'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle
} from '~/components/ui/card'
import { Muted } from '~/components/ui/typography'
import { formatDate } from '~/components/calculateTimeLeft'
import { ClockIcon } from 'lucide-react-native'
import { useColorScheme } from '~/lib/useColorScheme'

// eslint-disable-next-line react/display-name
const AnnouncementItem = React.memo(
  ({
    announcement
  }: {
    announcement: Announcements.AnnouncementDocumentsType
  }) => {
    const { isDarkColorScheme } = useColorScheme()
    const theme = isDarkColorScheme ? 'white' : 'black'

    return (
      <Link
        href={{
          pathname: '/announcements/[announcementId]',
          params: { announcementId: announcement.$id }
        }}
        asChild
      >
        <TouchableOpacity>
          <Card>
            <CardContent>
              <CardTitle className={'justify-between mt-2 text-xl'}>
                {announcement.title}
              </CardTitle>
              <CardDescription>
                <Muted>{announcement?.sideText}</Muted>
              </CardDescription>
              <CardFooter className={'p-0 mt-2 justify-between flex flex-wrap'}>
                <CardDescription>
                  <ClockIcon size={12} color={theme} />{' '}
                  {formatDate(new Date(announcement.validUntil))}
                </CardDescription>
              </CardFooter>
            </CardContent>
          </Card>
        </TouchableOpacity>
      </Link>
    )
  }
)

export default AnnouncementItem
