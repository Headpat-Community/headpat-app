import React, { useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Modal,
  PanResponder,
  TouchableWithoutFeedback,
} from 'react-native'
import LottieView from 'lottie-react-native'
import { useColorScheme } from '~/lib/useColorScheme'
import { AlertModalTypes } from '~/components/contexts/AlertModalProvider'

interface SuccessModalProps {
  isVisible: boolean
  onClose: () => void
  text: string
  type?: AlertModalTypes
}

export default function AlertModal({
  isVisible,
  onClose,
  text = 'Success!',
  type,
}: SuccessModalProps) {
  const { isDarkColorScheme } = useColorScheme()
  const themeInverted = isDarkColorScheme ? 'black' : 'white'

  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return gestureState.dy > 20
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 100) {
          onClose()
        }
      },
    })
  ).current

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000) // Hide modal after 4 seconds
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  const typeSource = () => {
    switch (type) {
      case 'SUCCESS':
        return require('~/assets/json/success.json')
      case 'FAILED':
        return require('~/assets/json/cancelled.json')
      default:
        return require('~/assets/json/success.json')
    }
  }

  return (
    <Modal visible={isVisible} transparent={true} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} {...panResponder.panHandlers}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.container,
                { backgroundColor: isDarkColorScheme ? '#CCCCCC' : '#333333' },
              ]}
            >
              <LottieView
                autoPlay
                loop={false}
                style={styles.lottie}
                source={typeSource()}
                speed={type === 'FAILED' ? 0.5 : 1}
              />
              <Text style={[styles.text, { color: themeInverted }]}>
                {text}
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    alignItems: 'center',
    padding: 20,
    margin: 20,
    borderRadius: 30,
  },
  lottie: {
    width: 100,
    height: 100,
  },
  text: {
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
    fontSize: 18,
    fontWeight: 'bold',
  },
})
