import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db-helper';
import { sendFast2SMSOTP } from '@/lib/fast2sms';

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');

    // Normalize phone number to include +91 if user seeded it without
    const normalizedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    const baseNumber = phoneNumber.startsWith('+91') ? phoneNumber.substring(3) : phoneNumber.replace(/^\+/, '');

    // 1. Check if the user is allowed (exists in the DB with or without country code)
    const user = await usersCollection.findOne({ 
      $or: [
        { phoneNumber: normalizedNumber },
        { phoneNumber: baseNumber }
      ]
    });

    if (!user) {
      return NextResponse.json({ error: 'Phone number not authorized' }, { status: 403 });
    }

    // 2. Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    // 3. Update the user with the OTP and expiry
    await usersCollection.updateOne(
      { phoneNumber },
      { $set: { otp, otpExpiry, updatedAt: new Date() } }
    );

    // 4. Send the OTP via Fast2SMS
    // (In local development/sandbox, we might want to bypass actual sending, but we'll try sending it here)
    const otpSent = await sendFast2SMSOTP(phoneNumber, otp);

    if (!otpSent) {
        // Fallback or log if SMS fails. Useful for testing if MSG91 is not fully configured yet.
        console.warn(`[DEV] OTP for ${phoneNumber} is: ${otp}`);
    }

    return NextResponse.json({ message: 'OTP sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error requesting OTP:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
