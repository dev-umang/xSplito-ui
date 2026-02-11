// Run this script once to add memberIds to existing groups
// Usage: node migrate-groups.js

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

// Your Firebase config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateGroups() {
  const nodePrefix = import.meta.env.VITE_NODE_PREFIX;
  const collectionName = nodePrefix ? `${nodePrefix}_GROUPS` : 'GROUPS';
  
  console.log(`Migrating collection: ${collectionName}`);
  
  const groupsRef = collection(db, collectionName);
  const snapshot = await getDocs(groupsRef);
  
  console.log(`Found ${snapshot.size} groups`);
  
  let updated = 0;
  let skipped = 0;
  
  for (const groupDoc of snapshot.docs) {
    const data = groupDoc.data();
    
    // Skip if memberIds already exists
    if (data.memberIds) {
      console.log(`Skipping ${groupDoc.id} - already has memberIds`);
      skipped++;
      continue;
    }
    
    // Extract memberIds from members array
    const memberIds = (data.members || []).map(m => m.userId);
    
    // Update document
    await updateDoc(doc(db, collectionName, groupDoc.id), {
      memberIds: memberIds
    });
    
    console.log(`✓ Updated ${groupDoc.id} with ${memberIds.length} members`);
    updated++;
  }
  
  console.log(`\nMigration complete!`);
  console.log(`Updated: ${updated} groups`);
  console.log(`Skipped: ${skipped} groups`);
}

migrateGroups()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
