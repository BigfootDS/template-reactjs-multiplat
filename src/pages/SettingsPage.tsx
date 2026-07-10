import { useSettings } from '../hooks/useSettings'
import { setApplicationFullscreen } from '../utils/platformFullscreen'

function SettingsPage() {
  const { adapterId, error, isLoading, settings, update } = useSettings()

  async function updateFullscreen(enabled: boolean): Promise<void> {
    const appliedFullscreen = await setApplicationFullscreen(enabled)
    await update({ display: { fullscreen: appliedFullscreen } })
  }

  return (
    <div className="page">
      <div className="page-heading">
        <h1>Settings</h1>
        <p>
          Preferences are stored as one versioned settings entity. The selected backend
          is {adapterId ?? 'being detected'}, while React components remain independent
          of SQLocal, Kysely, and IndexedDB.
        </p>
      </div>
      {isLoading && <p className="page-loading">Loading saved preferences…</p>}
      {error && <p className="settings-error" role="alert">{error}</p>}
      {settings && (
        <div className="card-grid">
          <section className="card">
            <h2>Display</h2>
            <label className="setting-control" htmlFor="colour-theme">
              <span>Colour theme</span>
              <select
                id="colour-theme"
                onChange={(event) => void update({
                  display: { theme: event.target.value === 'dark' ? 'dark' : 'light' },
                })}
                value={settings.display.theme}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </label>
            <label className="setting-control">
              <input
                checked={settings.display.fullscreen}
                onChange={(event) => void updateFullscreen(event.target.checked)}
                type="checkbox"
              />
              <span>Use full-screen mode</span>
            </label>
            <p>Theme colours use plain CSS variables. Full screen goes through the Electron IPC wrapper or browser Fullscreen API.</p>
          </section>
          <section className="card">
            <h2>Audio</h2>
            <label className="setting-control" htmlFor="master-volume">
              <span>Master volume: {settings.audio.masterVolume}%</span>
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
              <span>Mute all audio</span>
            </label>
          </section>
          <section className="card">
            <h2>Language</h2>
            <label className="setting-control" htmlFor="language">
              <span>Interface language</span>
              <select
                id="language"
                onChange={(event) => void update({ language: { code: event.target.value } })}
                value={settings.language.code}
              >
                <option value="en">English</option>
              </select>
            </label>
            <p>This setting is ready for an optional localisation recipe without adding translations now.</p>
          </section>
          <section className="card">
            <h2>Diagnostics</h2>
            <label className="setting-control">
              <input
                checked={settings.diagnostics.enabled}
                onChange={(event) => void update({ diagnostics: { enabled: event.target.checked } })}
                type="checkbox"
              />
              <span>Show developer diagnostics by default</span>
            </label>
            <p>Current backend: <strong>{adapterId ?? 'Loading'}</strong>.</p>
          </section>
        </div>
      )}
    </div>
  )
}

export default SettingsPage
