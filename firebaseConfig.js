import firebase from '@react-native-firebase/app'

// Initialize Firebase
const firebaseConfig = {
  projectId: 'headpat-app',
  messagingSenderId: '968293497666',
  appId: '1:968293497666:android:41484aba6708df83d7a6db',
}

let app
if (firebase.apps.length === 0) {
  app = firebase.initializeApp(firebaseConfig)
} else {
  app = firebase.app() // if already initialized, use that one
}

// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase
