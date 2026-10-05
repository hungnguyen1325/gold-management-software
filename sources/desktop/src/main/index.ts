import { app } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { createMainWindow } from './window'
import { registerIpcHandlers } from './ipc'

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.goldmanagement.app')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })
  registerIpcHandlers()
  createMainWindow()
})

app.on('window-all-closed', () => {
  app.quit()
})
