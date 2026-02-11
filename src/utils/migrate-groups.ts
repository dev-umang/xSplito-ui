// Utility to migrate existing groups to add memberIds field
// Run this once from browser console or create a temporary admin page

import { getDocs, updateDoc } from "firebase/firestore";
import { fbRefs } from "@/configs/firebase/firebase.nodes";

export async function migrateExistingGroups() {
  try {
    console.log("Starting migration...");
    
    const snapshot = await getDocs(fbRefs.groupsCollection());
    console.log(`Found ${snapshot.size} groups`);
    
    let updated = 0;
    let skipped = 0;
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // Skip if memberIds already exists
      if (data.memberIds) {
        console.log(`Skipping ${doc.id} - already has memberIds`);
        skipped++;
        continue;
      }
      
      // Extract memberIds from members array
      const members = data.members || [];
      const memberIds = members.map((m: any) => m.userId);
      
      // Update document
      await updateDoc(doc.ref, {
        memberIds: memberIds
      });
      
      console.log(`✓ Updated ${doc.id} (${data.name}) with ${memberIds.length} members`);
      updated++;
    }
    
    console.log("\n✅ Migration complete!");
    console.log(`Updated: ${updated} groups`);
    console.log(`Skipped: ${skipped} groups`);
    
    return { updated, skipped, total: snapshot.size };
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}
