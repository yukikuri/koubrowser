import {
  ApiCallback,
  ApiCreateItemWithParam,
  ApiMissionResult,
  PrvBattleInfo,
  KcsUtil,
  ApiQuest,
  ApiQuestState,
  ApiMissionClearResult,
  ApiDestroyShipWithParam,
  ApiDestroyItem2WithParam,
  ApiShipType,
  MstShipIdBeginEnemy,
  ApiEventId,
  ApiQuestType,
  ApiMapNext,
  MstShip,
  ApiQuestLabelTypeYearLy,
  PrvPracticeBattleInfo,
  ApiPowerUpWothParam,
  ApiMap,
  ApiMapStartReqRes,
  isShipCategory,
  isShipType,
  ApiSlotitem,
} from '@common/kcs'
import { Api } from '@common/kcsapi'
import { 
  Quest, 
  QuestState, 
  questCounter, 
  QuestCounter, 
  Update, 
  QuestRecordQuery, 
  currentRecordDate,
} from '@common/record'
import * as qs from '@common/kcquest'
import { svdata } from '@main/svdata'
import moment from 'moment'
import { getWorkerDriverQuest } from '@main/stuff/wrokers'
import { calcEnemyHps } from '@common/kcsbattle'
import { currentServerDate } from '@common/kcdate'
import { Env } from '@common/env'

function buildQuery(findParam): QuestRecordQuery {
  return {
    dbName: 'quest',
    find: findParam
  }
}

/**
 * 
 * @param query 
 * @param updateQuery 
 * @param options 
 * @param cb 
 * @returns 
 */
function doUpdate(
  query: any,
  updateQuery: any,
  options?: Nedb.UpdateOptions,
  cb?: (err: Error | null, numberOfUpdated: number, affectedDocuments: any, upsert: boolean) => void,
): void {
  if (Env.isTestMode) {
    console.log('test mode: skip quest update', JSON.stringify(query), JSON.stringify(updateQuery))
    return ;
  }

  const update: Update = { dbName: 'quest', query, updateQuery, options }
  getWorkerDriverQuest().dbUpdate(update).then((res) => {
    cb?.(null, res.num, res.affectedDocs, res.upsert)
  }).catch((e) => {
    cb?.(e, 0, null, false)
  })
}

type UpdatedCallback = (updater: QuestUpdater) => void
type QuestRecordLoaded = (records: Quest[]) => void

const questPer = (quest: ApiQuest): number => {
  return [0, 0.5, 0.8]?.[quest.api_progress_flag] ?? 0
}

const questPerValue = (quest: ApiQuest, max: number): number => {
  return Math.floor(max * questPer(quest))
}

const questDbMeta = {
  key: 'meta'
} as const

interface QuestDbMetaRecord {
  readonly key: string
  inProgress: number[]
}

interface UpdaterCtorParam {
  quest: ApiQuest
  updated: UpdatedCallback
}

const handleDBErr = <T>(err: Error | null, newDoc: T, msg: string = '') => {
  if (msg) {
    console.log(msg)
  }
  if (err) {
    console.log(err)
  }
  if (newDoc) {
    console.log(JSON.stringify(newDoc))
  }
}

const updateLog = (err: Error | null, numberOfUpdate: number, doc: any, upsert: boolean) => {
  if (err) {
    console.log('update quest err', err)
  } else {
    console.log('number of updated:', numberOfUpdate, 'upsert:', upsert)
    if (doc) {
      console.log('doc')
      console.log(JSON.stringify(doc))
    }
  }
}

/**
 *
 */
const win_ranks = ['S', 'A', 'B', 'C']
const toWinRankNum = (win_rank: string): number => {
  return win_ranks.indexOf(win_rank.toUpperCase())
}

const fullfillWinCond = (this_win_rank: string, need_win_rank: string): boolean => {
  // no cond
  if (!need_win_rank.length) {
    return true
  }

  const this_rank = toWinRankNum(this_win_rank)
  if (this_rank < 0) {
    return false
  }

  const need_rank = toWinRankNum(need_win_rank)
  return this_rank <= need_rank
}

function questDateKey(type: ApiQuestType, label_type: number): string {
  // single
  if (type === ApiQuestType.single) {
    return 'single'
  }

  // yearly
  const sdate = moment(currentServerDate())
  if (type === ApiQuestType.quarterly && label_type > ApiQuestLabelTypeYearLy) {
    const month = label_type - ApiQuestLabelTypeYearLy - 1 // moment month is 0 base.
    if (sdate.month() >= month) {
      sdate.year(sdate.year() + 1)
    }
    return 'yearly-' + sdate.format('YYYY') + `${month.toString().padStart(2, '0')}`
  }

  const date = sdate.subtract(5, 'hour')

  // daily
  if (type === ApiQuestType.daily) {
    return 'daily-' + date.format('YYYYMMDD')
  }

  // weekly
  if (type === ApiQuestType.weekly) {
    const week = date.subtract(1, 'day')
    return 'weekly-' + week.weekYear() + '-' + week.week()
  }

  // monthly
  if (type === ApiQuestType.monthly) {
    return 'monthly-' + date.format('YYYYMM')
  }

  // quarterly
  if (type === ApiQuestType.quarterly) {
    // 2022-3,2022-4,2022-5(2,3,4): 1
    // 2022-6,2022-7,2022-8(5,6,7): 2
    // 2022-9,2022-10,2022-11(8,9,10): 3
    // 2022-12,2023-1,2023-2(11,0,1): 4
    const month = date.month()
    let q = 4
    if (2 <= month && month <= 4) {
      q = 1
    } else if (5 <= month && month <= 7) {
      q = 2
    } else if (8 <= month && month <= 10) {
      q = 3
    } else {
      if (month === 11) {
        // do nothing
      } else {
        date.year(date.year() - 1)
      }
    }
    return 'quarterly-' + date.format('YYYY') + '-' + q
  }

  return ''
}

const yearlyQuesyKey = (): string =>
  questDateKey(ApiQuestType.quarterly, ApiQuestLabelTypeYearLy + 1)

const randomDateKey = (): string => 'notsupport-' + new Date().getTime().toString()

// export for test
export function generateDateKey(stuff: qs.QuestCommon, quest: ApiQuest): string {
  switch (stuff.key) {
    case qs.QuestKey.infer:
      return questDateKey(quest.api_type, quest.api_label_type)
    case qs.QuestKey.single:
      return questDateKey(ApiQuestType.single, quest.api_label_type)
    case qs.QuestKey.daily:
      return questDateKey(ApiQuestType.daily, quest.api_label_type)
    case qs.QuestKey.weekly:
      return questDateKey(ApiQuestType.weekly, quest.api_label_type)
    case qs.QuestKey.monthly:
      return questDateKey(ApiQuestType.monthly, quest.api_label_type)
    case qs.QuestKey.quarterly:
      return questDateKey(ApiQuestType.quarterly, quest.api_label_type)
    case qs.QuestKey.yearly:
      return yearlyQuesyKey()
  }
}

/**
 *
 */
export abstract class QuestUpdater {
  public apiData: boolean = false
  public abstract record: Quest | null
  public tmpRecord: QuestState | null = null
  public quest: ApiQuest
  protected updated: UpdatedCallback

  constructor(p: UpdaterCtorParam) {
    this.quest = p.quest
    this.updated = p.updated
  }

  public abstract dateKey(): string
  public abstract insert(): void
  public abstract update(doNotify: boolean): void
  public abstract newState(quest: ApiQuest): QuestState
  public abstract fixState(quest: ApiQuest, state: QuestState): boolean
  public abstract setCallback(): void
  public abstract unsetCallback(): void

  public static updateNos(nos: number[]): void {
    console.log('update in progress quests:', nos)
    const options = { upsert: true }
    doUpdate(
      questDbMeta,
      { ...questDbMeta, inProgress: nos },
      options,
      updateLog
    )
  }

  public static insertNotSupportQuest(quest: ApiQuest): void {
    console.log('insert not support quest. no:', quest.api_no)
    const options = { upsert: true }
    const record: Quest<null> = {
      no: quest.api_no,
      dateKey: randomDateKey(),
      date: '',
      quest,
      state: null
    }
    doUpdate({ no: quest.api_no }, record, options, updateLog)
  }

  public static removeQuest(quest_id: number): void {
    // remove condition
    const query = { no: quest_id }

    // remove record
    getWorkerDriverQuest().dbRemove({ dbName: 'quest', remove_param: query })
  }

  // todo: remove this
  public static isValidNotSupportQuest(record: Quest): boolean {
    const dateKey = randomDateKey()
    if (record.dateKey !== dateKey) {
      return false
    }
    return record.state === null
  }

  public static popNo(no: number): void {
    console.log('pop in progress quests:', no)
    const options = {}
    doUpdate(questDbMeta, { $pull: { inProgress: no } }, options, updateLog)
  }

  public static load(cb: QuestRecordLoaded): void {
    getWorkerDriverQuest().dbQueryOne<QuestDbMetaRecord>(buildQuery(questDbMeta)).then((doc) => {
      if (doc) {
        console.log('loaded quest db meta:', JSON.stringify(doc))
        const nos = doc.inProgress.map((no) => ({ no }))
        console.log(nos)
        getWorkerDriverQuest().dbQuery<Quest>(buildQuery({ $or: nos })).then((docs) => {
          cb(docs)
        }).catch((e) => {
          console.log('load quest db records err', e)
        })
      } else {
        console.log('no quest db meta record')
      }
    }).catch((e) => {
      console.log('load quest db meta err', e)
    })
  }

  /**
   * 
   * @param quest 
   * @param cb 
   * @param record 
   * @returns 
   */
  public static create(
    quest: ApiQuest,
    cb: UpdatedCallback,
    record: Quest | undefined = undefined
  ): QuestUpdater | undefined | null {
    return createQuestUpdater(quest, cb, record)
  }
}

/**
 *
 */
abstract class QuestUpdaterImplDB extends QuestUpdater {
  /**
   * insert quest progress
   */
  insert(): void {
    const no = this.quest.api_no
    getWorkerDriverQuest().dbQueryOne<Quest>(buildQuery({ no })).then((doc) => {

      const quest = this.quest
      const dateKey = this.dateKey()

      // check new quest
      const isNewQuest = doc && doc?.quest?.api_title !== quest.api_title

      console.log(isNewQuest, quest.api_no)

      // check valididate
      const invalidated = isNewQuest || !doc || doc.dateKey !== dateKey || doc.state === null
      let needUpdate = invalidated
      if (invalidated) {
        const state = this.newState(quest)
        this.fixState(quest, state)
        doc = {
          no,
          date: currentRecordDate(false),
          dateKey,
          quest,
          state
        }
      } else {
        if (doc && doc.state) {
          needUpdate = this.fixState(quest, doc.state)
        }
      }

      if (needUpdate) {
        const options = { upsert: true }
        doUpdate({ no }, doc, options, updateLog)
      }
      console.log('quest updater impl db set record', doc)
      console.log('quest updater impl db set record', doc.state)
      this.apiData = true
      this.record = doc
      this.updated(this)
      this.setCallback()
    }).catch((e) => {
      handleDBErr(e, 'quest updater impl db insert error. no:' + no)
    })
  }

  /**
   * update quest progress
   */
  update(doNotify: boolean = true): void {
    if (this.record) {
      const no = this.quest.api_no
      const options = {}
      doUpdate({ no }, this.record, options, updateLog)
      if (doNotify) {
        this.updated(this)
      }
    }
  }

  /**
   * remove quest progress
   */
  popNo(): void {
    QuestUpdater.popNo(this.quest.api_no)
  }
}

/**
 *
 */
abstract class QuestAnyCounter extends QuestUpdaterImplDB {
  private commonStuff: qs.QuestCommon
  record: Quest<QuestCounter> | null = null

  constructor(p: UpdaterCtorParam, commonStuff: qs.QuestCommon) {
    super(p)
    this.commonStuff = commonStuff
  }

  /**
   *
   */
  dateKey(): string {
    return generateDateKey(this.commonStuff, this.quest)
  }

  get state(): QuestCounter {
    return this.record!.state
  }

  newState(quest: ApiQuest): QuestCounter {
    const max = this.commonStuff.max
    if (max.length === 1) {
      return questCounter([questPerValue(quest, max[0])], max)
    }
    return questCounter(max.slice().fill(0), max)
  }

  fixState(quest: ApiQuest, state: QuestCounter): boolean {
    // option
    // not fix state
    if (this.commonStuff.notFixState) {
      return false
    }

    // fix state
    let ret = false
    const max = this.commonStuff.max
    if (state.countMax.length === max.length) {
      max.forEach((el, index) => {
        if (state.countMax[index] !== el) {
          state.countMax[index] = el
          ret = true
        }
      })
    } else {
      state.countMax = max.slice()
      state.count = max.slice()
      state.count.fill(0)
      ret = true
    }

    if (max.length === 1) {
      // percent < corrent count
      // or
      // not completed != corrent count completed
      const count = questPerValue(quest, max[0])
      if (
        state.count[0] < count ||
        (state.count[0] === state.countMax[0] && quest.api_state !== ApiQuestState.completed)
      ) {
        state.count[0] = count
        ret = true
      }
    }

    return ret
  }

  protected increment(inc: number = 1, index: number = 0) {
    if (inc === 0) {
      return
    }

    const state = this.state
    if (state.count[index] === state.countMax[index]) {
      return
    }

    state.count[index] += inc
    if (state.count[index] > state.countMax[index]) {
      state.count[index] = state.countMax[index]
    }

    if (!state.count.some((el, index) => el < state.countMax[index])) {
      this.unsetCallback()
      this.popNo()
    }
    this.update()
  }

  protected increments(incs: number[]) {
    let doUpdate = false

    const state = this.state

    incs.forEach((el, index) => {
      if (el > 0) {
        if (state.count[index] < state.countMax[index]) {
          state.count[index] += el
          doUpdate = true
          if (state.count[index] > state.countMax[index]) {
            state.count[index] = state.countMax[index]
          }
        }
      }
    })

    if (doUpdate) {
      if (!state.count.some((el, index) => el < state.countMax[index])) {
        this.unsetCallback()
        this.popNo()
      }
      this.update()
    }
  }
}

/**
 *
 */
abstract class QuestPracticeBase extends QuestAnyCounter {
  private cb: number = 0

  setCallback(): void {
    this.cb = ApiCallback.set([
      Api.REQ_PRACTICE_BATTLE_RESULT,
      (arg: PrvPracticeBattleInfo) => this.onPractice(arg)
    ])
  }

  unsetCallback(): void {
    if (this.cb) {
      ApiCallback.unset(this.cb)
      this.cb = 0
    }
  }

  abstract onPractice(result: PrvPracticeBattleInfo): void
}

/**
 *
 */
class QuestPractice extends QuestPracticeBase {
  private stuff: qs.QuestPractice

  constructor(p: UpdaterCtorParam, stuff: qs.QuestPractice) {
    super(p, stuff)
    this.stuff = stuff
  }

  onPractice(result: PrvPracticeBattleInfo): void {
    if (!fullfillWinCond(result.result.api_win_rank, this.stuff.need_win_rank)) {
      return
    }
    this.increment()
  }
}

/**
 *
 */
class QuestPracticeDeck extends QuestPracticeBase {
  private stuff: qs.QuestPracticeDeck

  constructor(p: UpdaterCtorParam, stuff: qs.QuestPracticeDeck) {
    super(p, stuff)
    this.stuff = stuff
  }

  onPractice(result: PrvPracticeBattleInfo): void {
    //console.log('quest practice deck', JSON.stringify(result))
    if (!fullfillWinCond(result.result.api_win_rank, this.stuff.need_win_rank)) {
      return
    }

    const deck = svdata.deckPort(result.deck_id)
    if (!deck) {
      return
    }
    if (!this.stuff.isDeckMatch(svdata, deck.api_ship)) {
      return
    }

    this.increment()
  }
}

/**
 *
 */
class QuestNyukyo extends QuestAnyCounter {
  private cb: number = 0

  setCallback(): void {
    this.cb = ApiCallback.set([Api.REQ_NYUKYO_START, () => this.onNyukyoStart()])
  }

  unsetCallback(): void {
    if (this.cb) {
      ApiCallback.unset(this.cb)
      this.cb = 0
    }
  }

  onNyukyoStart(): void {
    this.increment()
  }
}

/**
 *
 */
class QuestItem extends QuestAnyCounter {
  private stuff: qs.QuestCollectItem | qs.QuestCollectItemCondition
  private cb1: number = 0
  private cb2: number = 0

  constructor(p: UpdaterCtorParam, stuff: qs.QuestCollectItem | qs.QuestCollectItemCondition) {
    super(p, stuff)
    this.stuff = stuff
  }

  setCallback(): void {
    this.cb1 = ApiCallback.set([Api.GET_MEMBER_REQUIRE_INFO, () => this.onGetMemberRequireInfo()])
    this.cb2 = ApiCallback.set([Api.GET_MEMBER_USEITEM, () => this.onGetMemberRequireInfo()])

    // update
    this.onGetMemberRequireInfo()
  }

  unsetCallback(): void {
    if (this.cb1) {
      ApiCallback.unset(this.cb1)
      this.cb1 = 0
    }
    if (this.cb2) {
      ApiCallback.unset(this.cb2)
      this.cb2 = 0
    }
  }

  onGetMemberRequireInfo(): void {
    const api_item = svdata.useitems
    const item_count = api_item.find((el) => el.api_id === this.stuff.item_id)
    let inc = -this.state.count[0]
    if (item_count) {
      inc = item_count.api_count - this.state.count[0]
    }
    this.increment(inc)
  }
}

function matchMap(
  area_and_rank: (qs.QuestMap | qs.QuestMapCell)[],
  map: Pick<ApiMap, 'api_event_id' | 'api_no'>,
  win_rank?: string
): number {
  const map_start = svdata.mapStart
  if (!map_start) {
    return -1
  }

  const index = area_and_rank.findIndex((el) => {
    const map_match = el[0] === map_start.api_maparea_id && el[1] === map_start.api_mapinfo_no

    // check cell no
    if (map_match && Array.isArray(el[3])) {
      return el[3].includes(map.api_no)
    }

    return map_match
  })

  if (-1 === index) {
    return -1
  }

  const area_and_map = area_and_rank[index]
  if (fullfillWinCond(win_rank ?? '', area_and_map[2])) {
    return index
  }

  return -1
}

/**
 *
 */
abstract class QuestMapStartBase extends QuestAnyCounter {

  private cb_map_start: number = 0

  setCallback(): void {
    this.cb_map_start = ApiCallback.set([
      Api.REQ_MAP_START,
      (arg) => this.onMapStart(arg)
    ])
  }

  unsetCallback(): void {
    if (this.cb_map_start) {
      ApiCallback.unset(this.cb_map_start)
      this.cb_map_start = 0
    }
  }
  
  abstract onMapStart(arg: ApiMapStartReqRes): void;

  checkMapMatch(area_id: number, area_no: number, arg: ApiMapStartReqRes): boolean {
    if (! area_id && ! area_no) {
      return true
    }

    if (area_id === arg.res.api_maparea_id && ! area_no) {
      return true
    }
    if (area_id === arg.res.api_maparea_id && area_no === arg.res.api_mapinfo_no) {
      return true
    }
    return false
  }
}

/**
 * 
 */
class QuestMapStart extends QuestMapStartBase {
  private stuff: qs.QuestMapStart
  constructor(p: UpdaterCtorParam, stuff: qs.QuestMapStart) {
    super(p, stuff)
    this.stuff = stuff
  }

  onMapStart(arg: ApiMapStartReqRes): void {
    if (this.checkMapMatch(this.stuff.area_id, this.stuff.area_no, arg)) {
      this.increment()
      return
    }
  }
}

/**
 * 
 */
class QuestMapStartDeck extends QuestMapStartBase {
  private stuff: qs.QuestMapStartDeck
  constructor(p: UpdaterCtorParam, stuff: qs.QuestMapStartDeck) {
    super(p, stuff)
    this.stuff = stuff
  }

  onMapStart(arg: ApiMapStartReqRes): void {
  
    const deck = svdata.battleDeck
    if (!deck) {
      return
    }
    if (!this.stuff.isDeckMatch(svdata, deck.api_ship)) {
      return
    }

    if (this.checkMapMatch(this.stuff.area_id, this.stuff.area_no, arg)) {
      this.increment()
      return
    }
  }
}

/**
 *
 */
abstract class QuestBattleBase extends QuestAnyCounter {
  private cb_battle: number = 0
  private cb_combined_battle: number = 0

  setCallback(): void {
    this.cb_battle = ApiCallback.set([
      Api.REQ_SORTIE_BATTLERESULT,
      (arg: PrvBattleInfo) => this.onBattle(arg)
    ])
    this.cb_combined_battle = ApiCallback.set([
      Api.REQ_COMBINED_BATTLE_BATTLERESULT,
      (arg: PrvBattleInfo) => this.onBattle(arg)
    ])
  }

  unsetCallback(): void {
    if (this.cb_battle) {
      ApiCallback.unset(this.cb_battle)
      this.cb_battle = 0
    }
    if (this.cb_combined_battle) {
      ApiCallback.unset(this.cb_combined_battle)
      this.cb_combined_battle = 0
    }
  }

  abstract onBattle(result: PrvBattleInfo): void
}

/**
 *
 */
class QuestBattle extends QuestBattleBase {
  private stuff: qs.QuestBattle

  constructor(p: UpdaterCtorParam, stuff: qs.QuestBattle) {
    super(p, stuff)
    this.stuff = stuff
  }

  onBattle(result: PrvBattleInfo): void {
    if (this.stuff.need_win && !KcsUtil.isVictory(result.result?.api_win_rank)) {
      return
    }
    this.increment()
  }
}

const enemy_ship_type_ids: { [key: string]: number[] } = {}
const getEnemyShipTypeIds = (type: ApiShipType): number[] => {
  const key = type.toString()
  let ret = enemy_ship_type_ids[key]
  if (!ret) {
    const ships = svdata.mstShips.filter(
      (el) => el.api_id >= MstShipIdBeginEnemy && el.api_stype === type
    )
    ret = ships.map((el) => el.api_id)
    enemy_ship_type_ids[key] = ret
    console.log('enemy ship types:', type, 'ids:', enemy_ship_type_ids[key])
  }
  return ret
}

/**
 *
 */
class QuestBattleEnemy extends QuestBattleBase {
  private stuff: qs.QuestBattleEnemy

  constructor(p: UpdaterCtorParam, stuff: qs.QuestBattleEnemy) {
    super(p, stuff)
    this.stuff = stuff
  }

  onBattle(result: PrvBattleInfo): void {
    const enemies = calcEnemyHps(result)
    const check_ids = enemies.filter((el) => el.hp <= 0).map((el) => el.id)
    if (check_ids.length) {
      const type = this.stuff.type
      const check_enemy_ids = type.reduce<number[]>(
        (acc, el) => (acc = acc.concat(getEnemyShipTypeIds(el))),
        []
      )
      const inc = check_ids.reduce((acc, el) => {
        if (check_enemy_ids.includes(el)) {
          ++acc
        }
        return acc
      }, 0)
      console.log('quest battle enemy type:', type, 'destroies ids:', check_ids, 'inc:', inc)
      this.increment(inc)
    }
  }
}

/**
 *
 */
class QuestBattle214 extends QuestBattleBase {
  private cb_map_start: number = 0
  private cb_map_next: number = 0

  readonly idx_start = 0
  readonly idx_s = 1
  readonly idx_boss = 2
  readonly idx_boss_win = 3

  setCallback(): void {
    super.setCallback()
    const state = this.state
    if (state.count[this.idx_start] < state.countMax[this.idx_start]) {
      this.cb_map_start = ApiCallback.set([Api.REQ_MAP_START, () => this.onMapStart()])
    }
    if (state.count[this.idx_boss] < state.countMax[this.idx_boss]) {
      this.cb_map_next = ApiCallback.set([
        Api.REQ_MAP_NEXT,
        (map: ApiMapNext) => this.onMapNext(map)
      ])
    }
  }

  unsetCallback(): void {
    super.unsetCallback()
    if (this.cb_map_start) {
      ApiCallback.unset(this.cb_map_start)
      this.cb_map_start = 0
    }
    if (this.cb_map_next) {
      ApiCallback.unset(this.cb_map_next)
      this.cb_map_next = 0
    }
  }

  onMapStart(): void {
    this.increment(1, this.idx_start)
  }

  onMapNext(map: ApiMapNext): void {
    if (map.api_event_id === ApiEventId.bossBattle) {
      this.increment(1, this.idx_boss)
    }
  }

  onBattle(result: PrvBattleInfo): void {
    if (result.result?.api_win_rank.toUpperCase() === 'S') {
      this.increment(1, this.idx_s)
    }

    if (
      result.map.api_event_id === ApiEventId.bossBattle &&
      KcsUtil.isVictory(result.result?.api_win_rank)
    ) {
      this.increment(1, this.idx_boss_win)
    }
  }
}

/**
 *
 */
class QuestBattleMap extends QuestBattleBase {
  private stuff: qs.QuestBattleMap

  constructor(p: UpdaterCtorParam, stuff: qs.QuestBattleMap) {
    super(p, stuff)
    this.stuff = stuff
  }

  onBattle(result: PrvBattleInfo): void {
    // boss battle?
    if (result.map.api_event_id !== ApiEventId.bossBattle) {
      return
    }

    const index = matchMap(this.stuff.maps, result.map, result.result?.api_win_rank)
    if (-1 === index) {
      return
    }
    this.increment(1, Math.min(this.stuff.max.length - 1, index))
  }
}

/**
 *
 */
class QuestBattleMapDeck extends QuestBattleBase {
  private stuff: qs.QuestBattleMapDeck
  private cb_map_next: number = 0

  constructor(p: UpdaterCtorParam, stuff: qs.QuestBattleMapDeck) {
    super(p, stuff)
    this.stuff = stuff
  }

  setCallback(): void {
    super.setCallback()
    // no battle: 1-6...
    if (this.stuff.maps.some((el) => el[2] == '')) {
      this.cb_map_next = ApiCallback.set([Api.REQ_MAP_NEXT, (map: ApiMapNext) => this.mapNext(map)])
    }
  }

  unsetCallback(): void {
    super.unsetCallback()
    if (this.cb_map_next) {
      ApiCallback.unset(this.cb_map_next)
      this.cb_map_next = 0
    }
  }

  onBattle(result: PrvBattleInfo): void {
    console.log('onBattle 1', result, this.quest.api_no)
    // boss battle?
    if (result.map.api_event_id !== ApiEventId.bossBattle) {
      return
    }

    const index = matchMap(this.stuff.maps, result.map, result.result?.api_win_rank)
    console.log('onBattle 2', index, this.quest.api_no)
    if (-1 === index) {
      return
    }

    console.log('onBattle 3', this.quest.api_no, result.result)
    const deck = svdata.battleDeck
    if (!deck) {
      console.log('onBattle 3 not deck', this.quest.api_no)
      return
    }
    if (!this.stuff.isDeckMatch(svdata, deck.api_ship)) {
      console.log('onBattle 3 is deck match ng', this.quest.api_no)
      return
    }

    console.log('onBattle 4', this.quest.api_no)
    this.increment(1, Math.min(this.stuff.max.length - 1, index))
  }

  mapNext(map: ApiMapNext): void {
    if (map.api_event_id !== ApiEventId.eoMaterialGet) {
      return
    }

    const index = matchMap(this.stuff.maps, map)
    if (-1 === index) {
      return
    }

    const deck = svdata.battleDeck
    if (!deck) {
      return
    }
    if (!this.stuff.isDeckMatch(svdata, deck.api_ship)) {
      return
    }

    this.increment(1, Math.min(this.stuff.max.length - 1, index))
  }
}

/**
 *
 */
class QuestMapGoal extends QuestAnyCounter {
  private stuff: qs.QuestMapGoal
  private cb_map_next: number = 0

  constructor(p: UpdaterCtorParam, stuff: qs.QuestMapGoal) {
    super(p, stuff)
    this.stuff = stuff
  }
  setCallback(): void {
    this.cb_map_next = ApiCallback.set([Api.REQ_MAP_NEXT, (map: ApiMapNext) => this.mapNext(map)])
  }

  unsetCallback(): void {
    if (this.cb_map_next) {
      ApiCallback.unset(this.cb_map_next)
      this.cb_map_next = 0
    }
  }

  mapNext(map: ApiMapNext): void {
    if (map.api_event_id !== ApiEventId.eoMaterialGet) {
      return
    }

    const index = matchMap(this.stuff.maps, map)
    if (-1 === index) {
      return
    }

    const deck = svdata.battleDeck
    if (!deck) {
      return
    }
    if (this.stuff.isDeckMatch(svdata, deck.api_ship) === false) {
      return
    }

    this.increment(1, Math.min(this.stuff.max.length - 1, index))
  }
}

/**
 *
 */
class QuestBattleGaugeClear extends QuestBattleBase {
  private stuff: qs.QuestGaugeClear

  constructor(p: UpdaterCtorParam, stuff: qs.QuestGaugeClear) {
    super(p, stuff)
    this.stuff = stuff
  }

  onBattle(result: PrvBattleInfo): void {
    // boss battle?
    if (result.map.api_event_id !== ApiEventId.bossBattle) {
      return
    }

    // check map
    const index = matchMap(this.stuff.maps, result.map, result.result?.api_win_rank)
    if (-1 === index) {
      return
    }

    // check gauge clear
    if (!result.result?.api_first_clear) {
      return
    }

    // check deck
    const deck = svdata.battleDeck
    if (!deck) {
      return
    }
    if (!this.stuff.isDeckMatch(svdata, deck.api_ship)) {
      return
    }

    // increment counter
    this.increment(1, Math.min(this.stuff.max.length - 1, index))
  }
}

/**
 *
 */
class QuestMissionStart extends QuestAnyCounter {
  private cb: number = 0

  setCallback(): void {
    this.cb = ApiCallback.set([
      Api.REQ_MISSION_START,
      () => this.onMissionStart()
    ])
  }

  unsetCallback(): void {
    if (this.cb) {
      ApiCallback.unset(this.cb)
      this.cb = 0
    }
  }

  onMissionStart(): void {
    this.increment()
  }
}

/**
 *
 */
abstract class QuestMissionBase extends QuestAnyCounter {
  private cb: number = 0

  setCallback(): void {
    this.cb = ApiCallback.set([
      Api.REQ_MISSION_RESULT,
      (arg: ApiMissionResult) => this.onMissionResult(arg)
    ])
  }

  unsetCallback(): void {
    if (this.cb) {
      ApiCallback.unset(this.cb)
      this.cb = 0
    }
  }

  abstract onMissionResult(result: ApiMissionResult): void
}

/**
 *
 */
class QuestMission extends QuestMissionBase {
  onMissionResult(result: ApiMissionResult): void {
    if (result.api_clear_result === ApiMissionClearResult.failed) {
      return
    }
    this.increment()
  }
}

/**
 *
 */
class QuestMissionSpecific extends QuestMissionBase {
  private stuff: qs.QuestMissionSpecific

  constructor(p: UpdaterCtorParam, stuff: qs.QuestMissionSpecific) {
    super(p, stuff)
    this.stuff = stuff
  }

  onMissionResult(result: ApiMissionResult): void {
    if (result.api_clear_result === ApiMissionClearResult.failed) {
      return
    }

    const index = this.stuff.names.findIndex((el) => el.includes(result.api_quest_name))
    if (-1 === index) {
      return
    }
    this.increment(1, index)
  }
}

/**
 *
 */
abstract class QuestKaisouBase extends QuestAnyCounter {
  private cb: number = 0

  setCallback(): void {
    this.cb = ApiCallback.set([
      Api.REQ_KAISOU_POWERUP,
      (arg: ApiPowerUpWothParam) => this.onPowerUp(arg)
    ])
  }

  unsetCallback(): void {
    if (this.cb) {
      ApiCallback.unset(this.cb)
      this.cb = 0
    }
  }

  abstract onPowerUp(arg: ApiPowerUpWothParam): void
}

/**
 *
 */
class QuestKaisou extends QuestKaisouBase {
  private stuff: qs.QuestKaisou

  constructor(p: UpdaterCtorParam, stuff: qs.QuestKaisou) {
    super(p, stuff)
    this.stuff = stuff
  }

  onPowerUp(arg: ApiPowerUpWothParam): void {

    if (! this.stuff.need_succeeded) {
      this.increment()
      return
    }

    if (arg.api_data.api_powerup_flag && this.stuff.need_succeeded) {
      this.increment()
      return
    }
  }
}

/**
 *
 */
class QuestKaisouUseType extends QuestKaisouBase {
  private stuff: qs.QuestKaisouUseType

  constructor(p: UpdaterCtorParam, stuff: qs.QuestKaisouUseType) {
    super(p, stuff)
    this.stuff = stuff
  }

  onPowerUp(arg: ApiPowerUpWothParam): void {
    if (!arg.api_data.api_powerup_flag) {
      return
    }

    if (this.stuff.powerup_ship_type !== null) {
      const mst = svdata.mstShip(arg.api_data.api_ship.api_ship_id)
      if (!mst) {
        return
      }
      if (mst.api_stype !== this.stuff.powerup_ship_type) {
        return
      }
    }

    if (this.stuff.use_ship_type !== null) {
      if (arg.use_ships.length === this.stuff.use_ship_type[1]) {
        const count = arg.use_ships.reduce((acc, el) => {
          if (el.api_stype === this.stuff.use_ship_type![0]) {
            ++acc
          }
          return acc
        }, 0)
        if (count == this.stuff.use_ship_type[1]) {
          this.increment()
        }
      }
    }
  }
}

/**
 *
 */
const countUseIds = (use_ships: MstShip[], ids: number[]): number => {
  return use_ships.reduce((acc, el) => {
    if (ids.indexOf(el.api_id) !== -1) {
      ++acc
    }
    return acc
  }, 0)
}

/**
 *
 */
class QuestKaisouUseId extends QuestKaisouBase {
  private stuff: qs.QuestKaisouUseId

  constructor(p: UpdaterCtorParam, stuff: qs.QuestKaisouUseId) {
    super(p, stuff)
    this.stuff = stuff
  }

  onPowerUp(arg: ApiPowerUpWothParam): void {
    if (!arg.api_data.api_powerup_flag) {
      return
    }

    if (this.stuff.powerup_ship_type !== null) {
      const mst = svdata.mstShip(arg.api_data.api_ship.api_ship_id)
      if (!mst) {
        return
      }
      if (mst.api_stype !== this.stuff.powerup_ship_type) {
        return
      }
    }

    const count = countUseIds(arg.use_ships, this.stuff.use_ship_ids)
    if (count == this.stuff.use_ship_count) {
      this.increment()
    }
  }
}

/**
 *
 */
class QuestKaisouUseIdToId extends QuestKaisouBase {
  private stuff: qs.QuestKaisouUseIdToId

  constructor(p: UpdaterCtorParam, stuff: qs.QuestKaisouUseIdToId) {
    super(p, stuff)
    this.stuff = stuff
  }

  onPowerUp(arg: ApiPowerUpWothParam): void {
    if (!arg.api_data.api_powerup_flag) {
      return
    }

    const mst = svdata.mstShip(arg.api_data.api_ship.api_ship_id)
    if (!mst) {
      return
    }
    if (!this.stuff.powerup_ship_ids.includes(mst.api_id)) {
      return
    }

    const count = countUseIds(arg.use_ships, this.stuff.use_ship_ids)
    if (count == this.stuff.use_ship_count) {
      this.increment()
    }
  }
}

/**
 *
 */
class QuestKaisouUseTypeToId extends QuestKaisouBase {
  private stuff: qs.QuestKaisouUseTypeToId

  constructor(p: UpdaterCtorParam, stuff: qs.QuestKaisouUseTypeToId) {
    super(p, stuff)
    this.stuff = stuff
  }

  onPowerUp(arg: ApiPowerUpWothParam): void {
    if (!arg.api_data.api_powerup_flag) {
      return
    }

    const mst = svdata.mstShip(arg.api_data.api_ship.api_ship_id)
    if (!mst) {
      return
    }
    if (!this.stuff.powerup_ship_ids.includes(mst.api_id)) {
      return
    }

    if (arg.use_ships.length !== this.stuff.use_ship_count) {
      return
    }
    const count = arg.use_ships.reduce((acc, el) => {
      if (this.stuff.use_ship_type.includes(el.api_stype)) {
        ++acc
      }
      return acc
    }, 0)
    if (count === this.stuff.use_ship_count) {
      this.increment()
    }
  }
}

/**
 *
 */
class QuestKaisouUseCategoryToCategory extends QuestKaisouBase {
  private stuff: qs.QuestKaisouUseCategoryToCategory

  constructor(p: UpdaterCtorParam, stuff: qs.QuestKaisouUseCategoryToCategory) {
    super(p, stuff)
    this.stuff = stuff
  }

  onPowerUp(arg: ApiPowerUpWothParam): void {
    if (!arg.api_data.api_powerup_flag) {
      return
    }

    if (arg.use_ships.length !== this.stuff.use_ship_count) {
      return
    }

    const mst = svdata.mstShip(arg.api_data.api_ship.api_ship_id)
    if (!mst) {
      return
    }

    if (! isShipCategory(mst.api_ctype, this.stuff.powerup_ship_cats)) {
      return
    }

    const count = arg.use_ships.reduce((acc, el) => {
      if (isShipCategory(el.api_ctype, this.stuff.use_ship_cats)) {
        ++acc
      }
      return acc
    }, 0)
    if (count === this.stuff.use_ship_count) {
      this.increment()
    }
  }
}

/**
 *
 */
class QuestKaisouUseCategoryToType extends QuestKaisouBase {
  private stuff: qs.QuestKaisouUseCategoryToType

  constructor(p: UpdaterCtorParam, stuff: qs.QuestKaisouUseCategoryToType) {
    super(p, stuff)
    this.stuff = stuff
  }

  onPowerUp(arg: ApiPowerUpWothParam): void {
    if (!arg.api_data.api_powerup_flag) {
      return
    }

    if (arg.use_ships.length !== this.stuff.use_ship_count) {
      return
    }

    const mst = svdata.mstShip(arg.api_data.api_ship.api_ship_id)
    if (!mst) {
      return
    }

    if (! isShipCategory(mst.api_ctype, this.stuff.powerup_ship_cats)) {
      return
    }

    const count = arg.use_ships.reduce((acc, el) => {
      if (isShipType(el, this.stuff.use_ship_types)) {
        ++acc
      }
      return acc
    }, 0)
    if (count === this.stuff.use_ship_count) {
      this.increment()
    }
  }
}

/**
 *
 */
class QuestHokyu extends QuestAnyCounter {
  private cb: number = 0

  setCallback(): void {
    this.cb = ApiCallback.set([Api.REQ_HOKYU_CHARGE, () => this.onHokyuCharge()])
  }

  unsetCallback(): void {
    if (this.cb) {
      ApiCallback.unset(this.cb)
      this.cb = 0
    }
  }

  onHokyuCharge(): void {
    this.increment()
  }
}

/**
 *
 */
class QuestRemodel extends QuestAnyCounter {
  private cb: number = 0

  setCallback(): void {
    this.cb = ApiCallback.set([Api.REQ_KOUSYOU_REMODEL_SLOT, () => this.OnRemodel()])
  }

  unsetCallback(): void {
    if (this.cb) {
      ApiCallback.unset(this.cb)
      this.cb = 0
    }
  }

  OnRemodel(): void {
    this.increment()
  }
}

/**
 *
 */
class QuestCreateItem extends QuestAnyCounter {
  private cb: number = 0

  setCallback(): void {
    this.cb = ApiCallback.set([
      Api.REQ_KOUSYOU_CREATEITEM,
      (arg: ApiCreateItemWithParam) => this.onCreateItem(arg)
    ])
  }

  unsetCallback(): void {
    if (this.cb) {
      ApiCallback.unset(this.cb)
      this.cb = 0
    }
  }

  onCreateItem(arg: ApiCreateItemWithParam): void {
    this.increment(arg.api_get_items.length)
  }
}

/**
 *
 */
abstract class QuestDestroyItemBase extends QuestAnyCounter {
  private cb: number = 0

  setCallback(): void {
    this.cb = ApiCallback.set([
      Api.REQ_KOUSYOU_DESTROYITEM2,
      (arg: ApiDestroyItem2WithParam) => this.onDestroyItem(arg)
    ])
  }

  unsetCallback(): void {
    if (this.cb) {
      ApiCallback.unset(this.cb)
      this.cb = 0
    }
  }

  abstract onDestroyItem(arg: ApiDestroyItem2WithParam): void
}

/**
 *
 */
class QuestDestroyItem extends QuestDestroyItemBase {
  onDestroyItem(_arg: ApiDestroyItem2WithParam): void {
    this.increment()
  }
}

/**
 *
 */
class QuestDestroyItemIdOrType extends QuestDestroyItemBase {
  private stuff: qs.QuestDestroyItemIdOrType

  constructor(p: UpdaterCtorParam, stuff: qs.QuestDestroyItemIdOrType) {
    super(p, stuff)
    this.stuff = stuff
  }

  onDestroyItem(arg: ApiDestroyItem2WithParam): void {
    const condition = this.stuff.getCondition(svdata)
    if (condition) {
      if (!qs.checkCondition(svdata, condition)) {
        return
      }
    }

    if (!this.stuff.id_or_types.length) {
      this.increment()
      return
    }

    const incs = this.stuff.max.slice().fill(0)
    arg.destroy_slotitems.forEach((slotitem: ApiSlotitem) => {
      const mst = svdata.mstSlotitem(slotitem.api_slotitem_id)
      if (mst) {
        const index = this.stuff.id_or_types.findIndex((id_or_type) => {
          if (id_or_type.id) {
            return id_or_type.id === mst.api_id
          }
          if (id_or_type.type) {
            return id_or_type.type === KcsUtil.slotitemType(mst)
          }
          if (id_or_type.types) {
            return id_or_type.types.includes(KcsUtil.slotitemType(mst))
          }
          if (id_or_type.id_with_alv) {
            const id_with_alv = id_or_type.id_with_alv
            if (id_with_alv.id === mst.api_id && id_with_alv.alv === slotitem.api_alv) {
              return true
            }
          }
          return false
        })
        if (index !== -1) {
          ++incs[index]
        }
      }
    })
    this.increments(incs)
  }
}

/**
 *
 */
class QuestCreateShip extends QuestAnyCounter {
  private cb: number = 0

  setCallback(): void {
    this.cb = ApiCallback.set([Api.REQ_KOUSYOU_CREATESHIP, () => this.onCreateShip()])
  }

  unsetCallback(): void {
    if (this.cb) {
      ApiCallback.unset(this.cb)
      this.cb = 0
    }
  }

  onCreateShip(): void {
    this.increment()
  }
}

/**
 *
 */
class QuestDestroyShip extends QuestAnyCounter {
  private cb: number = 0

  setCallback(): void {
    this.cb = ApiCallback.set([
      Api.REQ_KOUSYOU_DESTROYSHIP,
      (arg: ApiDestroyShipWithParam) => this.onDestroyShip(arg)
    ])
  }

  unsetCallback(): void {
    if (this.cb) {
      ApiCallback.unset(this.cb)
      this.cb = 0
    }
  }

  onDestroyShip(arg: ApiDestroyShipWithParam): void {
    this.increment(arg.ship_ids.length)
  }
}

/**
 *
 */
class QuestHensei extends QuestAnyCounter {
  setCallback(): void {}
  unsetCallback(): void {}
}

/**
 *
 */
class QuestSlotitemCondition extends QuestAnyCounter {
  private stuff: qs.QuestSlotitemCondition
  private cb: number = 0
  private initial_updated: boolean = false

  constructor(p: UpdaterCtorParam, stuff: qs.QuestSlotitemCondition) {
    super(p, stuff)
    this.stuff = stuff
  }

  setCallback(): void {
    console.log('QuestSlotitemCondition setCallback', this.quest.api_no)
    this.cb = ApiCallback.set(['slotitem-count-updated', () => this.onSlotitemCountUpdated()])

    // update current state
    if (!this.initial_updated) {
      this.initial_updated = true
      this.onSlotitemCountUpdated()
    }
  }

  unsetCallback(): void {
    if (this.cb) {
      ApiCallback.unset(this.cb)
      this.cb = 0
    }
  }

  onSlotitemCountUpdated(): void {
    const count = this.stuff.max.slice().fill(0)
    const state = this.state.count
    const slotitems = svdata.slotitems
    const max = this.stuff.max
    max.forEach((el, index) => {
      const slotitem_id = this.stuff.slotitem_ids[index]
      const c = slotitems.filter((si) => si.api_slotitem_id === slotitem_id).length
      count[index] = Math.min(c, el)
    })
    const changed = count.some((el, index) => el !== state[index])
    console.log(
      'QuestSlotitemCondition update state',
      this.quest.api_no,
      state,
      '->',
      count,
      changed
    )
    if (changed) {
      count.forEach((el, index) => (state[index] = el))
      this.update()
    }
  }
}

/**
 *
 * @param db
 * @param quest
 * @param updated
 * @param record
 * @returns
 */
const createQuestUpdater = (
  quest: ApiQuest,
  updated: UpdatedCallback,
  record: Quest | undefined = undefined
): QuestUpdater | undefined | null => {
  // get quest stuff
  const stuff = qs.getQuestStuff(quest.api_no)
  if (!stuff) {
    console.debug(`no quest stuff. api_no:${quest.api_no} title:${quest.api_title}`)
    return
  }

  // create updater
  let updater: QuestUpdater | null = null
  switch (stuff.questType) {
    case qs.QuestType.practice:
      updater = new QuestPractice({ quest, updated }, stuff)
      break
    case qs.QuestType.practiceDeck:
      updater = new QuestPracticeDeck({ quest, updated }, stuff)
      break
    case qs.QuestType.collectItem:
      updater = new QuestItem({ quest, updated }, stuff)
      break
    case qs.QuestType.collectItemCondition:
      updater = new QuestItem({ quest, updated }, stuff)
      break
    case qs.QuestType.nyukyo:
      updater = new QuestNyukyo({ quest, updated }, stuff)
      break
    case qs.QuestType.mapStart:
      updater = new QuestMapStart({ quest, updated }, stuff)
      break
    case qs.QuestType.mapStartDeck:
      updater = new QuestMapStartDeck({ quest, updated }, stuff)
      break
    case qs.QuestType.battle:
      updater = new QuestBattle({ quest, updated }, stuff)
      break
    case qs.QuestType.battleEnemy:
      updater = new QuestBattleEnemy({ quest, updated }, stuff)
      break
    case qs.QuestType.battle214:
      updater = new QuestBattle214({ quest, updated }, stuff)
      break
    case qs.QuestType.battleMap:
      updater = new QuestBattleMap({ quest, updated }, stuff)
      break
    case qs.QuestType.battleMapDeck:
      updater = new QuestBattleMapDeck({ quest, updated }, stuff)
      break
    case qs.QuestType.mapGoal:
      updater = new QuestMapGoal({ quest, updated }, stuff)
      break
    case qs.QuestType.gaugeClear:
      updater = new QuestBattleGaugeClear({ quest, updated }, stuff)
      break
    case qs.QuestType.missionStart:
      updater = new QuestMissionStart({ quest, updated }, stuff)
      break
    case qs.QuestType.mission:
      updater = new QuestMission({ quest, updated }, stuff)
      break
    case qs.QuestType.missionSpecific:
      updater = new QuestMissionSpecific({ quest, updated }, stuff)
      break
    case qs.QuestType.kaisou:
      updater = new QuestKaisou({ quest, updated }, stuff)
      break
    case qs.QuestType.kaisouUseType:
      updater = new QuestKaisouUseType({ quest, updated }, stuff)
      break
    case qs.QuestType.kaisouUseId:
      updater = new QuestKaisouUseId({ quest, updated }, stuff)
      break
    case qs.QuestType.kaisouUseIdToId:
      updater = new QuestKaisouUseIdToId({ quest, updated }, stuff)
      break
    case qs.QuestType.kaisouUseTypeToId:
      updater = new QuestKaisouUseTypeToId({ quest, updated }, stuff)
      break
    case qs.QuestType.kaisouUseCategoryToCategory:
      updater = new QuestKaisouUseCategoryToCategory({ quest, updated }, stuff)
      break
    case qs.QuestType.kaisouUseCategoryToType:
      updater = new QuestKaisouUseCategoryToType({ quest, updated }, stuff)
      break
    case qs.QuestType.hokyu:
      updater = new QuestHokyu({ quest, updated }, stuff)
      break
    case qs.QuestType.remodel:
      updater = new QuestRemodel({ quest, updated }, stuff)
      break
    case qs.QuestType.createItem:
      updater = new QuestCreateItem({ quest, updated }, stuff)
      break
    case qs.QuestType.destroyItem:
      updater = new QuestDestroyItem({ quest, updated }, stuff)
      break
    case qs.QuestType.destroyItemIdOrType:
      updater = new QuestDestroyItemIdOrType({ quest, updated }, stuff)
      break
    case qs.QuestType.createShip:
      updater = new QuestCreateShip({ quest, updated }, stuff)
      break
    case qs.QuestType.destroyShip:
      updater = new QuestDestroyShip({ quest, updated }, stuff)
      break
    case qs.QuestType.hensei:
      updater = new QuestHensei({ quest, updated }, stuff)
      break
    case qs.QuestType.slotitemCondition:
      updater = new QuestSlotitemCondition({ quest, updated }, stuff)
      break
  }
  if (!updater) {
    console.debug(`no quest updater. api_no:${quest.api_no} title:${quest.api_title}`)
    return
  }

  // not api data
  if (record) {
    if (!record.state) {
      record.state = updater.newState(quest)
    }
    updater.record = record
    updater.fixState(quest, record.state)
    updater.tmpRecord = Object.assign({}, record.state)
    updater.setCallback()
  }

  return updater
}
