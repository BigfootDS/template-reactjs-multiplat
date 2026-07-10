export const defaultSettingsId = 'default'
export const currentSettingsVersion = 1

export interface DisplaySettings {
  fullscreen: boolean
}

export interface AudioSettings {
  masterVolume: number
  muted: boolean
}

export interface LanguageSettings {
  code: string
}

export interface DiagnosticsSettings {
  enabled: boolean
}

export interface Settings {
  audio: AudioSettings
  createdAt: string
  diagnostics: DiagnosticsSettings
  display: DisplaySettings
  id: string
  language: LanguageSettings
  updatedAt: string
  version: number
}

export interface SettingsChange {
  audio?: Partial<AudioSettings>
  diagnostics?: Partial<DiagnosticsSettings>
  display?: Partial<DisplaySettings>
  language?: Partial<LanguageSettings>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function normaliseBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function normaliseLanguageCode(value: unknown): string {
  return typeof value === 'string' && value.trim() ? value.trim().toLowerCase() : 'en'
}

function normaliseTimestamp(value: unknown, fallback: string): string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value)) ? value : fallback
}

function normaliseVolume(value: unknown): number {
  const volume = typeof value === 'number' ? value : Number(value)

  return Number.isFinite(volume) ? Math.min(100, Math.max(0, Math.round(volume))) : 100
}

export function createDefaultSettings(now = new Date().toISOString()): Settings {
  return {
    audio: {
      masterVolume: 100,
      muted: false,
    },
    createdAt: now,
    diagnostics: {
      enabled: false,
    },
    display: {
      fullscreen: false,
    },
    id: defaultSettingsId,
    language: {
      code: 'en',
    },
    updatedAt: now,
    version: currentSettingsVersion,
  }
}

/**
 * Normalises a persisted settings record at every storage boundary.
 *
 * Both the SQLocal and IndexedDB adapters call this so malformed or older
 * browser data cannot leak into React state. New optional fields can safely be
 * added to a settings group because omitted values receive stable defaults.
 */
export function normaliseSettings(value: unknown, now = new Date().toISOString()): Settings {
  const defaults = createDefaultSettings(now)
  const source = isRecord(value) ? value : {}
  const display = isRecord(source.display) ? source.display : {}
  const audio = isRecord(source.audio) ? source.audio : {}
  const language = isRecord(source.language) ? source.language : {}
  const diagnostics = isRecord(source.diagnostics) ? source.diagnostics : {}

  return {
    audio: {
      masterVolume: normaliseVolume(audio.masterVolume),
      muted: normaliseBoolean(audio.muted, defaults.audio.muted),
    },
    createdAt: normaliseTimestamp(source.createdAt, defaults.createdAt),
    diagnostics: {
      enabled: normaliseBoolean(diagnostics.enabled, defaults.diagnostics.enabled),
    },
    display: {
      fullscreen: normaliseBoolean(display.fullscreen, defaults.display.fullscreen),
    },
    id: defaultSettingsId,
    language: {
      code: normaliseLanguageCode(language.code),
    },
    updatedAt: normaliseTimestamp(source.updatedAt, defaults.updatedAt),
    version: currentSettingsVersion,
  }
}

export function mergeSettings(settings: Settings, change: SettingsChange): Settings {
  return normaliseSettings({
    ...settings,
    audio: {
      ...settings.audio,
      ...change.audio,
    },
    diagnostics: {
      ...settings.diagnostics,
      ...change.diagnostics,
    },
    display: {
      ...settings.display,
      ...change.display,
    },
    language: {
      ...settings.language,
      ...change.language,
    },
    updatedAt: new Date().toISOString(),
  })
}
