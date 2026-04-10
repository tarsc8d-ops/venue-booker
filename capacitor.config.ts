import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.venbook.app',
  appName: 'VenBook',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    GoogleAuth: {
      // Web client ID (same one already in Netlify env vars)
      clientId: '496348736505-8p6p3mpnebdpe32it4e1fvc7hvv96alc.apps.googleusercontent.com',
      // iOS client ID — create this in Google Cloud Console (see iOS_SETUP.md)
      iosClientId: 'REPLACE_WITH_IOS_CLIENT_ID',
      scopes: [
        'email',
        'profile',
        'https://www.googleapis.com/auth/gmail.send',
      ],
      serverClientId: '496348736505-8p6p3mpnebdpe32it4e1fvc7hvv96alc.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
    StatusBar: {
      style: 'Default',
      backgroundColor: '#FFFFFF',
    },
  },
}

export default config
