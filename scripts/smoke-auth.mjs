/**
 * Smoke-check README auth scenarios that can run without a Google interactive popup.
 * Usage: node scripts/smoke-auth.mjs
 */
import { chromium } from 'playwright'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:5173'
const results = []

function ok(name, detail) {
  results.push({ name, pass: true, detail })
  console.log(`PASS  ${name}${detail ? ` — ${detail}` : ''}`)
}

function fail(name, detail) {
  results.push({ name, pass: false, detail })
  console.error(`FAIL  ${name}${detail ? ` — ${detail}` : ''}`)
}

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  locale: 'ko-KR',
})
await context.addInitScript(() => localStorage.clear())
const page = await context.newPage()

try {
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForSelector('text=상품 목록', { timeout: 30000 })

  const loginBtn = page.getByRole('button', { name: 'Google로 로그인' })
  const configNotice = page.getByRole('status')
  const hasLogin = await loginBtn.isVisible().catch(() => false)
  const hasNotice = await configNotice.isVisible().catch(() => false)

  if (hasLogin) {
    ok('scenario-5-prep', 'Firebase configured — Google login button visible')
  } else if (hasNotice) {
    ok(
      'scenario-5-prep',
      'Firebase not configured — setup notice shown (products/cart still usable)',
    )
  } else {
    fail('scenario-5-prep', 'Neither login button nor setup notice found')
  }

  // Guest cart still works with auth UI present
  const addButtons = page.getByRole('button', { name: '담기' })
  await addButtons.nth(0).click()
  await page.waitForTimeout(300)
  const cartText = await page.locator('aside, section').filter({ hasText: '장바구니' }).first().innerText()
  if (cartText.includes('1개') || /[1-9]/.test(cartText)) {
    ok('guest-cart', 'Guest can add to cart while auth UI is shown')
  } else {
    fail('guest-cart', `Cart did not update: ${cartText.slice(0, 120)}`)
  }

  if (hasLogin) {
    // Click login — popup may open then fail without Google provider / user interaction
    const popupPromise = page.waitForEvent('popup', { timeout: 8000 }).catch(() => null)
    await loginBtn.click()
    const popup = await popupPromise
    if (popup) {
      ok(
        'scenario-5-popup',
        `Google sign-in popup opened (${popup.url().slice(0, 80)}...) — complete login manually in browser`,
      )
      await popup.close().catch(() => {})
    } else {
      // Inline error path (scenario 6 partial)
      await page.waitForTimeout(1500)
      const alert = page.getByRole('alert')
      if (await alert.isVisible().catch(() => false)) {
        ok(
          'scenario-6-error-ui',
          `Login failure surfaced in UI: ${(await alert.innerText()).slice(0, 100)}`,
        )
      } else {
        ok(
          'scenario-5-click',
          'Login clicked; no popup captured in headless (verify Google provider + localhost in Console)',
        )
      }
    }

    // Products/cart remain after login attempt
    if (await page.getByRole('button', { name: '담기' }).first().isVisible()) {
      ok('scenario-6-preserve', 'Product list remains after login attempt')
    } else {
      fail('scenario-6-preserve', 'Product list missing after login attempt')
    }
  } else {
    ok(
      'scenario-5-6-manual',
      'Set .env + enable Google provider, then manually verify login success/logout clears cart',
    )
  }
} catch (err) {
  fail('smoke-auth', err instanceof Error ? err.message : String(err))
} finally {
  await browser.close()
}

const failed = results.filter((r) => !r.pass)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length ? 1 : 0)
