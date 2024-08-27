import React, { createContext, useState, useContext } from 'react'
import AlertModal from '~/components/views/AlertModal'
import LoadingModal from '~/components/views/LoadingModal'

interface AlertModalContextProps {
  showAlertModal: (type: AlertModalTypes, text: string) => void
  hideAlertModal: () => void
  showLoadingModal: () => void
  hideLoadingModal: () => void
}

export type AlertModalTypes = 'SUCCESS' | 'FAILED'

const AlertModalContext = createContext<AlertModalContextProps | undefined>(
  undefined
)

export const AlertModalProvider = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [text, setText] = useState('Success!')
  const [type, setType] = useState<AlertModalTypes>('SUCCESS')

  const showAlertModal = (type: AlertModalTypes, text: string) => {
    hideLoadingModal()
    setText(text)
    setType(type)
    setIsVisible(true)
  }

  const showLoadingModal = () => {
    hideAlertModal()
    setIsLoading(true)
  }

  const hideAlertModal = () => {
    setIsVisible(false)
  }

  const hideLoadingModal = () => {
    setIsLoading(false)
  }

  return (
    <AlertModalContext.Provider
      value={{
        showAlertModal,
        hideAlertModal,
        showLoadingModal,
        hideLoadingModal,
      }}
    >
      {children}
      <AlertModal
        isVisible={isVisible}
        onClose={hideAlertModal}
        text={text}
        type={type}
      />
      <LoadingModal isVisible={isLoading} onClose={hideLoadingModal} />
    </AlertModalContext.Provider>
  )
}

export const useAlertModal = (): AlertModalContextProps => {
  const context = useContext(AlertModalContext)
  if (!context) {
    throw new Error('useAlertModal must be used within a AlertModalProvider')
  }
  return context
}
