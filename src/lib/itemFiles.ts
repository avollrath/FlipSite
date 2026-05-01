import { compressImage } from '@/lib/compressImage'
import { supabase } from '@/lib/supabase'

const ITEM_FILES_BUCKET = 'item-files'
const SIGNED_URL_EXPIRES_IN_SECONDS = 60 * 60

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

function isImageFile(file: File) {
  return file.type.startsWith('image/')
}

function getSafeFileName(fileName: string) {
  const extensionMatch = fileName.match(/\.[^/.]+$/)
  const extension = extensionMatch?.[0].toLowerCase() ?? ''
  const baseName = fileName.replace(/\.[^/.]+$/, '').trim()
  const safeBaseName = baseName
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return `${safeBaseName || 'file'}${extension}`
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
  const safeFileName = getSafeFileName(uploadFile.name)
  const filePath = `${user.id}/${itemId}/${timestamp}-${safeFileName}`

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
