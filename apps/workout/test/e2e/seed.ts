import type { Page } from "@playwright/test";
import { snapshotSchema, type Snapshot } from "../../src/features/workouts/domain";

export async function seedWorkoutStorage(page: Page, snapshot: Snapshot) {
  const valid = snapshotSchema.parse(snapshot);
  await page.evaluate(async (data) => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("form-workout-v1");
      request.addEventListener("success", () => resolve(request.result));
      request.addEventListener("error", () =>
        reject(request.error ?? new Error("Could not open the database.")),
      );
    });
    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction("state", "readwrite");
        transaction.objectStore("state").put(data, "snapshot");
        const fail = () =>
          reject(transaction.error ?? new Error("The transaction failed."));
        transaction.addEventListener("complete", () => resolve());
        transaction.addEventListener("error", fail);
        transaction.addEventListener("abort", fail);
      });
    } finally {
      database.close();
    }
  }, valid);
  await page.reload();
}
