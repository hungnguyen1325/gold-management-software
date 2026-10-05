import { ElectronAPI } from '@electron-toolkit/preload'

export interface WindowControlsAPI {
  minimize: () => void
  maximizeToggle: () => void
  close: () => void
  isMaximized: () => Promise<boolean>
  onMaximizedState: (callback: (isMaximized: boolean) => void) => () => void
}

export interface CustomAPI {
  windowControls: WindowControlsAPI
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: CustomAPI
  }
}
