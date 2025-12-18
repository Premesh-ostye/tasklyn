import { useEffect, useState } from 'react';
import { Alert, Button, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, getDoc, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../../../../src/providers/AuthProvider';
import { db } from '../../../../../src/lib/firebase';
import { jobUpdatesCollection, venueJobDoc } from '../../../../../src/lib/paths';
import { Job, JobUpdate, UpdateType } from '../../../../../src/types/schema';

type DisplayUpdate = JobUpdate;

export default function ContractorJobDetail() {
  const router = useRouter();
  const { venueId, jobId } = useLocalSearchParams<{ venueId: string; jobId: string }>();
  const { authUser } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [updates, setUpdates] = useState<DisplayUpdate[]>([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authUser) {
      router.replace('/auth/login');
      return;
    }
    if (!venueId || !jobId) return;
    const load = async () => {
      setLoading(true);
      const jobSnap = await getDoc(venueJobDoc(db, venueId, jobId));
      const jobData = jobSnap.data() as Job | undefined;
      setJob(jobData ? { ...jobData, id: jobSnap.id } : null);

      const updateSnap = await getDocs(
        query(jobUpdatesCollection(db, venueId, jobId), orderBy('createdAt', 'desc')),
      );
      const list =
        updateSnap.docs.map((d) => ({ ...(d.data() as JobUpdate), id: d.id })) ??
        ([] as JobUpdate[]);
      setUpdates(list);
      setLoading(false);
    };
    load();
  }, [authUser, jobId, router, venueId]);

  const handleComment = async () => {
    if (!authUser || !venueId || !jobId) return;
    if (!comment) {
      Alert.alert('Add a comment');
      return;
    }
    await addDoc(jobUpdatesCollection(db, venueId, jobId), {
      type: UpdateType.Comment,
      message: comment,
      createdBy: authUser.uid,
      createdAt: serverTimestamp(),
    });
    setComment('');
    // refresh updates
    const updateSnap = await getDocs(
      query(jobUpdatesCollection(db, venueId, jobId), orderBy('createdAt', 'desc')),
    );
    const list =
      updateSnap.docs.map((d) => ({ ...(d.data() as JobUpdate), id: d.id })) ??
      ([] as JobUpdate[]);
    setUpdates(list);
  };

  if (!job) {
    return (
      <View style={styles.container}>
        {loading ? <Text>Loading...</Text> : <Text>Job not found.</Text>}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{job.title}</Text>
      <Text style={styles.muted}>Priority: {job.priority}</Text>
      <Text>Status: {job.status}</Text>
      <Text style={styles.muted}>
        {job.broadcastToPool ? 'Broadcasted' : job.assignedTo ? `Assigned to ${job.assignedTo}` : 'Unassigned'}
      </Text>
      <Text style={{ marginVertical: 8 }}>{job.description}</Text>

      <Text style={styles.section}>Updates</Text>
      <FlatList
        data={updates}
        keyExtractor={(item, index) => item.id ?? `update-${index}`}
        ListEmptyComponent={<Text>No updates yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.updateCard}>
            <Text style={styles.muted}>{item.type}</Text>
            {item.message ? <Text>{item.message}</Text> : null}
          </View>
        )}
      />

      <Text style={styles.section}>Add comment</Text>
      <TextInput
        style={styles.input}
        placeholder="Add a quick update"
        value={comment}
        onChangeText={setComment}
      />
      <Button title="Post update" onPress={handleComment} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  muted: {
    color: '#666',
  },
  section: {
    fontWeight: '700',
    marginTop: 8,
  },
  updateCard: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f2f2f2',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
});
