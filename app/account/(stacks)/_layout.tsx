import React from 'react'
import { router, Stack } from 'expo-router'
import { useFocusEffect } from '@react-navigation/core'
import { useUser } from '~/components/contexts/UserContext'

const _layout = () => {
  const { current } = useUser()

  useFocusEffect(
    React.useCallback(() => {
      if (!current) {
        router.push('/login')
      }
    }, [current])
  )

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="userprofile/(tabs)" />
      <Stack.Screen name="security/index" />
    </Stack>
  )
}

export default _layout
