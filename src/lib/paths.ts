import {
  CollectionReference,
  DocumentReference,
  collection,
  collectionGroup,
  doc,
  Firestore,
} from 'firebase/firestore';
import { Job, JobUpdate, User, Venue, VenueInvite, VenueMember } from '../types/schema';

export const userDoc = (db: Firestore, userId: string): DocumentReference<User> =>
  doc(db, 'users', userId) as DocumentReference<User>;

export const venuesCollection = (db: Firestore): CollectionReference<Venue> =>
  collection(db, 'venues') as CollectionReference<Venue>;

export const venueDoc = (db: Firestore, venueId: string): DocumentReference<Venue> =>
  doc(db, 'venues', venueId) as DocumentReference<Venue>;

export const venueMembersCollection = (
  db: Firestore,
  venueId: string,
): CollectionReference<VenueMember> =>
  collection(db, 'venues', venueId, 'members') as CollectionReference<VenueMember>;

export const venueMemberDoc = (
  db: Firestore,
  venueId: string,
  userId: string,
): DocumentReference<VenueMember> =>
  doc(db, 'venues', venueId, 'members', userId) as DocumentReference<VenueMember>;

export const venueInvitesCollection = (
  db: Firestore,
  venueId: string,
): CollectionReference<VenueInvite> =>
  collection(db, 'venues', venueId, 'invites') as CollectionReference<VenueInvite>;

export const venueInviteDoc = (
  db: Firestore,
  venueId: string,
  inviteId: string,
): DocumentReference<VenueInvite> =>
  doc(db, 'venues', venueId, 'invites', inviteId) as DocumentReference<VenueInvite>;

export const venueJobsCollection = (db: Firestore, venueId: string): CollectionReference<Job> =>
  collection(db, 'venues', venueId, 'jobs') as CollectionReference<Job>;

export const venueJobDoc = (
  db: Firestore,
  venueId: string,
  jobId: string,
): DocumentReference<Job> =>
  doc(db, 'venues', venueId, 'jobs', jobId) as DocumentReference<Job>;

export const jobUpdatesCollection = (
  db: Firestore,
  venueId: string,
  jobId: string,
): CollectionReference<JobUpdate> =>
  collection(db, 'venues', venueId, 'jobs', jobId, 'updates') as CollectionReference<JobUpdate>;

export const jobUpdateDoc = (
  db: Firestore,
  venueId: string,
  jobId: string,
  updateId: string,
): DocumentReference<JobUpdate> =>
  doc(db, 'venues', venueId, 'jobs', jobId, 'updates', updateId) as DocumentReference<JobUpdate>;

export const membersCollectionGroup = (db: Firestore) =>
  collectionGroup(db, 'members') as CollectionReference<VenueMember>;

export const jobsCollectionGroup = (db: Firestore) =>
  collectionGroup(db, 'jobs') as CollectionReference<Job>;
