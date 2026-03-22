import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db-helper';
import { createSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { phoneNumber, otp } = await request.json();

    if (!phoneNumber || !otp) {
      return NextResponse.json({ error: 'Phone number and OTP are required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');

    const normalizedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    const baseNumber = phoneNumber.startsWith('+91') ? phoneNumber.substring(3) : phoneNumber.replace(/^\+/, '');

    const user = await usersCollection.findOne({ 
      $or: [
        { phoneNumber: normalizedNumber },
        { phoneNumber: baseNumber }
      ]
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 1. Verify OTP exists and hasn't expired
    if (!user.otp || !user.otpExpiry) {
      return NextResponse.json({ error: 'OTP not requested or expired' }, { status: 400 });
    }

    const now = new Date();
    if (now > new Date(user.otpExpiry)) {
      return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
    }

    // 2. Verify OTP matches
    if (user.otp !== otp.toString()) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    // 3. Clear the OTP from DB
    await usersCollection.updateOne(
      { _id: user._id },
      { $unset: { otp: "", otpExpiry: "" } }
    );

    // 4. Create Session (Cookie)
    await createSession({
      phoneNumber: user.phoneNumber,
      role: user.role,
    });

    return NextResponse.json({ 
        message: 'Login successful',
        user: { phoneNumber: user.phoneNumber, role: user.role }
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
