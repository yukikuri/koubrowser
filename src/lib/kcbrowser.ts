import { 
  BrowserWindow, 
  ipcMain, 
  Rectangle, 
  powerMonitor,
  WebContents,
  webContents,
  session,
  screen,
  app,
  shell,
  dialog,
  NewWindowEvent,
  BrowserWindowConstructorOptions,
  Referrer,
} from 'electron'
import * as fs from 'fs';
import { svdata } from '@/main/svdata';
import { Const } from '@/lib/const';
import { AppStuff, MainChannel, GameChannel, AssistChannel, QuestContext, IpcSvData, AirbaseSpot } from '@/lib/app';
import  moment from 'moment';
import { MapStuff } from '@/lib/map'
import { GameSetting } from '@/lib//setting';
import { KcRecord } from '@/lib/kcrecord';
import { Api, ApiCallback, ApiBattleStartType, KcsUtil, ApiBattleNormal } from '@/lib/kcs';
import { KcProxyStart } from '@/lib/kcproxy';
import { appState } from '@/global/appstate'
import path from 'path'
import { BattleRecord } from '@/lib/record';
import { IpcObject } from '@/lib/ipc';
import { airbaseSpotStore } from '@/main/store';
import { PathStuff } from '@/main/path';
import  iconv from 'iconv-lite';
import {
  createProtocol,
  //installVueDevtools
} from 'vue-cli-plugin-electron-builder/lib'

const gameSetting_ = new GameSetting();
const gameSettingProxy = new IpcObject<GameSetting>(gameSetting_, GameChannel.set_game_setting);
const gameSetting = new Proxy(gameSetting_, gameSettingProxy);

const setUseragent = (): void => {
  const ua = session.defaultSession.getUserAgent();
  const ua1 = ua.replace(/ koubrowser\/[0-9\\.]+/, '');
  const ua2 = ua1.replace(/ Electron\/[0-9\\.]+/, '');
  session.defaultSession.setUserAgent(ua2);
};

const nativeWindowHandle = (window: BrowserWindow): number => {
  const buf = window.getNativeWindowHandle();
  return buf.readInt32LE(0);
};

const calcFrameHeight = (width: number): number => {
  if (gameSetting.isAssistInGame) {
    width -= Const.AssistWidth;
  }
  return AppStuff.calcGameZoomFactor(width);
};

const updateMedals = () : void => {
  const medals = svdata.basic?.api_medals ?? 0;
  console.log('kc browser api port medals:', medals);
  if (gameSetting.medals !== medals) {
    gameSetting.medals = medals;
  }
};

const updateMaterial = (): void => {
  let v: number;
  v = svdata.fual;
  if (v && v !== gameSetting.fual) {
    gameSetting.fual = v;
  }
  v = svdata.bull;
  if (v && v !== gameSetting.bull) {
    gameSetting.bull = v;
  }
  v = svdata.steel;
  if (v && v !== gameSetting.steel) {
    gameSetting.steel = v;
  }
  v = svdata.buxite;
  if (v && v !== gameSetting.buxite) {
    gameSetting.buxite = v;
  }
  v = svdata.fastBuild;
  if (v && v !== gameSetting.fast_build) {
    gameSetting.fast_build = v;
  }
  v = svdata.fastRepair;
  if (v && v !== gameSetting.fast_repair) {
    gameSetting.fast_repair = v;
  }
  v = svdata.buildKit;
  if (v && v !== gameSetting.build_kit) {
    gameSetting.build_kit = v;
  }
  v = svdata.remodelKit;
  if (v && v !== gameSetting.remodel_kit) {
    gameSetting.remodel_kit = v;
  }
}

const updateShipItemCount = (): void => {
  let v: number;
  v = svdata.shipCountWithDrop;
  if (v && v !== gameSetting.ship_count) {
    gameSetting.ship_count = v;
  }
  v = svdata.slotitemCountWithDrop;
  if (v && v !== gameSetting.slotitem_count) {
    gameSetting.slotitem_count = v;
  }
};


const updateMaxCount = (): void => {
  let v: number;
  const basic = svdata.basic;
  v = basic.api_max_chara;
  if (v && v !== gameSetting.max_ship_count) {
    gameSetting.max_ship_count = v;
  }
  v = basic.api_max_slotitem;
  if (v && v !== gameSetting.max_slotitem_count) {
    gameSetting.max_slotitem_count = v;
  }
};

const mapPushCell = (): void => {
  const api_map = svdata.lastMap;
  if (api_map) {
    const map = MapStuff.cellInfo(gameSetting.maparea_id, gameSetting.mapinfo_no);
    const spot = MapStuff.findSpotForLabel(map.spots, api_map.api_no);
    gameSetting.mapcell_labels.push(spot?.label ?? '?');
    gameSetting.disp_seiku = null;
    gameSetting.formations = null;
  }
};

const mapStart = (): void => {
  const mapinfo = svdata.mstBattleMapInfo;
  if (mapinfo) {
    gameSetting.inMap = true;
    gameSetting.maparea_id = mapinfo.api_maparea_id;
    gameSetting.mapinfo_no = mapinfo.api_no;
    gameSetting.mapname = mapinfo.api_name;
  }
  gameSetting.mapcell_labels = [];
  mapPushCell();
};

const mapEnd = (): void => {
  gameSetting.inMap = false;
  gameSetting.disp_seiku = null;
  gameSetting.formations = null;
};

const battleStart = (arg: ApiBattleStartType): void => {
  gameSetting.formations = [ arg.api_formation[0], arg.api_formation[1], arg.api_formation[2] ];
  if (KcsUtil.isBattleNormal(arg)) {
    gameSetting.disp_seiku = (arg as ApiBattleNormal).api_kouku.api_stage1.api_disp_seiku;
  } else {
    gameSetting.disp_seiku = null;
  }
};

/**
 * 
 */
const calcAssistWindowSize = (): { width: number, height: number } => {
  if (gameSetting.isAssistInGame) {
    const width = Const.GameWidth + Const.AssistWidth;
    const height = Const.GameHeight + Const.GameBarHeight + Const.TitleBarHeight + Const.AssistHeight;
    return { width, height };  
  }

  const width = appState.game_only_width ? appState.game_only_width : Const.GameWidth;
  const height = appState.game_only_height ? appState.game_only_height : Const.GameHeight+Const.GameBarHeight+Const.TitleBarHeight;
  return { width, height };
};

/**
 * 
 */
const calcGameOnlySize = (): {width: number, height: number } => {
  const width = Const.GameWidth;
  const height = Const.GameHeight+Const.GameBarHeight+Const.TitleBarHeight;
  return { width, height };
};

/**
 * 
 */
export class KcApp {
  private main_window: BrowserWindow;
  private assist_window: BrowserWindow | null = null;
  private assist_webcontents: { id: number, webcontents: WebContents}[] = [];
  private frame_ratio: number;
  private kcrecord: KcRecord | null = null;
  private cbBasicFirst: number;
  private nohandle_resize: boolean = false;


  public get mainWindow(): BrowserWindow {
    return this.main_window;
  }

  public get assistWindow(): BrowserWindow | null {
    return this.assist_window;
  }

  constructor() {

    console.log('__dirname:', __dirname);
    
    // check assist stuff
    gameSetting.assist_ok = screen.getAllDisplays().some(el => el.bounds.height >= 960 && el.bounds.width >= 1800 )
    //screen.getAllDisplays().forEach(el => console.log(el));

    // Create the browser window.
    const withAssistSize = calcAssistWindowSize();
    const gameOnlySize = calcGameOnlySize();

    const x = 20;
    const y = 40;
    this.frame_ratio = AppStuff.calcFrameRatio(gameOnlySize.width, gameOnlySize.height);
    const minWidth = 600;
    const minHeight = AppStuff.calcFrameHeight(this.frame_ratio, minWidth);
    gameSetting.zoom_factor = AppStuff.calcGameZoomFactor(gameOnlySize.width);

    // set useragent
    setUseragent();

    // create main frame
    this.main_window = new BrowserWindow({
      useContentSize: true,
      width: withAssistSize.width,
      height: withAssistSize.height,
      x: x,
      y: y,
      minWidth: minWidth,
      minHeight: minHeight,
      fullscreenable: false,
      maximizable: false,
      titleBarStyle: 'hidden',
      resizable: ! gameSetting.isAssistInGame,
      frame: false,
      backgroundColor: '#000',
      webPreferences: {
        nodeIntegration: true,
        nodeIntegrationInSubFrames: true,
        webviewTag: true,
        spellcheck: false, 
      }
    });

    const main_webcontents = this.main_window.webContents;
    this.addAssistWebContents(main_webcontents.id, main_webcontents);

    if (AppStuff.isProduction) {
      this.main_window.webContents.openDevTools();
    }
    appState.main_window_handle = nativeWindowHandle(this.main_window);
    console.log('id, window_handle, w, h, ratio, minW, minH, minR', 
      this.main_window.id, appState.main_window_handle, withAssistSize, this.frame_ratio, minWidth, minHeight, AppStuff.calcFrameRatio(minWidth, minHeight));

    gameSettingProxy.webContents = this.main_window.webContents;
    this.main_window.setAlwaysOnTop(gameSetting.topmost);
    ipcMain.handle(MainChannel.main_ready, async () => this.onChannelMainReady());
    ipcMain.handle(MainChannel.assist_ready, async (event, arg) => this.onChannelAssistReady(arg));
    ipcMain.handle(MainChannel.assist_destroyed, async (event, arg) => this.onChannelAssistDestroyed(arg));
    ipcMain.handle(MainChannel.show_assist, () => this.onChannelShowAssist(true));
    ipcMain.handle(MainChannel.hide_assist, () => this.onChannelShowAssist(false));
    ipcMain.handle(MainChannel.new_window, async (event, arg) => this.onChannelNewWindow(arg));
    ipcMain.handle(MainChannel.minimize, async () => this.onChannelMinimize());
    ipcMain.handle(MainChannel.close, async () => this.onChannelClose());
    ipcMain.handle(MainChannel.devtool, async() => this.onChannelDevTool());
    ipcMain.handle(MainChannel.reload, async (event, arg) => this.onChannelReload(arg));
    ipcMain.handle(MainChannel.openAssist, async() => this.onChannelOpenAssist());
    ipcMain.handle(MainChannel.topmost, async() => this.onChannelTopmost());
    ipcMain.handle(MainChannel.open_capture_folder, async()  => this.onChannelOpenCaptureFolder());
    ipcMain.handle(MainChannel.save_capture, async(event, date, buffer)  => this.onChannelSaveCapture(date, buffer));
    ipcMain.handle(MainChannel.refresh_assist, async() => this.onChannelRefreshAssist());
    ipcMain.handle(MainChannel.save_rec, async(event, date, buffer) => this.onChannelSaveRec(date, buffer));
    ipcMain.handle(MainChannel.get_sv_data, async() => this.onChannelGetSvData());
    ipcMain.handle(MainChannel.ship_csv, async(event, csv) => this.onChannelShipCsv(csv));
    ipcMain.handle(MainChannel.get_airbase_spots, async(event, area_id, area_no) => this.onChannelGetAirbaseSpots(area_id, area_no));
    ipcMain.handle(MainChannel.set_airbase_spots, async(event, arg) => this.onChannelSetAirbaseSpots(arg));
    ipcMain.handle(MainChannel.open_url_by_external, async(event, url) => this.onChannelOpenUrlByExternal(url));
    powerMonitor.on('resume', () => this.onPowerResume());
    ApiCallback.set([Api.PORT_PORT, () => this.onApiPort()]);
    this.cbBasicFirst = ApiCallback.set([Api.GET_MEMBER_REQUIRE_INFO, () => this.onRequireInfo()]);  
    ApiCallback.set(['material-updated', () => this.onMaterialUpdated()]);
    ApiCallback.set(['ship-count-updated', () => this.onShipCountUpdated()]);
    ApiCallback.set(['slotitem-count-updated', () => this.onSlotitemCountUpdated()]);
    ApiCallback.set(['basic-updated', () => this.onBasicUpdated()]);
    ApiCallback.set([Api.REQ_MAP_START, () => this.onApiMapStart()]);
    ApiCallback.set([Api.REQ_MAP_NEXT, () => this.onApiMapNext()]);
    ApiCallback.set(['battle-start', (arg: ApiBattleStartType) => this.onApiBattleStart(arg)]);
  
    const dev_url = process.env.WEBPACK_DEV_SERVER_URL as string;
    console.log('WEBPACK_DEV_SERVER_URL:', dev_url);
    console.log('mainWindow.getPosition()', this.main_window.getPosition(), this.main_window.getSize());

    if (! dev_url) {
      createProtocol('app');
    }

    //if (! gameSetting.assist_in_game) {
      this.openAssistWindow();
    //}

    // test data
    /*
    const setData = (api: Api, filename: string): void => {
      const filepath = path.join(__dirname, '..', 'data', filename);
      svdata.update(api, fs.readFileSync(filepath, 'utf8'));
    }

    if (AppStuff.isProduction) {
      setData(Api.START2_GET_DATA, 'api_getData.json');
      setData(Api.GET_MEMBER_REQUIRE_INFO, 'api_require_info.json');
      setData(Api.PORT_PORT, 'api_port.json');
    }
    */

    // start proxy
    KcProxyStart(
      (api, data) => this.onApiReq(api, data), 
      (api, data) => this.onApiRes(api, data)
    );

    const mainframe = 'main.html';

    if (dev_url) {

      // Load the url of the dev server if in development mode
      //win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string)
      //if (!process.env.IS_TEST) mainWindow.webContents.openDevTools()

      this.mainWindow.loadURL(dev_url + mainframe);

      //KcApp.main_window.webContents.openDevTools();

    } else {
      //createProtocol('app');
      // Load the index.html when not in development
      //win.loadURL('app://./index.html')
      //createProtocol('app');
      this.mainWindow.loadURL(`app://./${mainframe}`);
    }

    this.mainWindow.on('closed', () => this.onClose());
    this.mainWindow.on('resize', () => this.onResize());
    this.mainWindow.on('will-resize', (event, newBounds) => this.onWillResize(event, newBounds));
  }

  /**
   * 
   */
  private openAssistWindow(): void {
    if (this.assist_window) {
      // noop
      return ;
    }

    //
    const dev_url = process.env.WEBPACK_DEV_SERVER_URL as string;
    const pos = this.main_window.getPosition();
    const size = this.main_window.getSize();
    this.assist_window = new BrowserWindow(
      {
        title: '甲ブラウザ(仮)',
        parent: this.main_window,
        useContentSize: true,
        width: Const.AssistWidth,
        height: size[1]-Const.TitleBarHeight,
        x: pos[0]+size[0] - 100,
        y: pos[1],
        titleBarStyle: 'hidden',
        webPreferences: {
          nodeIntegration: true,
          nodeIntegrationInSubFrames: true,
          spellcheck: false, 
        }
      }
    );
    this.assist_window.setMenu(null);

    console.log('assist window id', this.assist_window.id);
    const assist_webcontents = this.assist_window.webContents;
    const id = assist_webcontents.id;
    this.addAssistWebContents(id, assist_webcontents);
    this.assist_window.addListener('closed', () => {
      this.removeAssistWebContents(id);
      this.assist_window = null;
    });
    if (dev_url) {
      this.assist_window.loadURL(dev_url + 'main.html#assist');
    } else {
      this.assist_window.loadURL(`app://./main.html#assist`);
    }

    if (AppStuff.isProduction) {
      this.assist_window.webContents.openDevTools();
    }
  }

  private closeAssistWindow(): void {
    if (this.assist_window) {
      this.assist_window.close();
    }
  }

  private addAssistWebContents(id: number, webcontents: WebContents): void {
    this.assist_webcontents.push({id, webcontents});
  }

  private removeAssistWebContents(id: number): void {
    const index = this.assist_webcontents.findIndex((el => el.id === id));
    console.log(MainChannel.assist_destroyed, id, 'webcontent destroyed index:', index);
    if (index !== -1) {
      this.assist_webcontents.splice(index, 1);
    }
  }

  /**
   * 
   */
  private onApiReq(api: Api, data: string): void {
    console.log('>> proxy req callback ', Date.now());
    this.assist_webcontents.forEach(el => el.webcontents.send(AssistChannel.api_req, {api: api, data: data}));
    console.log('<< proxy req callback ', Date.now());
  }

  /**
   * 
   */
  private onApiRes(api: Api, data: string): void {
    console.log('>> proxy res callback ', Date.now());
    this.assist_webcontents.forEach(el => el.webcontents.send(AssistChannel.api_res, {api: api, data: data}));
    console.log('<< proxy res callback ', Date.now());
  }

  /**
   * 
   */
  private onChannelMainReady() {
    console.log(MainChannel.main_ready);
    this.mainWindow.webContents.send(GameChannel.set_app_state, appState);
    this.mainWindow.webContents.send(GameChannel.set_game_setting, gameSettingProxy.value);
  }

  /**
   * 
   */
  private onChannelAssistReady(id: number): void {
    //console.log(MainChannel.assist_ready, id, 'finded webcontent:', gameSetting.assist_in_game);
    //webContents.getAllWebContents().forEach(el => console.log('webcontent id:', el.id));
    const webcontents = webContents.fromId(id);
    console.log(MainChannel.assist_ready, id, 'finded webcontent:', !!webcontents, gameSetting.isAssistInGame);
    //console.log(webContents);
    if (webcontents) {
      this.addAssistWebContents(id, webcontents);
      /*
      const dev_url = process.env.WEBPACK_DEV_SERVER_URL as string;
      if (dev_url) {
        webcontents.loadURL(`${dev_url}main.html?inMain=${gameSetting.isAssistInGame}`);
      } else {
        webcontents.loadURL(`${dev_url}main.html?inMain=${gameSetting.isAssistInGame}`);
      } 
      //webcontents.loadURL(`${dev_url}main.html?inMain=${gameSetting.isAssistInGame}`);
      */
    }
  }

  /**
   * 
   */
  private onChannelAssistDestroyed(id: number): void {
    this.removeAssistWebContents(id);
  }

  /**
   * 
   */
  private onChannelShowAssist(show: boolean): void {
    console.log('show assist show:', show);

    if (gameSetting.isAssistInGame === show) {
      return ;
    }

    if (! gameSetting.assistInGame) {
      const size = this.mainWindow.getContentSize();
      appState.game_only_width = size[0];
      appState.game_only_height = size[1];
      gameSetting.zoom_factor = 1;
    }

    gameSetting.setAssistInGame(show);
    this.mainWindow.setResizable(!gameSetting.isAssistInGame);

    const size = calcAssistWindowSize();
    this.nohandle_resize = true;
    this.mainWindow.setSize(size.width, size.height, false);
    if (! gameSetting.isAssistInGame) {
      gameSetting.zoom_factor = AppStuff.calcGameZoomFactor(size.width);
    }
    this.nohandle_resize = false;
  }

  /**
   * 
   * @param arg 
   */
  private onChannelNewWindow(arg: string): boolean {
    console.log('main process new-window', arg);
    const child = new BrowserWindow({
      width: 1100,
      height: 800,
    });
    child.webContents.on('will-prevent-unload', (event) => {
      event.preventDefault();
    });
    child.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures, referrer) => {
      this.handleNewWindow(event, url, frameName, disposition, options, additionalFeatures, referrer);
    });
    child.loadURL(arg);
    return true;
  }

  /**
   * 
   * @param event 
   * @param url 
   * @param frameName 
   * @param disposition 
   * @param options 
   * @param additionalFeatures 
   * @param referrer 
   */
  private handleNewWindow(
    event: NewWindowEvent,
    url: string,
    frameName: string,
    disposition: string,
    options: BrowserWindowConstructorOptions,
    additionalFeatures: string[],
    referrer: Referrer): void {

    event.preventDefault();
    const child = new BrowserWindow(options);
    event.newGuest = child;
    child.webContents.on('will-prevent-unload', (event) => {
      event.preventDefault();
    });
    child.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures, referrer) => {
      this.handleNewWindow(event, url, frameName, disposition, options, additionalFeatures, referrer);
    });
    child.loadURL(url, referrer ? { httpReferrer: referrer } : undefined);
  }

  /**
   * 
   */
  private onChannelMinimize(): void {
    console.log(MainChannel.minimize);
    this.mainWindow.minimize();
  }

  /**
   * 
   */
  private onChannelClose(): void {
    console.log(MainChannel.close);
    // no effect
    //mainWindow.close();
    this.mainWindow.destroy();
  }

  /**
   * 
   */
  private onChannelDevTool() {
    console.log(MainChannel.devtool);
    const webContents = this.mainWindow.webContents;
    if (webContents) {
      if (webContents.isDevToolsOpened()) {
        webContents.closeDevTools();
      } else {
        webContents.openDevTools();
      }
    }
  }

  /**
   * 
   */
  private onChannelReload(ignoreCache: boolean) {
    console.log(MainChannel.reload, 'ignoreCache:', ignoreCache);
    const webContents = this.mainWindow.webContents;
    if (webContents) {
      if (ignoreCache) {
        webContents.reloadIgnoringCache();
      } else {
        webContents.reload();
      }
    }
  }

  /**
   * 
   */
  private onChannelTopmost() {
    console.log(MainChannel.topmost);
    this.main_window.setAlwaysOnTop(!gameSetting.topmost);
    gameSetting.topmost = !gameSetting.topmost;
  }

  /**
   * 
   */
  private onChannelOpenAssist() {
    console.log(MainChannel.openAssist, 'assist_window:', this.assist_window !== null);
    if (this.assist_window) {
      this.assist_window.show();
      this.assist_window.focus();
    } else {
      this.openAssistWindow();
    }
  }

  /**
   * 
   */
  private onChannelOpenCaptureFolder() {
    console.log(MainChannel.open_capture_folder);
    shell.openPath(PathStuff.capturePathExe(true));
  }

  /**
   * 
   * @param date 
   * @param buffer 
   */
  private onChannelSaveCapture(date: Date, buffer: Buffer) {
    const capture_dir = PathStuff.capturePathExe(true);
    const filename = `${moment(date).format('YYYYMMDD-HHmmss')}.png`;
    console.log(MainChannel.save_capture, 'date:', date, filename, capture_dir);
    fs.writeFile(path.join(capture_dir, filename), buffer, {}, (err) => {
      console.log('save writed to file', filename, err);
    });
  }

  /**
   * 
   * @param date 
   * @param buffer 
   */
  private onChannelSaveRec(date: Date, buffer: Buffer) {
    const capture_dir = PathStuff.capturePathExe(true);
    const filename = `${moment(date).format('YYYYMMDD-HHmmss')}.webm`;
    console.log(MainChannel.save_rec, 'date:', date, filename, capture_dir);
    fs.writeFile(path.join(capture_dir, filename), buffer, {}, (err) => {
      console.log('save writed to file', filename, err);
    });
  }

  /**
   * 
   */ 
  private onChannelGetSvData(): IpcSvData {
    const quests = this.kcrecord?.quests ?? [];
    //console.log('send to quests(sv data):', quests);
    return {
      json_sv_data: svdata.toJson(),
      quests,
    };
  }

  /**
   * 
   */
  private onChannelShipCsv(csv: string): void {
    const filename = `${moment(new Date()).format('YYYYMMDD-HHmmss')}.csv`;
    console.log(MainChannel.ship_csv);
    dialog.showSaveDialog({ defaultPath: filename }).then((dialog_return) => {
      if (! dialog_return.canceled && dialog_return.filePath) {
        const buf = iconv.encode(csv, 'Shift_JIS' );
        fs.open(dialog_return.filePath, 'w', (err, fd) => {
          if (err) {
            dialog.showErrorBox('保存に失敗しました', dialog_return.filePath ?? 'パスがありません');
          } else {
            fs.write(fd, buf, 0, buf.length, (err, written, buffer) => {
              fs.close(fd, (err) => {
                if (err) {
                  console.log('save csv err', err);
                }
              });
              console.log('save writed to file', dialog_return.filePath, err);
              if (err) {
                dialog.showErrorBox('書き込みに失敗しました', dialog_return.filePath ?? 'パスがありません');
              }
            });
          }
        });
      }
    });
  }

  /**
   * 
   */
  private onChannelGetAirbaseSpots(area_id: number, area_no: number): [[string, string],[string, string], [string, string]] {
    return airbaseSpotStore.getSpots(area_id, area_no);
  }

  /**
   * 
   */
  private onChannelSetAirbaseSpots(arg: AirbaseSpot): void {
    airbaseSpotStore.setSpots(arg.area_id, arg.area_no, arg.spots);
  }

  /**
   * 
   */
  private onChannelOpenUrlByExternal(url: string): void {
    shell.openExternal(url);
  }

  /**
   * 
   */
  private async onChannelTimeline(): Promise<[QuestContext, BattleRecord[]]> {
    console.log(MainChannel.timeline);
    const questTask = () => {
      return new Promise<QuestContext>((resolve) => {
        const questlist = svdata.questlist;
        resolve({ quest_max: svdata.parallelQuestCount,  quests: questlist ? KcsUtil.questlistInProgress(questlist) : null });
      });
    };
    return Promise.all([questTask(), this.kcrecord!.findLastBattle()]);
  }

  /**
   * 
   */
  private onChannelRefreshAssist() {
    console.log(MainChannel.refresh_assist);
    //this.assist_webcontents.forEach(el => el.webcontents.reload());
    if (this.assist_window) {
      this.assist_window.webContents.reload();
    }
  }

  /**
   * 
   */
  private onPowerResume(): void {
    console.log('power resume');
    this.mainWindow.webContents.send(GameChannel.resume);
  }

  /**
   * 
   */
  private onApiPort(): void {
    updateMedals();
    updateMaterial();
    updateShipItemCount();
    mapEnd();
  }

  /**
   * 
   */
  private onApiMapStart(): void {
    mapStart();
  }

  /**
   * 
   */
  private onApiMapNext(): void {
    mapPushCell();
  }

  /**
   * 
   */
  private onApiBattleStart(arg: ApiBattleStartType): void {
    battleStart(arg);
  }

  /**
   * 
   */
  private onMaterialUpdated(): void {
    updateMaterial();
  }

  /**
   * 
   */
  private onShipCountUpdated(): void {
    updateShipItemCount();
  }

  /**
   * 
   */
  private onSlotitemCountUpdated(): void {
    updateShipItemCount();
  }

  /**
   * 
   */
  private onRequireInfo(): void {
    
    if (this.cbBasicFirst) {
      ApiCallback.unset(this.cbBasicFirst);
      this.cbBasicFirst = 0;
    }

    // create store dir
    PathStuff.createStoreDir();

    // load kc record
    if (! this.kcrecord) {
      this.kcrecord = KcRecord.init(() => this.questUpdated());
      if (this.kcrecord) {
        ipcMain.handle(MainChannel.timeline, async() => this.onChannelTimeline());
      } 
    }

    //
    updateMaxCount();
  }

  private questUpdated(): void {
    //console.log('send to quests:', this.kcrecord!.quests);
    this.assist_webcontents.forEach(el => el.webcontents.send(AssistChannel.quest_data, this.kcrecord!.quests));
  }


  /**
   * 
   */
  private onBasicUpdated(): void {
    updateMaxCount();
  }

  /**
   * 
   */
  private onClose(): void {
    console.log('main window closed data ok:', svdata.isShipDataOk);
    if (svdata.isShipDataOk) {
      this.kcrecord?.portRecord();
    }
  }

  /**
   * 
   */
  private onResize(): void {
    if (this.nohandle_resize) {
      console.log('mainWindow handle esize');
      return ;
    }

    //console.log('mainWindow. resize>> ', this.mainWindow.getPosition(), this.mainWindow.getSize(), this.mainWindow.getContentSize(), gameSetting.assistInGame, gameSetting.isAssistInGame);
    const size = this.main_window.getContentSize();
    if (size) {
      const width = size[0];
      const height = AppStuff.calcFrameHeight(this.frame_ratio, width);
      //console.log('>>>>>size', size[1], height, 'width', size[0]);
      process.nextTick(() => {
        //console.log('tick', size[1], height, this.main_window.getSize());
        if (size[1] !== height) {
          this.main_window.setContentSize(width, height);
        }
        gameSetting.zoom_factor = AppStuff.calcGameZoomFactor(width);
        //mainWindow.webContents.send(GameChannel.set_zoom_factor, gameSetting.zoom_factor);
      });
      //console.log('<<<<<size');
    }
  }

  /**
   * 
   * @param event 
   * @param newBounds 
   */
  private onWillResize(event: Event, newBounds: Rectangle): void {
    const size = this.main_window.getContentSize();
    if (size) {
      console.log('mainWindow. will resize', newBounds.width, newBounds.height, 'now(w,h):', size[0], size[1]);
      if (size[0] == newBounds.width) {
        event.preventDefault();
      }
    }
  }
}
