import {
  Check,
  ChevronsUpDown,
  Link2,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react'
import {
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'
import { toast } from 'sonner'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
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
  useAddBundle,
  useDeleteItem,
  useItems,
  useUpdateItem,
  type ItemUpdate,
  type NewBundleChild,
  type NewItem,
} from '@/hooks/useItems'
import { calcProfit, formatCurrency, getStatusLabel } from '@/lib/utils'
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

type BundleChildForm = {
  id: string
  tsid?: string
  name: string
  condition: string
  category: string
  status: ItemStatus
  buy_price: string
}

type NormalizedBundleChild = Omit<NewBundleChild, 'buy_price'> & {
  buy_price: number
  localId: string
  tsid?: string
}

const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor']
const defaultPlatforms = ['Tori.fi', 'Amazon.de', 'Verkkokauppa.fi']
const statuses: ItemStatus[] = ['holding', 'listed', 'sold', 'keeper']

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
  const addBundle = useAddBundle()
  const updateItem = useUpdateItem()
  const deleteItem = useDeleteItem()
  const [form, setForm] = useState<FormState>(() => getInitialState(item))
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [platformOpen, setPlatformOpen] = useState(false)
  const [isBundle, setIsBundle] = useState(Boolean(item?.is_bundle_parent))
  const [bundleChildren, setBundleChildren] = useState<BundleChildForm[]>(() =>
    getInitialBundleChildren(item, items),
  )

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
  const platforms = useMemo(() => {
    const usedPlatforms = uniqueValues(items.map((existingItem) => existingItem.platform))
    return usedPlatforms.length > 0 ? usedPlatforms : defaultPlatforms
  }, [items])

  const showSellFields = form.status === 'sold' || form.status === 'listed'

  const buyPrice = Number.parseFloat(form.buy_price)
  const sellPrice = Number.parseFloat(form.sell_price)
  const normalizedBuyPrice = Number.isFinite(buyPrice) ? buyPrice : null
  const normalizedSellPrice = Number.isFinite(sellPrice) ? sellPrice : null
  const existingBundleChildSell = item?.tsid
    ? items
        .filter((child) => child.bundle_id === item.tsid)
        .reduce((sum, child) => sum + (child.sell_price ?? 0), 0)
    : 0
  const profit = getPreviewProfit({
    bundleChildSell: existingBundleChildSell,
    buyPrice: normalizedBuyPrice,
    isBundle,
    isBundleChild: Boolean(item?.bundle_id),
    sellPrice: normalizedSellPrice,
  })
  const roi =
    profit === null || !normalizedBuyPrice
      ? null
      : (profit / normalizedBuyPrice) * 100
  const isSubmitting =
    addItem.isPending || addBundle.isPending || updateItem.isPending
  const isDeleting = deleteItem.isPending

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((currentForm) => ({
      ...currentForm,
      [key]: value,
      ...(key === 'status' && value !== 'sold' && value !== 'listed'
        ? { sell_price: '', sold_at: '' }
        : {}),
    }))
  }

  function updateBundleChild<K extends keyof BundleChildForm>(
    id: string,
    key: K,
    value: BundleChildForm[K],
  ) {
    setBundleChildren((children) =>
      children.map((child) =>
        child.id === id ? { ...child, [key]: value } : child,
      ),
    )
  }

  function addBundleChild() {
    setBundleChildren((children) => [...children, createEmptyBundleChild()])
  }

  function removeBundleChild(id: string) {
    setBundleChildren((children) => children.filter((child) => child.id !== id))
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
      sell_price:
        showSellFields && Number.isFinite(sellPriceValue) ? sellPriceValue : null,
      platform: form.platform,
      status: form.status,
      bought_at: toIsoDate(form.bought_at),
      sold_at: showSellFields && form.sold_at ? toIsoDate(form.sold_at) : null,
      notes: form.notes.trim() || null,
    }

    try {
      if (mode === 'edit' && item) {
        const updates: ItemUpdate = { ...payload }

        if (isBundle || item.is_bundle_parent) {
          updates.is_bundle_parent = isBundle
        }

        await updateItem.mutateAsync({
          tsid: item.tsid,
          updates,
        })

        if (isBundle) {
          await saveEditedBundleChildren(item.tsid, payload)
        }
      } else if (isBundle) {
        await addBundle.mutateAsync({
          parent: payload,
          children: normalizeBundleChildren(),
        })
      } else {
        await addItem.mutateAsync(payload)
      }

      onOpenChange(false)
    } catch {
      return
    }
  }

  async function saveEditedBundleChildren(parentTsid: string, parent: NewItem) {
    const children = bundleChildren
      .map((child) => normalizeBundleChild(child))
      .filter((child): child is NormalizedBundleChild => child !== null)

    for (const child of children) {
      const updates: ItemUpdate = {
        buy_price: child.buy_price ?? 0,
        category: child.category,
        condition: child.condition,
        name: child.name,
        status: child.status,
      }

      if (child.tsid) {
        await updateItem.mutateAsync({ tsid: child.tsid, updates })
      } else {
        const newChild = toNewBundleChild(child)
        await addItem.mutateAsync({
          ...newChild,
          buy_price: newChild.buy_price ?? 0,
          bundle_id: parentTsid,
          bought_at: parent.bought_at,
          is_bundle_parent: false,
          platform: parent.platform,
          sell_price: null,
          sold_at: null,
          notes: null,
        })
      }
    }
  }

  function normalizeBundleChildren() {
    return bundleChildren
      .map((child) => normalizeBundleChild(child))
      .filter((child): child is NormalizedBundleChild => child !== null)
      .map(toNewBundleChild)
  }

  function normalizeBundleChild(
    child: BundleChildForm,
  ): NormalizedBundleChild | null {
    const name = child.name.trim()

    if (!name) {
      return null
    }

    const splitCost = Number.parseFloat(child.buy_price)

    return {
      localId: child.id,
      tsid: child.tsid,
      name,
      category: child.category.trim(),
      condition: child.condition,
      status: child.status,
      buy_price: Number.isFinite(splitCost) ? splitCost : 0,
      notes: null,
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
              <PlatformCombobox
                open={platformOpen}
                onOpenChange={setPlatformOpen}
                options={platforms}
                value={form.platform}
                onChange={(value) => updateField('platform', value)}
              />
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

            {showSellFields ? (
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
            ) : null}
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
                    {getStatusLabel(status)}
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

          {showSellFields ? (
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

          <label className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <span>
              <span className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                This is a bundle
              </span>
              <span className="mt-1 block text-sm text-zinc-500 dark:text-zinc-400">
                Track multiple items bought together under one total price.
              </span>
            </span>
            <input
              type="checkbox"
              className="h-5 w-5 rounded border-zinc-300 text-violet-600 focus:ring-violet-500"
              checked={isBundle}
              onChange={(event) => {
                setIsBundle(event.target.checked)
                if (event.target.checked && bundleChildren.length === 0) {
                  setBundleChildren([createEmptyBundleChild()])
                }
              }}
            />
          </label>

          {isBundle ? (
            <BundleItemsSection
              childrenForms={bundleChildren}
              onAdd={addBundleChild}
              onRemove={removeBundleChild}
              onUpdate={updateBundleChild}
            />
          ) : null}

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

function getPreviewProfit({
  bundleChildSell,
  buyPrice,
  isBundle,
  isBundleChild,
  sellPrice,
}: {
  bundleChildSell: number
  buyPrice: number | null
  isBundle: boolean
  isBundleChild: boolean
  sellPrice: number | null
}) {
  if (isBundle) {
    return (sellPrice ?? 0) + bundleChildSell - (buyPrice ?? 0)
  }

  if (isBundleChild) {
    return sellPrice ?? 0
  }

  return calcProfit(buyPrice, sellPrice)
}

function BundleItemsSection({
  childrenForms,
  onAdd,
  onRemove,
  onUpdate,
}: {
  childrenForms: BundleChildForm[]
  onAdd: () => void
  onRemove: (id: string) => void
  onUpdate: <K extends keyof BundleChildForm>(
    id: string,
    key: K,
    value: BundleChildForm[K],
  ) => void
}) {
  return (
    <section className="rounded-lg border border-violet-200 bg-violet-50/70 p-4 dark:border-violet-500/30 dark:bg-violet-500/10">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-zinc-950 dark:text-white">
            Bundle Items
          </h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Child items inherit platform and date bought from the parent.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-violet-700"
          onClick={onAdd}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {childrenForms.map((child) => (
          <div
            key={child.id}
            className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-white/10 dark:bg-[#0a0a0f]"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
                <Link2 className="h-4 w-4 text-violet-500" aria-hidden="true" />
                {child.tsid ? 'Bundle child' : 'New child item'}
              </div>
              {!child.tsid ? (
                <button
                  type="button"
                  className="rounded-lg p-2 text-zinc-500 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                  onClick={() => onRemove(child.id)}
                  aria-label="Remove child item"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : null}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className={inputClassName}
                value={child.name}
                onChange={(event) =>
                  onUpdate(child.id, 'name', event.target.value)
                }
                placeholder="Name"
              />
              <input
                className={inputClassName}
                value={child.category}
                onChange={(event) =>
                  onUpdate(child.id, 'category', event.target.value)
                }
                placeholder="Category"
              />
              <select
                className={inputClassName}
                value={child.condition}
                onChange={(event) =>
                  onUpdate(child.id, 'condition', event.target.value)
                }
              >
                {conditions.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </select>
              <select
                className={inputClassName}
                value={child.status}
                onChange={(event) =>
                  onUpdate(child.id, 'status', event.target.value as ItemStatus)
                }
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {getStatusLabel(status)}
                  </option>
                ))}
              </select>
              <input
                className={inputClassName}
                type="number"
                min="0"
                step="0.01"
                value={child.buy_price}
                onChange={(event) =>
                  onUpdate(child.id, 'buy_price', event.target.value)
                }
                placeholder="Split cost, optional"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function PlatformCombobox({
  onChange,
  onOpenChange,
  open,
  options,
  value,
}: {
  onChange: (value: string) => void
  onOpenChange: (open: boolean) => void
  open: boolean
  options: string[]
  value: string
}) {
  const filteredOptions = options.filter((option) => fuzzyMatch(option, value))
  const showCustomOption =
    value.trim() && !options.some((option) => option.toLowerCase() === value.trim().toLowerCase())

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`${inputClassName} flex items-center justify-between text-left`}
        >
          <span className={value ? '' : 'text-zinc-400'}>
            {value || 'Select or type a platform'}
          </span>
          <ChevronsUpDown className="h-4 w-4 text-zinc-400" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)]">
        <Command shouldFilter={false}>
          <CommandInput
            value={value}
            onValueChange={onChange}
            placeholder="Search or add platform"
          />
          <CommandList>
            <CommandEmpty>No platform found.</CommandEmpty>
            <CommandGroup>
              {showCustomOption ? (
                <CommandItem
                  value={value}
                  onSelect={() => onOpenChange(false)}
                >
                  Use "{value.trim()}"
                </CommandItem>
              ) : null}
              {filteredOptions.map((platform) => (
                <CommandItem
                  key={platform}
                  value={platform}
                  onSelect={(selectedPlatform) => {
                    onChange(selectedPlatform)
                    onOpenChange(false)
                  }}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      value === platform ? 'opacity-100' : 'opacity-0'
                    }`}
                    aria-hidden="true"
                  />
                  {platform}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
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
    platform: item?.platform ?? defaultPlatforms[0],
    status: item?.status ?? 'holding',
    bought_at: toDateInputValue(item?.bought_at) || todayInputValue(),
    sold_at: toDateInputValue(item?.sold_at),
    notes: item?.notes ?? '',
  }
}

function getInitialBundleChildren(
  item: Item | null | undefined,
  items: Item[],
): BundleChildForm[] {
  if (!item?.is_bundle_parent) {
    return []
  }

  return items
    .filter((child) => child.bundle_id === item.tsid)
    .map((child) => ({
      id: child.tsid,
      tsid: child.tsid,
      name: child.name,
      category: child.category,
      condition: child.condition,
      status: child.status,
      buy_price: child.buy_price > 0 ? String(child.buy_price) : '',
    }))
}

function createEmptyBundleChild(): BundleChildForm {
  return {
    id: crypto.randomUUID(),
    name: '',
    category: '',
    condition: 'Good',
    status: 'holding',
    buy_price: '',
  }
}

function toNewBundleChild(child: NormalizedBundleChild): NewBundleChild {
  return {
    buy_price: child.buy_price,
    category: child.category,
    condition: child.condition,
    name: child.name,
    notes: child.notes,
    status: child.status,
  }
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b),
  )
}

function fuzzyMatch(option: string, query: string) {
  const normalizedOption = option.toLowerCase()
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return true
  }

  let queryIndex = 0

  for (const character of normalizedOption) {
    if (character === normalizedQuery[queryIndex]) {
      queryIndex += 1
    }

    if (queryIndex === normalizedQuery.length) {
      return true
    }
  }

  return false
}

const inputClassName =
  'w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 dark:border-white/10 dark:bg-[#0a0a0f] dark:text-zinc-50 dark:focus:border-violet-400'
