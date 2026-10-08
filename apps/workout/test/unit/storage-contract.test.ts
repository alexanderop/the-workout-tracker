import { createMemoryStorage } from "../support/memory-ports";
import { describeWorkoutStorageContract } from "../support/storage-contract";

describeWorkoutStorageContract("in-memory", (initial) => ({
  storage: createMemoryStorage(initial).storage,
}));
