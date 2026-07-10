import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react'
import { SettingsContext, type SettingsContextValue } from './settingsContext'
import type { Settings, SettingsChange } from '../utils/settings/settingsModel'
import {
  getActiveSettingsPersistenceAdapterId,
  loadSettings,
  updateSettings,
} from '../utils/settings/settingsPersistence'
import type { SettingsPersistenceAdapterId } from '../utils/settings/settingsPersistenceEnvironment'

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unable to load settings.'
}

/**
 * Provides the singleton settings entity after loading it from the selected
 * durable backend. Loading settings never enters fullscreen or applies other
 * browser-affecting preferences, because those actions require deliberate UI
 * interaction on most web platforms.
 */
export function SettingsProvider({ children }: PropsWithChildren) {
  const [adapterId, setAdapterId] = useState<SettingsPersistenceAdapterId | undefined>(undefined)
  const [error, setError] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [settings, setSettings] = useState<Settings | undefined>(undefined)
  const settingsReference = useRef<Settings | undefined>(undefined)
  const updateChain = useRef<Promise<unknown>>(Promise.resolve())

  useEffect(() => {
    let isCurrent = true

    void (async () => {
      try {
        const loadedSettings = await loadSettings()
        const loadedAdapterId = await getActiveSettingsPersistenceAdapterId()

        if (isCurrent) {
          setAdapterId(loadedAdapterId)
          settingsReference.current = loadedSettings
          setSettings(loadedSettings)
        }
      } catch (loadError) {
        if (isCurrent) {
          setError(toErrorMessage(loadError))
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false)
        }
      }
    })()

    return () => {
      isCurrent = false
    }
  }, [])

  const update = useCallback((change: SettingsChange): Promise<Settings> => {
    const write = updateChain.current.then(async () => {
      const currentSettings = settingsReference.current

      if (!currentSettings) {
        throw new Error('Settings are not ready to update.')
      }

      setError(undefined)
      const updatedSettings = await updateSettings(currentSettings, change)
      settingsReference.current = updatedSettings
      setAdapterId(await getActiveSettingsPersistenceAdapterId())
      setSettings(updatedSettings)
      return updatedSettings
    })

    updateChain.current = write.catch(() => undefined)
    return write
  }, [])

  const value = useMemo<SettingsContextValue>(() => ({
    adapterId,
    error,
    isLoading,
    settings,
    update,
  }), [adapterId, error, isLoading, settings, update])

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}
