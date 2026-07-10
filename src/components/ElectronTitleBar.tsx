import { useEffect, useState } from 'react'
import { appMetadata } from '../utils/appMetadata'
import { electronWindowControls } from '../utils/ipc/electronIpc'

function ElectronTitleBar() {
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
    <div className="electron-title-bar" role="toolbar" aria-label="Window controls">
      <span className="electron-title-bar-name">{appMetadata.applicationName}</span>
      <div className="electron-title-bar-controls">
        <button aria-label="Minimise window" onClick={() => void electronWindowControls.minimise()} type="button">
          <span aria-hidden="true">−</span>
        </button>
        <button
          aria-label={isMaximised ? 'Restore window' : 'Maximise window'}
          onClick={() => void toggleMaximise()}
          type="button"
        >
          <span aria-hidden="true">□</span>
        </button>
        <button
          aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
          onClick={() => void toggleFullscreen()}
          type="button"
        >
          <span aria-hidden="true">⛶</span>
        </button>
        <button
          aria-label="Close window"
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
