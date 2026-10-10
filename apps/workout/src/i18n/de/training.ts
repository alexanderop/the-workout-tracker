import type { Catalog } from "../index";
import { deTrainingConfig } from "./trainingConfig";
import { deTrainingNotices } from "./trainingNotices";
import { deTrainingPage } from "./trainingPage";
import { deTrainingSets } from "./trainingSets";

export const deTraining: Catalog["training"] = {
  ...deTrainingPage,
  ...deTrainingSets,
  config: deTrainingConfig,
  ...deTrainingNotices,
};
