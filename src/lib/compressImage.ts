const JPEG_MIME_TYPE = 'image/jpeg'

// Max long edge: 1600px keeps uploads detailed enough without storing huge originals.
export const MAX_LONG_EDGE_PX = 1600

// Max target size: 200 KB keeps item photos lightweight for storage and loading.
export const MAX_TARGET_SIZE_BYTES = 200 * 1024

const INITIAL_QUALITY = 0.82
const MIN_QUALITY = 0.35
const QUALITY_STEP = 0.07

type ImageDimensions = {
  width: number
  height: number
}

function isImageFile(file: File) {
  return file.type.startsWith('image/')
}

export function getCompressedImageDimensions(
  width: number,
  height: number,
): ImageDimensions {
  const longEdge = Math.max(width, height)

  if (longEdge <= MAX_LONG_EDGE_PX) {
    return { width, height }
  }

  const scale = MAX_LONG_EDGE_PX / longEdge

  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  }
}

export function getSafeJpegName(fileName: string) {
  const baseName = fileName.replace(/\.[^/.]+$/, '').trim()
  const safeBaseName = baseName
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return `${safeBaseName || 'image'}.jpg`
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Image compression failed while encoding JPEG output.'))
          return
        }

        resolve(blob)
      },
      JPEG_MIME_TYPE,
      quality,
    )
  })
}

async function loadImage(file: File) {
  const objectUrl = URL.createObjectURL(file)

  try {
    const image = new Image()
    image.decoding = 'async'

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve()
      image.onerror = () => reject(new Error(`Could not load image "${file.name}" for compression.`))
      image.src = objectUrl
    })

    return image
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

export async function compressImage(file: File) {
  if (!isImageFile(file)) {
    return file
  }

  try {
    const image = await loadImage(file)
    const { width, height } = getCompressedImageDimensions(image.naturalWidth, image.naturalHeight)
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    if (!context) {
      throw new Error('Canvas is not available for image compression.')
    }

    canvas.width = width
    canvas.height = height

    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, width, height)
    context.drawImage(image, 0, 0, width, height)

    for (let quality = INITIAL_QUALITY; quality > MIN_QUALITY; quality -= QUALITY_STEP) {
      const blob = await canvasToBlob(canvas, quality)

      if (blob.size <= MAX_TARGET_SIZE_BYTES) {
        return new File([blob], getSafeJpegName(file.name), {
          type: JPEG_MIME_TYPE,
          lastModified: Date.now(),
        })
      }
    }

    const smallestBlob = await canvasToBlob(canvas, MIN_QUALITY)

    if (smallestBlob.size <= MAX_TARGET_SIZE_BYTES) {
      return new File([smallestBlob], getSafeJpegName(file.name), {
        type: JPEG_MIME_TYPE,
        lastModified: Date.now(),
      })
    }

    throw new Error(`Could not compress "${file.name}" under 200 KB without excessive quality loss.`)
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }

    throw new Error(`Image compression failed for "${file.name}".`, { cause: error })
  }
}
