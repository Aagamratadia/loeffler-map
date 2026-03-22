import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db-helper';
import { createSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { phoneNumber, password, confirmPassword } = await request.json();

    if (!phoneNumber || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'Phone number, password and confirm password are required' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');

    const normalizedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    const baseNumber = phoneNumber.startsWith('+91')
      ? phoneNumber.substring(3)
      : phoneNumber.replace(/^\+/, '');

    // Find whitelisted user
    const user = await usersCollection.findOne({
      $or: [
        { phoneNumber: normalizedNumber },
        { phoneNumber: baseNumber },
      ],
    });

    if (!user) {
      return NextResponse.json(
        { error: 'This phone number is not authorized. Contact your administrator.' },
        { status: 403 }
      );
    }

    // Prevent overwriting an already-set password
    if (user.password) {
      return NextResponse.json(
        { error: 'Account already set up. Please log in instead.' },
        { status: 409 }
      );
    }

    // Save the password and create session
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { password, updatedAt: new Date() } }
    );

    await createSession({
      phoneNumber: user.phoneNumber,
      role: user.role,
    });

    return NextResponse.json(
      { message: 'Account set up successfully', user: { phoneNumber: user.phoneNumber, role: user.role } },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error during signup:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
