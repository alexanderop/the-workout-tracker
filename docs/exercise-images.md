# Add exercise artwork

Use this workflow to add or replace the workout app's offline thumbnails. Follow the [exercise imagery contract](design.md#exercise-imagery) for appearance and matching rules.

1. Save the original PNG in `apps/workout/src/features/workouts/ui/assets/exercises/`. Keep the source image for future edits.
2. Install the workspace dependencies with `pnpm install --frozen-lockfile`. The converter uses the workout app's existing Sharp dependency.
3. Run the converter from the repository root.

   ```sh
   pnpm --filter @form/workout exec node scripts/optimize-exercise-images.mjs
   ```

   The command regenerates a sibling `.webp` for every PNG and reports source and thumbnail bytes. It preserves the PNGs and overwrites the WebPs. Paths resolve relative to the script, so its behavior does not depend on the working directory. A conversion failure names the source and exits with an error. Earlier thumbnails may already have been updated.

4. Import the `.webp` in the matching equipment module under `apps/workout/src/features/workouts/ui/artwork/`. Add an explicit catalog ID, name, and equipment match to its rows.
5. Inspect the thumbnail against the app's light and dark backgrounds. The converter preserves aspect ratio and transparency, with a maximum size of 192 × 192 pixels. That provides up to three image pixels per CSS pixel at the current 64-pixel display size. It does not enlarge smaller sources. WebP uses quality 85 and effort 6.
6. Commit both the source PNG and generated WebP with the artwork map change. Conversion runs only when you invoke the script. Builds use the committed WebPs.
7. Run `pnpm verify` for type checking and linting. Use the [production preview](../README.md#run) to inspect the artwork after a complete online load and an offline reload.

Keep `webp` in the Workbox `globPatterns` in `apps/workout/vite.config.ts`. The service worker precaches emitted thumbnails for offline use after installation completes. Production WebPs are always emitted as separate files, including small thumbnails, so unchanged images can be reused independently of JavaScript updates. Unimported source PNGs remain in the repository and are not bundled into the workout app.

The app has no full-size image viewer or runtime image cache. Revisit image delivery before adding large illustrations or a substantially larger catalog. The design-system image gallery keeps its independent sources.

Run `pnpm performance:check` after changing production artwork or its delivery. The [performance guardrails](workflows.md#performance-and-offline-guardrails) enforce size and dimension budgets, audit mobile page loading with Lighthouse, and verify that every catalog image decodes after an offline restart. Keep complete thumbnail precaching; lazy loading alone does not provide offline availability.

The 31 images added on 2026-10-05 were generated individually with the built-in image generation tool. Their exact prompts and filenames are saved in [generation-2026-10-05.json](../apps/workout/src/features/workouts/ui/assets/exercises/generation-2026-10-05.json). This batch completes artwork coverage for the 82 built-in exercises; 77 distinct illustrations are used because some compatible variants share earlier artwork.

EGYM Abdominal crunch was added on 2026-10-06 using the user-supplied PNG, retained as `egym-abdominal-crunch.png` with its optimized WebP sibling. The machine was identified against the [EGYM manual, M2 Abdominal](https://storage.googleapis.com/egym-b2b-website/downloads/operation_manual_for_egym_strength_machines_EN.pdf).

EGYM Rotary torso (M12) was added on 2026-10-06 using the user-supplied PNG, retained as `egym-rotary-torso.png` with its optimized WebP sibling. See the [EGYM machine overview](https://knowledge.egym.com/en/manuals-and-compliance-documentation/smart-strength-series-3-owner-s-manual/overview-of-egym-machines.html).

Five further user-supplied EGYM photographs were added on 2026-10-06: Squat, Seated row, Lat pulldown, Shoulder press, and Chest press. Sources and optimized thumbnails use the `egym-` prefix with those exercise names. Their naming follows the EGYM machine overview linked above.
