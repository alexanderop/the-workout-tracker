import { beforeEach, describe, expect, it } from "vitest";
import { createCatalogLoader } from "../../src/i18n/catalogLoader";
import {
  clearCatalogs,
  createAppI18n,
  hasCatalog,
  strictTranslator,
} from "../../src/i18n";

const urls = { en: "/en.json", de: "/de.json" };
type Answer = () => Promise<{ ok: boolean; json: () => Promise<unknown> }>;
const reply =
  (body: unknown, ok = true): Answer =>
  () =>
    Promise.resolve({ ok, json: () => Promise.resolve(body) });

// A fetcher that records each requested URL.
function recording(answer: Answer) {
  const requested: string[] = [];
  return {
    requested,
    fetcher: (url: string) => {
      requested.push(url);
      return answer();
    },
  };
}

describe("given the catalog loader", () => {
  beforeEach(clearCatalogs);

  it("should register a fetched catalog once and translate with it", async () => {
    const { fetcher, requested } = recording(
      reply({ shell: { loading: "Lädt" } }),
    );
    const load = createCatalogLoader(urls, fetcher);
    expect(await load("de")).toBe(true);
    expect(await load("de")).toBe(true);
    expect(requested).toEqual(["/de.json"]);
    expect(hasCatalog("de")).toBe(true);
    const { t } = strictTranslator(createAppI18n("de").global.locale);
    expect(t("shell.loading")).toBe("Lädt");
  });

  it("should share one request between concurrent callers", async () => {
    const { fetcher, requested } = recording(reply({}));
    const load = createCatalogLoader(urls, fetcher);
    await Promise.all([load("en"), load("en")]);
    expect(requested).toEqual(["/en.json"]);
  });

  it.each<[string, Answer]>([
    ["a failed response", reply({}, false)],
    ["a network error", () => Promise.reject(new Error("offline"))],
    ["a file that is not a catalog", reply(["text"])],
    ["a catalog with a non-text message", reply({ shell: { a: 1 } })],
  ])("should resolve false for %s and retry later", async (_name, answer) => {
    const { fetcher, requested } = recording(answer);
    const load = createCatalogLoader(urls, fetcher);
    expect(await load("en")).toBe(false);
    expect(await load("en")).toBe(false);
    expect(requested).toHaveLength(2);
  });
});
