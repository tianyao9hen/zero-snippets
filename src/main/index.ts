import { app } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import './components/window'
import './components/ipc'
import './components/db'
import { initShortcut, unregisterAllShortcuts } from './components/shortcut'

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Initialize global shortcut
  await initShortcut()

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Unregister all shortcuts before quit
app.on('will-quit', () => {
  unregisterAllShortcuts()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
