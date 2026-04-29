import { Loader2, Trash2 } from 'lucide-react'
import {
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'
import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  useAddItem,
  useDeleteItem,
  useItems,
  useUpdateItem,
  type NewItem,
} from '@/hooks/useItems'
import { calcProfit, calcROI, formatCurrency } from '@/lib/utils'
import type { Item, ItemStatus } from '@/types'

type ItemDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'add' | 'edit'
  item?: Item | null
}

type DrawerFormProps = ItemDrawerProps

type FormState = {
  name: string
  category: string
  condition: string
  buy_price: string
  sell_price: string
  platform: string
  status: ItemStatus
  bought_at: string
  sold_at: string
  notes: string
}

const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor']
const platforms = [
  'eBay',
  'Facebook Marketplace',
  'Vinted',
  'Depop',
  'Craigslist',
  'Other',
]
const statuses: ItemStatus[] = ['holding', 'listed', 'sold']

export function ItemDrawer(props: ItemDrawerProps) {
  const { open, onOpenChange, mode, item } = props
  const formKey = `${mode}-${item?.tsid ?? 'new'}-${open ? 'open' : 'closed'}`

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <ItemDrawerForm key={formKey} {...props} />
      </SheetContent>
    </Sheet>
  )
}

function ItemDrawerForm({ mode, item, onOpenChange }: DrawerFormProps) {
  const { data: items = [] } = useItems()
  const addItem = useAddItem()
  const updateItem = useUpdateItem()
  const deleteItem = useDeleteItem()
  const [form, setForm] = useState<FormState>(() => getInitialState(item))
  const [confirmDelete, setConfirmDelete] = useState(false)

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          items
            .map((existingItem) => existingItem.category)
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b)),
        ),
      ),
    [items],
  )

  const buyPrice = Number.parseFloat(form.buy_price)
  const sellPrice = Number.parseFloat(form.sell_price)
  const normalizedBuyPrice = Number.isFinite(buyPrice) ? buyPrice : null
  const normalizedSellPrice = Number.isFinite(sellPrice) ? sellPrice : null
  const profit = calcProfit(normalizedBuyPrice, normalizedSellPrice)
  const roi = calcROI(normalizedBuyPrice, normalizedSellPrice)
  const isSubmitting = addItem.isPending || updateItem.isPending
  const isDeleting = deleteItem.isPending

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((currentForm) => ({
      ...currentForm,
      [key]: value,
      ...(key === 'status' && value !== 'sold' ? { sold_at: '' } : {}),
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const name = form.name.trim()
    const category = form.category.trim()
    const buyPriceValue = Number.parseFloat(form.buy_price)
    const sellPriceValue = Number.parseFloat(form.sell_price)

    if (!name) {
      toast.error('Name is required')
      return
    }

    if (!Number.isFinite(buyPriceValue)) {
      toast.error('Buy price is required')
      return
    }

    if (!form.bought_at) {
      toast.error('Date bought is required')
      return
    }

    if (form.status === 'sold' && !Number.isFinite(sellPriceValue)) {
      toast.error('Sell price is required when an item is sold')
      return
    }

    const payload: NewItem = {
      name,
      category,
      condition: form.condition,
      buy_price: buyPriceValue,
      sell_price: Number.isFinite(sellPriceValue) ? sellPriceValue : null,
      platform: form.platform,
      status: form.status,
      bought_at: toIsoDate(form.bought_at),
      sold_at:
        form.status === 'sold' && form.sold_at ? toIsoDate(form.sold_at) : null,
      notes: form.notes.trim() || null,
    }

    try {
      if (mode === 'edit' && item) {
        await updateItem.mutateAsync({
          tsid: item.tsid,
          updates: payload,
        })
      } else {
        await addItem.mutateAsync(payload)
      }

      onOpenChange(false)
    } catch {
      return
    }
  }

  async function handleDelete() {
    if (!item) {
      return
    }

    try {
      await deleteItem.mutateAsync(item.tsid)
      onOpenChange(false)
    } catch {
      return
    }
  }

  return (
    <>
      <SheetHeader>
        <SheetTitle>{mode === 'edit' ? 'Edit Item' : 'Add Item'}</SheetTitle>
        <SheetDescription>
          Capture purchase details, listing status, and resale performance.
        </SheetDescription>
      </SheetHeader>

      <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-6">
          <div className="rounded-lg border border-violet-200 bg-violet-50 p-4 dark:border-violet-500/30 dark:bg-violet-500/10">
            <p className="text-sm font-medium text-violet-700 dark:text-violet-300">
              Profit Preview
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <SummaryValue
                label="Profit"
                value={profit === null ? '--' : formatCurrency(profit)}
              />
              <SummaryValue
                label="ROI"
                value={roi === null ? '--' : `${roi.toFixed(1)}%`}
              />
            </div>
          </div>

          <Field label="Name" required>
            <input
              className={inputClassName}
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              required
            />
          </Field>

          <Field label="Category">
            <input
              className={inputClassName}
              value={form.category}
              list="item-categories"
              onChange={(event) => updateField('category', event.target.value)}
            />
            <datalist id="item-categories">
              {categories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Condition">
              <select
                className={inputClassName}
                value={form.condition}
                onChange={(event) =>
                  updateField('condition', event.target.value)
                }
              >
                {conditions.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Platform">
              <select
                className={inputClassName}
                value={form.platform}
                onChange={(event) => updateField('platform', event.target.value)}
              >
                {platforms.map((platform) => (
                  <option key={platform} value={platform}>
                    {platform}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Buy Price" required>
              <input
                className={inputClassName}
                type="number"
                min="0"
                step="0.01"
                value={form.buy_price}
                onChange={(event) =>
                  updateField('buy_price', event.target.value)
                }
                required
              />
            </Field>

            <Field label="Sell Price" required={form.status === 'sold'}>
              <input
                className={inputClassName}
                type="number"
                min="0"
                step="0.01"
                value={form.sell_price}
                onChange={(event) =>
                  updateField('sell_price', event.target.value)
                }
                required={form.status === 'sold'}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Status">
              <select
                className={inputClassName}
                value={form.status}
                onChange={(event) =>
                  updateField('status', event.target.value as ItemStatus)
                }
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Date Bought" required>
              <input
                className={inputClassName}
                type="date"
                value={form.bought_at}
                onChange={(event) =>
                  updateField('bought_at', event.target.value)
                }
                required
              />
            </Field>
          </div>

          {form.status === 'sold' ? (
            <Field label="Date Sold">
              <input
                className={inputClassName}
                type="date"
                value={form.sold_at}
                onChange={(event) => updateField('sold_at', event.target.value)}
              />
            </Field>
          ) : null}

          <Field label="Notes">
            <textarea
              className={`${inputClassName} min-h-28 resize-none`}
              value={form.notes}
              onChange={(event) => updateField('notes', event.target.value)}
            />
          </Field>

          {mode === 'edit' ? (
            <DeletePanel
              confirming={confirmDelete}
              deleting={isDeleting}
              onCancel={() => setConfirmDelete(false)}
              onConfirm={handleDelete}
              onStart={() => setConfirmDelete(true)}
            />
          ) : null}
        </div>

        <SheetFooter>
          <button
            type="button"
            className="rounded-lg border border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/10"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/25 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : null}
            {mode === 'edit' ? 'Save Changes' : 'Add Item'}
          </button>
        </SheetFooter>
      </form>
    </>
  )
}

function SummaryValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  )
}

function DeletePanel({
  confirming,
  deleting,
  onCancel,
  onConfirm,
  onStart,
}: {
  confirming: boolean
  deleting: boolean
  onCancel: () => void
  onConfirm: () => void
  onStart: () => void
}) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-500/30 dark:bg-red-500/10">
      {confirming ? (
        <div>
          <p className="text-sm font-medium text-red-700 dark:text-red-300">
            Delete this item?
          </p>
          <p className="mt-1 text-sm text-red-600/80 dark:text-red-200/80">
            This action cannot be undone.
          </p>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-70"
              onClick={onConfirm}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Confirm Delete'}
            </button>
            <button
              type="button"
              className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-500/30 dark:text-red-200 dark:hover:bg-red-500/10"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="flex items-center gap-2 text-sm font-semibold text-red-700 transition hover:text-red-800 dark:text-red-300 dark:hover:text-red-200"
          onClick={onStart}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Delete Item
        </button>
      )}
    </div>
  )
}

function Field({
  children,
  label,
  required,
}: {
  children: ReactNode
  label: string
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
        {required ? <span className="text-violet-600"> *</span> : null}
      </span>
      <span className="mt-2 block">{children}</span>
    </label>
  )
}

function todayInputValue() {
  return new Date().toISOString().slice(0, 10)
}

function toDateInputValue(value: string | null | undefined) {
  return value ? value.slice(0, 10) : ''
}

function toIsoDate(value: string) {
  return new Date(`${value}T00:00:00`).toISOString()
}

function getInitialState(item?: Item | null): FormState {
  return {
    name: item?.name ?? '',
    category: item?.category ?? '',
    condition: item?.condition ?? 'Good',
    buy_price: item?.buy_price === undefined ? '' : String(item.buy_price),
    sell_price:
      item?.sell_price === null || item?.sell_price === undefined
        ? ''
        : String(item.sell_price),
    platform: item?.platform ?? 'eBay',
    status: item?.status ?? 'holding',
    bought_at: toDateInputValue(item?.bought_at) || todayInputValue(),
    sold_at: toDateInputValue(item?.sold_at),
    notes: item?.notes ?? '',
  }
}

const inputClassName =
  'w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 dark:border-white/10 dark:bg-[#0a0a0f] dark:text-zinc-50 dark:focus:border-violet-400'
