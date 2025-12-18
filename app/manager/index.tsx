import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, FlatList, StyleSheet, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../src/lib/firebase';
import { membersCollectionGroup, venueDoc } from '../../src/lib/paths';
import { MemberStatus, Venue } from '../../src/types/schema';
import { useAuth } from '../../src/providers/AuthProvider';

export default function ManagerHome() {
  const { authUser, signOut } = useAuth();
  const router = useRouter();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authUser) {
      router.replace('/auth/login');
      return;
    }
    const load = async () => {
      setLoading(true);
      const snap = await getDocs(
        query(
          membersCollectionGroup(db),
          where('userId', '==', authUser.uid),
          where('status', '==', MemberStatus.Active),
        ),
      );
      const venueRefs = snap.docs
        .map((docSnap) => docSnap.ref.parent.parent)
        .filter(Boolean) as any[];

      const venueDocs = await Promise.all(
        venueRefs.map((ref) =>
          getDoc(venueDoc(db, (ref as any).id)).then((v) => {
            const data = v.data() as Venue | undefined;
            return data ? { ...data, id: v.id } : undefined;
          }),
        ),
      );
      setVenues(venueDocs.filter(Boolean) as Venue[]);
      setLoading(false);
    };
    load();
  }, [authUser, router]);

  if (!authUser) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Manager Home</Text>
      <Text style={styles.sub}>Venues where you are active</Text>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={venues}
          keyExtractor={(item, index) => item.id ?? `venue-${index}`}
          ListEmptyComponent={<Text>No venues yet.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              {item.location ? <Text style={styles.muted}>{item.location}</Text> : null}
              <View style={styles.row}>
                <Link href={`/manager/venue/${item.id}/jobs`} asChild>
                  <Button title="Jobs" />
                </Link>
                <Link href={`/manager/venue/${item.id}/invite-contractor`} asChild>
                  <Button title="Invite contractor" />
                </Link>
              </View>
            </View>
          )}
        />
      )}
      <View style={styles.row}>
        <Link href="/manager/create-venue" asChild>
          <Button title="Create venue" />
        </Link>
        <Button title="Sign out" onPress={signOut} />
      </View>
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
  sub: {
    color: '#555',
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 8,
  },
  muted: {
    color: '#666',
  },
});
