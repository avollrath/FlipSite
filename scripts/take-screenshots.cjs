// @ts-check
const { chromium } = require('@playwright/test')
const path = require('path')
const fs = require('fs')

const BASE_URL = 'http://localhost:5173'
const OUT_DIR = path.join(__dirname, '../public/screenshots')
const DEMO_EMAIL = 'demo@flipsite.app'
const DEMO_PASS = 'demo1234'
const PAD = 24

async function wait(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}

/** Pad a bounding box and clamp to viewport */
function padBox(box, vpW, vpH) {
  return {
    x: clamp(box.x - PAD, 0, vpW),
    y: clamp(box.y - PAD, 0, vpH),
    width: clamp(box.width + PAD * 2, 1, vpW - clamp(box.x - PAD, 0, vpW)),
    height: clamp(box.height + PAD * 2, 1, vpH - clamp(box.y - PAD, 0, vpH)),
  }
}

async function getBox(page, selector, vpW, vpH) {
  const el = page.locator(selector).first()
  const box = await el.boundingBox().catch(() => null)
  if (!box) return null
  return padBox(box, vpW, vpH)
}

async function loginDemo(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } })
  const page = await ctx.newPage()
  await page.goto(BASE_URL)
  await page.evaluate(() => {
    localStorage.setItem('flipsite-theme-mode', 'light')
    localStorage.setItem('flipsite-theme', 'midnight')
  })
  await page.goto(`${BASE_URL}/login`)
  await wait(600)
  await page.fill('input[type="email"]', DEMO_EMAIL)
  await page.fill('input[type="password"]', DEMO_PASS)
  await page.click('button[type="submit"]')
  await wait(3000)
  await page.evaluate(() => localStorage.setItem('flipsite-theme-mode', 'light'))
  return { ctx, page }
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })
  const browser = await chromium.launch({ headless: true })

  // ── Desktop context (1920×1080) ──────────────────────────────────
  const { ctx: desktop, page } = await loginDemo(browser)
  const VP_W = 1920
  const VP_H = 1080

  // ── 1. Dashboard overview — clip to main content (exclude sidebar) ─
  await page.goto(`${BASE_URL}/dashboard`)
  await wait(2500)
  // Main content area: everything to the right of the sidebar
  let clip = await getBox(page, 'main, [class*="main-content"], [class*="content-area"], .flex-1.overflow', VP_W, VP_H)
  if (!clip) {
    // Fallback: clip to the page body starting after the sidebar (~280px from left)
    clip = { x: 260, y: 56, width: VP_W - 260, height: VP_H - 56 }
  }
  await page.screenshot({ path: path.join(OUT_DIR, 'dashboard-overview.png'), clip })
  console.log('✓ dashboard-overview.png')

  // ── 2. Inventory table ───────────────────────────────────────────
  await page.goto(`${BASE_URL}/items`)
  await wait(2000)
  // Make sure list view is active
  const listBtn = page.locator('[aria-label="List view"]').first()
  if (await listBtn.isVisible().catch(() => false)) { await listBtn.click(); await wait(400) }
  clip = await getBox(page, 'main, [class*="main-content"], .flex-1.overflow', VP_W, VP_H)
  if (!clip) clip = { x: 260, y: 56, width: VP_W - 260, height: VP_H - 56 }
  await page.screenshot({ path: path.join(OUT_DIR, 'inventory-table.png'), clip })
  console.log('✓ inventory-table.png')

  // ── 3. Inventory gallery ─────────────────────────────────────────
  const galleryBtn = page.locator('[aria-label="Gallery view"]').first()
  if (await galleryBtn.isVisible().catch(() => false)) { await galleryBtn.click(); await wait(900) }
  clip = await getBox(page, 'main, [class*="main-content"], .flex-1.overflow', VP_W, VP_H)
  if (!clip) clip = { x: 260, y: 56, width: VP_W - 260, height: VP_H - 56 }
  await page.screenshot({ path: path.join(OUT_DIR, 'inventory-gallery.png'), clip })
  console.log('✓ inventory-gallery.png')

  // ── 4. Item detail — click first row to open modal ───────────────
  await page.goto(`${BASE_URL}/items`)
  await wait(1500)
  const firstRow = page.locator('tbody tr').first()
  if (await firstRow.isVisible().catch(() => false)) { await firstRow.click(); await wait(1500) }
  // Clip to just the modal/panel (not the blurred background)
  const modalSelectors = [
    '[role="dialog"]',
    '[data-radix-dialog-content]',
    '.modal-content',
    '[class*="modal"]',
    '[class*="dialog"]',
    '[class*="panel"]',
    '[class*="drawer"]',
  ]
  let modalClip = null
  for (const sel of modalSelectors) {
    const box = await page.locator(sel).first().boundingBox().catch(() => null)
    if (box && box.width > 200) { modalClip = padBox(box, VP_W, VP_H); break }
  }
  if (modalClip) {
    await page.screenshot({ path: path.join(OUT_DIR, 'item-detail.png'), clip: modalClip })
  } else {
    clip = { x: 260, y: 56, width: VP_W - 260, height: VP_H - 56 }
    await page.screenshot({ path: path.join(OUT_DIR, 'item-detail.png'), clip })
  }
  console.log('✓ item-detail.png')

  // ── 5. Add item form — clip to modal only ────────────────────────
  await page.goto(`${BASE_URL}/items`)
  await wait(1200)
  const addBtn = page.locator('button:has-text("Add Item"), button:has-text("Add"), button[aria-label*="add"]').first()
  if (await addBtn.isVisible().catch(() => false)) { await addBtn.click(); await wait(1200) }
  let addModalClip = null
  for (const sel of modalSelectors) {
    const box = await page.locator(sel).first().boundingBox().catch(() => null)
    if (box && box.width > 200) { addModalClip = padBox(box, VP_W, VP_H); break }
  }
  if (addModalClip) {
    await page.screenshot({ path: path.join(OUT_DIR, 'add-item-form.png'), clip: addModalClip })
  } else {
    clip = { x: Math.round(VP_W * 0.35), y: 0, width: Math.round(VP_W * 0.65), height: VP_H }
    await page.screenshot({ path: path.join(OUT_DIR, 'add-item-form.png'), clip })
  }
  console.log('✓ add-item-form.png')

  // ── 6. Profit chart ──────────────────────────────────────────────
  await page.goto(`${BASE_URL}/dashboard`)
  await wait(2500)
  await page.evaluate(() => window.scrollBy(0, 500))
  await wait(600)
  // Try to clip to the cumulative profit chart
  const chartSelectors = [
    '[class*="chart"]',
    '[class*="Chart"]',
    'canvas',
    '[class*="recharts"]',
    '[class*="profit"]',
  ]
  let chartClip = null
  for (const sel of chartSelectors) {
    const box = await page.locator(sel).first().boundingBox().catch(() => null)
    if (box && box.width > 200 && box.height > 100) { chartClip = padBox(box, VP_W, VP_H); break }
  }
  if (chartClip) {
    await page.screenshot({ path: path.join(OUT_DIR, 'profit-chart.png'), clip: chartClip })
  } else {
    clip = await getBox(page, 'main, [class*="main-content"], .flex-1.overflow', VP_W, VP_H)
    if (!clip) clip = { x: 260, y: 56, width: VP_W - 260, height: VP_H - 56 }
    await page.screenshot({ path: path.join(OUT_DIR, 'profit-chart.png'), clip })
  }
  console.log('✓ profit-chart.png')

  // ── 7. Category breakdown ─────────────────────────────────────────
  await page.goto(`${BASE_URL}/analytics`)
  await wait(2500)
  clip = await getBox(page, 'main, [class*="main-content"], .flex-1.overflow', VP_W, VP_H)
  if (!clip) clip = { x: 260, y: 56, width: VP_W - 260, height: VP_H - 56 }
  await page.screenshot({ path: path.join(OUT_DIR, 'category-breakdown.png'), clip })
  console.log('✓ category-breakdown.png')

  await desktop.close()

  // ── 8. Mobile dashboard ───────────────────────────────────────────
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const mobilePage = await mobile.newPage()
  await mobilePage.goto(BASE_URL)
  await mobilePage.evaluate(() => {
    localStorage.setItem('flipsite-theme-mode', 'light')
    localStorage.setItem('flipsite-theme', 'midnight')
  })
  await mobilePage.goto(`${BASE_URL}/login`)
  await wait(600)
  await mobilePage.fill('input[type="email"]', DEMO_EMAIL)
  await mobilePage.fill('input[type="password"]', DEMO_PASS)
  await mobilePage.click('button[type="submit"]')
  await wait(3000)
  await mobilePage.evaluate(() => localStorage.setItem('flipsite-theme-mode', 'light'))
  await mobilePage.goto(`${BASE_URL}/dashboard`)
  await wait(2500)
  await mobilePage.screenshot({ path: path.join(OUT_DIR, 'mobile-dashboard.png'), fullPage: false })
  console.log('✓ mobile-dashboard.png')

  await mobile.close()
  await browser.close()

  // Verify
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

main().catch((e) => { console.error(e); process.exit(1) })
