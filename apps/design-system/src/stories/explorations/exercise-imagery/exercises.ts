import benchPress from "../../../assets/exercises/bench-press.png";
import squat from "../../../assets/exercises/squat.png";
import deadlift from "../../../assets/exercises/deadlift.png";
import shoulderPress from "../../../assets/exercises/shoulder-press.png";
import latPulldown from "../../../assets/exercises/lat-pulldown.png";
import seatedRow from "../../../assets/exercises/seated-row.png";

import overheadPress from "../../../assets/exercises/overhead-press.png";
import row from "../../../assets/exercises/row.png";
import legPress from "../../../assets/exercises/leg-press.png";
import bicepsCurl from "../../../assets/exercises/biceps-curl.png";
import tricepsExtension from "../../../assets/exercises/triceps-extension.png";
import lateralRaise from "../../../assets/exercises/lateral-raise.png";
import inclineBenchPress from "../../../assets/exercises/incline-bench-press.png";
import dumbbellBenchPress from "../../../assets/exercises/dumbbell-bench-press.png";
import inclineDumbbellPress from "../../../assets/exercises/incline-dumbbell-press.png";
import cableFly from "../../../assets/exercises/cable-fly.png";
import chestPress from "../../../assets/exercises/chest-press.png";
import pecDeck from "../../../assets/exercises/pec-deck.png";
import pullUp from "../../../assets/exercises/pull-up.png";
import legExtension from "../../../assets/exercises/leg-extension.png";
import seatedLegCurl from "../../../assets/exercises/seated-leg-curl.png";
import hackSquat from "../../../assets/exercises/hack-squat.png";
import hipThrust from "../../../assets/exercises/hip-thrust.png";
import standingCalfRaise from "../../../assets/exercises/standing-calf-raise.png";
import preacherCurl from "../../../assets/exercises/preacher-curl.png";
import abWheelRollout from "../../../assets/exercises/ab-wheel-rollout.png";

import declineBenchPress from "../../../assets/exercises/decline-bench-press.png";
import chestDip from "../../../assets/exercises/chest-dip.png";
import assistedPullUp from "../../../assets/exercises/assisted-pull-up.png";
import barbellRow from "../../../assets/exercises/barbell-row.png";
import chestSupportedRow from "../../../assets/exercises/chest-supported-row.png";
import tBarRow from "../../../assets/exercises/t-bar-row.png";
import backExtension from "../../../assets/exercises/back-extension.png";
import gobletSquat from "../../../assets/exercises/goblet-squat.png";
import bulgarianSplitSquat from "../../../assets/exercises/bulgarian-split-squat.png";
import stepUp from "../../../assets/exercises/step-up.png";
import lyingLegCurl from "../../../assets/exercises/lying-leg-curl.png";
import seatedCalfRaise from "../../../assets/exercises/seated-calf-raise.png";
import hipAbduction from "../../../assets/exercises/hip-abduction.png";
import facePull from "../../../assets/exercises/face-pull.png";
import shoulderPressMachine from "../../../assets/exercises/shoulder-press-machine.png";
import hammerCurl from "../../../assets/exercises/hammer-curl.png";
import barbellCurl from "../../../assets/exercises/barbell-curl.png";
import cableCurl from "../../../assets/exercises/cable-curl.png";
import ropeTricepsPushdown from "../../../assets/exercises/rope-triceps-pushdown.png";
import skullCrusher from "../../../assets/exercises/skull-crusher.png";

export const exercises = [
  {
    name: "Bench press",
    muscle: "Chest",
    equipment: "Barbell",
    image: benchPress,
  },
  { name: "Squat", muscle: "Legs", equipment: "Barbell", image: squat },
  {
    name: "Deadlift",
    muscle: "Posterior chain",
    equipment: "Barbell",
    image: deadlift,
  },
  {
    name: "Shoulder press",
    muscle: "Shoulders",
    equipment: "Dumbbells",
    image: shoulderPress,
  },
  {
    name: "Lat pulldown",
    muscle: "Back",
    equipment: "Cable",
    image: latPulldown,
  },
  { name: "Seated row", muscle: "Back", equipment: "Cable", image: seatedRow },
  { name: "Overhead press", muscle: "Shoulders", equipment: "Barbell", image: overheadPress },
  { name: "Dumbbell row", muscle: "Back", equipment: "Dumbbell", image: row },
  { name: "Leg press", muscle: "Legs", equipment: "Machine", image: legPress },
  { name: "Biceps curl", muscle: "Arms", equipment: "Dumbbell", image: bicepsCurl },
  { name: "Triceps extension", muscle: "Arms", equipment: "Cable", image: tricepsExtension },
  { name: "Lateral raise", muscle: "Shoulders", equipment: "Dumbbell", image: lateralRaise },
  { name: "Incline bench press", muscle: "Chest", equipment: "Barbell", image: inclineBenchPress },
  { name: "Dumbbell bench press", muscle: "Chest", equipment: "Dumbbell", image: dumbbellBenchPress },
  { name: "Incline dumbbell press", muscle: "Chest", equipment: "Dumbbell", image: inclineDumbbellPress },
  { name: "Cable fly", muscle: "Chest", equipment: "Cable", image: cableFly },
  { name: "Chest press", muscle: "Chest", equipment: "Machine", image: chestPress },
  { name: "Pec deck", muscle: "Chest", equipment: "Machine", image: pecDeck },
  { name: "Pull-up", muscle: "Back", equipment: "Bodyweight", image: pullUp },
  { name: "Leg extension", muscle: "Legs", equipment: "Machine", image: legExtension },
  { name: "Seated leg curl", muscle: "Legs", equipment: "Machine", image: seatedLegCurl },
  { name: "Hack squat", muscle: "Legs", equipment: "Machine", image: hackSquat },
  { name: "Hip thrust", muscle: "Legs", equipment: "Barbell", image: hipThrust },
  { name: "Standing calf raise", muscle: "Legs", equipment: "Machine", image: standingCalfRaise },
  { name: "Preacher curl", muscle: "Arms", equipment: "Machine", image: preacherCurl },
  { name: "Ab wheel rollout", muscle: "Core", equipment: "Other", image: abWheelRollout },
  { name: "Decline bench press", muscle: "Chest", equipment: "Barbell", image: declineBenchPress },
  { name: "Chest dip", muscle: "Chest", equipment: "Bodyweight", image: chestDip },
  { name: "Assisted pull-up", muscle: "Back", equipment: "Machine", image: assistedPullUp },
  { name: "Barbell row", muscle: "Back", equipment: "Barbell", image: barbellRow },
  { name: "Chest-supported row", muscle: "Back", equipment: "Dumbbell", image: chestSupportedRow },
  { name: "T-bar row", muscle: "Back", equipment: "Machine", image: tBarRow },
  { name: "Back extension", muscle: "Back", equipment: "Bodyweight", image: backExtension },
  { name: "Goblet squat", muscle: "Legs", equipment: "Dumbbell", image: gobletSquat },
  { name: "Bulgarian split squat", muscle: "Legs", equipment: "Dumbbell", image: bulgarianSplitSquat },
  { name: "Step-up", muscle: "Legs", equipment: "Dumbbell", image: stepUp },
  { name: "Lying leg curl", muscle: "Legs", equipment: "Machine", image: lyingLegCurl },
  { name: "Seated calf raise", muscle: "Legs", equipment: "Machine", image: seatedCalfRaise },
  { name: "Hip abduction", muscle: "Legs", equipment: "Machine", image: hipAbduction },
  { name: "Face pull", muscle: "Shoulders", equipment: "Cable", image: facePull },
  { name: "Shoulder press machine", muscle: "Shoulders", equipment: "Machine", image: shoulderPressMachine },
  { name: "Hammer curl", muscle: "Arms", equipment: "Dumbbell", image: hammerCurl },
  { name: "Barbell curl", muscle: "Arms", equipment: "Barbell", image: barbellCurl },
  { name: "Cable curl", muscle: "Arms", equipment: "Cable", image: cableCurl },
  { name: "Rope triceps pushdown", muscle: "Arms", equipment: "Cable", image: ropeTricepsPushdown },
  { name: "Skull crusher", muscle: "Arms", equipment: "Barbell", image: skullCrusher },
];
