import { View } from 'react-native'
import { RadioGroupItem } from '~/components/ui/radio-group'
import { Label } from '~/components/ui/label'
import React from 'react'

export function RadioGroupItemWithLabel({
  value,
  onLabelPress,
}: {
  value: string
  onLabelPress: () => void
}) {
  return (
    <View className={'flex-row gap-2 items-center'}>
      <RadioGroupItem aria-labelledby={`label-for-${value}`} value={value} />
      <Label nativeID={`label-for-${value}`} onPress={onLabelPress}>
        {value}
      </Label>
    </View>
  )
}
