"use client"

import * as React from "react"

interface AppSettings {
  autoPlayTrailer: boolean
  autoMuted: boolean
}

interface AppSettingsContextType {
  settings: AppSettings
  updateSettings: (updates: Partial<AppSettings>) => void
  isHydrated: boolean
}

const STORAGE_KEY = "beatwig-settings"

const defaultSettings: AppSettings = {
  autoPlayTrailer: true,
  autoMuted: true,
}

function getStoredSettings(): AppSettings {
  if (typeof window === "undefined") return defaultSettings
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) }
    }
  } catch {
    // ignore
  }
  return defaultSettings
}

const AppSettingsContext = React.createContext<AppSettingsContextType | null>(null)

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = React.useState<AppSettings>(defaultSettings)
  const [isHydrated, setIsHydrated] = React.useState(false)

  React.useEffect(() => {
    setSettings(getStoredSettings())
    setIsHydrated(true)
  }, [])

  React.useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    }
  }, [settings, isHydrated])

  const updateSettings = React.useCallback((updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }))
  }, [])

  return (
    <AppSettingsContext.Provider value={{ settings, updateSettings, isHydrated }}>
      {children}
    </AppSettingsContext.Provider>
  )
}

export function useAppSettings() {
  const context = React.useContext(AppSettingsContext)
  if (!context) {
    throw new Error("useAppSettings must be used within AppSettingsProvider")
  }
  return context
}
