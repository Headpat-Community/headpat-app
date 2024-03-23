import AsyncStorage from '@react-native-async-storage/async-storage'
import { Pressable, View } from 'react-native'
import { CircleUserRound, MoonStar, Sun } from '~/components/Icons'
import { setAndroidNavigationBar } from '~/lib/android-navigation-bar'
import { useColorScheme } from '~/lib/useColorScheme'
import { cn } from '~/lib/utils'
import { router } from 'expo-router'

export function ThemeToggle() {
  const { isDarkColorScheme, setColorScheme } = useColorScheme()
  return (
    <View className={'flex-wrap'}>
      <Pressable
        onPress={() => {
          router.push('/login')
        }}
        className="web:ring-offset-background web:transition-colors web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2"
      >
        {({ pressed }) => (
          <View
            className={cn(
              'flex-1 aspect-square justify-center items-end pt-0.5 web:pl-4',
              pressed && 'opacity-70'
            )}
          >
            <CircleUserRound
              className="text-foreground"
              size={24}
              strokeWidth={1.25}
            />
          </View>
        )}
      </Pressable>

      <Pressable
        onPress={() => {
          const newTheme = isDarkColorScheme ? 'light' : 'dark'
          setColorScheme(newTheme)
          setAndroidNavigationBar(newTheme)
          AsyncStorage.setItem('theme', newTheme)
        }}
        className="pl-4"
      >
        {({ pressed }) => (
          <View
            className={cn(
              'flex-1 aspect-square pt-0.5 justify-center items-start web:px-5',
              pressed && 'opacity-70'
            )}
          >
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
        )}
      </Pressable>
    </View>
  )
}
