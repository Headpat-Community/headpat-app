import React from 'react'
import { View, Text, StyleSheet, Modal, PanResponder } from 'react-native'
import LottieView from 'lottie-react-native'
import { useColorScheme } from '~/lib/useColorScheme'

interface SuccessModalProps {
  isVisible: boolean
  onClose: () => void
  text?: string
}

export default function LoadingModal({
  isVisible,
  onClose,
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

  return (
    <Modal visible={isVisible} transparent={true} onRequestClose={onClose}>
      <View style={styles.backdrop} {...panResponder.panHandlers}>
        <View
          style={[
            styles.container,
            { backgroundColor: isDarkColorScheme ? '#CCCCCC' : '#333333' },
          ]}
        >
          <LottieView
            autoPlay
            loop={true}
            style={styles.lottie}
            source={require('~/assets/json/loading.json')}
            speed={0.5}
          />
          <Text style={[styles.text, { color: themeInverted }]}>
            Please wait...
          </Text>
        </View>
      </View>
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
