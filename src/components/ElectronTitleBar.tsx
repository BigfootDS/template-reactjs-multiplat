import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { appMetadata } from '../utils/appMetadata'
import { electronWindowControls } from '../utils/ipc/electronIpc'

function ElectronTitleBar() {
  const { t } = useTranslation()
  const isAvailable = electronWindowControls.isAvailable()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMaximised, setIsMaximised] = useState(false)

  useEffect(() => {
    if (!isAvailable) {
      return
    }

    void electronWindowControls.getFullscreen().then(setIsFullscreen)
  }, [isAvailable])

  if (!isAvailable) {
    return null
  }

  async function toggleMaximise() {
    setIsMaximised(await electronWindowControls.toggleMaximise())
  }

  async function toggleFullscreen() {
    setIsFullscreen(await electronWindowControls.setFullscreen(!isFullscreen))
  }

  return (
    <div className="electron-title-bar" role="toolbar" aria-label={t('window_toolbar')}>
      <span className="electron-title-bar-name">{appMetadata.applicationName}</span>
      <div className="electron-title-bar-controls">
        <button aria-label={t('window_minimise')} onClick={() => void electronWindowControls.minimise()} type="button">
          <span aria-hidden="true">−</span>
        </button>
        <button
          aria-label={isMaximised ? t('window_restore') : t('window_maximise')}
          aria-pressed={isMaximised}
          onClick={() => void toggleMaximise()}
          type="button"
        >
          <span aria-hidden="true">□</span>
        </button>
        <button
          aria-label={isFullscreen ? t('window_exit_fullscreen') : t('window_enter_fullscreen')}
          aria-pressed={isFullscreen}
          onClick={() => void toggleFullscreen()}
          type="button"
        >
          <span aria-hidden="true">⛶</span>
        </button>
        <button
          aria-label={t('window_close')}
          className="electron-title-bar-close"
          onClick={() => void electronWindowControls.close()}
          type="button"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
    </div>
  )
}

export default ElectronTitleBar
