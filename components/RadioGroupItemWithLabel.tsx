import { View } from 'react-native'
import { RadioGroupItem } from '~/components/ui/radio-group'
import { Label } from '~/components/ui/label'
import { Text } from '~/components/ui/text'
import React from 'react'

export function RadioGroupItemWithLabel({
  value,
  label,
  description,
  onLabelPress,
}: {
  value: string
  label?: string
  description?: string
  onLabelPress?: () => void
}) {
  return (
    <View className={'flex-row gap-2 items-start py-2'}>
      <View className="pt-1">
        <RadioGroupItem aria-labelledby={`label-for-${value}`} value={value} />
      </View>
      <View className="flex-1">
        <Label nativeID={`label-for-${value}`} onPress={onLabelPress}>
          <Text className="text-base font-medium">{label || value}</Text>
        </Label>
        <Text className="text-muted-foreground text-sm mt-0.5">
          {description}
        </Text>
      </View>
    </View>
  )
}
