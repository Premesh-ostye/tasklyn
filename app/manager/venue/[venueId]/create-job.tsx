import { useState } from 'react';
import { Alert, Button, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../../../src/providers/AuthProvider';
import { db } from '../../../../src/lib/firebase';
import { venueJobsCollection } from '../../../../src/lib/paths';
import { JobPriority, JobStatus } from '../../../../src/types/schema';

export default function CreateJob() {
  const router = useRouter();
  const { venueId } = useLocalSearchParams<{ venueId: string }>();
  const { authUser } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<JobPriority>(JobPriority.Medium);
  const [status, setStatus] = useState<JobStatus>(JobStatus.Open);
  const [broadcastToPool, setBroadcastToPool] = useState(true);
  const [assignedTo, setAssignedTo] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!venueId || !authUser) {
      router.replace('/auth/login');
      return;
    }
    if (!title) {
      Alert.alert('Missing title', 'Please add a job title.');
      return;
    }
    setSaving(true);
    try {
      await addDoc(venueJobsCollection(db, venueId), {
        title,
        description,
        priority,
        status,
        createdBy: authUser.uid,
        broadcastToPool,
        assignedTo: assignedTo || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const renderSelector = <T extends string>(
    current: T,
    values: T[],
    onSelect: (value: T) => void,
  ) => (
    <View style={styles.chipRow}>
      {values.map((value) => (
        <Text
          key={value}
          onPress={() => onSelect(value)}
          style={[styles.chip, current === value && styles.chipActive]}
        >
          {value}
        </Text>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create job</Text>
      <TextInput style={styles.input} placeholder="Title" value={title} onChangeText={setTitle} />
      <TextInput
        style={[styles.input, { height: 90 }]}
        placeholder="Description"
        multiline
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.label}>Priority</Text>
      {renderSelector<JobPriority>(priority, Object.values(JobPriority), setPriority)}

      <Text style={styles.label}>Status</Text>
      {renderSelector<JobStatus>(status, Object.values(JobStatus), setStatus)}

      <View style={styles.toggleRow}>
        <Text>Broadcast to pool</Text>
        <Switch value={broadcastToPool} onValueChange={setBroadcastToPool} />
      </View>
      <TextInput
        style={styles.input}
        placeholder="Assign to userId (optional)"
        value={assignedTo}
        onChangeText={setAssignedTo}
      />

      <Button
        title={saving ? 'Saving...' : 'Create job'}
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
  label: {
    marginTop: 8,
    color: '#333',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
  },
  chipActive: {
    backgroundColor: '#222',
    color: '#fff',
    borderColor: '#222',
  },
});
