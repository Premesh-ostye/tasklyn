import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/providers/AuthProvider';

export default function Index() {
  const router = useRouter();
  const { authUser, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (authUser) {
      router.replace('/role-router');
    } else {
      router.replace('/auth/login');
    }
  }, [authUser, loading, router]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator />
    </View>
  );
}
