import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { blockDemoMode } from '@/lib/demoMode'
import { apiRequest } from '@/lib/api'

export type Profile = {
  id: string
  username: string | null
  avatar_url: string | null
  updated_at: string | null
}

type ProfileUpdate = {
  username?: string | null
  avatar_url?: string | null
}

export const profileQueryKey = (userId: string | undefined) =>
  ['profile', userId] as const

export function useProfile() {
  const { isDemoMode, user } = useAuth()
  const queryClient = useQueryClient()
  const queryKey = profileQueryKey(user?.id)

  const profileQuery = useQuery({
    queryKey,
    enabled: Boolean(user?.id),
    queryFn: async () => {
      if (!user?.id) {
        return null
      }

      return apiRequest<Profile>('/profile')
    },
  })

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileUpdate) => {
      if (!user?.id) {
        throw new Error('You must be signed in to update your profile.')
      }

      if (isDemoMode) {
        blockDemoMode()
      }

      return apiRequest<Profile>('/profile', {
        body: data,
        method: 'PUT',
      })
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(queryKey, updatedProfile)
      void queryClient.invalidateQueries({ queryKey })
    },
  })

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: Blob) => {
      if (!user?.id) {
        throw new Error('You must be signed in to upload an avatar.')
      }

      if (isDemoMode) {
        blockDemoMode()
      }

      const formData = new FormData()
      formData.append('file', file, 'avatar.webp')
      const updatedProfile = await apiRequest<{
        avatar_url: string
        updated_at: string
      }>('/profile/avatar', {
        body: formData,
        method: 'POST',
      })

      return updatedProfile.avatar_url
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })

  return {
    isLoading: profileQuery.isLoading,
    isSaving: updateProfileMutation.isPending,
    isUploading: uploadAvatarMutation.isPending,
    profile: profileQuery.data ?? null,
    updateProfile: updateProfileMutation.mutateAsync,
    uploadAvatar: uploadAvatarMutation.mutateAsync,
  }
}
