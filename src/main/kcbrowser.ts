import {
  BrowserWindow,
  ipcMain,
  Rectangle,
  powerMonitor,
  WebContents,
  session,
  screen,
  shell,
  dialog,
  app,
  Event,
  HandlerDetails,
  DidCreateWindowDetails,
  BrowserWindowConstructorOptions,
  IpcMainInvokeEvent,
  MenuItem,
  Menu,
  Display,
} from 'electron'
import { autoUpdater } from 'electron-updater'
import { is } from '@electron-toolkit/utils'
import * as fs from 'fs'
import { once } from 'events'
import { svdata } from '@main/svdata'
import { Const } from '@common/const'
import { AppStuff } from '@main/app'
import { MapStuff } from '@main/map'
import {
  MainChannel,
  MainMessage,
  GameChannel,
  QuestContext,
  AirbaseSpot,
} from '@common/channel'
import moment from 'moment'
import { KcRecord } from '@main/kcrecord'
import { ApiCallback, ApiMap, KcsUtil, MstMapinfo, ApiDataRoot, ApiResult, ApiMapInfoList, EmptyApiMapInfoList, ApiMissionList, EmptyApiMissionList, ApiQuestListWithParam, ApiQuestListParamTabId, ApiQuestList, EmptyApiQuestList } from '@common/kcs'
import * as  kcsapi from '@common/kcsapi'
import * as kcsapi_hook from '@common/kcsapi_hook'
import { appState } from '@global/appstate'
import {
  BattleRecord,
  DbName,
  PortChartData,
  Query,
  QueryReturn
} from '@common/record'
import { type Spot, type CellInfo, CommonMap } from '@common/map'
import { Env } from '@common/env'
import { airbaseSpotStore, appSettingStore, inheritScoreStoreLoader, mapInfoStoreLoader, missionListStoreLoader, questListStoreLoader } from '@main/store'
import { globalSettingStore } from '@main/store'
import { getMainDir, PathStuff, setUserDataDir } from '@main/path'
import iconv from 'iconv-lite'
import * as  kcapi_debug from '@main/kcapi_debug'
import type { ApiReqMessage, ApiResMessage, QuestsMessage, RequiredMessage } from '@common/message'
import { gameSetting, gameSettingProxy, gameState } from '@main/settings'
import path from 'node:path'
import { getWorkerDriver, start as WorkersStart } from '@main/stuff/wrokers'
import { AppSetting, defaultAppSetting, defaultInheritScoreList, InheritScoreList } from '@common/store'
import { defaultGlobalSetting, GlobalSetting } from '@common/global_setting'
import { streamManager } from '@main/stream'
import { AggregatedCellRank, AggregatedCellShipDrop } from '@common/calc_record'
import { Intaker } from '@main/stuff/intaker'
import { setTestData } from '@main/debug-data'
import { UpdateCheckResult, UpdateStateSnapshot } from '@common/type'
import * as appSetting from '@main/app_setting'
import * as RectUtil from '@common/rect_util'
import crypto from 'node:crypto'

/////////////////////////////////////////////////////////////////////////////////////
// debug
const DEBUG = 0;

const debug = (...args: any[]) => {
  if (DEBUG) console.info("[KcBrowser]", ...args);
};


const setUseragent = (): void => {
  const ua = session.defaultSession.getUserAgent()
  const ua1 = ua.replace(/ koubrowser\/[0-9\\.]+/, '')
  const ua2 = ua1.replace(/ Electron\/[0-9\\.]+/, '')
  session.defaultSession.setUserAgent(ua2)
}

/**
 * autoUpdaterの設定
 * 
 * update checkでローカルホストに更新用ファイルを配置し確認する場合、
 * まず以下の環境変数を設定する
 * $env:KOU_UPDATE_URL='http://localhost:8080/releases'
 * 
 * httpサーバは
 * scripts/run-http-server-for-update-check.bat
 * から起動できる。scriptsフォルダ配下に更新用ファイルを配置する
 * 
 * 後は開発モードで動かせばよい(npm run dev)
 */
const getUpdateFeedUrl = (): string | null => {
  const overrideUrl = process.env.KOU_UPDATE_URL?.trim()
  if (Env.isDevelopment && overrideUrl) return overrideUrl
  return null
}

const updateFeedUrl = getUpdateFeedUrl()
if (Env.isDevelopment && updateFeedUrl) {
  autoUpdater.setFeedURL({
    provider: 'generic',
    url: updateFeedUrl,
  })
}
debug('update feed url:', updateFeedUrl ?? 'default')

// betaバージョンの更新チェックでは以下を指定すること
//autoUpdater.channel = 'beta'
//caption: if set channel value, allowDowngrade(default is false) set to true.
autoUpdater.allowDowngrade = false
autoUpdater.forceDevUpdateConfig = Env.isDevelopment
autoUpdater.autoDownload = false
autoUpdater.autoInstallOnAppQuit = false
autoUpdater.autoRunAppAfterInstall = false    
debug('auto updater currentVersion', autoUpdater.currentVersion.format())

type UpdateChannel = 'beta' | 'latest'

/**
 *
 */
const calcMainWindowSize = (isAssistInGame: boolean): { width: number; height: number } => {
  if (isAssistInGame) {
    const width = Const.GameWidth + Const.AssistWidth
    const height =
      Const.GameHeight + Const.GameBarHeight + Const.TitleBarHeight + Const.AssistBottomHeight
    return { width, height }
  }

  const width = appState.game_only_width ? appState.game_only_width : Const.GameWidth
  const height = appState.game_only_height
    ? appState.game_only_height
    : Const.GameHeight + Const.GameBarHeight + Const.TitleBarHeight
  return { width, height }
}

/**
 *
 */
const defaultGameOnlySize = (): { width: number; height: number } => {
  const width = Const.GameWidth
  const height = Const.GameHeight + Const.GameBarHeight + Const.TitleBarHeight
  return { width, height }
}

/**
 * 
 */
const calcMainWindowMinSize = (): { minWidth: number; minHeight: number, frame_ratio: number } => {
  const defGameOnlySize = defaultGameOnlySize()
  const frame_ratio = AppStuff.calcFrameRatio(defGameOnlySize.width, defGameOnlySize.height)
  const minWidth = 600
  const minHeight = AppStuff.calcFrameHeight(frame_ratio, minWidth)
  gameSetting.zoom_factor = AppStuff.calcGameZoomFactor(defGameOnlySize.width)
  return { minWidth, minHeight, frame_ratio }
}


/**
 * 
 */
const isAssistRestricted = (): boolean => {
  //screen.getAllDisplays().forEach(el => console.log(el));
  // const pdisp = screen.getPrimaryDisplay()
  // const ok = [pdisp].some((el) => {
  //   return el.bounds.height >= Const.InGameAssistDisplayRequirementHeight && 
  //   el.bounds.width >= Const.InGameAssistDisplayRequirementWidth
  // })
  //debug('primary display:', pdisp, 'has required size:', ok)
  const ok = screen
    .getAllDisplays()
    .some((el) => {
      return el.bounds.height >= Const.InGameAssistDisplayRequirementHeight && 
      el.bounds.width >= Const.InGameAssistDisplayRequirementWidth}
    )
  return !ok;
}

/**
 * 
 */
const installVueDevtoolsIfDev = (): void => {
  if (Env.isDevelopment) {
    const path =
      process.env.LOCALAPPDATA +
      '/Google/Chrome/User Data/Default/Extensions/nhdogjmejiglipccpnnnanhbledajbpd/7.7.7_0'
    if (fs.existsSync(path)) {
      session.defaultSession.extensions
        .loadExtension(path, { allowFileAccess: true })
        .then(() => {
          debug('Vue Devtools loaded')
        })
        .catch((err) => {
          debug('Vue Devtools load failed:', err)
        })
    }
  }
}

/**
 *
 * @param win
 */
const openAppHtml = (win: BrowserWindow): void => {
  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  debug('open renderer url:', process.env['ELECTRON_RENDERER_URL'])
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(path.join(getMainDir(), '../renderer/index.html'))
  }
}

let kcapp: KcApp
export const getKcApp = (): KcApp | undefined => {
  return kcapp
}

/**
 *
 */
export class KcApp {
  private main_window: BrowserWindow
  private assist_window: BrowserWindow | null = null
  private frame_ratio: number
  private kcrecord: KcRecord | null = null
  private cbBasicFirst: number = 0
  private nohandle_resize: boolean = false
  private wsRecording: fs.WriteStream | null = null
  private questUpdated_called: boolean = false
  private availableUpdateVersion: string | null = null
  private downloadedUpdateVersion: string | null = null
  private isStartupUpdateChecked: boolean = false
  private startupUpdateCheckResult: UpdateCheckResult | null = null
  private isSilentUpdate: boolean = true
  private globalSetting: GlobalSetting = defaultGlobalSetting()
  private updateState: UpdateStateSnapshot = {
    status: 'idle',
    availableVersion: '',
    errorMessage: '',
    downloadPercent: null,
  }

  public get mainWindow(): BrowserWindow {
    return this.main_window
  }

  public get assistWindow(): BrowserWindow | null {
    return this.assist_window
  }

  public saveAppState(): void {
    debug('saveAppState called isRestricted:', gameSetting.assistRestricted)

    // ディスプレイ要件を満たすディスプレイがない場合は
    // ・ミュート状態
    // ・topmost状態
    // のみ保存する
    if (gameSetting.assistRestricted) {
      appSetting.saveAppStateRestricted(this.mainWindow, gameSetting.topmost, gameState.muted)
    } else {
      appSetting.saveAppState(this.mainWindow, gameSetting.assistInGame, {
        width: appState.game_only_width,
        height: appState.game_only_height
      }, gameSetting.topmost, gameState.muted)
    }
  }

  constructor() { 
    kcapp = this

    const appLaunchId = crypto.randomUUID()

    debug('app dir(dirname):', __dirname)
    debug('app dir(user data):', app.getPath('userData'))
    debug('app launch id:', appLaunchId)

    // start worker driver
    WorkersStart(getMainDir());

    // set user data dir
    setUserDataDir(app.getPath('userData'))
    appSetting.loadAppJsonSetting()

    // set useragent
    setUseragent()

    // install Vue.js devtools
    installVueDevtoolsIfDev()

    // イベントやIPCハンドラ設定
    this.setupHandlers()

    // detect restricted assist
    gameSetting.setAssistRestricted(isAssistRestricted())

    // calc main window min size
    const { minWidth, minHeight, frame_ratio } = calcMainWindowMinSize();
    this.frame_ratio = frame_ratio

    // メインウインドウにアシストを表示するか？
    // ディスプレイ要件を満たすディスプレイがない場合は、アシストをゲームと別ウインドウで表示する
    if (gameSetting.assistRestricted) {
      gameSetting.setAssistInGame(false)
    } else {
      const restoredAssistInGame = appSetting.restoreAssistInGame()
      if (restoredAssistInGame !== undefined) {
        gameSetting.setAssistInGame(restoredAssistInGame)
      }
    }

    const restoredTopmost = appSetting.restoreTopmost()
    if (restoredTopmost !== undefined) {
      gameSetting.topmost = restoredTopmost
    }
    const restoredMuted = appSetting.restoreMuted()
    if (restoredMuted !== undefined) {
      gameState.muted = restoredMuted
    }

    // Create the browser window.

    // 前回終了ウインドウ位置で現環境のdisplayに表示できる場合の座標取得
    // 取得できない場合、undef
    const restoredMainWindowBounds = appSetting.restoreMainWindowBounds(gameSetting.isAssistInGame)

    // メインウインドウ表示サイズ
    const mainWindowSize = ((): { width: number, height: number, resizable: boolean } => {

      // 推奨サイズの要件を満たすディスプレイがない場合はゲーム画面と別ウインドウアシストを表示する
      // プライマリディスプレイに表示する
      if (gameSetting.assistRestricted) {
        const primaryDisplay = screen.getPrimaryDisplay()
        const bounds = primaryDisplay.workArea
        const width = Math.max(bounds.width - Const.AssistWidth, minWidth)
        const height = AppStuff.calcFrameHeight(frame_ratio, width)
        return { width, height, resizable: true }
      }

      // 前回起動座標が無効
      if (! restoredMainWindowBounds) {
        // デフォルト初期サイズで表示
        return { ...calcMainWindowSize(gameSetting.isAssistInGame), resizable: !gameSetting.isAssistInGame }
      }

      // 前回起動座標が有効
      if (gameSetting.isAssistInGame) {
        // サイズは固定
        return { ...calcMainWindowSize(true), resizable: false }
      }

      // ゲームのみ表示、保存されているサイズを返却
      return { width: restoredMainWindowBounds.width, height: restoredMainWindowBounds.height, resizable: true }
    })()

    // メインウインドウ表示位置
    const mainWindowPos = ((): { x: number, y: number } | undefined => {

      // 推奨サイズの要件を満たすディスプレイがない場合
      if (gameSetting.assistRestricted) {
        // 表示位置保存が無い場合、プライマリディスプレイに表示する
        const primaryDisplay = screen.getPrimaryDisplay()
        const bounds = primaryDisplay.workArea
        return { x: bounds.x, y: bounds.y + (bounds.height - mainWindowSize.height)/2 }
      }

      // 前回起動座標が無効
      if (! restoredMainWindowBounds) {
        // 表示位置を指定しない
        return undefined
      }

      // 前回起動座標が有効
      return { x: restoredMainWindowBounds.x, y: restoredMainWindowBounds.y }
    })()

    // 表示座標を指定しない場合、中央表示
    const mainWindowPlacement = mainWindowPos ?? { center: true }

    // create main frame
    const additionalArguments: string[] = [];
    additionalArguments.push(`${Const.ArgAppLaunchId}=${appLaunchId}`);
    if (Env.isTestMode) {
      additionalArguments.push(Const.ArgIsTestMode);
    }
    if (gameState.muted) {
      additionalArguments.push(Const.ArgIsInitMuted);
    }
    const mainWindowOptions: BrowserWindowConstructorOptions = {
      useContentSize: true,
      width: mainWindowSize.width,
      height: mainWindowSize.height,
      ...mainWindowPlacement,
      minWidth: minWidth,
      minHeight: minHeight,
      fullscreenable: false,
      maximizable: false,
      titleBarStyle: 'hidden',
      frame: false,
      resizable: !gameSetting.isAssistInGame,
      backgroundColor: '#000',
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        nodeIntegrationInSubFrames: true,
        webviewTag: true,
        spellcheck: false,
        preload: path.join(__dirname, '../preload/index.js'),
        additionalArguments,
        sandbox: false
        //sandbox: true
      }
    }
    this.main_window = new BrowserWindow(mainWindowOptions)

    // ゲームのみ表示で保存されていたサイズを復元
    const restoredGameOnlySize = appSetting.restoreGameOnlySize()
    if (restoredGameOnlySize) {
      appState.game_only_width = restoredGameOnlySize.width
      appState.game_only_height = restoredGameOnlySize.height
    }

    // ゲームページの場合にプリロード指定
    this.main_window.webContents.on('will-attach-webview', (_event, webPreferences, params) => {
      debug('will-attach-webview:', params, webPreferences)
      if (params.src === Const.GamePageUrl) {
        webPreferences.preload = path.join(getMainDir(), '../preload/xhr-hook.js')
      }
    })

    if (Env.isDevelopment) {
      this.main_window.webContents.openDevTools()
    }

    appState.media_source_id = this.main_window.getMediaSourceId()
    debug({
      'assistRestricted': gameSetting.assistRestricted,
      main_window_id: this.main_window.id,
      media_source_id: appState.media_source_id,
      mainWindowSize: mainWindowSize,
      mainWindowPos: mainWindowPos,
      frame_ratio: this.frame_ratio,
      minWidth,
      minHeight,
      'calcFrameRatio:': AppStuff.calcFrameRatio(minWidth, minHeight)
    })

    debug(
      'mainWindow pos info', {
        'getPosition': this.main_window.getPosition(),
        'getBounds': this.main_window.getBounds(),
        'getContentBounds': this.main_window.getContentBounds(),
        'getSize': this.main_window.getSize()
      }
    )

    gameSettingProxy.webContents = this.main_window.webContents
    if (!gameSetting.isAssistInGame) {
      this.updateGameOnlyZoomFactor()
    }
    this.main_window.setAlwaysOnTop(gameSetting.topmost)

    // open app html
    openAppHtml(this.mainWindow)

    // アシストウインドウを別画面で表示する場合
    // display要件を満たすディスプレイがない場合はアシストウインドウを別画面で表示する
    const restoredAssistWindowState = appSetting.restoreAssistWindowState(true)
    if (restoredAssistWindowState || gameSetting.assistRestricted) {
      const state = gameSetting.assistRestricted ? undefined : restoredAssistWindowState
      this.openAssistWindow(state?.position ? { ...state.position, display: state.display } : undefined)
    }

    // Persist window state before any child windows are closed by the main window shutdown path.
    this.mainWindow.on('close', () => {
      if (this.assist_window && !this.assist_window.isDestroyed()) {
        if (! gameSetting.assistRestricted) {
          appSetting.updateAssistWindowState(this.assist_window, false)
        }
      }
      this.saveAppState()
    })

    this.mainWindow.on('closed', () => this.onClosed())
    this.mainWindow.on('resize', () => this.onResize())
    this.mainWindow.on('will-resize', (event, newBounds, _details) =>
      this.onWillResize(event, newBounds)
    )

    // set intake schedule
    Intaker.setIntakeSchedule();
  }

  /**
   *
   */
  private openAssistWindow(position?: { x: number; y: number, display: Display }): void {
    if (this.assist_window) {
      // noop
      return
    }

    // 表示位置計算
    const assistWindowPosition = ((): { x: number; y: number, display: Display } => {

      // 位置情報が有効
      if (position) {
        return position
      }

      // 推奨サイズの要件を満たすディスプレイがない場合
      if (gameSetting.assistRestricted) {
        // 表示位置保存が無い場合、プライマリディスプレイに表示する
        // ウインドウはcontentsizeでの作成で実際はフレームサイズ分補正が必要
        // 補正はウインドウ非表示で作成後に行う
        const primaryDisplay = screen.getPrimaryDisplay()
        const bounds = primaryDisplay.workArea
        const y = Math.max(bounds.y, bounds.y + (bounds.height-Const.InGameAssistDisplayRequirementHeight)/2)
        // debug('assist window position for restricted:', 
        //   { x: bounds.x + bounds.width - Const.AssistWidth, y, display: primaryDisplay,
        //     assistWindowWidth: Const.AssistWidth,
        //     bounds: bounds
        //   })
        return { 
          x: bounds.x + bounds.width - Const.AssistWidth, 
          y, 
          display: primaryDisplay }
      }

      // 位置情報が無効、メインウインドウの表示位置から空いている領域に表示
      const mainRect = this.main_window.getNormalBounds();
      const display = screen.getDisplayMatching(this.main_window.getBounds());
      const bounds = display.workArea
      const y = Math.max(bounds.y, bounds.y + (bounds.height-Const.InGameAssistDisplayRequirementHeight)/2)

      // 空き領域判定
      const intersectRect = RectUtil.intersect(mainRect, bounds)
      if (! intersectRect) {
        return { x: mainRect.x + mainRect.width - 100, y, display }
      }

      const leftSpace = intersectRect.x - bounds.x
      const rightSpace = bounds.x + bounds.width - (intersectRect.x + intersectRect.width)
      if (rightSpace >= leftSpace) {
        return { x: intersectRect.x + intersectRect.width, y, display }
      } else {
        return { x: intersectRect.x - Const.AssistWidth, y, display }
      }
    })()

    // 表示サイズ計算
    const assistWindowSize = ((): { width: number; height: number } => {
      return {
        width: Const.AssistWidth, 
        height: Math.min(
          Const.InGameAssistDisplayRequirementHeight - Const.TitleBarHeight, 
          assistWindowPosition.display.workArea.height)
      }
    })()

    const additionalArguments: string[] = [Const.ArgIsAssist];
    if (Env.isTestMode) {
      additionalArguments.push(Const.ArgIsTestMode);
    }

    debug('assist window info', {
      assistRestricted: gameSetting.assistRestricted,
      assistWindowPosition,
      assistWindowSize,
      display: assistWindowPosition.display,
    })

    const iconPath = app.isPackaged 
      ? path.join(process.resourcesPath, 'resources/app.ico') : path.join(__dirname, '../../resources/app.ico')
    this.assist_window = new BrowserWindow({
      title: '甲ブラウザ',
      icon: iconPath,
      parent: this.main_window,
      useContentSize: true,
      width: assistWindowSize.width,
      height: assistWindowSize.height,
      x: assistWindowPosition.x,
      y: assistWindowPosition.y,
      show: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        nodeIntegrationInSubFrames: true,
        spellcheck: false,
        preload: path.join(getMainDir(), '../preload/index.js'),
        additionalArguments,
        sandbox: false
        //sandbox: true
      }
    })
    this.assist_window.setMenu(null)

    // ウインドウ位置とサイズをフレームサイズで補正
    if (gameSetting.assistRestricted) {

      // 位置補正
      const contentBounds = this.assist_window.getContentBounds()
      const windowBounds = this.assist_window.getBounds()
      const fixX = windowBounds.width - contentBounds.width
      const fixX2 = Math.trunc(fixX/assistWindowPosition.display.scaleFactor)
      this.assist_window.setPosition(
        assistWindowPosition.x - fixX2,
        assistWindowPosition.y);

      // サイズ補正
      const workArea = assistWindowPosition.display.workArea
      if (workArea.height < windowBounds.height) {
        this.assist_window.setSize(
          windowBounds.width,
          workArea.height+Math.max(0, fixX2-2),
          false
        )
      }
    }

    // 補正後に表示
    this.assist_window.show()

    this.assist_window.addListener('close', () => {
      if (! gameSetting.assistRestricted) {
        // 閉じた位置を保存
        if (this.assist_window) {
          appSetting.updateAssistWindowState(this.assist_window, true)
        }
      }
    })
    this.assist_window.addListener('closed', () => {
      this.assist_window = null
    })

    // open app html
    openAppHtml(this.assist_window)

    if (Env.isDevelopment) {
      this.assist_window.webContents.openDevTools()
    }
  }

  /**
   * 
   */
  private setupHandlers() {
    app.on('web-contents-created', (event, webContents) =>
      this.onWebContentsCreated(event, webContents)
    )

    ipcMain.handle(MainChannel.renderer_ready, async (event) => this.onChannelRendererReady(event))
    ipcMain.handle(MainChannel.show_assist, () => this.onChannelShowAssist(true))
    ipcMain.handle(MainChannel.hide_assist, () => this.onChannelShowAssist(false))
    ipcMain.handle(MainChannel.minimize, async () => this.onChannelMinimize())
    ipcMain.handle(MainChannel.close, async () => this.onChannelClose())
    ipcMain.handle(MainChannel.devtool, async () => this.onChannelDevTool())
    ipcMain.handle(MainChannel.reload, async (_event, arg) => this.onChannelReload(arg))
    ipcMain.handle(MainChannel.openAssist, async () => this.onChannelOpenAssist())
    ipcMain.handle(MainChannel.topmost, async () => this.onChannelTopmost())
    ipcMain.handle(MainChannel.notify_mute_state, async (_event, arg) => this.onChannelNotifyMuteState(arg))
    ipcMain.handle(MainChannel.open_capture_folder, async () => this.onChannelOpenCaptureFolder())
    ipcMain.handle(MainChannel.save_capture, async (_event, date, buffer) =>
      this.onChannelSaveCapture(date, buffer)
    )
    ipcMain.handle(MainChannel.refresh_assist, async () => this.onChannelRefreshAssist())
    ipcMain.handle(MainChannel.store_rec, async (_event, buffer, isEnd) =>
      this.onChannelStoreRec(buffer, isEnd)
    )
    ipcMain.handle(MainChannel.timeline, async () => this.onChannelTimeline())
    ipcMain.handle(MainChannel.request_required_data, (event) => this.onChannelRequestRequiredData(event))
    ipcMain.handle(MainChannel.ship_csv, async (_event, csv) => this.onChannelShipCsv(csv))
    ipcMain.handle(MainChannel.get_airbase_spots, async (_event, area_id, area_no) =>
      this.onChannelGetAirbaseSpots(area_id, area_no)
    )
    ipcMain.handle(MainChannel.set_airbase_spots, async (_event, arg) =>
      this.onChannelSetAirbaseSpots(arg)
    )
    ipcMain.handle(MainChannel.open_external_url, async (_event, url) =>
      this.onChannelOpenExternalUrl(url)
    )
    ipcMain.handle(MainChannel.get_version, () => this.onChannelGetVersion())
    ipcMain.handle(MainChannel.query_db, async (_event, query) => this.onChannelQueryDb(query))
    ipcMain.handle(MainChannel.clear_session_cache, async () => this.onChannelClearSessionCache())
    ipcMain.handle(MainChannel.find_spot_for_label, async (_event, mapnifo, map) =>
      this.onChannelFindSpotForLabel(mapnifo, map)
    )
    ipcMain.handle(MainChannel.cell_info_async, async (_event, area_id, area_no) =>
      this.onChannelCellInfoAsync(area_id, area_no)
    )
    ipcMain.handle(MainChannel.calc_port_chart_data, async (_event) =>
      this.onChannelCalcPortChartData()
    )
    ipcMain.handle(MainChannel.save_app_setting, (event, store) =>
      this.onChannelSaveAppSetting(event, store)
    )
    ipcMain.handle(MainChannel.save_global_setting, (event, setting) =>
      this.onChannelSaveGlobalSetting(event, setting)
    )
    ipcMain.handle(MainChannel.aggregate_cell_rank, (_event, area_id, area_no) =>
      this.onChannelAggregateRankByArea(area_id, area_no)
    )
    ipcMain.handle(MainChannel.aggregate_ship_drop, (_event, ship_id) =>
      this.onChannelAggregateShipDrop(ship_id)
    )
    ipcMain.handle(MainChannel.get_inherit_score_list, async () => 
      this.onChannelGetInheritScoreList()
    )
    ipcMain.handle(MainChannel.save_inherit_score_list, (_event, list) => 
      this.onChannelSaveInheritScoreList(list)
    )
    ipcMain.handle(MainChannel.get_update_state, async () =>
      this.onChannelGetUpdateState()
    )
    ipcMain.handle(MainChannel.check_for_updates, async (_event, setting?: GlobalSetting) =>
      this.onChannelCheckForUpdates(setting)
    )
    ipcMain.handle(MainChannel.download_update, async () =>
      this.onChannelDownloadUpdate()
    )
    ipcMain.handle(MainChannel.restart_and_install_update, async () =>
      this.onChannelRestartAndInstallUpdate()
    )
    autoUpdater.on('download-progress', (progress) =>
      this.notifyUpdateDownloadProgress(progress.percent)
    )

    powerMonitor.on('resume', () => this.onPowerResume())
    this.cbBasicFirst = ApiCallback.set([kcsapi.Api.GET_MEMBER_REQUIRE_INFO, () => this.onRequireInfo()])
    ApiCallback.set([kcsapi.Api.GET_MEMBER_MAPINFO, (args) => this.onMapInfo(args)])
    ApiCallback.set([kcsapi.Api.GET_MEMBER_MISSION, (args) => this.onMissionList(args)])
    ApiCallback.set([kcsapi.Api.GET_MEMBER_QUESTLIST, (args) => this.onQuestList(args)])

    // api request/response hook event
    ipcMain.on(kcsapi_hook.HookedType.serverid, (_event, data) => this.onApiHookServerId(data));
    ipcMain.on(kcsapi_hook.HookedType.loadstart, (_event, data) => this.onApiHookLoadStart(data));
    ipcMain.on(kcsapi_hook.HookedType.loadend, (_event, data) => this.onApiHookLoadEnd(data));
    if (Env.isDevelopment) { 
      ipcMain.on(kcsapi_hook.HookedType.unk_loadstart, (_event, data) => this.onApiHookUnknownLoadStart(data));
      ipcMain.on(kcsapi_hook.HookedType.unk_loadend, (_event, data) => this.onApiHookUnknownLoadEnd(data));
    }
  }

  /**
   * カスタムメニュー設定
   */
  private static buildCustomMenu(): Menu {
    const goBackFoward = (id: number, isBack: boolean) => {
      const w = BrowserWindow.fromId(id)
      if (w) {
        const wc = w.webContents
        if (isBack) {
          if (wc.navigationHistory.canGoBack()) {
            wc.navigationHistory.goBack()
          }
        } else {
          if (wc.navigationHistory.canGoForward()) {
            wc.navigationHistory.goForward()
          }
        }
      }
    };

    const template: (MenuItem | Electron.MenuItemConstructorOptions)[] = [
      {
        label: 'ファイル',
        submenu: [
          {
            label: '閉じる',
            accelerator: 'Ctrl+W',
            role: 'close',
          }
        ]
      },
      {
        label: '表示',
        submenu: [
          {
            label: 'リロード',
            accelerator: 'Ctrl+R',
            role: 'reload',
          },
          {
            label: 'リロード',
            accelerator: 'F5',
            role: 'reload',
            visible: false
          },
          {
            label: 'キャッシュを無視してリロード',
            accelerator: 'Ctrl+Shift+R',
            role: 'forceReload',
          },
          {
            label: 'キャッシュを無視してリロード',
            accelerator: 'Ctrl+F5',
            role: 'forceReload',
            visible: false
          },
          { type: 'separator' },
          {
            label: '戻る',
            accelerator: 'Alt+Left',
            click: (_menuItem, window) => goBackFoward(window?.id ?? -1, true)
          },
          {
            label: '進む',
            accelerator: 'Alt+Right',
            click: (_menuItem, window) => goBackFoward(window?.id ?? -1, false)
          },
          { type: 'separator' },
          {
            label: '開発者ツール',
            accelerator: 'F12',
            role: 'toggleDevTools',
          }
        ]
      },
    ]

    return Menu.buildFromTemplate(template)
  }

  /**
   * 
   * @param window 
   */
  private static setCustomMenu(window: BrowserWindow): void {
    window.setMenu(KcApp.buildCustomMenu())
  }

  // private closeAssistWindow(): void {
  //   if (this.assist_window) {
  //     this.assist_window.close()
  //   }
  // }

  /**
   *
   */
  postReqToRenderer(api: kcsapi.Api, data: string): void {
    const msg: ApiReqMessage = { type: 'api_req', api, data }
    streamManager.postToRenderers(msg);
  }

  /**
   *
   */
  postResToRenderer(api: kcsapi.Api, data: string, uuid?: string): void {
    const msg: ApiResMessage = { type: 'api_res', api, data, uuid }
    streamManager.postToRenderers(msg);
  }

  /**
   *
   * @param event
   * @param webContents
   */
  private onWebContentsCreated(_event: Event, webContents: WebContents): void {
    debug('onWebContentsCreated') //, event, webContents);

    const didCreateWindowHandler = (window: BrowserWindow, detail: DidCreateWindowDetails) => 
      this.onDidCreateWindow(window, detail, webContents)

    webContents.addListener('did-create-window', (window, detail) => didCreateWindowHandler(window, detail))
    webContents.setWindowOpenHandler((details) => this.windowOpenHandler(details))

    // destroyed イベントでリスナー削除
    webContents.once('destroyed', () => {
      webContents.removeListener('did-create-window', didCreateWindowHandler)
    })
  }

  /**
   *
   */
  private onChannelRendererReady(event: IpcMainInvokeEvent) {

    // set test data
    if (Env.isTestMode) {
      setTestData(this)
    }

    const webContents = event.sender
    const isMainContents = webContents === this.main_window.webContents
    debug(MainChannel.renderer_ready, 
      'srcid:', appState.media_source_id, 'isMainContents:', isMainContents)

    // send game state
    if(isMainContents) {
      webContents.send(GameChannel.set_app_state, appState)
      webContents.send(GameChannel.set_game_setting, gameSettingProxy.value)
    }

    // notify start up check result if already checked
    if (this.startupUpdateCheckResult) {
      webContents.send(MainMessage.startup_update_checked, this.startupUpdateCheckResult)
    }
    webContents.send(MainMessage.update_state_changed, this.updateState)

    // connect stream port
    streamManager.connect(webContents);
  }

  /**
   *
   */
  private onChannelShowAssist(show: boolean): void {
    debug('show assist show:', show)

    if (gameSetting.isAssistInGame === show) {
      return
    }

    if (!gameSetting.assistInGame) {
      const size = this.mainWindow.getContentSize()
      appState.game_only_width = size[0]
      appState.game_only_height = size[1]
      gameSetting.zoom_factor = 1
    }

    gameSetting.setAssistInGame(show)
    this.mainWindow.setResizable(!gameSetting.isAssistInGame)

    const size = calcMainWindowSize(gameSetting.isAssistInGame)
    debug('resize main window for assist show change', size)
    this.nohandle_resize = true
    this.mainWindow.setContentSize(size.width, size.height, false)
    if (!gameSetting.isAssistInGame) {
      const { minWidth, minHeight } = calcMainWindowMinSize();
      this.mainWindow.setMinimumSize(minWidth, minHeight)
    }
    debug('resize main window contents size', this.mainWindow.getContentSize())
    if (!gameSetting.isAssistInGame) {
      gameSetting.zoom_factor = AppStuff.calcGameZoomFactor(size.width)
    }
    this.nohandle_resize = false
  }

  /**
   *
   */
  private updateGameOnlyZoomFactor(): void {
    if (gameSetting.isAssistInGame) {
      return
    }

    const size = this.mainWindow.getContentSize()
    appState.game_only_width = size[0]
    appState.game_only_height = size[1]
    const calcSize = calcMainWindowSize(gameSetting.isAssistInGame)
    gameSetting.zoom_factor = AppStuff.calcGameZoomFactor(calcSize.width)
  }

  /**
   *
   * @param details
   * @returns
   */
  private windowOpenHandler(details: HandlerDetails):
    | { action: 'deny' }
    | {
        action: 'allow'
        outlivesOpener?: boolean
        overrideBrowserWindowOptions?: BrowserWindowConstructorOptions
      } {
    debug('windowOpenHandler', details)
    //return { action: 'deny' };
    return { action: 'allow' }
  }

  /**
   *
   * @param window
   * @param detail
   */
  private onDidCreateWindow(window: BrowserWindow, detail: DidCreateWindowDetails, parentWebContents: WebContents): void {
    debug('onDidCreateWindow detail:', detail)

    // set custom menu
    KcApp.setCustomMenu(window)

    const parentWindow = BrowserWindow.fromWebContents(parentWebContents) ?? this.mainWindow
    const targetDisplay = parentWindow
      ? screen.getDisplayMatching(parentWindow.getBounds())
      : screen.getDisplayMatching(window.getBounds())
    const area = targetDisplay.workArea
    const width = Math.floor(area.width * 3 / 5)
    const height = Math.floor(area.height * 4 / 5)
    const x = area.x + Math.floor((area.width - width) / 2)
    const y = area.y + Math.floor((area.height - height) / 2)
    window.setBounds({ x, y, width, height }, false)
  }

  /**
   *
   */
  private onChannelMinimize(): void {
    debug(MainChannel.minimize)
    this.mainWindow.minimize()
  }

  /**
   *
   */
  private async onChannelClose() {
    debug('on channel msg', MainChannel.close)

    // update assist windows pos
    if (this.assist_window?.isVisible()) {
      appSetting.updateAssistWindowState(this.assist_window, false)
    }

    this.saveAppState()
    // no effect
    //mainWindow.close();
    this.mainWindow.destroy()
  }

  /**
   *
   */
  private onChannelDevTool() {
    debug(MainChannel.devtool)
    const webContents = this.mainWindow.webContents
    if (webContents) {
      if (webContents.isDevToolsOpened()) {
        webContents.closeDevTools()
      } else {
        webContents.openDevTools()
      }
    }
  }

  /**
   *
   */
  private onChannelReload(ignoreCache: boolean) {
    debug(MainChannel.reload, 'ignoreCache:', ignoreCache)
    const webContents = this.mainWindow.webContents
    if (webContents) {
      if (ignoreCache) {
        webContents.reloadIgnoringCache()
      } else {
        webContents.reload()
      }
    }
  }

  /**
   *
   */
  private onChannelTopmost() {
    debug(MainChannel.topmost)
    this.main_window.setAlwaysOnTop(!gameSetting.topmost)
    gameSetting.topmost = !gameSetting.topmost
  }

  /**
   * Keep the main-process mute state in sync with the renderer.
   */
  private onChannelNotifyMuteState(muted: boolean) {
    debug(MainChannel.notify_mute_state, 'muted:', muted)
    gameState.muted = muted
  }

  /**
   *
   */
  private onChannelOpenAssist() {
    debug(MainChannel.openAssist, 'assist_window:', this.assist_window !== null)
    if (this.assist_window) {
      this.assist_window.show()
      this.assist_window.focus()
    } else {
      const state = appSetting.restoreAssistWindowState(false)
      this.openAssistWindow(state?.position ? { ...state.position, display: state.display } : undefined)
    }
  }

  /**
   *
   */
  private onChannelOpenCaptureFolder() {
    debug(MainChannel.open_capture_folder)
    shell.openPath(PathStuff.capturePathExe(true))
  }

  /**
   *
   * @param date
   * @param buffer
   */
  private onChannelSaveCapture(date: Date, buffer: Buffer) {
    const capture_dir = PathStuff.capturePathExe(true)
    const filename = `${moment(date).format('YYYYMMDD-HHmmss')}.png`
    debug(MainChannel.save_capture, 'date:', date, filename, capture_dir)
    fs.writeFile(path.join(capture_dir, filename), buffer, {}, (err) => {
      debug('save writed to file', filename, err)
    })
  }

  private closeRecorder(): void {
    if (this.wsRecording) {
      const ws = this.wsRecording
      this.wsRecording = null
      if (ws) {
        ws.end(() => {
          debug('save recording closed')
        })
      }
    }
  }

  /**
   *
   * @param buffer
   * @param isEnd
   */
  private async onChannelStoreRec(buffer: Buffer, isEnd: boolean) {
    debug(
      MainChannel.store_rec,
      'buffer size',
      buffer.length,
      'bytes(if 0 byte, noop)',
      'isEnd',
      isEnd
    )
    if (!buffer || buffer.length === 0) {
      return
    }

    if (!this.wsRecording) {
      const capture_dir = PathStuff.capturePathExe(true)
      const date = new Date()
      const filename = `${moment(date).format('YYYYMMDD-HHmmss')}.webm`
      const filepath = path.join(capture_dir, filename)
      // default highWaterMark is 16KB. set 4MB.
      this.wsRecording = fs.createWriteStream(filepath, {
        flags: 'a',
        highWaterMark: 4 * 1024 * 1024
      })
      debug(
        MainChannel.store_rec,
        'date:',
        new Date(),
        filepath,
        capture_dir,
        this.wsRecording.writableHighWaterMark
      )
    }

    if (this.wsRecording) {
      if (!this.wsRecording.write(buffer)) {
        // 一度だけ待つ
        await once(this.wsRecording, 'drain') // バックプレッシャ対応
        if (!this.wsRecording.write(buffer)) {
          debug(
            'recording write failed',
            this.wsRecording.path,
            this.wsRecording.bytesWritten,
            'bytes written'
          )
          dialog.showErrorBox('レコーディング失敗', 'ファイル書き込みに失敗しました')
          const path = this.wsRecording.path
          this.wsRecording.end(() => {
            fs.unlinkSync(path)
          })
          this.wsRecording = null
        }
      } else {
        debug(MainChannel.store_rec, this.wsRecording.bytesWritten, 'bytes written')
      }
    }

    if (isEnd) {
      this.closeRecorder()
    }
  }

  /**
   * 
   * @param setting 
   * @returns 
   */
  private checkUpdateIfNeeded(setting: GlobalSetting): void {
    if (! setting.checkUpdateOnStartup) {
      return
    }
    if (this.isStartupUpdateChecked) {
      return
    }
    this.isStartupUpdateChecked = true
    this.setUpdateState({
      status: 'checking',
      availableVersion: '',
      errorMessage: '',
      downloadPercent: null,
    })
    this.checkForUpdatesCore(setting).then((result) => {
      this.startupUpdateCheckResult = result
      this.notifyStartupUpdateChecked(result)
    })
  } 

  /**
   * 
   * @param webContents 
   */
  private postRequiredData(
    webContents: WebContents | null, 
    sendSvData: boolean,
    emptyData: boolean
  ): void {

    const task1 = new Promise<GlobalSetting>((resolve, reject) => {
      globalSettingStore.load(defaultGlobalSetting(), (data) => resolve(data), (err: any) => reject(err))
    });

    if (emptyData) {
      Promise.allSettled([task1]).then((results) => {
        const globalSettingResult = results[0]
        const globalSetting = globalSettingResult.status === 'fulfilled' ? globalSettingResult.value : defaultGlobalSetting()
        this.globalSetting = globalSetting
        Intaker.setEnabled(globalSetting.enableIntake)

        // グローバル設定読み込み時、必要なら更新チェックは行う
        this.checkUpdateIfNeeded(globalSetting)

        const msg: RequiredMessage  = { 
          type: 'required',
          svdata: null,
          quests: [],
          globalSetting,
          appSetting: defaultAppSetting(),
          mapInfo: EmptyApiMapInfoList(),
          missionList: EmptyApiMissionList(),
          questList: EmptyApiQuestList()
        }
        if (webContents) {
          streamManager.postToRendererA(webContents, msg);
        } else {
          streamManager.postToRenderers(msg);
        }
      })
      return
    }

    const task2 = new Promise<void>((resolve, reject) => {
      appSettingStore.load(() => resolve(), (err: any) => reject(err))
    });
    const taks3 = new Promise<ApiMapInfoList>((resolve, reject) => {
      mapInfoStoreLoader.load(EmptyApiMapInfoList(), (data) => resolve(data), (err: Error) => reject(err))
    });
    const taks4 = new Promise<ApiMissionList>((resolve, reject) => {
      missionListStoreLoader.load(EmptyApiMissionList(), (data) => resolve(data), (err: Error) => reject(err))
    });
    const task5 = new Promise<ApiQuestList>((resolve, reject) => {
      questListStoreLoader.load(EmptyApiQuestList(), (data) => resolve(data), (err: Error) => reject(err))
    });

    //debug('send to quests(sv data):', quests);
    Promise.allSettled([task1, task2, taks3, taks4, task5]).then((results) => {
      const globalSettingResult = results[0]
      const mapInfoResult = results[2]
      const missionListResult = results[3]
      const questListResult = results[4]
      const quests = this.kcrecord?.quests ?? []
      const globalSetting = globalSettingResult.status === 'fulfilled' ? globalSettingResult.value : defaultGlobalSetting()
      this.globalSetting = globalSetting
      Intaker.setEnabled(globalSetting.enableIntake)

      // グローバル設定読み込み時、必要なら更新チェックは行う
      this.checkUpdateIfNeeded(globalSetting)

      const msg: RequiredMessage  = { 
        type: 'required', 
        svdata: sendSvData ? svdata.svdataRaw : null,
        quests,
        globalSetting,
        appSetting: appSettingStore.get(),
        mapInfo: mapInfoResult.status === 'fulfilled' ? mapInfoResult.value : EmptyApiMapInfoList(),
        missionList: missionListResult.status === 'fulfilled' ? missionListResult.value : EmptyApiMissionList(),
        questList: questListResult.status === 'fulfilled' ? questListResult.value : EmptyApiQuestList()
      }
      if (webContents) {
        streamManager.postToRendererA(webContents, msg);
      } else {
        streamManager.postToRenderers(msg);
      }
    });
  }

  /**
   *
   */
  private onChannelRequestRequiredData(event: IpcMainInvokeEvent) {

    const webContents = event.sender

    // まだゲームを開始していない場合は必要なデータがないことから、データなしで返す
    if (this.cbBasicFirst) {
      debug('onChannelRequestRequiredData: no data. maybe game not started yet.')
      this.postRequiredData(webContents, false, true);
      return
    }

    this.postRequiredData(webContents, true, false);
  }

  /**
   *
   */
  private onChannelShipCsv(lines: string): void {
    const filename = `${moment(new Date()).format('YYYYMMDD-HHmmss')}.csv`
    debug(MainChannel.ship_csv)
    dialog.showSaveDialog({ defaultPath: filename }).then((dialog_return) => {
      if (!dialog_return.canceled && dialog_return.filePath) {
        const buf = iconv.encode(lines, 'Shift_JIS')
        fs.open(dialog_return.filePath, 'w', (err, fd) => {
          if (err) {
            dialog.showErrorBox('保存に失敗しました', dialog_return.filePath ?? 'パスがありません')
          } else {
            fs.write(fd, buf, 0, buf.length, (err, _written, _buffer) => {
              fs.close(fd, (err) => {
                if (err) {
                  debug('save csv err', err)
                }
              })
              debug('save writed to file', dialog_return.filePath, err)
              if (err) {
                dialog.showErrorBox(
                  '書き込みに失敗しました',
                  dialog_return.filePath ?? 'パスがありません'
                )
              }
            })
          }
        })
      }
    })
  }

  /**
   *
   */
  private onChannelGetAirbaseSpots(
    area_id: number,
    area_no: number
  ): [[string, string], [string, string], [string, string]] {
    debug(MainChannel.get_airbase_spots, area_id, area_no)
    return airbaseSpotStore.getSpots(area_id, area_no)
  }

  /**
   *
   */
  private onChannelSetAirbaseSpots(arg: AirbaseSpot): void {
    debug(MainChannel.set_airbase_spots, arg)
    airbaseSpotStore.setSpots(arg.area_id, arg.area_no, arg.spots)
  }

  /**
   *
   */
  private onChannelOpenExternalUrl(url: string): void {
    shell.openExternal(url)
  }

  /**
   *
   */
  private onChannelGetVersion(): string {
    return app.getVersion()
  }

  /**
   * 
   * @returns 
   */
  private async onChannelCheckForUpdates(setting: GlobalSetting = this.globalSetting): Promise<UpdateCheckResult> {
    this.globalSetting = setting
    this.setUpdateState({
      status: 'checking',
      availableVersion: '',
      errorMessage: '',
      downloadPercent: null,
    })
    return this.checkForUpdatesCore(setting)
  }

  private onChannelGetUpdateState(): UpdateStateSnapshot {
    return { ...this.updateState }
  }

  /**
   * 
   * @returns 
   */
  private async checkForUpdatesCore(setting: GlobalSetting = this.globalSetting): Promise<UpdateCheckResult> {
    const channels = this.getUpdateCheckChannels(setting)
    for (const channel of channels) {
      const result = await this.checkForUpdatesByChannel(channel)
      if (result.status === 'available') {
        return result
      }
      if (result.status === 'error') {
        const isBetaChannelNotFound = channel === 'beta' && result.errorCode === 'ERR_UPDATER_CHANNEL_FILE_NOT_FOUND'
        if (!isBetaChannelNotFound) {
          this.setUpdateStateFromResult(result)
          return result
        }
      }
    }

    this.availableUpdateVersion = null
    const updateResult: UpdateCheckResult = { status: 'not-available' }
    this.setUpdateStateFromResult(updateResult)
    return updateResult
  }

  private getUpdateCheckChannels(setting: GlobalSetting): UpdateChannel[] {
    return setting.checkBetaUpdate ? ['beta', 'latest'] : ['latest']
  }

  private async checkForUpdatesByChannel(channel: UpdateChannel): Promise<UpdateCheckResult> {
    try {
      autoUpdater.channel = channel
      autoUpdater.allowDowngrade = false

      const result = await autoUpdater.checkForUpdates()
      const version = result?.updateInfo?.version
      const currentVersion = app.getVersion()
      debug('checkForUpdatesCore', {
        channel,
        currentVersion: currentVersion, 
        latestVersion: version,
        isUpdateAvailable: result?.isUpdateAvailable, 
      })

      if (result?.isUpdateAvailable && version) {
        this.availableUpdateVersion = version
        const updateResult: UpdateCheckResult = { status: 'available', version }
        this.setUpdateStateFromResult(updateResult)
        return updateResult
      }

      return { status: 'not-available' }
    } catch (error) {
      debug('check for updates failed', error, 'channel:', channel, 'url:', getUpdateFeedUrl())
      this.availableUpdateVersion = null
      const updateResult: UpdateCheckResult = {
        status: 'error',
        errorCode: this.getUpdateErrorCode(error, 'CHECK_FOR_UPDATES_FAILED'),
      }
      return updateResult
    }
  }

  private async onChannelDownloadUpdate(): Promise<void> {
    this.isSilentUpdate = true
    this.setUpdateState({
      status: 'updating',
      availableVersion: this.availableUpdateVersion ?? '',
      errorMessage: '',
      downloadPercent: 0,
    })

    if (!this.availableUpdateVersion) {
      const result = await this.checkForUpdatesCore()
      if (result.status !== 'available') {
        throw new Error(
          result.status === 'error' ? result.errorCode : 'NO_UPDATE_AVAILABLE',
        )
      }
    }

    try {
      await autoUpdater.downloadUpdate()
      this.downloadedUpdateVersion = this.availableUpdateVersion
      this.setUpdateState({
        status: 'ready',
        availableVersion: this.downloadedUpdateVersion ?? '',
        errorMessage: '',
        downloadPercent: 100,
      })
    } catch (error) {
      debug('install update failed.', error)
      debug('error msg.', this.getUpdateErrorCode(error, 'INSTALL_UPDATE_FAILED'))
      this.setUpdateState({
        status: 'error',
        availableVersion: '',
        errorMessage: this.getUpdateErrorCode(error, 'INSTALL_UPDATE_FAILED'),
        downloadPercent: null,
      })
      //throw new Error(this.getUpdateErrorCode(error, 'INSTALL_UPDATE_FAILED'))
    }
  }

  private async onChannelRestartAndInstallUpdate(): Promise<void> {
    if (!this.downloadedUpdateVersion) {
      throw new Error('NO_READY_UPDATE')
    }
    this.isSilentUpdate = false
    app.quit()
  }

  private getUpdateErrorCode(error: unknown, fallback: string): string {
    if (error && typeof error === 'object') {
      const code = Reflect.get(error, 'code')
      if (typeof code === 'string' && code) {
        return code
      }
      if (typeof code === 'number') {
        return String(code)
      }
    }
    return fallback
  }

  private notifyUpdateDownloadProgress(percent: number): void {
    const normalizedPercent = Math.max(0, Math.min(100, Math.round(percent)))
    this.updateState = {
      ...this.updateState,
      status: 'updating',
      downloadPercent: normalizedPercent,
      errorMessage: '',
    }
    this.notifyUpdateStateChanged()
    const webContents = streamManager.webContentsList
    webContents.forEach((wc) => {
      wc.send(MainMessage.update_download_progress, normalizedPercent)
    })
  }

  private setUpdateState(state: UpdateStateSnapshot): void {
    this.updateState = { ...state }
    this.notifyUpdateStateChanged()
  }

  private setUpdateStateFromResult(result: UpdateCheckResult): void {
    switch (result.status) {
      case 'available':
        this.setUpdateState({
          status: 'available',
          availableVersion: result.version,
          errorMessage: '',
          downloadPercent: null,
        })
        break
      case 'not-available':
        this.setUpdateState({
          status: 'latest',
          availableVersion: '',
          errorMessage: '',
          downloadPercent: null,
        })
        break
      case 'error':
        this.setUpdateState({
          status: 'error',
          availableVersion: '',
          errorMessage: result.errorCode,
          downloadPercent: null,
        })
        break
    }
  }

  private notifyUpdateStateChanged(): void {
    const webContents = streamManager.webContentsList
    webContents.forEach((wc) => {
      wc.send(MainMessage.update_state_changed, this.updateState)
    })
  }

  private notifyStartupUpdateChecked(result: UpdateCheckResult): void {
    const webContents = streamManager.webContentsList
    webContents.forEach((wc) => {
      wc.send(MainMessage.startup_update_checked, result)
    })
  }

  public hasDownloadedUpdate(): boolean {
    return this.downloadedUpdateVersion !== null
  }

  public quitAndInstallDownloadedUpdate(): void {
    if (!this.downloadedUpdateVersion) {
      return
    }
    const version = this.downloadedUpdateVersion
    this.downloadedUpdateVersion = null
    this.availableUpdateVersion = null
    debug(
      'quit and install downloaded update:', 
      version, 
      'is silent update:', this.isSilentUpdate)
    autoUpdater.quitAndInstall(this.isSilentUpdate, false);
  }

  /**
   *
   */
  private async onChannelQueryDb(query: Query): Promise<QueryReturn> {
    debug('onChannelQueryDb', query)
    if (!this.kcrecord) {
      return new Promise<[]>((resolve) => resolve([]))
    }
    return this.kcrecord.query(query)
  }

  /**
   *
   */
  private async onChannelClearSessionCache(): Promise<void> {
    debug(MainChannel.clear_session_cache)
    return session.defaultSession.clearCache()
  }

  /**
   *
   * @param mapinfo
   * @param map
   * @returns
   */
  public async onChannelFindSpotForLabel(mapinfo: MstMapinfo, map: ApiMap): Promise<Spot | null> {
    debug(MainChannel.find_spot_for_label, mapinfo, map)
    const cell_info = MapStuff.cellInfo(mapinfo.api_maparea_id, mapinfo.api_no)
    const spot = CommonMap.findSpotForLabel(cell_info.spots, map.api_no)
    return spot ? spot : null
  }

  /**
   * 
   * @param area_id 
   * @param area_no 
   * @returns 
   */
  public async onChannelCellInfoAsync(area_id: number, area_no: number): Promise<CellInfo> {
    debug(MainChannel.cell_info_async)
    return MapStuff.cellInfoAsync(area_id, area_no)
  }

  /**
   * 
   */
  async onChannelCalcPortChartData(): Promise<PortChartData> {
    debug(MainChannel.calc_port_chart_data)
    return getWorkerDriver().calcPortChartData();
  }

  /**
   * 
   */
  private onChannelSaveAppSetting(event: IpcMainInvokeEvent, setting: AppSetting): void {
    debug(MainChannel.save_app_setting, 'sender id:', event.sender.id)
    appSettingStore.save(setting)
    streamManager.postToRendererOthers(event.sender, { type: 'app_setting', setting });
  }

  /**
   * 
   * @param setting 
   */
  private onChannelSaveGlobalSetting(event: IpcMainInvokeEvent, setting: GlobalSetting): void {
    debug(MainChannel.save_global_setting, 'sender id:', event.sender.id)
    this.globalSetting = setting
    Intaker.setEnabled(setting.enableIntake)
    globalSettingStore.save(setting)
    streamManager.postToRendererOthers(event.sender, { type: 'global_setting', setting });
  }

  /**
   * 
   * @param area_id 
   * @param area_no 
   * @returns 
   */
  private onChannelAggregateRankByArea(
    area_id: number, area_no: number): Promise<AggregatedCellRank[]> {
    debug(MainChannel.aggregate_cell_rank)
    return getWorkerDriver().aggregateRankByArea(area_id, area_no)
  }

  /**
   * 
   * @param ship_id 
   * @returns 
   */
  private onChannelAggregateShipDrop(ship_id: number): Promise<AggregatedCellShipDrop[]> {
    return getWorkerDriver().aggregateShipDrop(ship_id)
  }

  /**
   * 
   */
  private onChannelGetInheritScoreList() : Promise<InheritScoreList> {
    debug(MainChannel.get_inherit_score_list)
    return new Promise<InheritScoreList>((resolve, reject) => {
      inheritScoreStoreLoader.load(defaultInheritScoreList(), (list: InheritScoreList) => {
        resolve(list)
      }, (err: Error) => {
        reject(err)
      })
    })
  }
  
  /**
   * 
   * @param list 
   */
  private onChannelSaveInheritScoreList(list: InheritScoreList): void {
    debug(MainChannel.save_inherit_score_list)
    inheritScoreStoreLoader.save(list)  
  }

  /**
   *
   */
  private async onChannelTimeline(): Promise<[QuestContext, BattleRecord[]]> {
    if (!this.kcrecord) {
      return Promise.resolve([{ quest_max: 0, quests: null }, []])
    }

    debug(MainChannel.timeline)
    const questTask = () => {
      return new Promise<QuestContext>((resolve) => {
        const questlist = svdata.questlist
        resolve({
          quest_max: svdata.parallelQuestCount,
          quests: questlist ? KcsUtil.questlistInProgress(questlist) : null
        })
      })
    }
    const query = { 
      dbName: DbName.battle, 
      find: {
        cellId : { $ne: -1 }
      },
      limit: 10,
      sort: { date: -1 }
    }
    return Promise.all([questTask(), this.kcrecord!.queryBattleRecord(query)])
  }

  /**
   *
   */
  private onChannelRefreshAssist() {
    // todo: remount vue app
    // debug(MainChannel.refresh_assist)
    // this.assist_webcontents.forEach((el) => el.webcontents.reload())
    // if (this.assist_window) {
    //   this.assist_window.webContents.reload()
    // }
  }

  /**
   *
   */
  private onPowerResume(): void {
    debug('power resume')
    this.mainWindow.webContents.send(GameChannel.resume)
  }

  /**
   *
   */
  private onRequireInfo(): void {
    if (this.cbBasicFirst) {
      ApiCallback.unset(this.cbBasicFirst)
      this.cbBasicFirst = 0
    }

    // create store dir
    PathStuff.createStoreDir()

    // load kc record
    if (!this.kcrecord) {
      this.kcrecord = new KcRecord(
        PathStuff.storeUser, 
        () => this.questUpdated(),
        () => this.questUpdated())
    }

    // send required data to renderer
    this.postRequiredData(null, false, false)
  }

  /**
   * 
   * @param args 
   */
  private onMapInfo(args: ApiMapInfoList): void {
    if (Env.isTestMode) {
      console.log('test mode: skip save map info list')
      return ;
    }
    mapInfoStoreLoader.save(args)
  }

  /**
   * 
   * @param args 
   */
  private onMissionList(args: ApiMissionList): void {
    if (Env.isTestMode) {
      console.log('test mode: skip save mission list')
      return ;
    }
    missionListStoreLoader.save(args)
  }

  /**
   * 
   * @param args 
   */
  private onQuestList(args: ApiQuestListWithParam): void {
    if (args.api_tab_id === ApiQuestListParamTabId.all) {
      const { api_tab_id: _api_tab_id, ...questlist }: ApiQuestListWithParam = args
      if (Env.isTestMode) {
        console.log('test mode: skip save quest list')
        return ;
      }
      questListStoreLoader.save(questlist)
    }
  }

  /**
   * 
   * @param data 
   */
  private onApiHookServerId(data: kcsapi_hook.ServerId): void {
    debug('main process received server id:', data.api_server_id);
    const api_data: ApiDataRoot = {
      api_result: ApiResult.ok,
      api_result_msg: '',
      api_data: {
        api_world_id: data.api_server_id
      }
    }
    const json = JSON.stringify(api_data)
    svdata.update(kcsapi.Api.API_WORLD_GET_ID, json)
    this.postResToRenderer(kcsapi.Api.API_WORLD_GET_ID, json)  
  }

  /**
   * 
   * @param data 
   */
  private onApiHookLoadStart(data: kcsapi_hook.LoadStart): void {
    debug('[XHR Request Started(in main)]', data.api, data.method) 
    kcapi_debug.logRequest(data);
    if (data.body) {
      svdata.setReq(data.api, data.body)
      this.postReqToRenderer(data.api, data.body)
    }
  }

  /**
   * 
   * @param data 
   */
  private onApiHookLoadEnd(data: kcsapi_hook.LoadEnd): void {
    debug('[XHR Request Ended(in main)]', data.api, data.method)
    kcapi_debug.logResponse(data);
    if (data.response) {
      svdata.update(data.api, data.response)
      const uuid: string | undefined = (data.api === kcsapi.Api.REQ_MAP_START) ? svdata.prvBattleMapInfo?.uuid : undefined
      this.postResToRenderer(data.api, data.response, uuid)
    }
  }

  /**
   * 
   * @param data 
   */
  private onApiHookUnknownLoadStart(data: kcsapi_hook.UnknownLoadStart): void {
    debug('[XHR Unknown Request Started(in main)]', data.url, data.method)
    kcapi_debug.logUnknownRequest(data);
  }     

  /**
   * 
   * @param data 
   */
  private onApiHookUnknownLoadEnd(data: kcsapi_hook.UnknownLoadEnd): void {
    debug('[XHR Unknown Request Ended(in main)]', data.url, data.method)
    kcapi_debug.logUnknownResponse(data);
  }     

  /**
   *
   */
  private questUpdated(): void {
    if (this.questUpdated_called) {
      return ;
    }
    this.questUpdated_called = true;
    setTimeout(() => {
      this.questUpdated_called = false;
      const quests = this.kcrecord?.quests ?? []
      const msg: QuestsMessage = { type: 'quests', quests }
      streamManager.postToRenderers(msg);
    }, 0);
  }

  /**
   *
   */
  private onClosed() {
    debug('main window closed. data ok:', svdata.isShipDataOk)
    this.kcrecord?.doDispose()
    this.closeRecorder()
  }

  /**
   *
   */
  private onResize(): void {
    if (this.nohandle_resize) {
      debug('mainWindow handle esize')
      return
    }

    //debug('mainWindow. resize>> ', this.mainWindow.getPosition(), this.mainWindow.getSize(), this.mainWindow.getContentSize(), gameSetting.assistInGame, gameSetting.isAssistInGame);
    const size = this.main_window.getContentSize()
    if (size) {
      const width = size[0]
      const height = AppStuff.calcFrameHeight(this.frame_ratio, width)
      //debug('>>>>>size', size[1], height, 'width', size[0]);
      process.nextTick(() => {
        //debug('tick', size[1], height, this.main_window.getSize());
        if (size[1] !== height) {
          this.main_window.setContentSize(width, height)
        }
        gameSetting.zoom_factor = AppStuff.calcGameZoomFactor(width)
        //mainWindow.webContents.send(GameChannel.set_zoom_factor, gameSetting.zoom_factor);
      })
      //debug('<<<<<size');
    }
  }

  /**
   *
   * @param event
   * @param newBounds
   */
  private onWillResize(event: Event, newBounds: Rectangle): void {
    const size = this.main_window.getContentSize()
    if (size) {
      debug(
        'mainWindow. will resize',
        newBounds.width,
        newBounds.height,
        'now(w,h):',
        size[0],
        size[1]
      )
      if (size[0] == newBounds.width) {
        event.preventDefault()
      }
    }
  }
}
