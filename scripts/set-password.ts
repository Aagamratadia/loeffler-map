/**
 * Script to set a password for an existing user in the DB.
 * Usage: npx ts-node -r dotenv/config scripts/set-password.ts
 */
import { MongoClient } from 'mongodb';
import * as readline from 'readline';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('MONGODB_URI is not defined in the environment.');
}

const dbName = 'Loefller';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  const client = new MongoClient(uri as string);

  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db(dbName);
    const usersCollection = db.collection('users');

    const phoneNumber = await ask('Enter phone number (e.g. +919876543210): ');
    if (!phoneNumber) {
      console.log('Phone number is required.');
      return;
    }

    const normalizedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    const baseNumber = phoneNumber.startsWith('+91') ? phoneNumber.substring(3) : phoneNumber.replace(/^\+/, '');

    const user = await usersCollection.findOne({
      $or: [
        { phoneNumber: normalizedNumber },
        { phoneNumber: baseNumber },
      ],
    });

    if (!user) {
      console.log(`No user found for phone number: ${phoneNumber}`);
      return;
    }

    console.log(`Found user: ${user.phoneNumber} (role: ${user.role})`);

    const password = await ask('Enter new password: ');
    if (!password) {
      console.log('Password cannot be empty.');
      return;
    }

    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { password, updatedAt: new Date() } }
    );

    console.log(`✅ Password set successfully for ${user.phoneNumber}`);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
    rl.close();
  }
}

main().catch(console.error);
