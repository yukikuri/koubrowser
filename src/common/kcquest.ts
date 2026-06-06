import {
  ApiShipType,
  ApiShipTypeKuboClasses,
  SvData,
  ApiItemId,
  ApiShipTypeKeijyunClasses,
  ApiDeckPortId,
  ApiShipCategory,
  SlotitemType,
  SlotInfo,
  toShipMsts,
  shipTypeCount,
  shipCategoryCount,
  shipCount,
  isShipType,
  isShipIds,
  deckShipCount,
  isShipIdLvs,
  ApiShipTypeJyujyunClasses,
  ApiShipTypeSenkanClasses,
} from '@common/kcs'
import type { Quest, QuestCounter } from '@common/record'

/**
 * クエストの種類
 */
export const QuestType = {
  practice: 'practice',
  practiceDeck: 'practiceDeck',
  nyukyo: 'nyukyo',
  collectItem: 'collectItem',
  collectItemCondition: 'collectItemCondition',
  mapStart: 'mapStart',
  mapStartDeck: 'mapStartDeck',
  battle: 'battle',
  battleEnemy: 'battleEnemy',
  battle214: 'battle214',
  battleMap: 'battleMap',
  battleMapDeck: 'battleMapDeck',
  mapGoal: 'mapGoal',
  gaugeClear: 'gaugeClear',
  missionStart: 'missionStart',
  mission: 'mission',
  missionSpecific: 'missionSpecific',
  kaisou: 'kaisou',
  kaisouUseType: 'kaisouUseType',
  kaisouUseId: 'kaisouUseId',
  kaisouUseIdToId: 'kaisouUseIdToId',
  kaisouUseTypeToId: 'kaisouUseTypeToId',
  kaisouUseCategoryToCategory: 'kaisouUseCategoryToCategory',
  kaisouUseCategoryToType: 'kaisouUseCategoryToType',
  hokyu: 'hokyu',
  remodel: 'remodel',
  // todo rename to buildWeapon
  createItem: 'createItem',
  // todo rename to destroyWeapon
  destroyItem: 'destroyItem',
  destroyItemIdOrType: 'destroyItemIdOrType',
  // todo rename create to build
  createShip: 'createShip',
  destroyShip: 'destroyShip',
  hensei: 'hensei',
  slotitemCondition: 'slotitemCondition'
} as const
export type QuestType = (typeof QuestType)[keyof typeof QuestType]

/**
 * クエストキー
 */
export const QuestKey = {
  infer: 'infer', // クエストデータからキーを生成
  single: 'single',
  daily: 'daily',
  weekly: 'weekly',
  monthly: 'monthly',
  quarterly: 'quarterly',
  yearly: 'yearly'
} as const
export type QuestKey = (typeof QuestKey)[keyof typeof QuestKey]

/**
 *
 */
export type BattleRank = 'S' | 'A' | 'B' | 'C' | ''
export type WinRank = 'S' | 'A' | 'B'
export type QuestMap = [number, number, BattleRank] // area_id, area_no, win_rank('' is goal)
export type QuestMapCell = [number, number, WinRank, number[] | undefined] // area_id, area_no, win_rank, cells
export type QuestMapOrCell = QuestMap | QuestMapCell

const QuestMapCell_5_6_3 = (rank: WinRank): QuestMapCell => {
  return [5, 6, rank, [43]]
}

const QuestMapCell_7_2_1 = (rank: WinRank): QuestMapCell => {
  return [7, 2, rank, [7]]
}

const QuestMapCell_7_2_2 = (rank: WinRank): QuestMapCell => {
  return [7, 2, rank, [15]]
}

const QuestMapCell_7_3_2 = (rank: WinRank): QuestMapCell => {
  return [7, 3, rank, [18, 23, 24, 25]]
}

const QuestMapCell_7_5_3 = (rank: WinRank): QuestMapCell => {
  return [7, 5, rank, [24, 25]]
}

/**
 * クエスト共通
 */
export interface QuestCommon {
  max: number[]
  key: QuestKey
  notFixState?: boolean
}

/**
 * クエスト状況フォーマッタ
 */
export interface QuestFormatter {
  formatter(quest: Quest): string
}

/**
 * 艦隊条件マッチャ
 */
export interface QuestDeckMatcher {
  isDeckMatch(svdata: SvData, ship_ids: number[]): boolean
}

/**
 * map条件
 */
export interface QuestMaps {
  maps: QuestMapOrCell[]
}

/**
 * 遠征名指定
 */
export interface QuestMissionNames {
  names: string[][]
}

/**
 * 旗艦装備条件
 */
export interface DestroyItemCondition {
  flagship_lv?: number
  flagship_ids?: number[]
  flagship_id_lvs?: {
    lv: number
    ids: number[]
  }[]
  flagship_type_ids?: ApiShipType[]
  flagship_categories?: ApiShipCategory[]
  flagship_slotitem_ids: number[]
  flagship_slotitem_lvl: number[]
  flagship_slotitem_alv_max?: boolean
  flagship_slotitem_only?: boolean
  deck_checked?: boolean
}
export interface QuestCondition {
  getCondition(svdata: SvData): DestroyItemCondition | undefined
}

/**
 * 演習クエスト
 */
export type PracticeWinRank = '' | 'B' | 'A' | 'S'
export interface QuestPractice extends QuestCommon, QuestFormatter {
  readonly questType: 'practice'
  need_win_rank: PracticeWinRank
}

/**
 * 演習クエスト(艦隊条件有り)
 */
export interface QuestPracticeDeck extends QuestCommon, QuestFormatter, QuestDeckMatcher {
  readonly questType: 'practiceDeck'
  need_win_rank: PracticeWinRank
}

/**
 * 入渠クエスト
 */
export interface QuestNukyo extends QuestCommon, QuestFormatter {
  readonly questType: 'nyukyo'
}

/**
 * アイテム収集クエスト
 */
export interface QuestCollectItem extends QuestCommon, QuestFormatter {
  readonly questType: 'collectItem'
  item_id: ApiItemId
}

/**
 * アイテム収集クエスト(編成条件有)
 */
export interface QuestCollectItemCondition extends QuestCommon, QuestFormatter, QuestCondition {
  readonly questType: 'collectItemCondition'
  item_id: ApiItemId
}

/**
 * 出撃クエスト
 */
export interface QuestMapStart extends QuestCommon, QuestFormatter {
  readonly questType: 'mapStart'
  area_id: number
  area_no: number
}

/**
 * 出撃クエスト条件有
 */
export interface QuestMapStartDeck extends QuestCommon, QuestFormatter, QuestDeckMatcher {
  readonly questType: 'mapStartDeck'
  area_id: number
  area_no: number
}

/**
 * 戦闘クエスト
 */
export interface QuestBattle extends QuestCommon, QuestFormatter {
  readonly questType: 'battle'
  need_win: boolean
}

/**
 * 戦闘クエスト(撃破種別あり)
 */
export interface QuestBattleEnemy extends QuestCommon, QuestFormatter {
  readonly questType: 'battleEnemy'
  type: ApiShipType[]
}

/**
 * あ号作戦
 */
export interface QuestBattle214 extends QuestCommon, QuestFormatter {
  readonly questType: 'battle214'
}

/**
 * 戦闘クエスト(map指定あり)
 */
export interface QuestBattleMap extends QuestCommon, QuestFormatter, QuestMaps {
  readonly questType: 'battleMap'
}

/**
 * 戦闘クエスト(map、艦隊指定あり)
 */
export interface QuestBattleMapDeck
  extends QuestCommon,
    QuestFormatter,
    QuestMaps,
    QuestDeckMatcher {
  readonly questType: 'battleMapDeck'
}

/**
 * マップ到達
 */
export interface QuestMapGoal extends QuestCommon, QuestFormatter, QuestMaps, QuestDeckMatcher {
  readonly questType: 'mapGoal'
}

/**
 * ゲージ破壊
 */
export interface QuestGaugeClear extends QuestCommon, QuestFormatter, QuestMaps, QuestDeckMatcher {
  readonly questType: 'gaugeClear'
}

/**
 * 遠征開始
 */
export interface QuestMissionStart extends QuestCommon, QuestFormatter {
  readonly questType: 'missionStart'
}

/**
 * 遠征
 */
export interface QuestMission extends QuestCommon, QuestFormatter {
  readonly questType: 'mission'
}

/**
 * 遠征(指定あり)
 */
export interface QuestMissionSpecific extends QuestCommon, QuestFormatter, QuestMissionNames {
  readonly questType: 'missionSpecific'
}

/**
 * 近代化改修
 */
export interface QuestKaisou extends QuestCommon, QuestFormatter {
  readonly questType: 'kaisou'
  readonly need_succeeded: boolean
}

/**
 * 近代化改修(対象艦、使用艦指定有り)
 */
export type ShipTypeCount = [ApiShipType, number]
export interface QuestKaisouUseType extends QuestCommon, QuestFormatter {
  readonly questType: 'kaisouUseType'
  powerup_ship_type: ApiShipType | null
  use_ship_type: ShipTypeCount | null
}

/**
 * 近代化改修(対象艦、使用艦指定ID有り)
 */
export interface QuestKaisouUseId extends QuestCommon, QuestFormatter {
  readonly questType: 'kaisouUseId'
  powerup_ship_type: ApiShipType | null
  use_ship_ids: number[]
  use_ship_count: number
}

/**
 * 近代化改修(対象艦ID、使用艦指定ID有り)
 */
export interface QuestKaisouUseIdToId extends QuestCommon, QuestFormatter {
  readonly questType: 'kaisouUseIdToId'
  powerup_ship_ids: number[]
  use_ship_ids: number[]
  use_ship_count: number
}

/**
 * 近代化改修(対象艦ID、使用艦指定タイプ有り)
 */
export interface QuestKaisouUseTypeToId extends QuestCommon, QuestFormatter {
  readonly questType: 'kaisouUseTypeToId'
  powerup_ship_ids: number[]
  use_ship_type: number[]
  use_ship_count: number
}

/**
 * 近代化改修(対象艦カテゴリ、使用艦指定カテゴリ有り)
 */
export interface QuestKaisouUseCategoryToCategory extends QuestCommon, QuestFormatter {
  readonly questType: 'kaisouUseCategoryToCategory'
  powerup_ship_cats: ApiShipCategory[]
  use_ship_cats: ApiShipCategory[]
  use_ship_count: number
}

/**
 * 近代化改修(対象艦カテゴリ、使用艦指定タイプ有り)
 */
export interface QuestKaisouUseCategoryToType extends QuestCommon, QuestFormatter {
  readonly questType: 'kaisouUseCategoryToType'
  powerup_ship_cats: ApiShipCategory[]
  use_ship_types: ApiShipType[]
  use_ship_count: number
}

/**
 * 補給
 */
export interface QuestHokyu extends QuestCommon, QuestFormatter {
  readonly questType: 'hokyu'
}

/**
 * 装備改修
 */
export interface QuestRemodel extends QuestCommon, QuestFormatter {
  readonly questType: 'remodel'
}

/**
 * 装備開発
 */
export interface QuestCreateItem extends QuestCommon, QuestFormatter {
  readonly questType: 'createItem'
}

/**
 * 装備破棄
 */
export interface QuestDestroyItem extends QuestCommon, QuestFormatter {
  readonly questType: 'destroyItem'
}

/**
 * 装備破棄(指定有り)
 */
export interface ItemIdOrType {
  id?: number
  type?: SlotitemType
  types?: SlotitemType[]
  id_with_alv?: { id: number; alv: number }
}
export interface QuestDestroyItemIdOrType extends QuestCommon, QuestFormatter, QuestCondition {
  readonly questType: 'destroyItemIdOrType'
  id_or_types: ItemIdOrType[]
}

/**
 * 建造
 */
export interface QuestCreateShip extends QuestCommon, QuestFormatter {
  readonly questType: 'createShip'
}

/**
 * 解体
 */
export interface QuestDestroyShip extends QuestCommon, QuestFormatter {
  readonly questType: 'destroyShip'
}

/**
 * 編成
 */
export interface QuestHensei extends QuestCommon, QuestFormatter, QuestDeckMatcher {
  readonly questType: 'hensei'
}

/**
 * slotitem条件
 */
export interface QuestSlotitemCondition extends QuestCommon, QuestFormatter {
  readonly questType: 'slotitemCondition'
  slotitem_ids: number[]
}

/**
 * クエストタイプ別の型
 */
export type QuestStuffByType = {
  practice: QuestPractice
  practiceDeck: QuestPracticeDeck
  nyukyo: QuestNukyo
  collectItem: QuestCollectItem
  collectItemCondition: QuestCollectItemCondition
  mapStart: QuestMapStart
  mapStartDeck: QuestMapStartDeck
  battle: QuestBattle
  battleEnemy: QuestBattleEnemy
  battle214: QuestBattle214
  battleMap: QuestBattleMap
  battleMapDeck: QuestBattleMapDeck
  mapGoal: QuestMapGoal
  gaugeClear: QuestGaugeClear
  missionStart: QuestMissionStart
  mission: QuestMission
  missionSpecific: QuestMissionSpecific
  kaisou: QuestKaisou
  kaisouUseType: QuestKaisouUseType
  kaisouUseId: QuestKaisouUseId
  kaisouUseIdToId: QuestKaisouUseIdToId
  kaisouUseTypeToId: QuestKaisouUseTypeToId
  kaisouUseCategoryToCategory: QuestKaisouUseCategoryToCategory
  kaisouUseCategoryToType: QuestKaisouUseCategoryToType
  hokyu: QuestHokyu
  remodel: QuestRemodel
  createItem: QuestCreateItem
  destroyItem: QuestDestroyItem
  destroyItemIdOrType: QuestDestroyItemIdOrType
  createShip: QuestCreateShip
  destroyShip: QuestDestroyShip
  hensei: QuestHensei
  slotitemCondition: QuestSlotitemCondition
}

/**
 * newable な型
 */
type Newable = abstract new (...args: any[]) => unknown

/**
 * クエストタイプ別のクラス型
 */
type QuestStuffClass<T extends QuestType> = Newable & QuestStuffByType[T]

/**
 * レジストリ
 */
const questStuffs = new Map<number, QuestStuffClass<QuestType>>()

/**
 * register 関数
 * id とクラス（静的側）を登録。
 * 渡されたクラスの `questType` に応じて、型安全に byType へも振り分けます。
 */
function register<T extends QuestType>(id: number, cls: QuestStuffClass<T>): void {
  if (questStuffs.get(id)) {
    console.error(`[ERROR] quest stuff id ${id} is already registered`)
    return
  }
  questStuffs.set(id, cls as QuestStuffClass<QuestType>)
}

/**
 * 取得ヘルパ
 **/
export function getQuestStuff(id: number): QuestStuffClass<QuestType> | undefined {
  return questStuffs.get(id)
}

/**
 *
 * @param prefixs
 * @param quest
 * @returns
 */
function detailFormat(prefixs: string[], quest: Quest): string {
  const state = quest.state as QuestCounter
  if (!state) {
    return ''
  }
  return state.count
    .reduce<string[]>((acc, el, index) => {
      const cleared = el === state.countMax[index]
      let classTxt = ''
      if (cleared) {
        classTxt = ' class="cleared"'
      }
      acc.push(`<span${classTxt}>${prefixs[index]}${el}/${state.countMax[index]}</span>`)
      return acc
    }, [])
    .join(' ')
}

function getMapSufix(map: QuestMap | QuestMapCell): string {
  let sufix_txt = ''
  if (map[0] === 7 && map[1] === 2) {
    const map3 = map[3]
    sufix_txt = '(第1)'
    if (Array.isArray(map3) && map3[0] === 15) {
      sufix_txt = '(第2)'
    }
  }
  if (map[0] === 7 && map[1] === 3) {
    const map3 = map[3]
    sufix_txt = '(第1)'
    if (Array.isArray(map3) && map3.length === 4) {
      sufix_txt = '(第2)'
    }
  }
  if (map[0] === 7 && map[1] === 5) {
    //const map3 = map[3];
    sufix_txt = '(第3)'
    //if (Array.isArray(map3) && (map3.length === 2)) {
    //  sufix_txt = '(第3)';
    //}
  }
  return sufix_txt
}

function detailFormatByMap(quest: Quest, maps: QuestMapOrCell[], colon: string = '：'): string {
  const state = quest.state as QuestCounter
  if (!state) {
    return ''
  }

  if (!maps.length) {
    return ''
  }

  return state.count
    .reduce<string[]>((acc, el, index) => {
      const cleared = el === state.countMax[index]
      let classTxt = ''
      if (cleared) {
        classTxt = ' class="cleared"'
      }
      const map = maps[index]
      const sufix_txt = getMapSufix(map)
      const mapTxt = `${map[0]}-${map[1]}${map[2]}${sufix_txt}${colon}`
      acc.push(`<span${classTxt}>${mapTxt}${el}/${state.countMax[index]}</span>`)
      return acc
    }, [])
    .join(' ')
}

function detailFormatOneByMap(quest: Quest, maps: QuestMapOrCell[], colon: string = '：'): string {
  const state = quest.state as QuestCounter
  if (!state) {
    return ''
  }

  if (!maps.length) {
    return ''
  }

  console.log('quest stuff maps', quest.no, quest.quest?.api_title, maps)
  return state.count
    .reduce<string[]>((acc, el, index) => {
      const cleared = el === state.countMax[index]
      let classTxt = ''
      if (cleared) {
        classTxt = ' class="cleared"'
      }
      const txt = el === state.countMax[index] ? '済' : '未'
      const map = maps[index]
      const sufix_txt = getMapSufix(map)
      const mapTxt = `${map[0]}-${map[1]}${map[2]}${sufix_txt}${colon}`
      acc.push(`<span${classTxt}>${mapTxt}${txt}</span>`)
      return acc
    }, [])
    .join(' ')
}

function detailFormatMaps(quest: Quest, maps: QuestMapOrCell[], colon: string = '：'): string {
  const state = quest.state as QuestCounter
  if (!state) {
    return ''
  }

  if (!maps.length) {
    return ''
  }

  console.log('quest stuff maps', quest.no, quest.quest?.api_title, maps)
  return state.count
    .reduce<string[]>((acc, el, index) => {
      const cleared = el === state.countMax[index]
      let classTxt = ''
      if (cleared) {
        classTxt = ' class="cleared"'
      }
      const map = maps[index]
      const sufix_txt = getMapSufix(map)
      const mapTxt = `${map[0]}-${map[1]}${map[2]}${sufix_txt}${colon}`
      if (1 === state.countMax[index]) {
        const txt = el === state.countMax[index] ? '済' : '未'
        acc.push(`<span${classTxt}>${mapTxt}${txt}</span>`)
      } else {
        acc.push(`<span${classTxt}>${mapTxt}${el}/${state.countMax[index]}</span>`)
      }
      return acc
    }, [])
    .join(' ')
}

function detailFormatOne(prefixs: string[], quest: Quest): string {
  const state = quest.state as QuestCounter
  if (!state) {
    return ''
  }
  return state.count
    .reduce<string[]>((acc, el, index) => {
      const cleared = el === state.countMax[index]
      let classTxt = ''
      if (cleared) {
        classTxt = ' class="cleared"'
      }
      const txt = el === state.countMax[index] ? '済' : '未'
      acc.push(`<span${classTxt}>${prefixs[index]}${txt}</span>`)
      return acc
    }, [])
    .join(' ')
}

export function checkCondition(svdata: SvData, condition: DestroyItemCondition): boolean {
  const deck = svdata.deckPort(ApiDeckPortId.deck1st)
  if (!deck) {
    return false
  }

  // check deck checked
  if (condition.deck_checked !== undefined) {
    if (! condition.deck_checked ) {
      return false
    }
  }

  if (condition.flagship_ids && condition.flagship_ids.length > 0) {
    if (!isShipIds(svdata, deck.api_ship[0], condition.flagship_ids)) {
      return false
    }
  }

  if (condition.flagship_categories && condition.flagship_categories.length > 0) {
    const msts = toShipMsts(svdata, [deck.api_ship[0]])
    if (!shipCategoryCount(msts, condition.flagship_categories)) {
      return false
    }
  }

  if (condition.flagship_id_lvs && condition.flagship_id_lvs.length > 0) {
    if (! isShipIdLvs(svdata, deck.api_ship[0], condition.flagship_id_lvs)) {
      return false;
    }
  }

  const ship = svdata.ship(deck.api_ship[0])
  if (!ship) {
    return false
  }

  if (condition.flagship_lv && condition.flagship_lv > ship.api_lv) {
    return false
  }

  if (!condition.flagship_slotitem_ids.length) {
    return true
  }

  let slotitem_ok = false
  let slot: SlotInfo | undefined
  for (let i = 0; i < condition.flagship_slotitem_ids.length; ++i) {
    if (! condition.flagship_slotitem_ids[i]) {
      continue
    }

    slot = svdata.slot(ship.api_slot[i])
    if (!slot) {
      return false
    }
    slotitem_ok = slot.mst.api_id === condition.flagship_slotitem_ids[i]
    if (!slotitem_ok) {
      return false
    }

  }

  if (
    !condition.flagship_slotitem_lvl.length &&
    condition.flagship_slotitem_alv_max === undefined
  ) {
    return slotitem_ok
  }

  // check item level
  for (let i = 0; i < condition.flagship_slotitem_lvl.length; ++i) {
    if (! condition.flagship_slotitem_ids[i]) {
      continue
    }

    const slot = svdata.slot(ship.api_slot[i])
    if (!slot) {
      slotitem_ok = false
      break
    }
    const is_lv_max_ok = condition.flagship_slotitem_lvl[i] <= (slot.api.api_level ?? 0)
    if (!is_lv_max_ok) {
      slotitem_ok = false
      break
    }
    if (0 === i) {
      const is_alv_max_ok =
        condition.flagship_slotitem_alv_max === undefined || slot!.api.api_alv === 7
      if (!is_alv_max_ok) {
        slotitem_ok = false
        break
      }
    }
  }

  // check equip only one
  if (slotitem_ok && condition.flagship_slotitem_only) {
    const slot = svdata.slot(ship.api_slot[1] ?? -1)
    if (slot) {
      return false
    }
  }

  return slotitem_ok
}

// 101: はじめての「編成」！
register(
  101,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(_svdata: SvData, ship_ids: number[]): boolean {
      return deckShipCount(ship_ids) >= 2
    }
  }
)

// 102: 「駆逐隊」を編成せよ！
register(
  102,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      return shipTypeCount(msts, [ApiShipType.kutikukan]) >= 4
    }
  }
)

// 103: 「水雷戦隊」を編成せよ！
register(
  103,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      if(!shipTypeCount([msts[0]], [ApiShipType.keijyun])) {
        return false
      }
      return shipTypeCount(msts.slice(1), [ApiShipType.kutikukan]) >= 2
    }
  }
)

// 104: ６隻編成の艦隊を編成せよ！
register(
  104,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(_svdata: SvData, ship_ids: number[]): boolean {
      return deckShipCount(ship_ids) === 6
    }
  }
)

// 105: 軽巡２隻を擁する隊を編成せよ！
register(
  105,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      return shipTypeCount(msts, [ApiShipType.keijyun]) >= 2
    }
  }
)

// 106: 「重巡戦隊」を編成せよ！
register(
  106,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      return shipTypeCount(msts, [ApiShipType.jyuujyun]) >= 2
    }
  }
)

// 107: 「空母機動部隊」を編成せよ！
register(
  107,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      if(!shipTypeCount([msts[0]], [ApiShipType.kei_kuubo, ApiShipType.seiki_kuubo])) {
        return false
      }
      if (shipTypeCount(msts, [ApiShipType.kutikukan]) < 3) {
        return false
      }
      return deckShipCount(ship_ids) === 6;
    }
  }
)

// 108: 「天龍」型軽巡姉妹の全２艦を編成せよ！
register(
  108,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      return shipCategoryCount(msts, [ApiShipCategory.tenryu]) >= 2
    }
  }
)

// 109: 「川内」型軽巡姉妹の全３艦を編成せよ！
register(
  109,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      return shipCategoryCount(msts, [ApiShipCategory.sendai]) >= 3
    }
  }
)

// 110: 「妙高」型重巡姉妹の全４隻を編成せよ！
register(
  110,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      return shipCategoryCount(msts, [ApiShipCategory.myoukou]) >= 4
    }
  }
)

// 111: 「扶桑」型戦艦姉妹の全２隻を編成せよ！
register(
  111,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      return shipCategoryCount(msts, [ApiShipCategory.fusou]) >= 2
    }
  }
)

// 112: 「伊勢」型戦艦姉妹の全２隻を編成せよ！
register(
  112,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      return shipCategoryCount(msts, [ApiShipCategory.ise]) >= 2
    }
  }
)

// 113: 戦艦と重巡による主力艦隊を編成せよ！
register(
  113,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      if(!shipTypeCount(msts, [ApiShipType.koukuu_senkan, ApiShipType.teisoku_senkan])) {
        return false
      }
      return shipTypeCount(msts, [ApiShipType.jyuujyun]) >= 2 
    }
  }
)

// 114: 「南雲機動部隊」を編成せよ！
register(
  114,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) !== 4) {
        return false
      }
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(83), // akagi
        svdata.shipMstIds(84), // kaga
        svdata.shipMstIds(90), // souryu
        svdata.shipMstIds(91), // hiryu
      ].flat()
      return shipCount(msts, shipIds) === 4
    }
  }
)

// 115: 第２艦隊を編成せよ！
register(
  115,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, _ship_ids: number[]): boolean {
      return !!svdata.deckPort(ApiDeckPortId.deck2st)
    }
  }
)

// 116: 「水上機母艦」を配備せよ！
register(
  116,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      return shipTypeCount(msts, [ApiShipType.suibo]) >= 1
    }
  }
)

// 117: 第２艦隊で空母機動部隊を編成せよ！
register(
  117,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const deck = svdata.deckPort(ApiDeckPortId.deck2st)
      if (! deck) {
        return false
      }

      const msts = toShipMsts(svdata, deck.api_ship)
      if(!shipTypeCount(msts, ApiShipTypeKuboClasses)) {
        return false
      }
      return shipTypeCount(msts, [ApiShipType.kutikukan]) >= 2 
    }
  }
)

// 118: 「金剛」型による高速戦艦部隊を編成せよ！
register(
  118,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      return shipCategoryCount(msts, [ApiShipCategory.kongou]) === 4
    }
  }
)

// 119: 「三川艦隊」を編成せよ！
register(
  119,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) !== 6) {
        return false
      }
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(69), // tyoukai
        svdata.shipMstIds(61), // aoba
        svdata.shipMstIds(60), // kako
        svdata.shipMstIds(59), // furutaka
        svdata.shipMstIds(51), // tenryu
      ].flat()
      if (shipCount(msts, shipIds) !== 5) {
        return false
      }
      return !msts.find((el) => el.mst.api_soku < 10);
    }
  }
)

// 120: 「第六駆逐隊」を編成せよ！
register(
  120,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) !== 4) {
        return false
      }
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(34), // akatuki
        svdata.shipMstIds(35), // hibiki
        svdata.shipMstIds(36), // ikaduti
        svdata.shipMstIds(37), // inazuma
      ].flat()
      return shipCount(msts, shipIds) === 4
    }
  }
)

// 121: 「第四戦隊」を編成せよ！
register(
  121,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(67), // atago
        svdata.shipMstIds(66), // takao
        svdata.shipMstIds(69), // tyoukai
        svdata.shipMstIds(68), // maya
      ].flat()
      return shipCount(msts, shipIds) === 4
    }
  }
)

// 122: 「西村艦隊」を編成せよ！
register(
  122,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(26), // fuso
        svdata.shipMstIds(27), // yamasiro
        svdata.shipMstIds(70), // mogami
        svdata.shipMstIds(43), // sigure
      ].flat()
      return shipCount(msts, shipIds) === 4
    }
  }
)

// 123: 「第五航空戦隊」を編成せよ！
register(
  123,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(110), // syokaku
        svdata.shipMstIds(111), // zuikaku
      ].flat()
      if(shipCount(msts, shipIds) !== 2) {
        return false
      }
      return shipTypeCount(msts, [ApiShipType.kutikukan]) >= 2
    }
  }
)

// 124: 新「三川艦隊」を編成せよ！
register(
  124,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) !== 6) {
        return false
      }
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(69), // tyoukai
        svdata.shipMstIds(61), // aoba
        svdata.shipMstIds(60), // kako
        svdata.shipMstIds(59), // furutaka
        svdata.shipMstIds(51), // tenryu
        svdata.shipMstIds(123), // kimugasa
      ].flat()
      return shipCount(msts, shipIds) === 6
    }
  }
)

// 125: 潜水艦隊を編成せよ！
register(
  125,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      return shipTypeCount(msts, [ApiShipType.sensuikan, ApiShipType.sensui_kuubo]) >= 2
    }
  }
)

// 126: 航空水上打撃艦隊を編成せよ！
register(
  126,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      if (shipTypeCount(msts, [ApiShipType.koukuu_senkan]) < 2) {
        return false
      }
      return shipTypeCount(msts, [ApiShipType.koujyun]) >= 2
    }
  }
)

// 127: 中規模潜水艦隊を編成せよ！
register(
  127,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      return shipTypeCount(msts, [ApiShipType.sensuikan, ApiShipType.sensui_kuubo]) >= 3
    }
  }
)

// 128: 「第六戦隊」を編成せよ！
register(
  128,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(61), // aoba
        svdata.shipMstIds(60), // kako
        svdata.shipMstIds(59), // furutaka
        svdata.shipMstIds(123), // kimugasa
      ].flat()
      return shipCount(msts, shipIds) === 4
    }
  }
)

// 129: 「第五艦隊」を編成せよ！
register(
  129,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(63), // nati
        svdata.shipMstIds(64), // asigara
        svdata.shipMstIds(100), // tama
        svdata.shipMstIds(101), // kiso
      ].flat()
      return shipCount(msts, shipIds) === 4
    }
  }
)

// 130: 「第一水雷戦隊」を編成せよ！
register(
  130,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(114), // abukuma
        svdata.shipMstIds(15), // akebono
        svdata.shipMstIds(16), // usio
        svdata.shipMstIds(49), // kasumi
        svdata.shipMstIds(18), // siranui
      ].flat()
      return shipCount(msts, shipIds) === 5
    }
  }
)

// 131: 「第八駆逐隊」を編成せよ！
register(
  131,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) !== 4) {
        return false
      }
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(95), // asasio
        svdata.shipMstIds(97), // mitisio
        svdata.shipMstIds(96), // oosio
        svdata.shipMstIds(98), // arasio
      ].flat()
      return shipCount(msts, shipIds) === 4
    }
  }
)

// 132: 「第十八駆逐隊」を編成せよ！
register(
  132,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) !== 4) {
        return false
      }
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(49), // kasumi
        svdata.shipMstIds(48), // arare
        svdata.shipMstIds(17), // kagerou
        svdata.shipMstIds(18), // siranui
      ].flat()
      return shipCount(msts, shipIds) === 4
    }
  }
)

// 133: 「第三十駆逐隊(第一次)」を編成せよ！
register(
  133,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) !== 4) {
        return false
      }
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(1), // mutuki
        svdata.shipMstIds(2), // kisaragi
        svdata.shipMstIds(164), // yaroi
        svdata.shipMstIds(31), // motiduki
      ].flat()
      return shipCount(msts, shipIds) === 4
    }
  }
)

// 134: 式の準備！(その参)
register(
  134,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, [ship_ids[0]])
      const lv = msts[0].api.api_lv
      return 90 <= lv && lv <= 99
    }
  }
)

// 135: 新たなる旅立ち！
register(
  135,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) !== 6) {
        return false
      }      
      const msts = toShipMsts(svdata, [ship_ids[0]])
      const lv = msts[0].api.api_lv
      return lv >= 100
    }
  }
)

// 136: 「第三十駆逐隊(第二次)」を編成せよ！
register(
  136,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) !== 4) {
        return false
      }
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(1), // mutuki
        svdata.shipMstIds(165), // uduki
        svdata.shipMstIds(164), // yaroi
        svdata.shipMstIds(31), // motiduki
      ].flat()
      return shipCount(msts, shipIds) === 4
    }
  }
)

// 137: 「第五戦隊」を編成せよ！
register(
  137,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(62), // myouko
        svdata.shipMstIds(63), // nachi
        svdata.shipMstIds(65), // haguro
      ].flat()
      return shipCount(msts, shipIds) === 3
    }
  }
)

// 138: 新編「第二航空戦隊」を編成せよ！
register(
  138,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(196), // hiru kaini
      ].flat()
      if (!shipCount([msts[0]], shipIds)) {
        return false
      }
      const shipIds2 = [
        svdata.shipMstIds(90), // souryu
      ].flat()
      if (!shipCount(msts.slice(1), shipIds2)) {
        return false
      }
      return shipTypeCount(msts.slice(1), [ApiShipType.kutikukan]) >= 2
    }
  }
)

// 139: 潜水艦隊「第六艦隊」を編成せよ！
register(
  139,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      if (!shipTypeCount([msts[0]], [ApiShipType.sensuibokan])) {
        return false
      }
      return shipTypeCount(msts.slice(1), [ApiShipType.sensui_kuubo, ApiShipType.sensuikan]) >= 4
    }
  }
)

// 140: 新型電探を配備せよ！
register(
  140,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, [ship_ids[0]])
      const shipIds = [
        svdata.shipMstIds(319), // myouko kaini
      ].flat()
      return shipCount(msts, shipIds) === 1
    }
  }
)

// 141: 再編成「第二航空戦隊」を強化せよ！
register(
  141,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(197), // souryu kaini
      ].flat()
      if (!shipCount([msts[0]], shipIds)) {
        return false
      }
      const shipIds2 = [
        svdata.shipMstIds(196), // hiru kaini
      ].flat()
      if (!shipCount(msts.slice(1), shipIds2)) {
        return false
      }
      return shipTypeCount(msts.slice(1), [ApiShipType.kutikukan]) >= 2
    }
  }
)

// 142: 精鋭「第三戦隊」全艦集結せよ！
register(
  142,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(149), // kongou kaini
        svdata.shipMstIds(150), // hiei kaini
        svdata.shipMstIds(151), // haruna kaini
        svdata.shipMstIds(152), // kirisima kaini
      ].flat()
      return shipCount(msts, shipIds) === 4
    }
  }
)

// 143: 精鋭「第三戦隊」全艦集結せよ！
register(
  143,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, [ship_ids[0]])
      const shipIds = [
        svdata.shipMstIds(404), // unryu
      ].flat()
      return !!shipCount(msts, shipIds)
    }
  }
)

// 144: 主力戦艦部隊「第二戦隊」を編成せよ！
register(
  144,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) !== 4) {
        return false
      }
      const msts = toShipMsts(svdata, ship_ids)
      if (shipCategoryCount(msts, [ApiShipCategory.nagato]) !== 2) {
        return false
      }
      return shipCategoryCount(msts, [ApiShipCategory.fusou]) === 2
    }
  }
)

// 145: 戦艦を主力とした水上打撃部隊を編成せよ！
register(
  145,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      if (shipCategoryCount(msts, [
        ApiShipCategory.yamato, 
        ApiShipCategory.nagato, 
        ApiShipCategory.ise,
        ApiShipCategory.fusou
       ]) < 3) {
        return false
      }
      return shipTypeCount(msts, [ApiShipType.keijyun]) > 0;
    }
  }
)

// 146: 改修工廠を準備せよ！
register(
  146,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, [ship_ids[0]])
      const shipIds = [
        svdata.shipMstIds(182), // akasi
      ].flat()
      return !!shipCount(msts, shipIds)
    }
  }
)

// 147: 「西村艦隊」を再編成せよ！
register(
  147,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(26), // fuso
        svdata.shipMstIds(27), // yamasiro
        svdata.shipMstIds(70), // mogami
        svdata.shipMstIds(43), // sigure
        svdata.shipMstIds(97), // mitisio
      ].flat()
      return shipCount(msts, shipIds) === 5
    }
  }
)

// 148: 軽快な「水上反撃部隊」を編成せよ！
register(
  148,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(49), // kasumi
      ].flat()
      if (!shipCount([msts[0]], shipIds) ) {
        return false
      }
      const shipIds2 = [
        svdata.shipMstIds(64), // asigara
      ].flat()
      if (!shipCount(msts.slice(1), shipIds2) ) {
        return false
      }
      if (! shipTypeCount(msts.slice(1), [ApiShipType.keijyun]) ) {
        return false
      }
      return shipTypeCount(msts, [ApiShipType.kutikukan]) === 4;
    }
  }
)

// 149: 「第十一駆逐隊」を編成せよ！
register(
  149,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) !== 4) {
        return false
      }

      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(9), // fubuki
        svdata.shipMstIds(10), // shirayuki
        svdata.shipMstIds(11), // miyuki
        svdata.shipMstIds(32), // hatuyuki
        svdata.shipMstIds(33), // murakumo
      ].flat()
      return shipCount(msts, shipIds) === 4
    }
  }
)

// 150: 「第二一駆逐隊」を編成せよ！
register(
  150,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) !== 4) {
        return false
      }

      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(38), // hatuharu
        svdata.shipMstIds(39), // nenohi
        svdata.shipMstIds(40), // wakaba
        svdata.shipMstIds(41), // hatusimo
      ].flat()
      return shipCount(msts, shipIds) === 4
    }
  }
)

// 151: 「第二二駆逐隊」を編成せよ！
register(
  151,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) !== 4) {
        return false
      }

      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(28), // satuki
        svdata.shipMstIds(29), // fumituki
        svdata.shipMstIds(6), // nagatuki
      ].flat()
      if (shipCount(msts, shipIds) !== 3) {
        return false
      }
      return shipTypeCount(msts, [ApiShipType.kutikukan]) === 4
    }
  }
)

// 152: 「三川艦隊」を新編、突入準備せよ！
register(
  152,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds1 = [
        svdata.shipMstIds(427), // tyoukai kaini
      ].flat()
      if (!shipCount([msts[0]], shipIds1)) {
        return false
      }

      const shipIds2 = [
        svdata.shipMstIds(59), // furutaka
        svdata.shipMstIds(60), // kako
        svdata.shipMstIds(61), // aoba
        svdata.shipMstIds(123), // kimugasa
        svdata.shipMstIds(115), // yuubari 
        svdata.shipMstIds(51), // tenryu
      ].flat()
      return shipCount(msts.slice(1), shipIds2) === 5
    }
  }
)

// 153: 「第十八戦隊」を新編成せよ！
register(
  153,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) < 4) {
        return false
      }

      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(51), // renryu
        svdata.shipMstIds(52), // tatuta
      ].flat()
      return shipCount(msts, shipIds) === 2
    }
  }
)

// 155: 新編「第六駆逐隊」を編成せよ！
register(
  155,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) != 4) {
        return false
      }

      const msts = toShipMsts(svdata, ship_ids)
      const shipIds1 = [
        svdata.shipMstIds(437), // akatuki kaini
      ].flat()
      if (!shipCount([msts[0]], shipIds1)) {
        return false
      }

      const shipIds2 = [
        svdata.shipMstIds(35), // hibiki
        svdata.shipMstIds(36), // ikaduchi
        svdata.shipMstIds(37), // inazuma
      ].flat()
      return shipCount(msts.slice(1), shipIds2) === 3
    }
  }
)

// 156: 「第一水雷戦隊」北方突入準備！
register(
  156,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) < 6) {
        return false
      }

      const msts = toShipMsts(svdata, ship_ids)
      const shipIds1 = [
        svdata.shipMstIds(114), // abukuma
      ].flat()
      if (!shipCount([msts[0]], shipIds1)) {
        return false
      }

      const shipIds2 = [
        svdata.shipMstIds(35), // hibiki
        svdata.shipMstIds(41), // hatusimo
        svdata.shipMstIds(40), // wakaba
        svdata.shipMstIds(46), // samidare
        svdata.shipMstIds(50), // simakaze
      ].flat()
      return shipCount(msts.slice(1), shipIds2) === 5
    }
  }
)

// 157: 「第一水雷戦隊」北方再突入準備！
register(
  157,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) < 6) {
        return false
      }

      const msts = toShipMsts(svdata, ship_ids)
      const shipIds1 = [
        svdata.shipMstIds(200), // abukuma kaini
      ].flat()
      if (!shipCount([msts[0]], shipIds1)) {
        return false
      }

      const shipIds2 = [
        svdata.shipMstIds(35), // hibiki
        svdata.shipMstIds(133), // yuugumo
        svdata.shipMstIds(135), // naganami
        svdata.shipMstIds(132), // akigumo
        svdata.shipMstIds(50), // simakaze
      ].flat()
      return shipCount(msts.slice(1), shipIds2) === 5
    }
  }
)

// 158: 精鋭無比「第一戦隊」抜錨準備！
register(
  158,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) < 2) {
        return false
      }

      const msts = toShipMsts(svdata, ship_ids)
      const shipIds1 = [
        svdata.shipMstIds(541), // nagato kaini
      ].flat()
      if (!shipCount([msts[0]], shipIds1)) {
        return false
      }

      const shipIds2 = [
        svdata.shipMstIds(573), // mutu kaini
      ].flat()
      return !!shipCount([msts[1]], shipIds2)
    }
  }
)

// 161: 「第五航空戦隊」を再編成せよ！
register(
  161,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(110), // syokaku
        svdata.shipMstIds(111), // zuikaku
        svdata.shipMstIds(93), // oboro
        svdata.shipMstIds(132), // akigumo
      ].flat()
      return shipCount(msts, shipIds) === 4
    }
  }
)

// 162: 新編「第二一戦隊」出撃準備！
register(
  162,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(192), // nachi kaini
        svdata.shipMstIds(193), // asigara kaini
        svdata.shipMstIds(100), // tama
        svdata.shipMstIds(101), // kiso
      ].flat()
      return shipCount(msts, shipIds) === 4
    }
  }
)

// 163: 「第十六戦隊(第一次)」を編成せよ！
register(
  163,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds1 = [
        svdata.shipMstIds(64), // asigara
      ].flat()
      if (!shipCount([msts[0]], shipIds1)) {
        return false
      }

      const shipIds2 = [
        svdata.shipMstIds(100), // tama
        svdata.shipMstIds(21), // nagara
      ].flat()

      return shipCount(msts.slice(1), shipIds2) === 2
    }
  }
)

// 164: 「第三航空戦隊」を編成せよ！
register(
  164,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds1 = [
        svdata.shipMstIds(112), // zuikaku kai
      ].flat()
      if (!shipCount([msts[0]], shipIds1)) {
        return false
      }

      const shipIds2 = [
        svdata.shipMstIds(116), // zuihou
        svdata.shipMstIds(108), // titose kou
        svdata.shipMstIds(109), // tiyoda kou
      ].flat()

      return shipCount(msts.slice(1), shipIds2) === 3
    }
  }
)

// 165: 「第四航空戦隊」を編成せよ！
register(
  165,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(82), // ise kai
        svdata.shipMstIds(88), // hyuga kai
      ].flat()
      return shipCount(msts, shipIds) === 2
    }
  }
)

// 166: 「小沢艦隊」を編成せよ！
register(
  166,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) < 6) {
        return false
      }

      const msts = toShipMsts(svdata, ship_ids)
      const shipIds1 = [
        svdata.shipMstIds(112), // zuikaku kai
      ].flat()
      if (!shipCount([msts[0]], shipIds1)) {
        return false
      }

      const shipIds2 = [
        svdata.shipMstIds(117), // zuihou kai
        svdata.shipMstIds(108), // titose kou
        svdata.shipMstIds(109), // tiyoda kou
        svdata.shipMstIds(82), // ise kai
        svdata.shipMstIds(88), // hyuga kai
      ].flat()

      return shipCount(msts.slice(1), shipIds2) === 5
    }
  }
)

// 167: 新航空戦隊を編成せよ！
register(
  167,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) !== 4) {
        return false
      }

      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(461), // syoukaku kaini
        svdata.shipMstIds(462), // zuikaku kaini
      ].flat()
      if (shipCount(msts, shipIds) !== 2) {
        return false
      }
      return shipTypeCount(msts, [ApiShipType.kutikukan]) === 2
    }
  }
)

// 168: 「第十六戦隊(第二次)」を編成せよ！
register(
  168,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) < 6) {
        return false
      }

      const msts = toShipMsts(svdata, ship_ids)
      const shipIds1 = [
        svdata.shipMstIds(53), // natori
      ].flat()
      if (!shipCount([msts[0]], shipIds1)) {
        return false
      }

      const shipIds2 = [
        svdata.shipMstIds(22), // isuzu
        svdata.shipMstIds(113), // kinu
      ].flat()
      return shipCount(msts.slice(1), shipIds2) === 2
    }
  }
)

// 169: 「新編成航空戦隊」を編成せよ！
register(
  169,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) !== 6) {
        return false
      }

      const msts = toShipMsts(svdata, ship_ids)
      if (shipTypeCount(msts, ApiShipTypeKuboClasses) !== 2) {
        return false
      }
      if (shipTypeCount(msts, [ApiShipType.koukuu_senkan, ApiShipType.koujyun]) !== 2) {
        return false
      }
      return shipTypeCount(msts, [ApiShipType.kutikukan]) === 2
    }
  }
)

// 170: 精強な「水上反撃部隊」を再編成せよ！
register(
  170,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) < 6) {
        return false
      }
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds1 = [
        svdata.shipMstIds(49), // kasumi
      ].flat()
      if (!shipCount([msts[0]], shipIds1)) {
        return false
      }

      const shipIds2 = [
        svdata.shipMstIds(64), // asigara
        svdata.shipMstIds(183), // ooyodo
        svdata.shipMstIds(425), // asasimo
        svdata.shipMstIds(410), // kiyosimo
      ].flat()
      return shipCount(msts.slice(1), shipIds2) === 4
    }
  }
)

// 171: 「第三十一戦隊(第一次)」を編成せよ！
register(
  171,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds1 = [
        svdata.shipMstIds(141), // isuzu kaini
      ].flat()
      if (!shipCount([msts[0]], shipIds1)) {
        return false
      }

      const shipIds2 = [
        svdata.shipMstIds(418), // satuki kaini
        svdata.shipMstIds(309), // utuki kai
      ].flat()
      return shipCount(msts.slice(1), shipIds2) === 2
    }
  }
)

// 172: 「第二七駆逐隊」を編成せよ！
register(
  172,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) !== 4) {
        return false
      }

      const msts = toShipMsts(svdata, ship_ids)
      const shipIds1 = [
        svdata.shipMstIds(242), // siratuyu kai
      ].flat()
      if (!shipCount([msts[0]], shipIds1)) {
        return false
      }

      const shipIds2 = [
        svdata.shipMstIds(43), // sigure
        svdata.shipMstIds(405), // harusame
        svdata.shipMstIds(46), // samidare
      ].flat()
      return shipCount(msts.slice(1), shipIds2) === 3
    }
  }
)

// 173: 強行高速輸送部隊を編成せよ！
register(
  173,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) !== 5) {
        return false
      }

      const msts = toShipMsts(svdata, ship_ids)
      const shipIds1 = [
        svdata.shipMstIds(158), // sendai kaini
      ].flat()
      if (!shipCount([msts[0]], shipIds1)) {
        return false
      }

      const shipIds2 = [
        svdata.shipMstIds(469), // kawakaze kaini
        svdata.shipMstIds(145), // sigure kaini
      ].flat()
      if (shipCount(msts.slice(1), shipIds2) !== 2) {
        return false
      }
      return shipTypeCount(msts.slice(1), [ApiShipType.kutikukan]) === 4
    }
  }
)

// 174: 新編「水雷戦隊」を含む艦隊を再編成せよ！
register(
  174,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      if (!shipTypeCount([msts[0]], [ApiShipType.keijyun]) ) {
        return false
      }
      return shipTypeCount(msts.slice(1), [ApiShipType.kutikukan]) >= 4
    }
  }
)

// 175: 新編「第八駆逐隊」を再編成せよ！
register(
  175,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) !== 4) {
        return false
      }

      const msts = toShipMsts(svdata, ship_ids)
      const shipIds1 = [
        svdata.shipMstIds(463), // asasio kaini
      ].flat()
      if (!shipCount([msts[0]], shipIds1)) {
        return false
      }

      const shipIds2 = [
        svdata.shipMstIds(97), // michisio
        svdata.shipMstIds(96), // oosio
        svdata.shipMstIds(98), // arasio
      ].flat()
      return shipCount(msts.slice(1), shipIds2) === 3
    }
  }
)

// 176: 精鋭！八駆第一小隊！
register(
  176,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(468), // asasio kaini tyou
        svdata.shipMstIds(199), // oosio kaini 
      ].flat()
      return shipCount(msts, shipIds) === 2
    }
  }
)

// 177: 「第十九駆逐隊」を編成せよ！
register(
  177,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) !== 4) {
        return false
      }
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(12), // isonami
        svdata.shipMstIds(486), // uranami
        svdata.shipMstIds(13), // ayanami
        svdata.shipMstIds(14), // sikinami
      ].flat()
      return shipCount(msts, shipIds) === 4
    }
  }
)

// 178: 「第十六戦隊(第三次)」を編成せよ！
register(
  178,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(113), // kinu
        svdata.shipMstIds(61), // aoba
        svdata.shipMstIds(25), // kitagami
        svdata.shipMstIds(24), // ooi
      ].flat()
      return shipCount(msts, shipIds) === 4
    }
  }
)

// 179: 精鋭「第十六戦隊」を再編成せよ！
register(
  179,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) !== 6) {
        return false
      }

      const msts = toShipMsts(svdata, ship_ids)
      const shipIds1 = [
        svdata.shipMstIds(487), // kinu kaini
      ].flat()
      if (!shipCount([msts[0]], shipIds1)) {
        return false
      }

      const shipIds2 = [
        svdata.shipMstIds(119), // kitakami kaini
        svdata.shipMstIds(118), // ooi kaini
        svdata.shipMstIds(215), // tama kai
        svdata.shipMstIds(264), // aoba kai
        svdata.shipMstIds(368), // uranami kai
        svdata.shipMstIds(208), // sikinami kai
      ].flat()
      return shipCount(msts.slice(1), shipIds2) === 5
    }
  }
)

// 180: 新編「第一戦隊」を編成せよ！
register(
  180,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) < 2) {
        return false
      }

      const msts = toShipMsts(svdata, ship_ids)
      const shipIds1 = [
        svdata.shipMstIds(541), // nagato kaini
      ].flat()
      if (!shipCount([msts[0]], shipIds1)) {
        return false
      }

      const shipIds2 = [
        svdata.shipMstIds(276), // mutu kai
      ].flat()
      return !!shipCount([msts[1]], shipIds2)
    }
  }
)

// 181: 新編「第七戦隊」を編成せよ！
register(
  181,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) < 4) {
        return false
      }

      const msts = toShipMsts(svdata, ship_ids)
      const shipIds1 = [
        svdata.shipMstIds(504), // kumano kaini
      ].flat()
      if (!shipCount([msts[0]], shipIds1)) {
        return false
      }

      const shipIds2 = [
        svdata.shipMstIds(503), // suduya kaini
      ].flat()
      if (!shipCount([msts[1]], shipIds2)) {
        return false
      }

      const shipIds3 = [
        svdata.shipMstIds(73), // mogami kai
        svdata.shipMstIds(121), // mikuma kai
      ].flat()
      return shipCount(msts.slice(2), shipIds3) === 2
    }
  }
)

// 182: 精鋭「第四航空戦隊」を再編成せよ！
register(
  182,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) < 6) {
        return false
      }

      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(82), // ise kai
        svdata.shipMstIds(88), // hyuga kai
      ].flat()
      if (!shipCount([msts[0]], shipIds)) {
        return false
      }
      if (msts[0].api.api_lv < 50) {
        return false
      }

      if (!shipCount([msts[1]], shipIds)) {
        return false
      }
      if (msts[1].api.api_lv < 50) {
        return false
      }

      if (shipTypeCount(msts.slice(2), [ApiShipType.keijyun]) < 1) {
        return false
      }
      return shipTypeCount(msts.slice(2), [ApiShipType.kutikukan]) >= 2
    }
  }
)

// 183: 新編「第四水雷戦隊」を編成せよ！
register(
  183,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) < 6) {
        return false
      }

      const msts = toShipMsts(svdata, ship_ids)
      const shipIds1 = [
        svdata.shipMstIds(488), // yura kaini
      ].flat()
      if (!shipCount([msts[0]], shipIds1)) {
        return false
      }

      const shipIds2 = [
        svdata.shipMstIds(44), // murasame
        svdata.shipMstIds(45), // yuudati
        svdata.shipMstIds(405), // harusame 
        svdata.shipMstIds(46), // samidare
      ].flat()
      if (shipCount(msts.slice(1), shipIds2) !== 4) {
        return false
      }

      return shipTypeCount(msts.slice(1), [ApiShipType.kutikukan]) === 5
    }
  }
)

// 184: 精鋭「第二二駆逐隊」を再編成せよ！
register(
  184,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) !== 4) {
        return false
      }

      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(548), // fumituki kaini
        svdata.shipMstIds(418), // satuki kaini
        svdata.shipMstIds(366), // minatuki kai
        svdata.shipMstIds(258), // nagatuki kai
      ].flat()
      return shipCount(msts, shipIds) === 4
    }
  }
)

// 185: 精強「任務部隊」を編成せよ！
register(
  185,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(545), // saratoga mk2
      ].flat()
      if (!shipCount([msts[0]], shipIds)) {
        return false
      }

      if (shipTypeCount(msts.slice(1), [ApiShipType.keijyun]) !== 1) {
        return false
      }

      return shipTypeCount(msts.slice(1), [ApiShipType.kutikukan]) >= 2
    }
  }
)

// 186: 最精鋭「第八駆逐隊」を編成せよ！
register(
  186,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) !== 4) {
        return false
      }

      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(463), // asasio kaini
        svdata.shipMstIds(199), // oosio kaini
        svdata.shipMstIds(490), // arasio kaini
        svdata.shipMstIds(489), // mitisio kaini
      ].flat()
      return shipCount(msts, shipIds) === 4
    }
  }
)

// 187: 「西村艦隊」第二戦隊随伴部隊、集結せよ！
register(
  187,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const deck3st = svdata.deckPort(ApiDeckPortId.deck3st)
      if (! deck3st) {
        return false
      }

      if (deckShipCount(deck3st.api_ship) !== 5) {
        return false
      }

      const msts = toShipMsts(svdata, deck3st.api_ship)
      const shipIds = [
        svdata.shipMstIds(70), // mogami
        svdata.shipMstIds(43), // sigure
        svdata.shipMstIds(97), // mitisio
        svdata.shipMstIds(413), // asagumo
        svdata.shipMstIds(414), // yamagumo
      ].flat()
      return shipCount(msts, shipIds) === 5
    }
  }
)

// 188: 精鋭「三一駆」第一小隊、抜錨準備！
register(
  188,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) !== 2) {
        return false
      }
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds1 = [
        svdata.shipMstIds(543), // naganami kaini
      ].flat()
      if (!shipCount([msts[0]], shipIds1)) {
        return false
      }

      const shipIds2 = [
        svdata.shipMstIds(345), // takanami kai
        svdata.shipMstIds(359), // okinami kai
        svdata.shipMstIds(344), // asasimo kai
      ].flat()
      return !!shipCount(msts.slice(1), shipIds2)
    }
  }
)

// 189: 精鋭「四水戦」抜錨準備！
register(
  189,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) !== 6) {
        return false
      }
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds1 = [
        svdata.shipMstIds(498), // murasame kaini
      ].flat()
      if (!shipCount([msts[0]], shipIds1)) {
        return false
      }

      const shipIds2 = [
        svdata.shipMstIds(488), // yura kaini
        svdata.shipMstIds(144), // yuudati kaini
        svdata.shipMstIds(323), // harusame kai
        svdata.shipMstIds(246), // samidare kai
        svdata.shipMstIds(330), // akiduki kai
      ].flat()
      return shipCount(msts.slice(1), shipIds2) >= 3
    }
  }
)

// 190: 精鋭「第二一駆逐隊」、抜錨準備！
register(
  190,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const count = deckShipCount(ship_ids)
      if (count !== 3 && count !== 4) {
        return false
      }

      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(240), // wakaba kai
        svdata.shipMstIds(326), // hatuharu kaini
        svdata.shipMstIds(419), // hatusimom kaini
      ].flat()
      return shipCount(msts, shipIds) >= 3
    }
  }
)

// 191: 改装「第十七駆逐隊」、再編始め！
register(
  191,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) !== 4) {
        return false
      }

      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(317), // urakaze kai
        svdata.shipMstIds(313), // tanikaze kai
        svdata.shipMstIds(557), // isokaze otukai
        svdata.shipMstIds(558), // hamakaze otukai
      ].flat()
      return shipCount(msts, shipIds) === 4
    }
  }
)

// 192: 改装「第十七駆逐隊」、再編始め！
register(
  192,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) !== 4) {
        return false
      }

      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(198), // arare kaini
        svdata.shipMstIds(464), // kasumi kaini
        svdata.shipMstIds(225), // kegerou kai
        svdata.shipMstIds(226), // siramui kai
      ].flat()
      return shipCount(msts, shipIds) === 4
    }
  }
)

// 193: 最精鋭甲型駆逐艦、集結せよ！
register(
  193,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) !== 6) {
        return false
      }

      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(566), // kagerou kaini
        svdata.shipMstIds(567), // siramui kaini
        svdata.shipMstIds(568), // kurosio kaini
      ].flat()
      if (shipCount(msts, shipIds) !== 3) {
        return false
      }

      const filtered = msts.filter(mst => !shipIds.includes(mst.api.api_id))
      if (shipCategoryCount(filtered, [ApiShipCategory.kagerou, ApiShipCategory.yuugumo]) !== 3) {
        return false
      }

      return !filtered.some(mst => mst.api.api_lv < 70)
    }
  }
)

// 194: 精鋭「第十八戦隊」を再編成せよ！
register(
  194,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) !== 2) {
        return false
      }
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(477), // tenryu kaini
        svdata.shipMstIds(478), // tatuta kaini
      ].flat()
      return shipCount(msts, shipIds) === 2
    }
  }
)

// 195: 精強「第十七駆逐隊」を編成せよ！
register(
  195,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) !== 4) {
        return false
      }

      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(557), // isokaze otukai
        svdata.shipMstIds(558), // hamakaze otukai
        svdata.shipMstIds(556), // urakaze tyoukai
        svdata.shipMstIds(559), // tanikaze tyoukai
      ].flat()
      return shipCount(msts, shipIds) === 4
    }
  }
)

// 196: 精鋭「第十駆逐隊」、抜錨準備！
register(
  196,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) !== 2) {
        return false
      }
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(542), // yuugumo kaini
        svdata.shipMstIds(563), // makigumo kaini
      ].flat()
      return shipCount(msts, shipIds) === 2
    }
  }
)

// 197: 主力オブ主力、精強「十駆」出撃準備ヨシ！
register(
  197,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) !== 4) {
        return false
      }
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(542), // yuugumo kaini
        svdata.shipMstIds(563), // makigumo kaini
        svdata.shipMstIds(564), // kazagumo kaini
        svdata.shipMstIds(648), // akigumo kaini
      ].flat()
      return shipCount(msts, shipIds) === 4
    }
  }
)

// 198: 精強！「第七駆逐隊」抜錨準備せよ！
register(
  198,
  class {
    static readonly questType = QuestType.hensei
    static max = [1]
    static key = QuestKey.infer
    static formatter(_quest: Quest): string {
      return ''
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(230), // oborokai
        svdata.shipMstIds(232), // sazamanikai
        svdata.shipMstIds(231), // akebonokai
        svdata.shipMstIds(233) // usiokai
      ].flat()
      return shipCount(msts, shipIds) === 4
    }
  }
)

// 201: 敵艦隊を撃破せよ！
register(
  201,
  class {
    static readonly questType = QuestType.battle
    static max = [1]
    static key = QuestKey.infer
    static need_win = true
    static formatter(quest: Quest): string {
      return detailFormatOne(['戦闘勝利：'], quest)
    }
  }
)

// 202: はじめての「出撃」！
register(
  202,
  class {
    static readonly questType = QuestType.mapStart
    static max = [1]
    static key = QuestKey.infer
    static area_id = 0
    static area_no = 0
    static formatter(quest: Quest): string {
      return detailFormatOne(['出撃：'], quest)
    }
  }
)

// 203: 鎮守府正面海域を護れ！
register(
  203,
  class {
    static readonly questType = QuestType.battleMap
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [1, 1, 'B'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
  }
)

// 204: 南西諸島沖に出撃せよ！
register(
  204,
  class {
    static readonly questType = QuestType.mapStart
    static max = [1]
    static key = QuestKey.infer
    static area_id = 1
    static area_no = 2
    static formatter(quest: Quest): string {
      return detailFormatOne(['出撃 1-2：'], quest)
    }
  }
)

// 205: 接近する「敵前衛艦隊」を迎撃せよ！
register(
  205,
  class {
    static readonly questType = QuestType.battleMap
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [1, 2, 'B'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
  }
)

// 206: 「水雷戦隊」で出撃せよ！
register(
  206,
  class {
    static readonly questType = QuestType.mapStartDeck
    static max = [1]
    static key = QuestKey.infer
    static area_id = 0
    static area_no = 0
    static formatter(quest: Quest): string {
      return detailFormatOne(['出撃：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) < 4) {
        return false
      }
      const ships = toShipMsts(svdata, ship_ids)
      if (! shipTypeCount([ships[0]], [ApiShipType.keijyun]) ) {
        return false
      }
      return shipTypeCount(ships.slice(1), [ApiShipType.kutikukan]) >= 3
    }
  }
)

// 207: 「重巡洋艦」を出撃させよ！
register(
  207,
  class {
    static readonly questType = QuestType.mapStartDeck
    static max = [1]
    static key = QuestKey.infer
    static area_id = 0
    static area_no = 0
    static formatter(quest: Quest): string {
      return detailFormatOne(['出撃：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, [ship_ids[0]])
      return !!shipTypeCount([ships[0]], [ApiShipType.jyuujyun])
    }
  }
)

// 208: 「戦艦」を出撃させよ！
register(
  208,
  class {
    static readonly questType = QuestType.mapStartDeck
    static max = [1]
    static key = QuestKey.infer
    static area_id = 0
    static area_no = 0
    static formatter(quest: Quest): string {
      return detailFormatOne(['出撃：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, [ship_ids[0]])
      return !!shipTypeCount([ships[0]], [ApiShipType.kousoku_senkan, ApiShipType.teisoku_senkan])
    }
  }
)

// 209: 「空母機動部隊」出撃せよ！
register(
  209,
  class {
    static readonly questType = QuestType.mapStartDeck
    static max = [1]
    static key = QuestKey.infer
    static area_id = 0
    static area_no = 0
    static formatter(quest: Quest): string {
      return detailFormatOne(['出撃：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) < 4) {
        return false
      }
      const ships = toShipMsts(svdata, [ship_ids[0]])
      return !!shipTypeCount([ships[0]], ApiShipTypeKuboClasses)
    }
  }
)

// 210: 敵艦隊を 10 回邀撃せよ！
register(
  210,
  class {
    static readonly questType = QuestType.battle
    static max = [10]
    static key = QuestKey.infer
    static need_win = false
    static formatter(quest: Quest): string {
      return detailFormat(['戦闘：'], quest)
    }
  }
)

// 211: 敵空母を 3 隻撃沈せよ！
register(
  211,
  class {
    static readonly questType = QuestType.battleEnemy
    static max = [3]
    static type = [ApiShipType.kei_kuubo, ApiShipType.seiki_kuubo]
    static key = QuestKey.daily
    static formatter(quest: Quest): string {
      return detailFormat(['空母系撃沈：'], quest)
    }
  }
)

// 212:	敵輸送船団を叩け！
register(
  212,
  class {
    static readonly questType = QuestType.battleEnemy
    static max = [5]
    static key = QuestKey.daily
    static type = [ApiShipType.hokyuukan_enemy]
    static formatter(quest: Quest): string {
      return detailFormat(['補給艦撃沈：'], quest)
    }
  }
)

// 213:	海上通商破壊作戦
register(
  213,
  class {
    static readonly questType = QuestType.battleEnemy
    static max = [20]
    static key = QuestKey.infer
    static type = [ApiShipType.hokyuukan_enemy]
    static formatter(quest: Quest): string {
      return detailFormat(['補給艦撃沈：'], quest)
    }
  }
)

// 214: あ号作戦
register(
  214,
  class {
    static readonly questType = QuestType.battle214
    static max = [36, 6, 24, 12] // start, S, boss, win boss
    static key = QuestKey.infer
    static formatter(quest: Quest): string {
      return detailFormat(['出撃：', 'S勝利：', 'Boss到達：', 'Boss勝利：'], quest)
    }
  }
)

// 215: 第２艦隊、出撃せよ！
register(
  215,
  class {
    static readonly questType = QuestType.mapStartDeck
    static max = [1]
    static key = QuestKey.infer
    static area_id = 0
    static area_no = 0
    static formatter(quest: Quest): string {
      return detailFormatOne(['出撃：'], quest)
    }
    static isDeckMatch(svdata: SvData, _ship_ids: number[]): boolean {
      return svdata.battleDeck?.api_id === ApiDeckPortId.deck2st
    }
  }
)

// 216: 敵艦隊主力を撃滅せよ！
register(
  216,
  class {
    static readonly questType = QuestType.battle
    static max = [1]
    static key = QuestKey.infer
    static need_win = false
    static formatter(quest: Quest): string {
      return detailFormatOne(['戦闘：'], quest)
    }
  }
)

// 217: 敵空母を撃沈せよ！
register(
  217,
  class {
    static readonly questType = QuestType.battleEnemy
    static max = [1]
    static key = QuestKey.infer
    static type = [ApiShipType.kei_kuubo, ApiShipType.seiki_kuubo]
    static formatter(quest: Quest): string {
      return detailFormat(['空母系撃沈：'], quest)
    }
  }
)

// 218:	敵補給艦を 3 隻撃沈せよ！
register(
  218,
  class {
    static readonly questType = QuestType.battleEnemy
    static max = [3]
    static key = QuestKey.infer
    static type = [ApiShipType.hokyuukan_enemy]
    static formatter(quest: Quest): string {
      return detailFormat(['補給艦撃沈：'], quest)
    }
  }
)

// 219: 「三川艦隊」出撃せよ！
register(
  219,
  class {
    static readonly questType = QuestType.mapStartDeck
    static max = [1]
    static key = QuestKey.infer
    static area_id = 0
    static area_no = 0
    static formatter(quest: Quest): string {
      return detailFormatOne(['出撃：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) !== 6) {
        return false
      }
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(69), // tyoukai
        svdata.shipMstIds(61), // aoba
        svdata.shipMstIds(60), // kako
        svdata.shipMstIds(59), // furutaka
        svdata.shipMstIds(51), // tenryu
      ].flat()
      if (shipCount(msts, shipIds) !== 5) {
        return false
      }
      return !msts.find((el) => el.mst.api_soku < 10);
    }
  }
)

// 220: い号作戦
register(
  220,
  class {
    static readonly questType = QuestType.battleEnemy
    static max = [20]
    static key = QuestKey.infer
    static type = [ApiShipType.kei_kuubo, ApiShipType.seiki_kuubo]
    static formatter(quest: Quest): string {
      return detailFormat(['空母系撃沈：'], quest)
    }
  }
)

// 221:	ろ号作戦
register(
  221,
  class {
    static readonly questType = QuestType.battleEnemy
    static max = [50]
    static key = QuestKey.infer
    static type = [ApiShipType.hokyuukan_enemy]
    static formatter(quest: Quest): string {
      return detailFormat(['補給艦撃沈：'], quest)
    }
  }
)

// 222: 「第六駆逐隊」出撃せよ！
register(
  222,
  class {
    static readonly questType = QuestType.mapStartDeck
    static max = [1]
    static key = QuestKey.infer
    static area_id = 0
    static area_no = 0
    static formatter(quest: Quest): string {
      return detailFormatOne(['出撃：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) !== 4) {
        return false
      }
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(34), // akatuki
        svdata.shipMstIds(35), // hibiki
        svdata.shipMstIds(36), // ikaduti
        svdata.shipMstIds(37), // inazuma
      ].flat()
      return shipCount(msts, shipIds) === 4
    }
  }
)

// 223: 「第四戦隊」出撃せよ！
register(
  223,
  class {
    static readonly questType = QuestType.mapStartDeck
    static max = [1]
    static key = QuestKey.infer
    static area_id = 0
    static area_no = 0
    static formatter(quest: Quest): string {
      return detailFormatOne(['出撃：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(67), // atago
        svdata.shipMstIds(66), // takao
        svdata.shipMstIds(69), // tyoukai
        svdata.shipMstIds(68), // maya
      ].flat()
      return shipCount(msts, shipIds) === 4
    }
  }
)

// 224: 「西村艦隊」出撃せよ！
register(
  224,
  class {
    static readonly questType = QuestType.battleMap
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [2, 3, 'B'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(26), // fuso
        svdata.shipMstIds(27), // yamasiro
        svdata.shipMstIds(70), // mogami
        svdata.shipMstIds(43), // sigure
      ].flat()
      return shipCount(msts, shipIds) === 4
    }
  }
)

// 225: 「第五航空戦隊」出撃せよ！
register(
  225,
  class {
    static readonly questType = QuestType.battleMap
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [3, 1, 'B'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(110), // syokaku
        svdata.shipMstIds(111), // zuikaku
      ].flat()
      return shipCount(msts, shipIds) === 2
    }
  }
)

// 226:	南西諸島海域の制海権を握れ！
register(
  226,
  class {
    static readonly questType = QuestType.battleMap
    static max = [5]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [2, 1, 'B'],
      [2, 2, 'B'],
      [2, 3, 'B'],
      [2, 4, 'B'],
      [2, 5, 'B']
    ]
    static formatter(quest: Quest): string {
      return detailFormat(['2-X B勝利以上：'], quest)
    }
  }
)

// 227: 新「三川艦隊」出撃せよ！
register(
  227,
  class {
    static readonly questType = QuestType.battleMap
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [2, 3, 'B'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) !== 6) {
        return false
      }
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(69), // tyoukai
        svdata.shipMstIds(61), // aoba
        svdata.shipMstIds(60), // kako
        svdata.shipMstIds(59), // furutaka
        svdata.shipMstIds(51), // tenryu
        svdata.shipMstIds(123), // kimugasa
      ].flat()
      return shipCount(msts, shipIds) === 6
    }
  }
)

// 228:	海上護衛戦
register(
  228,
  class {
    static readonly questType = QuestType.battleEnemy
    static max = [15]
    static key = QuestKey.infer
    static type = [ApiShipType.sensuikan]
    static formatter(quest: Quest): string {
      return detailFormat(['潜水艦撃沈：'], quest)
    }
  }
)

// 229: 敵東方艦隊を撃滅せよ！
register(
  229,
  class {
    static readonly questType = QuestType.battleMap
    static max = [12]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [4, 1, 'B'],
      [4, 2, 'B'],
      [4, 3, 'B'],
      [4, 4, 'B'],
      [4, 5, 'B']
    ]
    static formatter(quest: Quest): string {
      return detailFormat(['4-X B勝利以上：'], quest)
    }
  }
)

// 230: 敵潜水艦を制圧せよ！
register(
  230,
  class {
    static readonly questType = QuestType.battleEnemy
    static max = [6]
    static key = QuestKey.infer
    static type = [ApiShipType.sensuikan]
    static formatter(quest: Quest): string {
      return detailFormat(['潜水艦撃沈：'], quest)
    }
  }
)

// 231: 「潜水艦隊」出撃せよ！
register(
  231,
  class {
    static readonly questType = QuestType.battleMap
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [2, 3, 'B'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      return shipTypeCount(msts, [ApiShipType.sensuikan, ApiShipType.sensui_kuubo]) >= 2
    }
  }
)

// 232: 「航空水上打撃艦隊」出撃せよ！
register(
  232,
  class {
    static readonly questType = QuestType.battleMap
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [4, 2, 'B'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      if (shipTypeCount(msts, [ApiShipType.koukuu_senkan]) < 2) {
        return false
      }
      return shipTypeCount(msts, [ApiShipType.koujyun]) >= 2
    }
  }
)

// 233: 「第六戦隊」出撃せよ！
register(
  233,
  class {
    static readonly questType = QuestType.battleMap
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [2, 3, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(61), // aoba
        svdata.shipMstIds(60), // kako
        svdata.shipMstIds(59), // furutaka
        svdata.shipMstIds(123), // kimugasa
      ].flat()
      return shipCount(msts, shipIds) === 4
    }
  }
)

// 234: バレンタイン2026特別限定任務
register(
  234,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1]
    static key = QuestKey.yearly
    static maps: QuestMap[] = [
      [1, 3, 'S'],
      [1, 4, 'S'],
      [2, 1, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      const check_ids = [
        svdata.shipMstIds(24), // ooi
        svdata.shipMstIds(99), // kuma
        svdata.shipMstIds(465), // kasima
        svdata.shipMstIds(471), // kamikaze
        svdata.shipMstIds(424), // takanami
        svdata.shipMstIds(675), // suzunami
        svdata.shipMstIds(485), // fujinami
        svdata.shipMstIds(528), // hayanami
        svdata.shipMstIds(484), // hamanami
        svdata.shipMstIds(162), // kamoi
        svdata.shipMstIds(995), // ootomari
      ].flat()
      if (! shipCount([ships[0]], check_ids)) {
        return false
      }
      return shipCount(ships.slice(1), check_ids) >= 2
    }
  }
)

// 235: 近海哨戒を実施せよ！
register(
  235,
  class {
    static readonly questType = QuestType.battleMap
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [1, 2, 'S'],
      [1, 3, 'S'],
      [2, 1, 'S'],
      [2, 2, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      if (! shipTypeCount(msts, ApiShipTypeKeijyunClasses) ) {
        return false
      }
      return shipTypeCount(msts, [ApiShipType.kutikukan, ApiShipType.kaiboukan]) >= 3
    }
  }
)

// 236: 精鋭「二四駆逐隊」出撃せよ！
register(
  236,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [2, 3, 'S'],
      [2, 4, 'S'],
      [5, 1, 'S'],
      [5, 3, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      const ids1 = [
        svdata.shipMstIds(587), // umikaze kaini
      ].flat()
      if (! shipCount([ships[0]], ids1)) {
        return false
      }

      const ids2 = [
        svdata.shipMstIds(457), // yamakaze
        svdata.shipMstIds(459), // kawakaze
        svdata.shipMstIds(47), // suzukaze
      ].flat()
      return shipCount(ships.slice(1), ids2) >= 2
    }
  }
)

// 237: 「羽黒」「神風」、出撃せよ！
register(
  237,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [2, 1, 'S'],
      [2, 2, 'S'],
      [2, 3, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const cnt = deckShipCount(ship_ids);
      if (cnt < 5) {
        return false
      }

      const ships = toShipMsts(svdata, ship_ids)
      const ids = [
        svdata.shipMstIds(65), // haguro
        svdata.shipMstIds(471), // kamikaze
      ].flat()
      if (shipCount(ships, ids) !== 2) {
        return false
      }

      if (cnt === 6 && shipTypeCount(ships, [ApiShipType.kutikukan]) === 5) {
        return true
      }

      return cnt === 5 &&
        shipTypeCount(ships, [ApiShipType.jyuujyun]) === 2 && 
        shipTypeCount(ships, [ApiShipType.kutikukan]) === 3
    }
  }
)

// 238: バレンタイン2026特別限定任務【拡張作戦】
register(
  238,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [2, 2, 2,]
    static key = QuestKey.yearly
    static maps: QuestMapOrCell[] = [
      [2, 2, 'A'],
      [3, 1, 'A'],
      QuestMapCell_7_5_3('A'),
    ]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      const check_ids = [
        svdata.shipMstIds(416), // furukatakaini
        svdata.shipMstIds(142), // kunigasakaini
        svdata.shipMstIds(321), // ooyodokai
        svdata.shipMstIds(972), // i41
        svdata.shipMstIds(535), // Luigi Torelli
        svdata.shipMstIds(944), // heianmaru
        svdata.shipMstIds(639), // jingei
      ].flat()
      if (! shipCount([ships[0]], check_ids)) {
        return false
      }
      return shipCount(ships.slice(1), check_ids) >= 2
    }
  }
)

// 239: 「第八駆逐隊」出撃せよ！
register(
  239,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [2, 3, 'B'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(95), // asasio
        svdata.shipMstIds(97), // mitisio
        svdata.shipMstIds(96), // oosio
        svdata.shipMstIds(98), // arasio
      ].flat()
      return shipCount(msts, shipIds) === 4
    }
  }
)

// 240: 「第十八駆逐隊」出撃せよ！
register(
  240,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [3, 1, 'B'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(49), // kasumi
        svdata.shipMstIds(48), // arare
        svdata.shipMstIds(17), // kagerou
        svdata.shipMstIds(18), // siranui
      ].flat()
      return shipCount(msts, shipIds) === 4
    }
  }
)

// 241:	敵北方艦隊主力を撃滅せよ！
register(
  241,
  class {
    static readonly questType = QuestType.battleMap
    static max = [5]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [3, 3, 'B'],
      [3, 4, 'B'],
      [3, 5, 'B']
    ]
    static formatter(quest: Quest): string {
      return detailFormat(['3-3 3-4 3-5 B勝利以上：'], quest)
    }
  }
)

// 242:	敵東方中枢艦隊を撃破せよ！
register(
  242,
  class {
    static readonly questType = QuestType.battleMap
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [[4, 4, 'B']]
    static formatter(quest: Quest): string {
      return detailFormatOne(['4-4 B勝利以上：'], quest)
    }
  }
)

// 243:	南方海域珊瑚諸島沖の制空権を握れ！
register(
  243,
  class {
    static readonly questType = QuestType.battleMap
    static max = [2]
    static key = QuestKey.infer
    static maps: QuestMap[] = [[5, 2, 'S']]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
  }
)

// 244: 「第三十駆逐隊(第一次)」出撃せよ！
register(
  244,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [3, 2, 'C'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(1), // mutuki
        svdata.shipMstIds(2), // kisaragi
        svdata.shipMstIds(164), // yaroi
        svdata.shipMstIds(31), // motiduki
      ].flat()
      return shipCount(msts, shipIds) === 4
    }
  }
)

// 245: 式の準備！(最終)
register(
  245,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [2, 3, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, _ship_ids: number[]): boolean {
      const deck = svdata.battleDeck
      if (deck?.api_id !== ApiDeckPortId.deck1st) {
        return false
      }
      const msts = toShipMsts(svdata, [deck.api_ship[0]])
      const lv = msts[0].api.api_lv
      return 90 <= lv && lv <= 99
    }
  }
)

// 246: 二人でする初めての任務！
register(
  246,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [4, 3, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, _ship_ids: number[]): boolean {
      const deck = svdata.battleDeck
      if (deck?.api_id !== ApiDeckPortId.deck1st) {
        return false
      }
      const msts = toShipMsts(svdata, [deck.api_ship[0]])
      const lv = msts[0].api.api_lv
      return 100 <= lv 
    }
  }
)

// 247: 「航空戦艦」抜錨せよ！
register(
  247,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [4, 4, 'B'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      return shipTypeCount(msts, [ApiShipType.koukuu_senkan]) >= 2
    }
  }
)

// 248: 「第三十駆逐隊」対潜哨戒！
register(
  248,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [1, 5, 'C'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(1), // mutuki
        svdata.shipMstIds(2), // kisaragi
        svdata.shipMstIds(164), // yaroi
        svdata.shipMstIds(31), // motiduki
      ].flat()
      return shipCount(msts, shipIds) === 4
    }
  }
)

// 249:	「第五戦隊」出撃せよ！
register(
  249,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [[2, 5, 'S']]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const check_ids = [svdata.shipMstIds(62), svdata.shipMstIds(63), svdata.shipMstIds(65)].flat()
      return shipCount(toShipMsts(svdata, ship_ids), check_ids) === 3
    }
  }
)

// 250: 新編「第二航空戦隊」出撃せよ！
register(
  250,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [5, 2, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(196), // hiru kaini
      ].flat()
      if (!shipCount([msts[0]], shipIds)) {
        return false
      }
      const shipIds2 = [
        svdata.shipMstIds(90), // souryu
      ].flat()
      if (!shipCount(msts.slice(1), shipIds2)) {
        return false
      }
      return shipTypeCount(msts.slice(1), [ApiShipType.kutikukan]) >= 2
    }
  }
)

// 251: 精鋭「第二航空戦隊」抜錨せよ！
register(
  251,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [4, 3, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(197), // souryu kaini
      ].flat()
      if (!shipCount([msts[0]], shipIds)) {
        return false
      }
      const shipIds2 = [
        svdata.shipMstIds(196), // hiru kaini
      ].flat()
      if (!shipCount(msts.slice(1), shipIds2)) {
        return false
      }
      return shipTypeCount(msts.slice(1), [ApiShipType.kutikukan]) >= 2
    }
  }
)

// 252: 戦艦「榛名」出撃せよ！
register(
  252,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [5, 1, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, [ship_ids[0]])
      const shipIds = [
        svdata.shipMstIds(954), // karuna kaini
      ].flat()
      return !!shipCount([msts[0]], shipIds)
    }
  }
)

// 253: 「第六〇一航空隊」出撃せよ！
register(
  253,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [5, 2, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(406), // unryu kai
      ].flat()
      return !!shipCount(msts, shipIds)
    }
  }
)

// 254: 「軽空母」戦隊、出撃せよ！
register(
  254,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [2, 1, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const cnt = deckShipCount(ship_ids)
      if (cnt < 5) {
        return false
      }

      const msts = toShipMsts(svdata, ship_ids)
      const keijyun = shipTypeCount(msts, [ApiShipType.keijyun])
      if (keijyun !== 1) {
        return false
      }

      const kutiku = shipTypeCount(msts, [ApiShipType.kutikukan])
      if (kutiku !== 3 && kutiku !== 4) {
        return false
      }

      const keikuubo = shipTypeCount(msts, [ApiShipType.kei_kuubo])
      if (keikuubo !== 1 && keikuubo !== 2) {
        return false
      }
      return (keijyun + kutiku + keikuubo) === cnt
    }
  }
)

// 255: 「水雷戦隊」バシー島沖緊急展開
register(
  255,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [2, 2, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const cnt = deckShipCount(ship_ids)
      if (cnt < 2) {
        return false
      }

      const msts = toShipMsts(svdata, ship_ids)
      if (! shipTypeCount([msts[0]], [ApiShipType.keijyun])) {
        return false
      }

      const keijyun = shipTypeCount(msts, [ApiShipType.keijyun])
      if (keijyun >= 3) {
        return false
      }

      const kutiku = shipTypeCount(msts, [ApiShipType.kutikukan])
      return (keijyun + kutiku) === cnt
    }
  }
)

// 256:	「潜水艦隊」出撃せよ！
register(
  256,
  class {
    static readonly questType = QuestType.battleMap
    static max = [3]
    static key = QuestKey.infer
    static maps: QuestMap[] = [[6, 1, 'S']]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
  }
)

// 257:	「水雷戦隊」南西へ！
register(
  257,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [[1, 4, 'S']]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      if (!isShipType(ships[0].mst, [ApiShipType.keijyun])) {
        return false
      }
      const kutiku = shipTypeCount(ships, [ApiShipType.kutikukan])
      const keijyun = shipTypeCount(ships, [ApiShipType.keijyun])
      if (kutiku + keijyun !== 6) {
        return false
      }
      return keijyun <= 3
    }
  }
)

// 258: 「第二戦隊」抜錨！
register(
  258,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [2]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [4, 2, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      if (shipCategoryCount(msts, [ApiShipCategory.nagato]) !== 2) {
        return false
      }
      return shipCategoryCount(msts, [ApiShipCategory.fusou]) === 2
    }
  }
)

// 259:「水上打撃部隊」南方へ！
register(
  259,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [[5, 1, 'S']]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      if (shipTypeCount(ships, [ApiShipType.keijyun]) < 1) {
        return false
      }
      const check_ids = [
        svdata.shipMstIds(131),
        svdata.shipMstIds(143),
        svdata.shipMstIds(80),
        svdata.shipMstIds(81),
        svdata.shipMstIds(77),
        svdata.shipMstIds(87),
        svdata.shipMstIds(26),
        svdata.shipMstIds(27)
      ].flat()
      return shipCount(ships, check_ids) === 3
    }
  }
)

// 260: 「戦艦部隊」北方海域に突入せよ！
register(
  260,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [3, 5, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      if (shipTypeCount(msts, ApiShipTypeSenkanClasses) < 2) {
        return false
      }
      return shipTypeCount(msts, [ApiShipType.kei_kuubo]) >= 1
    }
  }
)

// 261:	海上輸送路の安全確保に努めよ！
register(
  261,
  class {
    static readonly questType = QuestType.battleMap
    static max = [3]
    static key = QuestKey.infer
    static maps: QuestMap[] = [[1, 5, 'A']]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
  }
)

// 262: 「西村艦隊」南方海域へ進出せよ！
register(
  262,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [5, 1, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(26), // fuso
        svdata.shipMstIds(27), // yamasiro
        svdata.shipMstIds(70), // mogami
        svdata.shipMstIds(43), // sigure
        svdata.shipMstIds(97), // mitisio
      ].flat()
      return shipCount(msts, shipIds) === 5
    }
  }
)

// 263: 「第六戦隊」南西海域へ出撃せよ！
register(
  263,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [2, 5, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(61), // aoba
        svdata.shipMstIds(60), // kako
        svdata.shipMstIds(59), // furutaka
        svdata.shipMstIds(123), // kimugasa
      ].flat()
      return shipCount(msts, shipIds) === 4
    }
  }
)

// 264:「空母機動部隊」西へ！
register(
  264,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [[4, 2, 'S']]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      if (shipTypeCount(ships, ApiShipTypeKuboClasses) < 2) {
        return false
      }
      return shipTypeCount(ships, [ApiShipType.kutikukan]) >= 2
    }
  }
)

// 265:	海上護衛強化月間
register(
  265,
  class {
    static readonly questType = QuestType.battleMap
    static max = [10]
    static key = QuestKey.infer
    static maps: QuestMap[] = [[1, 5, 'A']]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
  }
)

// 266:「水上反撃部隊」突入せよ！
register(
  266,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [[2, 5, 'S']]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      if (!isShipType(ships[0].mst, [ApiShipType.kutikukan])) {
        return false
      }
      if (shipTypeCount(ships, [ApiShipType.keijyun]) !== 1) {
        return false
      }
      if (shipTypeCount(ships, [ApiShipType.jyuujyun]) !== 1) {
        return false
      }
      return shipTypeCount(ships, [ApiShipType.kutikukan]) === 4
    }
  }
)

// 267: 「第十一駆逐隊」出撃せよ！
register(
  267,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [2, 3, 'B'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(9), // fubuki
        svdata.shipMstIds(10), // shirayuki
        svdata.shipMstIds(11), // miyuki
        svdata.shipMstIds(32), // hatuyuki
        svdata.shipMstIds(33), // murakumo
      ].flat()
      return shipCount(msts, shipIds) >= 4
    }
  }
)

// 268: 「第十一駆逐隊」対潜哨戒！
register(
  268,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [1, 5, 'C'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(9), // fubuki
        svdata.shipMstIds(10), // shirayuki
        svdata.shipMstIds(11), // miyuki
        svdata.shipMstIds(32), // hatuyuki
        svdata.shipMstIds(33), // murakumo
      ].flat()
      return shipCount(msts, shipIds) >= 4
    }
  }
)

// 269: 「第二一駆逐隊」出撃せよ！
register(
  269,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [3, 1, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(38), // hatuharu
        svdata.shipMstIds(39), // nenohi
        svdata.shipMstIds(40), // wakaba
        svdata.shipMstIds(41), // hatusimo
      ].flat()
      return shipCount(msts, shipIds) === 4
    }
  }
)

// 270: 「第二二駆逐隊」出撃せよ！
register(
  270,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [1, 4, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(28), // satuki
        svdata.shipMstIds(29), // fumituki
        svdata.shipMstIds(6), // nagatuki
      ].flat()
      if (shipCount(msts, shipIds) !== 3) {
        return false
      }
      return shipTypeCount(msts, [ApiShipType.kutikukan]) >= 4
    }
  }
)

// 271: 「那智戦隊」抜錨せよ！
register(
  271,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [2, 2, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const ids1 = [
        svdata.shipMstIds(63), // nachi
      ].flat()
      if (!shipCount([msts[0]], ids1)) {
        return false
      }
      const ids2 = [
        svdata.shipMstIds(41), // hatusimo
        svdata.shipMstIds(49), // kasumi
        svdata.shipMstIds(15), // akebono
        svdata.shipMstIds(16), // usio        
      ].flat()
      return shipCount(msts.slice(1), ids2) === 4
    }
  }
)

// 272: 「改装防空重巡」出撃せよ！
register(
  272,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [2, 3, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const ids1 = [
        svdata.shipMstIds(271), // maya kai
      ].flat()
      if (!shipCount(msts, ids1)) {
        return false
      }

      if (! shipTypeCount(msts, [ApiShipType.keijyun])) {
        return false
      }
      return shipTypeCount(msts, [ApiShipType.kutikukan]) >= 2
    }
  }
)

// 273: 新編「三川艦隊」ソロモン方面へ！
register(
  273,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [5, 1, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds1 = [
        svdata.shipMstIds(427), // tyoukai kaini
      ].flat()
      if (!shipCount([msts[0]], shipIds1)) {
        return false
      }

      const shipIds2 = [
        svdata.shipMstIds(59), // furutaka
        svdata.shipMstIds(60), // kako
        svdata.shipMstIds(61), // aoba
        svdata.shipMstIds(123), // kimugasa
        svdata.shipMstIds(115), // yuubari 
        svdata.shipMstIds(51), // tenryu
      ].flat()
      return shipCount(msts.slice(1), shipIds2) === 5
    }
  }
)

// 274: 「第六駆逐隊」対潜哨戒なのです！
register(
  274,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [1, 5, 'C'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(34), // akatuki
        svdata.shipMstIds(35), // hibiki
        svdata.shipMstIds(36), // ikaduti
        svdata.shipMstIds(37), // inazuma
      ].flat()
      return shipCount(msts, shipIds) === 4
    }
  }
)

// 275: 抜錨！「第十八戦隊」
register(
  275,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [2, 3, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      return shipCategoryCount(msts, [ApiShipCategory.tenryu]) >= 2
    }
  }
)

// 276: 海上突入部隊、進発せよ！
register(
  276,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [5, 1, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) !== 6) {
        return false
      }

      const msts = toShipMsts(svdata, ship_ids)
      const ids = [
        svdata.shipMstIds(85), // kirisima
        svdata.shipMstIds(86), // hiei
        svdata.shipMstIds(21), // nagara
        svdata.shipMstIds(34), // akatuki
        svdata.shipMstIds(36), // ikaduti
        svdata.shipMstIds(37), // inazuma
      ].flat()
      return shipCount(msts, ids) === 6
    }
  }
)

// 277: 「第六駆逐隊」対潜哨戒を徹底なのです！
register(
  277,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [1, 5, 'A'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(34), // akatuki
        svdata.shipMstIds(35), // hibiki
        svdata.shipMstIds(36), // ikaduti
        svdata.shipMstIds(37), // inazuma
      ].flat()
      return shipCount(msts, shipIds) === 4
    }
  }
)

// 278: 「第一水雷戦隊」ケ号作戦、突入せよ！
register(
  278,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [3, 2, 'B'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) < 6) {
        return false
      }

      const msts = toShipMsts(svdata, ship_ids)
      const shipIds1 = [
        svdata.shipMstIds(114), // abukuma
      ].flat()
      if (!shipCount([msts[0]], shipIds1)) {
        return false
      }

      const shipIds2 = [
        svdata.shipMstIds(35), // hibiki
        svdata.shipMstIds(41), // hatusimo
        svdata.shipMstIds(40), // wakaba
        svdata.shipMstIds(46), // samidare
        svdata.shipMstIds(50), // simakaze
      ].flat()
      return shipCount(msts.slice(1), shipIds2) === 5
    }
  }
)

// 279: 「第一水雷戦隊」北方ケ号作戦、再突入！
register(
  279,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [3, 2, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) < 6) {
        return false
      }

      const msts = toShipMsts(svdata, ship_ids)
      const shipIds1 = [
        svdata.shipMstIds(200), // abukuma kaini
      ].flat()
      if (!shipCount([msts[0]], shipIds1)) {
        return false
      }

      const shipIds2 = [
        svdata.shipMstIds(35), // hibiki
        svdata.shipMstIds(133), // yuugumo
        svdata.shipMstIds(135), // naganami
        svdata.shipMstIds(132), // akigumo
        svdata.shipMstIds(50), // simakaze
      ].flat()
      return shipCount(msts.slice(1), shipIds2) === 5
    }
  }
)

// 280: 兵站線確保！海上警備を強化実施せよ！
register(
  280,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [1, 2, 'S'],
      [1, 3, 'S'],
      [1, 4, 'S'],
      [2, 1, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      if (
        shipTypeCount(ships, [
          ApiShipType.kei_kuubo,
          ApiShipType.renjyun,
          ApiShipType.raijyun,
          ApiShipType.keijyun
        ]) < 1
      ) {
        return false
      }
      return shipTypeCount(ships, [ApiShipType.kutikukan, ApiShipType.kaiboukan]) >= 3
    }
  }
)

// 281: 精鋭無比「第一戦隊」まかり通る！
register(
  281,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [2, 2, 'S'],
      [3, 5, 'S'],
      [4, 5, 'S'],
      [5, 1, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds1 = [
        svdata.shipMstIds(541), // nagato kaini
      ].flat()
      if (!shipCount([msts[0]], shipIds1)) {
        return false
      }

      const shipIds2 = [
        svdata.shipMstIds(276), // mutu kai
      ].flat()
      return !!shipCount([msts[1]], shipIds2)
    }
  }
)

// 282: 精鋭無比「第一戦隊」まかり通る！【拡張作戦】
register(
  282,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [2, 5, 'S'],
      [5, 5, 'S'],
      [6, 4, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds1 = [
        svdata.shipMstIds(541), // nagato kaini
      ].flat()
      if (!shipCount([msts[0]], shipIds1)) {
        return false
      }

      const shipIds2 = [
        svdata.shipMstIds(276), // mutu kai
      ].flat()
      return !!shipCount([msts[1]], shipIds2)
    }
  }
)

// 283: 精強！「第一航空戦隊」出撃せよ！
register(
  283,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 2]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [4, 5, 'S'],
      [5, 2, 'S'],
      [6, 5, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) < 2) {
        return false
      }

      const msts = toShipMsts(svdata, [ship_ids[0], ship_ids[1]])
      const shipIds1 = [
        svdata.shipMstIds(594), // akagi kaini
      ].flat()
      if (!shipCount([msts[0]], shipIds1)) {
        return false
      }

      const shipIds2 = [
        svdata.shipMstIds(84), // kaga
      ].flat()
      return !!shipCount([msts[1]], shipIds2)
    }
  }
)

// 284:	南西諸島方面「海上警備行動」発令！
register(
  284,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [1, 4, 'S'],
      [2, 1, 'S'],
      [2, 2, 'S'],
      [2, 3, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      if (
        shipTypeCount(ships, [
          ApiShipType.kei_kuubo,
          ApiShipType.keijyun,
          ApiShipType.renjyun,
          ApiShipType.raijyun
        ]) < 1
      ) {
        return false
      }
      return shipTypeCount(ships, [ApiShipType.kutikukan, ApiShipType.kaiboukan]) >= 3
    }
  }
)

// 285: 「空母機動部隊」北方海域に進出せよ！
register(
  285,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [3, 5, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, [ship_ids[0]])
      return !! shipTypeCount([msts[0]], [ApiShipType.soukou_kuubo, ApiShipType.seiki_kuubo])
    }
  }
)

// 286: 鎮守府正面の対潜哨戒を強化せよ！
register(
  286,
  class {
    static readonly questType = QuestType.battleMap
    static max = [4]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [1, 5, 'A'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
  }
)

// 287: 「第五航空戦隊」珊瑚諸島沖に出撃せよ！
register(
  287,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [5, 2, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(110), // syokaku
        svdata.shipMstIds(111), // zuikaku
        svdata.shipMstIds(93), // oboro
        svdata.shipMstIds(132), // akigumo
      ].flat()
      return shipCount(msts, shipIds) === 4
    }
  }
)

// 288: 新編「第二一戦隊」北方へ出撃せよ！
register(
  288,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [3, 1, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(192), // nachi kaini
        svdata.shipMstIds(193), // asigara kaini
        svdata.shipMstIds(100), // tama
        svdata.shipMstIds(101), // kiso
      ].flat()
      return shipCount(msts, shipIds) === 4
    }
  }
)

// 289: 「第十六戦隊(第一次)」出撃せよ！
register(
  289,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [2, 2, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds1 = [
        svdata.shipMstIds(64), // asigara
      ].flat()
      if (!shipCount([msts[0]], shipIds1)) {
        return false
      }

      const shipIds2 = [
        svdata.shipMstIds(100), // tama
        svdata.shipMstIds(21), // nagara
      ].flat()

      return shipCount(msts.slice(1), shipIds2) === 2
    }
  }
)

// 290: 「比叡」の出撃
register(
  290,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [5, 3, 'S'],
      [5, 4, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, [ship_ids[0]])
      const ids = [
        svdata.shipMstIds(86), // hiei
      ].flat()
      return !!shipCount([msts[0]], ids)
    }
  }
)

// 291: 艦隊司令部の強化 【実施段階】
register(
  291,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [2, 2, 2]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [2, 3, 'S'],
      [3, 3, 'S'],
      [4, 1, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const ids1 = [
        svdata.shipMstIds(183), // ooyodo
      ].flat()
      if (!shipCount([msts[0]], ids1)) {
        return false
      }

      const ids2 = [
        svdata.shipMstIds(182), // akasi
      ].flat()
      const akasi = shipCount(msts.slice(1), ids2)
      const suibo = shipTypeCount(msts.slice(1), [ApiShipType.suibo])
      return (akasi + suibo) >= 1
    }
  }
)

// 292: 重改装高速戦艦「金剛改二丙」、南方突入！
register(
  292,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [2, 2, 2, 2]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [5, 1, 'S'],
      [5, 3, 'S'],
      [5, 4, 'S'],
      [5, 5, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const ids1 = [
        svdata.shipMstIds(591), // kongou kainihei
      ].flat()
      if (!shipCount([msts[0]], ids1)) {
        return false
      }

      if (! shipCategoryCount(msts, [ApiShipCategory.kongou])) {
        return false
      }
      return shipTypeCount(msts, [ApiShipType.kutikukan]) >= 2
    }
  }
)

// 293: 「第三航空戦隊」南西諸島防衛線に出撃！
register(
  293,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [1, 4, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds1 = [
        svdata.shipMstIds(112), // zuikaku kai
      ].flat()
      if (!shipCount([msts[0]], shipIds1)) {
        return false
      }

      const shipIds2 = [
        svdata.shipMstIds(116), // zuihou
        svdata.shipMstIds(108), // titose kou
        svdata.shipMstIds(109), // tiyoda kou
      ].flat()

      return shipCount(msts.slice(1), shipIds2) === 3
    }
  }
)

// 294: 「小沢艦隊」出撃せよ！
register(
  294,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [2, 4, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) < 6) {
        return false
      }

      const msts = toShipMsts(svdata, ship_ids)
      const shipIds1 = [
        svdata.shipMstIds(112), // zuikaku kai
      ].flat()
      if (!shipCount([msts[0]], shipIds1)) {
        return false
      }

      const shipIds2 = [
        svdata.shipMstIds(117), // zuihou kai
        svdata.shipMstIds(108), // titose kou
        svdata.shipMstIds(109), // tiyoda kou
        svdata.shipMstIds(82), // ise kai
        svdata.shipMstIds(88), // hyuga kai
      ].flat()

      return shipCount(msts.slice(1), shipIds2) === 5
    }
  }
)

// 295: 「小沢艦隊」出撃せよ！
register(
  295,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [2, 3, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds1 = [
        svdata.shipMstIds(53), // natori
      ].flat()
      if (!shipCount([msts[0]], shipIds1)) {
        return false
      }

      const shipIds2 = [
        svdata.shipMstIds(22), // isuzu
        svdata.shipMstIds(113), // kinu
      ].flat()
      return shipCount(msts.slice(1), shipIds2) === 2
    }
  }
)

// 296: 新編成航空戦隊、北方へ進出せよ！
register(
  296,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [3, 3, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) !== 6) {
        return false
      }

      const msts = toShipMsts(svdata, ship_ids)
      if (shipTypeCount(msts, ApiShipTypeKuboClasses) !== 2) {
        return false
      }
      if (shipTypeCount(msts, [ApiShipType.koukuu_senkan, ApiShipType.koujyun]) !== 2) {
        return false
      }
      return shipTypeCount(msts, [ApiShipType.kutikukan]) === 2
    }
  }
)

// 297: 「礼号作戦」実施せよ！
register(
  297,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [2, 5, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds1 = [
        svdata.shipMstIds(49), // kasumi
      ].flat()
      if (!shipCount([msts[0]], shipIds1)) {
        return false
      }

      const shipIds2 = [
        svdata.shipMstIds(64), // asigara
        svdata.shipMstIds(183), // ooyodo
        svdata.shipMstIds(425), // asasimo
        svdata.shipMstIds(410), // kiyosimo
      ].flat()
      return shipCount(msts.slice(1), shipIds2) === 4
    }
  }
)

// 298: 「第七駆逐隊」、南西諸島を駆ける！
register(
  298,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [2, 1, 'S'],
      [2, 2, 'S'],
      [2, 3, 'S'],
      [2, 4, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      const check_ids = [
        svdata.shipMstIds(15), // akebono
        svdata.shipMstIds(16), // usio
        svdata.shipMstIds(93), // oboro
        svdata.shipMstIds(94), // sazanami
      ].flat()
      return shipCount(ships, check_ids) >= 2
    }
  }
)

// 299: 近海の警戒監視と哨戒活動を強化せよ！
register(
  299,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [1, 2, 'S'],
      [1, 3, 'S'],
      [1, 4, 'S'],
      [2, 1, 'S'],
      [2, 2, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      if (! shipTypeCount(ships, [ApiShipType.keijyun])) {  
        return false
      }
      return shipTypeCount(ships, [ApiShipType.kutikukan, ApiShipType.kaiboukan]) >= 2
    }
  }
)

// 301: はじめての「演習」！
register(
  301,
  class {
    static readonly questType = QuestType.practice
    static max = [1]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = ''
    static formatter(quest: Quest): string {
      return detailFormatOne(['演習：'], quest)
    }
  }
)

// 302: 大規模演習
register(
  302,
  class {
    static readonly questType = QuestType.practice
    static max = [20]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'B'
    static formatter(quest: Quest): string {
      return detailFormat(['演習勝利：'], quest)
    }
  }
)

// 303:「演習」で練度向上！
register(
  303,
  class {
    static readonly questType = QuestType.practice
    static max = [3]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = ''
    static formatter(quest: Quest): string {
      return detailFormat(['演習：'], quest)
    }
  }
)

// 304:「演習」で他提督を圧倒せよ！
register(
  304,
  class {
    static readonly questType = QuestType.practice
    static max = [5]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'B'
    static formatter(quest: Quest): string {
      return detailFormat(['演習勝利：'], quest)
    }
  }
)

// 306:式の準備！(その弐)
register(
  306,
  class {
    static readonly questType = QuestType.practice
    static max = [2]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'B'
    static formatter(quest: Quest): string {
      return detailFormat(['演習勝利：'], quest)
    }
  }
)

// 307:艦隊の練度向上に努めよ！
register(
  307,
  class {
    static readonly questType = QuestType.practice
    static max = [3]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'B'
    static formatter(quest: Quest): string {
      return detailFormat(['演習勝利：'], quest)
    }
  }
)

// 308:演習を強化、艦隊の練度向上に努めよ！
register(
  308,
  class {
    static readonly questType = QuestType.practice
    static max = [4]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'B'
    static formatter(quest: Quest): string {
      return detailFormat(['演習勝利：'], quest)
    }
  }
)

// 309:北方再突入に備え、練度向上に努めよ！
register(
  309,
  class {
    static readonly questType = QuestType.practice
    static max = [4]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'B'
    static formatter(quest: Quest): string {
      return detailFormat(['演習勝利：'], quest)
    }
  }
)

// 311: 精鋭艦隊演習
register(
  311,
  class {
    static readonly questType = QuestType.practice
    static max = [7]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'B'
    static formatter(quest: Quest): string {
      return detailFormat(['演習勝利：'], quest)
    }
  }
)

// 312: 上陸部隊演習
register(
  312,
  class {
    static readonly questType = QuestType.practice
    static max = [4]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'B'
    static formatter(quest: Quest): string {
      return detailFormat(['演習勝利：'], quest)
    }
  }
)

// 313: 秋季大演習
register(
  313,
  class {
    static readonly questType = QuestType.practice
    static max = [8]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'B'
    static formatter(quest: Quest): string {
      return detailFormat(['演習勝利：'], quest)
    }
  }
)

// 314: 冬季大演習
register(
  314,
  class {
    static readonly questType = QuestType.practice
    static max = [8]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'B'
    static formatter(quest: Quest): string {
      return detailFormat(['演習勝利：'], quest)
    }
  }
)

// 315: 春季大演習
register(
  315,
  class {
    static readonly questType = QuestType.practice
    static max = [8]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'B'
    static formatter(quest: Quest): string {
      return detailFormat(['演習勝利：'], quest)
    }
  }
)

// 316: 輸送部隊の練度向上に努めよ！
register(
  316,
  class {
    static readonly questType = QuestType.practice
    static max = [4]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'B'
    static formatter(quest: Quest): string {
      return detailFormat(['演習勝利：'], quest)
    }
  }
)

// 317: 甲型駆逐艦の戦力整備計画
// todo practice and battle map
//register(
//  317,
//)

// 318: 給糧艦「伊良湖」の支援
register(
  318,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [3]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'B'
    static formatter(quest: Quest): string {
      return detailFormat(['演習勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      if (2 > shipTypeCount(ships, [ApiShipType.keijyun])) {
        return false
      }
      return true
    }
  }
)

// 319: 精鋭「第二一駆」、猛特訓！
register(
  319,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [4]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'B'
    static formatter(quest: Quest): string {
      return detailFormat(['演習勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(240), // wakaba kai
        svdata.shipMstIds(326), // hatuharu kaini
        svdata.shipMstIds(419), // hatusimom kaini
      ].flat()
      return shipCount(msts, shipIds) >= 3
    }
  }
)

// 320: 駆逐隊、特訓始め！
register(
  320,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [4]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'B'
    static formatter(quest: Quest): string {
      return detailFormat(['演習勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      return shipTypeCount(msts, [ApiShipType.kutikukan]) >= 4
    }
  }
)

// 321: 五周年任務【肆：演習】

// 322: 海防艦、演習始め！
register(
  322,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [2]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'B'
    static formatter(quest: Quest): string {
      return detailFormat(['演習勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      if (! shipTypeCount([msts[0]], [ApiShipType.kaiboukan])) {
        return false
      }
      return shipTypeCount(msts.slice(1), [ApiShipType.kutikukan]) >= 2
    }
  }
)

// 323: 最精鋭甲型駆逐艦、特訓始め！
register(
  323,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [4]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'B'
    static formatter(quest: Quest): string {
      return detailFormat(['演習勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const filtered = msts.filter(mst => 
        shipCategoryCount([mst], [ApiShipCategory.kagerou, ApiShipCategory.yuugumo]) && mst.api.api_lv >= 70)
      return filtered.length >= 4
    }
  }
)

// 324: 戦闘航空母艦一番艦、演習始め！
register(
  324,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [3]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'B'
    static formatter(quest: Quest): string {
      return detailFormat(['演習勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(553), // ise kaini
      ].flat()
      if (! shipCount([msts[0]], shipIds)) {
        return false
      }
      
      return shipTypeCount(msts.slice(1), [ApiShipType.kutikukan]) >= 2
    }
  }
)

// 325: 改夕雲型、演習始め！
register(
  325,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [4]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'B'
    static formatter(quest: Quest): string {
      return detailFormat(['演習勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(542), // yuugumo kaini
        svdata.shipMstIds(543), // naganami kaini
      ].flat()
      return shipCount(msts, shipIds) === 2
    }
  }
)

// 326: 春季大演習
register(
  326,
  class {
    static readonly questType = QuestType.practice
    static max = [8]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'B'
    static formatter(quest: Quest): string {
      return detailFormat(['演習勝利：'], quest)
    }
  }
)

// 327: 朝潮型集合！特訓始め！
register(
  327,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [4]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'B'
    static formatter(quest: Quest): string {
      return detailFormat(['演習勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      return shipCategoryCount(msts, [ApiShipCategory.asasio]) >= 4
    }
  }
)

// 328: 精強「十七駆」、猛特訓！
register(
  328,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [4]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'B'
    static formatter(quest: Quest): string {
      return detailFormat(['演習勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(557), // isokaze otukai
        svdata.shipMstIds(558), // hamakaze otukai
        svdata.shipMstIds(556), // urakaze tyoukai
        svdata.shipMstIds(559), // tanikaze tyoukai
      ].flat()
      return shipCount(msts, shipIds) === 4
    }
  }
)

// 329: 【節分任務:枡】節分演習！二〇二六 
register(
  329,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [3]
    static key = QuestKey.infer
    static need_win_rank: PracticeWinRank = 'B'
    static formatter(quest: Quest): string {
      return detailFormat(['演習勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      if (shipTypeCount([ships[0]], [ApiShipType.kaiboukan])) {
        return  shipTypeCount(ships.slice(1), [ApiShipType.kaiboukan]) >= 2
      }
      if (shipTypeCount([ships[0]], [ApiShipType.sensuibokan])) {
        return shipTypeCount(ships.slice(1), [ApiShipType.sensuikan, ApiShipType.sensui_kuubo])  >= 3
      }
      if (shipTypeCount([ships[0]], [ApiShipType.hokyuukan, ApiShipType.yourikukan])) {
        return shipTypeCount(ships.slice(1), [ApiShipType.kutikukan]) >= 5
      }
      return false
    }
  }
)

// 330:	空母機動部隊、演習始め！
register(
  330,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [4]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'B'
    static formatter(quest: Quest): string {
      return detailFormat(['演習勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      if (!isShipType(ships[0].mst, ApiShipTypeKuboClasses)) {
        return false
      }
      if (shipTypeCount(ships, ApiShipTypeKuboClasses) < 2) {
        return false
      }
      return shipTypeCount(ships, [ApiShipType.kutikukan]) >= 2
    }
  }
)

// 331: 艦載機演習
register(
  331,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [3]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'A'
    static formatter(quest: Quest): string {
      return detailFormat(['演習A勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      if (! shipTypeCount([msts[0]], [ApiShipType.seiki_kuubo, ApiShipType.soukou_kuubo])) {
        return false
      }
      if (! shipTypeCount(msts.slice(1), [ApiShipType.seiki_kuubo, ApiShipType.soukou_kuubo])) {
        return false
      }
      return shipTypeCount(msts.slice(1), [ApiShipType.kutikukan]) >= 2
    }
  }
)

// 332: 六周年記念演習
register(
  332,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [4]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'S'
    static formatter(quest: Quest): string {
      return detailFormat(['演習S勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      if (! shipTypeCount(msts, [ApiShipType.keijyun])) {
        return false
      }
      return shipTypeCount(msts, [ApiShipType.kutikukan, ApiShipType.kaiboukan]) >= 3
    }
  }
)

// 333: 航空戦隊演習(その壱)
register(
  333,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [3]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'S'
    static formatter(quest: Quest): string {
      return detailFormat(['演習S勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      if (shipTypeCount(msts, ApiShipTypeKuboClasses) < 3) {
        return false
      }
      return shipTypeCount(msts, [ApiShipType.kutikukan]) >= 2
    }
  }
)

// 334: 航空戦隊演習(その弐)
register(
  334,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [6]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'S'
    static formatter(quest: Quest): string {
      return detailFormat(['演習S勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      if (shipTypeCount(msts, ApiShipTypeKuboClasses) < 3) {
        return false
      }
      return shipTypeCount(msts, [ApiShipType.kutikukan]) >= 2
    }
  }
)

// 335: 新しき盾
register(
  335,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [3]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'S'
    static formatter(quest: Quest): string {
      return detailFormat(['演習S勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(68), // maya
        svdata.shipMstIds(65), // haguro
      ].flat()
      return shipCount(msts, shipIds) === 2
    }
  }
)

// 336: 輸送船団演習
register(
  336,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [4]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'A'
    static formatter(quest: Quest): string {
      return detailFormat(['演習A勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      return shipTypeCount(msts, [ApiShipType.hokyuukan, ApiShipType.yourikukan, ApiShipType.kaiboukan]) >= 2
    }
  }
)

// 337:	「十八駆」演習！
register(
  337,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [3]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'S'
    static formatter(quest: Quest): string {
      return detailFormat(['演習S勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      const check_ids = [
        svdata.shipMstIds(49),
        svdata.shipMstIds(48),
        svdata.shipMstIds(17),
        svdata.shipMstIds(18)
      ].flat()
      return shipCount(ships, check_ids) === 4
    }
  }
)

// 338:	睦月型集合！演習始め！
register(
  338,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [4]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'B'
    static formatter(quest: Quest): string {
      return detailFormat(['演習勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      return shipCategoryCount(ships, [ApiShipCategory.mutuki]) >= 4
    }
  }
)

// 339:	「十九駆」演習！
register(
  339,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [3]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'S'
    static formatter(quest: Quest): string {
      return detailFormat(['演習S勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      const check_ids = [
        svdata.shipMstIds(12), // isonami
        svdata.shipMstIds(486), // uranami
        svdata.shipMstIds(13), // ayanami
        svdata.shipMstIds(14) // sikinami
      ].flat()
      return shipCount(ships, check_ids) === 4
    }
  }
)

// 340:	【桃の節句任務】桃の節句艦隊演習2026
register(
  340,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [3]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'S'
    static formatter(quest: Quest): string {
      return detailFormat(['演習S勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      if (shipTypeCount(msts, [ApiShipType.kaiboukan]) >= 3) {
        return true
      }
      return shipTypeCount(msts, [ApiShipType.kutikukan]) >= 4
    }
  }
)

// 342:	小艦艇群演習強化任務
register(
  342,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [4]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'A'
    static formatter(quest: Quest): string {
      return detailFormat(['演習A勝利以上：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      const kutikuOrKaibou = shipTypeCount(ships, [ApiShipType.kutikukan, ApiShipType.kaiboukan])
      if (kutikuOrKaibou >= 4) {
        return true
      }
      const keijyun = shipTypeCount(ships, [
        ApiShipType.keijyun,
        ApiShipType.renjyun,
        ApiShipType.raijyun
      ])
      return kutikuOrKaibou >= 3 && keijyun >= 1
    }
  }
)

// 343:	航空母艦演習
register(
  343,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [4]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'B'
    static formatter(quest: Quest): string {
      return detailFormat(['演習勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      if (! shipTypeCount([msts[0]], [ApiShipType.seiki_kuubo])) {
        return false
      }
      if (! shipTypeCount(msts.slice(1), [ApiShipType.seiki_kuubo])) {
        return false
      }
      return shipTypeCount(msts.slice(1), [ApiShipType.kutikukan]) >= 2
    }
  }
)

// 344:	「第十方面艦隊」演習！
register(
  344,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [4]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'A'
    static formatter(quest: Quest): string {
      return detailFormat(['演習A勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const check_ids = [
        svdata.shipMstIds(65), // haguro
        svdata.shipMstIds(64), // asigara
        svdata.shipMstIds(471), // kamikaze        
      ].flat()
      return shipCount(msts, check_ids) >= 2
    }
  }
)

// 345:	演習ティータイム！
register(
  345,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [4]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'A'
    static formatter(quest: Quest): string {
      return detailFormat(['演習A勝利以上：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      const check_ids = [
        svdata.shipMstIds(439),
        svdata.shipMstIds(78),
        svdata.shipMstIds(515),
        svdata.shipMstIds(571),
        svdata.shipMstIds(519),
        svdata.shipMstIds(520)
      ].flat()
      return shipCount(ships, check_ids) === 4
    }
  }
)

// 346:	最精鋭！主力オブ主力、演習開始！
register(
  346,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [4]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'A'
    static formatter(quest: Quest): string {
      return detailFormat(['演習A勝利以上：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      const check_ids = [542, 563, 564, 648]
      return shipCount(ships, check_ids) === 4
    }
  }
)

// 347: 奇跡の駆逐艦
register(
  347,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [4]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'S'
    static formatter(quest: Quest): string {
      return detailFormat(['演習S勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (!isShipIds(svdata, ship_ids[0], svdata.shipMstIds(20))) {
        return false
      }
      const ships = toShipMsts(svdata, ship_ids)
      return shipTypeCount(ships, [ApiShipType.kutikukan]) >= 4
    }
  }
)

// 348:	「精鋭軽巡」演習！
register(
  348,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [4]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'A'
    static formatter(quest: Quest): string {
      return detailFormat(['演習A勝利以上：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      if (!isShipType(ships[0].mst, [ApiShipType.keijyun, ApiShipType.renjyun])) {
        return false
      }
      if (shipTypeCount(ships, [ApiShipType.keijyun, ApiShipType.renjyun]) < 3) {
        return false
      }
      return shipTypeCount(ships, [ApiShipType.kutikukan]) >= 2
    }
  }
)

// 349:	バレンタイン2026限定任務【スイーツ演習】
register(
  349,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [5]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'S'
    static formatter(quest: Quest): string {
      return detailFormat(['演習S勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      const check_ids = [
        svdata.shipMstIds(973), // Thonburi
        svdata.shipMstIds(615), // Helena
        svdata.shipMstIds(962), // Mogador
        svdata.shipMstIds(574), // Gotland
        svdata.shipMstIds(613), // Perth
        svdata.shipMstIds(372), // Commandant Teste
        svdata.shipMstIds(15), // 曙
        svdata.shipMstIds(93), // 朧
        svdata.shipMstIds(996), // 野埼
      ].flat()
      if (! shipCount([ships[0]], check_ids)) {
        return false
      }
      return shipCount(ships.slice(1), check_ids) >= 2
    }
  }
)

// 350: 精鋭「第七駆逐隊」演習開始！
register(
  350,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [3]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'A'
    static formatter(quest: Quest): string {
      return detailFormat(['演習A勝利以上：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      const check_ids = [
        svdata.shipMstIds(93),
        svdata.shipMstIds(15),
        svdata.shipMstIds(94),
        svdata.shipMstIds(16)
      ].flat()
      return shipCount(ships, check_ids) === 4
    }
  }
)

// 351: 改装航空巡洋艦「最上」、進発せよ！
register(
  351,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [4]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'A'
    static formatter(quest: Quest): string {
      return detailFormat(['演習A勝利以上：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (!isShipIds(svdata, ship_ids[0], [501, 506])) {
        return false
      }
      const ships = toShipMsts(svdata, ship_ids)
      return shipTypeCount(ships, [ApiShipType.kutikukan]) >= 3
    }
  }
)

// 352: 改装「矢矧」、精鋭水雷戦隊旗艦演習！
register(
  352,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [4]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'S'
    static formatter(quest: Quest): string {
      return detailFormat(['演習S勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (!isShipIds(svdata, ship_ids[0], [663, 668])) {
        return false
      }
      const ships = toShipMsts(svdata, ship_ids)
      return shipTypeCount(ships, [ApiShipType.kutikukan]) >= 4
    }
  }
)

// 353: 「巡洋艦戦隊」演習！
register(
  353,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [5]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'B'
    static formatter(quest: Quest): string {
      return detailFormat(['演習B勝利以上：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      if (!isShipType(ships[0].mst, [ApiShipType.jyuujyun, ApiShipType.koujyun])) {
        return false
      }
      if (shipTypeCount(ships, [ApiShipType.jyuujyun, ApiShipType.koujyun]) !== 4) {
        return false
      }
      return shipTypeCount(ships, [ApiShipType.kutikukan]) === 2
    }
  }
)

// 354: 「改装特務空母」任務部隊演習！
register(
  354,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [4]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'S'
    static formatter(quest: Quest): string {
      return detailFormat(['演習S勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (!isShipIds(svdata, ship_ids[0], [707])) {
        return false
      }
      const ships = toShipMsts(svdata, ship_ids)
      const count = shipCategoryCount(ships, [ApiShipCategory.fletcher, ApiShipCategory.johnCButle])
      return count >= 2
    }
  }
)

// 355: 精鋭「第十五駆逐隊」第一小隊演習！
register(
  355,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [4]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'S'
    static formatter(quest: Quest): string {
      return detailFormat(['演習S勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const mstIds = [568, 670]
      if (!isShipIds(svdata, ship_ids[0], mstIds)) {
        return false
      }
      const second = ship_ids[1]
      if (!second || !isShipIds(svdata, second, mstIds)) {
        return false
      }
      return true
    }
  }
)

// 356:	精鋭「第十九駆逐隊」演習！
register(
  356,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [3]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'S'
    static formatter(quest: Quest): string {
      return detailFormat(['演習S勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      const check_ids = [
        svdata.shipMstIds(666),
        svdata.shipMstIds(647),
        svdata.shipMstIds(195),
        svdata.shipMstIds(627)
      ].flat()
      return shipCount(ships, check_ids) === 4
    }
  }
)

// 357: 「大和型戦艦」第一戦隊演習、始め！
register(
  357,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [3]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'S'
    static formatter(quest: Quest): string {
      return detailFormat(['演習S勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) < 5) {
        return false
      }
      const ships = toShipMsts(svdata, ship_ids)
      const check_ids = [svdata.shipMstIds(131), svdata.shipMstIds(143)].flat()
      if (shipCount(ships, check_ids) < 2) {
        return false
      }
      if (shipTypeCount(ships, [ApiShipType.kutikukan]) < 2) {
        return false
      }
      return shipTypeCount(ships, [ApiShipType.keijyun]) >= 1
    }
  }
)

// 358: 「Taffy Ⅲ」 This is a drill!
register(
  358,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [4]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'S'
    static formatter(quest: Quest): string {
      return detailFormat(['演習S勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      const check_ids = [
        svdata.shipMstIds(544),
        svdata.shipMstIds(562),
        svdata.shipMstIds(561)
      ].flat()
      return shipCount(ships, check_ids) >= 3
    }
  }
)

// 359: Halloween艦隊 実りの秋、強襲演習！
register(
  359,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [5]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'A'
    static formatter(quest: Quest): string {
      return detailFormat(['演習A勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      const check_ids = [
        svdata.shipMstIds(1005), // Minneapolis
        svdata.shipMstIds(114), // abukuma
        svdata.shipMstIds(93), // 朧
        svdata.shipMstIds(45), // 夕立
        svdata.shipMstIds(44), // murasame
        svdata.shipMstIds(415), // nowaki
        svdata.shipMstIds(95), // 朝潮
        svdata.shipMstIds(528), // hayanami
        svdata.shipMstIds(484), // hamanami
        svdata.shipMstIds(921), // 鵜来
        svdata.shipMstIds(922), // 稲木
        svdata.shipMstIds(519), // Jervis
        svdata.shipMstIds(562), // Johnston
        svdata.shipMstIds(881), // 伊201
      ].flat()
      return shipCount(ships, check_ids) >= 4
    }
  }
)

// 360: 第一線航空母艦「鳳翔改二」、演習開始！
register(
  360,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [5]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'S'
    static formatter(quest: Quest): string {
      return detailFormat(['演習S勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      if (!shipCount([ships[0]], svdata.shipMstIds(894))) {
        return false
      }
      return shipTypeCount(ships, [ApiShipType.kutikukan]) >= 3
    }
  }
)

// 361: 【年末年始】海上護衛部隊 特別演習！
register(
  361,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [4]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'S'
    static formatter(quest: Quest): string {
      return detailFormat(['演習S勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      const info = svdata.shipInfo(ship_ids[0])
      if (!info) {
        return false
      }
      const count = info.slots.reduce((acc, slot, index) => {
        if (index < 2 && slot?.mst.api_id === 42) {
          ++acc
        }
        return acc
      }, 0)
      if (count < 2) {
        return false
      }
      if (shipTypeCount(ships, [ApiShipType.kaiboukan]) >= 2) {
        return true
      }
      return (
        shipTypeCount(ships, [ApiShipType.kutikukan]) >= 4 &&
        shipTypeCount(ships, [ApiShipType.kei_kuubo]) >= 1
      )
    }
  }
)

// 362: 特型初代「第十一駆逐隊」演習スペシャル！
register(
  362,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [4]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'A'
    static formatter(quest: Quest): string {
      return detailFormat(['演習A勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      const check_ids = [
        svdata.shipMstIds(9),
        svdata.shipMstIds(10),
        svdata.shipMstIds(11),
        svdata.shipMstIds(32)
      ].flat()
      return shipCount(ships, check_ids) >= 4
    }
  }
)

// 363: 【13周年記念任務】記念祝賀艦隊演習！
register(
  363,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [5]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'A'
    static formatter(quest: Quest): string {
      return detailFormat(['演習A勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) < 2) {
        return false
      }
      const ships = toShipMsts(svdata, ship_ids)
      const check_ids = [
        svdata.shipMstIds(992), // sugi
        svdata.shipMstIds(93), // oboro
        svdata.shipMstIds(15), // akebono
        svdata.shipMstIds(94), // sazanami
        svdata.shipMstIds(16), // usio
        svdata.shipMstIds(9), // fubuki
        svdata.shipMstIds(973), // Thonburi
        svdata.shipMstIds(988), // nosaki
        svdata.shipMstIds(995), // ootomari
        svdata.shipMstIds(451), // mizuho
      ].flat()
      if (!shipCount([ships[0]], check_ids)) {
        return false
      }
      return shipCount([ships[1]], check_ids) >= 1
    }
  }
)

// 364: 精鋭第三戦隊、演習開始！
register(
  364,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [4]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'S'
    static formatter(quest: Quest): string {
      return detailFormat(['演習S勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      const check_ids = [svdata.shipMstIds(591), svdata.shipMstIds(593)].flat()
      if (shipCount(ships, check_ids) < 2) {
        return false
      }
      return shipTypeCount(ships, [ApiShipType.kutikukan]) >= 2
    }
  }
)

// 365: 「佐世保の時雨」練度向上を図れ！
register(
  365,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [5]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'S'
    static formatter(quest: Quest): string {
      return detailFormat(['演習S勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      const check_ids = [
        svdata.shipMstIds(43),
        svdata.shipMstIds(42),
        svdata.shipMstIds(632),
        svdata.shipMstIds(633)
      ].flat()
      return shipCount(ships, check_ids) >= 2
    }
  }
)

// 366: 最精鋭！改装「時雨」演習開始！
register(
  366,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [4]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'S'
    static formatter(quest: Quest): string {
      return detailFormat(['演習S勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      if (!shipCount([ships[0]], svdata.shipMstIds(961))) {
        return false
      }
      return shipTypeCount(ships, [ApiShipType.kutikukan]) >= 3
    }
  }
)

// 367: 【梅雨限定任務】海上護衛戦、雨中演習2026
register(
  367,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [4]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'A'
    static formatter(quest: Quest): string {
      return detailFormat(['演習A勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      if (shipTypeCount(ships, [ApiShipType.kaiboukan]) >= 3) {
        return true
      }
      return shipTypeCount(ships, [ApiShipType.kutikukan]) >= 5
    }
  }
)

// 368: 「十六駆」演習！
register(
  368,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [3]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'S'
    static formatter(quest: Quest): string {
      return detailFormat(['演習S勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      const check_ids = [
        svdata.shipMstIds(181),
        svdata.shipMstIds(20),
        svdata.shipMstIds(186),
        svdata.shipMstIds(190)
      ].flat()
      return shipCount(ships, check_ids) >= 2
    }
  }
)

// 369:【鎮守府秋刀魚祭り】秋刀魚塩焼き演習！
register(
  369,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [4]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'A'
    static formatter(quest: Quest): string {
      return detailFormat(['演習A勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      const check_ids = [
        svdata.shipMstIds(421), //akiduki
        svdata.shipMstIds(423), // hatuduki
        svdata.shipMstIds(995), // ootomari
        svdata.shipMstIds(527), // kisinami
        svdata.shipMstIds(452), // okinami
        svdata.shipMstIds(167), // isokaze
        svdata.shipMstIds(74), // syouhou
        svdata.shipMstIds(97), // mitisio
        svdata.shipMstIds(145), // sigure kaini
        svdata.shipMstIds(962), // Mogador
        svdata.shipMstIds(931), // Ranger
      ].flat()
      return shipCount(ships, check_ids) >= 4
    }
  }
)

// 370:【鎮守府秋刀魚祭り】秋刀魚塩焼き演習！
register(
  370,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [4]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'A'
    static formatter(quest: Quest): string {
      return detailFormat(['演習A勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      const check_ids = [
        svdata.shipMstIds(465),
        svdata.shipMstIds(524),
        svdata.shipMstIds(525),
        svdata.shipMstIds(531),
        svdata.shipMstIds(565),
        svdata.shipMstIds(921),
        svdata.shipMstIds(527),
        svdata.shipMstIds(528),
        svdata.shipMstIds(169),
        svdata.shipMstIds(459),
        svdata.shipMstIds(414),
        svdata.shipMstIds(413),
        svdata.shipMstIds(900)
      ].flat()
      const kaibou = shipCategoryCount(ships, [ApiShipCategory.tyougataKaiboukan])
      const other = shipCount(ships, check_ids)
      return kaibou + other >= 4
    }
  }
)

// 371: 春です！「春雨」、演習しますっ！
register(
  371,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [4]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'A'
    static formatter(quest: Quest): string {
      return detailFormat(['演習A勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      if (!shipCount([ships[0]], svdata.shipMstIds(405))) {
        return false
      }
      const shipIds = [
        svdata.shipMstIds(42),
        svdata.shipMstIds(43),
        svdata.shipMstIds(45),
        svdata.shipMstIds(44),
        svdata.shipMstIds(46)
      ].flat()
      return shipCount(ships.slice(1), shipIds) >= 3
    }
  }
)

// 372: 水上艦「艦隊防空演習」を実施せよ！
register(
  372,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [4]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'A'
    static formatter(quest: Quest): string {
      return detailFormat(['演習A勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      if (!shipCategoryCount([ships[0]], [ApiShipCategory.akizuki])) {
        return false
      }
      if (shipTypeCount(ships, [ApiShipType.kutikukan]) < 3) {
        return false
      }
      return shipTypeCount(ships, [ApiShipType.koukuu_senkan]) >= 2
    }
  }
)

// 373: 「フランス艦隊」演習！
register(
  373,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [4]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'A'
    static formatter(quest: Quest): string {
      return detailFormat(['演習A勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      const cats: ApiShipCategory[] = [
        ApiShipCategory.richelieu,
        ApiShipCategory.commandantTeste,
        ApiShipCategory.la_galissonniere,
        ApiShipCategory.mogador
      ]
      if (!shipCategoryCount([ships[0]], cats)) {
        return false
      }
      return shipCategoryCount(ships, cats) >= 3
    }
  }
)

// 374: 【期間限定任務】「三十二駆」特別演習
register(
  374,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [3]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'S'
    static formatter(quest: Quest): string {
      return detailFormat(['演習S勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(674),
        svdata.shipMstIds(675),
        svdata.shipMstIds(485),
        svdata.shipMstIds(528),
        svdata.shipMstIds(484)
      ].flat()
      return shipCount(ships, shipIds) >= 3
    }
  }
)

// 375: 「第三戦隊」第二小隊、演習開始！
register(
  375,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [4]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'S'
    static formatter(quest: Quest): string {
      return detailFormat(['演習S勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      const shipIds = [svdata.shipMstIds(86), svdata.shipMstIds(85)].flat()
      if (shipCount(ships, shipIds) < 2) {
        return false
      }
      if (!shipTypeCount(ships, [ApiShipType.keijyun])) {
        return false
      }
      return shipTypeCount(ships, [ApiShipType.kutikukan]) >= 2
    }
  }
)

// 376:「第三戦隊」精鋭第二小隊、特別演習！
register(
  376,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [5]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'S'
    static formatter(quest: Quest): string {
      return detailFormat(['演習S勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      if (shipTypeCount(ships, [ApiShipType.kutikukan]) < 2) {
        return false
      }
      if (!shipTypeCount(ships, [ApiShipType.keijyun])) {
        return false
      }
      const shipIds = [svdata.shipMstIds(85), svdata.shipMstIds(86)].flat()
      return shipCount(ships, shipIds) === 2
    }
  }
)

// 377: 「第二駆逐隊(後期編成)」、練度向上！
register(
  377,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [4]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'S'
    static formatter(quest: Quest): string {
      return detailFormat(['演習S勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(409),
        svdata.shipMstIds(625),
        svdata.shipMstIds(410)
      ].flat()
      if (!shipCount([ships[0]], shipIds)) {
        return false
      }
      shipIds.push(
        ...svdata.shipMstIds(425) // 朝霜
      )
      return shipCount(ships, shipIds) >= 3
    }
  }
)

// 378: 新春限定！第六艦隊特別演習
register(
  378,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [5]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'A'
    static formatter(quest: Quest): string {
      return detailFormat(['演習A勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      if (!shipTypeCount([ships[0]], [ApiShipType.sensuibokan])) {
        return false
      }
      const countSensuibokan = shipTypeCount(ships, [ApiShipType.sensuibokan]) - 1
      const countSensuikan = shipTypeCount(ships, [ApiShipType.sensuikan])
      if ((countSensuibokan + countSensuikan) < 2) {
        return false
      }
      return countSensuikan >= 1
    }
  }
)

// 379: 【期間限定任務】「精鋭十一駆」特別演習！
register(
  379,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [4]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'S'
    static formatter(quest: Quest): string {
      return detailFormat(['演習S勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(426),
        svdata.shipMstIds(986),
        svdata.shipMstIds(959),
        svdata.shipMstIds(203)
      ].flat()
      return shipCount(ships, shipIds) >= 2
    }
  }
)

// 380:【期間限定任務】揚陸船団護衛演習
register(
  380,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [3]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'A'
    static formatter(quest: Quest): string {
      return detailFormat(['演習A勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      const landingCount = shipTypeCount(ships, [ApiShipType.yourikukan])
      const escortCount = shipTypeCount(ships, [ApiShipType.kaiboukan])
      if (landingCount >= 1 && escortCount >= 2) {
        return true
      }
      return escortCount >= 3
    }
  }
)

// 381: 【期間限定任務】秋月型演習任務
register(
  381,
  class {
    static readonly questType = QuestType.practiceDeck
    static max = [3]
    static key = QuestKey.daily
    static need_win_rank: PracticeWinRank = 'A'
    static formatter(quest: Quest): string {
      return detailFormat(['演習A勝利：'], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      const ids = [svdata.shipMstIds(132), svdata.shipMstIds(625), svdata.shipMstIds(445)].flat()
      const akizuki = shipCategoryCount(ships, [ApiShipCategory.akizuki])
      if (akizuki >= 3) {
        return true
      }
      return akizuki + shipCount(ships, ids) >= 3
    }
  }
)

// 401: はじめての「遠征」！
register(
  401,
  class {
    public static readonly questType = QuestType.missionStart
    static max = [1]
    static key = QuestKey.infer
    static formatter(quest: Quest): string {
      return detailFormatOne(['遠征出発：'], quest)
    }
  }
)

// 402: 「遠征」を 3 回成功させよう！
register(
  402,
  class {
    public static readonly questType = QuestType.mission
    static max = [3]
    static key = QuestKey.infer
    static formatter(quest: Quest): string {
      return detailFormat(['遠征成功：'], quest)
    }
  }
)

// 403: 「遠征」を１０回成功させよう！
register(
  403,
  class {
    static readonly questType = QuestType.mission
    static max = [10]
    static key = QuestKey.infer
    static formatter(quest: Quest): string {
      return detailFormat(['遠征成功：'], quest)
    }
  }
)

// 404: 大規模遠征作戦、発令！
register(
  404,
  class {
    static readonly questType = QuestType.mission
    static max = [30]
    static key = QuestKey.infer
    static formatter(quest: Quest): string {
      return detailFormat(['遠征成功：'], quest)
    }
  }
)

// 405: 第一次潜水艦派遣作戦
register(
  405,
  class {
    static readonly questType = QuestType.missionSpecific
    static max = [1]
    static key = QuestKey.infer
    static names = [['潜水艦派遣作戦']]
    static formatter(quest: Quest): string {
      return detailFormatOne(['潜水艦派遣作戦(遠征30)：'], quest)
    }
  }
)

// 406: 第二次潜水艦派遣作戦
register(
  406,
  class {
    static readonly questType = QuestType.missionSpecific
    static max = [1]
    static key = QuestKey.infer
    static names = [['潜水艦派遣作戦']]
    static formatter(quest: Quest): string {
      return detailFormatOne(['潜水艦派遣作戦(遠征30)：'], quest)
    }
  }
)

// 408: 潜水艦派遣作戦による技術入手の継続！
register(
  408,
  class {
    static readonly questType = QuestType.missionSpecific
    static max = [4]
    static key = QuestKey.infer
    static names = [['潜水艦派遣作戦']]
    static formatter(quest: Quest): string {
      return detailFormat(['潜水艦派遣作戦(遠征30)：'], quest)
    }
  }
)

// 409: 潜水艦派遣による海外艦との接触作戦
register(
  409,
  class {
    static readonly questType = QuestType.missionSpecific
    static max = [1]
    static key = QuestKey.infer
    static names = [['海外艦との接触']]
    static formatter(quest: Quest): string {
      return detailFormatOne(['海外艦との接触(遠征31)：'], quest)
    }
  }
)

// 410:	南方への輸送作戦を成功させよ！
register(
  410,
  class {
    public static readonly questType = QuestType.missionSpecific
    static max = [1]
    static key = QuestKey.infer
    static names = [['東京急行', '東京急行(弐)']]
    static formatter(quest: Quest): string {
      return detailFormat(['東急系成功：'], quest)
    }
  }
)

// 411: 南方への鼠輸送を継続実施せよ！
register(
  411,
  class {
    static readonly questType = QuestType.missionSpecific
    static max = [6]
    static key = QuestKey.infer
    static names = [['東京急行', '東京急行(弐)']]
    static formatter(quest: Quest): string {
      return detailFormat(['東急系成功：'], quest)
    }
  }
)

// 412: 航空火力艦の運用を強化せよ！
register(
  412,
  class {
    static readonly questType = QuestType.missionSpecific
    static max = [1]
    static key = QuestKey.infer
    static names = [['航空戦艦運用演習']]
    static formatter(quest: Quest): string {
      return detailFormatOne(['航空戦艦運用演習(遠征23)：'], quest)
    }
  }
)

// 413: (続)航空火力艦の運用を強化せよ！
register(
  413,
  class {
    static readonly questType = QuestType.missionSpecific
    static max = [4]
    static key = QuestKey.infer
    static names = [['航空戦艦運用演習']]
    static formatter(quest: Quest): string {
      return detailFormat(['航空戦艦運用演習(遠征23)：'], quest)
    }
  }
)

// 414: 遠洋潜水艦作戦を実施せよ！
register(
  414,
  class {
    static readonly questType = QuestType.missionSpecific
    static max = [1]
    static key = QuestKey.infer
    static names = [['遠洋潜水艦作戦']]
    static formatter(quest: Quest): string {
      return detailFormatOne(['遠洋潜水艦作戦(遠征30)：'], quest)
    }
  }
)

// 415: 遠洋潜水艦作戦の成果を拡大せよ！
register(
  415,
  class {
    static readonly questType = QuestType.missionSpecific
    static max = [3]
    static key = QuestKey.infer
    static names = [['遠洋潜水艦作戦']]
    static formatter(quest: Quest): string {
      return detailFormat(['遠洋潜水艦作戦(遠征30)：'], quest)
    }
  }
)

// 416: 防空射撃演習を実施せよ！
register(
  416,
  class {
    static readonly questType = QuestType.missionSpecific
    static max = [3]
    static key = QuestKey.infer
    static names = [['防空射撃演習']]
    static formatter(quest: Quest): string {
      return detailFormat(['防空射撃演習(遠征06)：'], quest)
    }
  }
)

// 417: 囮機動部隊支援作戦を実施せよ！
register(
  417,
  class {
    static readonly questType = QuestType.missionSpecific
    static max = [1]
    static key = QuestKey.infer
    static names = [['囮機動部隊支援作戦']]
    static formatter(quest: Quest): string {
      return detailFormatOne(['遠征15：'], quest)
    }
  }
)

// 418: 観艦式予行を実施せよ！
register(
  418,
  class {
    static readonly questType = QuestType.missionSpecific
    static max = [2]
    static key = QuestKey.infer
    static names = [['観艦式予行']]
    static formatter(quest: Quest): string {
      return detailFormat(['観艦式予行(遠征07)：'], quest)
    }
  }
)

// 419: 観艦式を敢行せよ！
register(
  419,
  class {
    static readonly questType = QuestType.missionSpecific
    static max = [1]
    static key = QuestKey.infer
    static names = [['観艦式']]
    static formatter(quest: Quest): string {
      return detailFormatOne(['観艦式(遠征08)：'], quest)
    }
  }
)

// 420: 機動部隊の運用を強化せよ！
register(
  420,
  class {
    static readonly questType = QuestType.missionSpecific
    static max = [1, 1]
    static key = QuestKey.infer
    static names = [['敵母港空襲作戦'], ['MO作戦']]
    static formatter(quest: Quest): string {
      return detailFormatOne(['遠征26：', '遠征35：'], quest)
    }
  }
)

// 422: 潜水艦派遣作戦による航空機技術入手
register(
  422,
  class {
    static readonly questType = QuestType.missionSpecific
    static max = [1, 1]
    static key = QuestKey.infer
    static names = [['潜水艦派遣作戦'], ['海外艦との接触']]
    static formatter(quest: Quest): string {
      return detailFormatOne(['遠征30：', '遠征31：'], quest)
    }
  }
)

// 423: 潜水艦派遣作戦による噴式技術の入手
register(
  423,
  class {
    static readonly questType = QuestType.missionSpecific
    static max = [1, 1]
    static key = QuestKey.infer
    static names = [['潜水艦派遣作戦'], ['海外艦との接触']]
    static formatter(quest: Quest): string {
      return detailFormatOne(['遠征30：', '遠征31：'], quest)
    }
  }
)

// 424:	輸送船団護衛を強化せよ！
register(
  424,
  class {
    static readonly questType = QuestType.missionSpecific
    static max = [4]
    static key = QuestKey.infer
    static names = [['海上護衛任務']]
    static formatter(quest: Quest): string {
      return detailFormat(['海上護衛任務(遠征05)：'], quest)
    }
  }
)

// 425:	海上護衛総隊、遠征開始！
register(
  425,
  class {
    static readonly questType = QuestType.missionSpecific
    static max = [1, 1, 1]
    static key = QuestKey.infer
    static names = [['対潜警戒任務'], ['海上護衛任務'], ['タンカー護衛任務']]
    static formatter(quest: Quest): string {
      return detailFormatOne(['遠征04：', '遠征05：', '遠征09：'], quest)
    }
  }
)

// 426:	海上通商航路の警戒を厳とせよ！
register(
  426,
  class {
    static readonly questType = QuestType.missionSpecific
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static names = [['警備任務'], ['対潜警戒任務'], ['海上護衛任務'], ['強行偵察任務']]
    static formatter(quest: Quest): string {
      return detailFormatOne(['遠征3：', '遠征4：', '遠征5：', '遠征10：'], quest)
    }
  }
)

// 427:	遠征「補給」支援体制を強化せよ！
register(
  427,
  class {
    static readonly questType = QuestType.missionSpecific
    static max = [1]
    static key = QuestKey.infer
    static names = [['兵站強化任務']]
    static formatter(quest: Quest): string {
      return detailFormatOne(['兵站強化任務(遠征A1)：'], quest)
    }
  }
)

// 428:	近海に侵入する敵潜を制圧せよ！
register(
  428,
  class {
    static readonly questType = QuestType.missionSpecific
    static max = [2, 2, 2]
    static key = QuestKey.infer
    static names = [['対潜警戒任務'], ['海峡警備行動'], ['長時間対潜警戒']]
    static formatter(quest: Quest): string {
      return detailFormat(['遠征4：', '遠征A2：', '遠征A3：'], quest)
    }
  }
)

// 429:	「捷一号作戦」、発動準備！
register(
  429,
  class {
    static readonly questType = QuestType.missionSpecific
    static max = [1, 1, 1]
    static key = QuestKey.infer
    static names = [['警備任務'], ['兵站強化任務'], ['南西方面航空偵察作戦']]
    static formatter(quest: Quest): string {
      return detailFormatOne(['遠征3：', '遠征A1：', '遠征B1：'], quest)
    }
  }
)

// 430:	「海防艦」、進発せよ！
register(
  430,
  class {
    static readonly questType = QuestType.missionSpecific
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static names = [['海上護衛任務'], ['兵站強化任務'], ['海峡警備行動'], ['タンカー護衛任務']]
    static formatter(quest: Quest): string {
      return detailFormatOne(['遠征5：', '遠征A1：', '遠征A2：', '遠征9：'], quest)
    }
  }
)

// 431:	艦隊司令部の強化 【準備段階】
register(
  431,
  class {
    static readonly questType = QuestType.missionSpecific
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static names = [['兵站強化任務'], ['海峡警備行動'], ['南西方面航空偵察作戦'], ['敵地偵察作戦']]
    static formatter(quest: Quest): string {
      return detailFormatOne(['遠征A1：', '遠征A2：', '遠征B1：', '遠征17：'], quest)
    }
  }
)

// 432:	警備及び哨戒偵察を強化せよ！
register(
  432,
  class {
    static readonly questType = QuestType.missionSpecific
    static max = [1, 1, 1]
    static key = QuestKey.infer
    static names = [['海峡警備行動'], ['強行偵察任務'], ['南西方面航空偵察作戦']]
    static formatter(quest: Quest): string {
      return detailFormatOne(['遠征A2：', '遠征10：', '遠征B1：'], quest)
    }
  }
)

// 433:	南方戦線遠征を実施せよ！
register(
  433,
  class {
    static readonly questType = QuestType.missionSpecific
    static max = [1, 1, 1, 1, 1]
    static key = QuestKey.infer
    static names = [['MO作戦'], ['水上機基地建設'], ['東京急行'], ['東京急行(弐)'], ['水上機前線輸送']]
    static formatter(quest: Quest): string {
      return detailFormatOne(['遠征35：', '遠征36：', '遠征37：', '遠征38：','遠征40：'], quest)
    }
  }
)

// 434:	特設護衛船団司令部、活動開始！
register(
  434,
  class {
    static readonly questType = QuestType.missionSpecific
    static max = [1, 1, 1, 1, 1]
    static key = QuestKey.infer
    static names = [
      ['警備任務'],
      ['海上護衛任務'],
      ['兵站強化任務'],
      ['海峡警備行動'],
      ['タンカー護衛任務']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOne(['遠征3：', '遠征5：', '遠征A1：', '遠征A2：', '遠征9：'], quest)
    }
  }
)

// 435:	【桃の節句任務】桃の節句遠征！

// 436:	練習航海及び警備任務を実施せよ！
register(
  436,
  class {
    static readonly questType = QuestType.missionSpecific
    static max = [1, 1, 1, 1, 1]
    static key = QuestKey.infer
    static names = [
      ['練習航海'],
      ['長距離練習航海'],
      ['警備任務'],
      ['対潜警戒任務'],
      ['強行偵察任務']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOne(['遠征1：', '遠征2：', '遠征3：', '遠征4：', '遠征10：'], quest)
    }
  }
)

// 437:	小笠原沖哨戒線の強化を実施せよ！
register(
  437,
  class {
    static readonly questType = QuestType.missionSpecific
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static names = [
      ['対潜警戒任務'],
      ['小笠原沖哨戒線'],
      ['小笠原沖戦闘哨戒'],
      ['南西方面航空偵察作戦']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOne(['遠征4：', '遠征A5：', '遠征A6：', '遠征B1：'], quest)
    }
  }
)

// 438:	南西諸島方面の海上護衛を強化せよ！
register(
  438,
  class {
    static readonly questType = QuestType.missionSpecific
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static names = [
      ['兵站強化任務'],
      ['対潜警戒任務'],
      ['タンカー護衛任務'],
      ['南西諸島捜索撃滅戦']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOne(['遠征A1：', '遠征4：', '遠征9：', '遠征B5：'], quest)
    }
  }
)

// 439:	兵站強化遠征任務【基本作戦】
register(
  439,
  class {
    static readonly questType = QuestType.missionSpecific
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static names = [
      ['海上護衛任務'],
      ['兵站強化任務'],
      ['ボーキサイト輸送任務'],
      ['南西方面航空偵察作戦']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOne(['遠征5：', '遠征A1：', '遠征11：', '遠征B1：'], quest)
    }
  }
)

// 440:	兵站強化遠征任務【拡張作戦】
register(
  440,
  class {
    static readonly questType = QuestType.missionSpecific
    static max = [1, 1, 1, 1, 1]
    static key = QuestKey.infer
    static names = [
      ['ブルネイ泊地沖哨戒'],
      ['海上護衛任務'],
      ['水上機前線輸送'],
      ['強行鼠輸送作戦'],
      ['南西海域戦闘哨戒']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOne(['遠41：', '遠5：', '遠40：', '遠E2：', '遠46：'], quest)
    }
  }
)

// 441:	【節分任務:恵方】令和八年節分遠征
register(
  441,
  class {
    static readonly questType = QuestType.missionSpecific
    static max = [1, 1, 1, 1, 1]
    static key = QuestKey.yearly
    static names = [
      ['海上護衛任務'],
      ['長時間対潜警戒'],
      ['タンカー護衛任務'],
      ['兵站強化任務'],
      ['遠洋潜水艦作戦']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOne(['遠05：', '遠A3：', '遠09：', '遠A1：', '遠39：'], quest)
    }
  }
)

// 442:	西方連絡作戦準備を実施せよ！
register(
  442,
  class {
    static readonly questType = QuestType.missionSpecific
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static names = [
      ['西方海域偵察作戦'],
      ['潜水艦派遣演習'],
      ['潜水艦派遣作戦'],
      ['欧州方面友軍との接触']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOne(['遠征D1：', '遠征29：', '遠征30：', '遠征D3：'], quest)
    }
  }
)

// 443:	西方連絡作戦による航空技術獲得
register(
  443,
  class {
    static readonly questType = QuestType.missionSpecific
    static max = [2]
    static key = QuestKey.infer
    static names = [['潜水艦派遣作戦']]
    static formatter(quest: Quest): string {
      return detailFormat(['遠征30：'], quest)
    }
  }
)

// 444:	新兵装開発資材輸送を船団護衛せよ！
register(
  444,
  class {
    static readonly questType = QuestType.missionSpecific
    static max = [1, 1, 1, 1, 1]
    static key = QuestKey.infer
    static names = [
      ['海上護衛任務'],
      ['タンカー護衛任務'],
      ['ボーキサイト輸送任務'],
      ['資源輸送任務'],
      ['南西方面航空偵察作戦']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOne(['遠征05：', '遠征09：', '遠征11：', '遠征12：', '遠征B1：'], quest)
    }
  }
)

// 445:	航空基地を整備拡張せよ！
register(
  445,
  class {
    static readonly questType = QuestType.missionSpecific
    static max = [1, 1, 1, 1, 1, 1, 1]
    static key = QuestKey.infer
    static names = [
      ['海上護衛任務'],
      ['兵站強化任務'],
      ['タンカー護衛任務'],
      ['航空機輸送作戦'],
      ['水上機基地建設'],
      ['水上機前線輸送'],
      ['ボーキサイト船団護衛']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOne(
        ['遠05：', '遠A1：', '遠09：', '遠18：', '遠36：', '遠40：', '遠45：'],
        quest
      )
    }
  }
)

// 446:	【作戦準備】第一段階任務(対潜整備)
register(
  446,
  class {
    static readonly questType = QuestType.missionSpecific
    static max = [1, 1, 1, 1, 1]
    static key = QuestKey.infer
    static names = [
      ['警備任務'],
      ['対潜警戒任務'],
      ['海上護衛任務'],
      ['兵站強化任務'],
      ['海峡警備行動']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOne(['遠征03：', '遠征04：', '遠征05：', '遠征A1：', '遠征A2：'], quest)
    }
  }
)

// 447:	海上輸送航路の護衛強化
register(
  447,
  class {
    static readonly questType = QuestType.missionSpecific
    static max = [1, 1, 1, 1, 1]
    static key = QuestKey.infer
    static names = [
      ['対潜警戒任務'],
      ['海上護衛任務'],
      ['兵站強化任務'],
      ['タンカー護衛任務'],
      ['南西方面航空偵察作戦']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOne(['遠征04：', '遠征05：', '遠征A1：', '遠征09：', '遠征B1：'], quest)
    }
  }
)

// 448:	【13周年記念任務】13周年観艦式準備
register(
  448,
  class {
    static readonly questType = QuestType.missionSpecific
    static max = [1, 1, 1, 2]
    static key = QuestKey.yearly
    static names = [
      ['警備任務'],
      ['兵站強化任務'],
      ['長時間対潜警戒'],
      ['観艦式予行'],
    ]
    static formatter(quest: Quest): string {
      return detailFormat(['遠征3：', '遠征A1：', '遠征A3：', '遠征7：'], quest)
    }
  }
)

// 449:【13周年記念任務】13周年観艦式
register(
  449,
  class {
    static readonly questType = QuestType.missionSpecific
    static max = [1]
    static key = QuestKey.infer
    static names = [['観艦式']]
    static formatter(quest: Quest): string {
      return detailFormatOne(['遠征8：'], quest)
    }
  }
)

// 450:【期間限定:拡張任務】水雷戦隊遠征作戦！
register(
  450,
  class {
    static readonly questType = QuestType.missionSpecific
    static max = [1, 1, 1, 1, 1]
    static key = QuestKey.infer
    static names = [
      ['海上護衛任務'], ['兵站強化任務'], ['タンカー護衛任務'], 
      ['資源輸送任務'], ['包囲陸戦隊撤収作戦']]
    static formatter(quest: Quest): string {
      return detailFormatOne(['遠征5：', '遠征A1：', '遠征9：', '遠征12：', '遠征14：'], quest)
    }
  }
)

// 451:【13周年記念拡張任務】緊急資源輸出入
register(
  451,
  class {
    static readonly questType = QuestType.missionSpecific
    static max = [2, 2, 2]
    static key = QuestKey.infer
    static names = [
      ['海上護衛任務'],
      ['タンカー護衛任務'], 
      ['ボーキサイト輸送任務']
    ]
    static formatter(quest: Quest): string {
      return detailFormat(['遠征5：', '遠征9：', '遠征11：'], quest)
    }
  }
)

// 501: はじめての「補給」！
register(
  501,
  class {
    static readonly questType = QuestType.hokyu
    static max = [1]
    static key = QuestKey.infer
    static formatter(quest: Quest): string {
      return detailFormat(['補給：'], quest)
    }
  }
)

// 502: はじめての「入渠」！
register(
  502,
  class {
    static readonly questType = QuestType.nyukyo
    static max = [1]
    static key = QuestKey.infer
    static formatter(quest: Quest): string {
      return detailFormatOne(['入渠：'], quest)
    }
  }
)

// 503: 艦隊大整備！
register(
  503,
  class {
    static readonly questType = QuestType.nyukyo
    static max = [5]
    static key = QuestKey.infer
    static formatter(quest: Quest): string {
      return detailFormat(['入渠：'], quest)
    }
  }
)

// 504: 艦隊酒保祭り！
register(
  504,
  class {
    static readonly questType = QuestType.hokyu
    static max = [15]
    static key = QuestKey.infer
    static formatter(quest: Quest): string {
      return detailFormat(['補給：'], quest)
    }
  }
)

// 505:	主計科任務【おにぎりを作る！】
// 506: 主計科任務【おにぎりを振舞おう！】
// 507:	主計科任務【高級おにぎりを作る！】
// 508:	主計科任務【差し入れ！高級おにぎり】
// 509:	主計科任務【お茶漬けを作る！】
// 510:	主計科任務【お茶漬け、夜食にどうぞ！】
// 511:	主計科任務【海苔巻きを作ろう！】
// 512:	主計科任務【和定食膳を作って完食！】
// 513: 主計科拡張任務【日の丸弁当、量産！】

// 601:	はじめての「建造」！
register(
  601,
  class {
    static readonly questType = QuestType.createShip
    static max = [1]
    static key = QuestKey.infer
    static formatter(quest: Quest): string {
      return detailFormatOne(['建造：'], quest)
    }
  }
)

// 602:	はじめての「開発」！
register(
  602,
  class {
    static readonly questType = QuestType.createItem
    static max = [1]
    static key = QuestKey.infer
    static formatter(quest: Quest): string {
      return detailFormatOne(['開発：'], quest)
    }
  }
)

// 603:	はじめての「解体」！
register(
  603,
  class {
    public static readonly questType = QuestType.destroyShip
    static max = [1]
    static key = QuestKey.infer
    static formatter(quest: Quest): string {
      return detailFormatOne(['解体：'], quest)
    }
  }
)

// 604: はじめての「廃棄」！
register(
  604,
  class {
    static readonly questType = QuestType.destroyItem
    static max = [1]
    static key = QuestKey.infer
    static formatter(quest: Quest): string {
      return detailFormatOne(['破棄：'], quest)
    }
  }
)

// 605:	新装備「開発」指令
register(
  605,
  class {
    static readonly questType = QuestType.createItem
    static max = [1]
    static key = QuestKey.infer
    static formatter(quest: Quest): string {
      return detailFormat(['開発：'], quest)
    }
  }
)

// 606:	新造艦「建造」指令
register(
  606,
  class {
    static readonly questType = QuestType.createShip
    static max = [1]
    static key = QuestKey.infer
    static formatter(quest: Quest): string {
      return detailFormat(['建造：'], quest)
    }
  }
)

// 607:	装備「開発」集中強化！
register(
  607,
  class {
    static readonly questType = QuestType.createItem
    static max = [3]
    static key = QuestKey.infer
    static formatter(quest: Quest): string {
      return detailFormat(['開発：'], quest)
    }
  }
)

// 608:	新造艦「建造」指令
register(
  608,
  class {
    static readonly questType = QuestType.createShip
    static max = [3]
    static key = QuestKey.infer
    static formatter(quest: Quest): string {
      return detailFormat(['建造：'], quest)
    }
  }
)

// 609:	軍縮条約対応！
register(
  609,
  class {
    public static readonly questType = QuestType.destroyShip
    static max = [2]
    static key = QuestKey.infer
    static formatter(quest: Quest): string {
      return detailFormat(['解体：'], quest)
    }
  }
)

// 610: 「大型艦建造」の準備！(その弐)
register(
  610,
  class {
    static readonly questType = QuestType.destroyItem
    static max = [4]
    static key = QuestKey.infer
    static formatter(quest: Quest): string {
      return detailFormat(['破棄：'], quest)
    }
  }
)

// 611: 式の準備！(その壱)
register(
  611,
  class {
    static readonly questType = QuestType.destroyItem
    static max = [2]
    static key = QuestKey.infer
    static formatter(quest: Quest): string {
      return detailFormat(['破棄：'], quest)
    }
  }
)

// 612: 輸送用ドラム缶の準備
register(
  612,
  class {
    static readonly questType = QuestType.destroyItem
    static max = [3]
    static key = QuestKey.infer
    static formatter(quest: Quest): string {
      return detailFormat(['破棄：'], quest)
    }
  }
)

// 613: 資源の再利用
register(
  613,
  class {
    static readonly questType = QuestType.destroyItem
    static max = [24]
    static key = QuestKey.infer
    static formatter(quest: Quest): string {
      return detailFormat(['破棄：'], quest)
    }
  }
)

// 614: 機種転換
register(
  614,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [2]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { id: 17 }, 
    ]
    static getCondition(_svdata: SvData): DestroyItemCondition {
      return {
        flagship_ids: [],
        flagship_slotitem_ids: [93],
        flagship_slotitem_lvl: [0],
      }
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 天山：'], quest)
    }
  }
)

// 615: 機種転換
register(
  615,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [2]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { id: 24 }, 
    ]
    static getCondition(_svdata: SvData): DestroyItemCondition {
      return {
        flagship_ids: [],
        flagship_slotitem_ids: [99],
        flagship_slotitem_lvl: [0],
      }
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 彗星：'], quest)
    }
  }
)

// 616: 機種転換
register(
  616,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [2]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { id: 22 }, 
    ]
    static getCondition(_svdata: SvData): DestroyItemCondition {
      return {
        flagship_ids: [],
        flagship_slotitem_ids: [109],
        flagship_slotitem_lvl: [0],
      }
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 試製烈風 後期型：'], quest)
    }
  }
)

// 617: 「伊良湖」の準備
register(
  617,
  class {
    static readonly questType = QuestType.destroyItem
    static max = [10]
    static key = QuestKey.infer
    static formatter(quest: Quest): string {
      return detailFormat(['破棄：'], quest)
    }
  }
)

// 618: はじめての「装備改修」！
register(
  618,
  class {
    static readonly questType = QuestType.remodel
    static max = [1]
    static key = QuestKey.infer
    static formatter(quest: Quest): string {
      return detailFormatOne(['改修：'], quest)
    }
  }
)

// 619: 装備の改修強化
register(
  619,
  class {
    static readonly questType = QuestType.remodel
    static max = [1]
    static key = QuestKey.infer
    static formatter(quest: Quest): string {
      return detailFormat(['改修：'], quest)
    }
  }
)

// 620: 一航戦精鋭「流星改」隊の編成
register(
  620,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [4, 1, 2]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { id: 52 },
      { id: 54 }, 
      { id: 16 }, 
    ]
    static getCondition(svdata: SvData): DestroyItemCondition {
      return {
        flagship_ids: svdata.shipMstIds(594), // akagi kaini
        flagship_slotitem_ids: [342],
        flagship_slotitem_lvl: [],
        flagship_slotitem_alv_max: true
      }
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 流星改：', '彩雲：', '九七式艦攻：'], quest)
    }
  }
)

// 621: 陸戦用装備の艦載運用研究
register(
  621,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [2, 2, 1]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { id: 49 },
      { id: 75 }, 
      { id: 51 }, 
    ]
    static getCondition(_svdata: SvData): DestroyItemCondition {
      return {
        flagship_type_ids: [ApiShipType.keijyun],
        flagship_slotitem_ids: [37],
        flagship_slotitem_lvl: [],
      }
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 25mm機銃：', 'ドラム缶：', '噴進砲：'], quest)
    }
  }
)

// 622: 機種転換
register(
  622,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [2]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { id: 17 },
    ]
    static getCondition(svdata: SvData): DestroyItemCondition {
      return {
        flagship_ids: svdata.shipMstIds(110), // syoukaku
        flagship_slotitem_ids: [143],
        flagship_slotitem_lvl: [],
      }
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 天山：'], quest)
    }
  }
)

// 623: 精鋭「九七式艦攻」部隊の編成
register(
  623,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [3]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { id: 16 },
    ]
    static getCondition(svdata: SvData): DestroyItemCondition {
      return {
        flagship_ids: [
          svdata.shipMstIds(110), // syoukaku
          svdata.shipMstIds(83), // akagi
        ].flat(),
        flagship_slotitem_ids: [],
        flagship_slotitem_lvl: [],
      }
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 九七式艦攻：'], quest)
    }
  }
)

// 624: 試作艤装の準備
register(
  624,
  class {
    static readonly questType = QuestType.destroyItem
    static max = [7]
    static key = QuestKey.infer
    static formatter(quest: Quest): string {
      return detailFormat(['破棄：'], quest)
    }
  }
)

// 625: 試製航空艤装の追加試作
register(
  625,
  class {
    static readonly questType = QuestType.destroyItem
    static max = [9]
    static key = QuestKey.infer
    static formatter(quest: Quest): string {
      return detailFormat(['破棄：'], quest)
    }
  }
)

// 626: 精鋭「艦戦」隊の新編成
register(
  626,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [2, 1]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { id: 20 },
      { id: 19 },
    ]
    static getCondition(svdata: SvData): DestroyItemCondition {
      return {
        flagship_ids: svdata.shipMstIds(89), // housyou
        flagship_slotitem_ids: [20],
        flagship_slotitem_lvl: [],
        flagship_slotitem_alv_max: true
      }
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 零戦21型：', '九六艦戦：'], quest)
    }
  }
)

// 627: 機種転換
register(
  627,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [2]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { id: 21 },
    ]
    static getCondition(_svdata: SvData): DestroyItemCondition {
      return {
        flagship_slotitem_ids: [96],
        flagship_slotitem_lvl: [],
      }
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 零戦52型：'], quest)
    }
  }
)

// 628: 機種転換
register(
  628,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [2]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { id: 21 },
    ]
    static getCondition(_svdata: SvData): DestroyItemCondition {
      return {
        flagship_slotitem_ids: [96],
        flagship_slotitem_lvl: [],
        flagship_slotitem_alv_max: true
      }
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 零戦52型：'], quest)
    }
  }
)

// 629: 「艦戦」隊の再編成
register(
  629,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [1]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { id: 109 },
    ]
    static getCondition(svdata: SvData): DestroyItemCondition {
      return {
        flagship_ids: svdata.shipMstIds(110), // syoukaku
        flagship_slotitem_ids: [152],
        flagship_slotitem_lvl: [],
        flagship_slotitem_alv_max: true
      }
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 零戦52型丙(六〇一空)：'], quest)
    }
  }
)

// 630: 「艦戦」隊の再編成
register(
  630,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [2]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { id: 20 },
    ]
    static getCondition(svdata: SvData): DestroyItemCondition {
      return {
        flagship_ids: svdata.shipMstIds(110), // syoukaku
        flagship_slotitem_ids: [96],
        flagship_slotitem_lvl: [],
        flagship_slotitem_alv_max: true
      }
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 零戦21型：'], quest)
    }
  }
)

// 631: 機種転換＆部隊再編
register(
  631,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [2]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { id: 60 },
    ]
    static getCondition(svdata: SvData): DestroyItemCondition {
      return {
        flagship_ids: svdata.shipMstIds(110), // syoukaku
        flagship_slotitem_ids: [153],
        flagship_slotitem_lvl: [],
        flagship_slotitem_alv_max: true
      }
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 零戦62型(爆戦)：'], quest)
    }
  }
)

// 632: 機種転換
register(
  632,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [2]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { id: 21 },
    ]
    static getCondition(svdata: SvData): DestroyItemCondition {
      return {
        flagship_ids: svdata.shipMstIds(110), // syoukaku
        flagship_slotitem_ids: [155],
        flagship_slotitem_lvl: [],
        flagship_slotitem_alv_max: true
      }
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 零戦52型：'], quest)
    }
  }
)

// 633: 機種転換＆部隊再編
register(
  633,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [2]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { id: 54 },
    ]
    static getCondition(svdata: SvData): DestroyItemCondition {
      return {
        flagship_ids: svdata.shipMstIds(110), // syoukaku
        flagship_slotitem_ids: [156],
        flagship_slotitem_lvl: [],
        flagship_slotitem_alv_max: true
      }
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 彩雲：'], quest)
    }
  }
)

// 634: 新家具の準備
register(
  634,
  class {
    static readonly questType = QuestType.destroyItem
    static max = [9]
    static key = QuestKey.infer
    static formatter(quest: Quest): string {
      return detailFormat(['破棄：'], quest)
    }
  }
)

// 635: 新装備の準備
register(
  635,
  class {
    static readonly questType = QuestType.destroyItem
    static max = [5]
    static key = QuestKey.infer
    static formatter(quest: Quest): string {
      return detailFormat(['破棄：'], quest)
    }
  }
)

// 636:	上陸戦用新装備の調達
register(
  636,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [2, 2]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { id: 37 },
      { id: 38 },
    ]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 7.7mm機銃：', '12.7mm単装機銃：'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 637: 「熟練搭乗員」養成
register(
  637,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [1]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = []
    static getCondition(svdata: SvData): DestroyItemCondition {
      return {
        flagship_ids: svdata.shipMstIds(89),
        flagship_slotitem_ids: [19],
        flagship_slotitem_lvl: [10],
        flagship_slotitem_alv_max: true
      }
    }
    static formatter(_quest: Quest): string {
      return '旗艦鳳翔 九六式艦戦 改修・熟練度MAX装備'
    }
  }
)

// 638:	対空機銃量産
register(
  638,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [6]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [{ type: SlotitemType.AAGun }]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 機銃：'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 639: 新型魚雷兵装の開発
register(
  639,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [1]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = []
    static getCondition(svdata: SvData): DestroyItemCondition {
      return {
        flagship_ids: svdata.shipMstIds(50), // simakaze
        flagship_slotitem_ids: [58, 125],
        flagship_slotitem_lvl: [10, 10],
      }
    }
    static formatter(_quest: Quest): string {
      return ''
    }
  }
)

// 640: 初夏の整理整頓
register(
  640,
  class {
    static readonly questType = QuestType.destroyItem
    static max = [5]
    static key = QuestKey.infer
    static formatter(quest: Quest): string {
      return detailFormat(['破棄：'], quest)
    }
  }
)

// 641:	「航空基地設営」事前準備
register(
  641,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [2]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { id: 75 }
    ]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 ドラム缶：'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 642:	「陸攻」隊の増勢
register(
  642,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [1]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = []
    static formatter(_quest: Quest): string {
      return '';
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 643:	主力「陸攻」の調達
register(
  643,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [2]
    static key = QuestKey.infer
    static notFixState = true
    static id_or_types: ItemIdOrType[] = [{ id: 20 }]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 零式艦戦21型：'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 644:	「一式陸攻」性能向上型の調達
register(
  644,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [1]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = []
    static formatter(quest: Quest): string {
      return ''
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 645:	「洋上補給」物資の調達
register(
  645,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [1]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { id: 35 }
    ]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 三式弾：'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 646:	「特注家具」の調達
register(
  646,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [1]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { id: 49 }
    ]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 25mm単装機銃：'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 647:	中部海域「基地航空隊」展開！
register(
  647,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [2]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { id: 75 }
    ]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 ドラム缶：'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 648:	「特注家具」の調達
register(
  648,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [1]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { id: 49 }
    ]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 25mm単装機銃：'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 649:	新機軸偵察機の開発
register(
  649,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [2]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { id: 25 }
    ]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 零式水上偵察機：'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 650:	噴式戦闘爆撃機の開発
register(
  650,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [3]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { id: 55 }
    ]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 紫電改二：'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 651:	ネ式エンジンの増産
register(
  651,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [3]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { id: 21 }
    ]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 零式艦戦52型：'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 652:	「特注家具」の調達
register(
  652,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [2]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { id: 2 }
    ]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 12.7cm連装砲：'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 653:	工廠稼働！次期作戦準備！
register(
  653,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [6]
    static notFixState = true
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [{ id: 4 }]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 14cm単装砲：'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 654: 精鋭複葉機飛行隊の編成
register(
  654,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [1, 2]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [{ id: 242 }, { id: 249 }]
    static getCondition(svdata: SvData): DestroyItemCondition {
      return {
        flagship_ids: svdata.shipMstIds(515), // Ark Royal
        flagship_slotitem_ids: [242],
        flagship_slotitem_lvl: [10]
      }
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 Swordfish：', 'Fulmar：'], quest)
    }
  }
)

// 655: 工廠フル稼働！新兵装を開発せよ！
register(
  655,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [5, 5, 5, 5, 5]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { type: SlotitemType.SmallMainGun },
      { type: SlotitemType.MediumMainGun },
      { type: SlotitemType.LargeMainGun },
      { type: SlotitemType.RecSeaplane },
      { type: SlotitemType.TorpedoBomber }
    ]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 小口：', '中口：', '大口：', '偵察機：', '艦攻：'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 656: 六三一空「晴嵐」隊の編成
register(
  656,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [1]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = []
    static getCondition(svdata: SvData): DestroyItemCondition {
      return {
        flagship_ids: [
          svdata.shipMstIds(155), //  i401
          svdata.shipMstIds(295), //  i14
          svdata.shipMstIds(294), //  i13
        ].flat(),
        flagship_slotitem_ids: [62, 207],
        flagship_slotitem_lvl: [],
      }
    }
    static formatter(_quest: Quest): string {
      return ''
    }
  }
)

// 657:	新型兵装開発整備の強化
register(
  657,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [6, 5, 4]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { type: SlotitemType.SmallMainGun },
      { type: SlotitemType.MediumMainGun },
      { type: SlotitemType.Torpedo },
    ]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 小口径:', '中口径:', '魚雷:'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 658:	潜水艦武装の強化
register(
  658,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [4]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { id: 13 },
    ]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 61cm三連装魚雷:'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 659: 精鋭「水戦」隊の新編成
register(
  659,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [2, 2]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { id: 20 },
      { id: 26 },
    ]
    static getCondition(_svdata: SvData): DestroyItemCondition {
      return {
        flagship_slotitem_ids: [165],
        flagship_slotitem_lvl: [10],
        flagship_slotitem_alv_max: true,
      }
    }
    static formatter(_quest: Quest): string {
      return ''
    }
  }
)

// 660: 精鋭「水戦」隊の新編成
register(
  660,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [2, 2]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { id: 20 },
      { id: 26 },
    ]
    static getCondition(svdata: SvData) {
      return undefined
    }
    static formatter(_quest: Quest): string {
      return ''
    }
  }
)

// 661: 精鋭「水戦」隊の新編成
register(
  661,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [10]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { type: SlotitemType.SecondaryGun },
    ]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 副砲:'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 662: 新型艤装の開発研究
register(
  662,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [10]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { type: SlotitemType.MediumMainGun },
    ]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 中口径:'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 663:	新型艤装の継続研究
register(
  663,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [10]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [{ type: SlotitemType.LargeMainGun }]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 大口径：'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 664:	電探技術の射撃装置への活用
register(
  664,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [10]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { types: [SlotitemType.SmallRadar, SlotitemType.LargeRadar] },
    ]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 電探：'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 665:	民生産業への協力
register(
  665,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [16]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { type: SlotitemType.SmallMainGun },
    ]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 小口径：'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 666: 精鋭「瑞雲」隊の編成
register(
  666,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [2]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { id: 20 },
    ]
    static getCondition(svdata: SvData): DestroyItemCondition {
      return {
        flagship_ids: svdata.shipMstIds(88), // hyuga kai
        flagship_slotitem_ids: [0, 0, 0, 79],
        flagship_slotitem_lvl: [0, 0, 0, 10],
      }
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 ドラム缶：'], quest)
    }
  }
)

// 667:	民生産業への協力を継続せよ！
register(
  667,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [10]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { type: SlotitemType.AAGun },
    ]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 機銃：'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 668:	新型戦闘糧食の試作
register(
  668,
  class {
    static readonly questType = QuestType.slotitemCondition
    static max = [2]
    static key = QuestKey.infer
    static slotitem_ids = [145]
    static formatter(quest: Quest): string {
      return detailFormat(['戦闘糧食：'], quest)
    }
  }
)

// 673:	装備開発力の整備
register(
  673,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [4]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [{ type: SlotitemType.SmallMainGun }]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 小口径：'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 674:	工廠環境の整備
register(
  674,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [3]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [{ type: SlotitemType.AAGun }]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 機銃：'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 675:	運用装備の統合整備
register(
  675,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [6, 4]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { type: SlotitemType.Fighter },
      { type: SlotitemType.AAGun }
    ]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 艦戦：', '機銃：'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 676:	装備開発力の集中整備
register(
  676,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [3, 3, 1]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { type: SlotitemType.MediumMainGun },
      { type: SlotitemType.SecondaryGun },
      { type: SlotitemType.STContainer }
    ]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 中口径：', '副砲：', 'ドラム缶：'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 677:	継戦支援能力の整備
register(
  677,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [4, 2, 3]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { type: SlotitemType.LargeMainGun },
      { type: SlotitemType.RecSeaplane },
      { type: SlotitemType.Torpedo }
    ]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 大口径：', '水偵：', '魚雷：'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 678: 主力艦上戦闘機の更新
register(
  678,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [3, 5]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [{ id: 19 }, { id: 20 }]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 九六式艦戦：', '零式艦戦21型：'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 679: 対空兵装の拡充
register(
  679,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [6, 3]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { type: SlotitemType.MediumMainGun }, 
      { type: SlotitemType.SecondaryGun }
    ]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 中口径：', '副砲：'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 680:	対空兵装の整備拡充
register(
  680,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [4, 4]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { type: SlotitemType.AAGun },
      { types: [SlotitemType.SmallRadar, SlotitemType.LargeRadar] }
    ]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 機銃：', '電探：'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 681: 航空戦力の再編増強準備
register(
  681,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [4, 4]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { type: SlotitemType.DiveBomber },
      { type: SlotitemType.TorpedoBomber }
    ]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 艦爆：', '艦攻：'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 685:	駆逐艦主砲兵装の戦時改修
register(
  685,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [4, 1]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [{ id: 3 }, { id: 121 }]
    static getCondition(_svdata: SvData): DestroyItemCondition {
      return {
        flagship_categories: [
          ApiShipCategory.fubuki,
          ApiShipCategory.ayanami,
          ApiShipCategory.akatuki
        ],
        flagship_slotitem_ids: [294],
        flagship_slotitem_lvl: [10]
      }
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 10cm連装高角：', '94式高射：'], quest)
    }
  }
)

// 686:	戦時改修A型高角砲の量産
register(
  686,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [4, 1]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [{ id: 3 }, { id: 121 }]
    static getCondition(_svdata: SvData): DestroyItemCondition {
      return {
        flagship_categories: [
          ApiShipCategory.fubuki,
          ApiShipCategory.ayanami,
          ApiShipCategory.akatuki
        ],
        flagship_slotitem_ids: [294],
        flagship_slotitem_lvl: [10]
      }
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 10cm連装高角：', '94式高射：'], quest)
    }
  }
)

// 687:	駆逐艦主砲兵装の戦時改修【II】
register(
  687,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [5, 1]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [{ id: 3 }, { id: 121 }]
    static getCondition(_svdata: SvData): DestroyItemCondition {
      return {
        flagship_ids: [144, 145],
        flagship_slotitem_ids: [63],
        flagship_slotitem_lvl: [10]
      }
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 10cm連装高角：', '94式高射：'], quest)
    }
  }
)

// 688:	航空戦力の強化
register(
  688,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [3, 3, 3, 3]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { type: SlotitemType.Fighter },
      { type: SlotitemType.DiveBomber },
      { type: SlotitemType.TorpedoBomber },
      { type: SlotitemType.RecSeaplane }
    ]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 艦戦：', '艦爆：', '艦攻：', '水偵'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 689:	戦闘機隊戦力の拡充
register(
  689,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [4, 4, 2]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { type: SlotitemType.Fighter },
      { type: SlotitemType.RecSeaplane },
      { type: SlotitemType.RecAircraft },
    ]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 艦戦：', '水偵：', '艦偵：'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 690:	基地航空隊戦力の拡充
register(
  690,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [4, 4, 4]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { type: SlotitemType.Fighter },
      { type: SlotitemType.DiveBomber },
      { type: SlotitemType.TorpedoBomber },
    ]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 艦戦：', '艦爆：', '艦攻：'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 691:	提督室のリフォーム
register(
  691,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [4, 4, 4]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { type: SlotitemType.MediumMainGun },
      { type: SlotitemType.SecondaryGun },
      { type: SlotitemType.AAGun },
    ]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 中口径：', '副砲：', '機銃：'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 692:	水上艦艇装備工廠の整備
register(
  692,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [5, 5, 5]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { type: SlotitemType.SmallMainGun },
      { type: SlotitemType.LargeMainGun },
      { type: SlotitemType.RecSeaplane },
    ]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 小口径：', '大口径：', '水偵：'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 693:	回転翼機の開発
register(
  693,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [4, 3, 2]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { type: SlotitemType.RecSeaplane },
      { type: SlotitemType.Fighter },
      { type: SlotitemType.TorpedoBomber },
    ]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 水偵：', '艦戦：', '艦攻：'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 694:	新型航空艤装の研究
register(
  694,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [4, 4, 2]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { id: 26 },
      { id: 24 },
      { id: 18 },
    ]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 瑞雲：', '彗星：', '流星：'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 695: 「彗星」艦爆の新運用研究
register(
  695,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [4, 3, 2]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [
      { id: 24 }, 
      { id: 23 }, 
      { id: 26 }
    ]
    static getCondition(_svdata: SvData): DestroyItemCondition {
      return {
        flagship_ids: [553, 554],
        flagship_slotitem_ids: [57],
        flagship_slotitem_lvl: []
      }
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 彗星：', '九九式艦爆：', '瑞雲：'], quest)
    }
  }
)

// 696: 最精鋭「瑞雲」隊の編成
register(
  696,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [6, 3, 1]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [{ id: 26 }, { id: 24 }, { id: 22 }]
    static getCondition(_svdata: SvData): DestroyItemCondition {
      return {
        flagship_ids: [553, 554],
        flagship_slotitem_ids: [322],
        flagship_slotitem_lvl: [10]
      }
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 瑞雲：', '彗星：', '試製烈風(後期型)：'], quest)
    }
  }
)

// 697: 【春の期間限定任務】下駄履きメカジキの改修

// 698: 新鋭対潜哨戒航空戦力の導入
register(
  698,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [2, 1, 1]
    static key = QuestKey.infer
    static id_or_types: ItemIdOrType[] = [{ id: 256 }, { id: 18 }, { id: 52 }]
    static getCondition(_svdata: SvData): DestroyItemCondition {
      return {
        flagship_ids: [646],
        flagship_slotitem_ids: [257],
        flagship_slotitem_lvl: []
      }
    }
    static formatter(quest: Quest): string {
      return detailFormat(['加賀改二護旗艦 破棄 TBF：', '流星：', '流星改：'], quest)
    }
  }
)

// 701:	はじめての「近代化改修」！
register(
  701,
  class {
    static readonly questType = QuestType.kaisou
    static max = [1]
    static key = QuestKey.infer
    static need_succeeded = false
    static formatter(quest: Quest): string {
      return detailFormatOne(['近代化改修実施：'], quest)
    }
  }
)

// 702:	艦の「近代化改修」を実施せよ！
register(
  702,
  class {
    static readonly questType = QuestType.kaisou
    static max = [2]
    static key = QuestKey.infer
    static need_succeeded = true
    static formatter(quest: Quest): string {
      return detailFormat(['近代化改修成功：'], quest)
    }
  }
)

// 703:	「近代化改修」を進め、戦備を整えよ！
register(
  703,
  class {
    static readonly questType = QuestType.kaisou
    static max = [15]
    static key = QuestKey.infer
    static need_succeeded = true
    static formatter(quest: Quest): string {
      return detailFormat(['近代化改修成功：'], quest)
    }
  }
)

// 707:【桃の節句任務】駆逐艦桃の節句改修
register(
  707,
  class {
    static readonly questType = QuestType.kaisouUseType
    static max = [2]
    static key = QuestKey.yearly
    static powerup_ship_type = ApiShipType.kutikukan
    static use_ship_type: ShipTypeCount = [ApiShipType.keijyun, 3]
    static formatter(quest: Quest): string {
      return detailFormat(['駆逐艦への軽巡3隻使用改修成功：'], quest)
    }
  }
)

// 708:【桃の節句任務】海防艦桃の節句改修
register(
  708,
  class {
    static readonly questType = QuestType.kaisouUseType
    static max = [2]
    static key = QuestKey.yearly
    static powerup_ship_type = ApiShipType.kaiboukan
    static use_ship_type: ShipTypeCount = [ApiShipType.kutikukan, 5]
    static formatter(quest: Quest): string {
      return detailFormat(['海防艦への駆逐艦5隻使用改修成功：'], quest)
    }
  }
)

// 709:【桃の節句拡張任務】菱餅特別改修2026
register(
  709,
  class {
    static readonly questType = QuestType.kaisouUseCategoryToCategory
    static max = [3]
    static key = QuestKey.yearly
    static powerup_ship_cats = [ApiShipCategory.fubuki]
    static use_ship_cats = [ApiShipCategory.sendai]
    static use_ship_count = 3
    static formatter(quest: Quest): string {
      return detailFormat(['吹雪型への川内型3隻使用改修成功：'], quest)
    }
  }
)


// 710: 【桃の節句】菱餅改修：2021序
register(
  710,
  class {
    static readonly questType = QuestType.kaisouUseId
    static max = [1]
    static key = QuestKey.yearly
    static powerup_ship_type = ApiShipType.kutikukan
    static use_ship_ids = [
      1, 254, 434, 2, 255, 435, 164, 308, 165, 309, 28, 256, 418, 481, 366, 29, 257, 548, 30, 259,
      7, 260, 31, 261
    ]
    static use_ship_count = 4
    static formatter(quest: Quest): string {
      return detailFormatOne(['駆逐艦へ睦月型4隻使用改修成功1回：'], quest)
    }
  }
)

// 711: 【桃の節句】菱餅改修：2021破
register(
  711,
  class {
    static readonly questType = QuestType.kaisouUseIdToId
    static max = [2]
    static key = QuestKey.yearly
    static powerup_ship_ids = [
      13, 207, 195, 3, 479, 390, 480, 391, 93, 230, 15, 231, 665, 94, 232, 16, 233, 407
    ]
    static use_ship_ids = [
      9, 201, 426, 10, 202, 32, 203, 11, 204, 33, 205, 420, 631, 700, 12, 206, 486, 368
    ]
    static use_ship_count = 5
    static formatter(quest: Quest): string {
      return detailFormat(['綾波型への吹雪型駆逐艦5隻使用改修成功：'], quest)
    }
  }
)

// 712: 【桃の節句】菱餅改修：2021週
register(
  712,
  class {
    static readonly questType = QuestType.kaisouUseType
    static max = [2]
    static key = QuestKey.yearly
    static powerup_ship_type = ApiShipType.jyuujyun
    static use_ship_type: ShipTypeCount = [ApiShipType.keijyun, 4]
    static formatter(quest: Quest): string {
      return detailFormat(['重巡への軽巡4隻使用改修成功：'], quest)
    }
  }
)

// 713: 【桃の節句】菱餅改修：2021空
register(
  713,
  class {
    static readonly questType = QuestType.kaisouUseType
    static max = [2]
    static key = QuestKey.yearly
    static powerup_ship_type = ApiShipType.seiki_kuubo
    static use_ship_type: ShipTypeCount = [ApiShipType.kei_kuubo, 5]
    static formatter(quest: Quest): string {
      return detailFormat(['正規空母への軽空母5隻使用改修成功：'], quest)
    }
  }
)

// 714:	「駆逐艦」の改修工事を実施せよ！
register(
  714,
  class {
    static readonly questType = QuestType.kaisouUseType
    static max = [2]
    static key = QuestKey.infer
    static powerup_ship_type = ApiShipType.kutikukan
    static use_ship_type: ShipTypeCount = [ApiShipType.kutikukan, 3]
    static formatter(quest: Quest): string {
      return detailFormat(['駆逐艦への駆逐艦3隻使用改修成功：'], quest)
    }
  }
)

// 715: 続：「駆逐艦」の改修工事を実施せよ！
register(
  715,
  class {
    static readonly questType = QuestType.kaisouUseType
    static max = [2]
    static key = QuestKey.infer
    static powerup_ship_type = ApiShipType.kutikukan
    static use_ship_type: ShipTypeCount = [ApiShipType.keijyun, 3]
    static formatter(quest: Quest): string {
      return detailFormat(['駆逐艦への軽巡3隻使用改修成功：'], quest)
    }
  }
)

// 716: 「軽巡」級の改修工事を実施せよ！
register(
  716,
  class {
    static readonly questType = QuestType.kaisouUseType
    static max = [2]
    static key = QuestKey.infer
    static powerup_ship_type = ApiShipType.keijyun
    static use_ship_type: ShipTypeCount = [ApiShipType.keijyun, 3]
    static formatter(quest: Quest): string {
      return detailFormat(['軽巡への軽巡3隻使用改修成功：'], quest)
    }
  }
)

// 717: 続：「軽巡」級の改修工事を実施せよ！
register(
  717,
  class {
    static readonly questType = QuestType.kaisouUseType
    static max = [2]
    static key = QuestKey.infer
    static powerup_ship_type = ApiShipType.keijyun
    static use_ship_type: ShipTypeCount = [ApiShipType.jyuujyun, 3]
    static formatter(quest: Quest): string {
      return detailFormat(['軽巡への重巡3隻使用改修成功：'], quest)
    }
  }
)

// 718: 「最上型」改修工事を実施せよ！
register(
  718,
  class {
    static readonly questType = QuestType.kaisouUseTypeToId
    static max = [2]
    static key = QuestKey.yearly
    static powerup_ship_ids = [
      70,
      73,
      501,
      506, // mogami
      120,
      121, // mikuma
      124,
      129,
      503,
      508, // suzuya
      125,
      130,
      504,
      509
    ] // kumano
    static use_ship_type = [ApiShipType.keijyun, ApiShipType.renjyun, ApiShipType.raijyun]
    static use_ship_count = 3
    static formatter(quest: Quest): string {
      return detailFormat(['最上型への軽巡級3隻使用改修成功：'], quest)
    }
  }
)

// 719: 続：「最上型」改修工事を実施せよ！
register(
  719,
  class {
    static readonly questType = QuestType.kaisouUseTypeToId
    static max = [2]
    static key = QuestKey.infer
    static powerup_ship_ids = [70, 73, 501, 506, 120, 121, 124, 129, 503, 508, 125, 130, 504, 509]
    static use_ship_type = [ApiShipType.jyuujyun, ApiShipType.koujyun]
    static use_ship_count = 4
    static formatter(quest: Quest): string {
      return detailFormat(['最上型への重巡級4隻使用改修成功：'], quest)
    }
  }
)

// 720: 【期間限定:拡張任務】夕雲型改装任務！
register(
  720,
  class {
    static readonly questType = QuestType.kaisouUseCategoryToType
    static max = [3]
    static key = QuestKey.infer
    static powerup_ship_cats = [ApiShipCategory.yuugumo]
    static use_ship_types = [ApiShipType.jyuujyun, ApiShipType.koujyun]
    static use_ship_count = 3
    static formatter(quest: Quest): string {
      return detailFormat(['夕雲型への重巡級3隻使用改修成功：'], quest)
    }
  }
)


// 801:	迎春新年！二〇二六年、艦隊抜錨せよ！
register(
  801,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.yearly
    static maps: QuestMap[] = [
      [1, 1, 'S'],
      [1, 2, 'S'],
      [1, 3, 'S'],
      [1, 5, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      if (
        shipTypeCount([ships[0]], [ApiShipType.keijyun, ApiShipType.renjyun, ApiShipType.raijyun]) <
        1
      ) {
        return false
      }
      if (shipTypeCount(ships, [ApiShipType.kaiboukan]) >= 2) {
        return true
      }
      if (shipTypeCount(ships, [ApiShipType.kutikukan]) >= 3) {
        return true
      }
      return false
    }
  }
)

// 802:	賀正！令和八年、精鋭巡洋艦戦隊、出撃始めッ！
register(
  802,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [1, 4, 'S'],
      [2, 1, 'S'],
      [2, 2, 'S'],
      [2, 3, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      const checkTypes = ApiShipTypeKeijyunClasses.concat(ApiShipTypeJyujyunClasses)
      if (shipTypeCount([ships[0]], checkTypes) < 1) {
        return false
      }
      if (shipTypeCount(ships, checkTypes) < 3) {
        return false
      }
      if (shipTypeCount(ships, [ApiShipType.kutikukan]) < 1) {
        return false
      }
      return true
    }
  }
)

// 803:	謹賀新年2026年！空母機動部隊、西へ！南北へ！
register(
  803,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [3, 1, 'S'],
      [4, 2, 'S'],
      [5, 2, 'S'],
      [4, 1, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      if (shipTypeCount([ships[0]], ApiShipTypeKuboClasses) < 1) {
        return false
      }
      return shipTypeCount(ships, [ApiShipType.kutikukan]) >= 2
    }
  }
)

// 804:	新春【拡張作戦】精鋭日英米空母、新年協同作戦！
register(
  804,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMapOrCell[] = [
      [2, 5, 'S'],
      QuestMapCell_7_2_2('S'),
      [6, 2, 'S'],
      [4, 5, 'S'],
      [5, 5, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      const check_ids = [
        svdata.shipMstIds(515), // Ark Royal
        svdata.shipMstIds(885), // Victorious
        svdata.shipMstIds(549), // Intrepid
        svdata.shipMstIds(603), // Hornet
        svdata.shipMstIds(90), // souryu
        svdata.shipMstIds(91), // hiryu
        svdata.shipMstIds(110), // syoukaku
        svdata.shipMstIds(111) // zuikaku
      ].flat()
      return shipCount(ships, check_ids) >= 2
    }
  }
)

// 817: 新編艦隊、南西諸島防衛線へ急行せよ！
register(
  817,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [[1, 4, 'A']]
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      if (!shipTypeCount([ships[0]], ApiShipTypeKeijyunClasses)) {
        return false
      }
      return shipTypeCount(ships, [ApiShipType.kutikukan]) >= 4
    }
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
  }
)

// 822:	沖ノ島海域迎撃戦
register(
  822,
  class {
    static readonly questType = QuestType.battleMap
    static max = [2]
    static key = QuestKey.infer
    static maps: QuestMap[] = [[2, 4, 'S']]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
  }
)

// 824:	製油所地帯沿岸の哨戒を実施せよ！
register(
  824,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [[1, 3, 'S']]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      if (shipTypeCount([ships[0]], [ApiShipType.kei_kuubo]) < 1) {
        return false
      }
      return shipTypeCount(ships.slice(1), [ApiShipType.kutikukan]) >= 3
    }
  }
)

// 840: 【節分任務:豆】節分作戦二〇二六
register(
  840,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [2, 2, 2]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [1, 2, 'A'],
      [1, 3, 'A'],
      [1, 4, 'A']
    ]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (ship_ids.length < 2) {
        return false
      }
      const ships = toShipMsts(svdata, [ship_ids[0], ship_ids[1]])
      const check_ids = [
        svdata.shipMstIds(89), // housyou
        svdata.shipMstIds(183), // ooyodo
        svdata.shipMstIds(93), // oboro
        svdata.shipMstIds(94), // sazanami
        svdata.shipMstIds(15), // akebono
        svdata.shipMstIds(16), // usio
        svdata.shipMstIds(953), // asahi
        svdata.shipMstIds(182), // akasi
        svdata.shipMstIds(634), //jingei
        svdata.shipMstIds(635), // tyogei
      ].flat()
      return shipCount(ships, check_ids) == 2
    }
  }
)

// 841: 【節分任務:鬼】南西方面節分作戦二〇二六
register(
  841,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [2, 2, 2]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [2, 1, 'A'],
      [2, 2, 'A'],
      [2, 3, 'A']
    ]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (ship_ids.length < 2) {
        return false
      }
      const ships = toShipMsts(svdata, [ship_ids[0], ship_ids[1]])
      const check_ids = [
        svdata.shipMstIds(935), // Jean Bart
        svdata.shipMstIds(931), // Ranger
        svdata.shipMstIds(534), // snyou
        svdata.shipMstIds(1005), // Minneapolis
        svdata.shipMstIds(115), // yuubari
        svdata.shipMstIds(965), // Gloire
        svdata.shipMstIds(562), // Johnston
        svdata.shipMstIds(453), // kazagumo
        svdata.shipMstIds(409), // hayasimo
      ].flat()
      return shipCount(ships, check_ids) == 2
    }
  }
)

// 843: 【節分任務:柊】節分拡張作戦二〇二六、重巡出撃！
register(
  843,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMapOrCell[] = [
      [4, 1, 'S'],
      [4, 2, 'S'],
      [4, 3, 'S'],
      QuestMapCell_7_5_3('S')
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (ship_ids.length < 3) {
        return false
      }
      const ships = toShipMsts(svdata, ship_ids)
      if (! shipTypeCount([ships[0]], [ApiShipType.jyuujyun])) {
        return false
      }
      const ships1 = ships.slice(1)
      if (! shipTypeCount(ships1, [ApiShipType.jyuujyun])) {
        return false
      }
      const check_ids = [
        svdata.shipMstIds(161), // akitsumaru
        svdata.shipMstIds(900), // yamasiomaru
        svdata.shipMstIds(943) // kumanomaru
      ].flat()
      if (! shipTypeCount(ships1, [ApiShipType.kei_kuubo]) && ! shipCount(ships1, check_ids)) {
        return false
      }
      return true
    }
  }
)

// 845:	発令！「西方海域作戦」
register(
  845,
  class {
    static readonly questType = QuestType.battleMap
    static max = [1, 1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [4, 1, 'S'],
      [4, 2, 'S'],
      [4, 3, 'S'],
      [4, 4, 'S'],
      [4, 5, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
  }
)

// 847: 球磨型軽巡一番艦、出撃だクマ！
register(
  847,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMapOrCell[] = [[2, 2, 'S'], [3, 2, 'S'], QuestMapCell_7_3_2('S'), [1, 6, '']]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      return isShipIds(svdata, ship_ids[0], [652, 657])
    }
  }
)

// 854:	戦果拡張任務！「Z 作戦」前段作戦
register(
  854,
  class {
    static readonly questType = QuestType.battleMap
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [2, 4, 'A'],
      [6, 1, 'A'],
      [6, 3, 'A'],
      [6, 4, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
  }
)

// 861:	強行輸送艦隊、抜錨！
register(
  861,
  class {
    static readonly questType = QuestType.mapGoal
    static max = [2]
    static key = QuestKey.infer
    static maps: QuestMap[] = [[1, 6, '']]
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      const count = shipTypeCount(ships, [ApiShipType.koukuu_senkan, ApiShipType.hokyuukan])
      if (2 <= count) {
        return true
      }
      return false
    }
    static formatter(quest: Quest): string {
      return detailFormat(['1-6 ゴール：'], quest)
    }
  }
)

// 862: 前線の航空偵察を実施せよ！
register(
  862,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [2]
    static key = QuestKey.infer
    static maps: QuestMap[] = [[6, 3, 'A']]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      if (shipTypeCount(ships, [ApiShipType.suibo]) < 1) {
        return false
      }
      if (shipTypeCount(ships, [ApiShipType.keijyun]) < 2) {
        return false
      }
      return true
    }
  }
)

// 866: 秋刀魚漁：鎮守府秋刀魚祭り開幕だね。頑張ろう！
register(
  866,
  class {
    static readonly questType = QuestType.collectItem
    static max = [10]
    static key = QuestKey.yearly
    static item_id = ApiItemId.saury
    static formatter(quest: Quest): string {
      return detailFormat(['秋刀魚所持数：'], quest)
    }
  }
)

// 867: 秋刀魚漁：こんなに美味しいなんて！司令、最高です！
register(
  867,
  class {
    static readonly questType = QuestType.collectItem
    static max = [20]
    static key = QuestKey.yearly
    static item_id = ApiItemId.saury
    static formatter(quest: Quest): string {
      return detailFormat(['秋刀魚所持数：'], quest)
    }
  }
)

// 868: 秋刀魚漁：秋月型の秋刀魚祭り、全力で参りますっ！
register(
  868,
  class {
    static readonly questType = QuestType.collectItem
    static max = [50]
    static key = QuestKey.yearly
    static item_id = ApiItemId.saury
    static formatter(quest: Quest): string {
      return detailFormat(['秋刀魚所持数：'], quest)
    }
  }
)

// 869: 補給線の安全を確保せよ！
register(
  869,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [1, 3, 'A'],
      [1, 4, 'A'],
      [1, 5, 'A'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      if (shipTypeCount([ships[0]], [ApiShipType.keijyun]) < 1) {
        return false
      }
      return shipTypeCount(ships.slice(1), [ApiShipType.kutikukan, ApiShipType.kaiboukan]) >= 2
    }
  }
)

// 872:	戦果拡張任務！「Z 作戦」後段作戦
register(
  872,
  class {
    static readonly questType = QuestType.battleMap
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMapOrCell[] = [QuestMapCell_7_2_2('S'), [5, 5, 'S'], [6, 2, 'S'], [6, 5, 'S']]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
  }
)

// 873: 北方海域警備を実施せよ！
register(
  873,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [3, 1, 'A'],
      [3, 2, 'A'],
      [3, 3, 'A']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      return shipTypeCount(ships, [ApiShipType.keijyun]) >= 1
    }
  }
)

// 875:	精鋭「三一駆」、鉄底海域に突入せよ！
register(
  875,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [2]
    static key = QuestKey.infer
    static maps: QuestMap[] = [[5, 4, 'S']]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      if (!shipCount(ships, [543])) {
        return false
      }
      const check_ids = [
        svdata.shipMstIds(345),
        svdata.shipMstIds(359),
        svdata.shipMstIds(344)
      ].flat()
      return shipCount(ships, check_ids) >= 1
    }
  }
)

// 882:【節分任務:最終拡張作戦】節分二〇二六 戦果拡大！
register(
  882,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [2, 2, 2, 2]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [1, 5, 'S'],
      [3, 2, 'S'],
      [5, 3, 'S'],
      [6, 2, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const check_ids = [
        svdata.shipMstIds(137), // agano
        svdata.shipMstIds(140), // sakawa
        svdata.shipMstIds(2), // kisaragi
        svdata.shipMstIds(11), // miyuki
        svdata.shipMstIds(486), // uranami
        svdata.shipMstIds(479), // amagiri
        svdata.shipMstIds(480), // sagiri
        svdata.shipMstIds(583), // minegumo
        svdata.shipMstIds(410), // kiyosimo
        svdata.shipMstIds(425), // asasimo
        svdata.shipMstIds(451), // mizuho
      ].flat()
      if (! shipCount([msts[0]], check_ids)) {
        return false
      }
      return shipCount(msts.slice(1), check_ids) >= 2
    }
  }
)

// 888:	新編成「三川艦隊」、鉄底海峡に突入せよ！
register(
  888,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [5, 1, 'S'],
      [5, 3, 'S'],
      [5, 4, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      const check_ids = [
        svdata.shipMstIds(69),
        svdata.shipMstIds(61),
        svdata.shipMstIds(123),
        svdata.shipMstIds(60),
        svdata.shipMstIds(59),
        svdata.shipMstIds(51),
        svdata.shipMstIds(115)
      ].flat()
      return shipCount(ships, check_ids) >= 4
    }
  }
)

// 893:	泊地周辺海域の安全確保を徹底せよ！
register(
  893,
  class {
    static readonly questType = QuestType.battleMap
    static max = [3, 3, 3, 3]
    static key = QuestKey.infer
    static maps: QuestMapOrCell[] = [
      [1, 5, 'S'],
      [7, 1, 'S'],
      QuestMapCell_7_2_1('S'),
      QuestMapCell_7_2_2('S')
    ]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
  }
)

// 894: 空母戦力の投入による兵站線戦闘哨戒
register(
  894,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [1, 3, 'S'],
      [1, 4, 'S'],
      [2, 1, 'S'],
      [2, 2, 'S'],
      [2, 3, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      return shipTypeCount(ships, ApiShipTypeKuboClasses) >= 1
    }
  }
)

// 898: 北の海から愛をこめて
register(
  898,
  class {
    static readonly questType = QuestType.battleMap
    static max = [1, 1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [3, 1, 'A'],
      [3, 2, 'A'],
      [3, 3, 'A'],
      [3, 4, 'A'],
      [3, 5, 'A']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
  }
)

// 903:	拡張「六水戦」、最前線へ！
register(
  903,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [5, 1, 'S'],
      [5, 4, 'S'],
      [6, 4, 'S'],
      [6, 5, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const flag_check_ids = svdata.shipMstIds(622)
      if (!isShipIds(svdata, ship_ids[0], flag_check_ids)) {
        return false
      }
      const ships = toShipMsts(svdata, ship_ids)
      const check1 = (): boolean => {
        return shipCount(ships, svdata.shipMstIds(23)) >= 1
      }
      const check2 = (): boolean => {
        const check_ids = [
          svdata.shipMstIds(1),
          svdata.shipMstIds(2),
          svdata.shipMstIds(164),
          svdata.shipMstIds(165),
          svdata.shipMstIds(30),
          svdata.shipMstIds(31)
        ].flat()
        return shipCount(ships, check_ids) >= 2
      }
      return check1() || check2()
    }
  }
)

// 904:	精鋭「十九駆」、躍り出る！
register(
  904,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [2, 5, 'S'],
      [3, 4, 'S'],
      [4, 5, 'S'],
      [5, 3, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      const check_ids = [195, 627]
      return shipCount(ships, check_ids) === 2
    }
  }
)

// 905:	「海防艦」、海を護る！
register(
  905,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [1, 1, 'A'],
      [1, 2, 'A'],
      [1, 3, 'A'],
      [1, 5, 'A'],
      [1, 6, '']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) > 5) {
        return false
      }
      const ships = toShipMsts(svdata, ship_ids)
      return shipTypeCount(ships, [ApiShipType.kaiboukan]) >= 3
    }
  }
)

// 906:【桃の節句】鎮守府近海の安全確保作戦2022
register(
  906,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.yearly
    static maps: QuestMap[] = [
      [1, 2, 'A'],
      [1, 3, 'A'],
      [1, 5, 'A'],
      [1, 6, '']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      return shipTypeCount(ships, [ApiShipType.kutikukan, ApiShipType.kaiboukan]) >= 3
    }
  }
)

// 907:【桃の節句】南西諸島海域 春の戦闘哨戒2026
register(
  907,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [2, 2, 2]
    static key = QuestKey.yearly
    static maps: QuestMap[] = [
      [2, 1, 'S'],
      [2, 2, 'S'],
      [2, 3, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      return shipTypeCount(ships, [ApiShipType.kutikukan, ApiShipType.kaiboukan]) >= 4
    }
  }
)

// 908:【桃の節句】春の雛祭り艦隊決戦！2026
register(
  908,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [2, 2, 2]
    static key = QuestKey.yearly
    static maps: QuestMapOrCell[] = [[2, 4, 'S'], [2, 5, 'S'], QuestMapCell_7_2_2('S')]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      const check_ids = [
        svdata.shipMstIds(1005), // Minneapolis
        svdata.shipMstIds(561), // Samuel B.Roberts
        svdata.shipMstIds(133), // yuugumo
        svdata.shipMstIds(16), // usio
      ].flat()
      if (! shipCount([ships[0]], check_ids)) {
        return false
      }
      return shipCount(ships.slice(1), check_ids) >= 1
    }
  }
)

// 909:【桃の節句：拡張作戦】春の攻勢作戦！
register(
  909,
  class {
    static readonly questType = QuestType.battleMap
    static max = [1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [3, 5, 'S'],
      [4, 5, 'S'],
      [6, 4, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
  }
)

// 910: 【年末年始】鎮守府海域哨戒、警戒を厳に！
register(
  910,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [2, 2, 2]
    static key = QuestKey.yearly
    static maps: QuestMap[] = [
      [1, 1, 'S'],
      [1, 2, 'S'],
      [1, 3, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      if (shipTypeCount(ships, [ApiShipType.keijyun]) < 1) {
        return false
      }
      return shipTypeCount(ships, [ApiShipType.kutikukan, ApiShipType.kaiboukan]) >= 3
    }
  }
)

// 912:	工作艦「明石」護衛任務
register(
  912,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [1, 3, 'A'],
      [2, 1, 'A'],
      [2, 2, 'A'],
      [2, 3, 'A'],
      [1, 6, '']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const flag_check_ids = svdata.shipMstIds(182)
      if (!isShipIds(svdata, ship_ids[0], flag_check_ids)) {
        return false
      }
      const ships = toShipMsts(svdata, ship_ids)
      return shipTypeCount(ships, [ApiShipType.kutikukan]) >= 3
    }
  }
)

// 914:	重巡戦隊、西へ！
register(
  914,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [4, 1, 'A'],
      [4, 2, 'A'],
      [4, 3, 'A'],
      [4, 4, 'A']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      if (shipTypeCount(ships, [ApiShipType.jyuujyun]) < 3) {
        return false
      }
      return shipTypeCount(ships, [ApiShipType.kutikukan]) >= 1
    }
  }
)

// 915:	【期間限定任務】飛べ！世界の下駄履き機！
register(
  915,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [1, 4, 'S'],
      [2, 3, 'S'],
      [2, 4, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      if (shipTypeCount([ships[0]], [ApiShipType.suibo]) < 1) {
        return false
      }
      return shipTypeCount(ships, [ApiShipType.kutikukan, ApiShipType.kaiboukan]) >= 2
    }
  }
)

// 928:	歴戦「第十方面艦隊」、全力出撃！
register(
  928,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [2, 2, 2]
    static key = QuestKey.infer
    static maps: QuestMapOrCell[] = [QuestMapCell_7_3_2('S'), QuestMapCell_7_2_2('S'), [4, 2, 'S']]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      const check_ids = [
        svdata.shipMstIds(65),
        svdata.shipMstIds(64),
        svdata.shipMstIds(62),
        svdata.shipMstIds(66),
        svdata.shipMstIds(471)
      ].flat()
      return shipCount(ships, check_ids) >= 2
    }
  }
)

// 931: 精鋭「二七駆」、回避運動は気をつけて
register(
  931,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [1, 5, 'S'],
      [2, 5, 'S'],
      [7, 1, 'S'],
      [5, 5, 'S'],
      [6, 3, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const check_ids = [svdata.shipMstIds(497), svdata.shipMstIds(145)].flat()
      return shipCount(toShipMsts(svdata, ship_ids), check_ids) === 2
    }
  }
)

// 932:【春限定】春の天津風！
register(
  932,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [2, 2, 2]
    static key = QuestKey.yearly
    static maps: QuestMapOrCell[] = [[2, 2, 'A'], [2, 3, 'A'], QuestMapCell_7_3_2('S')]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const flag_check_ids = svdata.shipMstIds(181)
      if (!isShipIds(svdata, ship_ids[0], flag_check_ids)) {
        return false
      }
      const check_ids = [
        svdata.shipMstIds(20),
        svdata.shipMstIds(186),
        svdata.shipMstIds(190)
      ].flat()
      return isShipIds(svdata, ship_ids[1] ?? 0, check_ids)
    }
  }
)

// 933:【艦隊司令部強化】艦隊旗艦、出撃せよ！
register(
  933,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [2, 2, 2, 2]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [1, 3, 'S'],
      [1, 4, 'S'],
      [2, 1, 'S'],
      [2, 2, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ooyodo = isShipIds(svdata, ship_ids[0], svdata.shipMstIds(183))
      const danyang = isShipIds(svdata, ship_ids[0], [651])
      if (!(ooyodo || danyang)) {
        return false
      }
      const ships = toShipMsts(svdata, ship_ids)
      const kaibou = shipTypeCount(ships, [ApiShipType.kaiboukan])
      if (kaibou >= 3) {
        return true
      }
      let kutiku = shipTypeCount(ships, [ApiShipType.kutikukan])
      if (danyang) {
        --kutiku
      }
      return kutiku >= 3
    }
  }
)

// 934: 奇跡の駆逐艦「雪風」、再び出撃す！
register(
  934,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMapOrCell[] = [
      [2, 3, 'S'],
      [2, 4, 'S'],
      [2, 5, 'S'],
      [3, 3, 'S'],
      QuestMapCell_7_3_2('S')
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      return isShipIds(svdata, ship_ids[0], svdata.shipMstIds(651))
    }
  }
)

// 935:	最精強！「呉の雪風」「佐世保の時雨」
register(
  935,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [5, 3, 'S'],
      [5, 5, 'S'],
      [4, 5, 'S'],
      [6, 4, 'S'],
      [6, 5, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const check_ids = [svdata.shipMstIds(145), svdata.shipMstIds(656)].flat()
      return shipCount(toShipMsts(svdata, ship_ids), check_ids) === 2
    }
  }
)

// 936:	改装最新鋭軽巡「能代改二」、出撃せよ！
register(
  936,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMapOrCell[] = [
      [2, 4, 'S'],
      [3, 2, 'S'],
      [5, 3, 'S'],
      [7, 1, 'S'],
      QuestMapCell_7_2_2('S')
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (!isShipIds(svdata, ship_ids[0], svdata.shipMstIds(662))) {
        return false
      }
      const ships = toShipMsts(svdata, ship_ids)
      return shipTypeCount(ships, [ApiShipType.kutikukan]) >= 3
    }
  }
)

// 937: 精鋭「第七駆逐隊」、出撃せよ！
register(
  937,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [2, 3, 'S'],
      [3, 2, 'S'],
      [4, 4, 'S'],
      [5, 4, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const check_ids = [svdata.shipMstIds(665), svdata.shipMstIds(407)].flat()
      return shipCount(toShipMsts(svdata, ship_ids), check_ids) === 2
    }
  }
)

// 938: 改装航空巡洋艦「最上」、抜錨せよ！
register(
  938,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [2, 2, 'S'],
      [2, 4, 'S'],
      [4, 5, 'S'],
      [5, 1, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      return isShipIds(svdata, ship_ids[0], svdata.shipMstIds(501))
    }
  }
)

// 939: 西村艦隊、精鋭先行掃討隊、前進せよ！
register(
  939,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.yearly
    static maps: QuestMapOrCell[] = [
      [2, 3, 'S'],
      [6, 4, 'S'],
      QuestMapCell_7_2_2('S'),
      QuestMapCell_7_3_2('S')
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) < 6) {
        return false
      }
      if (!isShipIds(svdata, ship_ids[0], [501, 506])) {
        return false
      }
      const ships = toShipMsts(svdata, ship_ids)
      const check = [
        svdata.shipMstIds(43),
        svdata.shipMstIds(97),
        svdata.shipMstIds(413),
        svdata.shipMstIds(414)
      ].flat()
      return shipCount(ships, check) >= 2
    }
  }
)

// 940: 二水戦旗艦、この「矢矧」が預かります！
register(
  940,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [1, 4, 'S'],
      [2, 5, 'S'],
      [5, 3, 'S'],
      [5, 5, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (!isShipIds(svdata, ship_ids[0], svdata.shipMstIds(663))) {
        return false
      }
      const ships = toShipMsts(svdata, ship_ids)
      return shipTypeCount(ships, [ApiShipType.kutikukan]) >= 2
    }
  }
)

// 941: 【春限定】春の近海哨戒お散歩！2026
register(
  941,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [1, 2, 'A'],
      [1, 3, 'A'],
      [2, 1, 'A'],
      [2, 2, 'A']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) > 5) {
        return false
      }
      const ships = toShipMsts(svdata, ship_ids)
      if (! shipTypeCount([ships[0]], [ApiShipType.kutikukan, ApiShipType.renjyun, ApiShipType.sensuibokan])) {
        return false
      }
      return shipTypeCount(ships.slice(1), [ApiShipType.kutikukan, ApiShipType.kaiboukan, ApiShipType.sensuikan]) === 4
    }
  }
)

// 942: 続：春のお散歩哨戒です！
register(
  942,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [2, 2, 2]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [2, 3, 'A'],
      [2, 5, 'A'],
      [3, 5, 'A'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) < 2) {
        return false
      }
      const ships = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(9), // fubuki
        svdata.shipMstIds(133), // yuugumo
        svdata.shipMstIds(165), // uzuki
        svdata.shipMstIds(44), // murasane
        svdata.shipMstIds(181), // amatukaze
        svdata.shipMstIds(634), // jingei
        svdata.shipMstIds(635), // tyougei
        svdata.shipMstIds(944), // heianmaru
      ].flat()
      return shipCount([ships[0], ships[1]], shipIds) === 2
    }
  }
)

// 943: 新しき翼。改装航空母艦「龍鳳」、出撃せよ！
register(
  943,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMapOrCell[] = [
      [2, 2, 'S'],
      [2, 3, 'S'],
      [2, 4, 'S'],
      [2, 5, 'S'],
      QuestMapCell_7_2_2('S')
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (!isShipIds(svdata, ship_ids[0], svdata.shipMstIds(883))) {
        return false
      }
      const ships = toShipMsts(svdata, ship_ids)
      return shipCount(ships, svdata.shipMstIds(145)) === 1
    }
  }
)

// 944: 鎮守府近海海域の哨戒を実施せよ！
register(
  944,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [2, 2, 2]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [1, 2, 'A'],
      [1, 3, 'A'],
      [1, 4, 'A']
    ]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      if (!shipTypeCount([ships[0]], [ApiShipType.jyuujyun, ApiShipType.kutikukan])) {
        return false
      }
      let kutiku = shipTypeCount(ships, [ApiShipType.kutikukan])
      const kaiboukan = shipTypeCount(ships, [ApiShipType.kaiboukan])
      if (ships[0].mst.api_stype === ApiShipType.kutikukan) {
        kutiku--
      }
      return kutiku + kaiboukan >= 3
    }
  }
)

// 945: 南西方面の兵站航路の安全を図れ！
register(
  945,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [2, 2, 2]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [1, 5, 'A'],
      [2, 1, 'A'],
      [1, 6, '']
    ]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      if (
        !shipTypeCount(
          [ships[0]],
          [ApiShipType.keijyun, ApiShipType.renjyun, ApiShipType.kutikukan]
        )
      ) {
        return false
      }
      let kutiku = shipTypeCount(ships, [ApiShipType.kutikukan])
      const kaiboukan = shipTypeCount(ships, [ApiShipType.kaiboukan])
      if (ships[0].mst.api_stype === ApiShipType.kutikukan) {
        kutiku--
      }
      return kutiku + kaiboukan >= 3
    }
  }
)

// 946: 空母機動部隊、出撃！敵艦隊を迎撃せよ！
register(
  946,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [2, 2, 'S'],
      [2, 3, 'S'],
      [2, 4, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      if (!shipTypeCount([ships[0]], ApiShipTypeKuboClasses)) {
        return false
      }
      return shipTypeCount(ships, [ApiShipType.jyuujyun, ApiShipType.koujyun]) >= 2
    }
  }
)

// 947: AL作戦
register(
  947,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [3, 1, 'S'],
      [3, 3, 'S'],
      [3, 4, 'S'],
      [3, 5, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      return shipTypeCount(ships, [ApiShipType.kei_kuubo]) >= 2
    }
  }
)

// 948: 機動部隊決戦
register(
  948,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [2, 2, 2, 2]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [5, 2, 'S'],
      [5, 5, 'S'],
      [6, 5, 'S'],
      [6, 4, 'A']
    ]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, [ship_ids[0]])
      return isShipType(ships[0].mst, ApiShipTypeKuboClasses)
    }
  }
)

// 949: 改装特務空母「Gambier Bay Mk.II」抜錨！
register(
  949,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [2, 2, 2]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [2, 4, 'S'],
      [3, 5, 'S'],
      [6, 4, 'A']
    ]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (!isShipIds(svdata, ship_ids[0], svdata.shipMstIds(707))) {
        return false
      }
      const ships = toShipMsts(svdata, ship_ids)
      const count = shipCategoryCount(ships, [ApiShipCategory.fletcher])
      return count > 0
    }
  }
)

// 952: 【作戦準備】第二段階任務(対地/対空整備)
register(
  952,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [1, 3, 'S'],
      [1, 4, 'S'],
      [2, 1, 'S'],
      [2, 2, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) < 6) {
        return false
      }
      const ships = toShipMsts(svdata, ship_ids)
      return shipTypeCount(ships, [ApiShipType.kutikukan]) >= 3
    }
  }
)

// 953: 【梅雨限定任務】雨の南西諸島防衛戦2026
register(
  953,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [1, 2, 'A'],
      [1, 4, 'A'],
      [2, 1, 'A'],
      [2, 2, 'A']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) < 4) {
        return false;
      }

      const ships = toShipMsts(svdata, ship_ids)
      const flagshipCheck1 = shipTypeCount([ships[0], ships[1]], [ApiShipType.kaiboukan])
      const flagshipCheck2 = shipTypeCount([ships[0], ships[1]], [ApiShipType.suibo])
      if (flagshipCheck1 !== 2 && flagshipCheck2 !== 2) {
        return false
      }
      return shipTypeCount(ships.slice(2), [ApiShipType.kutikukan]) >= 2
    }
  }
)

// 954: 【梅雨限定任務】梅雨の海上護衛強化2026
register(
  954,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1, 3]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [1, 3, 'A'],
      [1, 5, 'A'],
      [2, 3, 'A'],
      [7, 4, 'A'],
      [1, 6, '']
    ]
    static formatter(quest: Quest): string {
      return detailFormatMaps(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      if (!shipTypeCount([ships[0]], [ApiShipType.kei_kuubo])) {
        return false
      }
      return shipTypeCount(ships.slice(1), [ApiShipType.kutikukan]) >= 2
    }
  }
)

// 955:【梅雨任務拡張作戦】南方反攻望楼作戦を叩け！
register(
  955,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMapOrCell[] = [
      [5, 1, 'A'],
      [5, 2, 'A'],
      [5, 3, 'A'],
      [5, 4, 'A'],
      [5, 5, 'A'],
      QuestMapCell_5_6_3('A'),
    ]
    static formatter(quest: Quest): string {
      return detailFormatMaps(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      if (!shipTypeCount(ships, ApiShipTypeSenkanClasses)) {
        return false
      }

      const count1 = shipCategoryCount(ships, [ApiShipCategory.yuugumo])
      const count2 = shipTypeCount(ships, [ApiShipType.jyuujyun])
      return count1 >= 2 || count2 >= 2
    }
  }
)

// 957: 「山風改二」、抜錨せよ！
register(
  957,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [1, 2, 'S'],
      [1, 3, 'S'],
      [1, 4, 'S'],
      [1, 5, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (!isShipIds(svdata, ship_ids[0], svdata.shipMstIds(588))) {
        return false
      }
      const ships = toShipMsts(svdata, ship_ids)
      if (shipTypeCount(ships, [ApiShipType.kaiboukan]) >= 2) {
        return true
      }
      if (shipTypeCount(ships, [ApiShipType.kutikukan]) >= 3) {
        return true
      }
      return false
    }
  }
)

// 958: 改白露型駆逐艦「山風改二」、奮戦す！
register(
  958,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMapOrCell[] = [[2, 2, 'S'], QuestMapCell_7_2_2('S'), [5, 1, 'S'], [6, 4, 'S']]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const shipIds = [
        svdata.shipMstIds(588),
        svdata.shipMstIds(469),
        svdata.shipMstIds(587)
      ].flat()
      return shipCount(toShipMsts(svdata, ship_ids), shipIds) >= 2
    }
  }
)

// 959: 「鎮守府秋刀魚祭り」発動準備！
register(
  959,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [2, 2, 2, 2]
    static key = QuestKey.yearly
    static maps: QuestMap[] = [
      [1, 2, 'S'],
      [1, 3, 'S'],
      [1, 4, 'S'],
      [1, 5, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, [ship_ids[0]])
      return !!shipTypeCount(
        [ships[0]],
        [
          ApiShipType.keijyun,
          ApiShipType.renjyun,
          ApiShipType.kousakusen,
          ApiShipType.internal_tokumukan,
          ApiShipType.sensui_kuubo
        ]
      )
    }
  }
)

// 960: 続：「鎮守府秋刀魚祭り」発動準備！
register(
  960,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [2, 2, 2, 2]
    static key = QuestKey.yearly
    static maps: QuestMap[] = [
      [3, 1, 'A'],
      [3, 3, 'A'],
      [3, 4, 'A'],
      [3, 5, 'A']
    ]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, [ship_ids[0]])
      if (
        shipTypeCount(
          [ships[0]],
          [ApiShipType.renjyun, ApiShipType.kousakusen, ApiShipType.internal_tokumukan]
        ) > 0
      ) {
        return true
      }
      if (shipCategoryCount([ships[0]], [ApiShipCategory.yamasiomaru]) > 0) {
        return true
      }
      return false
    }
  }
)

// 961: 奮戦！精鋭「第十五駆逐隊」第一小隊
register(
  961,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [2, 2, 2]
    static key = QuestKey.infer
    static maps: QuestMapOrCell[] = [[2, 4, 'S'], [5, 4, 'S'], QuestMapCell_7_2_2('S')]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [svdata.shipMstIds(670), svdata.shipMstIds(568)].flat()
      return shipCount(msts, shipIds) >= 2
    }
  }
)

// 962: 【Xmas限定】Xmas 健康駆逐隊、抜錨です！
register(
  962,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [3, 3]
    static key = QuestKey.yearly
    static maps: QuestMap[] = [
      [1, 1, 'S'],
      [1, 3, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(455), // hagikaze
        svdata.shipMstIds(456), // oyasio
        svdata.shipMstIds(48), // arare
        svdata.shipMstIds(93), // oboro
        svdata.shipMstIds(94), // sazanami
        svdata.shipMstIds(16), // usio
        svdata.shipMstIds(15), // akebono
        svdata.shipMstIds(133), // yuugumo
        svdata.shipMstIds(528), // hayanami
        svdata.shipMstIds(484), // hamanami
        svdata.shipMstIds(671), // makinami
        svdata.shipMstIds(527), // kisinami
        svdata.shipMstIds(480), // sagiri
        svdata.shipMstIds(562), // Johnston
      ].flat()
      return shipCount(msts, shipIds) >= 4
    }
  }
)

// 963: 【Xmas限定】聖夜の特務艦隊、南西諸島へ！
register(
  963,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [2, 2]
    static key = QuestKey.yearly
    static maps: QuestMap[] = [
      [1, 2, 'S'],
      [2, 1, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(953), // asahi
        svdata.shipMstIds(182), // akasi
        svdata.shipMstIds(645), // souya
        svdata.shipMstIds(162), // kamoi
        [184], // taigei
        svdata.shipMstIds(460), // hayasui
        svdata.shipMstIds(634), // jingei
        svdata.shipMstIds(635), // tyougei
        svdata.shipMstIds(944), // heianmaru
        svdata.shipMstIds(451), // mizuho
        svdata.shipMstIds(943), // kumanomaru
        svdata.shipMstIds(900), // yamasiomaru
      ].flat()
      return shipCount([msts[0]], shipIds) > 0 && shipCount(msts, shipIds) > 1
    }
  }
)

// 964: Xmas戦艦戦隊、堂々進撃せよ！
register(
  964,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [2, 2, 2]
    static key = QuestKey.yearly
    static maps: QuestMap[] = [
      [2, 3, 'S'],
      [2, 4, 'S'],
      [5, 1, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(439), // Warspite
        svdata.shipMstIds(927), // Valiant
        svdata.shipMstIds(924), // Nevada
        svdata.shipMstIds(441), // Littorio
        svdata.shipMstIds(935), // Jean Bart
      ].flat()
      return shipCount([msts[0]], shipIds) > 0 && shipCount(msts, shipIds) > 1
    }
  }
)

// 965: Xmas巡洋艦級、今冬も大暴れッ！
register(
  965,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [2, 2, 2]
    static key = QuestKey.yearly
    static maps: QuestMap[] = [
      [2, 2, 'S'],
      [5, 3, 'S'],
      [5, 5, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(123), // kinugasa
        svdata.shipMstIds(124), // suzuya
        svdata.shipMstIds(125), // kumano
        svdata.shipMstIds(663), // yahagi kaini
        svdata.shipMstIds(140), // sakawa
        svdata.shipMstIds(514), // Sheffield
        svdata.shipMstIds(597), // Atlanta
        svdata.shipMstIds(183), // ooyodo
        svdata.shipMstIds(99), // kuma
        svdata.shipMstIds(465), // kasima
      ].flat()
      return shipCount(msts, shipIds) >= 3
    }
  }
)

// 966: 南西海域「基地航空隊」開設！
register(
  966,
  class {
    static readonly questType = QuestType.battleMap
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMapOrCell[] = [[2, 1, 'S'], [2, 2, 'S'], [2, 3, 'S'], QuestMapCell_7_3_2('S')]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
  }
)

// 967: 海上護衛！ヒ船団を護り抜け！
register(
  967,
  class {
    static readonly questType = QuestType.gaugeClear
    static max = [1]
    static key = QuestKey.infer
    static maps: QuestMapOrCell[] = [[7, 4, 'S']]
    static formatter(quest: Quest): string {
      return detailFormatOne(['7-4ゲージ破壊: '], quest)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      return true
    }
  }
)

// 968: 航空母艦「雲鷹」、抜錨せよ！
register(
  968,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMapOrCell[] = [[2, 5, 'S'], [6, 4, 'S'], QuestMapCell_7_2_2('S'), [7, 4, 'S']]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = svdata.shipMstIds(884)
      return shipCount(msts, shipIds) > 0
    }
  }
)

// 969: 改特型駆逐艦「天霧改二」、出撃す！
register(
  969,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMapOrCell[] = [
      [2, 2, 'S'],
      [5, 1, 'S'],
      [5, 4, 'S'],
      [6, 4, 'S'],
      QuestMapCell_7_3_2('S')
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds1 = svdata.shipMstIds(903)
      if (!shipCount(msts, shipIds1)) {
        return false
      }
      const shipIds2 = [svdata.shipMstIds(61), svdata.shipMstIds(24), svdata.shipMstIds(480)].flat()
      return shipCount(msts, shipIds2) >= 2
    }
  }
)

// 970: 第十六戦隊、改装「浦波改二」出撃します！
register(
  970,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMapOrCell[] = [
      [1, 4, 'S'],
      [2, 3, 'S'],
      [2, 5, 'S'],
      QuestMapCell_7_2_2('S'),
      [7, 4, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [svdata.shipMstIds(647), svdata.shipMstIds(61), svdata.shipMstIds(113)].flat()
      return shipCount(msts, shipIds) >= 3
    }
  }
)

// 971: 【13周年記念任務】艦隊13周年、抜錨せよ！
register(
  971,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.yearly
    static maps: QuestMap[] = [
      [1, 2, 'S'],
      [1, 3, 'S'],
      [1, 4, 'S'],
      [1, 5, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const flagOk = shipTypeCount([msts[0]], [ApiShipType.sensuibokan, ApiShipType.keijyun]) > 0
      if (!flagOk) return false

      const flag2Ok = shipTypeCount(msts.slice(1), [
        ApiShipType.kutikukan, ApiShipType.sensui_kuubo, ApiShipType.sensuikan]) >= 2
      if (!flag2Ok) return false

      return shipTypeCount(msts.slice(1), [ApiShipType.sensuibokan, ApiShipType.keijyun]) > 0;
    }
  }
)

// 972: 【13周年記念任務】一航戦、揺るぎません！
register(
  972,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.yearly
    static maps: QuestMap[] = [
      [2, 3, 'S'],
      [2, 4, 'S'],
      [5, 2, 'S'],
      [5, 4, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) < 2) {
        return false
      }

      const msts = toShipMsts(svdata, ship_ids)
      const shipIds1 = [
        svdata.shipMstIds(83), // akagi
        svdata.shipMstIds(84), // kaga
      ].flat()
      const shipIds2 = [
        svdata.shipMstIds(110), // syoukaku
        svdata.shipMstIds(111), // zuikaku
      ].flat()

      if (shipCount([msts[0], msts[1]], shipIds1) === 2) {
        return true
      }
      if (shipCount([msts[0], msts[1]], shipIds2) === 2) {
        return true
      }
      return false
    }
  }
)

// 973: 日英米合同水上艦隊、抜錨せよ！
register(
  973,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMapOrCell[] = [[3, 1, 'A'], [3, 3, 'A'], [4, 3, 'A'], QuestMapCell_7_3_2('A')]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      if (shipTypeCount(ships, ApiShipTypeKuboClasses)) {
        return false
      }
      const cats = [
        // 米
        ApiShipCategory.colorado,
        ApiShipCategory.northCarolina,
        ApiShipCategory.southDakota,
        ApiShipCategory.iowa,
        ApiShipCategory.nevada,
        ApiShipCategory.lexington,
        ApiShipCategory.ranger,
        ApiShipCategory.yorktown,
        ApiShipCategory.intrepid,
        ApiShipCategory.gambierBay,
        ApiShipCategory.independence,
        ApiShipCategory.northampton,
        ApiShipCategory.new_orleans,
        ApiShipCategory.brooklyn,
        ApiShipCategory.st_Louis,
        ApiShipCategory.atlanta,
        ApiShipCategory.fletcher,
        ApiShipCategory.johnCButle,
        ApiShipCategory.gato,
        ApiShipCategory.salmon,

        // 英
        ApiShipCategory.queenElizabeth,
        ApiShipCategory.nelson,
        ApiShipCategory.courageous_jyunyou,
        ApiShipCategory.courageous_kubo,
        ApiShipCategory.arkRoyal,
        ApiShipCategory.illustrious,
        ApiShipCategory.town,
        ApiShipCategory.jervis,
      ]
      return shipCategoryCount(ships, cats) >= 3
    }
  }
)

// 974: 「磯波改二」、抜錨せよ！
register(
  974,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [1, 2, 'S'],
      [1, 3, 'S'],
      [5, 1, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      return !!shipCount(toShipMsts(svdata, ship_ids), svdata.shipMstIds(666))
    }
  }
)

// 975: 精鋭「第十九駆逐隊」、全力出撃！
register(
  975,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [1, 5, 'S'],
      [2, 3, 'S'],
      [3, 2, 'S'],
      [5, 3, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(666),
        svdata.shipMstIds(647),
        svdata.shipMstIds(195),
        svdata.shipMstIds(627)
      ].flat()
      return shipCount(msts, shipIds) === 4
    }
  }
)

// 976: 改大和型戦艦「大和改二」、出撃せよ！
register(
  976,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [1, 4, 'S'],
      [2, 5, 'S'],
      [5, 1, 'S'],
      [4, 4, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      if (!shipCount([msts[0]], svdata.shipMstIds(911))) {
        return false
      }
      if (!shipTypeCount(msts, [ApiShipType.keijyun])) {
        return false
      }
      return shipTypeCount(msts, [ApiShipType.kutikukan]) >= 2
    }
  }
)

// 977: 見敵必殺！最精鋭大和型「第一戦隊」抜錨！
register(
  977,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMapOrCell[] = [[4, 5, 'S'], [5, 3, 'S'], QuestMapCell_7_2_2('S'), [6, 5, 'S']]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const ids = [svdata.shipMstIds(911), svdata.shipMstIds(546)].flat()
      if (shipCount(msts, ids) < 2) {
        return false
      }
      return shipTypeCount(msts, [ApiShipType.kutikukan]) >= 2
    }
  }
)

// 978: 【拡張作戦】重改装「大和改二重」、出撃！
register(
  978,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMapOrCell[] = [QuestMapCell_7_3_2('A'), [7, 4, 'S'], [5, 5, 'S'], [6, 4, 'S']]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      return shipCount(toShipMsts(svdata, [ship_ids[0]]), svdata.shipMstIds(916)) > 0
    }
  }
)

// 979:【13周年記念任務:拡張作戦】強行輸送作戦
register(
  979,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [2, 2, 2]
    static key = QuestKey.yearly
    static maps: QuestMapOrCell[] = [
      [1, 3, 'A'],
      [1, 4, 'A'],
      [1, 6, ''],
    ]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) < 3) {
        return false
      }

      const msts = toShipMsts(svdata, ship_ids.slice(0, 3))
      return shipTypeCount(msts, [ApiShipType.kaiboukan]) === 3
    }
  }
)

// 980: 抜錨！精強「第十五駆逐隊」
register(
  980,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [2, 4, 'S'],
      [5, 4, 'S'],
      [5, 5, 'S'],
      [6, 4, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const ids = [svdata.shipMstIds(915), svdata.shipMstIds(670), svdata.shipMstIds(568)].flat()
      return shipCount(msts, ids) >= 2
    }
  }
)

// 981: 米駆逐艦部隊の奮戦
register(
  981,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [2, 2, 2, 2]
    static key = QuestKey.infer
    static maps: QuestMapOrCell[] = [[2, 3, 'S'], [6, 4, 'S'], QuestMapCell_7_3_2('A'), [7, 4, 'S']]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      return (
        shipCategoryCount(toShipMsts(svdata, ship_ids), [
          ApiShipCategory.fletcher,
          ApiShipCategory.johnCButle
        ]) >= 2
      )
    }
  }
)

// 982: Samuel B.Roberts Mk.II、抜錨せよ！
register(
  982,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [1, 5, 'S'],
      [2, 2, 'S'],
      [3, 5, 'S'],
      [1, 6, '']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      return shipCount(toShipMsts(svdata, ship_ids), svdata.shipMstIds(920)) > 0
    }
  }
)

// 983: 不屈敢闘「Taffy Ⅲ」、Weigh anchor!
register(
  983,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [2, 3, 'S'],
      [2, 5, 'S'],
      [4, 5, 'S'],
      [5, 5, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ids = [svdata.shipMstIds(544), svdata.shipMstIds(561), svdata.shipMstIds(562)].flat()
      return shipCount(toShipMsts(svdata, ship_ids), ids) >= 3
    }
  }
)

// 984:【期間限定任務】12年目の秋、南瓜祭り始め！
register(
  984,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1]
    static key = QuestKey.yearly
    static maps: QuestMap[] = [
      [1, 3, 'S'],
      [1, 4, 'S'],
      [1, 5, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const ids = [
        svdata.shipMstIds(93),
        svdata.shipMstIds(921),
        svdata.shipMstIds(922),
        svdata.shipMstIds(45),
        svdata.shipMstIds(95),
        svdata.shipMstIds(410),
        svdata.shipMstIds(555)
      ].flat()
      if (!shipCount([msts[0]], ids)) return false
      return shipCount(msts, ids) > 1
    }
  }
)

// 985:【期間限定任務】礼号作戦部隊、西へ！
register(
  985,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1]
    static key = QuestKey.yearly
    static maps: QuestMap[] = [
      [4, 1, 'S'],
      [4, 2, 'S'],
      [4, 3, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ids = [
        svdata.shipMstIds(49),
        svdata.shipMstIds(64),
        svdata.shipMstIds(183),
        svdata.shipMstIds(425),
        svdata.shipMstIds(410)
      ].flat()
      return shipCount(toShipMsts(svdata, ship_ids), ids) >= 3
    }
  }
)

// 986:【期間限定任務】南瓜祭り艦隊、南西諸島へ！
register(
  986,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1]
    static key = QuestKey.yearly
    static maps: QuestMap[] = [ [ 3, 1, 'S' ], [ 2, 4, 'A' ], [ 6, 1, 'A' ] ];
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ids = [
        svdata.shipMstIds(544), // Gambier Bay
        svdata.shipMstIds(1005), // Minneapolis
        svdata.shipMstIds(923), // Tuscaloosa
        svdata.shipMstIds(896), // Brooklyn
        svdata.shipMstIds(562), // Johnston
        svdata.shipMstIds(535), // Luigi Torelli
      ].flat()
      return shipCount(toShipMsts(svdata, ship_ids), ids) >= 3
    }
  }
)

// 987:【週間拡張任務】秋の南瓜祭り! Buono!
register(
  987,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [ [ 4, 2, 'S' ], [ 4, 3, 'S' ], [ 4, 4, 'S' ],];
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids);
      const shipIds = [
        svdata.shipMstIds(442), // Roma
        svdata.shipMstIds(1005), // Minneapolis
        svdata.shipMstIds(44), // murasame
        svdata.shipMstIds(45), // yuudati
        svdata.shipMstIds(93), // oboro
        svdata.shipMstIds(15), // akebono
        svdata.shipMstIds(575), // Maestrale
        svdata.shipMstIds(614), // Grecale
        svdata.shipMstIds(443), // Libeccio
        svdata.shipMstIds(653), // Scirocco
        svdata.shipMstIds(519), // Jervis
        svdata.shipMstIds(535), // Luigi Torelli
      ].flat();
      if (!shipCount([msts[0]], shipIds)) {
        return false;
      }
      return shipCount(msts, shipIds) >= 3;
    }
  }
)

// 988:【Xmas限定任務】聖夜の哨戒線
register(
  988,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [1, 2, 'S'],
      [1, 3, 'S'],
      [1, 5, 'S'],
      [2, 1, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      return !!shipTypeCount(toShipMsts(svdata, [ship_ids[0]]), [ApiShipType.keijyun])
    }
  }
)

// 989: 機動部隊旗艦「鳳翔改二」、前線に出撃せよ！
register(
  989,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [2, 5, 'S'],
      [3, 5, 'S'],
      [7, 4, 'S'],
      [4, 5, 'S'],
      [5, 2, 'S'],
      [6, 4, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      return shipCount(toShipMsts(svdata, [ship_ids[0]]), svdata.shipMstIds(894)) > 0
    }
  }
)

// 990: 【年末年始】大掃除後の見廻り！警戒を厳に！
register(
  990,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1, 1]
    static key = QuestKey.yearly
    static maps: QuestMap[] = [
      [1, 4, 'A'],
      [2, 2, 'A'],
      [2, 3, 'A'],
      [3, 2, 'A'],
      [4, 1, 'A']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const ids = [
        svdata.shipMstIds(15),
        svdata.shipMstIds(540),
        svdata.shipMstIds(132),
        svdata.shipMstIds(453),
        svdata.shipMstIds(891)
      ].flat()
      if (!shipCount([msts[0]], ids)) return false
      return shipCount(msts, ids) >= 2
    }
  }
)

// 991: 【早春限定任務】海上遊撃戦、展開せよ
register(
  991,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMapOrCell[] = [
      QuestMapCell_7_2_2('S'),
      QuestMapCell_7_3_2('S'),
      [7, 4, 'S'],
      [5, 5, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      if (shipTypeCount(msts, [ApiShipType.kutikukan]) < 1) return false
      if (!shipTypeCount([msts[0]], [ApiShipType.keijyun])) return false
      if (
        !shipTypeCount(msts, [ApiShipType.koujyun]) &&
        !shipCategoryCount(msts, [ApiShipCategory.gotland])
      )
        return false
      return true
    }
  }
)

// 992: 「十六駆」出撃！鎮守府海域の安全を確保せよ！
register(
  992,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [3, 3, 3]
    static key = QuestKey.yearly
    static maps: QuestMap[] = [
      [1, 3, 'A'],
      [1, 4, 'A'],
      [1, 5, 'A']
    ]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ids = [
        svdata.shipMstIds(181),
        svdata.shipMstIds(20),
        svdata.shipMstIds(186),
        svdata.shipMstIds(190)
      ].flat()
      return shipCount(toShipMsts(svdata, ship_ids), ids) >= 2
    }
  }
)

// 993: 改装駆逐艦「天津風改二」、抜錨せよ！
register(
  993,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [2, 5, 'S'],
      [7, 4, 'S'],
      [5, 3, 'S'],
      [5, 4, 'S'],
      [6, 4, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      return toShipMsts(svdata, [ship_ids[0]])[0].mst.api_id === 951
    }
  }
)

// 994: 主力オブ主力、抜錨！敵艦隊を撃滅せよ！
register(
  994,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1, 1]
    static key = QuestKey.yearly
    static maps: QuestMap[] = [
      [1, 2, 'S'],
      [1, 4, 'S'],
      [2, 2, 'S'],
      [2, 3, 'S'],
      [2, 4, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      if (shipCategoryCount(ships, [ApiShipCategory.yuugumo]) < 2) return false
      if (
        !shipTypeCount(
          [ships[0]],
          [ApiShipType.koukuu_senkan, ApiShipType.kousoku_senkan, ApiShipType.teisoku_senkan]
        )
      )
        return false
      return true
    }
  }
)

// 995: 改装特I型駆逐艦「深雪改二」、出撃せよ！
register(
  995,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMapOrCell[] = [[3, 2, 'S'], QuestMapCell_7_3_2('S'), [5, 3, 'S'], [6, 4, 'S']]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      if (shipCategoryCount(msts, [ApiShipCategory.fubuki]) < 2) return false
      return shipCount(msts, svdata.shipMstIds(959)) > 0
    }
  }
)

// 996: 改金剛型高速戦艦「榛名改二乙/丙」、抜錨！
register(
  996,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMapOrCell[] = [
      [2, 2, 'S'],
      [2, 4, 'S'],
      [7, 5, 'S', []],
      [4, 3, 'S'],
      [5, 3, 'S'],
      [5, 4, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      if (shipTypeCount(msts, [ApiShipType.kutikukan]) < 2) return false
      const ids = [svdata.shipMstIds(591), svdata.shipMstIds(593)].flat()
      return shipCount(msts, ids) > 1
    }
  }
)

// 997: 【海上護衛作戦】海上補給線を確保せよ！
register(
  997,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [2, 2, 2, 2]
    static key = QuestKey.infer
    static maps: QuestMapOrCell[] = [
      [1, 3, 'S'],
      [1, 5, 'S'],
      [1, 6, ''],
      [2, 2, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      if (shipTypeCount(msts, [ApiShipType.kutikukan]) >= 4) return true
      if (shipTypeCount(msts, [ApiShipType.kaiboukan]) >= 3) return true
      if (shipTypeCount(msts, [ApiShipType.suibo]) >= 2) return true
      return false
    }
  }
)

// 998: 改装白露型精鋭駆逐艦「時雨改三」出撃す！
register(
  998,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMapOrCell[] = [
      [2, 5, 'S'],
      [7, 4, 'S'],
      [4, 5, 'S'],
      [5, 5, 'S'],
      [6, 4, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      if (shipCount(msts, svdata.shipMstIds(961)) < 1) return false
      const ids2 = [svdata.shipMstIds(42), svdata.shipMstIds(632), svdata.shipMstIds(633)].flat()
      return shipCount(msts, ids2) >= 1
    }
  }
)

// 1001: 主力オブ主力「清霜改二」、出撃せよ！
register(
  1001,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [2, 2, 'S'],
      [2, 3, 'S'],
      [2, 4, 'S'],
      [7, 4, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      if (!shipCount(msts, [955])) return false
      const ids2 = [
        svdata.shipMstIds(49),
        svdata.shipMstIds(425),
        svdata.shipMstIds(183),
        svdata.shipMstIds(64)
      ].flat()
      return shipCount(msts, ids2) >= 2
    }
  }
)

// 1002: 【期間限定任務】南瓜祭り2024、拡張作戦！
register(
  1002,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.yearly
    static maps: QuestMap[] = [ [ 3, 2, 'S' ], [ 3, 5, 'S' ], [ 6, 4, 'S' ],];
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids);
      const ids = [
        svdata.shipMstIds(544), // Gambier Bay
        svdata.shipMstIds(1005), // Minneapolis
        svdata.shipMstIds(923), // Tuscaloosa
        svdata.shipMstIds(519), // Jervis
        svdata.shipMstIds(93), // oboro
        svdata.shipMstIds(45), // yuudati
        svdata.shipMstIds(44), // murasame
        svdata.shipMstIds(95), // asasio
        svdata.shipMstIds(415), // nowaki
        svdata.shipMstIds(671), // makinami
      ].flat()
      if (!shipCount([msts[0]], ids)) {
        return false;
      }
      return shipCount(msts, ids) >= 3;
    }
  }
)

// 1003: 【潜水艦任務】潜水艦、戦闘哨戒！
register(
  1003,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [1, 2, 'S'],
      [1, 3, 'S'],
      [2, 3, 'S'],
      [3, 1, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      return (
        shipCount(
          toShipMsts(svdata, [ship_ids[0]]),
          [svdata.shipMstIds(891), svdata.shipMstIds(299)].flat()
        ) >= 1
      )
    }
  }
)

// 1004: 改装航空巡洋艦「三隈」、進発せよ！
register(
  1004,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [2, 3, 'S'],
      [2, 4, 'S'],
      [4, 5, 'S'],
      [6, 4, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      return shipCount(toShipMsts(svdata, [ship_ids[0]]), svdata.shipMstIds(502)) === 1
    }
  }
)

// 1005: 精強「第七駆逐隊」緊急出動！
register(
  1005,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [1, 2, 'A'],
      [1, 3, 'A'],
      [1, 5, 'A'],
      [3, 2, 'A']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ids = [
        svdata.shipMstIds(230),
        svdata.shipMstIds(232),
        svdata.shipMstIds(231),
        svdata.shipMstIds(233)
      ].flat()
      return shipCount(toShipMsts(svdata, ship_ids), ids) >= 4
    }
  }
)

// 1006: 「第二駆逐隊」抜錨！
register(
  1006,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [1, 2, 'A'],
      [1, 3, 'A'],
      [1, 4, 'A'],
      [1, 5, 'A']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ids = [
        svdata.shipMstIds(405),
        svdata.shipMstIds(45),
        svdata.shipMstIds(44),
        svdata.shipMstIds(46)
      ].flat()
      return shipCount(toShipMsts(svdata, ship_ids), ids) >= 3
    }
  }
)

// 1007: 改装白露型「春雨改二」出撃です！
register(
  1007,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [2, 2, 2]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [2, 2, 'S'],
      [2, 3, 'S'],
      [5, 1, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      if (shipCount([msts[0]], svdata.shipMstIds(975)) < 1) return false
      if (shipTypeCount(msts, [ApiShipType.kutikukan]) < 2) return false
      return shipTypeCount(msts, [ApiShipType.keijyun]) >= 1
    }
  }
)

// 1008: 夕立姉さん！今度は一緒について行きますっ！
register(
  1008,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [4, 5, 'S'],
      [5, 3, 'S'],
      [5, 4, 'S'],
      [5, 5, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ids = [svdata.shipMstIds(144), svdata.shipMstIds(975)].flat()
      return shipCount(toShipMsts(svdata, ship_ids), ids) >= 2
    }
  }
)

// 1009: 【13周年記念任務:拡張作戦】艦隊、南方へ！
register(
  1009,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1, 1]
    static key = QuestKey.yearly
    static maps: QuestMap[] = [
      [5, 1, 'A'],
      [5, 2, 'A'],
      [5, 3, 'A'],
      [5, 4, 'A'],
      [5, 5, 'A']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) < 2) {
        return false
      }

      const msts = toShipMsts(svdata, ship_ids)
      const ids = [
        svdata.shipMstIds(131), // yamato
        svdata.shipMstIds(110), // syoukaku
        svdata.shipMstIds(142), // kinugasa kaini
        svdata.shipMstIds(574), // Gotland
        svdata.shipMstIds(9),   // fubuki
        svdata.shipMstIds(991), // sugi
        svdata.shipMstIds(962), // Mogador
        svdata.shipMstIds(562), // Johnston
        svdata.shipMstIds(628), // Fletcher改
        svdata.shipMstIds(973), // Thonburi
        svdata.shipMstIds(634), // jingei
      ].flat()

      return shipCount([msts[0], msts[1]], ids) === 2
    }
  }
)

// 1010: 防空駆逐艦「秋月改二」、推参します！
register(
  1010,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMapOrCell[] = [
      [1, 4, 'S'],
      [2, 4, 'S'],
      [7, 1, 'S'],
      QuestMapCell_7_2_2('S'),
      [5, 4, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, [ship_ids[0]])
      const ids = [
        svdata.shipMstIds(963),
      ].flat()
      return !!shipCount(msts, ids)
    }
  }
)

// 1011: 【第一遊撃部隊任務】南西諸島防衛戦に出撃！
register(
  1011,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [2, 2, 2, 2]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [1, 4, 'S'],
      [2, 1, 'S'],
      [2, 2, 'S'],
      [2, 5, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) < 6) {
        return false
      }

      const msts = toShipMsts(svdata, ship_ids)
      const ids = [
        svdata.shipMstIds(131), // yamato
      ].flat()
      if (! shipCount([msts[0]], ids)) {
        return false
      }
      const ids1 = [
        svdata.shipMstIds(139), // yahagi
      ].flat()
      if (! shipCount([msts[1]], ids1)) {
        return false
      }
      const ids2 = [
        svdata.shipMstIds(167), // isokaze
        svdata.shipMstIds(170), // hamakaze
        svdata.shipMstIds(20), // yukikaze
        svdata.shipMstIds(533), // fuyutuki
        svdata.shipMstIds(532), // sudutuki
        svdata.shipMstIds(49), // kasumi
        svdata.shipMstIds(41), // hatusimo
        svdata.shipMstIds(425), // asasimo
      ].flat()
      return shipCount(msts.slice(2), ids2) === 4
    }
  }
)

// 1012: 鵜来型海防艦、静かな海を防衛せよ！
register(
  1012,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [3, 2, 2]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [1, 1, 'S'],
      [1, 2, 'A'],
      [1, 5, 'A']
    ]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      if (!shipCategoryCount([msts[0]], [ApiShipCategory.ukuru])) return false
      const kaibou_count = shipTypeCount(msts.slice(1), [ApiShipType.kaiboukan])
      if (! kaibou_count) return false
      if (deckShipCount(ship_ids) !== (kaibou_count+1)) return false
      if ((kaibou_count+1) > 4) return false
      return true
    }
  }
)

// 1013: 八戸の盾「稲木改二」、抜錨ッ！
register(
  1013,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [1, 3, 'S'],
      [1, 4, 'A'],
      [2, 2, 'S'],
      [2, 3, 'S'],
      [7, 4, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      return shipCount(toShipMsts(svdata, [ship_ids[0]]), [979]) > 0
    }
  }
)

// 1014: 哨戒部隊で近海及び南西諸島を警戒せよ！
register(
  1014,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [1, 1, 'A'],
      [1, 2, 'A'],
      [1, 5, 'A'],
      [2, 1, 'A']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      return (
        shipTypeCount(msts, [ApiShipType.kaiboukan]) >= 3 ||
        shipTypeCount(msts, [ApiShipType.kaiboukan, ApiShipType.kutikukan]) >= 4
      )
    }
  }
)

// 1015: 防空水上艦、出撃せよッ！
register(
  1015,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [1, 3, 'S'],
      [1, 4, 'S'],
      [2, 2, 'S'],
      [2, 3, 'S'],
      [5, 1, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const akizukiCount = shipCategoryCount(msts, [ApiShipCategory.akizuki])
      if (akizukiCount >= 3) return true
      const ids = [
        svdata.shipMstIds(271),
        svdata.shipMstIds(477),
        svdata.shipMstIds(478),
        svdata.shipMstIds(141)
      ].flat()
      const mstCount = shipCount(msts, ids)
      return akizukiCount + mstCount >= 3
    }
  }
)

// 1016: 防空駆逐艦「初月改二」、推して参る！
register(
  1016,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [2, 4, 'S'],
      [3, 5, 'S'],
      [5, 4, 'S'],
      [5, 5, 'S'],
      [7, 4, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, [ship_ids[0]])
      const shipIds = [
        svdata.shipMstIds(968) // hatuduki kai2
      ].flat()

      return !!shipCount(msts, shipIds)
    }
  }
)

// 1017: 「第二駆逐隊(後期編成)」、出撃せよ！
register(
  1017,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [2, 2, 2]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [1, 2, 'S'],
      [1, 5, 'S'],
      [2, 3, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ids = [
        svdata.shipMstIds(409), // hayasimo
        svdata.shipMstIds(625), // akisimo
        svdata.shipMstIds(425), // asasimo
        svdata.shipMstIds(410) // kiyosimo
      ].flat()
      const ships = toShipMsts(svdata, ship_ids)
      if (!isShipIds(svdata, ship_ids[0], ids)) return false
      return shipCount(ships, ids) >= 3
    }
  }
)

// 1018:「第三戦隊」第二小隊、鉄底海峡へ！
register(
  1018,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [5, 1, 'A'],
      [5, 3, 'A'],
      [5, 4, 'A'],
      [5, 5, 'A']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      const ids = [
        svdata.shipMstIds(85), // kirisima
        svdata.shipMstIds(86) // hiei
      ].flat()
      if (shipCount(ships, ids) !== 2) return false
      return shipTypeCount(ships, [ApiShipType.kutikukan]) >= 2
    }
  }
)

// 1019:「第三戦隊」第二小隊、鉄底海峡へ！
register(
  1019,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [2, 2, 2]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [4, 5, 'S'],
      [5, 5, 'S'],
      [6, 5, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      const ids = [
        svdata.shipMstIds(85), // kirisima
        svdata.shipMstIds(86) // hiei
      ].flat()
      if (shipCount(ships, ids) !== 2) return false
      return (
        shipCategoryCount(ships, [ApiShipCategory.yuugumo]) >= 2 ||
        shipCategoryCount(ships, [ApiShipCategory.siratuyu]) >= 2
      )
    }
  }
)

// 1020: 【期間限定任務】「第三戦隊」緊急展開
register(
  1020,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.yearly
    static maps: QuestMap[] = [
      [1, 4, 'A'],
      [2, 1, 'A'],
      [2, 2, 'A'],
      [4, 2, 'A']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      const ids = [
        svdata.shipMstIds(78), // kongou
        svdata.shipMstIds(79), // haruna
        svdata.shipMstIds(85), // kirisima
        svdata.shipMstIds(86) // hiei
      ].flat()
      return shipCount(ships, ids) >= 2
    }
  }
)

// 1021: 「早霜改二」見ているだけでは…ありません！
register(
  1021,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMapOrCell[] = [[2, 5, 'S'], [5, 4, 'S'], QuestMapCell_7_2_2('S'), [7, 4, 'S']]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      const shipIds = [
        svdata.shipMstIds(956) // 早霜改二
      ].flat()
      if (!shipCount([ships[0]], shipIds)) return false
      shipIds.push(
        ...svdata.shipMstIds(410) // 清霜
      )
      shipIds.push(
        ...svdata.shipMstIds(625) // 秋霜
      )
      return shipCount(ships, shipIds) >= 2
    }
  }
)

// 1022:【期間限定任務】「三十二駆」月次戦闘哨戒！
register(
  1022,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [2, 3, 'A'],
      [7, 1, 'A'],
      [4, 1, 'A'],
      [5, 1, 'A']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ids = [
        svdata.shipMstIds(674), // tamanami
        svdata.shipMstIds(675), // suzunami
        svdata.shipMstIds(485), // fujinami
        svdata.shipMstIds(528), // hayanami
        svdata.shipMstIds(484) // hamanami
      ].flat()
      return shipCount(toShipMsts(svdata, ship_ids), ids) >= 3
    }
  }
)

// 1023: 三十二駆「藤波改二」、鳥海を護衛せよ！
register(
  1023,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMapOrCell[] = [[2, 4, 'S'], [2, 5, 'S'], QuestMapCell_7_2_2('S'), [5, 5, 'S']]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      if (!shipCount([ships[0]], svdata.shipMstIds(981))) return false
      if (!shipCount(ships, svdata.shipMstIds(69))) return false
      const ids = [
        svdata.shipMstIds(674), // matanami
        svdata.shipMstIds(675), // suzunami
        svdata.shipMstIds(528), // hayanami
        svdata.shipMstIds(484) // hamanami
      ].flat()
      return shipCount(ships, ids) >= 1
    }
  }
)

// 1024:【年末年始】出撃！海防戦艦、海上戦闘哨戒！
register(
  1024,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMapOrCell[] = [
      [1, 3, 'S'],
      [1, 4, 'S'],
      [2, 1, 'S'],
      [3, 1, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const ids = [
        svdata.shipMstIds(973), // Thonburi
      ].flat()
      if(shipCount([msts[0]], ids)) {
        return true
      }
      if (!shipCategoryCount([msts[0]], [ApiShipCategory.norge])) {
        return false
      }
      return shipCategoryCount(msts, [ApiShipCategory.norge]) >= 2
    }
  }
)

// 1025: 精鋭十一駆「白雪改二」、抜錨します！
register(
  1025,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMapOrCell[] = [
      [2, 3, 'S'],
      [2, 5, 'S'],
      [4, 3, 'S'],
      [5, 3, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      if (!shipCount([ships[0]], svdata.shipMstIds(986))) return false
      return shipCategoryCount(ships, [ApiShipCategory.fubuki]) >= 2
    }
  }
)

// 1026:「第一水雷戦隊」合戦用意！抜錨せよ！
register(
  1026,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [2, 2, 2]
    static key = QuestKey.infer
    static maps: QuestMapOrCell[] = [
      [1, 2, 'S'],
      [1, 3, 'S'],
      [1, 4, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const ids = [
        svdata.shipMstIds(114),
        svdata.shipMstIds(49),
        svdata.shipMstIds(18),
        svdata.shipMstIds(631),
        svdata.shipMstIds(15),
        svdata.shipMstIds(16),
        svdata.shipMstIds(41),
        svdata.shipMstIds(38),
        svdata.shipMstIds(40)
      ].flat()
      return shipCount(msts, ids) >= 4
    }
  }
)

// 1027: 「第五艦隊」緊急出動用意ッ！
register(
  1027,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMapOrCell[] = [
      [2, 1, 'S'],
      [2, 2, 'S'],
      [3, 1, 'S'],
      [3, 2, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const ids = [
        svdata.shipMstIds(64),
        svdata.shipMstIds(63),
        svdata.shipMstIds(100),
        svdata.shipMstIds(101),
        svdata.shipMstIds(114),
        svdata.shipMstIds(49),
        svdata.shipMstIds(18),
        svdata.shipMstIds(631),
        svdata.shipMstIds(15),
        svdata.shipMstIds(16),
        svdata.shipMstIds(41),
        svdata.shipMstIds(38),
        svdata.shipMstIds(40)
      ].flat()
      return shipCount(msts, ids) >= 5
    }
  }
)

// 1028: 【WD限定任務】軽空母、出撃！2026
register(
  1028,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.yearly
    static maps: QuestMapOrCell[] = [
      [1, 3, 'A'],
      [2, 1, 'A'],
      [2, 2, 'A'],
      [3, 1, 'A']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      if (shipCount([msts[0]], svdata.shipMstIds(925))) {
        return true
      }
      return shipTypeCount(msts, [ApiShipType.kei_kuubo]) >= 2
    }
  }
)

// 1029: 三十二駆「浜波改二」抜錨！敵中を突破せよ！
register(
  1029,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMapOrCell[] = [
      [1, 6, ''],
      [2, 2, 'S'],
      [2, 3, 'S'],
      [2, 4, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      if (!shipCount([msts[0]], svdata.shipMstIds(983))) {
        return false
      }
      const ids = [
        svdata.shipMstIds(674),
        svdata.shipMstIds(675),
        svdata.shipMstIds(485),
        svdata.shipMstIds(528),
        svdata.shipMstIds(425)
      ].flat()
      return shipCount(msts, ids) >= 2
    }
  }
)

// 1030: 【期間限定任務】Fletcher級、哨戒任務！
register(
  1030,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [2, 2, 2]
    static key = QuestKey.infer
    static maps: QuestMapOrCell[] = [
      [1, 3, 'S'],
      [1, 4, 'S'],
      [2, 4, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      return (
        shipCategoryCount(msts, [ApiShipCategory.fletcher]) >= 2 &&
        shipCategoryCount(msts, [ApiShipCategory.northampton]) >= 1
      )
    }
  }
)

// 1031: 【初夏限定任務】北方海域 戦闘哨戒作戦2026
register(
  1031,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [2, 2, 2]
    static key = QuestKey.infer
    static maps: QuestMapOrCell[] = [
      [3, 1, 'S'],
      [3, 2, 'S'],
      [3, 5, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const ids = [
        svdata.shipMstIds(79), // haruna
        svdata.shipMstIds(544), // Gambier Bay
        svdata.shipMstIds(923), // Tuscaloosa
        svdata.shipMstIds(115), // yubari
        svdata.shipMstIds(24), // ooi
        svdata.shipMstIds(528), // hayanami
        svdata.shipMstIds(484), // hamanami
        svdata.shipMstIds(631), // usugumo
        svdata.shipMstIds(93), // oboro
        svdata.shipMstIds(973), // Thonburi
        svdata.shipMstIds(645), // souya
      ].flat()
      if (!shipCount([msts[0]], ids)) {
        return false
      }
      return shipCount(msts.slice(1), ids) >= 2
    }
  }
)

// 1032:【初夏限定任務】水上打撃部隊 作戦運用2026
register(
  1032,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [2, 2, 2, 2]
    static key = QuestKey.yearly
    static maps: QuestMapOrCell[] = [
      [1, 4, 'S'],
      [2, 5, 'S'],
      [3, 5, 'S'],
      [4, 5, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatMaps(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const max_lv = 88
      if (shipTypeCount(msts, ApiShipTypeSenkanClasses, max_lv) < 2) {
        return false
      }
      if (shipTypeCount(msts, [ApiShipType.keijyun], max_lv) < 1) {
        return false
      }
      return shipTypeCount(msts, [ApiShipType.kutikukan], max_lv) >= 2
    }
  }
)

// 1033: 二等輸送艦の積極運用
register(
  1033,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMapOrCell[] = [
      [1, 1, 'S'],
      [1, 2, 'S'],
      [1, 3, 'S'],
      [1, 4, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      if (!shipCount([msts[0]], svdata.shipMstIds(945))) {
        return false
      }
      if (shipTypeCount(msts, [ApiShipType.kutikukan]) >= 2) {
        return true
      }
      return shipTypeCount(msts, [ApiShipType.keijyun]) >= 1
    }
  }
)

// 1034:【夏季限定任務】夏の日の「朝日」護衛
register(
  1034,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMapOrCell[] = [
      [1, 2, 'S'],
      [1, 3, 'S'],
      [1, 4, 'S'],
      [2, 1, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      if (!shipCount([ships[0]], svdata.shipMstIds(953))) return false
      if (
        shipTypeCount(ships, [ApiShipType.kutikukan]) < 3 &&
        shipTypeCount(ships, [ApiShipType.kaiboukan]) < 1
      )
        return false
      return true
    }
  }
)

// 1035:【夏季限定任務】夏の日の「朝日」護衛
register(
  1035,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMapOrCell[] = [
      [5, 1, 'S'],
      [5, 3, 'S'],
      [5, 4, 'S']
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      const flagship_ids = [
        svdata.shipMstIds(138), // nosiro
        svdata.shipMstIds(597), // Atlanta
        svdata.shipMstIds(942) // Richard P.Leary
      ].flat()

      if (!shipCount([ships[0]], flagship_ids)) return false
      return shipTypeCount(ships, [ApiShipType.kutikukan]) >= 3
    }
  }
)

// 1036:輸送船団護衛部隊、出撃せよ！
register(
  1036,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [2, 2, 2, 2]
    static key = QuestKey.infer
    static maps: QuestMapOrCell[] = [
      [1, 2, 'A'],
      [1, 3, 'A'],
      [1, 4, 'A'],
      [1, 5, 'A']
    ]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const ships = toShipMsts(svdata, ship_ids)
      return (
        shipTypeCount(ships, [ApiShipType.yourikukan, ApiShipType.hokyuukan]) >= 2 &&
        shipTypeCount(ships, [ApiShipType.kaiboukan]) >= 2
      )
    }
  }
)

// 1037:【期間限定任務】秋の旗艦は……私ッ！
register(
  1037,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [2, 2, 2, 2]
    static key = QuestKey.infer
    static maps: QuestMapOrCell[] = [
      [1, 3, 'A'],
      [1, 4, 'A'],
      [1, 5, 'A'],
      [2, 1, 'A']
    ]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, [ship_ids[0]])

      const flagship_ids = [
        svdata.shipMstIds(132), // akigumo
        svdata.shipMstIds(625), // akisimo
        svdata.shipMstIds(421), // akizuki
        svdata.shipMstIds(445) // akitusima
      ].flat()

      return !!shipCount([msts[0]], flagship_ids)
    }
  }
)

// 1039:【期間限定任務】Halloween海上護衛隊出撃！
register(
  1039,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMapOrCell[] = [
      [1, 2, 'S'],
      [1, 4, 'S'],
      [1, 5, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const ids = [
        svdata.shipMstIds(114), // abukuma
        svdata.shipMstIds(15), // akebono
        svdata.shipMstIds(95), // asasio
        svdata.shipMstIds(671), // makinami
        svdata.shipMstIds(484), // hamanami
        svdata.shipMstIds(921), // ukuru
        svdata.shipMstIds(922), // inagi
        svdata.shipMstIds(904), // noumi
        svdata.shipMstIds(637), // dai4gou
        svdata.shipMstIds(638), // dai30gou
        svdata.shipMstIds(898), // dai22gou
      ].flat()
      return shipCount(msts, ids) >= 4
    }
  }
)

// 1040:【期間限定任務】Halloween狼隊、夜の襲撃！
register(
  1040,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [2, 2]
    static key = QuestKey.infer
    static maps: QuestMapOrCell[] = [
      [2, 1, 'S'],
      [2, 2, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const ids = [
        svdata.shipMstIds(923), // Tuscaloosa
        svdata.shipMstIds(93), // oboro
        svdata.shipMstIds(45), // yuudati
        svdata.shipMstIds(415), // nowaki
        svdata.shipMstIds(528), // hayanami
        svdata.shipMstIds(943), // kumanomaru
        svdata.shipMstIds(639), // jingeikai
      ].flat()
      return shipCount([msts[0]], ids) > 0 && shipCount(msts, ids) >= 3
    }
  }
)

// 1041: 三十二駆「早波改二」、元気に出撃せよ！
register(
  1041,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMapOrCell[] = [
      [2, 2, 'S'],
      [2, 4, 'S'],
      [2, 5, 'S'],
      [7, 1, 'S'],
      QuestMapCell_7_2_2('S')
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      if (! shipCount([msts[0]], [982])) {
        return false
      }
      const ids = [
        svdata.shipMstIds(674), // tamanami
        svdata.shipMstIds(675), // suzunami
        svdata.shipMstIds(485), // fujinami
        svdata.shipMstIds(484) // hamanami
      ].flat()
      return shipCount(msts, ids) >= 2
    }
  }
)

// 1042:最新鋭改装空母「飛龍改三」、疾風怒涛！
register(
  1042,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [2, 5, 'S'],
      [3, 5, 'S'],
      [4, 5, 'S'],
      [5, 5, 'S'],
      [6, 4, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const ids1 = [
        svdata.shipMstIds(1031), // tamanami
      ].flat()
      if (! shipCount([msts[0]], ids1)) {
        return false
      }
      const ids2 = [
        svdata.shipMstIds(674), // tamanami
        svdata.shipMstIds(675), // suzunami
        svdata.shipMstIds(453), // kazagumo
        svdata.shipMstIds(485), // fujinami
        svdata.shipMstIds(528), // hayanami
        svdata.shipMstIds(484) // hamanami
      ].flat()
      return shipCount(msts.slice(1), ids2) >= 2
    }
  }
)

// 1043:【期間限定任務】春の旗艦は……私だからっ！
register(
  1043,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [2, 2, 2, 2]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [1, 3, 'A'],
      [1, 4, 'A'],
      [1, 5, 'A'],
      [2, 3, 'A'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const ids = [
        svdata.shipMstIds(79), // haruna
        svdata.shipMstIds(521), // taiyou
        svdata.shipMstIds(405), // harusame
        svdata.shipMstIds(473), // harukaze
        svdata.shipMstIds(17), // kazerou
        svdata.shipMstIds(181), // amarukaze
        svdata.shipMstIds(93), // oboro
        svdata.shipMstIds(15), // akebono
        svdata.shipMstIds(653) // Scirocco
      ].flat()
      if (! shipCount([msts[0]], ids)) {
        return false
      }
      return shipCount(msts.slice(1), ids) > 0
    }
  }
)

// 1044: 三十二駆「玉波改二」、出撃いたします。
register(
  1044,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMap[] = [
      [2, 3, 'S'],
      [2, 5, 'S'],
      [4, 5, 'S'],
      [5, 5, 'S'],
      [6, 3, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const ids1 = [
        svdata.shipMstIds(1033), // tamanami kaini
      ].flat()
      if (! shipCount([msts[0]], ids1)) {
        return false
      }
      const ids2 = [
        svdata.shipMstIds(485), // fujinami
      ].flat()
      return shipCount(msts.slice(1), ids2) > 0
    }
  }
)

// 1045:「吹雪改三」抜錨します！見てくださいっ！
register(
  1045,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [1, 1, 1, 1, 1]
    static key = QuestKey.infer
    static maps: QuestMapOrCell[] = [
      QuestMapCell_7_5_3('S'),
      [5, 1, 'S'],
      [5, 3, 'S'],
      [5, 4, 'S'],
      [5, 5, 'S'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatOneByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      if (deckShipCount(ship_ids) < 2) {
        return false
      }

      const msts = toShipMsts(svdata, ship_ids)
      const ids1 = [
        svdata.shipMstIds(1035), // fubuki kaisan
      ].flat()
      if (! shipCount([msts[0]], ids1)) {
        return false
      }
      return !!shipCategoryCount([msts[1]], [ApiShipCategory.fubuki])
    }
  }
)

// 1046:【期間限定任務】提督、菖蒲の湯は如何ですか?
register(
  1046,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [2, 2, 2, 2]
    static key = QuestKey.infer
    static maps: QuestMapOrCell[] = [
      [1, 2, 'A'],
      [1, 3, 'A'],
      [1, 4, 'A'],
      [1, 5, 'A'],
    ]
    static formatter(quest: Quest): string {
      return detailFormatByMap(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const ids1 = [
        svdata.shipMstIds(900), // yamasiomaru
        svdata.shipMstIds(637), // dai4goukaiboukan
        svdata.shipMstIds(638), // dai30goukaiboukan
      ].flat()
      if (! shipCount([msts[0]], ids1)) {
        return false
      }
      if (!shipTypeCount(msts.slice(1), [ApiShipType.kutikukan])) {
        return false
      }
      return shipTypeCount(msts.slice(1), [ApiShipType.kaiboukan]) >= 2
    }
  }
)

// 1047:「涼波改二」ラバウルより抜錨せよ！
register(
  1047,
  class {
    static readonly questType = QuestType.battleMapDeck
    static max = [2, 2, 2]
    static key = QuestKey.infer
    static maps: QuestMapOrCell[] = [
      [5, 4, 'S'],
      [5, 5, 'S'],
      QuestMapCell_5_6_3('S'),
    ]
    static formatter(quest: Quest): string {
      return detailFormatMaps(quest, this.maps)
    }
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, ship_ids)
      const ids1 = [
        svdata.shipMstIds(1034), // sudunami kaini
        svdata.shipMstIds(745), // sudunami kainiho
      ].flat()
      if (! shipCount([msts[0]], ids1)) {
        return false
      }
      const ids2 = [
        svdata.shipMstIds(69), // tyoukai
        svdata.shipMstIds(124), // suduya
        svdata.shipMstIds(70), // mogami
        svdata.shipMstIds(138), // nosiro
        svdata.shipMstIds(674), // tamanami
        svdata.shipMstIds(485), // fujinami
        svdata.shipMstIds(528), // hayanami
      ].flat()
      return shipCount(msts.slice(1), ids2) >= 2
    }
  }
)

// 1101: 海軍工廠の再整備
register(
  1101,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [8]
    static key = QuestKey.infer
    static id_or_types = [{ id: 2 }]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 12.7cm連装砲：'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 1102: 海軍工廠の再整備
register(
  1102,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [8]
    static key = QuestKey.infer
    static id_or_types = [{ id: 1 }]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 12cm単装砲：'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 1103: 潜水艦強化兵装の量産
register(
  1103,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [3]
    static key = QuestKey.infer
    static id_or_types = [{ id: 125 }]
    static getCondition(_svdata: SvData) {
      return undefined
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 61cm三連装(酸素)魚雷：'], quest)
    }
  }
)

// 1104: 潜水艦電子兵装の量産
register(
  1104,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [3]
    static key = QuestKey.infer
    static id_or_types = [{ id: 106 }]
    static getCondition(_svdata: SvData) {
      return undefined
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 13号対空電探改：'], quest)
    }
  }
)

// 1105: 夏の格納庫整備＆航空基地整備
register(
  1105,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [3]
    static key = QuestKey.infer
    static id_or_types = [{ type: SlotitemType.LandAttackAircraft }]
    static getCondition(_svdata: SvData) {
      return undefined
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 陸上攻撃機：'], quest)
    }
  }
)

// 1106: 精鋭三座水上偵察機隊の前線投入
register(
  1106,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [3, 3]
    static key = QuestKey.infer
    static id_or_types = [{ id: 25 }, { id: 26 }]
    static getCondition(svdata: SvData): DestroyItemCondition {
      return {
        flagship_ids: svdata.shipMstIds(488),
        flagship_slotitem_ids: [238],
        flagship_slotitem_lvl: [10]
      }
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 零式水上偵察機：', '瑞雲：'], quest)
    }
  }
)

// 1107: 【鋼材輸出】基地航空兵力を増備せよ！
register(
  1107,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [2, 2]
    static key = QuestKey.infer
    static id_or_types = [{ type: SlotitemType.Fighter }, { type: SlotitemType.TorpedoBomber }]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 艦戦：', '艦攻：'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 1108: 調整改良型「水中探信儀」の増産
register(
  1108,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [2, 2]
    static key = QuestKey.infer
    static id_or_types = [{ id: 46 }, { id: 47 }]
    static getCondition(svdata: SvData): DestroyItemCondition {
      return {
        flagship_ids: [svdata.shipMstIds(145), svdata.shipMstIds(588)].flat(),
        flagship_slotitem_ids: [47],
        flagship_slotitem_lvl: [10]
      }
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 九三式ソナー：', '三式ソナー：'], quest)
    }
  }
)

// 1109: 上陸作戦支援用装備の配備
register(
  1109,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [2, 2]
    static key = QuestKey.infer
    static id_or_types = [{ id: 37 }, { id: 68 }]
    static getCondition(svdata: SvData): DestroyItemCondition {
      return {
        flagship_ids: svdata.shipMstIds(621),
        flagship_slotitem_ids: [166],
        flagship_slotitem_lvl: [10]
      }
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 7.7mm機銃：', '大発：'], quest)
    }
  }
)

// 1110: 秋刀魚祭り【拡張任務】秋刀魚で戦闘糧食！
register(
  1110,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [4]
    static key = QuestKey.yearly
    static id_or_types: ItemIdOrType[] = [{ id: 66 }]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 8cm高角砲：', ], quest)
    }
    static getCondition(svdata: SvData): DestroyItemCondition {
      return {
        flagship_id_lvs: [
          { ids: svdata.shipMstIds(135), lv: 100 },
          { ids: svdata.shipMstIds(996), lv: 1 },
        ],
        flagship_slotitem_ids: [145],
        flagship_slotitem_lvl: [6]
      }
    }
  }
)

// 1112: 鎮守府「大掃除」祭り！
register(
  1112,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [4, 4, 4]
    static key = QuestKey.infer
    static id_or_types = [
      { type: SlotitemType.SmallMainGun },
      { type: SlotitemType.MediumMainGun },
      { type: SlotitemType.LargeMainGun }
    ]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 小口径：', '中口径：', '大口径：'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 1113: 「無線誘導弾」装備新型襲撃機の実戦配備
register(
  1113,
  class {
    static readonly questType = QuestType.slotitemCondition
    static max = [1, 1]
    static notFixState = true
    static key = QuestKey.infer
    static slotitem_ids = [453, 446]
    static formatter(quest: Quest): string {
      return detailFormat(['キ102乙：', '二式複戦 屠龍 丙型：'], quest)
    }
  }
)

// 1114: 【工廠任務】新装備開発計画I
register(
  1114,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [3, 3, 3]
    static key = QuestKey.infer
    static id_or_types = [
      { type: SlotitemType.SmallMainGun },
      { type: SlotitemType.MediumMainGun },
      { type: SlotitemType.SecondaryGun }
    ]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 小口径：', '中口径：', '副砲：'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 1115: 【工廠任務】新装備開発計画II
register(
  1115,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [3, 3, 3]
    static key = QuestKey.infer
    static id_or_types = [
      { type: SlotitemType.LargeMainGun },
      { type: SlotitemType.SecondaryGun },
      { type: SlotitemType.RecSeaplane }
    ]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 大口径：', '副砲：', '水上偵察機：'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 1116: 【工廠任務】新装備開発計画III
register(
  1116,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [3, 3, 3]
    static key = QuestKey.infer
    static id_or_types = [
      { type: SlotitemType.RecSeaplane },
      { type: SlotitemType.SeaplaneBomber },
      { type: SlotitemType.AAGun }
    ]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 水偵：', '水爆：', '機銃：'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 1117: 【工廠任務】新夜偵の実戦配備
register(
  1117,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [1]
    static notFixState = true
    static key = QuestKey.infer
    static id_or_types = []
    static formatter(_quest: Quest): string {
      return ''
    }
    static getCondition(svdata: SvData): DestroyItemCondition {
      return {
        flagship_ids: [svdata.shipMstIds(158), svdata.shipMstIds(488)].flat(),
        flagship_slotitem_ids: [102],
        flagship_slotitem_lvl: [10]
      }
    }
  }
)

// 1118: 【工廠任務】Hedgehogの配備
register(
  1118,
  class {
    static readonly questType = QuestType.hensei
    static max = []
    static key = QuestKey.infer
    static isDeckMatch(svdata: SvData, ship_ids: number[]): boolean {
      const msts = toShipMsts(svdata, [ship_ids[0]])
      const shipIds = svdata.shipMstIds(920) // Samuel B.Roberts Mk.II
      if (!shipCount([msts[0]], shipIds)) {
        return false
      }

      // check equip
      const slotitem = svdata.slotitem(msts[0].api.api_slot[0])
      if (!slotitem) {
        return false
      }
      return slotitem.api_slotitem_id === 284
    }
    static formatter(_quest: Quest): string {
      return ''
    }
  }
)

// 1119: 【期間限定任務】Halloweenはお掃除も！
register(
  1119,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [8, 8, 8]
    static key = QuestKey.infer
    static id_or_types = [
      { type: SlotitemType.SmallMainGun },
      { type: SlotitemType.MediumMainGun },
      { type: SlotitemType.RecSeaplane }
    ]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 小口径：', '中口径：', '水上偵察機：'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 1120: 【工廠任務】新装備開発計画III
register(
  1120,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [4, 4, 4]
    static key = QuestKey.infer
    static id_or_types = [
      { type: SlotitemType.Fighter },
      { type: SlotitemType.DiveBomber },
      { type: SlotitemType.TorpedoBomber }
    ]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 艦戦：', '艦爆：', '艦攻：'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 1121:【年末年始】鎮守府大掃除！良いお年を！
register(
  1121,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [11, 11, 11]
    static key = QuestKey.infer
    static id_or_types = [
      { type: SlotitemType.SmallMainGun },
      { type: SlotitemType.MediumMainGun },
      { type: SlotitemType.RecSeaplane }
    ]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 小口径：', '中口径：', '水偵：'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 1122: 【年末年始】試製 鎮守府年末改修ジャンボ
register(
  1122,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [9, 4]
    static key = QuestKey.yearly
    static id_or_types = [{ id: 23 }, { id: 24 }]
    static getCondition(): DestroyItemCondition {
      return {
        flagship_slotitem_ids: [23],
        flagship_slotitem_lvl: [2]
      }
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 九九式艦爆：', '彗星：'], quest)
    }
  }
)

// 1123: 改良三座水上偵察機の増備
register(
  1123,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [2]
    static key = QuestKey.yearly
    static id_or_types = [{ id: 82 }]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 九七式艦攻(九三一空)：'], quest)
    }
    static getCondition(svdata: SvData): DestroyItemCondition {
      return {
        flagship_ids: [svdata.shipMstIds(188), svdata.shipMstIds(488)].flat(),
        flagship_slotitem_ids: [25],
        flagship_slotitem_lvl: []
      }
    }
  }
)

// 1124: 【早春限定任務】夜間航空作戦能力の増強
register(
  1124,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [2]
    static key = QuestKey.yearly
    static id_or_types = [{ id: 16 }]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 九七式艦攻：'], quest)
    }
    static getCondition(svdata: SvData): DestroyItemCondition {
      return {
        flagship_ids: svdata.shipMstIds(285),
        flagship_slotitem_ids: [98],
        flagship_slotitem_lvl: []
      }
    }
  }
)

// 1125: 【早春限定任務】試製「夜間瑞雲」の開発
register(
  1125,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [3]
    static key = QuestKey.yearly
    static id_or_types = [{ id: 26 }]
    static getCondition(svdata: SvData): DestroyItemCondition {
      return {
        flagship_ids: svdata.shipMstIds(501),
        flagship_slotitem_ids: [322],
        flagship_slotitem_lvl: [6]
      }
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 瑞雲：'], quest)
    }
  }
)

// 1126: 【13周年記念任務:拡張作戦】大規模工廠任務
register(
  1126,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [13, 13, 8]
    static key = QuestKey.monthly
    static id_or_types = [
      { type: SlotitemType.MediumMainGun },
      { type: SlotitemType.RecSeaplane },
      { id: 7 },
    ]
    static getCondition(_svdata: SvData) {
      return undefined
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 中口径：', '水偵：', '35.6cm：'], quest)
    }
  }
)

// 1127: 艦載用「煙幕発生装置」の改良
register(
  1127,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [1]
    static key = QuestKey.infer
    static id_or_types = []
    static getCondition(svdata: SvData): DestroyItemCondition {
      return {
        flagship_ids: svdata.shipMstIds(959),
        flagship_slotitem_ids: [500],
        flagship_slotitem_lvl: []
      }
    }
    static formatter(_quest: Quest): string {
      return ''
    }
  }
)

// 1128: 水上打撃戦用改良35.6cm砲の開発
register(
  1128,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [1]
    static key = QuestKey.infer
    static id_or_types = []
    static getCondition(svdata: SvData): DestroyItemCondition {
      return {
        flagship_ids: svdata.shipMstIds(593),
        flagship_slotitem_ids: [502],
        flagship_slotitem_lvl: [3]
      }
    }
    static formatter(_quest: Quest): string {
      return ''
    }
  }
)

// 1129: 潜水艦魚雷攻撃の精度向上
register(
  1129,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [1]
    static key = QuestKey.infer
    static id_or_types = []
    static getCondition(_svdata: SvData): DestroyItemCondition {
      return {
        flagship_ids: [],
        flagship_slotitem_ids: [213],
        flagship_slotitem_lvl: [10]
      }
    }
    static formatter(_quest: Quest): string {
      return ''
    }
  }
)

// 1130: 大規模改装の工廠準備
register(
  1130,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [3, 3, 3]
    static key = QuestKey.infer
    static id_or_types = [
      { type: SlotitemType.AAGun },
      { type: SlotitemType.EngineImp },
      { types: [SlotitemType.MediumExtraArmor, SlotitemType.LargeExtraArmor] }
    ]
    static getCondition(_svdata: SvData) {
      return undefined
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 機銃：', '機関部強化：', 'バルジ：'], quest)
    }
  }
)

// 1131: 砲熕兵装の整備
register(
  1131,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [18, 12, 6]
    static key = QuestKey.infer
    static id_or_types = [
      { type: SlotitemType.SmallMainGun },
      { type: SlotitemType.MediumMainGun },
      { type: SlotitemType.DepthCharge }
    ]
    static getCondition(_svdata: SvData) {
      return undefined
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 小口径：', '中口径：', '爆雷：'], quest)
    }
  }
)

// 1132: 改良D型砲の配備
register(
  1132,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [1]
    static notFixState = true
    static key = QuestKey.infer
    static id_or_types = []
    static getCondition(svdata: SvData): DestroyItemCondition {
      return {
        flagship_ids: svdata.shipMstIds(955),
        flagship_slotitem_ids: [267],
        flagship_slotitem_lvl: [8]
      }
    }
    static formatter(quest: Quest): string {
      return ''
    }
  }
)

// 1133: 逆探及び改良水上電探の実戦配備
register(
  1133,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [1]
    static key = QuestKey.infer
    static id_or_types = []
    static getCondition(svdata: SvData): DestroyItemCondition {
      return {
        flagship_ids: svdata.shipMstIds(955),
        flagship_slotitem_ids: [240],
        flagship_slotitem_lvl: []
      }
    }
    static formatter(_quest: Quest): string {
      return ''
    }
  }
)

// 1134: 22号対水上電探の改良
register(
  1134,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [1]
    static key = QuestKey.infer
    static id_or_types = []
    static getCondition(svdata: SvData): DestroyItemCondition {
      return {
        flagship_ids: [svdata.shipMstIds(145), svdata.shipMstIds(489)].flat(),
        flagship_slotitem_ids: [88],
        flagship_slotitem_lvl: [10]
      }
    }
    static formatter(_quest: Quest): string {
      return ''
    }
  }
)

// 1135: 【期間限定任務】「連山」に連なる翼
register(
  1135,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [1]
    static key = QuestKey.yearly
    static id_or_types = []
    static getCondition(_svdata: SvData): DestroyItemCondition {
      return {
        flagship_ids: [],
        flagship_slotitem_ids: [395],
        flagship_slotitem_lvl: [10]
      }
    }
    static formatter(_quest: Quest): string {
      return ''
    }
  }
)

// 1136: 【13周年記念任務:拡張任務】空技廠研究開発
register(
  1136,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [6, 2]
    static key = QuestKey.yearly
    static id_or_types = [{ id: 201 }, { id: 242 }]
    static getCondition(_svdata: SvData): DestroyItemCondition {
      return {
        flagship_ids: [894, 899, 1031],
        flagship_slotitem_ids: [96],
        flagship_slotitem_lvl: [],
        flagship_slotitem_alv_max: true,
        flagship_slotitem_only: true,
      }
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 紫電一一型：', 'Swordfish：'], quest)
    }
  }
)

// 1137: 鵜来型海防艦兵装の開発
register(
  1137,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [4, 4, 4]
    static key = QuestKey.infer
    static id_or_types = [{ id: 46 }, { id: 44 }, { id: 226 }]
    static getCondition(): DestroyItemCondition {
      return {
        flagship_categories: [ApiShipCategory.ukuru],
        flagship_slotitem_ids: [45],
        flagship_slotitem_lvl: []
      }
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 九三式ソナー：', '九四式爆雷：', '九五式爆雷：'], quest)
    }
  }
)

// 1138: 【高射装置量産】94式高射装置の追加配備
register(
  1138,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [4]
    static key = QuestKey.infer
    static id_or_types = [{ id: 120 }]
    static getCondition(_svdata: SvData): DestroyItemCondition {
      return {
        flagship_categories: [ApiShipCategory.akizuki],
        flagship_slotitem_ids: [],
        flagship_slotitem_lvl: []
      }
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 91式高射装置：'], quest)
    }
  }
)

// 1139: 【艦隊通信能力の強化】通信要員の育成
register(
  1139,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [2, 2, 3]
    static key = QuestKey.infer
    static id_or_types = [{ id: 30 }, { id: 27 }, { id: 145 }]
    static getCondition(svdata: SvData): DestroyItemCondition {
      return {
        flagship_ids: svdata.shipMstIds(183),
        flagship_slotitem_ids: [27],
        flagship_slotitem_lvl: []
      }
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 21号対電：', '13号対電：', '戦闘糧食：'], quest)
    }
  }
)

// 1140: 【新鋭海外艦装備】新型四連装主砲の開発
register(
  1140,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [4]
    static key = QuestKey.infer
    static id_or_types = [{ id: 8 }]
    static getCondition(_svdata: SvData): DestroyItemCondition {
      return {
        flagship_ids: [969],
        flagship_slotitem_ids: [246],
        flagship_slotitem_lvl: []
      }
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 41cm連装砲：'], quest)
    }
  }
)

// 1141: 最新改修型三座水上偵察機の開発
register(
  1141,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [15]
    static key = QuestKey.infer
    static id_or_types = [
      { id: 25 }
    ]
    static getCondition(svdata: SvData): DestroyItemCondition {
      const ids = [svdata.shipMstIds(911), svdata.shipMstIds(488), 633].flat()
      return {
        flagship_ids: ids,
        flagship_slotitem_ids: [238],
        flagship_slotitem_lvl: [10]
      }
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 零式水上偵察機：'], quest)
    }
  }
)

// 1142: 最精鋭「天山」装備艦攻隊の配備
register(
  1142,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [4]
    static key = QuestKey.infer
    static id_or_types = [{ id: 17 }]
    static getCondition(svdata: SvData): DestroyItemCondition {
      return {
        flagship_ids: svdata.shipMstIds(461),
        flagship_slotitem_ids: [144],
        flagship_slotitem_lvl: []
      }
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 天山：'], quest)
    }
  }
)

// 1143: 「霧島改二丙」改装工廠任務
register(
  1143,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [8]
    static key = QuestKey.infer
    static id_or_types = [{ id: 7 }]
    static getCondition(svdata: SvData): DestroyItemCondition {
      return {
        flagship_ids: svdata.shipMstIds(694),
        flagship_slotitem_ids: [329],
        flagship_slotitem_lvl: [8]
      }
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 35.6cm連装砲：'], quest)
    }
  }
)

// 1144: 秋刀魚祭り【拡張任務二〇二五】フィナーレ！
register(
  1144,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [5]
    static key = QuestKey.yearly
    static id_or_types = [{ id: 120 }]
    static getCondition(_svdata: SvData): DestroyItemCondition {
      return {
        flagship_categories: [ApiShipCategory.akizuki],
        flagship_slotitem_ids: [553],
        flagship_slotitem_lvl: [7]
      }
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 91式高射装置：'], quest)
    }
  }
)

// 1145: 【工廠任務】伊号潜水艦装備の拡充
register(
  1145,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [8, 15]
    static key = QuestKey.infer
    static id_or_types = [{ id: 25 }, { type: SlotitemType.Torpedo }]
    static getCondition(_svdata: SvData): DestroyItemCondition {
      return {
        flagship_type_ids: [ApiShipType.sensuikan],
        flagship_slotitem_ids: [25],
        flagship_slotitem_lvl: [4]
      }
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 零式水上偵察機：', '魚雷：'], quest)
    }
  }
)

// 1146:【年末年始】拡張大掃除&特別資源輸出-I
register(
  1146,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [8, 8, 16]
    static key = QuestKey.infer
    static id_or_types = [
      { type: SlotitemType.DiveBomber },
      { type: SlotitemType.TorpedoBomber },
      { type: SlotitemType.Torpedo },

    ]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 艦爆：', '艦攻：', '魚雷：'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 1147:【年末年始】拡張大掃除&特別資源輸出-II
register(
  1147,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [8, 16, 20]
    static key = QuestKey.infer
    static id_or_types = [
      { type: SlotitemType.LargeMainGun },
      { type: SlotitemType.MediumMainGun },
      { type: SlotitemType.RecSeaplane }
    ]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 大口径：', '中口径：', '水偵：'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 1148:【対空兵装の拡充】94式高射装置の増加配備
register(
  1148,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [3, 3]
    static key = QuestKey.infer
    static id_or_types = [{ id: 120 }, { id: 27 }]
    static getCondition(svdata: SvData): DestroyItemCondition {
      return {
        flagship_ids: [svdata.shipMstIds(426), svdata.shipMstIds(986)].flat(),
        flagship_slotitem_ids: [120, 120],
        flagship_slotitem_lvl: []
      }
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 91式高射装置：', '13号電探：'], quest)
    }
  }
)

// 1149: 【期間限定任務】作戦後の不要装備等用途廃止
register(
  1149,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [8, 8, 4]
    static key = QuestKey.infer
    static id_or_types = [
      { type: SlotitemType.MediumMainGun },
      { type: SlotitemType.Torpedo },
      { type: SlotitemType.LargeMainGun }
    ]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 中口径：', '魚雷：', '大口径：'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 1150: 【初夏限定任務】海軍工廠の整理再編2026
register(
  1150,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [20, 20, 10, 10]
    static key = QuestKey.infer
    static id_or_types = [
      { type: SlotitemType.MediumMainGun },
      { type: SlotitemType.LargeMainGun },
      { type: SlotitemType.SecondaryGun },
      {
        id_with_alv: {
          id: 25,
          alv: 7
        }
      }
    ]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 中：', '大：', '副砲：', '零式水偵[熟練max]：'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 1151: 陸軍戦闘機及び海外戦闘機の増備
register(
  1151,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [14, 12, 10]
    static key = QuestKey.infer
    static id_or_types = [
      { type: SlotitemType.RecSeaplane },
      { type: SlotitemType.MediumMainGun },
      { type: SlotitemType.DiveBomber }
    ]
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 水偵：', '中口径：', '艦爆：'], quest)
    }
    static getCondition(_svdata: SvData) {
      return undefined
    }
  }
)

// 1152:【対潜戦力強化】海防艦対潜兵装の強化
register(
  1152,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [4]
    static key = QuestKey.infer
    static id_or_types = [{ id: 44 }]
    static getCondition(_svdata: SvData): DestroyItemCondition {
      return {
        flagship_type_ids: [ApiShipType.kaiboukan],
        flagship_slotitem_ids: [45, 45, 45],
        flagship_slotitem_lvl: [3]
      }
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 九四式爆雷投射機：'], quest)
    }
  }
)

// 1153:【続：対潜戦力強化】対潜兵装のさらなる拡充
register(
  1153,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [4]
    static key = QuestKey.infer
    static id_or_types = [{ id: 44 }]
    static getCondition(svdata: SvData): DestroyItemCondition {
      return {
        flagship_categories: [ApiShipCategory.hiburi, ApiShipCategory.ukuru],
        flagship_slotitem_ids: [45, 45, 45],
        flagship_slotitem_lvl: [4]
      }
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 九四式爆雷投射機：'], quest)
    }
  }
)

// 1154:【新型対潜兵装開発】対潜噴進爆雷砲の開発
register(
  1154,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [6]
    static key = QuestKey.infer
    static id_or_types = [{ id: 47 }]
    static getCondition(_svdata: SvData): DestroyItemCondition {
      return {
        flagship_lv: 96,
        flagship_type_ids: [ApiShipType.kutikukan],
        flagship_slotitem_ids: [287, 1],
        flagship_slotitem_lvl: [10, 6]
      }
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 三式水中探信儀：'], quest)
    }
  }
)

// 1155: 秋月型防空駆逐艦用兵装の拡充
register(
  1155,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [8]
    static key = QuestKey.infer
    static id_or_types = [{ id: 10 }]
    static getCondition(_svdata: SvData): DestroyItemCondition {
      return {
        flagship_lv: 70,
        flagship_categories: [ApiShipCategory.akizuki],
        flagship_slotitem_ids: [3, 3, 121],
        flagship_slotitem_lvl: [0, 0, 0]
      }
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 12.7cm連装高角砲：'], quest)
    }
  }
)

// 1156: 【初夏限定任務】海軍工廠の再編
register(1156, class {
  static readonly questType = QuestType.destroyItemIdOrType;
  static max = [12, 12, 12];
  static key = QuestKey.yearly
  static id_or_types = [
    { type: SlotitemType.DiveBomber },
    { type: SlotitemType.TorpedoBomber },
    { type: SlotitemType.RecSeaplane },
  ];
  static formatter(quest: Quest): string {
    return detailFormat(['破棄 爆撃機：', '攻撃機：', '水偵：'], quest)
  }
  static getCondition(_svdata: SvData) {
    return undefined
  }
})

// 1157: 【重南瓜祭り拡張任務】対潜装備も整理整頓！
register(1157, class {
  static readonly questType = QuestType.destroyItemIdOrType;
  static max = [6, 6, 6];
  static key = QuestKey.yearly
  static id_or_types = [
    { id: 44 },
    { id: 45 },
    { id: 346 },
  ];
  static formatter(quest: Quest): string {
    return detailFormat(['爆雷破棄 九四式：', '三式：', '二式：'], quest)
  }
  static getCondition(_svdata: SvData) {
    return undefined
  }
})

// 1158: 第三十二駆逐隊「早波」、改装準備！
register(1158, class {
  static readonly questType = QuestType.destroyItemIdOrType;
  static max = [5, 5, 5];
  static key = QuestKey.infer
  static id_or_types = [
    { id: 46 },
    { id: 47 },
    { id: 226 },
  ];
  static getCondition(svdata: SvData): DestroyItemCondition {
    let deck_checked = false;
    const deck = svdata.deckPort(ApiDeckPortId.deck1st);
    if (deck) {
      const msts = toShipMsts(svdata, deck.api_ship)
      const ids = [
        svdata.shipMstIds(674), // tamanami
        svdata.shipMstIds(675), // suzunami
        svdata.shipMstIds(485), // fujinami
        svdata.shipMstIds(484) // hamanami
      ].flat()
      deck_checked = shipCount(msts, ids) >= 3
    }
    return {
      flagship_ids: svdata.shipMstIds(528),
      flagship_slotitem_ids: [],
      flagship_slotitem_lvl: [],
      deck_checked
    }
  }
  static formatter(quest: Quest): string {
    return detailFormat(['破棄 九三式ソ：', '三式ソ：', '九五式爆雷：'], quest)
  }
})

//1159:【工廠任務】量産航空機の改編
register(1159, class {
  static readonly questType = QuestType.destroyItemIdOrType;
  static max = [3, 3, 3, 3];
  static key = QuestKey.infer
  static id_or_types = [
    { id: 19 },
    { id: 20 },
    { id: 181 },
    { id: 176 },
  ];
  static getCondition(svdata: SvData): DestroyItemCondition {
    return {
      flagship_ids: svdata.shipMstIds(894), // housyou kaini
      flagship_slotitem_ids: [],
      flagship_slotitem_lvl: [],
    }
  }
  static formatter(quest: Quest): string {
    return detailFormat(['破棄 九六型：', '21型：', '32型：', '飛燕：'], quest)
  }
})

// 1160:【工廠任務】試製震電の艦戦型改二への改修
register(1160, class {
  static readonly questType = QuestType.destroyItemIdOrType;
  static max = [5, 5];
  static key = QuestKey.infer
  static id_or_types = [
    { id: 21 },
    { id: 55 },
  ];
  static getCondition(svdata: SvData): DestroyItemCondition {
    let deck_checked = false;
    const deck = svdata.deckPort(ApiDeckPortId.deck1st);
    if (deck) {
      const msts = toShipMsts(svdata, deck.api_ship)
      const ids = [
        svdata.shipMstIds(981), // fujinami kaini
        svdata.shipMstIds(982), // hayanami kaini
        svdata.shipMstIds(983), // hamanami kaini
        svdata.shipMstIds(564) // kazagumo kaini
      ].flat()
      deck_checked = shipCount(msts.slice(1), ids) >= 3
    }
    return {
      flagship_ids: svdata.shipMstIds(196), // hiryu kaini
      flagship_slotitem_ids: [],
      flagship_slotitem_lvl: [],
      deck_checked
    }
  }
  static formatter(quest: Quest): string {
    return detailFormat(['破棄 艦戦52型：', '紫電改二：'], quest)
  }
})

// 1161:【工廠任務】新装備運用のための工廠整備【壱】
register(1161, class {
  static readonly questType = QuestType.destroyItemIdOrType;
  static max = [9, 9, 9, 8, 8, 9, 7];
  static key = QuestKey.infer
  static id_or_types = [
    { type: SlotitemType.Fighter },
    { type: SlotitemType.TorpedoBomber },
    { type: SlotitemType.DiveBomber },
    { type: SlotitemType.DepthCharge },
    { type: SlotitemType.AAGun },
    { type: SlotitemType.MediumMainGun },
    { type: SlotitemType.LargeMainGun },
  ];
  static getCondition(svdata: SvData): DestroyItemCondition {
    return {
      flagship_ids: svdata.shipMstIds(196), // hiryu kaini
      flagship_slotitem_ids: [],
      flagship_slotitem_lvl: [],
    }
  }
  static formatter(quest: Quest): string {
    return detailFormat(['破棄 戦:', '攻:', '爆:', '爆雷:', '機銃:', '中:', '大:'], quest)
  }
})

// 1162:【工廠任務】新装備運用のための工廠整備【弐】
register(1162, class {
  static readonly questType = QuestType.destroyItemIdOrType;
  static max = [6, 4, 8, 2];
  static key = QuestKey.infer
  static id_or_types = [
    { id: 21 },
    { id: 201 },
    { id: 10 },
    { id: 9 },
  ];
  static formatter(quest: Quest): string {
    return detailFormat(['破棄 52型：', '紫電一一型：', '12.7高角砲：', '46砲：'], quest)
  }
  static getCondition(_svdata: SvData) {
    return undefined
  }
})

// 1163:【工廠任務】震電の噴式推進化
register(1163, class {
  static readonly questType = QuestType.destroyItemIdOrType;
  static max = [1];
  static key = QuestKey.infer
  static id_or_types = [];
  static formatter(_quest: Quest): string {
    return '';
  }
  static getCondition(svdata: SvData): DestroyItemCondition {
    return {
      flagship_ids: svdata.shipMstIds(1031), // hiryu kaini
      flagship_slotitem_ids: [547],
      flagship_slotitem_lvl: [10],
    }
  }
})

// 1164:【工廠任務】水雷戦隊新改装艦、改装準備！
register(1164, class {
  static readonly questType = QuestType.destroyItemIdOrType;
  static max = [8, 4, 8];
  static key = QuestKey.infer
  static id_or_types = [
    { id: 45 },
    { id: 47 },
    { id: 10 },
  ];
  static getCondition(svdata: SvData): DestroyItemCondition {
    let deck_checked = false;
    const deck = svdata.deckPort(ApiDeckPortId.deck1st);
    if (deck) {
      const msts = toShipMsts(svdata, deck.api_ship)
      const ids = [
        svdata.shipMstIds(485), // fujinami
        svdata.shipMstIds(25), // kitakami
      ].flat()
      deck_checked = shipCount(msts.slice(1), ids) >= 2
    }

    return {
      flagship_ids: svdata.shipMstIds(674), // tamanami
      flagship_slotitem_ids: [],
      flagship_slotitem_lvl: [],
      deck_checked
    }
  }
  static formatter(quest: Quest): string {
    return detailFormat(['破棄 三爆：', '三ソ：', '12.7連装高角砲:'], quest)
  }
})

// 1165:【第一遊撃部隊任務】出撃準備を実施せよ！
register(1165, class {
  static readonly questType = QuestType.destroyItemIdOrType;
  static max = [4];
  static key = QuestKey.infer
  static id_or_types = [
    { id: 11 },
  ];
  static getCondition(svdata: SvData): DestroyItemCondition {
    let deck_checked = false;
    const deck = svdata.deckPort(ApiDeckPortId.deck1st);
    if (deck) {
      if (deckShipCount(deck.api_ship) >= 6) {
        const msts = toShipMsts(svdata, deck.api_ship)
        const ids1 = [
          svdata.shipMstIds(139), // yahagi
        ].flat()
        deck_checked = !!shipCount([msts[1]], ids1)
        if (deck_checked) {
          const ids2 = [
            svdata.shipMstIds(167), // isokaze
            svdata.shipMstIds(170), // hamakaze
            svdata.shipMstIds(20), // yukikaze
            svdata.shipMstIds(533), // fuyutuki
            svdata.shipMstIds(532), // sudutuki
            svdata.shipMstIds(49), // kasumi
            svdata.shipMstIds(41), // hatusimo
            svdata.shipMstIds(425), // asasimo
          ].flat()
          deck_checked = shipCount(msts.slice(2), ids2) === 4
        } 
      }
    }

    return {
      flagship_ids: svdata.shipMstIds(131), // yamato
      flagship_slotitem_ids: [],
      flagship_slotitem_lvl: [],
      deck_checked
    }
  }
  static formatter(quest: Quest): string {
    return detailFormat(['破棄 15.2cm単装砲：'], quest)
  }
})

// 1166: 続：装備の改修強化
register(
  1166,
  class {
    static readonly questType = QuestType.remodel
    static max = [1]
    static key = QuestKey.infer
    static formatter(quest: Quest): string {
      return detailFormat(['改修：'], quest)
    }
  }
)

// 1167: 装備の改修集中強化
register(
  1167,
  class {
    static readonly questType = QuestType.remodel
    static max = [3]
    static key = QuestKey.daily
    static formatter(quest: Quest): string {
      return detailFormat(['改修：'], quest)
    }
  }
)

// 1168:【期間限定任務・拡張任務】端午の節句工廠【I】
register(
  1168,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [3]
    static key = QuestKey.infer
    static id_or_types = [
      {
        id_with_alv: {
          id: 19,
          alv: 7
        }
      }
    ];
    static getCondition(svdata: SvData): DestroyItemCondition {
      let deck_checked = false;
      const deck = svdata.deckPort(ApiDeckPortId.deck1st);
      const ids = [
        svdata.shipMstIds(717), // yamasiomaru kai
        svdata.shipMstIds(637), // dai4goukaiboukan
        svdata.shipMstIds(638), // dai30goukaiboukan
      ].flat()
      if (deck) {
        if (deckShipCount(deck.api_ship) >= 2) {
          const msts = toShipMsts(svdata, deck.api_ship)
          deck_checked = !!shipCount([msts[1]], ids)
        }
      }

      return {
        flagship_ids: ids,
        flagship_slotitem_ids: [],
        flagship_slotitem_lvl: [],
        deck_checked
      }
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 九六式艦戦[熟練度max]：'], quest)
    }
  }
)

// 1169:【期間限定任務・拡張任務】端午の節句工廠【II】
register(
  1169,
  class {
    static readonly questType = QuestType.destroyItemIdOrType
    static max = [5]
    static key = QuestKey.infer
    static id_or_types = [
      {
        id_with_alv: {
          id: 16,
          alv: 7
        }
      }
    ];
    static getCondition(svdata: SvData): DestroyItemCondition {
      let deck_checked = false;
      const deck = svdata.deckPort(ApiDeckPortId.deck1st);
      const ids = [
        svdata.shipMstIds(717), // yamasiomaru kai
        svdata.shipMstIds(637), // dai4goukaiboukan
        svdata.shipMstIds(638), // dai30goukaiboukan
      ].flat()
      if (deck) {
        if (deckShipCount(deck.api_ship) >= 2) {
          const msts = toShipMsts(svdata, deck.api_ship)
          deck_checked = !!shipCount([msts[1]], ids)
        }
      }

      return {
        flagship_ids: ids,
        flagship_slotitem_ids: [],
        flagship_slotitem_lvl: [],
        deck_checked
      }
    }
    static formatter(quest: Quest): string {
      return detailFormat(['破棄 九七式艦攻[熟練度max]：'], quest)
    }
  }
)

/**
 *
 * @param quest
 * @returns
 */
export const questProgressDetailFormat = (quest: Quest): string => {
  // get fomatter
  const stuff = getQuestStuff(quest.no)
  if (stuff && stuff.formatter) {
    return stuff.formatter(quest)
  }

  return ''
}

/**
 *
 * @param svdata
 * @param quest_api_no
 * @returns
 */
export const questIsDeckMatch = (svdata: SvData, quest_api_no: number): boolean | undefined => {
  const stuff = getQuestStuff(quest_api_no)
  if (stuff) {
    const matcher = stuff as QuestDeckMatcher
    if (matcher.isDeckMatch) {
      const deck = svdata.deckPort(ApiDeckPortId.deck1st)
      if (! deck) {
        return undefined
      }
      return matcher.isDeckMatch(svdata, deck.api_ship)
    }
    const qc = stuff as QuestCondition
    if (qc.getCondition) {
      const cond = qc.getCondition(svdata)
      if (! cond) {
        return undefined
      }
      return checkCondition(svdata, cond)
    }
  }
  return undefined
}

/**
 * 
 * @param quest_api_no 
 * @returns 
 */
export const isSlotitemConditionQuest = (quest_api_no: number): boolean => {
  const stuff = getQuestStuff(quest_api_no)
  return !!stuff && stuff.questType === QuestType.slotitemCondition
}
