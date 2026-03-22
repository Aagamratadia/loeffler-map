import { getMongoClient } from "./mongodb";

export async function connectToDatabase() {
  const client = await getMongoClient();
  // Ensure your DB name matches here:
  const db = client.db('Loefller'); 
  return { db, client };
}
