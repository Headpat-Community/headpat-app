import AsyncStorage from '@react-native-async-storage/async-storage'
import { View } from 'react-native'
import { CircleUserRound, MoonStar, Sun } from '~/components/Icons'
import { setAndroidNavigationBar } from '~/lib/android-navigation-bar'
import { useColorScheme } from '~/lib/useColorScheme'
import { Link } from 'expo-router'
import { useUser } from '~/components/contexts/UserContext'
import { TouchableOpacity } from 'react-native-gesture-handler'

export function ProfileThemeToggle() {
  const { isDarkColorScheme, setColorScheme } = useColorScheme()
  const { current } = useUser()

  return (
    <View className={'flex-row items-center mr-4'}>
      <Link href={current ? '/account' : '/login'} asChild>
        <TouchableOpacity>
          <View
            className={
              'flex aspect-square justify-center items-end pt-0.5 mr-4'
            }
          >
            <CircleUserRound
              className="text-foreground"
              size={24}
              strokeWidth={1.25}
            />
          </View>
        </TouchableOpacity>
      </Link>

      <TouchableOpacity
        onPress={() => {
          const newTheme = isDarkColorScheme ? 'light' : 'dark'
          setColorScheme(newTheme)
          setAndroidNavigationBar(newTheme).then()
          AsyncStorage.setItem('theme', newTheme).then()
        }}
        className="pl-4"
      >
        <View className={'flex aspect-square justify-center items-end pt-0.5'}>
          {isDarkColorScheme ? (
            <MoonStar
              className="text-foreground"
              size={23}
              strokeWidth={1.25}
            />
          ) : (
            <Sun className="text-foreground" size={24} strokeWidth={1.25} />
          )}
        </View>
      </TouchableOpacity>
    </View>
  )
}
