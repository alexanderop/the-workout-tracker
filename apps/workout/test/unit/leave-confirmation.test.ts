import { effectScope } from "vue";
import { expect, it } from "vitest";
import { useLeaveConfirmation } from "../../src/features/workouts/ui/useLeaveConfirmation";

it("shares one pending answer and resolves it as stay on disposal", async () => {
  const scope = effectScope();
  const confirmation = scope.run(() => useLeaveConfirmation())!;
  const first = confirmation.request();
  const second = confirmation.request();
  expect(second).toBe(first);
  expect(confirmation.open.value).toBe(true);
  confirmation.settle(true);
  await expect(first).resolves.toBe(true);
  expect(confirmation.open.value).toBe(false);

  const abandoned = confirmation.request();
  scope.stop();
  await expect(abandoned).resolves.toBe(false);
  expect(confirmation.open.value).toBe(false);
});
