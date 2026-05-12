// @ts-check
const { chromium } = require('@playwright/test')
const path = require('path')
const fs = require('fs')

const BASE_URL = 'http://localhost:5173'
const OUT_DIR = path.join(__dirname, '../public/screenshots')
const DEMO_EMAIL = 'demo@flipsite.app'
const DEMO_PASS = 'demo1234'

async function wait(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  const browser = await chromium.launch({ headless: true })

  // ── Desktop context ─────────────────────────────────────────────
  const desktop = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    storageState: undefined,
  })

  const page = await desktop.newPage()

  // Force light mode via localStorage before any navigation
  await page.goto(BASE_URL)
  await page.evaluate(() => {
    localStorage.setItem('flipsite-theme-mode', 'light')
    localStorage.setItem('flipsite-theme', 'midnight')
  })

  // ── Log in with demo account ─────────────────────────────────────
  await page.goto(`${BASE_URL}/login`)
  await wait(800)
  await page.fill('input[type="email"], input[name="email"]', DEMO_EMAIL)
  await page.fill('input[type="password"], input[name="password"]', DEMO_PASS)
  await page.click('button[type="submit"]')
  await wait(3000)

  // Re-apply light mode after login (React re-reads localStorage)
  await page.evaluate(() => {
    localStorage.setItem('flipsite-theme-mode', 'light')
  })
  await page.reload()
  await wait(2000)

  // ── 1. Dashboard overview ────────────────────────────────────────
  await page.goto(`${BASE_URL}/dashboard`)
  await wait(2500)
  await page.screenshot({
    path: path.join(OUT_DIR, 'dashboard-overview.png'),
    fullPage: false,
  })
  console.log('✓ dashboard-overview.png')

  // ── 2. Inventory table ───────────────────────────────────────────
  await page.goto(`${BASE_URL}/items`)
  await wait(2000)
  // Make sure we're in table/list view (not gallery)
  const tableBtn = page.locator('[aria-label="List view"]').first()
  if (await tableBtn.isVisible().catch(() => false)) {
    await tableBtn.click()
    await wait(500)
  }
  await page.screenshot({
    path: path.join(OUT_DIR, 'inventory-table.png'),
    fullPage: false,
  })
  console.log('✓ inventory-table.png')

  // ── 3. Inventory gallery ─────────────────────────────────────────
  const galleryBtn = page.locator('[aria-label="Gallery view"]').first()
  if (await galleryBtn.isVisible().catch(() => false)) {
    await galleryBtn.click()
    await wait(800)
  }
  await page.screenshot({
    path: path.join(OUT_DIR, 'inventory-gallery.png'),
    fullPage: false,
  })
  console.log('✓ inventory-gallery.png')

  // ── 4. Item detail ───────────────────────────────────────────────
  // Click on first item row or card to open detail
  await page.goto(`${BASE_URL}/items`)
  await wait(1500)
  const firstItem = page.locator('tr[data-item-id], tr.cursor-pointer, [data-item], .item-card, tbody tr').first()
  if (await firstItem.isVisible().catch(() => false)) {
    await firstItem.click()
    await wait(1500)
  }
  await page.screenshot({
    path: path.join(OUT_DIR, 'item-detail.png'),
    fullPage: false,
  })
  console.log('✓ item-detail.png')

  // ── 5. Add item form ─────────────────────────────────────────────
  await page.goto(`${BASE_URL}/items`)
  await wait(1200)
  // Find the "Add item" / "+" / "New item" button
  const addBtn = page.locator('button:has-text("Add"), button:has-text("New item"), button[aria-label*="add"], button[aria-label*="new"]').first()
  if (await addBtn.isVisible().catch(() => false)) {
    await addBtn.click()
    await wait(1200)
    // Fill a few fields to make it look populated
    const nameField = page.locator('input[name="name"], input[placeholder*="name"], input[placeholder*="Name"]').first()
    if (await nameField.isVisible().catch(() => false)) {
      await nameField.fill('Canon EF 50mm f/1.8 STM')
    }
    const priceField = page.locator('input[name="buy_price"], input[name="purchase_price"], input[placeholder*="price"], input[placeholder*="Price"]').first()
    if (await priceField.isVisible().catch(() => false)) {
      await priceField.fill('89')
    }
  }
  await page.screenshot({
    path: path.join(OUT_DIR, 'add-item-form.png'),
    fullPage: false,
  })
  console.log('✓ add-item-form.png')

  // ── 6. Profit chart ──────────────────────────────────────────────
  await page.goto(`${BASE_URL}/dashboard`)
  await wait(2500)
  // Scroll to the profit chart area
  await page.evaluate(() => window.scrollBy(0, 400))
  await wait(500)
  await page.screenshot({
    path: path.join(OUT_DIR, 'profit-chart.png'),
    fullPage: false,
  })
  console.log('✓ profit-chart.png')

  // ── 7. Category breakdown ─────────────────────────────────────────
  await page.goto(`${BASE_URL}/analytics`)
  await wait(2500)
  await page.screenshot({
    path: path.join(OUT_DIR, 'category-breakdown.png'),
    fullPage: false,
  })
  console.log('✓ category-breakdown.png')

  // ── 8. Mobile dashboard ───────────────────────────────────────────
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
  })
  const mobilePage = await mobile.newPage()

  await mobilePage.goto(BASE_URL)
  await mobilePage.evaluate(() => {
    localStorage.setItem('flipsite-theme-mode', 'light')
    localStorage.setItem('flipsite-theme', 'midnight')
  })
  await mobilePage.goto(`${BASE_URL}/login`)
  await wait(800)
  await mobilePage.fill('input[type="email"], input[name="email"]', DEMO_EMAIL)
  await mobilePage.fill('input[type="password"], input[name="password"]', DEMO_PASS)
  await mobilePage.click('button[type="submit"]')
  await wait(3000)
  await mobilePage.evaluate(() => {
    localStorage.setItem('flipsite-theme-mode', 'light')
  })
  await mobilePage.goto(`${BASE_URL}/dashboard`)
  await wait(2500)
  await mobilePage.screenshot({
    path: path.join(OUT_DIR, 'mobile-dashboard.png'),
    fullPage: false,
  })
  console.log('✓ mobile-dashboard.png')

  await mobile.close()
  await desktop.close()
  await browser.close()

  // Verify all files exist
  const expected = [
    'dashboard-overview.png',
    'inventory-table.png',
    'inventory-gallery.png',
    'item-detail.png',
    'add-item-form.png',
    'profit-chart.png',
    'category-breakdown.png',
    'mobile-dashboard.png',
  ]
  console.log('\nVerifying output:')
  let ok = true
  for (const f of expected) {
    const fp = path.join(OUT_DIR, f)
    const exists = fs.existsSync(fp) && fs.statSync(fp).size > 0
    console.log(`  ${exists ? '✓' : '✗'} ${f} ${exists ? `(${Math.round(fs.statSync(fp).size / 1024)}kb)` : 'MISSING'}`)
    if (!exists) ok = false
  }
  if (!ok) process.exit(1)
  console.log('\nAll screenshots captured.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
