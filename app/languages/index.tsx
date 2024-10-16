import React from 'react'
import { ScrollView, TouchableOpacity, View } from 'react-native'
import { Stack } from 'expo-router'
import { Card, CardContent, CardFooter, CardTitle } from '~/components/ui/card'
import { CheckIcon } from 'lucide-react-native'
import { useColorScheme } from '~/lib/useColorScheme'
import { useLanguage } from '~/components/contexts/LanguageProvider'
import { i18n } from '~/components/system/i18n'
import CountryFlag from 'react-native-country-flag'

export default function LanguagesView() {
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? 'white' : 'black'
  const { language, setLanguage } = useLanguage()

  const onLabelPress = (label: string) => async () => {
    setLanguage(label)
  }

  const languages = [
    { label: 'en', title: 'English', country: 'us' },
    { label: 'de', title: 'Deutsch', country: 'de' },
    { label: 'nl', title: 'Nederlands', country: 'nl' },
  ]

  return (
    <ScrollView>
      <Stack.Screen options={{ headerTitle: i18n.t('language') }} />
      <View style={{ margin: 16, gap: 12 }}>
        {languages.map(({ label, title, country }) => (
          <TouchableOpacity key={label} onPress={onLabelPress(label)}>
            <Card>
              <CardContent className={'py-4'}>
                <CardFooter className={'p-0 justify-between flex flex-wrap'}>
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
