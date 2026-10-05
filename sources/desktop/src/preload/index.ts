import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  windowControls: {
    minimize: (): void => {
      ipcRenderer.send('window:minimize')
    },
    maximizeToggle: (): void => {
      ipcRenderer.send('window:maximize-toggle')
    },
    close: (): void => {
      ipcRenderer.send('window:close')
    },
    isMaximized: (): Promise<boolean> => {
      return ipcRenderer.invoke('window:is-maximized')
    },
    onMaximizedState: (callback: (isMaximized: boolean) => void): (() => void) => {
      const handler = (_: Electron.IpcRendererEvent, state: boolean): void => {
        callback(state)
      }
      ipcRenderer.on('window:maximized-state', handler)
      return (): void => {
        ipcRenderer.removeListener('window:maximized-state', handler)
      }
    }
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
