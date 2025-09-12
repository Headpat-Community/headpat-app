import React from "react"
import { TouchableOpacity } from "react-native"
import { Link } from "expo-router"
import { AnnouncementDocumentsType } from "~/lib/types/collections"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "~/components/ui/card"
import { Muted } from "~/components/ui/typography"
import { formatDate } from "~/components/calculateTimeLeft"
import { ClockIcon } from "lucide-react-native"
import { useColorScheme } from "~/lib/useColorScheme"

const AnnouncementItem = React.memo(
  ({ announcement }: { announcement: AnnouncementDocumentsType }) => {
    const { isDarkColorScheme } = useColorScheme()
    const theme = isDarkColorScheme ? "white" : "black"

    return (
      <Link
        href={{
          pathname: "/announcements/[announcementId]",
          params: { announcementId: announcement.$id },
        }}
        asChild
      >
        <TouchableOpacity>
          <Card>
            <CardContent>
              <CardTitle className={"mt-2 justify-between text-xl"}>
                {announcement.title}
              </CardTitle>
              <CardDescription>
                <Muted>{announcement.sideText}</Muted>
              </CardDescription>
              <CardFooter className={"mt-2 flex flex-wrap justify-between p-0"}>
                <CardDescription>
                  <ClockIcon size={12} color={theme} />{" "}
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
