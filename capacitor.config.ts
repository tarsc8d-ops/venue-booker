import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  // App bundle identifier — must match what you set in Xcode / Apple Dev portal
  appId: 'com.venbook.app',
  appName: 'VenBook',
  // Points Capacitor at your built web assets
  webDir: 'dist',
  // Server config: on device, load from the bundled assets (not a remote URL)
  server: {
    androidScheme: 'https',
    // Remove the hostname line below when building for production.
    // During dev you can point at your Netlify URL to use live data:
    // hostname: 'stellular-dango-12f3f7.netlify.app',
    // iosScheme: 'https',
  },
  plugins: {
    GoogleAuth: {
      // Web client ID (same one already in Netlify env vars)
      clientId: '496348736505-8p6p3mpnebdpe32it4e1fvc7hvv96alc.apps.googleusercontent.com',
      // iOS client ID — you'll create this in Google Cloud Console (see iOS_SETUP.md)
      // Replace the placeholder below after creating the iOS OAuth client
      iosClientId: 'REPLACE_WITH_IOS_CLIENT_ID',
      scopes: [
        'email',
        'profile',
        'https://www.googleapis.com/auth/gmail.send',
      ],
      serverClientId: '496348736505-8p6b3mpnebdpe32it4e1fvc7hvv96alc.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
    StatusBar: {
      style: 'Default',
      backgroundColor: '#FFFFFF',
    },
  },
}

export default config
