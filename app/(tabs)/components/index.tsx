import { useScrollToTop } from '@react-navigation/native'
import { Link } from 'expo-router'
import * as React from 'react'
import { View } from 'react-native'
import { ChevronRight } from '~/components/Icons'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Text } from '~/components/ui/text'
import { cn } from '~/lib/utils'

export default function ComponentsScreen() {
  const [search, setSearch] = React.useState('')
  const ref = React.useRef(null)
  useScrollToTop(ref)

  return (
    <View className="flex-1 px-4">
      <View className="py-4">
        <Input
          placeholder="Search UI..."
          clearButtonMode="always"
          value={search}
          onChangeText={setSearch}
        />
      </View>
    </View>
  )
}

function toOptions(name: string) {
  const title = name
    .split('-')
    .map(function (str: string) {
      return str.replace(/\b\w/g, function (char) {
        return char.toUpperCase()
      })
    })
    .join(' ')
  return title
}
