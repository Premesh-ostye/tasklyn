import { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../../src/lib/firebase';
import { userDoc } from '../../src/lib/paths';
import { UserRole } from '../../src/types/schema';

export default function SignupScreen() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password) {
      Alert.alert('Missing info', 'Please enter an email and password.');
      return;
    }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (displayName) {
        await updateProfile(cred.user, { displayName });
      }
      await setDoc(
        userDoc(db, cred.user.uid),
        {
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: displayName || cred.user.email,
          role: UserRole.Manager,
          isDisabled: false,
          createdAt: serverTimestamp(),
        },
        { merge: true },
      );
      router.replace('/role-router');
    } catch (err: any) {
      Alert.alert('Sign up failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>
      <TextInput
        style={styles.input}
        placeholder="Display name (optional)"
        value={displayName}
        onChangeText={setDisplayName}
      />
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        secureTextEntry
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
      />
      <Button
        title={loading ? 'Signing up...' : 'Create account'}
        onPress={handleSignup}
        disabled={!!loading}
      />
      <Text style={styles.smallText}>
        Already registered? <Link href="/auth/login">Log in</Link>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  smallText: {
    marginTop: 12,
    color: '#444',
  },
});
