import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from "react-native"
import { Text } from "~/components/ui/text"
import { Button } from "~/components/ui/button"
import { useUser } from "~/components/contexts/UserContext"
import { captureException } from "@sentry/react-native"
import type { UserProfileDocumentsType } from "~/lib/types/collections"
import { useFocusEffect } from "@react-navigation/core"
import { z } from "zod"
import { useAlertModal } from "~/components/contexts/AlertModalProvider"
import SlowInternet from "~/components/views/SlowInternet"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { databases } from "~/lib/appwrite-client"
import SocialInput from "~/components/user/SocialInput"
import React, { useCallback } from "react"

const schema = z.object({
  telegramname: z.string().max(32, "Max length is 32").optional().nullable(),
  discordname: z.string().max(32, "Max length is 32").optional().nullable(),
  furaffinityname: z.string().max(32, "Max length is 32").optional().nullable(),
  X_name: z.string().max(32, "Max length is 32").optional().nullable(),
  twitchname: z.string().max(32, "Max length is 32").optional().nullable(),
  blueskyname: z.string().max(128, "Max length is 128").optional().nullable(),
})

export default function UserprofilePage() {
  const { current } = useUser()
  const { showAlert } = useAlertModal()
  const queryClient = useQueryClient()

  const {
    data: userData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["user", current?.$id],
    queryFn: async () => {
      if (!current?.$id) throw new Error("No user ID")
      const data: UserProfileDocumentsType = await databases.getRow({
        databaseId: "hp_db",
        tableId: "userdata",
        rowId: current.$id,
      })
      return data
    },
    enabled: !!current?.$id,
  })

  const updateMutation = useMutation({
    mutationFn: async (data: UserProfileDocumentsType) => {
      if (!current?.$id) throw new Error("No user ID")
      // Validate the data
      schema.parse(data)
      // Update the document
      await databases.updateRow({
        databaseId: "hp_db",
        tableId: "userdata",
        rowId: current.$id,
        data: {
          discordname: data.discordname,
          telegramname: data.telegramname,
          furaffinityname: data.furaffinityname,
          X_name: data.X_name,
          twitchname: data.twitchname,
          blueskyname: data.blueskyname,
        },
      })
      return data
    },
    onSuccess: () => {
      showAlert("SUCCESS", "User data updated successfully.")
      void queryClient.invalidateQueries({ queryKey: ["user", current?.$id] })
    },
    onError: (error) => {
      if (error instanceof z.ZodError) {
        showAlert("FAILED", error.errors[0].message)
      } else {
        showAlert("FAILED", "Failed to save social data")
        captureException(error)
      }
    },
  })

  const handleUpdate = useCallback(() => {
    if (!userData) return
    updateMutation.mutate(userData)
  }, [userData, updateMutation])

  useFocusEffect(
    useCallback(() => {
      void refetch()
    }, [refetch])
  )

  if (isLoading || !userData || !current?.$id) return <SlowInternet />

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => void refetch()}
          />
        }
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View className="mx-4 mb-8 mt-4 gap-4">
            <SocialInput
              title="Discord"
              fieldName="discordname"
              value={userData.discordname ?? ""}
              userId={current.$id}
              queryClient={queryClient}
            />
            <SocialInput
              title="Telegram"
              fieldName="telegramname"
              value={userData.telegramname ?? ""}
              userId={current.$id}
              queryClient={queryClient}
            />
            <SocialInput
              title="Furaffinity"
              fieldName="furaffinityname"
              value={userData.furaffinityname ?? ""}
              userId={current.$id}
              queryClient={queryClient}
            />
            <SocialInput
              title="X/Twitter"
              fieldName="X_name"
              value={userData.X_name ?? ""}
              userId={current.$id}
              queryClient={queryClient}
            />
            <SocialInput
              title="Twitch"
              fieldName="twitchname"
              value={userData.twitchname ?? ""}
              userId={current.$id}
              queryClient={queryClient}
            />
            <SocialInput
              title="Bluesky"
              fieldName="blueskyname"
              value={userData.blueskyname ?? ""}
              userId={current.$id}
              queryClient={queryClient}
              showAtPrefix={false}
            />
            <View>
              <Button
                onPress={handleUpdate}
                disabled={updateMutation.isPending}
              >
                <Text>Save</Text>
              </Button>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
