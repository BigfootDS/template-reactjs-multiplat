import { electronWindowControls } from './ipc/electronIpc'

/**
 * Changes fullscreen state through Electron IPC when available, otherwise uses
 * the browser Fullscreen API. Browser requests can be rejected when they are
 * not triggered by user interaction, so callers should persist the returned
 * state rather than the requested value.
 */
export async function setApplicationFullscreen(enabled: boolean): Promise<boolean> {
  if (electronWindowControls.isAvailable()) {
    return electronWindowControls.setFullscreen(enabled)
  }

  if (typeof document === 'undefined') {
    return false
  }

  try {
    if (enabled && !document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
    }

    if (!enabled && document.fullscreenElement) {
      await document.exitFullscreen()
    }
  } catch {
    return Boolean(document.fullscreenElement)
  }

  return Boolean(document.fullscreenElement)
}
