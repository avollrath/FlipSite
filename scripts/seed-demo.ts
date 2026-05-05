import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'

type ItemStatus = 'holding' | 'listed' | 'sold' | 'keeper'

type DemoItem = {
  tsid: string
  user_id: string
  name: string
  category: string
  condition: string
  buy_price: number
  sell_price: number | null
  buy_platform: string | null
  sell_platform: string | null
  status: ItemStatus
  bought_at: string
  sold_at: string | null
  notes: string | null
  bundle_id: string | null
  is_bundle_parent: boolean
}

const demoEmail = 'demo@flipsite.app'
const demoPassword = 'demo1234'
const platforms = ['Amazon', 'eBay', 'Facebook Marketplace', 'Craigslist', 'BestBuy']
const sellPlatforms = ['eBay', 'Facebook Marketplace', 'Craigslist', 'Amazon']
const conditions = ['New', 'Like New', 'Good', 'Fair']

loadEnv('.env')
loadEnv('.env.local')

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const bundleSpecs = [
  {
    name: 'Canon DSLR lot with lenses',
    category: 'Cameras',
    buy: 420,
    children: ['Canon EOS 80D Body', 'Canon EF-S 24mm f/2.8 STM', 'Canon 430EX III-RT Flash'],
  },
  {
    name: 'Nintendo Switch family bundle',
    category: 'Gaming',
    buy: 310,
    children: ['Nintendo Switch OLED Console', 'Mario Kart 8 Deluxe', 'Zelda Tears of the Kingdom'],
  },
  {
    name: 'Sony audio desk bundle',
    category: 'Audio',
    buy: 190,
    children: ['Sony WH-1000XM4 Headphones', 'Blue Yeti USB Microphone', 'Focusrite Scarlett Solo 3rd Gen'],
  },
  {
    name: 'GoPro trail kit',
    category: 'Outdoor',
    buy: 155,
    children: ['GoPro HERO10 Black', 'GoPro Chest Mount', 'SanDisk Extreme 128GB microSD'],
  },
  {
    name: 'Retro Xbox bundle',
    category: 'Gaming',
    buy: 140,
    children: ['Xbox 360 Slim Console', 'Halo Reach', 'Red Dead Redemption', 'Gears of War 3'],
  },
  {
    name: 'Apple repair shelf lot',
    category: 'Electronics',
    buy: 510,
    children: ['iPad Pro 11-inch 2020', 'Apple Pencil 2nd Gen', 'Magic Keyboard 11-inch'],
  },
  {
    name: 'Patagonia outerwear lot',
    category: 'Clothing',
    buy: 120,
    children: ['Patagonia Nano Puff Jacket', 'Patagonia Better Sweater Vest', 'Arc teryx Conveyor Belt'],
  },
  {
    name: 'Golf garage bundle',
    category: 'Sports',
    buy: 240,
    children: ['TaylorMade SIM2 Driver', 'Odyssey White Hot Putter', 'Bushnell Tour V5 Rangefinder'],
  },
  {
    name: 'Home theater receiver lot',
    category: 'Electronics',
    buy: 220,
    children: ['Denon AVR-S760H Receiver', 'Roku Ultra 2022', 'Logitech Harmony Companion'],
  },
]

const standaloneNames = [
  ['Sony A6400 Mirrorless Camera', 'Cameras'],
  ['Fujifilm X-T30 II Body', 'Cameras'],
  ['Nikon D750 Body', 'Cameras'],
  ['Canon PowerShot G7 X Mark II', 'Cameras'],
  ['Sigma 18-35mm f/1.8 Art Lens', 'Cameras'],
  ['DJI Osmo Pocket 3', 'Cameras'],
  ['PlayStation 5 Disc Console', 'Gaming'],
  ['Nintendo 3DS XL Blue', 'Gaming'],
  ['Steam Deck 512GB LCD', 'Gaming'],
  ['Pokemon SoulSilver Nintendo DS', 'Gaming'],
  ['Super Smash Bros Ultimate', 'Gaming'],
  ['Game Boy Advance SP AGS-101', 'Gaming'],
  ['Xbox Series S 512GB', 'Gaming'],
  ['Meta Quest 2 128GB', 'Gaming'],
  ['MacBook Air M1 13-inch', 'Electronics'],
  ['Dell XPS 13 9310', 'Electronics'],
  ['iPad Mini 6 64GB', 'Electronics'],
  ['Samsung Galaxy Tab S8', 'Electronics'],
  ['Kindle Paperwhite 11th Gen', 'Electronics'],
  ['Apple Watch Series 8 45mm', 'Electronics'],
  ['Garmin Fenix 6 Pro', 'Electronics'],
  ['Bose QuietComfort Ultra Earbuds', 'Audio'],
  ['AirPods Pro 2nd Gen', 'Audio'],
  ['Sonos One SL Pair', 'Audio'],
  ['Audio-Technica AT-LP60XBT Turntable', 'Audio'],
  ['JBL Charge 5 Speaker', 'Audio'],
  ['Sennheiser HD 600 Headphones', 'Audio'],
  ['Yamaha HS5 Studio Monitor', 'Audio'],
  ['Osprey Atmos AG 65 Backpack', 'Outdoor'],
  ['Yeti Roadie 24 Cooler', 'Outdoor'],
  ['Coleman Cascade Camp Stove', 'Outdoor'],
  ['Garmin inReach Mini 2', 'Outdoor'],
  ['MSR Hubba Hubba 2 Tent', 'Outdoor'],
  ['Thule T2 Pro XTR Bike Rack', 'Outdoor'],
  ['Shimano Ultegra R8000 Groupset', 'Sports'],
  ['Wilson Pro Staff RF97 V13', 'Sports'],
  ['Bowflex SelectTech 552 Pair', 'Sports'],
  ['Concept2 Model D Rower PM5', 'Sports'],
  ['Callaway Rogue ST Max 3 Wood', 'Sports'],
  ['Nike Vaporfly 3 Mens 10.5', 'Sports'],
  ['Lululemon ABC Pant 32x32', 'Clothing'],
  ['Filson Tin Cloth Jacket', 'Clothing'],
  ['Red Wing Iron Ranger 8111', 'Clothing'],
  ['Levis 501 Selvedge Denim', 'Clothing'],
  ['The North Face Nuptse 1996 Jacket', 'Clothing'],
  ['Carhartt Detroit Jacket J97', 'Clothing'],
  ['Sony ZV-1 Vlogging Camera', 'Cameras'],
  ['Panasonic Lumix GH5 Body', 'Cameras'],
  ['Elgato Stream Deck MK.2', 'Electronics'],
  ['Ubiquiti UniFi Dream Machine', 'Electronics'],
  ['Anker 757 PowerHouse', 'Outdoor'],
  ['Bose SoundLink Revolve Plus II', 'Audio'],
  ['Klipsch R-51PM Powered Speakers', 'Audio'],
  ['Analogue Pocket Black', 'Gaming'],
  ['Sekonic L-308X-U Light Meter', 'Cameras'],
  ['Wacom Cintiq 16 Drawing Tablet', 'Electronics'],
  ['Garmin Edge 1040 Solar', 'Sports'],
  ['Theragun Elite Massager', 'Sports'],
  ['Barbour Beaufort Wax Jacket', 'Clothing'],
  ['Peak Design Everyday Backpack 30L', 'Outdoor'],
  ['Sony FE 85mm f/1.8 Lens', 'Cameras'],
  ['Nikon Z 50mm f/1.8 S Lens', 'Cameras'],
  ['Beyerdynamic DT 1990 Pro', 'Audio'],
] as const

async function main() {
  await supabase.auth.signUp({ email: demoEmail, password: demoPassword })

  const { data: signInData, error: signInError } =
    await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: demoPassword,
    })

  if (signInError || !signInData.user) {
    throw signInError ?? new Error('Unable to sign in demo user')
  }

  const userId = signInData.user.id
  const items = buildDemoItems(userId)

  const { error: deleteError } = await supabase
    .from('items')
    .delete()
    .eq('user_id', userId)

  if (deleteError) {
    throw deleteError
  }

  const { error: insertError } = await supabase.from('items').insert(items)

  if (insertError) {
    throw insertError
  }

  console.log(`Seeded ${items.length} demo items for ${demoEmail}`)
  console.log(`Demo user UUID: ${userId}`)
}

function buildDemoItems(userId: string) {
  const rows: DemoItem[] = []
  const statusPlan: ItemStatus[] = [
    ...Array<ItemStatus>(40).fill('sold'),
    ...Array<ItemStatus>(30).fill('holding'),
    ...Array<ItemStatus>(20).fill('keeper'),
    ...Array<ItemStatus>(10).fill('listed'),
  ]

  let index = 0

  for (const bundle of bundleSpecs) {
    const parentId = randomUUID()
    const parentStatus = statusPlan[index]
    rows.push(
      makeItem({
        buyPrice: bundle.buy,
        category: bundle.category,
        index,
        isBundleParent: true,
        name: bundle.name,
        status: parentStatus,
        tsid: parentId,
        userId,
      }),
    )
    index += 1

    const splitBuy = Math.round((bundle.buy / bundle.children.length) * 100) / 100
    for (const childName of bundle.children) {
      rows.push(
        makeItem({
          bundleId: parentId,
          buyPrice: splitBuy,
          category: bundle.category,
          index,
          name: childName,
          status: statusPlan[index],
          userId,
        }),
      )
      index += 1
    }
  }

  for (const [name, category] of standaloneNames) {
    rows.push(
      makeItem({
        buyPrice: buyPriceFor(index, category),
        category,
        index,
        name,
        status: statusPlan[index],
        userId,
      }),
    )
    index += 1
  }

  if (rows.length !== 100) {
    throw new Error(`Expected 100 demo items, got ${rows.length}`)
  }

  return rows
}

function makeItem({
  bundleId = null,
  buyPrice,
  category,
  index,
  isBundleParent = false,
  name,
  status,
  tsid = randomUUID(),
  userId,
}: {
  bundleId?: string | null
  buyPrice: number
  category: string
  index: number
  isBundleParent?: boolean
  name: string
  status: ItemStatus
  tsid?: string
  userId: string
}): DemoItem {
  const boughtAt = dateForIndex(index)
  const soldAt =
    status === 'sold'
      ? new Date(new Date(boughtAt).getTime() + (18 + (index % 55)) * 86400000).toISOString()
      : null
  const sellPrice = status === 'sold' || status === 'listed'
    ? sellPriceFor(buyPrice, index, status)
    : null

  return {
    tsid,
    user_id: userId,
    name,
    category,
    condition: conditions[index % conditions.length],
    buy_price: buyPrice,
    sell_price: sellPrice,
    buy_platform: platforms[index % platforms.length],
    sell_platform: sellPrice ? sellPlatforms[index % sellPlatforms.length] : null,
    status,
    bought_at: boughtAt,
    sold_at: soldAt,
    notes: noteFor(status, index),
    bundle_id: bundleId,
    is_bundle_parent: isBundleParent,
  }
}

function buyPriceFor(index: number, category: string) {
  const ranges: Record<string, [number, number]> = {
    Audio: [35, 260],
    Cameras: [90, 650],
    Clothing: [18, 140],
    Electronics: [45, 720],
    Gaming: [20, 450],
    Outdoor: [25, 360],
    Sports: [30, 520],
  }
  const [min, max] = ranges[category] ?? [20, 300]
  const ratio = ((index * 37) % 100) / 100
  return Math.round((min + (max - min) * ratio) * 100) / 100
}

function sellPriceFor(buyPrice: number, index: number, status: ItemStatus) {
  if (status === 'listed') {
    return Math.round(buyPrice * (1.25 + (index % 5) * 0.12) * 100) / 100
  }

  const multipliers = [0.72, 0.88, 1.5, 1.75, 2.1, 2.65, 3.0]
  return Math.round(buyPrice * multipliers[index % multipliers.length] * 100) / 100
}

function dateForIndex(index: number) {
  const start = new Date('2023-01-04T12:00:00.000Z').getTime()
  const end = new Date().getTime()
  const timestamp = start + ((end - start) * index) / 99
  return new Date(timestamp).toISOString()
}

function noteFor(status: ItemStatus, index: number) {
  if (status === 'sold') {
    return index % 6 === 0 ? 'Accepted a lower offer to move inventory.' : 'Cleaned, tested and photographed before listing.'
  }

  if (status === 'listed') {
    return 'Listed with fresh photos and comps checked this week.'
  }

  if (status === 'keeper') {
    return 'Keeping this one for personal use unless market price jumps.'
  }

  return index % 4 === 0 ? 'Needs photos before listing.' : 'Ready for listing after final test.'
}

function loadEnv(fileName: string) {
  try {
    const content = readFileSync(resolve(process.cwd(), fileName), 'utf8')
    for (const line of content.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
      if (!match) {
        continue
      }

      const [, key, rawValue] = match
      if (process.env[key]) {
        continue
      }

      process.env[key] = rawValue.replace(/^["']|["']$/g, '')
    }
  } catch {
    return
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
