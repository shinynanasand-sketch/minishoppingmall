/**
 * Capture README screenshots into docs/captures/.
 * Usage: node scripts/capture-screens.mjs
 * Requires: npx playwright, dev server at BASE_URL (default http://localhost:5173)
 */
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const outDir = path.join(root, 'docs', 'captures')
const BASE_URL = process.env.BASE_URL ?? 'http://localhost:5173'

await mkdir(outDir, { recursive: true })

const browser = await chromium.launch({ headless: true })

async function freshPage(options = {}) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    locale: 'ko-KR',
    ...options,
  })
  const page = await context.newPage()
  await page.addInitScript(() => {
    localStorage.clear()
  })
  return { context, page }
}

async function waitForProducts(page) {
  await page.waitForSelector('text=상품 목록', { timeout: 30000 })
  await page.waitForFunction(
    () =>
      document.body.innerText.includes('담기') ||
      document.body.innerText.includes('오류 발생'),
    { timeout: 30000 },
  )
  await page.waitForTimeout(1500)
}

// --- 01 products ---
{
  const { context, page } = await freshPage()
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 })
  await waitForProducts(page)
  await page.screenshot({
    path: path.join(outDir, '01-products.png'),
    fullPage: true,
  })
  await context.close()
  console.log('wrote 01-products.png')
}

// --- 02 cart (add two products) ---
{
  const { context, page } = await freshPage()
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 })
  await waitForProducts(page)
  const addButtons = page.getByRole('button', { name: '담기' })
  const count = await addButtons.count()
  if (count >= 1) await addButtons.nth(0).click()
  if (count >= 2) await addButtons.nth(1).click()
  await page.waitForTimeout(500)
  await page.screenshot({
    path: path.join(outDir, '02-cart.png'),
    fullPage: true,
  })
  await context.close()
  console.log('wrote 02-cart.png')
}

// --- 03 auth (login bar or config notice) ---
{
  const { context, page } = await freshPage()
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 })
  await waitForProducts(page)
  await page
    .getByRole('button', { name: 'Google로 로그인' })
    .or(page.getByRole('status'))
    .first()
    .waitFor({ timeout: 10000 })
  const box = await page.locator('div.mb-6').first().boundingBox()
  if (box) {
    await page.screenshot({
      path: path.join(outDir, '03-auth.png'),
      clip: {
        x: Math.max(0, box.x - 16),
        y: Math.max(0, box.y - 80),
        width: Math.min(1280, box.width + 32),
        height: Math.min(400, box.height + 120),
      },
    })
  } else {
    await page.screenshot({
      path: path.join(outDir, '03-auth.png'),
      fullPage: false,
    })
  }
  await context.close()
  console.log('wrote 03-auth.png')
}

// --- 04 error fallback (block FakeStore) ---
{
  const { context, page } = await freshPage()
  await page.route('**/fakestoreapi.com/**', (route) =>
    route.abort('failed'),
  )
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForSelector('text=오류 발생', { timeout: 30000 })
  await page.waitForSelector('text=다시 시도', { timeout: 10000 })
  const addButtons = page.getByRole('button', { name: '담기' })
  if ((await addButtons.count()) >= 1) await addButtons.nth(0).click()
  if ((await addButtons.count()) >= 2) await addButtons.nth(1).click()
  await page.waitForTimeout(800)
  await page.screenshot({
    path: path.join(outDir, '04-error-fallback.png'),
    fullPage: true,
  })
  await context.close()
  console.log('wrote 04-error-fallback.png')
}

await browser.close()
console.log('done:', outDir)
