import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDocs, updateDoc } from "firebase/firestore";
import { fbRefs } from "@/configs/firebase/firebase.nodes";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const MigratePage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ updated: number; skipped: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runMigration = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const snapshot = await getDocs(fbRefs.groupsCollection());
      
      let updated = 0;
      let skipped = 0;
      
      for (const doc of snapshot.docs) {
        const data = doc.data();
        
        // Skip if memberIds already exists
        if (data.memberIds) {
          skipped++;
          continue;
        }
        
        // Extract memberIds from members array
        const members = data.members || [];
        const memberIds = members.map((m: { userId: string }) => m.userId);
        
        // Update document
        await updateDoc(doc.ref, {
          memberIds: memberIds
        });
        
        updated++;
      }
      
      setResult({ updated, skipped, total: snapshot.size });
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Migration failed");
      console.error("Migration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Migrate Groups</CardTitle>
          <CardDescription>
            This will add a <code>memberIds</code> field to all existing groups for efficient querying.
            This only needs to be run once.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runMigration} 
            disabled={loading}
            className="w-full"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Migrating..." : "Run Migration"}
          </Button>

          {result && (
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-2">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold">Migration Complete!</span>
              </div>
              <div className="text-sm space-y-1 text-green-600 dark:text-green-400">
                <div>Total groups: {result.total}</div>
                <div>Updated: {result.updated}</div>
                <div>Skipped (already migrated): {result.skipped}</div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-950">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300 mb-2">
                <AlertCircle className="h-5 w-5" />
                <span className="font-semibold">Migration Failed</span>
              </div>
              <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            <p><strong>What this does:</strong></p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Reads all groups from Firestore</li>
              <li>Extracts userId from each member object</li>
              <li>Creates a new memberIds array field</li>
              <li>Updates each group document</li>
            </ul>
            <p className="mt-3">
              <strong>Why it's needed:</strong> Firestore's array-contains query doesn't work with nested object fields. 
              We need a separate array of user IDs for efficient querying.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MigratePage;
