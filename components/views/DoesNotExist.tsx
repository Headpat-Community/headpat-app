import { View } from "react-native"
import { H1, Muted } from "~/components/ui/typography"
import React from "react"
import { i18n } from "~/components/system/i18n"

export default function DoesNotExist() {
  return (
    <View className={"flex-1 items-center justify-center"}>
      <View className={"native:pb-24 max-w-md gap-6 p-4"}>
        <View className={"gap-1"}>
          <H1 className={"text-center text-foreground"}>
            {i18n.t("main.doesNotExist")}
          </H1>
          <Muted className={"text-center text-base"}>
            This page does not exist.
          </Muted>
        </View>
      </View>
    </View>
  )
}
