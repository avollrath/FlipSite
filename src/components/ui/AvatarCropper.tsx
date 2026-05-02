import * as Dialog from '@radix-ui/react-dialog'
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from 'react-image-crop'
import { useRef, useState, type SyntheticEvent } from 'react'
import { X } from 'lucide-react'
import 'react-image-crop/dist/ReactCrop.css'
import { compressImage } from '@/lib/imageUtils'

type AvatarCropperProps = {
  imageSrc: string
  onCancel: () => void
  onComplete: (blob: Blob) => void
}

export function AvatarCropper({
  imageSrc,
  onCancel,
  onComplete,
}: AvatarCropperProps) {
  const imageRef = useRef<HTMLImageElement | null>(null)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [isSaving, setIsSaving] = useState(false)

  function handleImageLoad(event: SyntheticEvent<HTMLImageElement>) {
    const { naturalHeight, naturalWidth } = event.currentTarget

    setCrop(
      centerCrop(
        makeAspectCrop({ unit: '%', width: 90 }, 1, naturalWidth, naturalHeight),
        naturalWidth,
        naturalHeight,
      ),
    )
  }

  async function handleSave() {
    if (!imageRef.current || !completedCrop?.width || !completedCrop?.height) {
      return
    }

    setIsSaving(true)

    try {
      const croppedBlob = await getCroppedImageBlob(
        imageRef.current,
        completedCrop,
      )
      const compressedBlob = await compressImage(croppedBlob, 400)
      onComplete(compressedBlob)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog.Root open onOpenChange={(open) => (open ? undefined : onCancel())}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,560px)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border-base bg-card p-5 shadow-2xl outline-none">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-lg font-semibold text-base">
                Crop avatar
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-muted">
                Choose the circular crop for your profile image.
              </Dialog.Description>
            </div>
            <button
              type="button"
              className="rounded-lg p-2 text-muted transition hover:bg-surface-2 hover:text-base"
              onClick={onCancel}
              aria-label="Cancel crop"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-5 grid min-h-[300px] place-items-center overflow-hidden rounded-lg bg-surface-2">
            <ReactCrop
              aspect={1}
              circularCrop
              crop={crop}
              minHeight={120}
              minWidth={120}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(pixelCrop) => setCompletedCrop(pixelCrop)}
            >
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Avatar crop preview"
                className="max-h-[60vh] max-w-full"
                onLoad={handleImageLoad}
              />
            </ReactCrop>
          </div>

          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              className="rounded-lg border border-border-base px-4 py-2.5 text-sm font-semibold text-base transition hover:bg-surface-2"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-fg transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-70"
              onClick={handleSave}
              disabled={isSaving || !completedCrop}
            >
              {isSaving ? 'Saving...' : 'Crop & Save'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

async function getCroppedImageBlob(image: HTMLImageElement, crop: PixelCrop) {
  const canvas = document.createElement('canvas')
  const scaleX = image.naturalWidth / image.width
  const scaleY = image.naturalHeight / image.height
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Canvas is not available.')
  }

  canvas.width = Math.round(crop.width * scaleX)
  canvas.height = Math.round(crop.height * scaleY)
  context.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height,
  )

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Unable to crop image.'))
        return
      }

      resolve(blob)
    }, 'image/webp')
  })
}
