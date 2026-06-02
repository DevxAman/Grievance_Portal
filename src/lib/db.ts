import { MongoClient, Db } from 'mongodb';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

/**
 * Connect to MongoDB database
 * This function caches the connection for improved performance
 */
export async function connectToDatabase(): Promise<Db> {
  // If we already have a connection, use it
  if (cachedClient && cachedDb) {
    return cachedDb;
  }

  // Connect to MongoDB
  const client = await MongoClient.connect(process.env.MONGODB_URI as string);
  
  // Get the database name from the connection string
  const dbName = new URL(process.env.MONGODB_URI as string).pathname.substring(1);
  const db = client.db(dbName || 'grievance-portal');

  // Cache the connection
  cachedClient = client;
  cachedDb = db;

  return db;
} 