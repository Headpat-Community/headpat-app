import { useScrollToTop } from '@react-navigation/native'
import * as React from 'react'
import { View } from 'react-native'

import { Input } from '~/components/ui/input'

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
