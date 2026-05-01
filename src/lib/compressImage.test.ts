import { describe, expect, it } from 'vitest'
import {
  getCompressedImageDimensions,
  getSafeJpegName,
  MAX_LONG_EDGE_PX,
  MAX_TARGET_SIZE_BYTES,
} from '@/lib/compressImage'

describe('compressImage helpers', () => {
  it('keeps small images at their original dimensions', () => {
    expect(getCompressedImageDimensions(900, 600)).toEqual({
      width: 900,
      height: 600,
    })
  })

  it('resizes landscape images to a 1600px long edge', () => {
    expect(getCompressedImageDimensions(4000, 3000)).toEqual({
      width: MAX_LONG_EDGE_PX,
      height: 1200,
    })
  })

  it('resizes portrait images to a 1600px long edge', () => {
    expect(getCompressedImageDimensions(3000, 4000)).toEqual({
      width: 1200,
      height: MAX_LONG_EDGE_PX,
    })
  })

  it('keeps the target size at 200 KB', () => {
    expect(MAX_TARGET_SIZE_BYTES).toBe(200 * 1024)
  })

  it('creates a safe jpeg filename', () => {
    expect(getSafeJpegName(' My Cool Receipt!.png ')).toBe('My-Cool-Receipt.jpg')
    expect(getSafeJpegName('***.webp')).toBe('image.jpg')
  })
})
