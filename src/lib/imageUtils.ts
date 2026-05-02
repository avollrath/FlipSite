export async function compressImage(file: File | Blob, maxEdge = 400): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      const scale = Math.min(1, maxEdge / Math.max(img.width, img.height))
      const width = Math.round(img.width * scale)
      const height = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')

      if (!context) {
        URL.revokeObjectURL(url)
        reject(new Error('Canvas is not available.'))
        return
      }

      canvas.width = width
      canvas.height = height
      context.drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Unable to compress image.'))
            return
          }

          resolve(blob)
        },
        'image/webp',
        0.85,
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Unable to load image.'))
    }

    img.src = url
  })
}
