import firebase from '@react-native-firebase/app'

// Initialize Firebase
const firebaseConfig = {
  projectId: 'headpat-app',
  messagingSenderId: '968293497666',
  appId: '1:968293497666:android:41484aba6708df83d7a6db',
}

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig).then()
} else {
  firebase.getApp() // if already initialized, use that one
}
