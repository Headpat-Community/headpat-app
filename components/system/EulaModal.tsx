import React from "react"
import { View } from "react-native"
import * as WebBrowser from "expo-web-browser"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog"
import { Text } from "~/components/ui/text"
import { Button } from "~/components/ui/button"
import AsyncStorage from "@react-native-async-storage/async-storage"

export default function EulaModal({
  isOpen,
  setOpen,
  versionData,
}: {
  isOpen: boolean
  setOpen: (open: boolean) => void
  versionData: any
}) {
  const openBrowser = async (url: string) => {
    await WebBrowser.openBrowserAsync(url)
  }

  const acceptEula = () => {
    void AsyncStorage.setItem(`eula`, `${versionData.version}`).then()
    setOpen(false)
  }

  return (
    <View>
      <AlertDialog open={isOpen} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End-User License Agreement</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            This is a legally binding agreement. By clicking "I Agree", you
            agree to the EULA, Terms of Service and Privacy Policy.
          </AlertDialogDescription>
          <View className={"gap-2"}>
            <Button
              variant={"outline"}
              onPress={() =>
                void openBrowser("https://headpat.place/legal/eula")
              }
            >
              <Text>EULA</Text>
            </Button>
            <Button
              variant={"outline"}
              onPress={() =>
                void openBrowser(
                  "https://headpat.place/legal/termsofservice.pdf"
                )
              }
            >
              <Text>Terms of Service</Text>
            </Button>
            <Button
              variant={"outline"}
              onPress={() =>
                void openBrowser("https://headpat.place/legal/privacypolicy")
              }
            >
              <Text>Privacy Policy</Text>
            </Button>
          </View>
          <AlertDialogFooter>
            <AlertDialogTrigger asChild>
              <Button onPress={acceptEula}>
                <Text>I agree</Text>
              </Button>
            </AlertDialogTrigger>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </View>
  )
}
