export type ItemStatus = 'holding' | 'listed' | 'sold'

export type Item = {
  tsid: string
  user_id: string
  name: string
  category: string
  condition: string
  buy_price: number
  sell_price: number | null
  platform: string
  status: ItemStatus
  bought_at: string
  sold_at: string | null
  notes: string | null
  created_at: string
}
