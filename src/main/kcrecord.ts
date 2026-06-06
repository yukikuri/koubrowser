import {
  ApiCallback,
  ApiCreateItemWithParam,
  ApiCreateShipWithParam,
  ApiRemodelSlotWithParam,
  ApiMapNext,
  ApiMap,
  ApiMissionResult,
  ApiClearItemGetWithParam,
  PrvBattleInfo,
  KcsUtil,
  ApiMapStartReqRes,
  SvData,
  ApiDeckPortId,
  ApiItemId,
  ApiItemGetBase,
  ApiGetItem,
  ApiItemGetUseMst,
  ApiItemGetItemId,
  ApiQuestListWithParam,
  ApiQuestListParamTabId,
  BattleType,
  PrvBattleMapInfo,
  ApiEventId,
  ApiEventKind,
} from '@common/kcs'
import {
  BattleRecord,
  Quest,
  PortRecord,
  DropRecord,
  PortRecordQuery,
  MissionRecord,
  MissionRecordQuery,
  GetItemInfo,
  toShipsInfo,
  ItemRecord,
  ShipRecord,
  ShipInfoRecord,
  RemodelRecord,
  ApiItemIdsAdd,
  Query,
  DbName,
  QueryReturn,
  BattleRecordQuery,
  toRecordMapIdFromApi,
  currentRecordDate,
  DropRecordQuery,
  ClearItemGetRecordQuery,
  ClearItemGetRecord,
  QuestRecordQuery,
  AreaItemGetInfo,
  toRecordMapId,
  BattleRecordQueryFind,
} from '@common/record'
import { Api } from '@common/kcsapi'
import { QuestUpdater } from '@main/kcquest'
import { svdata } from '@main/svdata'
import { getWorkerDriver,  getWorkerDriverQuest } from '@main/stuff/wrokers'
import { app } from 'electron'
import { nowString } from '@common/debug'
import { isAlwaysDropCellNo } from '@common/map'
import { Intaker } from './stuff/intaker'
import { Env } from '@common/env'
type QuestUpdated = () => void

/**
 *
 */
export class KcRecord {
  private port_api_id = 0
  private port_called = false
  private db_loaded = false
  private quest_updaters: QuestUpdater[] = []
  private questlist_called: boolean = false
  private cbQuestUpdated: QuestUpdated
  private tmp_quests: Quest[] = []

  private port_report_last_uuid = ''

  public constructor(user_dir: string, cbQuestUpdated: QuestUpdated, cbQuestLoaded: ()=> void) {

    // load db except quest db
    const dbs = Object.entries(DbName).filter(([_, value]) => value !== DbName.quest).map(([_, value]) => value)
    getWorkerDriver().dbInit(user_dir, dbs).then(() => {
      console.log('dbs initialized:', dbs)
      this.db_loaded = true

      // port record if not recorded
      if (this.port_called) {
        this.portReport()
      }
    })
    
    // load db quest
    // set compactDatafile interval 10min
    getWorkerDriverQuest().dbInit(user_dir, [DbName.quest]).then(() => {
      console.log('quest db initialized')
      getWorkerDriverQuest().dbOperation({ dbName: DbName.quest, autocompactionInterval: 10*60*1000 })
      this.loadQuest(cbQuestLoaded)
    })

    this.cbQuestUpdated = cbQuestUpdated
    this.regCallback();
  }

  public doDispose() {
    if (svdata.isShipDataOk) {
      this.portRecord()
    }
  }

  private regCallback(): void {
    this.port_api_id = ApiCallback.set([Api.PORT_PORT, () => this.portPort()])
    ApiCallback.set([Api.PORT_PORT, () => this.portBattle()])
    ApiCallback.set([
      Api.REQ_SORTIE_BATTLERESULT,
      (arg: PrvBattleInfo) => this.sortieBattleResult(arg)
    ])
    ApiCallback.set([
      Api.REQ_COMBINED_BATTLE_BATTLERESULT,
      (arg: PrvBattleInfo) => this.combinedBattleResult(arg)
    ])
    ApiCallback.set([
      Api.REQ_KOUSYOU_CREATEITEM,
      (arg: ApiCreateItemWithParam) => this.createItem(arg)
    ])
    ApiCallback.set([
      Api.REQ_KOUSYOU_CREATESHIP,
      (arg: ApiCreateShipWithParam) => this.createShip(arg)
    ])
    ApiCallback.set([
      Api.REQ_KOUSYOU_REMODEL_SLOT,
      (arg: ApiRemodelSlotWithParam) => this.remodelSlot(arg)
    ])
    ApiCallback.set([Api.REQ_MAP_START, (arg: ApiMapStartReqRes) => this.mapStart(arg)])
    ApiCallback.set([Api.REQ_MAP_NEXT, (arg: ApiMapNext) => this.mapNext(arg)])
    ApiCallback.set([Api.REQ_MISSION_RESULT, (arg: ApiMissionResult) => this.missionResult(arg)])
    ApiCallback.set([Api.GET_MEMBER_QUESTLIST, (arg: ApiQuestListWithParam) => this.onApiQuestList(arg)])
    ApiCallback.set([
      Api.REQ_QUEST_CLEARITEMGET,
      (arg: ApiClearItemGetWithParam) => this.onApiClearItemGet(arg)
    ])
  }

  private loadQuest(cbQuestLoaded: ()=> void): void {
    QuestUpdater.load((records: Quest[]): void => {
      if (svdata.questlist) {
        console.log('quest list already getted, skip load quest records')
        return ;
      }

      const questUpdated = (updater: QuestUpdater): void => {
        this.questUpdated(updater)
      }

      records.forEach((record) => {
        const updater = QuestUpdater.create(record.quest, questUpdated, record)
        if (updater) {
          // check validate
          if (record.dateKey === updater.dateKey()) {
            this.quest_updaters.push(updater)
          }
        } else {
          if (QuestUpdater.isValidNotSupportQuest(record)) {
            this.tmp_quests.push(record)
          }
        }
      });
      cbQuestLoaded();
    })
  }

  private portPort(): void {
    console.log('portPort called')

    if (this.port_api_id) {
      ApiCallback.unset(this.port_api_id)
      this.port_api_id = 0
    }

    this.port_called = true

    // first record port
    if (this.db_loaded) {
      this.portReport();
    } else {
      // retry after db loaded
    }

    // 60*5s record port
    this.portReportSet()
  }

  private portReportSet(): void {
    const reportMinutes = 30
    const now = new Date()
    const msecnext =
      (reportMinutes - (now.getMinutes() % reportMinutes)) * 60000 -
      now.getSeconds() * 1000 -
      now.getMilliseconds()
    setTimeout(() => {
      this.portReport()
      this.portReportSet()
    }, msecnext)
  }

  private portReport(): void {
    if (Env.isTestMode) {
      console.log('test mode: skip port record')
      return ;
    }

    console.log('port record to. now:', nowString())
    const record = RecordUtil.toPortRecord(svdata)
    if (record) {
      console.log('port record >>', nowString())
      const doc = { dbName: DbName.port, record };
      getWorkerDriver().dbInsert(doc) .then((res) => {
        console.log('port record inserted', nowString()) 
      }).catch((e) => {
        console.error('port record insert error', nowString(), e)
      })
      console.log('port record <<', nowString())
    }
  }

  private portBattle(): void {
    const info = svdata.prvBattleMapInfo
    if (! info) {
      return ;
    }

    if (this.port_report_last_uuid === info.uuid) {
      console.log('portBattle: already port reported uuid=', info.uuid)
      return ;
    }
    this.port_report_last_uuid = info.uuid

    if (Env.isTestMode) {
      console.log('test mode: skip port battel record')
      return ;
    }

    const record = RecordUtil.toBattlePortRecord(svdata, info)
    if (record) {
        getWorkerDriver().dbInsert({ dbName: DbName.battle, record });
        console.log('portBattle: port reported uuid=', info.uuid)
    }
  }

  /**
   *
   */
  public portRecord(): void {
    this.portReport()
  }

  private mapStart(arg: ApiMapStartReqRes): void {

    if (Env.isTestMode) {
      console.log('test mode: skip map start record')
      return ;
    }

    // nobattle
    if (KcsUtil.isNobattleCell(arg.res)) {
      const record = RecordUtil.toNoBattleRecord(svdata, arg.res)
      if (record) {
        getWorkerDriver().dbInsert({ dbName: DbName.battle, record });
      }
    }
  }

  private mapNext(arg: ApiMapNext): void {

    if (Env.isTestMode) {
      console.log('test mode: skip map next record')
      return ;
    }

    // nobattle
    if (KcsUtil.isNobattleCell(arg)) {
      const record = RecordUtil.toNoBattleRecord(svdata, arg)
      if (record) {
        getWorkerDriver().dbInsert({ dbName: DbName.battle, record });
      }
    }
  }

  private battleResult(arg: PrvBattleInfo): void {
    const drop = RecordUtil.toDropRecord(svdata, arg)
    if (drop) {
      if (Env.isTestMode) {
        console.log('test mode: skip battle record. intaker only.')
        Intaker.addDropData(drop);
        return ;
      }

      getWorkerDriver().dbInsert({ dbName: DbName.drop, record: drop })
      const battle = RecordUtil.toBattleRecord(svdata, arg, drop)
      if (battle) {
        getWorkerDriver().dbInsert({ dbName: DbName.battle, record: battle });
      }

      Intaker.addDropData(drop);
    }
  }

  private sortieBattleResult(arg: PrvBattleInfo): void {
    this.battleResult(arg)
  }

  private combinedBattleResult(arg: PrvBattleInfo): void {
    this.battleResult(arg)
  }

  private createItem(arg: ApiCreateItemWithParam): void {
    if (Env.isTestMode) {
      console.log('test mode: skip item record')
      return ;
    }

    const record = RecordUtil.toItemRecord(svdata, arg)
    if (record) {
      getWorkerDriver().dbInsert({ dbName: DbName.item, record });
    }
  }

  private createShip(arg: ApiCreateShipWithParam): void {
    if (Env.isTestMode) {
      console.log('test mode: skip ship record')
      return ;
    }

    const record = RecordUtil.toShipRecord(svdata, arg)
    if (record) {
      getWorkerDriver().dbInsert({ dbName: DbName.ship, record });
    }
  }

  private remodelSlot(arg: ApiRemodelSlotWithParam): void {
    if (Env.isTestMode) {
      console.log('test mode: skip remodel record')
      return ;
    }

    const record = RecordUtil.toRemodelRecord(svdata, arg)
    if (record) {
      getWorkerDriver().dbInsert({ dbName: DbName.remodel, record})
    }
  }

  private missionResult(arg: ApiMissionResult): void {
    if (Env.isTestMode) {
      console.log('test mode: skip mission record')
      return ;
    }

    const record = RecordUtil.toMissionRecord(svdata, arg)
    if (record) {
      getWorkerDriver().dbInsert({ dbName: DbName.mission, record });
    }
  }

  private questUpdated(updater: QuestUpdater): void {
    console.log('updated quest updater', JSON.stringify(updater.record))
    this.cbQuestUpdated()
  }

  public get quests(): Quest[] {
    if (!svdata.questlist) {
      console.log('quest list not getted')
      //console.log(this.quest_updaters.map(el => el.record));
      //console.log(' -- ');
      //console.log(this.tmp_quests);
      const ret: Quest[] = this.tmp_quests.slice()
      this.quest_updaters.forEach((el) => ret.push(el.record!))
      ret.sort((a, b) => a.no - b.no)
      return ret
    }

    const quests = KcsUtil.questlistInProgress(svdata.questlist)
    return quests.map((quest) => {
      // find updater
      const updater = this.quest_updaters.find((updater) => updater.record?.no === quest.api_no)
      if (updater) {
        console.log('updater finded:', quest.api_no)
        return {
          no: quest.api_no,
          dateKey: updater.record?.dateKey ?? '',
          date: updater.record?.date ?? '',
          quest,
          state: updater.record?.state ?? null
        }
      }

      console.log('updater not finded:', quest.api_no)
      return {
        no: quest.api_no,
        dateKey: '',
        date: '',
        quest,
        state: null
      }
    })
  }

  private onApiQuestList(arg: ApiQuestListWithParam): void {
    console.log('kcrecord: ApiQuestList called. api_tab_id:', arg.api_tab_id)

    // get in progress quest
    // check api tab id if not all
    const progress_quests = 
      arg.api_tab_id === ApiQuestListParamTabId.all ? 
      KcsUtil.questlistInProgress(arg) : KcsUtil.questlistInProgress(svdata.questlist!)
    
    // remove not selected
    this.quest_updaters = this.quest_updaters.filter((el) => {
      if (!progress_quests.find((quest) => quest.api_no === el.quest.api_no)) {
        el.unsetCallback()
        return false
      }
      return true
    })

    this.questlist_called = true

    const questUpdated = (updater: QuestUpdater): void => {
      this.questUpdated(updater)
    }

    progress_quests.forEach((quest) => {
      const updater = QuestUpdater.create(quest, questUpdated)
      if (updater) {
        const index = this.quest_updaters.findIndex((el) => el.quest.api_no === quest.api_no)
        if (index === -1 || this.quest_updaters[index].dateKey() !== updater.dateKey()) {
          if (index !== -1) {
            this.quest_updaters[index].unsetCallback()
            this.quest_updaters[index] = updater
          } else {
            this.quest_updaters.push(updater)
          }

          updater.insert()
        } else {
          const loaded_updater = this.quest_updaters[index]
          loaded_updater.apiData = true
          loaded_updater.quest = quest
          loaded_updater.fixState(quest, loaded_updater.record!.state)
          loaded_updater.update(false)
        }
      } else {
        QuestUpdater.insertNotSupportQuest(quest)
      }
    })

    // save in progress quest
    QuestUpdater.updateNos(
      progress_quests.map((quest) => quest.api_no)
    )

    this.cbQuestUpdated()
  }

  private onApiClearItemGet(arg: ApiClearItemGetWithParam): void {

    if (Env.isTestMode) {
      console.log('test mode: skip clearitemget record')
      return ;
    }

    // insert clearitemget record
    getWorkerDriver().dbInsert({ 
      dbName: DbName.clearitemget, 
      record: RecordUtil.toClearItemGetRecord(arg)
    })

    if (this.questlist_called) {
      // remove quest record
      QuestUpdater.removeQuest(arg.api_quest_id)
    }
  }

  /**
   * 
   * @param query 
   * @returns 
   */
  public async query(query: Query): Promise<QueryReturn> {
    console.log('query', query)
    switch (query.dbName) {
      case DbName.port:
        return this.queryPortRecord(query)
      case DbName.mission:
        return this.queryMissionRecord(query)
      case DbName.battle:
        return this.queryBattleRecord(query)
      case DbName.quest:
        return this.queryQuestRecord(query)
      case DbName.drop:
        return this.queryDropRecord(query)
      case DbName.clearitemget:
        return this.queryClearItemGetRecord(query)
      default:
        throw new Error('unknown db name: ', query)
    }
  }

  /**
   * 
   * @param query 
   * @returns 
   */
  private async queryPortRecord(query: PortRecordQuery): Promise<PortRecord[]> {
    console.log('queryPortRecord', query)
    return getWorkerDriver().dbQuery<PortRecord>(query);
  }

  /**
   * 
   * @param query 
   * @returns 
   */
  private async queryMissionRecord(query: MissionRecordQuery): Promise<MissionRecord[]> {
    console.log('queryMissionRecord', query)
    return getWorkerDriver().dbQuery<MissionRecord>(query)
  }

  /**
   * 
   * @param query 
   * @returns 
   */
  async queryBattleRecord(query: BattleRecordQuery | BattleRecordQueryFind): Promise<BattleRecord[]> {
    console.log('queryBattleRecord', query)
    return getWorkerDriver().dbQuery<BattleRecord>(query);
  }

  /**
   * 
   * @param query 
   * @returns 
   */
  private async queryQuestRecord(query: QuestRecordQuery): Promise<Quest[]> {
    console.log('queryQuestRecord', query)
    return getWorkerDriverQuest().dbQuery<Quest>(query);
  }

  /**
   * 
   * @param query 
   * @returns 
   */
  private async queryDropRecord(query: DropRecordQuery): Promise<DropRecord[]> {
    console.log('queryDropRecord', query)
    return getWorkerDriver().dbQuery<DropRecord>(query);
  }

  /**
   * 
   * @param query 
   * @returns 
   */
  private async queryClearItemGetRecord(query: ClearItemGetRecordQuery): Promise<ClearItemGetRecord[]> {
    console.log('queryClearItemGetRecord', query)
    return getWorkerDriver().dbQuery<ClearItemGetRecord>(query);
  }
}

let _orign = ''
function getOrign(): string {
  if (_orign.length === 0) {
    _orign = 'koubrowser/' + app.getVersion()
  }
  return _orign
}

function toGetItem(
  item: ApiGetItem | undefined,
  flags: ApiItemId[],
  index: number
): GetItemInfo | undefined {
  if (!item) {
    return
  }

  if (-1 === item.api_useitem_id) {
    if (index < flags.length) {
      return { id: flags[index], count: item.api_useitem_count }
    }
    return
  }
  return { id: item.api_useitem_id, count: item.api_useitem_count }
}

export class RecordUtil {
  public static toPortRecord(svdata: SvData): PortRecord | undefined {
    const basic = svdata.basic
    if (!basic) {
      return
    }

    const ret: PortRecord = {
      date: currentRecordDate(false)
    }

    ret[ApiItemId.fual] = svdata.fual
    ret[ApiItemId.ammo] = svdata.ammo
    ret[ApiItemId.steel] = svdata.steel
    ret[ApiItemId.buxite] = svdata.buxite
    ret[ApiItemId.fast_repair] = svdata.fastRepair
    ret[ApiItemId.fast_build] = svdata.fastBuild
    ret[ApiItemId.build_kit] = svdata.buildKit
    ret[ApiItemId.remodel_kit] = svdata.remodelKit
    ret[ApiItemId.kagu_coin] = basic?.api_fcoin ?? -1
    ret[ApiItemId.emergency_repair] = svdata.slotitemCount(42)
    ret[ApiItemId.emergency_repair_god] = svdata.slotitemCount(43)
    ret[ApiItemId.rice_ball] = svdata.slotitemCount(145)
    ret[ApiItemId.special_rice_ball] = svdata.slotitemCount(241)
    ret[ApiItemId.offshore_supply] = svdata.slotitemCount(146)

    ret[ApiItemId.teitoku_lv] = basic.api_level
    ret[ApiItemId.teitoku_exp] = basic.api_experience
    ret[ApiItemId.rank] = basic.api_rank
    ret[ApiItemId.ship_count] = svdata.ships.length
    ret[ApiItemId.slotitem_count] = svdata.slotitems.length
    ret[ApiItemId.win_count] = basic?.api_st_win ?? -1
    ret[ApiItemId.lose_count] = basic?.api_st_lose ?? -1
    ret[ApiItemId.mission_count] = basic?.api_ms_count ?? -1
    ret[ApiItemId.mission_success] = basic?.api_ms_success ?? -1
    ret[ApiItemId.practice_count] = basic?.api_pt_win ?? -1
    ret[ApiItemId.practice_lose] = basic?.api_pt_lose ?? -1

    const useitems = svdata.useitems
    useitems.forEach((useitem) => {
      if (ApiItemIdsAdd.includes(useitem.api_id)) {
        ret[useitem.api_id] = useitem.api_count
      }
    })
    //ret[ApiItemId.ship_exp] = svdata.ships.reduce((acc, el) => acc+el.api_exp[0], 0);
    return ret
  }

  public static toDropRecord(svdata: SvData, info: PrvBattleInfo): DropRecord | undefined {
    const result = info.result
    if (!result) {
      return
    }

    const mapId = toRecordMapIdFromApi(info.map);
    let ship_id = result.api_get_ship?.api_ship_id ?? -1
    if (ship_id < 0 && isAlwaysDropCellNo(mapId, info.cell_no)) {
      // 母港フル
      ship_id = -2
    }
    let enemyShips2 = undefined
    if (KcsUtil.isEnemyCombined(info.midday)) {
      enemyShips2 = (info.midday as any).api_ship_ke_combined ?? 
        ((info.midnight as any).api_ship_ke_combined ?? [])
    }

    const mst_ship = svdata.mstShip(ship_id)
    const enemyFormation = 
       info.midday ? info.midday.api_formation[1] :
       (info.midnight ? info.midnight.api_formation[1] : 0)
    return {
      mapId,
      cellId: info.cell_no,
      isBoss: info.isBoss,
      enemyFormation,
      mapLv: info.mapLv,
      shipId: ship_id,
      shipName: mst_ship?.api_name ?? '',
      shipCounts: ship_id === -1 ? [] : svdata.shipCounts(ship_id),
      rank: result.api_win_rank,
      questName: result.api_quest_name,
      enemyDeckName: result.api_enemy_info.api_deck_name,
      exp: result.api_get_exp,
      baseExp: result.api_get_base_exp,
      teitokuLv: result.api_member_lv,
      firstClear: result.api_first_clear !== 0,
      enemyShips1: info.midday?.api_ship_ke ?? (info.midnight?.api_ship_ke ?? []),
      enemyShips2: enemyShips2,
      origin: getOrign(),
      itemId: result.api_get_useitem?.api_useitem_id ?? -1,
      itemCount: result.api_get_useitem?.api_useitem_count ?? 0,
      date: currentRecordDate(false)
    }
  }

  static toBattleRecord(
    svdata: SvData,
    arg: PrvBattleInfo,
    drop: DropRecord
  ): BattleRecord | undefined {
    const deck = svdata.battleDeck
    const basic = svdata.basic
    if (!deck || !basic) {
      return
    }

    const ships1 = toShipsInfo(svdata, deck.api_ship)
    if (!ships1) {
      return
    }

    let ships2: ShipInfoRecord[] | undefined = undefined
    if (svdata.isCombined) {
      const deck2st = svdata.deckPort(ApiDeckPortId.deck2st)
      if (!deck2st) {
        return
      }
      ships2 = toShipsInfo(svdata, deck2st.api_ship)
    }

    /*
    const enemyShips1 = arg.midday?.api_ship_ke ?? [];
    const enemyParams1 = enemyParam(arg);
    let enemyShips2 = undefined;
    const enemyParams2 = undefined;
    if (KcsUtil.isCombinedBattle(arg.midday)) {
      enemyShips2 = (arg.midday as ApiCombinedBattle).api_ship_ke_combined;
    }
    */
    const airsearchResult = arg.map.api_airsearch?.api_result ?? -1
    const fromCellId = arg.map['api_from_no']
    return {
      uuid: arg.uuid,
      index: svdata.battleMap.length-1,
      mapId: toRecordMapIdFromApi(arg.map),
      cellId: arg.cell_no,
      fromCellId,
      isBoss: arg.isBoss,
      type: arg.battleType,
      eventId: arg.eventId,
      eventKind: arg.eventKind,
      mapLv: arg.mapLv,
      airsearchResult,
      ships1: ships1,
      ships2: ships2,
      rank: arg.result?.api_win_rank ?? '',
      questName: arg.result?.api_quest_name ?? '',
      enemyDeckName: arg.result?.api_enemy_info.api_deck_name ?? '',
      exp: arg.result?.api_get_exp ?? -1,
      baseExp: arg.result?.api_get_base_exp ?? -1,
      teitokuLv: basic.api_level,
      firstClear: arg.result?.api_first_clear !== 0,
      formations: arg.midday?.api_formation ?? (arg.midnight?.api_formation ?? []),
      seiku: arg.midday?.api_kouku.api_stage1.api_disp_seiku ?? -1,
      middayJson: arg.middayJson ?? null,
      midnightJson: arg.midnightJson ?? null,
      drop: drop,
      items: null,
      origin: getOrign(),
      date: drop.date
    }
  }

  static toNoBattleRecord(
    svdata: SvData,
    map: ApiMap | ApiMapNext
  ): BattleRecord | undefined {
    const deck = svdata.battleDeck
    const basic = svdata.basic
    const info = svdata.prvBattleMapInfo
    if (!deck || !basic || !map || !info) {
      return
    }

    const ships1 = toShipsInfo(svdata, deck.api_ship)
    if (!ships1) {
      return
    }

    let ships2: ShipInfoRecord[] | undefined = undefined
    if (svdata.isCombined) {
      const deck2st = svdata.deckPort(ApiDeckPortId.deck2st)
      if (!deck2st) {
        return
      }
      ships2 = toShipsInfo(svdata, deck2st.api_ship)
    }

    const airsearchResult = map.api_airsearch?.api_result ?? -1
    const fromCellId = map['api_from_no']
    const items = this.toAreaItemGetInfos(map)
    return {
      uuid: info.uuid,
      index: svdata.battleMap.length-1,
      mapId: toRecordMapIdFromApi(map),
      cellId: map.api_no,
      fromCellId,
      isBoss: false,
      type: BattleType.nobattle,
      eventId: map.api_event_id,
      eventKind: map.api_event_kind,
      mapLv: info.mapLv,
      airsearchResult,
      ships1: ships1,
      ships2: ships2,
      rank: '',
      questName: '',
      enemyDeckName: '',
      exp: -1,
      baseExp: -1,
      teitokuLv: basic.api_level,
      firstClear: false,
      formations: [],
      seiku: -1,
      middayJson: null,
      midnightJson: null,
      drop: null,
      items: items ? items : null,
      happeningJson: map.api_happening ? JSON.stringify(map.api_happening) : null,
      origin: getOrign(),
      date: currentRecordDate(false)
    }
  }

  static toBattlePortRecord(
    svdata: SvData,
    info: PrvBattleMapInfo,
  ): BattleRecord | undefined {
    const deck = svdata.battleDeck
    const basic = svdata.basic
    if (!deck || !basic) {
      return
    }

    const ships1 = toShipsInfo(svdata, deck.api_ship)
    if (!ships1) {
      return
    }

    let ships2: ShipInfoRecord[] | undefined = undefined
    if (svdata.isCombined) {
      const deck2st = svdata.deckPort(ApiDeckPortId.deck2st)
      if (!deck2st) {
        return
      }
      ships2 = toShipsInfo(svdata, deck2st.api_ship)
    }

    return {
      uuid: info.uuid,
      index: svdata.battleMap.length,
      mapId: toRecordMapId(info.maparea_id, info.mapinfo_no),
      cellId: -1,
      isBoss: false,
      portReturn: true,
      type: BattleType.nobattle,
      eventId: ApiEventId.noevent,
      eventKind: ApiEventKind.nobattle,
      mapLv: info.mapLv,
      airsearchResult: -1,
      ships1: ships1,
      ships2: ships2,
      rank: '',
      questName: '',
      enemyDeckName: '',
      exp: -1,
      baseExp: -1,
      teitokuLv: basic.api_level,
      firstClear: false,
      formations: [],
      seiku: -1,
      middayJson: null,
      midnightJson: null,
      drop: null,
      items: null,
      origin: getOrign(),
      date: currentRecordDate(false)
    }
  }

  static toAreaItemGetInfos(arg: ApiMap | ApiMapNext): AreaItemGetInfo[] | undefined {
    const itemget = arg.api_itemget
    if (!itemget || !itemget.length) {
      if (!arg.api_itemget_eo_comment) {
        return
      }
    }

    const eoResultExist = (arg as any)['api_itemget_eo_result'] !== undefined
    if (eoResultExist || arg.api_itemget_eo_comment) {
      const ret: AreaItemGetInfo[] = []

      if (eoResultExist) {
        const mapNext = arg as ApiMapNext
        const item = mapNext.api_itemget_eo_result!
        const itemId = KcsUtil.toItemGetId(item)
        if (itemId.valid) {
          ret.push(
            {
              itemId: itemId.id!,
              itemCount: item.api_getcount,
              eoRate: mapNext.api_get_eo_rate,
            })
        }
      }

      if (arg.api_itemget_eo_comment) {
        const item = arg.api_itemget_eo_comment
        const itemId = KcsUtil.toItemGetId(item)
        if (itemId.valid) {
          ret.push(
            {
              itemId: itemId.id!,
              itemCount: item.api_getcount,
            })
        }
      }
      return ret
    }

    if (itemget && itemget.length) {
      return itemget.map((item) => {
        return {
          itemId: KcsUtil.toItemGetId(item).id!,
          itemCount: item.api_getcount,
        }
      })
    }

    return
  }

  static toItemRecord(
    svdata: SvData,
    arg: ApiCreateItemWithParam
  ): ItemRecord[] | undefined {
    const ship = svdata.deckSecretary(ApiDeckPortId.deck1st)
    const basic = svdata.basic
    if (!ship || !basic.api_level) {
      return
    }
    return arg.api_get_items.map((item) => {
      return {
        items: arg.items,
        secretary: ship.api_ship_id,
        itemId: item?.api_slotitem_id ?? -1,
        teitokuLv: basic.api_level,
        successful: item.api_id !== -1,
        origin: getOrign(),
        date: currentRecordDate(false)
      }
    })
  }

  static toShipRecord(svdata: SvData, arg: ApiCreateShipWithParam): ShipRecord | undefined {
    const ship = svdata.deckSecretary(ApiDeckPortId.deck1st)
    const basic = svdata.basic
    if (!ship || !basic.api_level) {
      return
    }
    return {
      kdockId: arg.api_kdock_id,
      secretary: ship.api_ship_id,
      shipId: arg.api_ship_id,
      highspeed: arg.api_highspeed,
      teitokuLv: basic.api_level,
      largeFlag: 1 === arg.api_large_flag,
      origin: getOrign(),
      items: arg.api_items,
      date: currentRecordDate(false)
    }
  }

  static toRemodelRecord(
    svdata: SvData,
    arg: ApiRemodelSlotWithParam
  ): RemodelRecord | undefined {
    const deck = svdata.deckPort(ApiDeckPortId.deck1st)
    const ship0 = svdata.ship(deck?.api_ship[0] ?? -1)
    const ship1 = svdata.ship(deck?.api_ship[1] ?? -1)
    const basic = svdata.basic
    if (!deck || !ship0 || !ship1 || !basic.api_level) {
      return
    }

    if (!arg.api_remodel_id[0]) {
      return
    }

    return {
      successful: arg.api_remodel_flag !== 0,
      itemId: arg.api_remodel_id[0],
      itemLevel: arg.api_level,
      flagshipId: ship0.api_ship_id,
      flagshipLevel: ship0.api_lv,
      flagshipCond: ship0.api_cond,
      consortId: ship1.api_ship_id,
      consortLevel: ship1.api_lv,
      consortCond: ship1.api_cond,
      teitokuLv: basic.api_level,
      certain: arg.api_certain_flag !== 0,
      origin: getOrign(),
      date: currentRecordDate(false)
    }
  }

  static toMissionRecord(svdata: SvData, arg: ApiMissionResult): MissionRecord | undefined {
    const ships = toShipsInfo(svdata, arg.api_ship_id)
    if (!ships) {
      return
    }

    return {
      clearResult: arg.api_clear_result,
      mapareaName: arg.api_maparea_name,
      questName: arg.api_quest_name,
      getMaterial: arg.api_get_material,
      ships: ships,
      getItem1: toGetItem(arg.api_get_item1, arg.api_useitem_flag, 0),
      getItem2: toGetItem(arg.api_get_item2, arg.api_useitem_flag, 1),
      origin: getOrign(),
      date: currentRecordDate(false)
    }
  }

  static toClearItemGetRecord(arg: ApiClearItemGetWithParam): ClearItemGetRecord {
    const questName = svdata.questlist?.api_list.find(
      (el) => el.api_no === arg.api_quest_id)?.api_title ?? ''
    return {
      questNo: arg.api_quest_id,
      questName,
      material: arg.api_material,
      bonuses: arg.api_bounus,
      origin: getOrign(),
      date: currentRecordDate(false)
    }
  }
}
