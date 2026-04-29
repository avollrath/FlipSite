import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  Download,
  Edit3,
  Link2,
  PackageOpen,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ItemDrawer } from '@/components/items/ItemDrawer'
import { useDeleteItem, useItems } from '@/hooks/useItems'
import {
  calculateItemProfit,
  calculateItemROI,
  calculateItemSellValue,
  formatCurrency,
  formatDate,
  getEffectiveItemStatus,
  getStatusLabel,
} from '@/lib/utils'
import type { Item, ItemStatus } from '@/types'

type DrawerState =
  | { open: false; mode: 'add'; item: null }
  | { open: true; mode: 'add'; item: null }
  | { open: true; mode: 'edit'; item: Item }

type SortKey =
  | 'name'
  | 'category'
  | 'condition'
  | 'buy_price'
  | 'sell_price'
  | 'profit'
  | 'roi'
  | 'platform'
  | 'status'
  | 'bought_at'
  | 'sold_at'
  | 'created_at'

type SortState = {
  key: SortKey
  direction: 'asc' | 'desc'
}

type BundleFilter = 'none' | 'only' | 'active'

const allStatuses = ['all', 'holding', 'listed', 'sold', 'keeper'] as const
const tableColumns: Array<{ key: SortKey | 'actions'; label: string }> = [
  { key: 'name', label: 'Name' },
  { key: 'category', label: 'Category' },
  { key: 'condition', label: 'Condition' },
  { key: 'buy_price', label: 'Buy Price' },
  { key: 'sell_price', label: 'Sell Price' },
  { key: 'profit', label: 'Profit' },
  { key: 'roi', label: 'ROI %' },
  { key: 'platform', label: 'Platform' },
  { key: 'status', label: 'Status' },
  { key: 'bought_at', label: 'Date Bought' },
  { key: 'sold_at', label: 'Date Sold' },
  { key: 'actions', label: 'Actions' },
]

export function Items() {
  const { data: items = [], isLoading } = useItems()
  const deleteItem = useDeleteItem()
  const [searchParams] = useSearchParams()
  const queryStatus = getQueryStatus(searchParams.get('status'))
  const queryBundleFilter = getQueryBundleFilter(searchParams.get('bundles'))
  const queryInventoryOnly = searchParams.get('inventory') === '1'
  const queryItemId = searchParams.get('item') ?? ''
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<
    (typeof allStatuses)[number]
  >(
    queryStatus ?? 'all',
  )
  const [platformFilter, setPlatformFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [bundleFilter, setBundleFilter] = useState<BundleFilter>(
    queryBundleFilter,
  )
  const [inventoryOnly, setInventoryOnly] = useState(queryInventoryOnly)
  const [focusedItemId] = useState(queryItemId)
  const [expandedBundles, setExpandedBundles] = useState<Set<string>>(
    () => new Set(),
  )
  const [sort, setSort] = useState<SortState>({
    key: 'created_at' as SortKey,
    direction: 'desc',
  })
  const [drawer, setDrawer] = useState<DrawerState>({
    open: false,
    mode: 'add',
    item: null,
  })
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null)

  const platforms = useMemo(
    () => uniqueValues(items.map((item) => item.platform)),
    [items],
  )
  const categories = useMemo(
    () => uniqueValues(items.map((item) => item.category)),
    [items],
  )
  const childrenByBundle = useMemo(() => {
    return items.reduce((map, item) => {
      if (!item.bundle_id) {
        return map
      }

      const children = map.get(item.bundle_id) ?? []
      children.push(item)
      map.set(item.bundle_id, children)
      return map
    }, new Map<string, Item[]>())
  }, [items])
  const activeBundleIds = useMemo(() => {
    const activeIds = new Set<string>()

    for (const [bundleId, children] of childrenByBundle) {
      if (
        children.some((child) => getEffectiveItemStatus(child, items) !== 'sold')
      ) {
        activeIds.add(bundleId)
      }
    }

    return activeIds
  }, [childrenByBundle, items])

  const visibleItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return items
      .filter((item) => {
        if (focusedItemId) {
          return item.tsid === focusedItemId
        }

        const effectiveStatus = getEffectiveItemStatus(item, items)
        const matchesSearch =
          !normalizedSearch ||
          [
            item.name,
            item.category,
            item.condition,
            item.platform,
            effectiveStatus,
            item.notes ?? '',
          ]
            .join(' ')
            .toLowerCase()
            .includes(normalizedSearch)

        const matchesStatus =
          statusFilter === 'all' ||
          effectiveStatus === statusFilter
        const matchesInventory =
          !inventoryOnly ||
          ['holding', 'keeper', 'listed'].includes(effectiveStatus)
        const matchesPlatform =
          platformFilter === 'all' || item.platform === platformFilter
        const matchesCategory =
          categoryFilter === 'all' || item.category === categoryFilter

        const matchesBundleFilter =
          bundleFilter === 'none' ||
          (bundleFilter === 'only' && item.is_bundle_parent) ||
          (bundleFilter === 'active' &&
            item.is_bundle_parent &&
            activeBundleIds.has(item.tsid))

        return (
          matchesSearch &&
          matchesStatus &&
          matchesInventory &&
          matchesPlatform &&
          matchesCategory &&
          matchesBundleFilter
        )
      })
      .sort((a, b) => compareItems(a, b, sort, items))
  }, [
    activeBundleIds,
    bundleFilter,
    categoryFilter,
    focusedItemId,
    inventoryOnly,
    items,
    platformFilter,
    search,
    sort,
    statusFilter,
  ])

  const visibleRows = useMemo(() => {
    const rows: Array<{ item: Item; isChild: boolean }> = []

    if (focusedItemId) {
      return visibleItems.map((item) => ({
        item,
        isChild: Boolean(item.bundle_id),
      }))
    }

    if (
      statusFilter !== 'all' ||
      inventoryOnly ||
      platformFilter !== 'all' ||
      categoryFilter !== 'all' ||
      search.trim()
    ) {
      return visibleItems.map((item) => ({
        item,
        isChild: Boolean(item.bundle_id),
      }))
    }

    visibleItems
      .filter((item) => !item.bundle_id)
      .forEach((item) => {
        rows.push({ item, isChild: false })

        if (item.is_bundle_parent && expandedBundles.has(item.tsid)) {
          for (const child of childrenByBundle.get(item.tsid) ?? []) {
            rows.push({ item: child, isChild: true })
          }
        }
      })

    return rows
  }, [
    categoryFilter,
    childrenByBundle,
    expandedBundles,
    focusedItemId,
    inventoryOnly,
    platformFilter,
    search,
    statusFilter,
    visibleItems,
  ])

  function openAddDrawer() {
    setDrawer({ open: true, mode: 'add', item: null })
  }

  function openEditDrawer(item: Item) {
    setDrawer({ open: true, mode: 'edit', item })
  }

  function closeDrawer(open: boolean) {
    if (!open) {
      setDrawer({ open: false, mode: 'add', item: null })
    }
  }

  function updateSort(key: SortKey) {
    setSort((currentSort) => ({
      key,
      direction:
        currentSort.key === key && currentSort.direction === 'asc'
          ? 'desc'
          : 'asc',
    }))
  }

  function toggleBundle(tsid: string) {
    setExpandedBundles((current) => {
      const next = new Set(current)

      if (next.has(tsid)) {
        next.delete(tsid)
      } else {
        next.add(tsid)
      }

      return next
    })
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return
    }

    await deleteItem.mutateAsync(deleteTarget.tsid)
    setDeleteTarget(null)
  }

  function exportVisibleItems() {
    const rows = visibleItems.map((item) => {
      const profit = calculateItemProfit(item, items)
      const roi = calculateItemROI(item, items)

      return {
        Name: item.name,
        Category: item.category,
        Condition: item.condition,
        'Buy Price': item.buy_price,
        'Sell Price': calculateItemSellValue(item, items),
        Profit: profit ?? '',
        'ROI %': roi === null ? '' : roi.toFixed(2),
        Platform: item.platform,
        Status: getStatusLabel(getEffectiveItemStatus(item, items)),
        'Date Bought': formatDate(item.bought_at),
        'Date Sold': formatDate(item.sold_at),
        Notes: item.notes ?? '',
      }
    })

    downloadCsv(rows, 'flipsite-items.csv')
  }

  const emptyAllItems = !isLoading && items.length === 0

  return (
    <section>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-medium text-violet-600 dark:text-violet-400">
              Inventory
            </p>
            <h2 className="mt-2 text-4xl font-semibold tracking-tight">Items</h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-[#13131a] dark:text-zinc-200 dark:hover:bg-white/10"
              onClick={exportVisibleItems}
              disabled={visibleItems.length === 0}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Export CSV
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/20 transition hover:bg-violet-700"
              onClick={openAddDrawer}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Item
            </button>
          </div>
        </div>

        <div className="grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#13131a] lg:grid-cols-[minmax(220px,1fr)_repeat(3,180px)]">
          <label className="relative block">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
              aria-hidden="true"
            />
            <input
              className={controlClassName + ' pl-9'}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search items"
            />
          </label>

          <FilterSelect
            label="Status"
            value={statusFilter}
            onChange={(value) =>
              setStatusFilter(value as (typeof allStatuses)[number])
            }
            options={allStatuses.map((status) => ({
              value: status,
              label:
                status === 'all' ? 'All Statuses' : getStatusLabel(status),
            }))}
          />
          <FilterSelect
            label="Platform"
            value={platformFilter}
            onChange={setPlatformFilter}
            options={[
              { value: 'all', label: 'All Platforms' },
              ...platforms.map((platform) => ({
                value: platform,
                label: platform,
              })),
            ]}
          />
          <FilterSelect
            label="Category"
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[
              { value: 'all', label: 'All Categories' },
              ...categories.map((category) => ({
                value: category,
                label: category,
              })),
            ]}
          />
          <label className="flex h-11 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 dark:border-white/10 dark:bg-[#0a0a0f] dark:text-zinc-200">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-zinc-300 text-violet-600 focus:ring-violet-500"
              checked={bundleFilter !== 'none'}
              onChange={(event) =>
                setBundleFilter(event.target.checked ? 'only' : 'none')
              }
            />
            Bundles only
          </label>
          <label className="flex h-11 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 dark:border-white/10 dark:bg-[#0a0a0f] dark:text-zinc-200">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-zinc-300 text-violet-600 focus:ring-violet-500"
              checked={inventoryOnly}
              onChange={(event) => setInventoryOnly(event.target.checked)}
            />
            Inventory
          </label>
        </div>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : emptyAllItems ? (
        <EmptyState onAdd={openAddDrawer} />
      ) : (
        <>
          <div className="mt-6 hidden overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#13131a] md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1160px] text-left text-sm">
                <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-400">
                  <tr>
                    {tableColumns.map((column) => (
                      <th key={column.key} className="px-4 py-3 font-semibold">
                        {column.key === 'actions' ? (
                          column.label
                        ) : (
                          <button
                            type="button"
                            className="flex items-center gap-1 transition hover:text-violet-600 dark:hover:text-violet-300"
                            onClick={() => updateSort(column.key as SortKey)}
                          >
                            {column.label}
                            <SortIcon
                              active={sort.key === column.key}
                              direction={sort.direction}
                            />
                          </button>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-white/10">
                  {visibleRows.map(({ item, isChild }) => (
                    <ItemRow
                      key={item.tsid}
                      item={item}
                      childCount={childrenByBundle.get(item.tsid)?.length ?? 0}
                      isChild={isChild}
                      isExpanded={expandedBundles.has(item.tsid)}
                      onEdit={() => openEditDrawer(item)}
                      onDelete={() => setDeleteTarget(item)}
                      onToggleBundle={() => toggleBundle(item.tsid)}
                      allItems={items}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:hidden">
            {visibleRows.map(({ item, isChild }) => (
              <ItemCard
                key={item.tsid}
                item={item}
                childCount={childrenByBundle.get(item.tsid)?.length ?? 0}
                isChild={isChild}
                isExpanded={expandedBundles.has(item.tsid)}
                onEdit={() => openEditDrawer(item)}
                onToggleBundle={() => toggleBundle(item.tsid)}
                allItems={items}
              />
            ))}
          </div>

          {visibleItems.length === 0 ? <NoResults /> : null}
        </>
      )}

      <ItemDrawer
        open={drawer.open}
        mode={drawer.mode}
        item={drawer.item}
        onOpenChange={closeDrawer}
      />
      <DeleteConfirmDialog
        item={deleteTarget}
        isDeleting={deleteItem.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </section>
  )
}

function ItemRow({
  childCount,
  isChild,
  isExpanded,
  item,
  onDelete,
  onEdit,
  onToggleBundle,
  allItems,
}: {
  childCount: number
  isChild: boolean
  isExpanded: boolean
  item: Item
  onDelete: () => void
  onEdit: () => void
  onToggleBundle: () => void
  allItems: Item[]
}) {
  const sellValue = calculateItemSellValue(item, allItems)
  const profit = calculateItemProfit(item, allItems)
  const roi = calculateItemROI(item, allItems)

  return (
    <tr
      className={`cursor-pointer transition hover:bg-violet-50/70 dark:hover:bg-white/[0.04] ${
        isChild ? 'bg-zinc-50/70 dark:bg-white/[0.02]' : ''
      }`}
      onClick={onEdit}
    >
      <td className="px-4 py-4 font-medium text-zinc-950 dark:text-zinc-50">
        <div className={`flex items-center gap-2 ${isChild ? 'pl-8' : ''}`}>
          {item.is_bundle_parent ? (
            <button
              type="button"
              className="rounded p-1 text-zinc-500 transition hover:bg-zinc-100 hover:text-violet-600 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-violet-300"
              onClick={(event) => {
                event.stopPropagation()
                onToggleBundle()
              }}
              aria-label={isExpanded ? 'Collapse bundle' : 'Expand bundle'}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              ) : (
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          ) : null}
          {isChild ? (
            <Link2 className="h-4 w-4 text-violet-400" aria-hidden="true" />
          ) : null}
          <span>{item.name}</span>
          {item.is_bundle_parent ? (
            <BundleBadge count={childCount} />
          ) : null}
        </div>
      </td>
      <td className="px-4 py-4 text-zinc-600 dark:text-zinc-300">
        {item.category || '--'}
      </td>
      <td className="px-4 py-4 text-zinc-600 dark:text-zinc-300">
        {item.condition}
      </td>
      <td className="px-4 py-4">{formatCurrency(item.buy_price)}</td>
      <td className="px-4 py-4">{formatCurrency(sellValue)}</td>
      <td className={metricCellClassName(profit)}>
        {profit === null ? '--' : formatCurrency(profit)}
      </td>
      <td className={metricCellClassName(roi)}>
        {roi === null ? '--' : `${roi.toFixed(1)}%`}
      </td>
      <td className="px-4 py-4 text-zinc-600 dark:text-zinc-300">
        {item.platform}
      </td>
      <td className="px-4 py-4">
        <StatusBadge status={getEffectiveItemStatus(item, allItems)} />
      </td>
      <td className="px-4 py-4 text-zinc-600 dark:text-zinc-300">
        {formatDate(item.bought_at)}
      </td>
      <td className="px-4 py-4 text-zinc-600 dark:text-zinc-300">
        {formatDate(item.sold_at) || '--'}
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-1">
        <button
          type="button"
          className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-violet-600 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-violet-300"
          onClick={(event) => {
            event.stopPropagation()
            onEdit()
          }}
          aria-label={`Edit ${item.name}`}
        >
          <Edit3 className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="rounded-lg p-2 text-zinc-500 transition hover:bg-red-50 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
          onClick={(event) => {
            event.stopPropagation()
            onDelete()
          }}
          aria-label={`Delete ${item.name}`}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
        </div>
      </td>
    </tr>
  )
}

function DeleteConfirmDialog({
  isDeleting,
  item,
  onCancel,
  onConfirm,
}: {
  isDeleting: boolean
  item: Item | null
  onCancel: () => void
  onConfirm: () => void
}) {
  if (!item) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4 backdrop-blur-sm">
      <div
        className="w-full max-w-md animate-soft-pop rounded-lg border border-zinc-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#13131a]"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-item-title"
      >
        <div className="flex items-start gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300">
            <Trash2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h3
              id="delete-item-title"
              className="text-lg font-semibold text-zinc-950 dark:text-white"
            >
              Delete item?
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              This will delete "{item.name}". This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/10"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ItemCard({
  childCount,
  isChild,
  isExpanded,
  item,
  onEdit,
  onToggleBundle,
  allItems,
}: {
  childCount: number
  isChild: boolean
  isExpanded: boolean
  item: Item
  onEdit: () => void
  onToggleBundle: () => void
  allItems: Item[]
}) {
  const sellValue = calculateItemSellValue(item, allItems)
  const profit = calculateItemProfit(item, allItems)
  const roi = calculateItemROI(item, allItems)

  return (
    <button
      type="button"
      className={`rounded-lg border border-zinc-200 bg-white p-4 text-left shadow-sm transition hover:border-violet-300 dark:border-white/10 dark:bg-[#13131a] dark:hover:border-violet-500 ${
        isChild ? 'ml-5 border-violet-200 dark:border-violet-500/30' : ''
      }`}
      onClick={onEdit}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-zinc-950 dark:text-zinc-50">
            <span className="inline-flex items-center gap-2">
              {isChild ? (
                <Link2 className="h-4 w-4 text-violet-400" aria-hidden="true" />
              ) : null}
              {item.name}
              {item.is_bundle_parent ? <BundleBadge count={childCount} /> : null}
            </span>
          </h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {item.category || 'Uncategorized'} - {item.platform}
          </p>
        </div>
        <StatusBadge status={getEffectiveItemStatus(item, allItems)} />
      </div>
      {item.is_bundle_parent ? (
        <button
          type="button"
          className="mt-3 inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium text-violet-600 transition hover:bg-violet-50 dark:text-violet-300 dark:hover:bg-violet-500/10"
          onClick={(event) => {
            event.stopPropagation()
            onToggleBundle()
          }}
        >
          {isExpanded ? 'Hide bundle items' : 'Show bundle items'}
        </button>
      ) : null}
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <MobileMetric label="Buy" value={formatCurrency(item.buy_price)} />
        <MobileMetric label="Sell" value={formatCurrency(sellValue)} />
        <MobileMetric
          label="Profit"
          value={profit === null ? '--' : formatCurrency(profit)}
          tone={profit}
        />
        <MobileMetric
          label="ROI"
          value={roi === null ? '--' : `${roi.toFixed(1)}%`}
          tone={roi}
        />
        <MobileMetric label="Bought" value={formatDate(item.bought_at)} />
        <MobileMetric label="Sold" value={formatDate(item.sold_at) || '--'} />
      </div>
    </button>
  )
}

function BundleBadge({ count }: { count: number }) {
  return (
    <span className="inline-flex rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
      Bundle ({count})
    </span>
  )
}

function MobileMetric({
  label,
  tone,
  value,
}: {
  label: string
  tone?: number | null
  value: string
}) {
  return (
    <div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className={tone === undefined ? 'font-medium' : metricTextClassName(tone)}>
        {value}
      </p>
    </div>
  )
}

function FilterSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  value: string
}) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <select
        className={controlClassName}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function StatusBadge({ status }: { status: ItemStatus }) {
  const className = {
    holding:
      'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
    listed:
      'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    sold: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300',
    keeper:
      'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300',
  }[status]

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${className}`}
    >
      {getStatusLabel(status)}
    </span>
  )
}

function SortIcon({
  active,
  direction,
}: {
  active: boolean
  direction: SortState['direction']
}) {
  if (!active) {
    return <ArrowUp className="h-3.5 w-3.5 opacity-20" aria-hidden="true" />
  }

  return direction === 'asc' ? (
    <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
  ) : (
    <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
  )
}

function LoadingState() {
  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#13131a]">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="grid gap-4 border-b border-zinc-200 p-4 last:border-0 dark:border-white/10 md:grid-cols-6"
        >
          {Array.from({ length: 6 }).map((__, cellIndex) => (
            <div
              key={cellIndex}
              className="h-4 animate-pulse rounded bg-zinc-200 dark:bg-white/10"
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="mt-6 rounded-lg border border-dashed border-zinc-300 bg-white p-10 text-center shadow-sm dark:border-white/10 dark:bg-[#13131a]">
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
        <PackageOpen className="h-10 w-10" aria-hidden="true" />
      </div>
      <h3 className="mt-5 text-xl font-semibold">Add your first flip</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
        Start tracking purchase costs, listing status, sale price, and profit in
        one place.
      </p>
      <button
        type="button"
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/20 transition hover:bg-violet-700"
        onClick={onAdd}
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add your first flip
      </button>
    </div>
  )
}

function NoResults() {
  return (
    <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-500 dark:border-white/10 dark:bg-[#13131a] dark:text-zinc-400">
      No items match the current filters.
    </div>
  )
}

function compareItems(a: Item, b: Item, sort: SortState, allItems: Item[]) {
  const aValue = getSortValue(a, sort.key, allItems)
  const bValue = getSortValue(b, sort.key, allItems)
  const direction = sort.direction === 'asc' ? 1 : -1

  if (typeof aValue === 'number' && typeof bValue === 'number') {
    return (aValue - bValue) * direction
  }

  return String(aValue).localeCompare(String(bValue)) * direction
}

function getSortValue(item: Item, key: SortKey, allItems: Item[]) {
  if (key === 'profit') {
    return calculateItemProfit(item, allItems)
  }

  if (key === 'roi') {
    return calculateItemROI(item, allItems) ?? Number.NEGATIVE_INFINITY
  }

  if (key === 'sell_price') {
    return calculateItemSellValue(item, allItems)
  }

  if (key === 'bought_at' || key === 'sold_at') {
    return item[key] ? new Date(item[key]).getTime() : 0
  }

  return item[key] ?? ''
}

function metricCellClassName(value: number | null) {
  return `px-4 py-4 font-semibold ${metricTextClassName(value)}`
}

function metricTextClassName(value: number | null) {
  if (value === null || value === 0) {
    return 'font-semibold text-zinc-600 dark:text-zinc-300'
  }

  return value > 0
    ? 'font-semibold text-green-600 dark:text-green-400'
    : 'font-semibold text-red-600 dark:text-red-400'
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b),
  )
}

function getQueryStatus(value: string | null) {
  return allStatuses.find((status) => status === value && status !== 'all')
}

function getQueryBundleFilter(value: string | null): BundleFilter {
  if (value === 'active') {
    return 'active'
  }

  if (value === 'only') {
    return 'only'
  }

  return 'none'
}

function downloadCsv(rows: Array<Record<string, string | number>>, fileName: string) {
  if (rows.length === 0) {
    return
  }

  const headers = Object.keys(rows[0])
  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((header) => csvEscape(row[header]))
        .join(','),
    ),
  ].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

function csvEscape(value: string | number) {
  const text = String(value)
  return `"${text.replaceAll('"', '""')}"`
}

const controlClassName =
  'h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 dark:border-white/10 dark:bg-[#0a0a0f] dark:text-zinc-50'
