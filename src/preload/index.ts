import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { Api } from './api'
import { MainChannel, MainMessage, AirbaseSpot, AirbaseTargetSpots } from '@common/channel'
import type { MstMapinfo, ApiMap } from '@common/kcs'
import type { Spot } from '@common/map'
import type { TimelineResult } from '@common/channel'
import type { UpdateCheckResult, UpdateStateSnapshot } from '@common/type'
import type { Query, QueryReturn, PortChartData } from '@common/record'
import type { AggregatedCellRank, AggregatedCellShipDrop } from '@common/calc_record'
import type { AppSetting, InheritScoreList } from '@common/store'
import type { GlobalSetting } from '@common/global_setting'

// Custom APIs for renderer
const api: Api = {
  rendererReady(): void {
    ipcRenderer.invoke(MainChannel.renderer_ready)
  },

  showAssist(): void {
    ipcRenderer.invoke(MainChannel.show_assist)
  },

  hideAssist(): void {
    ipcRenderer.invoke(MainChannel.hide_assist)
  },

  minimize(): void {
    ipcRenderer.invoke(MainChannel.minimize)
  },

  close(): void {
    ipcRenderer.invoke(MainChannel.close)
  },

  devtool(): void {
    ipcRenderer.invoke(MainChannel.devtool)
  },

  reload(): void {
    ipcRenderer.invoke(MainChannel.reload)
  },

  openCaptureFolder(): void {
    ipcRenderer.invoke(MainChannel.open_capture_folder)
  },

  saveCapture(date: Date, buffer: Buffer) {
    ipcRenderer.invoke(MainChannel.save_capture, date, buffer)
  },

  openOption(): void {
    ipcRenderer.invoke(MainChannel.openOption)
  },

  openAssist(): void {
    ipcRenderer.invoke(MainChannel.openAssist)
  },

  topmost(): void {
    ipcRenderer.invoke(MainChannel.topmost)
  },

  notifyMuteState(muted: boolean): void {
    ipcRenderer.invoke(MainChannel.notify_mute_state, muted)
  },

  storeRec(buffer: Buffer, isEnd: boolean) {
    ipcRenderer.invoke(MainChannel.store_rec, buffer, isEnd)
  },

  requestRequiredData() {
    ipcRenderer.invoke(MainChannel.request_required_data)
  },

  refreshAssist(): void {
    ipcRenderer.invoke(MainChannel.refresh_assist)
  },

  shipCsv(lines: string): void {
    ipcRenderer.invoke(MainChannel.ship_csv, lines)
  },

  timeline(): Promise<TimelineResult> {
    return ipcRenderer.invoke(MainChannel.timeline)
  },

  getAirbaseSpots(area_id: number, area_no: number): Promise<AirbaseTargetSpots> {
    return ipcRenderer.invoke(MainChannel.get_airbase_spots, area_id, area_no)
  },

  setAirbaseSpots(spot: AirbaseSpot): void {
    ipcRenderer.invoke(MainChannel.set_airbase_spots, spot)
  },

  openExternalUrl(url: string): void {
    ipcRenderer.invoke(MainChannel.open_external_url, url)
  },

  queryDb(query: Query): Promise<QueryReturn> {
    return ipcRenderer.invoke(MainChannel.query_db, query)
  },

  getVersion(): Promise<string> {
    return ipcRenderer.invoke(MainChannel.get_version)
  },

  clearSessionCache(): Promise<void> {
    return ipcRenderer.invoke(MainChannel.clear_session_cache)
  },

  findSpotForLabel(mapnifo: MstMapinfo, map: ApiMap, cb: (spot: Spot | null) => void) {
    console.log('call findSpotForLabel', mapnifo, map)
    ipcRenderer
      .invoke(MainChannel.find_spot_for_label, mapnifo, map)
      .then((spot) => {
        cb(spot)
      })
      .catch((err) => {
        console.log('findSpotForLabel err', err)
        cb(null)
      })
  },

  cellInfoAsync(area_id: number, area_no: number) {
    return ipcRenderer.invoke(MainChannel.cell_info_async, area_id, area_no)
  },

  calcPortChartData(): Promise<PortChartData> {
    return ipcRenderer.invoke(MainChannel.calc_port_chart_data)
  },

  saveAppSetting(setting: AppSetting): void {
    ipcRenderer.invoke(MainChannel.save_app_setting, setting)
  },

  saveGlobalSetting(setting: GlobalSetting): void {
    ipcRenderer.invoke(MainChannel.save_global_setting, setting)
  },

  aggregateCellRank(area_id: number, area_no: number): Promise<AggregatedCellRank[]> {
    return ipcRenderer.invoke(MainChannel.aggregate_cell_rank, area_id, area_no)
  },

  aggregateShipDrop(ship_id: number): Promise<AggregatedCellShipDrop[]> {
    return ipcRenderer.invoke(MainChannel.aggregate_ship_drop, ship_id)
  },

  getInheritScoreList(): Promise<InheritScoreList> {
    return ipcRenderer.invoke(MainChannel.get_inherit_score_list)
  },
  
  saveInheritScoreList(list: InheritScoreList): void {
    ipcRenderer.invoke(MainChannel.save_inherit_score_list, list)
  },

  getUpdateState(): Promise<UpdateStateSnapshot> {
    return ipcRenderer.invoke(MainChannel.get_update_state)
  },

  checkForUpdates(setting?: GlobalSetting): Promise<UpdateCheckResult> {
    return ipcRenderer.invoke(MainChannel.check_for_updates, setting)
  },

  downloadUpdate(): Promise<void> {
    return ipcRenderer.invoke(MainChannel.download_update)
  },

  restartAndInstallUpdate(): Promise<void> {
    return ipcRenderer.invoke(MainChannel.restart_and_install_update)
  },

  onUpdateStateChanged(cb: (state: UpdateStateSnapshot) => void): () => void {
    const handler = (_event: Electron.IpcRendererEvent, state: UpdateStateSnapshot) => cb(state)
    ipcRenderer.on(MainMessage.update_state_changed, handler)
    return () => ipcRenderer.removeListener(MainMessage.update_state_changed, handler)
  },

  onUpdateDownloadProgress(cb: (percent: number) => void): () => void {
    const handler = (_event: Electron.IpcRendererEvent, percent: number) => cb(percent)
    ipcRenderer.on(MainMessage.update_download_progress, handler)
    return () => ipcRenderer.removeListener(MainMessage.update_download_progress, handler)
  },

  onStartupUpdateChecked(cb: (result: UpdateCheckResult) => void): () => void {
    const handler = (_event: Electron.IpcRendererEvent, result: UpdateCheckResult) => cb(result)
    ipcRenderer.on(MainMessage.startup_update_checked, handler)
    return () => ipcRenderer.removeListener(MainMessage.startup_update_checked, handler)
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
