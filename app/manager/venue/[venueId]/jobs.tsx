import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, FlatList, StyleSheet, Text, View } from 'react-native';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { getDocs, orderBy, query } from 'firebase/firestore';
import { useAuth } from '../../../../src/providers/AuthProvider';
import { db } from '../../../../src/lib/firebase';
import { venueJobsCollection } from '../../../../src/lib/paths';
import { Job } from '../../../../src/types/schema';

export default function VenueJobs() {
  const { authUser } = useAuth();
  const router = useRouter();
  const { venueId } = useLocalSearchParams<{ venueId: string }>();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authUser) {
      router.replace('/auth/login');
      return;
    }
    if (!venueId) return;
    const load = async () => {
      setLoading(true);
      const snap = await getDocs(
        query(venueJobsCollection(db, venueId), orderBy('createdAt', 'desc')),
      );
      const results =
        snap.docs.map((d) => ({ ...(d.data() as Job), id: d.id })) ??
        ([] as Job[]);
      setJobs(results);
      setLoading(false);
    };
    load();
  }, [authUser, router, venueId]);

  if (!venueId) {
    return (
      <View style={styles.container}>
        <Text>Missing venue id.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.title}>Jobs</Text>
        <Link href={`/manager/venue/${venueId}/create-job`} asChild>
          <Button title="New job" />
        </Link>
      </View>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item, index) => item.id ?? `job-${index}`}
          ListEmptyComponent={<Text>No jobs yet.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.muted}>Priority: {item.priority}</Text>
              <Text>Status: {item.status}</Text>
              <Text style={styles.muted}>
                {item.broadcastToPool
                  ? 'Broadcast to pool'
                  : item.assignedTo
                    ? `Assigned to ${item.assignedTo}`
                    : 'Unassigned'}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
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
