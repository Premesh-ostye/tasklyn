import { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { addDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { venuesCollection, venueMemberDoc } from '../../src/lib/paths';
import { db } from '../../src/lib/firebase';
import { useAuth } from '../../src/providers/AuthProvider';
import { MemberStatus, UserRole, VenueMember } from '../../src/types/schema';

export default function CreateVenue() {
  const router = useRouter();
  const { authUser } = useAuth();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!authUser) {
      router.replace('/auth/login');
      return;
    }
    if (!name) {
      Alert.alert('Missing name', 'Please add a venue name.');
      return;
    }
    setSaving(true);
    try {
      const venueRef = await addDoc(venuesCollection(db), {
        name,
        location,
        createdBy: authUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const member: VenueMember = {
        role: UserRole.Manager,
        status: MemberStatus.Active,
        userId: authUser.uid,
        createdAt: serverTimestamp(),
      };

      await setDoc(venueMemberDoc(db, venueRef.id, authUser.uid), member);
      router.replace('/manager');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a venue</Text>
      <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
      <TextInput
        style={styles.input}
        placeholder="Location (optional)"
        value={location}
        onChangeText={setLocation}
      />
      <Button
        title={saving ? 'Saving...' : 'Save venue'}
        onPress={handleSave}
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
