# Add exercise artwork

Use this workflow to add or replace the workout app's offline thumbnails. Follow the [exercise imagery contract](design.md#exercise-imagery) for appearance and matching rules.

1. Save the original PNG in `apps/workout/src/features/workouts/ui/assets/exercises/`. Keep the source image for future edits.
2. Install the workspace dependencies with `pnpm install --frozen-lockfile`. The converter uses the workout app's existing Sharp dependency.
3. Run the converter from the repository root.

   ```sh
   pnpm --filter @form/workout exec node scripts/optimize-exercise-images.mjs
   ```

   The command regenerates a sibling `.webp` for every PNG and reports source and thumbnail bytes. It preserves the PNGs and overwrites the WebPs. Paths resolve relative to the script, so its behavior does not depend on the working directory. A conversion failure names the source and exits with an error. Earlier thumbnails may already have been updated.

4. Import the `.webp` in `apps/workout/src/features/workouts/ui/exerciseArtwork.ts`. Add an explicit catalog ID, name, and equipment match to the existing map.
5. Inspect the thumbnail against the app's dark background. The converter preserves aspect ratio and transparency, with a maximum size of 192 × 192 pixels. That provides up to three image pixels per CSS pixel at the current 64-pixel display size. It does not enlarge smaller sources. WebP uses quality 85 and effort 6.
6. Commit both the source PNG and generated WebP with the artwork map change. Conversion runs only when you invoke the script. Builds use the committed WebPs.
7. Run `pnpm verify` for type checking and linting. Use the [production preview](../README.md#run) to inspect the artwork after a complete online load and an offline reload.

Keep `webp` in the Workbox `globPatterns` in `apps/workout/vite.config.ts`. The service worker precaches emitted thumbnails for offline use after installation completes. Vite may inline small assets in JavaScript, which is also precached. Unimported source PNGs remain in the repository and are not bundled into the workout app.

The app has no full-size image viewer or runtime image cache. Revisit image delivery before adding large illustrations or a substantially larger catalog. The design-system image gallery keeps its independent sources.
