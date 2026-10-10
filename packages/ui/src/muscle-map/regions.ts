export type MuscleRegion =
  | "chest"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "forearms"
  | "abs"
  | "upper-back"
  | "lower-back"
  | "glutes"
  | "quads"
  | "hamstrings"
  | "calves";
export type MuscleHighlight = Readonly<{
  muscle: MuscleRegion;
  role: "primary" | "supporting";
}>;
export type MuscleMapView = "front" | "back" | "both";
export const muscleRegions: readonly MuscleRegion[] = [
  "chest",
  "shoulders",
  "biceps",
  "triceps",
  "forearms",
  "abs",
  "upper-back",
  "lower-back",
  "glutes",
  "quads",
  "hamstrings",
  "calves",
];
export const bodyViews: readonly {
  id: Exclude<MuscleMapView, "both">;
  regions: readonly { id: MuscleRegion; path: string }[];
}[] = [
  {
    id: "front",
    regions: [
      {
        id: "shoulders",
        path: "M64 63 Q44 62 41 87 L54 94 66 78Z M116 63 Q136 62 139 87 L126 94 114 78Z",
      },
      {
        id: "chest",
        path: "M68 65 88 72 88 99 Q70 105 57 91Z M112 65 92 72 92 99 Q110 105 123 91Z",
      },
      {
        id: "biceps",
        path: "M42 92 54 99 47 128 34 123Z M138 92 126 99 133 128 146 123Z",
      },
      {
        id: "forearms",
        path: "M33 129 46 134 35 166 24 162Z M147 129 134 134 145 166 156 162Z",
      },
      {
        id: "abs",
        path: "M71 107 87 109 87 125 70 124Z M93 109 109 107 110 124 93 125Z M70 130 87 131 87 147 72 145Z M93 131 110 130 108 145 93 147Z M73 151 87 153 87 170 78 166Z M93 153 107 151 102 166 93 170Z",
      },
      {
        id: "quads",
        path: "M65 173 84 180 83 231 68 244 58 214Z M115 173 96 180 97 231 112 244 122 214Z",
      },
      {
        id: "calves",
        path: "M66 255 81 249 79 280 73 310 65 310 62 277Z M114 255 99 249 101 280 107 310 115 310 118 277Z",
      },
    ],
  },
  {
    id: "back",
    regions: [
      {
        id: "shoulders",
        path: "M64 63 Q44 62 41 87 L54 94 66 78Z M116 63 Q136 62 139 87 L126 94 114 78Z",
      },
      {
        id: "upper-back",
        path: "M72 59 87 65 87 126 72 113 59 89Z M108 59 93 65 93 126 108 113 121 89Z",
      },
      {
        id: "triceps",
        path: "M42 92 54 99 47 128 34 123Z M138 92 126 99 133 128 146 123Z",
      },
      {
        id: "forearms",
        path: "M33 129 46 134 35 166 24 162Z M147 129 134 134 145 166 156 162Z",
      },
      {
        id: "lower-back",
        path: "M72 120 87 134 87 155 69 151Z M108 120 93 134 93 155 111 151Z",
      },
      {
        id: "glutes",
        path: "M67 157 Q77 153 87 162 L87 187 Q73 198 59 183Z M113 157 Q103 153 93 162 L93 187 Q107 198 121 183Z",
      },
      {
        id: "hamstrings",
        path: "M59 192 85 198 81 237 67 245 59 221Z M121 192 95 198 99 237 113 245 121 221Z",
      },
      {
        id: "calves",
        path: "M65 252 81 249 80 278 73 295 65 283Z M115 252 99 249 100 278 107 295 115 283Z",
      },
    ],
  },
];
