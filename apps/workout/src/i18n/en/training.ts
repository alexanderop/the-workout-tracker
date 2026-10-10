import { enTrainingConfig } from "./trainingConfig";
import { enTrainingNotices } from "./trainingNotices";
import { enTrainingPage } from "./trainingPage";
import { enTrainingSets } from "./trainingSets";

export const enTraining = {
  ...enTrainingPage,
  ...enTrainingSets,
  config: enTrainingConfig,
  ...enTrainingNotices,
} as const;
