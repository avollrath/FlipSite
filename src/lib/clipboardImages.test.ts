import { describe, expect, it } from 'vitest'
import { getImageFilesFromClipboard } from '@/lib/clipboardImages'

type ClipboardItemMock = {
  getAsFile: () => File | null
  kind: string
  type: string
}

describe('getImageFilesFromClipboard', () => {
  it('returns pasted image files with safe generated names', async () => {
    const firstImage = new File(['one'], 'image.png', { type: 'image/png' })
    const secondImage = new File(['two'], 'image.jpeg', { type: 'image/jpeg' })
    const files = getImageFilesFromClipboard(
      createClipboardEvent([
        createClipboardItem(firstImage, 'image/png'),
        createClipboardItem(secondImage, 'image/jpeg'),
      ]),
      1777645363000,
    )

    expect(files).toHaveLength(2)
    expect(files[0].name).toBe('pasted-image-1777645363000.png')
    expect(files[0].type).toBe('image/png')
    expect(await files[0].text()).toBe('one')
    expect(files[1].name).toBe('pasted-image-1777645363000-2.jpg')
    expect(files[1].type).toBe('image/jpeg')
  })

  it('ignores non-image clipboard items', () => {
    const files = getImageFilesFromClipboard(
      createClipboardEvent([
        createClipboardItem(new File(['pdf'], 'receipt.pdf', { type: 'application/pdf' }), 'application/pdf'),
        createTextClipboardItem(),
      ]),
      1777645363000,
    )

    expect(files).toEqual([])
  })

  it('uses the clipboard image MIME type even when the returned file type is empty', () => {
    const imageWithEmptyType = new File(['large screenshot'], 'clipboard', {
      type: '',
    })
    const files = getImageFilesFromClipboard(
      createClipboardEvent([
        createClipboardItem(imageWithEmptyType, 'image/png'),
      ]),
      1777645363000,
    )

    expect(files).toHaveLength(1)
    expect(files[0].name).toBe('pasted-image-1777645363000.png')
    expect(files[0].type).toBe('image/png')
    expect(files[0].type.startsWith('image/')).toBe(true)
  })
})

function createClipboardEvent(items: ClipboardItemMock[]) {
  return {
    clipboardData: {
      items,
    },
  }
}

function createClipboardItem(file: File, type: string) {
  return {
    getAsFile: () => file,
    kind: 'file',
    type,
  }
}

function createTextClipboardItem() {
  return {
    getAsFile: () => null,
    kind: 'string',
    type: 'text/plain',
  }
}
