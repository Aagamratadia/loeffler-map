import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db-helper';
import { verifySession } from '@/lib/auth';

// GET /api/admin/users — list all users
// POST /api/admin/users — add a new whitelisted user
export async function GET() {
  const session = await verifySession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { db } = await connectToDatabase();
  const rawUsers = await db
    .collection('users')
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  const users = rawUsers.map(({ password, otp, otpExpiry, ...u }) => ({
    ...u,
    hasPassword: !!password,
  }));

  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  const session = await verifySession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { phoneNumber, role } = await request.json();

  if (!phoneNumber) {
    return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
  }

  const validRole = role === 'admin' ? 'admin' : 'user';
  const normalizedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;

  const { db } = await connectToDatabase();
  const usersCollection = db.collection('users');

  const existing = await usersCollection.findOne({ phoneNumber: normalizedNumber });
  if (existing) {
    return NextResponse.json({ error: 'Phone number already whitelisted' }, { status: 409 });
  }

  const result = await usersCollection.insertOne({
    phoneNumber: normalizedNumber,
    role: validRole,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return NextResponse.json({ message: 'User added', id: result.insertedId }, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await verifySession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { phoneNumber } = await request.json();
  if (!phoneNumber) {
    return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
  }

  const { db } = await connectToDatabase();
  const result = await db.collection('users').deleteOne({ phoneNumber });

  if (result.deletedCount === 0) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ message: 'User removed' });
}
