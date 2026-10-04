# Component test contracts

The reference is [alexanderop/reka-ui-bench-mark at ab4207bf](https://github.com/alexanderop/reka-ui-bench-mark/tree/ab4207bf38e4f72feb08f9202fd3eed97f728fbe). Its Browser Mode cookbook, Dialog tests, accessibility census, ARIA transition tests, and separate cross-browser configuration informed this suite. The tests here exercise our public components and fixtures; they do not copy the full primitive-library corpus.

| Reference pattern                                | This library                                                                                             |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| Real browser interaction and observable outcomes | `controls.test.ts`, `input-reset.test.ts`, `dialog.test.ts`, `dialog-lifecycle.test.ts`, `sheet.test.ts` |
| Shared axe policy and state scans                | `helpers/accessibility.ts`, `accessibility.test.ts`                                                      |
| At-rest ARIA census and transition trees         | `aria.test.ts`, `__snapshots__/aria.test.ts.snap`                                                        |
| Resolved accessible relationships                | Field help/error ID references and dialog title/description/control references in `aria.test.ts`         |
| Rerendered public props                          | `field-error.test.ts` checks deduplication, changing messages, and removal of resolved errors            |
| Canonical visual comparison                      | `components.visual.test.ts`, `vitest.visual.config.ts` and the pinned Linux container                    |
| Separate Firefox/WebKit execution                | `pnpm test:ui:cross-browser`, CI's `ui-cross-browser` matrix                                             |

## Run and extend

- `pnpm --filter @form/ui test:browser` runs all behavior, axe, and ARIA tests in Chromium. Root `pnpm verify` includes it.
- `pnpm exec playwright install firefox webkit` installs the other engines. `pnpm test:ui:cross-browser` runs the same non-visual corpus in Firefox, then WebKit. Run just one engine with `UI_BROWSER=firefox pnpm --filter @form/ui test:browser`. CI runs each on Linux in a separate job. Files run serially in these engines to avoid competing keyboard focus between tester pages.
- `pnpm test:visual` compares the existing canonical screenshots. Keep screenshots separate from cross-browser semantics.
- Add a fixture using public `@form/ui` exports, then tests for default, changed, disabled, invalid, and open/closed states as relevant. Use semantic locators, awaited `render`, `expect.element`, and actual `userEvent` keyboard/pointer input. Do not add layout, focus, ResizeObserver, or pointer-capture mocks.
- A forced click on a disabled control bypasses Playwright's actionability wait while retaining the browser's native event suppression. Assert that the action did not happen, not just that the attribute exists.
- Tests may explicitly focus their starting element before sending real keys. This establishes a keyboard starting point without assuming that pointer clicks focus buttons on every platform. Subsequent focus movement must still use real keyboard input.
- Synthetic composition events are a narrow exception for the input composition regression. They do not prove operating-system IME behavior.

## Three different accessibility checks

Axe reports detectable rule violations, including contrast in the rendered state. ARIA snapshots describe roles, names, values, and exposed structure. Behavioral tests prove focus movement, dismissal, reset, and state updates. Keep all three: a valid ARIA tree can still announce the wrong state, and a snapshot cannot prove keyboard operation.

The axe helper directly imports browser-native `axe-core`. The reference fork needed browser-safe aliases for its older `vitest-axe` package; our suite needs neither those compatibility shims nor its jsdom mocks. Keep the existing detailed failure output and only the documented isolated-fixture `region` exception.

ARIA census snapshots use the document element as the root and `/children: deep-equal` underneath it. This catches unexpected extra controls as well as missing ones. After an intentional `--update`, inspect every changed tree and restore the directive if regeneration removed it. Do not accept a snapshot merely because the generator produced it. Check that all controls have correct names, modal background content disappears while open, and it returns when closed. ID references and false states such as `aria-expanded="false"` have explicit assertions because the tree alone does not encode those contracts.

No expected failures or blanket browser-specific skips are carried over from the reference fork. New browser failures need diagnosis. Automated checks do not replace a screenreader review.

The cross-browser CI contract uses Linux. On macOS, WebKit can follow platform keyboard settings that skip buttons during Tab navigation; these strict keyboard tests may fail under that setting. The local macOS Firefox binary also failed to start during initial verification. Linux Firefox and WebKit are checked independently of those host limitations.
