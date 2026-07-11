import { useContext } from 'react'
import { SettingsContext, type SettingsContextValue } from '../contexts/settingsContext'

export function useSettings(): SettingsContextValue {
  const value = useContext(SettingsContext)

  if (!value) {
    throw new Error('useSettings must be used inside SettingsProvider.')
  }

  return value
}
