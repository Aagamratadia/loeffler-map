import { MongoClient } from 'mongodb';
import * as readline from 'readline';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI is not defined in the environment.");
}

const dbName = 'Loefller'; // Match the DB name used in API routes

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main() {
  const client = new MongoClient(uri as string);

  try {
    await client.connect();
    console.log('Connected correctly to server');
    const db = client.db(dbName);
    const usersCollection = db.collection('users');

    rl.question('Enter phone number to allow (e.g., +919876543210): ', async (phoneNumber) => {
      if (!phoneNumber) {
        console.log('Phone number is required.');
        client.close();
        rl.close();
        return;
      }

      // Check if user already exists
      const existingUser = await usersCollection.findOne({ phoneNumber });
      if (existingUser) {
        console.log(`Phone number ${phoneNumber} is already allowed (Role: ${existingUser.role}).`);
      } else {
        rl.question('Enter role (admin/user) [default: user]: ', async (roleInput) => {
          const role = roleInput.toLowerCase() === 'admin' ? 'admin' : 'user';
          const newUser = {
            phoneNumber,
            role,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const result = await usersCollection.insertOne(newUser);
          console.log(`Successfully added user with ID: ${result.insertedId}`);
          client.close();
          rl.close();
        });
        return; // wait for inner question
      }
      
      client.close();
      rl.close();
    });

  } catch (err) {
    console.error('Error:', err);
    await client.close();
    rl.close();
  }
}

main().catch(console.error);
