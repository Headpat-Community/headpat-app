import { Stack } from 'expo-router'
import { useTranslations } from 'gt-react-native'
import { CheckIcon } from 'lucide-react-native'
import { ScrollView, TouchableOpacity, View } from 'react-native'
import CountryFlag from 'react-native-country-flag'
import { useLanguage } from '~/components/contexts/LanguageProvider'
import { Card, CardContent, CardFooter, CardTitle } from '~/components/ui/card'
import { useColorScheme } from '~/lib/useColorScheme'

export default function LanguagesView() {
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? 'white' : 'black'
  const { language, setLanguage } = useLanguage()
  const t = useTranslations()

  const onLabelPress = (label: string) => async () => {
    await setLanguage(label)
  }

  const languages = [
    { label: 'en', title: 'English', country: 'us' },
    { label: 'de', title: 'Deutsch', country: 'de' },
    { label: 'nl', title: 'Nederlands', country: 'nl' },
  ]

  return (
    <ScrollView>
      <Stack.Screen options={{ headerTitle: t('language') }} />
      <View style={{ margin: 16, gap: 12 }}>
        {languages.map(({ label, title, country }) => (
          <TouchableOpacity key={label} onPress={() => void onLabelPress(label)}>
            <Card>
              <CardContent className={'py-4'}>
                <CardFooter className={'flex flex-wrap justify-between p-0'}>
                  <CardTitle
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <CountryFlag
                      isoCode={country}
                      size={16}
                      style={{ marginRight: 8, marginBottom: 2 }}
                    />
                    {title}
                  </CardTitle>
                  {language === label && <CheckIcon size={20} color={theme} />}
                </CardFooter>
              </CardContent>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}
