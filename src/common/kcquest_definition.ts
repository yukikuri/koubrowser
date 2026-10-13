import type { QuestType, QuestKey } from '@common/kcquest_types'
import type { ApiItemId, ApiShipType, ApiShipCategory, SlotitemType } from '@common/kcs'

export type QuestShipSelector =
  // 指定された艦マスターIDだけを使用する。
  | { mode: 'exact'; ids: number[] }
  // 呼び出し時のSvData.shipMstIds()で対象IDを展開する。
  | { mode: 'shipMstIds'; ids: number[] }

/** JSONで指定する旗艦・装備条件。艦IDの展開はgetCondition呼び出し時に行う。 */
export interface QuestConditionSchema {
  flagship?: QuestShipSelector
  flagship_lv?: number
  flagship_type_ids?: ApiShipType[]
  flagship_categories?: ApiShipCategory[]
  /** 装備スロット順のID。0はそのスロットを検査しない。 */
  flagship_slotitem_ids: number[]
  /** スロット順の最低改修値（0～10）。空配列は改修値の条件なし。 */
  flagship_slotitem_lvl: number[]
  /** trueの場合、第1スロットの熟練度最大を要求する。 */
  flagship_slotitem_alv_max?: boolean
  flagship_slotitem_only?: boolean
}

export type QuestItemSelector =
  | { id: number }
  | { type: SlotitemType }
  | { types: SlotitemType[] }
  | { id_with_alv: { id: number; alv: number } }

export type BattleRank = 'S' | 'A' | 'B' | 'C' | ''
export type QuestWinRank = 'S' | 'A' | 'B'
export type PracticeWinRank = 'S' | 'A' | 'B' | ''
export type QuestMap = [number, number, BattleRank] // area_id, area_no, win_rank('' is goal)
export type QuestMapCell = [number, number, QuestWinRank, number[] | undefined] // area_id, area_no, win_rank, cells
export type QuestMapOrCell = QuestMap | QuestMapCell

export type QuestDefinition =  QuestDefinitionByType[keyof QuestDefinitionByType]

/**
 * クエストスキーマ
 */
export interface QuestSchemaBase<T extends QuestType> {
  no: number
  questType: T
  max: number[]
  key: QuestKey
  formatter: string[]
  /** 内側の配列はAND、外側の配列はORで判定する。[]は追加条件なし。内側の空配列は禁止。 */
  definitions: QuestDefinition[][]
  notFixState?: boolean
}

export interface QuestPractice extends QuestSchemaBase<'practice'> {
  need_win_rank: PracticeWinRank
}

export interface QuestPracticeDeck extends QuestSchemaBase<'practiceDeck'> {
  need_win_rank: PracticeWinRank
}

export type QuestNyukyo = QuestSchemaBase<'nyukyo'>
export interface QuestCollectItem extends QuestSchemaBase<'collectItem'> {
  item_id: ApiItemId
}

export interface QuestCollectItemCondition extends QuestSchemaBase<'collectItemCondition'> {
  item_id: ApiItemId
  condition?: QuestConditionSchema
}

export interface QuestDestroyItemIdOrType extends QuestSchemaBase<'destroyItemIdOrType'> {
  id_or_types: QuestItemSelector[]
  condition?: QuestConditionSchema
}

export interface QuestMapStart extends QuestSchemaBase<'mapStart'> {
  area_id: number
  area_no: number
}

export interface QuestMapStartDeck extends QuestSchemaBase<'mapStartDeck'> {
  area_id: number
  area_no: number
}

export interface QuestBattle extends QuestSchemaBase<'battle'> {
  need_win: boolean
}

export type QuestBattleEnemy = QuestSchemaBase<'battleEnemy'>
export interface QuestBattleMap extends QuestSchemaBase<'battleMap'> {
  maps: QuestMapOrCell[]
}

export interface QuestBattleMapDeck extends QuestSchemaBase<'battleMapDeck'> {
  maps: QuestMapOrCell[]
}

export interface QuestMapGoal extends QuestSchemaBase<'mapGoal'> {
  maps: QuestMapOrCell[]
}

export interface QuestGaugeClear extends QuestSchemaBase<'gaugeClear'> {
  maps: QuestMapOrCell[]
}

export type QuestMissionStart = QuestSchemaBase<'missionStart'>

export type QuestMission = QuestSchemaBase<'mission'>

export interface QuestMissionSpecific extends QuestSchemaBase<'missionSpecific'> {
  names: string[][]
}

export interface QuestKaisou extends QuestSchemaBase<'kaisou'> {
  need_succeeded: boolean
}

export interface QuestKaisouUseType extends QuestSchemaBase<'kaisouUseType'> {
  powerup_ship_type: ApiShipType | null
  use_ship_type: [ApiShipType, number] | null
}

export interface QuestKaisouUseId extends QuestSchemaBase<'kaisouUseId'> {
  powerup_ship_type: ApiShipType | null
  use_ship_ids: number[]
  use_ship_count: number
}

export interface QuestKaisouUseIdToId extends QuestSchemaBase<'kaisouUseIdToId'> {
  powerup_ship_ids: number[]
  use_ship_ids: number[]
  use_ship_count: number
}

export interface QuestKaisouUseTypeToId extends QuestSchemaBase<'kaisouUseTypeToId'> {
  powerup_ship_ids: number[]
  use_ship_type: ApiShipType[]
  use_ship_count: number
}

export interface QuestKaisouUseCategoryToCategory
  extends QuestSchemaBase<'kaisouUseCategoryToCategory'> {
  powerup_ship_cats: ApiShipCategory[]
  use_ship_cats: ApiShipCategory[]
  use_ship_count: number
}

export interface QuestKaisouUseCategoryToType extends QuestSchemaBase<'kaisouUseCategoryToType'> {
  powerup_ship_cats: ApiShipCategory[]
  use_ship_types: ApiShipType[]
  use_ship_count: number
}
export type QuestHokyu = QuestSchemaBase<'hokyu'>
export type QuestRemodel = QuestSchemaBase<'remodel'>
export type QuestCreateItem = QuestSchemaBase<'createItem'>
export type QuestDestroyItem = QuestSchemaBase<'destroyItem'>
export type QuestCreateShip = QuestSchemaBase<'createShip'>
export type QuestDestroyShip = QuestSchemaBase<'destroyShip'>
export type QuestHensei = QuestSchemaBase<'hensei'>
export interface QuestSlotitemCondition extends QuestSchemaBase<'slotitemCondition'> {
  slotitem_ids: number[]
}

type CheckedSchemaMap<T extends { [K in QuestType]: QuestSchemaBase<K> }> = T
export type QuestSchemaByType = CheckedSchemaMap<{
  practice: QuestPractice
  practiceDeck: QuestPracticeDeck
  nyukyo: QuestNyukyo
  collectItem: QuestCollectItem
  collectItemCondition: QuestCollectItemCondition
  mapStart: QuestMapStart
  mapStartDeck: QuestMapStartDeck
  battle: QuestBattle
  battleEnemy: QuestBattleEnemy
  // Quest 214 remains implemented by the legacy class only.
  battle214: never
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
}>
export type QuestSchema = QuestSchemaByType[QuestType]

/**
 * クエスト定義type
 */
export const QuestDefinitionType = {
  
  // 艦隊隻数
  deckShipCount: 'deckShipCount',

  // 特定艦艦数
  shipCount: 'shipCount',
  shipCountSum: 'shipCountSum',
  shipTypeCount: 'shipTypeCount',
  shipCategoryCount: 'shipCategoryCount',

  // 敵艦種撃破
  enemyShipType: 'enemyShipType',

} as const
export type QuestDefinitionType = (typeof QuestDefinitionType)[keyof typeof QuestDefinitionType]

/**
 * 各キーに対応するtype検証
 */
type CheckedDefinitionMap<
  T extends {
    [K in QuestDefinitionType]: QuestDefinitionT<K>
  }
> = T
export type QuestDefinitionByType = CheckedDefinitionMap<{
  deckShipCount: QuestDeckShipCount
  shipCount: QuestShipCount
  shipCountSum: QuestShipCountSum
  shipTypeCount: QuestShipTypeCount
  shipCategoryCount: QuestShipCategoryCount
  enemyShipType: QuestEnemyShipType
}>

/**
 * 判定対象の値と基準値（value）の比較演算子
 * eq:  判定対象の値 === value
 * gte: 判定対象の値 >= value
 * lte: 判定対象の値 <= value
 */
export type ComparisonOperator<T> =
  [T] extends [number | string]
    ? 'eq' | 'gte' | 'lte'
    : 'eq'

interface ComparisonCondition<T> {
  readonly operator: ComparisonOperator<T>
  readonly value: T
}

/**
 * クエスト定義
 */
interface QuestDefinitionT<T extends QuestDefinitionType> {
  readonly type: T
}

/**
 * deck隻数
 */
export interface QuestDeckShipCount 
  extends QuestDefinitionT<'deckShipCount'>, ComparisonCondition<number> {
}

/**
 * 特定艦艦数
 */
export interface QuestShipCount 
  extends QuestDefinitionT<'shipCount'>, ComparisonCondition<number> {
  readonly shipIds: number[]
  readonly scope?: 'all' | 'flagship' | 'escort'
  readonly minLevel?: number
}

/**
 * 特定艦と艦型の隻数を合算して判定する。
 * 両方に該当する艦は重複して数えるため、対象は条件指定側で調整する。
 */
export interface QuestShipCountSum
  extends QuestDefinitionT<'shipCountSum'>, ComparisonCondition<number> {
  readonly shipIds: number[]
  readonly shipCategories: ApiShipCategory[]
}

/**
 * 艦種艦数
 */
export interface QuestShipTypeCount
  extends QuestDefinitionT<'shipTypeCount'>, ComparisonCondition<number> {
  readonly shipTypes: ApiShipType[]
  readonly scope?: 'all' | 'flagship' | 'escort'
  readonly minLevel?: number
}

/**
 * 艦種カテゴリ艦数
 */
export interface QuestShipCategoryCount
  extends QuestDefinitionT<'shipCategoryCount'>, ComparisonCondition<number> {
  readonly shipCategories: ApiShipCategory[]
  readonly scope?: 'all' | 'flagship' | 'escort'
  readonly minLevel?: number
}

/**
 * 敵艦種撃破
 */
export interface QuestEnemyShipType 
  extends QuestDefinitionT<'enemyShipType'>  {
  readonly enemyType: number[]
}

