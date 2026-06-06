import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { Const } from '@common/const'
import { KcApp, getKcApp } from '@main/kcbrowser'
import *  as workers from '@main/stuff/wrokers'
import { threadId } from 'worker_threads'
import { setMainDir } from '@main/path'
import { Intaker } from '@main/stuff/intaker'

console.log('main index.ts __dirname:', __dirname)
setMainDir(__dirname)

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: BrowserWindow | null

const createWindow = (): void => {
  // Create the browser window.
  const kcapp = new KcApp()
  win = kcapp.mainWindow

  win.on('closed', () => {
    console.log('main window closed(index)')
    win = null
  })
}

// single app
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (_event, _commandLine, _workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
    }
  })

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.whenReady().then(() => {
    // Set app user model id for windows
    electronApp.setAppUserModelId(Const.AppUserModelId)

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })
    
    createWindow()
  })
}

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    console.log('window-all-closed quit app')
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

let beforeQuitHandled = false
app.on('before-quit', async (event) => {
  console.log('app before-quit. handled:', beforeQuitHandled)
  if (! beforeQuitHandled) {
    beforeQuitHandled = true
    const kcapp = getKcApp()
    if (kcapp) {
      event.preventDefault()
      try {
        console.time('intakedrop and shutdown worker driver tid:'+ threadId)
        const tasks:(Promise<void> | Promise<unknown[]>)[] = [];
        tasks.push(Intaker.doIntakeDropOnQuit());
        tasks.push(workers.shutdown());
        await Promise.all(tasks);
        console.timeEnd('intakedrop and shutdown worker driver tid:'+threadId)
      } catch (e) {
        console.error('error during worker shutdown:', e)
      }
      if (kcapp.hasDownloadedUpdate()) {
        kcapp.quitAndInstallDownloadedUpdate()
        return
      }
      app.quit()
    }
  }
})

// Exit cleanly on request from parent process in development mode.
if (is.dev) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
