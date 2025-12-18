import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, FlatList, StyleSheet, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../../src/providers/AuthProvider';
import { db } from '../../src/lib/firebase';
import { membersCollectionGroup, venueJobsCollection } from '../../src/lib/paths';
import { Job, MemberStatus } from '../../src/types/schema';

type DisplayJob = Job & { venueId: string };

export default function ContractorHome() {
  const { authUser, signOut } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<DisplayJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authUser) {
      router.replace('/auth/login');
      return;
    }

    const load = async () => {
      setLoading(true);
      const membershipSnap = await getDocs(
        query(
          membersCollectionGroup(db),
          where('userId', '==', authUser.uid),
          where('status', '==', MemberStatus.Active),
        ),
      );
      const venueIds = membershipSnap.docs
        .map((m) => m.ref.parent.parent?.id)
        .filter(Boolean) as string[];

      const jobMap = new Map<string, DisplayJob>();
      for (const venueId of venueIds) {
        const assignedSnap = await getDocs(
          query(venueJobsCollection(db, venueId), where('assignedTo', '==', authUser.uid)),
        );
        assignedSnap.forEach((docSnap) => {
          const data = docSnap.data() as Job;
          jobMap.set(docSnap.id, { ...data, id: docSnap.id, venueId });
        });

        const broadcastSnap = await getDocs(
          query(venueJobsCollection(db, venueId), where('broadcastToPool', '==', true)),
        );
        broadcastSnap.forEach((docSnap) => {
          const data = docSnap.data() as Job;
          jobMap.set(docSnap.id, { ...data, id: docSnap.id, venueId });
        });
      }
      setJobs(Array.from(jobMap.values()));
      setLoading(false);
    };

    load();
  }, [authUser, router]);

  if (!authUser) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Contractor Home</Text>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => `${item.venueId}-${item.id}`}
          ListEmptyComponent={<Text>No available jobs.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.muted}>Venue: {item.venueId}</Text>
              <Text>Status: {item.status}</Text>
              <Link href={`/contractor/venue/${item.venueId}/job/${item.id}`} asChild>
                <Button title="View" />
              </Link>
            </View>
          )}
        />
      )}
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
  header: {
    fontSize: 24,
    fontWeight: '700',
  },
  card: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  muted: {
    color: '#666',
  },
});
