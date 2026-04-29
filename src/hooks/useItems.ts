import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import type { Item } from '@/types'

export const itemsQueryKey = (userId: string | undefined) => [
  'items',
  userId,
] as const

export type NewItem = Omit<Item, 'tsid' | 'created_at' | 'user_id'> & {
  user_id?: string
}

export type ItemUpdate = Partial<Omit<Item, 'tsid' | 'user_id' | 'created_at'>>

export function useItems() {
  const { user } = useAuth()

  return useQuery({
    queryKey: itemsQueryKey(user?.id),
    enabled: Boolean(user?.id),
    queryFn: async () => {
      if (!user?.id) {
        return []
      }

      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return data as Item[]
    },
  })
}

export function useAddItem() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (item: NewItem) => {
      if (!user?.id) {
        throw new Error('You must be signed in to add items')
      }

      const { data, error } = await supabase
        .from('items')
        .insert({ ...item, user_id: user.id })
        .select()
        .single()

      if (error) {
        throw error
      }

      return data as Item
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: itemsQueryKey(user?.id) })
      toast.success('Item added')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Unable to add item'))
    },
  })
}

export function useUpdateItem() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      tsid,
      updates,
    }: {
      tsid: string
      updates: ItemUpdate
    }) => {
      if (!user?.id) {
        throw new Error('You must be signed in to update items')
      }

      const { data, error } = await supabase
        .from('items')
        .update(updates)
        .eq('tsid', tsid)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data as Item
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: itemsQueryKey(user?.id) })
      toast.success('Item updated')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Unable to update item'))
    },
  })
}

export function useDeleteItem() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (tsid: string) => {
      if (!user?.id) {
        throw new Error('You must be signed in to delete items')
      }

      const { error } = await supabase
        .from('items')
        .delete()
        .eq('tsid', tsid)
        .eq('user_id', user.id)

      if (error) {
        throw error
      }

      return tsid
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: itemsQueryKey(user?.id) })
      toast.success('Item deleted')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Unable to delete item'))
    },
  })
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}
