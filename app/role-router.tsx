import { useEffect } from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/providers/AuthProvider';
import { UserRole } from '../src/types/schema';

export default function RoleRouter() {
  const router = useRouter();
  const { authUser, userProfile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!authUser) {
      router.replace('/auth/login');
      return;
    }
    if (!userProfile) return;

    switch (userProfile.role) {
      case UserRole.SystemAdmin:
        router.replace('/admin');
        break;
      case UserRole.Contractor:
        router.replace('/contractor');
        break;
      case UserRole.Manager:
      default:
        router.replace('/manager');
        break;
    }
  }, [authUser, loading, router, userProfile]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      <ActivityIndicator />
      <Text>Routing by role...</Text>
    </View>
  );
}
