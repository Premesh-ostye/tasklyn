import { useEffect, useState } from 'react';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { addDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../src/providers/AuthProvider';
import { db } from '../../src/lib/firebase';
import {
  venueMemberDoc,
  venuesCollection,
  venueJobsCollection,
  userDoc,
} from '../../src/lib/paths';
import { JobPriority, JobStatus, MemberStatus, UserRole, VenueMember } from '../../src/types/schema';

export default function AdminHome() {
  const { authUser, userProfile, signOut } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!authUser) {
      router.replace('/auth/login');
    }
  }, [authUser, router]);

  const updateRole = async (role: UserRole) => {
    if (!authUser) return;
    setBusy(true);
    try {
      await updateDoc(userDoc(db, authUser.uid), { role, updatedAt: serverTimestamp() });
      Alert.alert('Role updated', `You are now ${role}`);
    } catch (err: any) {
      Alert.alert('Failed', err.message);
    } finally {
      setBusy(false);
    }
  };

  const seedData = async () => {
    if (!authUser) return;
    setBusy(true);
    try {
      const venueRef = await addDoc(venuesCollection(db), {
        name: 'Sample Venue',
        createdBy: authUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const managerMember: VenueMember = {
        userId: authUser.uid,
        role: UserRole.Manager,
        status: MemberStatus.Active,
        createdAt: serverTimestamp(),
      };
      await setDoc(venueMemberDoc(db, venueRef.id, authUser.uid), managerMember);

      const contractorId = 'sample-contractor';
      const contractorMember: VenueMember = {
        userId: contractorId,
        role: UserRole.Contractor,
        status: MemberStatus.Active,
        createdAt: serverTimestamp(),
      };
      await setDoc(venueMemberDoc(db, venueRef.id, contractorId), contractorMember);

      await addDoc(venueJobsCollection(db, venueRef.id), {
        title: 'Sample job',
        description: 'Seeded job for testing contractor flow.',
        priority: JobPriority.Medium,
        status: JobStatus.Open,
        createdBy: authUser.uid,
        broadcastToPool: true,
        assignedTo: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      Alert.alert('Seeded sample data');
    } catch (err: any) {
      Alert.alert('Seed failed', err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!userProfile || userProfile.role !== UserRole.SystemAdmin) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Admins only</Text>
        <Button title="Back" onPress={() => router.replace('/role-router')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>System admin tools</Text>
      <Text style={styles.muted}>Signed in as {authUser?.email}</Text>
      <View style={styles.row}>
        <Button
          title="Become admin"
          onPress={() => updateRole(UserRole.SystemAdmin)}
          disabled={!!busy}
        />
        <Button
          title="Become manager"
          onPress={() => updateRole(UserRole.Manager)}
          disabled={!!busy}
        />
        <Button
          title="Become contractor"
          onPress={() => updateRole(UserRole.Contractor)}
          disabled={!!busy}
        />
      </View>
      <Button title="Seed sample venue + job" onPress={seedData} disabled={!!busy} />
      <View style={styles.row}>
        <Button title="Go to manager" onPress={() => router.replace('/manager')} />
        <Button title="Go to contractor" onPress={() => router.replace('/contractor')} />
      </View>
      <Button title="Sign out" onPress={signOut} />
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
  muted: {
    color: '#666',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
});
