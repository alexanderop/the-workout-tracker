import type { Page } from "@playwright/test";
import { snapshotSchema, type Snapshot } from "../../src/features/workouts/domain";

export async function seedWorkoutStorage(page: Page, snapshot: Snapshot) {
  const valid = snapshotSchema.parse(snapshot);
  await page.evaluate(async (data) => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("form-workout-v1");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction("state", "readwrite");
        transaction.objectStore("state").put(data, "snapshot");
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
      });
    } finally {
      database.close();
    }
  }, valid);
  await page.reload();
}
