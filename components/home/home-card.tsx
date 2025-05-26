import {
  Card,
  CardContent,
  CardDescription,
  CardFooter
} from '~/components/ui/card'
import { Text } from '~/components/ui/text'
import { LucideIcon } from 'lucide-react-native'
import { TouchableOpacity } from '@gorhom/bottom-sheet'
import { router } from 'expo-router'
import { Separator } from '~/components/ui/separator'

interface HomeCardProps {
  title: string
  description: string
  icon: LucideIcon
  route: string
  theme: string
  showSeparator?: boolean
  additionalContent?: React.ReactNode
}

export function HomeCard({
  title,
  description,
  icon: Icon,
  route,
  theme,
  showSeparator = false,
  additionalContent
}: HomeCardProps) {
  return (
    <Card className={'w-3/4 mt-4'}>
      <TouchableOpacity onPress={() => router.push(route)}>
        <CardContent className={'p-0'}>
          <CardFooter className={'mt-2 text-xl flex pb-4'}>
            <Icon
              size={20}
              color={theme}
              style={{
                marginRight: 4
              }}
            />
            <Text>{title}</Text>
          </CardFooter>
          <CardFooter
            className={'p-0 pb-2 justify-between flex flex-wrap ml-7'}
          >
            <CardDescription>
              <Text>{description}</Text>
            </CardDescription>
          </CardFooter>
          {showSeparator && (
            <CardFooter className={'pt-2'}>
              <Separator />
            </CardFooter>
          )}
          {additionalContent}
        </CardContent>
      </TouchableOpacity>
    </Card>
  )
}
