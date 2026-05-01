import { compressImage } from '@/lib/compressImage'
import { getFirstImagePathByItemId, getItemFilePath } from '@/lib/itemFilePaths'
import { supabase } from '@/lib/supabase'

const ITEM_FILES_BUCKET = 'item-files'
const SIGNED_URL_EXPIRES_IN_SECONDS = 60 * 60
const DEFAULT_THUMBNAIL_SIZE_PX = 80

export type ItemFile = {
  id: string
  item_id: string
  user_id: string
  file_path: string
  file_type: 'image' | 'file'
  original_name: string | null
  mime_type: string | null
  size_bytes: number | null
  created_at: string
}

export type ItemImageThumbnail = {
  item_id: string
  file_path: string
  signed_url: string
}

function isImageFile(file: File) {
  return file.type.startsWith('image/')
}

async function getAuthenticatedUser() {
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  if (!data.user) {
    throw new Error('You must be signed in to manage item files.')
  }

  return data.user
}

export async function uploadItemFile(itemId: string, file: File) {
  const user = await getAuthenticatedUser()
  const shouldCompress = isImageFile(file)
  const uploadFile = shouldCompress ? await compressImage(file) : file
  const fileType: ItemFile['file_type'] = shouldCompress ? 'image' : 'file'
  const timestamp = Date.now()
  const filePath = getItemFilePath({
    fileName: uploadFile.name,
    itemId,
    timestamp,
    userId: user.id,
  })

  const { error: uploadError } = await supabase.storage
    .from(ITEM_FILES_BUCKET)
    .upload(filePath, uploadFile, {
      cacheControl: '3600',
      contentType: uploadFile.type || 'application/octet-stream',
      upsert: false,
    })

  if (uploadError) {
    throw uploadError
  }

  const { data, error: insertError } = await supabase
    .from('item_files')
    .insert({
      item_id: itemId,
      user_id: user.id,
      file_path: filePath,
      file_type: fileType,
      original_name: file.name,
      mime_type: uploadFile.type || file.type || null,
      size_bytes: uploadFile.size,
    })
    .select()
    .single()

  if (insertError) {
    await supabase.storage.from(ITEM_FILES_BUCKET).remove([filePath])
    throw insertError
  }

  return data as ItemFile
}

export async function getItemFiles(itemId: string) {
  const { data, error } = await supabase
    .from('item_files')
    .select('*')
    .eq('item_id', itemId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data as ItemFile[]
}

export async function deleteItemFile(fileId: string, filePath: string) {
  const { error: storageError } = await supabase.storage
    .from(ITEM_FILES_BUCKET)
    .remove([filePath])

  if (storageError) {
    throw storageError
  }

  const { error: deleteError } = await supabase
    .from('item_files')
    .delete()
    .eq('id', fileId)

  if (deleteError) {
    throw deleteError
  }
}

export async function getSignedItemFileUrl(filePath: string) {
  const { data, error } = await supabase.storage
    .from(ITEM_FILES_BUCKET)
    .createSignedUrl(filePath, SIGNED_URL_EXPIRES_IN_SECONDS)

  if (error) {
    throw error
  }

  return data.signedUrl
}

export async function getFirstItemImageThumbnails(
  itemIds: string[],
  options: { size?: number } = {},
) {
  const uniqueItemIds = Array.from(new Set(itemIds)).filter(Boolean)
  const size = options.size ?? DEFAULT_THUMBNAIL_SIZE_PX

  if (uniqueItemIds.length === 0) {
    return []
  }

  const { data: imageFiles, error } = await supabase
    .from('item_files')
    .select('item_id,file_path,created_at')
    .in('item_id', uniqueItemIds)
    .eq('file_type', 'image')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  const firstImageByItemId = getFirstImagePathByItemId(imageFiles ?? [])

  const thumbnails = await Promise.all(
    Array.from(firstImageByItemId.entries()).map(async ([itemId, filePath]) => {
      const { data: signedUrl, error: signedUrlError } = await supabase.storage
        .from(ITEM_FILES_BUCKET)
        .createSignedUrl(filePath, SIGNED_URL_EXPIRES_IN_SECONDS, {
          transform: {
            height: size,
            quality: 70,
            resize: 'cover',
            width: size,
          },
        })

      if (signedUrlError) {
        throw signedUrlError
      }

      return {
        item_id: itemId,
        file_path: filePath,
        signed_url: signedUrl.signedUrl,
      }
    }),
  )

  return thumbnails
}
