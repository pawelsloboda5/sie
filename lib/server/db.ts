import { MongoClient, Db } from 'mongodb'

let globalClient: MongoClient | null = null
let globalDb: Db | null = null

export async function getServerDb(): Promise<Db> {
  if (globalDb && globalClient) return globalDb
  const uri = process.env.COSMOS_DB_CONNECTION_STRING || process.env.MONGODB_URI
  if (!uri) throw new Error('COSMOS_DB_CONNECTION_STRING or MONGODB_URI not set')
  globalClient = new MongoClient(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS: 15000,
    retryWrites: true,
  })
  await globalClient.connect()
  globalDb = globalClient.db(process.env.DB_NAME || 'sie-db')
  return globalDb
}


