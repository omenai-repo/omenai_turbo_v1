// scripts/seedTestData.js
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const dbName = process.env.MONGO_DB || 'omenai_test';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const users = db.collection('AccountIndividual');
  const artworks = db.collection('ArworkUploads');

  const plainPassword = 'Test12345@';
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  // Upsert collector
  const collectorRes = await users.findOneAndUpdate(
    { email: 'collector@test.local' },
    {
      $set: {
        email: 'collector@test.local',
        name: 'Collector Test',
        role: 'individual',
        passwordHash,
        createdAt: new Date()
      }
    },
    { upsert: true, returnDocument: 'after' }
  );

  // Upsert artist
  const artistRes = await users.findOneAndUpdate(
    { email: 'artist@test.local' },
    {
      $set: {
        email: 'artist@test.local',
        name: 'Artist Test',
        role: 'artist',
        passwordHash,
        createdAt: new Date()
      }
    },
    { upsert: true, returnDocument: 'after' }
  );

  // Upsert test artwork sold by artist
  const artworkRes = await artworks.findOneAndUpdate(
    { title: 'Test Art - Playwright' },
    {
      $set: {
        title: 'Test Art - Playwright',
        priceCents: 1000,
        sellerId: artistRes.value._id,
        sellerType: 'artist',
        createdAt: new Date()
      }
    },
    { upsert: true, returnDocument: 'after' }
  );

  // Print JSON for the test runner
  console.log(JSON.stringify({
    collectorEmail: 'collector@test.local',
    artistEmail: 'artist@test.local',
    artworkId: artworkRes.value._id.toString(),
    password: plainPassword
  }));

  await client.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
