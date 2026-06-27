import { compressImage } from '@/lib/compressImage'
import { apiAssetUrl, apiRequest } from '@/lib/api'

const DEFAULT_THUMBNAIL_SIZE_PX = 80
const DEMO_IMAGE_PATH_PREFIX = '/demo-items/'

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

export async function uploadItemFile(itemId: string, file: File) {
  const shouldCompress = isImageFile(file)
  let uploadFile: File

  try {
    uploadFile = shouldCompress ? await compressImage(file) : file
  } catch (error) {
    throwSafeFileError(error, 'Unable to prepare file for upload. Please try again.')
  }

  const formData = new FormData()
  formData.append('file', uploadFile, file.name)

  try {
    return await apiRequest<ItemFile>(`/items/${itemId}/files`, {
      body: formData,
      method: 'POST',
    })
  } catch (error) {
    throwSafeFileError(error, 'Unable to upload file. Please try again.')
  }
}

export async function getItemFiles(itemId: string) {
  try {
    return await apiRequest<ItemFile[]>(`/items/${itemId}/files`)
  } catch (error) {
    throwSafeFileError(error, 'Unable to load item files. Please try again.')
  }
}

export async function deleteItemFile(fileId: string, filePath: string) {
  void filePath
  try {
    await apiRequest<void>(`/files/${fileId}`, { method: 'DELETE' })
  } catch (error) {
    throwSafeFileError(error, 'Unable to delete file details. Please try again.')
  }
}

export async function getSignedItemFileUrl(filePath: string) {
  if (isDemoImagePath(filePath)) {
    return normalizeDemoImagePath(filePath)
  }

  try {
    const urls = await apiRequest<Record<string, string>>('/files/urls', {
      body: { file_paths: [filePath] },
      method: 'POST',
    })
    const url = urls[filePath]
    if (!url) {
      throw new Error('File URL not found')
    }
    return apiAssetUrl(url) ?? url
  } catch (error) {
    throwSafeFileError(error, 'Unable to open file. Please try again.')
  }
}

export async function getFirstItemImageThumbnails(
  itemIds: string[],
  options: {
    coverImageByItemId?: Map<string, string | null | undefined>
    size?: number
  } = {},
) {
  const uniqueItemIds = Array.from(new Set(itemIds)).filter(Boolean)
  void (options.size ?? DEFAULT_THUMBNAIL_SIZE_PX)

  if (uniqueItemIds.length === 0) {
    return []
  }

  try {
    const thumbnails = await apiRequest<ItemImageThumbnail[]>('/files/thumbnails', {
      body: {
        cover_images: Object.fromEntries(options.coverImageByItemId ?? []),
        item_ids: uniqueItemIds,
      },
      method: 'POST',
    })
    return thumbnails.map((thumbnail) => ({
      ...thumbnail,
      signed_url: apiAssetUrl(thumbnail.signed_url) ?? thumbnail.signed_url,
    }))
  } catch (error) {
    throwSafeFileError(error, 'Unable to load item thumbnail. Please try again.')
  }
}

function isDemoImagePath(filePath: string) {
  return filePath.startsWith(DEMO_IMAGE_PATH_PREFIX)
}

function normalizeDemoImagePath(filePath: string) {
  return filePath
}

function throwSafeFileError(error: unknown, message: string): never {
  if (import.meta.env.DEV) {
    console.error(error)
  }

  throw new Error(message)
}
