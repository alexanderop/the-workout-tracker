# Visual identity: adopt the starter look (2026-10-10)

This is a historical record, not a current instruction. [Design](../design.md#visual-foundation) owns the current contract.

## Decision

On 2026-10-10 the product owner decided to replace the workout app's deliberate dark-only identity (five-color palette, purple as the single accent, Inter) with the look of the owner's Vue PWA starter: a warm light theme by default plus a dark theme, a user-chosen accent (Blue, Teal, Violet, Pink, Sand), Geist Variable, 8px rounded controls, a 3px accent focus ring and the starter's navigation styling. This was the owner's explicit choice, not a research finding.

## What changed

- `packages/ui/src/tokens.css` holds the palette as `light-dark()` pairs plus per-accent blocks selected by `data-accent`. `--purple` became `--accent`; `--border`, `--rule`, `--body`, `--danger`, `--hover`, `--on-accent` and `--focus-ring` are new roles. Borders no longer reuse `--surface`, which is white in the light theme.
- `app/appearance.ts` and the Settings Appearance section persist the choice and set `data-theme` and `data-accent` on `<html>` before mount, with an inline script in `index.html` and `preview.html` to avoid a flash.
- Geist replaced Inter and its import moved into `@form/ui/styles.css`. The production build is smaller (build bytes 1,642,621 before, 1,506,413 after) because the Geist subsets are smaller than Inter's.
- Histoire follows the explorer's color scheme and its foundations story lists the new palette and accents.

## Superseded

The dark-only, single-purple-accent, Inter description in earlier versions of the design document, and the Paper file **The Workout Tracker — Product design**, which was not redrawn.

## Known limits

- The manifest has one `theme_color` and `background_color` (light), so an installed app on a dark system shows a light splash screen.
- The iOS status bar style changed from `black-translucent` to `default` for legibility on the light theme.
- Exercise artwork is dark charcoal on transparent backgrounds and was only checked at 390 px on both themes.
