import { app, BrowserWindow, session } from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { Const } from '@common/const'
import { KcApp, getKcApp } from '@main/kcbrowser'
import *  as workers from '@main/stuff/wrokers'
import { threadId } from 'worker_threads'
import { PathStuff, setMainDir, setUserDataDir } from '@main/path'
import { Intaker } from '@main/stuff/intaker'
import { optionSettingStore } from './store'
import { defaultOptionSetting, OptionSetting } from '@common/option'

console.log('main index.ts __dirname:', __dirname)
setMainDir(__dirname)

// set user data dir
console.log('app dir(user data):', app.getPath('userData'))
setUserDataDir(app.getPath('userData'))

/**
 * 
 * @param setting 
 */
async function setProxy(setting: OptionSetting): Promise<void> {

  if (setting.proxyMode === 'system') {
    await session.defaultSession.setProxy({
      mode: 'system'
    })
  }

  if (setting.proxyMode === 'direct') {
    await session.defaultSession.setProxy({
      mode: 'direct'
    })
  }
  
  if (setting.proxyMode === 'auto_detect') {
    await session.defaultSession.setProxy({
      mode: 'auto_detect'
    })
  }

  if (setting.proxyMode === 'pac_script') {
    if (setting.proxyPacScript) {
      await session.defaultSession.setProxy({
        mode: 'pac_script',
        pacScript: setting.proxyPacScript
      })
    } else {
      console.warn('PAC script mode selected but no PAC script URL provided.')
    }
  }

  if (setting.proxyMode === 'fixed_servers') {
    if (setting.proxyFixedServers) {
      await session.defaultSession.setProxy({
        mode: 'fixed_servers',
        proxyRules: setting.proxyFixedServers
      })
    } else {
      console.warn('Fixed servers mode selected but no proxy rules provided.')
    }
  }

  await session.defaultSession.closeAllConnections()
}

/**
 *
 * @param setting
 */
async function loadUnpackedExtension(setting: OptionSetting): Promise<void> {
  for (const extension of setting.extensions) {
    try {
      await session.defaultSession.extensions.loadExtension(extension.path, {
        allowFileAccess: true
      })
    } catch (err) {
      console.error('Failed to load unpacked extension.', extension.path, err)
    }
  }
}

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
  app.whenReady().then(async () => {
    // Set app user model id for windows
    electronApp.setAppUserModelId(Const.AppUserModelId)

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    // load option setting
    let optionSetting = defaultOptionSetting()

    try {
      optionSetting = await optionSettingStore.loadAsync(defaultOptionSetting())
    } catch (err) {
      console.error('Failed to load option setting. Falling back to default setting.', err)
    }

    // set capture path
    PathStuff.setCapturePath(optionSetting.captureSavePath)

    // set proxy
    try {
      await setProxy(optionSetting)
    } catch (err) {
      console.error('Failed to apply proxy setting. Falling back to system proxy.', err)
      await session.defaultSession.setProxy({ mode: 'system' })
    }

    // load unpacked extension
    await loadUnpackedExtension(optionSetting)

    // create main window
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
      kcapp.saveAppState()
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
