import LottieView from "lottie-react-native"
import React, { createContext, useContext, useState } from "react"
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native"
import { Notifier } from "react-native-notifier"

interface AlertModalContextProps {
  showAlert: (
    type: AlertModalTypes,
    title: string,
    description?: string
  ) => void
  hideAlert: () => void
}

export type AlertModalTypes = "SUCCESS" | "FAILED" | "INFO" | "LOADING"

const AlertModalContext = createContext<AlertModalContextProps | undefined>(
  undefined
)

export const AlertModalProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [alertType, setAlertType] = useState<AlertModalTypes | null>(null)

  const getColor = (type: AlertModalTypes) => {
    switch (type) {
      case "SUCCESS":
        return "#22bb33"
      case "FAILED":
        return "#bb2124"
      case "INFO":
        return "#5bc0de"
      case "LOADING":
        return "#aaaaaa"
      default:
        return "#5bc0de"
    }
  }

  const showAlert = (
    type: AlertModalTypes,
    title: string,
    description?: string
  ) => {
    setAlertType(type)
    Notifier.showNotification({
      title: title,
      description: description,
      Component: CustomComponent,
      duration: type === "LOADING" ? 0 : 3000,
      swipeEnabled: type !== "LOADING",
      hideOnPress: type !== "LOADING",
      componentProps: {
        type,
        color: getColor(type),
      },
      queueMode: "reset",
    })
  }

  const hideAlert = () => {
    setAlertType(null)
    Notifier.hideNotification()
  }

  return (
    <AlertModalContext.Provider
      value={{
        showAlert,
        hideAlert,
      }}
    >
      <View style={{ flex: 1 }}>
        {alertType === "LOADING" && (
          <TouchableWithoutFeedback>
            <View style={styles.overlay} />
          </TouchableWithoutFeedback>
        )}
        {children}
      </View>
    </AlertModalContext.Provider>
  )
}

export const useAlertModal = (): AlertModalContextProps => {
  const context = useContext(AlertModalContext)
  if (!context) {
    throw new Error("useAlertModal must be used within a AlertModalProvider")
  }
  return context
}

const CustomComponent = ({
  type,
  title,
  description,
  color,
}: {
  type: AlertModalTypes
  title: string
  description: string
  color: string
}) => {
  const typeSource = (type: AlertModalTypes) => {
    switch (type) {
      case "SUCCESS":
        return require("~/assets/json/success.json")
      case "FAILED":
        return require("~/assets/json/cancelled.json")
      case "INFO":
        return require("~/assets/json/info.json")
      case "LOADING":
        return require("~/assets/json/loading_nice.json")
      default:
        return require("~/assets/json/info.json")
    }
  }

  return (
    <SafeAreaView
      style={{
        backgroundColor: color,
        flex: 1,
        alignItems: "center",
      }}
    >
      <View style={styles.container}>
        <LottieView
          key={Date.now()}
          autoPlay
          loop={type === "LOADING"}
          style={styles.lottie}
          source={typeSource(type)}
          speed={type === "FAILED" ? 0.5 : 1}
        />
        <View style={{ marginLeft: 10 }}>
          {title && <Text style={styles.title}>{title}</Text>}
          {description && <Text style={styles.description}>{description}</Text>}
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  lottie: {
    width: 50,
    height: 50,
  },
  title: { color: "white", fontWeight: "bold" },
  description: { color: "white" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1,
  },
})
