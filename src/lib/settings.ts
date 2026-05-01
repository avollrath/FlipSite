import type { ItemStatus } from '@/types'

export type FlipSiteSettings = {
  defaultCategory: string
  defaultCondition: string
  defaultPlatform: string
  defaultStatus: ItemStatus
}

const settingsKey = 'flipsite-settings'

export const defaultSettings: FlipSiteSettings = {
  defaultCategory: '',
  defaultCondition: 'Good',
  defaultPlatform: '',
  defaultStatus: 'holding',
}

export function loadSettings(): FlipSiteSettings {
  if (typeof window === 'undefined') {
    return defaultSettings
  }

  try {
    const storedSettings = window.localStorage.getItem(settingsKey)

    if (!storedSettings) {
      return defaultSettings
    }

    return {
      ...defaultSettings,
      ...JSON.parse(storedSettings),
    }
  } catch {
    return defaultSettings
  }
}

export function saveSettings(settings: FlipSiteSettings) {
  window.localStorage.setItem(settingsKey, JSON.stringify(settings))
}
