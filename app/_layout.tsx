import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/providers/AuthProvider';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="dark" />
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="role-router" options={{ headerShown: false }} />
            <Stack.Screen name="auth/login" options={{ title: 'Login' }} />
            <Stack.Screen name="auth/signup" options={{ title: 'Sign Up' }} />
            <Stack.Screen name="admin/index" options={{ title: 'Admin' }} />
            <Stack.Screen name="manager/index" options={{ title: 'Manager' }} />
            <Stack.Screen name="manager/create-venue" options={{ title: 'Create Venue' }} />
            <Stack.Screen name="manager/venue/[venueId]/jobs" options={{ title: 'Jobs' }} />
            <Stack.Screen
              name="manager/venue/[venueId]/create-job"
              options={{ title: 'Create Job' }}
            />
            <Stack.Screen
              name="manager/venue/[venueId]/invite-contractor"
              options={{ title: 'Invite Contractor' }}
            />
            <Stack.Screen name="contractor/index" options={{ title: 'Contractor' }} />
            <Stack.Screen
              name="contractor/venue/[venueId]/job/[jobId]"
              options={{ title: 'Job Detail' }}
            />
          </Stack>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
