# @form/result

A vendored copy of [better-result](https://github.com/dmmulroy/better-result) by [Dillon Mulroy](https://github.com/dmmulroy), released under the MIT license in [LICENSE](LICENSE). Read the [better-result documentation](https://better-result.dev) for the API. The copy comes from `my-vue-pwa-starter`'s `packages/result`.

| Upstream | Value                                      |
| -------- | ------------------------------------------ |
| Version  | 3.0.1                                      |
| Commit   | `4a654fa6dacb8bf75a6283772bba0c81afcfa64a` |

`src/` matches upstream except for these patches. Runtime behavior is unchanged.

1. `Ok` and `Err` assign `value` and `error` in the constructor body instead of using parameter properties, and optional `issues` and `signal` properties also accept `undefined` (the starter's `erasableSyntaxOnly` and `exactOptionalPropertyTypes` patch).
2. `result.ts` declares `AbortSignalLike`, `setTimeout` and `clearTimeout` itself instead of using the DOM or Node typings. The workout domain, ports and application layers compile with the ECMAScript library only (`tsconfig.pure.json`), and they import this package. A real `AbortSignal` satisfies `AbortSignalLike`.
3. Suppression comments (`eslint-disable`, `oxlint-disable`) were removed from `src/` and `test/`, because the repository's `lint:guards` rejects them and the package is excluded from linting (see below).

The runtime tests moved from `src/` to `test/` and import `../src/*`. The `@ts-expect-error` lines in them were removed, because `lint:guards` rejects those too and the test files are not type-checked. Upstream's `src/error.test-d.ts` type tests are not vendored: their whole purpose is `@ts-expect-error` assertions. The workout feature covers the same guarantee with its own exhaustive message tables.

ESLint skips `packages/result` and the package has no `lint` script, so a later update stays close to a plain copy. Prettier skips `src/`. `pnpm typecheck` checks `src/` with the `tsconfig.json` in this folder, and `pnpm test:unit` runs the tests.

## Update

1. Clone `https://github.com/dmmulroy/better-result` and check out the release tag.
2. Replace `src/` and `LICENSE` with the upstream files, then reapply the patches above.
3. Update the version and commit above, and `version` in `package.json`.
4. Run `pnpm typecheck && pnpm test:unit`.
