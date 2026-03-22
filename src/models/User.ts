import { ObjectId } from 'mongodb';

export type UserRole = 'admin' | 'user';

export interface User {
  _id?: ObjectId;
  phoneNumber: string; // E.164 format preferably (e.g., +919876543210)
  role: UserRole;
  otp?: string;
  otpExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}
