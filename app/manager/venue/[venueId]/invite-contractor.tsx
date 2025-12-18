import { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../../../src/providers/AuthProvider';
import { db } from '../../../../src/lib/firebase';
import { venueInvitesCollection } from '../../../../src/lib/paths';
import { InviteStatus, UserRole } from '../../../../src/types/schema';

export default function InviteContractor() {
  const router = useRouter();
  const { venueId } = useLocalSearchParams<{ venueId: string }>();
  const { authUser } = useAuth();
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);

  const handleInvite = async () => {
    if (!venueId || !authUser) {
      router.replace('/auth/login');
      return;
    }
    setSaving(true);
    try {
      await addDoc(venueInvitesCollection(db, venueId), {
        role: UserRole.Contractor,
        status: InviteStatus.Sent,
        createdBy: authUser.uid,
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        tokenHash: 'placeholder-token-hash', // Replace with secure hash when adding invite redemption
        email,
      });
      Alert.alert('Invite created');
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Invite contractor</Text>
      <TextInput
        style={styles.input}
        placeholder="Contractor email (optional)"
        value={email}
        onChangeText={setEmail}
      />
      <Button
        title={saving ? 'Sending...' : 'Create invite'}
        onPress={handleInvite}
        disabled={!!saving}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
});
