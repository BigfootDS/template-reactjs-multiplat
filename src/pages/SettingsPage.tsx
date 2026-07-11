import { useTranslation } from 'react-i18next'
import { useLanguage } from '../hooks/useLanguage'
import { useSettings } from '../hooks/useSettings'
import { defaultLanguage } from '../utils/localisation/i18nDataPrep'
import { setApplicationFullscreen } from '../utils/platformFullscreen'

function SettingsPage() {
  const { t } = useTranslation()
  const { availableLanguages } = useLanguage()
  const { adapterId, error, isLoading, settings, update } = useSettings()

  async function updateFullscreen(enabled: boolean): Promise<void> {
    const appliedFullscreen = await setApplicationFullscreen(enabled)
    await update({ display: { fullscreen: appliedFullscreen } })
  }

  const selectedLanguage = settings && availableLanguages.some(({ code }) => code === settings.language.code)
    ? settings.language.code
    : defaultLanguage

  return (
    <div className="page">
      <div className="page-heading">
        <h1>{t('settings_heading')}</h1>
        <p>{t('settings_intro', { backend: adapterId ?? t('settings_backend_detecting') })}</p>
      </div>
      {isLoading && <p className="page-loading">{t('settings_loading')}</p>}
      {error && <p className="settings-error" role="alert">{error}</p>}
      {settings && (
        <div className="card-grid">
          <section className="card">
            <h2>{t('settings_display')}</h2>
            <label className="setting-control" htmlFor="colour-theme">
              <span>{t('settings_colour_theme')}</span>
              <select
                id="colour-theme"
                onChange={(event) => void update({
                  display: { theme: event.target.value === 'dark' ? 'dark' : 'light' },
                })}
                value={settings.display.theme}
              >
                <option value="light">{t('settings_theme_light')}</option>
                <option value="dark">{t('settings_theme_dark')}</option>
              </select>
            </label>
            <label className="setting-control">
              <input
                checked={settings.display.fullscreen}
                onChange={(event) => void updateFullscreen(event.target.checked)}
                type="checkbox"
              />
              <span>{t('settings_fullscreen')}</span>
            </label>
            <p>{t('settings_theme_description')}</p>
          </section>
          <section className="card">
            <h2>{t('settings_audio')}</h2>
            <label className="setting-control" htmlFor="master-volume">
              <span>{t('settings_master_volume', { volume: settings.audio.masterVolume })}</span>
              <input
                id="master-volume"
                max="100"
                min="0"
                onChange={(event) => void update({ audio: { masterVolume: Number(event.target.value) } })}
                step="1"
                type="range"
                value={settings.audio.masterVolume}
              />
            </label>
            <label className="setting-control">
              <input
                checked={settings.audio.muted}
                onChange={(event) => void update({ audio: { muted: event.target.checked } })}
                type="checkbox"
              />
              <span>{t('settings_mute')}</span>
            </label>
          </section>
          <section className="card">
            <h2>{t('settings_language')}</h2>
            <label className="setting-control" htmlFor="language">
              <span>{t('settings_interface_language')}</span>
              <select
                id="language"
                onChange={(event) => void update({ language: { code: event.target.value } })}
                value={selectedLanguage}
              >
                {availableLanguages.map(({ code, name }) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </label>
            <p>{t('settings_translation_description')}</p>
          </section>
          <section className="card">
            <h2>{t('settings_diagnostics')}</h2>
            <label className="setting-control">
              <input
                checked={settings.diagnostics.enabled}
                onChange={(event) => void update({ diagnostics: { enabled: event.target.checked } })}
                type="checkbox"
              />
              <span>{t('settings_show_diagnostics')}</span>
            </label>
            <p>{t('settings_current_backend', { backend: adapterId ?? t('app_loading') })}</p>
          </section>
        </div>
      )}
    </div>
  )
}

export default SettingsPage
