import { onScopeDispose, readonly, ref } from "vue";

/**
 * One pending "discard unsaved changes?" decision. Concurrent requests share
 * the same answer, and disposal answers "stay" so a navigation guard never
 * waits on a confirmation that can no longer be shown.
 */
export function useLeaveConfirmation() {
  const open = ref(false);
  let pending: {
    promise: Promise<boolean>;
    resolve: (leave: boolean) => void;
  } | null = null;
  function request(): Promise<boolean> {
    if (pending) return pending.promise;
    let resolve!: (leave: boolean) => void;
    const promise = new Promise<boolean>((done) => {
      resolve = done;
    });
    pending = { promise, resolve };
    open.value = true;
    return promise;
  }
  function settle(leave: boolean) {
    const current = pending;
    pending = null;
    open.value = false;
    current?.resolve(leave);
  }
  onScopeDispose(() => settle(false));
  return { open: readonly(open), request, settle };
}
