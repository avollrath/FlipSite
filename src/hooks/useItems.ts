import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { blockDemoMode, isDemoModeBlockedError } from '@/lib/demoMode'
import { apiRequest } from '@/lib/api'
import { normalizeItemCondition } from '@/lib/conditions'
import type { Item } from '@/types'

export const itemsQueryKey = (userId: string | undefined) => [
  'items',
  userId,
] as const

export type NewItem = Omit<Item, 'tsid' | 'created_at' | 'user_id'> & {
  user_id?: string
}

export type ItemUpdate = Partial<Omit<Item, 'tsid' | 'user_id' | 'created_at'>>
type UpdateItemMutation = {
  tsid: string
  updates: ItemUpdate
}
export type NewBundleChild = {
  name: string
  category: string
  condition: string
  status: Item['status']
  buy_price?: number
  notes?: string | null
}

export function useItems() {
  const { user } = useAuth()

  return useQuery({
    queryKey: itemsQueryKey(user?.id),
    enabled: Boolean(user?.id),
    queryFn: async () => {
      if (!user?.id) {
        return []
      }

      const data = await apiRequest<Item[]>('/items')
      return data.map(normalizeItem)
    },
  })
}

function normalizeItem(item: Item): Item {
  return {
    ...item,
    condition: normalizeItemCondition(item.condition),
  }
}

export function useAddItem() {
  const { isDemoMode, user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (item: NewItem) => {
      if (!user?.id) {
        throw new Error('You must be signed in to add items')
      }

      if (isDemoMode) {
        blockDemoMode()
      }

      const data = await apiRequest<Item>('/items', {
        body: { ...item, user_id: user.id },
        method: 'POST',
      })
      const createdItem = normalizeItem(data)

      return createdItem
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: itemsQueryKey(user?.id) })
      toast.success('Item added')
    },
    onError: (error) => {
      if (isDemoModeBlockedError(error)) {
        return
      }
      logError(error)
      toast.error('Unable to add item. Please try again.')
    },
  })
}

export function useAddBundle() {
  const { isDemoMode, user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      children,
      parent,
    }: {
      children: NewBundleChild[]
      parent: NewItem
    }) => {
      if (!user?.id) {
        throw new Error('You must be signed in to add bundles')
      }

      if (isDemoMode) {
        blockDemoMode()
      }

      const parentItem = await apiRequest<Item>('/bundles', {
        body: { children, parent: { ...parent, user_id: user.id } },
        method: 'POST',
      })
      const typedParent = normalizeItem(parentItem)
      return typedParent
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: itemsQueryKey(user?.id) })
      toast.success('Bundle added')
    },
    onError: (error) => {
      if (isDemoModeBlockedError(error)) {
        return
      }
      logError(error)
      toast.error('Unable to add bundle. Please try again.')
    },
  })
}

export function useUpdateItem() {
  const { isDemoMode, user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      tsid,
      updates,
    }: UpdateItemMutation) => {
      if (!user?.id) {
        throw new Error('You must be signed in to update items')
      }

      if (isDemoMode) {
        blockDemoMode()
      }

      const data = await apiRequest<Item>(`/items/${tsid}`, {
        body: updates,
        method: 'PATCH',
      })
      const updatedItem = normalizeItem(data)

      return updatedItem
    },
    onSuccess: async (updatedItem) => {
      queryClient.setQueryData<Item[]>(
        itemsQueryKey(user?.id),
        (currentItems = []) =>
          currentItems.map((item) =>
            item.tsid === updatedItem.tsid ? updatedItem : item,
          ),
      )
      await queryClient.invalidateQueries({ queryKey: itemsQueryKey(user?.id) })
      toast.success('Item updated')
    },
    onError: (error) => {
      if (isDemoModeBlockedError(error)) {
        return
      }
      logError(error)
      toast.error('Unable to update item. Please try again.')
    },
  })
}

export function useDeleteItem() {
  const { isDemoMode, user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (tsid: string) => {
      if (!user?.id) {
        throw new Error('You must be signed in to delete items')
      }

      if (isDemoMode) {
        blockDemoMode()
      }

      await apiRequest<void>(`/items/${tsid}`, { method: 'DELETE' })

      return tsid
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: itemsQueryKey(user?.id) })
      toast.success('Item deleted')
    },
    onError: (error) => {
      if (isDemoModeBlockedError(error)) {
        return
      }
      logError(error)
      toast.error('Unable to delete item. Please try again.')
    },
  })
}

function logError(error: unknown) {
  if (import.meta.env.DEV) {
    console.error(error)
  }
}
