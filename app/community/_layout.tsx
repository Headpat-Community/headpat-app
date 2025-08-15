import { router, Stack } from 'expo-router'
import React from 'react'
import { useColorScheme } from '~/lib/useColorScheme'
import { useUser } from '~/components/contexts/UserContext'
import { View } from 'react-native'
import { TouchableOpacity } from '@gorhom/bottom-sheet'
import { PlusIcon } from 'lucide-react-native'
import { ProfileThemeToggle } from '~/components/ThemeToggle'
import { HeaderSidebarBackButton } from '~/components/data/DrawerScreensData'
import FeatureAccess from '~/components/FeatureAccess'

function CommunityAddButton() {
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? 'white' : 'black'
  const { current } = useUser()

  return (
    <FeatureAccess featureName={'communities'}>
      <View className={'items-center flex-row gap-4'}>
        {current && (
          <TouchableOpacity onPress={() => router.navigate('/community/add')}>
            <PlusIcon
              aria-label={'Create community'}
              title={'Create community'}
              size={20}
              color={theme}
            />
          </TouchableOpacity>
        )}
        <View>
          <ProfileThemeToggle />
        </View>
      </View>
    </FeatureAccess>
  )
}

function _layout() {
  return (
    <Stack initialRouteName="index">
      <Stack.Screen
        name="index"
        options={{
          headerLargeTitle: true,
          headerTitle: 'Communities',
          headerLeft: () => <HeaderSidebarBackButton />,
          headerRight: () => <CommunityAddButton />
        }}
      />
      <Stack.Screen
        name="(stacks)"
        options={{
          headerLargeTitle: false,
          headerTitle: 'Community',
          headerLeft: () => <HeaderSidebarBackButton />,
          headerRight: () => <ProfileThemeToggle />
        }}
      />
      <Stack.Screen name="add/index" />
    </Stack>
  )
}

export default _layout
