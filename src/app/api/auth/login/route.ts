import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db-helper';
import { createSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { phoneNumber, password } = await request.json();

    if (!phoneNumber || !password) {
      return NextResponse.json({ error: 'Phone number and password are required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');

    const normalizedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    const baseNumber = phoneNumber.startsWith('+91') ? phoneNumber.substring(3) : phoneNumber.replace(/^\+/, '');

    const user = await usersCollection.findOne({
      $or: [
        { phoneNumber: normalizedNumber },
        { phoneNumber: baseNumber },
      ],
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid phone number or password' }, { status: 401 });
    }

    // Check password – stored as plain text for now (temporary solution)
    if (!user.password || user.password !== password) {
      return NextResponse.json({ error: 'Invalid phone number or password' }, { status: 401 });
    }

    await createSession({
      phoneNumber: user.phoneNumber,
      role: user.role,
    });

    return NextResponse.json({
      message: 'Login successful',
      user: { phoneNumber: user.phoneNumber, role: user.role },
    }, { status: 200 });

  } catch (error) {
    console.error('Error during password login:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
