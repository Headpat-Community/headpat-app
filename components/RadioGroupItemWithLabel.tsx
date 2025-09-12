import React from "react"
import { View } from "react-native"
import { Label } from "~/components/ui/label"
import { RadioGroupItem } from "~/components/ui/radio-group"
import { Text } from "~/components/ui/text"

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
    <View className={"flex-row items-start gap-2 py-2"}>
      <View className="pt-1">
        <RadioGroupItem aria-labelledby={`label-for-${value}`} value={value} />
      </View>
      <View className="flex-1">
        <Label nativeID={`label-for-${value}`} onPress={onLabelPress}>
          <Text className="text-base font-medium">{label ?? value}</Text>
        </Label>
        <Text className="mt-0.5 text-sm text-muted-foreground">
          {description}
        </Text>
      </View>
    </View>
  )
}
