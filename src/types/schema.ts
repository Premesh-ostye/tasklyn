import { FieldValue, Timestamp } from 'firebase/firestore';

export enum UserRole {
  SystemAdmin = 'system_admin',
  Manager = 'manager',
  Contractor = 'contractor',
}

export enum MemberStatus {
  Pending = 'pending',
  Active = 'active',
  Inactive = 'inactive',
}

export enum JobStatus {
  Draft = 'draft',
  Open = 'open',
  Assigned = 'assigned',
  InProgress = 'in_progress',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

export enum JobPriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

export enum InviteStatus {
  Sent = 'sent',
  Accepted = 'accepted',
  Declined = 'declined',
  Expired = 'expired',
}

export enum UpdateType {
  Comment = 'comment',
  Photo = 'photo',
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  isDisabled: boolean;
  createdAt?: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;
}

export interface Venue {
  id?: string;
  name: string;
  location?: string;
  createdBy: string;
  createdAt?: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;
}

export interface VenueMember {
  userId: string;
  role: UserRole;
  status: MemberStatus;
  createdAt?: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;
}

export interface VenueInvite {
  id?: string;
  role: UserRole;
  status: InviteStatus;
  createdBy: string;
  createdAt?: Timestamp | FieldValue;
  expiresAt?: Timestamp | FieldValue | Date;
  tokenHash: string;
  email?: string;
}

export interface Job {
  id?: string;
  title: string;
  description?: string;
  priority: JobPriority;
  status: JobStatus;
  createdBy: string;
  broadcastToPool: boolean;
  assignedTo?: string | null;
  createdAt?: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;
}

export interface JobUpdate {
  id?: string;
  type: UpdateType;
  message?: string;
  photoUrl?: string;
  createdBy: string;
  createdAt?: Timestamp | FieldValue;
}
