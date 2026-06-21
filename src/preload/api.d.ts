import type { TimelineResult, AirbaseTargetSpots, AirbaseSpot } from '@common/channel'
import type { UpdateCheckResult, UpdateStateSnapshot } from '@common/type'
import type { Query, QueryReturn, PortChartData } from '@common/record'
import type { MstMapinfo, ApiMap } from '@common/kcs'
import type { Spot, CellInfo } from '@common/map'
import type { AppSetting, InheritScoreList } from '@common/store'
import type { AggregatedCellRank, AggregatedCellShipDrop } from '@common/calc_record'
import type { GlobalSetting } from '@common/global_setting'

export interface Api {
  rendererReady(): void
  showAssist(): void
  hideAssist(): void
  minimize(): void
  close(): void
  devtool(): void
  reload(): void
  openCaptureFolder(): void
  saveCapture(date: Date, buffer: Buffer): void
  openAssist(): void
  topmost(): void
  notifyMuteState(muted: boolean): void
  refreshAssist(): void
  storeRec(buffer: Buffer, isEnd: boolean): void
  requestRequiredData(): void
  shipCsv(lines: string): void
  timeline(): Promise<TimelineResult>
  getAirbaseSpots(area_id: number, area_no: number): Promise<AirbaseTargetSpots>
  setAirbaseSpots(spot: AirbaseSpot): void
  openExternalUrl(url: string): void
  getVersion(): Promise<string>
  queryDb(query: Query): Promise<QueryReturn>
  clearSessionCache(): Promise<void>
  findSpotForLabel(mapnifo: MstMapinfo, map: ApiMap, cb: (spot: Spot | null) => void): void
  cellInfoAsync(area_id: number, area_no: number): Promise<CellInfo>
  calcPortChartData(): Promise<PortChartData>
  saveAppSetting(setting: AppSetting): void
  saveGlobalSetting(setting: GlobalSetting): void
  aggregateCellRank(area_id: number, area_no: number): Promise<AggregatedCellRank[]>
  aggregateShipDrop(ship_id: number): Promise<AggregatedCellShipDrop[]>
  getInheritScoreList(): Promise<InheritScoreList>
  saveInheritScoreList(list: InheritScoreList): void
  getUpdateState(): Promise<UpdateStateSnapshot>
  checkForUpdates(setting?: GlobalSetting): Promise<UpdateCheckResult>
  downloadUpdate(): Promise<void>
  restartAndInstallUpdate(): Promise<void>
  onUpdateStateChanged(cb: (state: UpdateStateSnapshot) => void): () => void
  onUpdateDownloadProgress(cb: (percent: number) => void): () => void
  onStartupUpdateChecked(cb: (result: UpdateCheckResult) => void): () => void
}
