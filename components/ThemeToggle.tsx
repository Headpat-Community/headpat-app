import { Link } from "expo-router"
import { TouchableOpacity, View } from "react-native"
import { useUser } from "~/components/contexts/UserContext"
import { CircleUserRound, MoonStar, Sun } from "~/components/Icons"
import { useColorScheme } from "~/lib/useColorScheme"

export function ProfileThemeToggle() {
  const { isDarkColorScheme, setColorScheme, isLoading } = useColorScheme()
  const { current } = useUser()

  return (
    <View className={"flex-row items-center"}>
      <Link href={current ? "/account" : "/login"} asChild>
        <TouchableOpacity>
          <View
            className={
              "mr-4 flex aspect-square items-end justify-center pt-0.5"
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
          if (isLoading) return
          const newTheme = isDarkColorScheme ? "light" : "dark"
          void setColorScheme(newTheme)
        }}
        className="pl-4"
      >
        <View className={"flex aspect-square items-end justify-center pt-0.5"}>
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
