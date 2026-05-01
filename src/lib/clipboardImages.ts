type ClipboardImageItem = {
  getAsFile: () => File | null
  kind: string
  type: string
}

type ClipboardImageEvent = {
  clipboardData: {
    items: ArrayLike<ClipboardImageItem>
  } | null
}

export function getImageFilesFromClipboard(
  event: ClipboardEvent | ClipboardImageEvent,
  timestamp = Date.now(),
) {
  if (!event.clipboardData) {
    return []
  }

  const items = Array.from(event.clipboardData.items)
  const imageItems = items.filter(
    (item) => item.kind === 'file' && item.type.startsWith('image/'),
  )

  return imageItems.flatMap((item, index) => {
    const file = item.getAsFile()

    if (!file) {
      return []
    }

    return [
      new File([file], getPastedImageName(item.type, timestamp, index), {
        lastModified: timestamp,
        type: file.type || item.type,
      }),
    ]
  })
}

function getPastedImageName(mimeType: string, timestamp: number, index: number) {
  const suffix = index === 0 ? '' : `-${index + 1}`

  return `pasted-image-${timestamp}${suffix}.${getImageExtension(mimeType)}`
}

function getImageExtension(mimeType: string) {
  const subtype = mimeType.split('/')[1]?.toLowerCase()

  if (subtype === 'jpeg') {
    return 'jpg'
  }

  if (subtype && /^[a-z0-9]+$/.test(subtype)) {
    return subtype
  }

  return 'png'
}
