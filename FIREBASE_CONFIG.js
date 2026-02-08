/**
 * ============================================
 * FIREBASE CONFIGURATION - REACT NATIVE
 * ============================================
 * 
 * This is your Firebase Web/Mobile SDK config
 * Use this in your React Native mobile app
 * 
 * Project: media-e0b78
 */

export const firebaseConfig = {
  apiKey: "AIzaSyBYHnOvdiKRGQ0rwddBsWYXTOzwsCLkNfQ",
  authDomain: "media-e0b78.firebaseapp.com",
  projectId: "media-e0b78",
  storageBucket: "media-e0b78.firebasestorage.app",
  messagingSenderId: "783773134798",
  appId: "1:783773134798:web:316d10a72f28185ea0059f",
  measurementId: "G-HCGGT2QNF8"
}

/**
 * HOW TO USE IN REACT NATIVE:
 * 
 * 1. Install Firebase:
 *    npm install @react-native-firebase/app
 *    npm install @react-native-firebase/auth
 * 
 * 2. Install Google Sign-In:
 *    npm install @react-native-google-signin/google-signin
 * 
 * 3. Initialize in your app:
 *    import { initializeApp } from '@react-native-firebase/app'
 *    import auth from '@react-native-firebase/auth'
 * 
 *    const app = initializeApp(firebaseConfig)
 * 
 * 4. Use Google Sign-In:
 *    import { GoogleSignin } from '@react-native-google-signin/google-signin'
 * 
 *    GoogleSignin.configure({
 *      webClientId: '783773134798-xxxxxxxxxx.apps.googleusercontent.com'
 *    })
 * 
 *    // Sign in with Google
 *    const { idToken } = await GoogleSignin.signIn()
 *    const googleCredential = auth.GoogleAuthProvider.credential(idToken)
 *    await auth().signInWithCredential(googleCredential)
 * 
 * 5. Send Firebase token to your backend:
 *    const firebaseToken = await auth().currentUser.getIdToken()
 *    
 *    const response = await axios.post(`${API_URL}/api/auth/google`, {
 *      firebaseToken
 *    })
 * 
 *    // Your backend validates token and returns JWT
 *    const { token, user } = response.data
 */

/**
 * IMPORTANT NOTES:
 * 
 * - This config is SAFE to use in mobile apps (client-side)
 * - The apiKey is public - it's meant to be in the app
 * - For backend (Node.js), you need Firebase Admin SDK
 * - Get Admin SDK from: Firebase Console → Project Settings → Service Accounts
 * 
 * BACKEND NEEDS (different credentials):
 * - FIREBASE_PROJECT_ID
 * - FIREBASE_CLIENT_EMAIL
 * - FIREBASE_PRIVATE_KEY
 */
