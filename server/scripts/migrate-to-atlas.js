import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const LOCAL_URI = 'mongodb://127.0.0.1:27017/sn-infra';
const ATLAS_URI = process.env.MONGODB_URI;

console.log('--- MIGRATION: LOCAL MONGODB -> MONGODB ATLAS ---');
console.log('Atlas URI:', ATLAS_URI ? ATLAS_URI.replace(/:[^:]*@/, ':****@') : 'MISSING');

async function migrate() {
  if (!ATLAS_URI) {
    throw new Error('MONGODB_URI not found in environment');
  }

  // Connect to local
  console.log('\n1. Connecting to Local MongoDB...');
  const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
  console.log('Connected to Local MongoDB.');

  // Connect to Atlas
  console.log('\n2. Connecting to MongoDB Atlas...');
  const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
  console.log('Connected to MongoDB Atlas.');

  // List collections from local
  const collections = await localConn.db.listCollections().toArray();
  console.log(`\nFound ${collections.length} collections in local database:`);

  for (const col of collections) {
    const colName = col.name;
    if (colName.startsWith('system.')) continue;

    const localCollection = localConn.db.collection(colName);
    const atlasCollection = atlasConn.db.collection(colName);

    const docs = await localCollection.find({}).toArray();
    console.log(`\nMigrating collection '${colName}' (${docs.length} documents)...`);

    if (docs.length > 0) {
      await atlasCollection.deleteMany({});
      await atlasCollection.insertMany(docs);
      console.log(`Successfully migrated '${colName}' (${docs.length} documents) to Atlas.`);
    } else {
      console.log(`Collection '${colName}' is empty.`);
    }

    const atlasCount = await atlasCollection.countDocuments();
    console.log(`Verified Atlas '${colName}' count: ${atlasCount}`);
  }

  console.log('\n=============================================');
  console.log('ALL DATA SUCCESSFULLY TRANSFERRED TO ATLAS!');
  console.log('=============================================\n');

  await localConn.close();
  await atlasConn.close();
  process.exit(0);
}

migrate().catch(err => {
  console.error('\nMigration failed:', err);
  process.exit(1);
});
