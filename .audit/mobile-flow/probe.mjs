import { chromium, webkit, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

const url = process.env.PROBE_URL ?? 'http://127.0.0.1:4190/';
const directory = process.env.PROBE_OUTPUT ? new URL(`file://${process.env.PROBE_OUTPUT}/`) : new URL('./', import.meta.url);
const results = [];
for (const [engine, browserType] of [['chromium', chromium], ['webkit', webkit]]) {
  if (process.env.PROBE_ENGINE && process.env.PROBE_ENGINE !== engine) continue;
  const browser = await browserType.launch();
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    let page = await context.newPage();
    await page.goto(url);
    await page.getByRole('button', { name: 'Start workout', exact: true }).click();
    const weight = () => page.getByLabel('Set 1 weight for Bench press', { exact: true });
    const reps = () => page.getByLabel('Set 1 repetitions for Bench press', { exact: true });
    await weight().fill('82.5');
    await reps().fill('');
    await page.reload();
    await expect(weight()).toHaveValue('82.5');
    await expect(reps()).toHaveValue('');
    await expect(page.getByRole('button', { name: 'Log set 1 of Bench press', exact: true })).toHaveAttribute('aria-pressed', 'false');
    await reps().fill('7');
    const resumeUrl = page.url();
    await page.close();
    page = await context.newPage();
    await page.goto(resumeUrl);
    await expect(weight()).toHaveValue('82.5');
    await expect(reps()).toHaveValue('7');
    await page.getByRole('button', { name: 'Log set 1 of Bench press', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Undo set 1 of Bench press', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
      if (!navigator.serviceWorker.controller) await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
    });
    await context.setOffline(true);
    await page.reload();
    await expect(weight()).toHaveValue('82.5');
    await expect(page.getByRole('button', { name: 'Undo set 1 of Bench press', exact: true })).toHaveAttribute('aria-pressed', 'true');
    for (const [label, width, height] of [['phone',390,844],['narrow',320,568],['reduced',390,420],['desktop',1440,1000]]) {
      await page.setViewportSize({width,height});
      await weight().click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await page.screenshot({path:new URL(`${engine}-${label}.png`,directory).pathname,fullPage:false});
    }
    results.push({engine, result:'PASS',draftReload:true,blankDraft:true,tabReopen:true,confirmedOfflineReload:true,widths:[320,390,1440],reducedHeight:420});
    await context.close();
  } finally {
    await browser.close();
  }
}
await writeFile(new URL('probe-results.json',directory),JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify(results,null,2));
