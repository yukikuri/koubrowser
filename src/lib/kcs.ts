import qs from 'qs';
import { v4 as uuidv4 } from 'uuid';
import { ShipEtcs } from '@/lib/kcsetc';
import { Unpacked, assignSafeE, replaceArray, replaceArraySafe, toNumberSafe } from '@/lib/ts';

// kc stuff

/**
 * 
 */
export const Api = {

  // ワールド決定
  API_WORLD_GET_ID: '/api_world/get_id',

  // ランカー報酬情報
  REQ_MEMBER_GET_INCENTIVE: '/api_req_member/get_incentive',
  // マスターデータ
  START2_GET_DATA: '/api_start2/getData',
  // 母港
  PORT_PORT: '/api_port/port',
  // 資源情報
  GET_MEMBER_MATERIAL: '/api_get_member/material',
  // 装備情報
  GET_MEMBER_REQUIRE_INFO: '/api_get_member/require_info',
  // 戦績表示
  GET_MEMBER_RECORD: '/api_get_member/record',
  // ランキング表示
  REQ_RANKING: '/api_req_ranking/',
  // 図鑑
  GET_MEMBER_PICTURE_BOOK: '/api_get_member/picture_book',
  // アイテム - 家具コイン使用
  REQ_MEMBER_ITEMUSE: '/api_req_member/itemuse',
  // アイテム - 家具コイン使用後
  // アイテム一覧取得
  GET_MEMBER_USEITEM: '/api_get_member/useitem',
  // 購入アイテム一覧
  GET_MEMBER_PAYITEM: '/api_get_member/payitem',
  // アイテム - 家具コイン使用後 その後
  GET_MEMBER_BASIC: '/api_get_member/basic',
  // 家具
  GET_MEMBER_FURNITURE: '/api_get_member/furniture',

  // コメント更新
  REQ_MEMBER_UPDATECOMMENT: '/api_req_member/updatecomment',

  // 編成 drag&drop 位置変更・艦隊から外し・艦隊に追加
  REQ_HENSEI_CHANGE: '/api_req_hensei/change',
  // 編成 - プリセット取得
  GET_MEMBER_PRESET_DECK: '/api_get_member/preset_deck',
  // 編成 - プリセット記録
  REQ_HENSEI_PRESET_REGISTER: '/api_req_hensei/preset_register',
  // 編成 - プリセット削除
  REQ_HENSEI_PRESET_DELETE: '/api_req_hensei/preset_delete',
  // 編成 - プリセット展開
  REQ_HENSEI_PRESET_SELECT: '/api_req_hensei/preset_select',
  // 編成 - 艦lock・unlock  handled
  REQ_HENSEI_LOCK: '/api_req_hensei/lock',
  // 連合艦隊編成
  REQ_HENSEI_COMBINED: '/api_req_hensei/combined',

  // 補給 - 燃料だけ・弾薬だけ・両方・全艦隊補給
  REQ_HOKYU_CHARGE: '/api_req_hokyu/charge',

  // クエスト・クエストページ送り
  GET_MEMBER_QUESTLIST: '/api_get_member/questlist',
  // クエスト - 開始
  REQ_QUEST_START: '/api_req_quest/start',
  // クエスト - 終了
  REQ_QUEST_STOP: '/api_req_quest/stop',
  // クエスト - 達成
  REQ_QUEST_CLEARITEMGET: '/api_req_quest/clearitemget',

  // 改装 - 装備変更(拡張スロット)
  REQ_KAISOU_SLOTSET_EX: '/api_req_kaisou/slotset_ex',
  // 改装 - 装備変更
  REQ_KAISOU_SLOTSET: '/api_req_kaisou/slotset',
  // 改装 - exスロットオープン
  REQ_KAISOU_OPEN_EXSLOT: '/api_req_kaisou/open_exslot',
  // 改装 - 装備位置変更 handled
  REQ_KAISOU_SLOT_EXCHANGE_INDEX: '/api_req_kaisou/slot_exchange_index',
  // イベントクリアやクエストクリア - 報酬艦取得
  GET_MEMBER_SHIP2: '/api_get_member/ship2',
  // 改装 - 装備変更応答 handled
  GET_MEMBER_SHIP3: '/api_get_member/ship3',
  // 改装 - 装備lock・unlock handled
  REQ_KAISOU_LOCK: '/kcsapi/api_req_kaisou/lock',
  // 改装 - 全装備外し not need handle
  REQ_KAISOU_UNSETSLOT_ALL: '/api_req_kaisou/unsetslot_all',
  // 改装 - 近代化改修
  REQ_KAISOU_POWERUP: '/api_req_kaisou/powerup',
  // 改装 - 装備入れ替え
  REQ_KAISOU_SLOT_DEPRIVE: '/api_req_kaisou/slot_deprive',
  // 改装 - 改造
  REQ_KAISOU_REMODELING: '/api_req_kaisou/remodeling',
  // 改装 - 結婚
  REQ_KAISOU_MARRIGE: '/kcsapi/api_req_kaisou/marriage',

  // 入渠 - 表示
  GET_MEMBER_NDOCK: '/api_get_member/ndock',
  // 入渠 - 入渠開始
  REQ_NYUKYO_START: '/api_req_nyukyo/start',
  // 入渠 - 入居中 高速修復使用
  REQ_NYUKYO_SPEEDCHANGE: '/api_req_nyukyo/speedchange',

  // 工廠 - 開発・3連開発
  REQ_KOUSYOU_CREATEITEM: '/api_req_kousyou/createitem',
  // 工廠 - 破棄
  REQ_KOUSYOU_DESTROYITEM2: '/api_req_kousyou/destroyitem2',
  // 工廠 - 建造完了艦取得
  REQ_KOUSYOU_GETSHIP: '/api_req_kousyou/getship',
  // 工廠 - 建造
  REQ_KOUSYOU_CREATESHIP: '/api_req_kousyou/createship',
  // 工廠 - 建造状況
  GET_MEMBER_KDOCK: '/api_get_member/kdock',
  // 工廠 - 高速建造
  REQ_KOUSYOU_CREATESHIP_SPEEDCHANGE: '/api_req_kousyou/createship_speedchange',
  // 工廠 - 解体
  REQ_KOUSYOU_DESTROYSHIP: '/api_req_kousyou/destroyship',

  // 改修詳細取得
  REQ_KOUSYOU_REMODEL_SLOTLIST_DETAIL: '/api_req_kousyou/remodel_slotlist_detail',
  // 改修一覧取得
  REQ_KOUSYOU_REMODEL_SLOTLIST: '/api_req_kousyou/remodel_slotlist',
  // 改修
  REQ_KOUSYOU_REMODEL_SLOT: '/api_req_kousyou/remodel_slot',

  // 出撃 - 出撃表示
  GET_MEMBER_MAPINFO: '/api_get_member/mapinfo',
  // 出撃 - 演習表示
  GET_MEMBER_PRACTICE: '/api_get_member/practice',
  // 出撃 - 遠征表示
  GET_MEMBER_MISSION: '/api_get_member/mission',

  // 出撃 - 遠征開始
  REQ_MISSION_START: '/api_req_mission/start',
  // 出撃 - 遠征開始後
  GET_MEMBER_DECK: '/api_get_member/deck',
  // 出撃 - 遠征中止
  REQ_MISSION_RETURN_INSTRUCTION: '/api_req_mission/return_instruction',
  // 遠征結果
  REQ_MISSION_RESULT: '/api_req_mission/result',

  // 艦隊名変更
  REQ_MEMBER_UPDATEDECKNAME: '/api_req_member/updatedeckname',

  // 母港位置変更
  REQ_MEMBER_SET_FLAGSHIP_POSITION: '/api_req_member/set_flagship_position',

  // 友軍
  REQ_MEMBER_SET_FRIENDLY_REQUEST: '/api_req_member/set_friendly_request',

  // 出撃 - 演習 相手選択
  REQ_MEMBER_GET_PRACTICE_ENEMYINFO: '/api_req_member/get_practice_enemyinfo',
  // 出撃 - 演習 追撃なし
  REQ_PRACTICE_BATTLE_RESULT: '/api_req_practice/battle_result',
  // 出撃 - 演習 戦闘開始
  REQ_PRACTICE_BATTLE: '/api_req_practice/battle',
  // 出撃 - 演習 夜戦
  REQ_PRACTICE_MIDNIGHT_BATTLE: '/api_req_practice/midnight_battle',

  // 出撃 - マップ選択
  REQ_MAP_START: '/api_req_map/start',
  // 出撃 - 戦闘結果 ship入手
  REQ_SORTIE_BATTLERESULT: '/api_req_sortie/battleresult',
  // 出撃 - 戦闘開始
  REQ_SORTIE_BATTLE: '/api_req_sortie/battle',
  // 出撃 - 戦闘空襲1
  REQ_SORTIE_AIRBATTLE: '/api_req_sortie/airbattle',
  // 出撃 - 戦闘空襲2
  REQ_SORTIE_LD_AIRBATTLE: '/api_req_sortie/ld_airbattle',
  // 出撃 - 戦闘結果 艦隊状態更新
  GET_MEMBER_SHIP_DECK: '/api_get_member/ship_deck',
  // 出撃 - 進撃
  REQ_MAP_NEXT: '/api_req_map/next',
  // 出撃 - イベント選択
  REQ_MAP_SELECT_EVENTMAP_RANK: '/api_req_map/select_eventmap_rank',
  // 出撃 - 夜戦突入
  REQ_BATTLE_MIDNIGHT_BATTLE: '/api_req_battle_midnight/battle',
  // 出撃 - 夜戦突入(支援あり)
  REQ_BATTLE_MIDNIGHT_SP_BATTLE: '/api_req_battle_midnight/sp_midnight',
  // 出撃 - 母校戻り、任務達成アイテム入手
  GET_MEMBER_SLOT_ITEM: '/api_get_member/slot_item',
  // 出撃 - 母校戻り その２
  GET_MEMBER_UNSETSLOT: '/api_get_member/unsetslot',
  // 出撃 - 成績
  SORTIE_CONDITIONS: '/api_get_member/sortie_conditions',

  // 出撃(連合) - 戦闘結果
  REQ_COMBINED_BATTLE_BATTLERESULT: '/api_req_combined_battle/battleresult',
  // 出撃(通常-連合) - 戦闘開始
  REQ_COMBINED_BATTLE_EC_BATTLE: '/api_req_combined_battle/ec_battle',
  // 出撃(連合-連合) - 戦闘開始
  REQ_COMBINED_BATTLE_EACH_BATTLE: '/api_req_combined_battle/each_battle',
  // 出撃(連合) - 夜戦開始
  REQ_COMBINED_BATTLE_EC_MIDNIGHT_BATTLE: '/api_req_combined_battle/ec_midnight_battle',
  // 出撃(連合-) - 戦闘開始
  REQ_COMBINED_BATTLE_BATTLE: '/api_req_combined_battle/battle',
  // 出撃(連合-空襲) - 戦闘開始
  REQ_COMBINED_BATTLE_LD_AIRBATTLE: '/api_req_combined_battle/ld_airbattle',

  // airbase set order
  REQ_AIR_CORPS_SET_PLANE: '/api_req_air_corps/set_plane',
  // airbase set action
  REQ_AIR_CORPS_SET_ACTION: '/api_req_air_corps/set_action',
  // airbase supply
  REQ_AIR_CORPS_SUPPLY: '/api_req_air_corps/supply',

  // unknown api
  SET_OSS_CONDITION: '/api_req_member/set_oss_condition',
  
} as const;
export type Api = Unpacked<typeof Api>;
const ApiTypes = Object.entries(Api);

export const ApiServerId = {
  unknown: 0,
  world1: 1, // 横須賀鎮守府
  world2: 2, // 呉鎮守府
  world3: 3, // 佐世保鎮守府
  world4: 4, // 舞鶴鎮守府
  world5: 5, // 大湊警備府
  world6: 6, // トラック泊地
  world7: 7, // リンガ泊地
  world8: 8, // ラバウル基地
  world9: 9, // ショートランド泊地
  world10: 10, // ブイン基地
  world11: 11, // タウイタウイ泊地
  world12: 12, // パラオ泊地
  world13: 13, // ブルネイ泊地
  world14: 14, // 単冠湾泊地
  world15: 15, // 幌筵泊地
  world16: 16, // 宿毛湾泊地
  world17: 17, // 鹿屋基地
  world18: 18, // 岩川基地
  world19: 19, // 佐伯湾泊地
  world20: 20, // 柱島泊地
} as const;
export type ApiServerId = Unpacked<typeof ApiServerId>;

export interface ApiDataRoot {
  readonly api_result: ApiResult;
  readonly api_result_msg: string;
  readonly api_data: any;
}

export interface ApiWorldId {
  readonly api_world_id: ApiServerId;
}

export const ApiShipType = {
  none: 0, // 値なし
  kaiboukan: 1, // 海防艦
  kutikukan: 2, // 駆逐艦
  keijyun: 3,  // 軽巡洋艦
  raijyun: 4, // 重雷装巡洋艦
  jyuujyun: 5, // 重巡洋艦
  koujyun: 6, // 航空巡洋艦
  kei_kuubo: 7, // 軽空母
  kousoku_senkan: 8, // 戦艦
  teisoku_senkan: 9, // 戦艦
  koukuu_senkan: 10, // 航空戦艦
  seiki_kuubo: 11, // 正規空母
  tyoudokyuu_senkan: 12, // 超弩級戦艦
  sensuikan: 13, // 潜水艦
  sensui_kuubo: 14, // 潜水空母
  hokyuukan_enemy: 15, // 補給艦(敵)
  suibo: 16, // 水上機母艦
  yourikukan: 17, // 揚陸艦
  soukou_kuubo: 18, // 装甲空母
  kousakusen: 19, // 工作艦
  sensuibokan: 20, // 潜水母艦
  renjyun: 21, // 練習巡洋艦
  hokyuukan: 22, // 補給艦
} as const;
export type ApiShipType = Unpacked<typeof ApiShipType>;

export const ApiRange = {
  invalid: 0,
  tan: 1,
  tyuu: 2,
  tyou: 3,
  tyoutyou: 4,
  tyoutyou_plus: 5, // internal, not display  
} as const;
export type ApiRange = Unpacked<typeof ApiRange>;

export const ApiSoku = {
  none: 0,
  teisoku: 5,
  kousoku: 10,
  kousoku_plus: 15,
  saisoku: 20,
} as const;
export type ApiSoku = Unpacked<typeof ApiSoku>;

export const MissionState = {
  no: 0,
  in: 1,
  completed: 2,
  stopped: 3,
} as const;
export type MissionState = Unpacked<typeof MissionState>;


export const Cond = {
  normal: 0, // 通常
  red: 1, // 重度疲労
  orange: 2, // 疲労
  orange_hidden: 3, // 隠れ疲労
  good: 4,  // キラ状態
} as const;
export type Cond = Unpacked<typeof Cond>;


export const HoseiType = {
  none: 0,
  tekkoudan: 1,
  tekkoudan_dentan: 2,
  tekkoudan_fukuhou: 3,
  tekkoudan_fukuhou_dentan: 4,
} as const;
export type HoseiType = Unpacked<typeof HoseiType>;


export const HoseiConst: number[] = [
  0, // none
  1.08, // tekkoudan
  1.10, // tekkoudan_dentan
  1.15, // tekkoudan_fukuhou
  1.15, // tekkoudan_fukuhou_dentan
];

export const SlotitemType = {
  SmallMainGun: 1,  // 小口径主砲
  MediumMainGun: 2, // 中口径主砲
  LargeMainGun: 3,  // 大口径主砲
  SecondaryGun: 4,  // 副砲
  Torpedo: 5,       // 魚雷
  Fighter: 6, // 艦上戦闘機
  DiveBomber: 7,      // 艦上爆撃機
  TorpedoBomber: 8,  // 艦上攻撃機
  RecAircraft: 9, // 艦上偵察機
  RecSeaplane: 10, // 水上偵察機
  SeaplaneBomber: 11, // 水上爆撃機
  SmallRadar: 12, // 小型電探
  LargeRadar: 13, // 大型電探
  Sonar: 14, // ソナー
  DepthCharge: 15, // 爆雷
  ExtraArmor: 16, // 追加装甲
  EngineImp: 17, // 機関部強化
  AAShell: 18, // 対空強化弾
  APShell: 19, // 対艦強化弾
  AAGun: 21, // 対空機銃
  MidgetSubmarine: 22, // 特殊潜航艇
  EmergencyRepair: 23, // 応急修理要員
  LandingCraft: 24, // 上陸用舟艇
  Autogyro: 25, // オートジャイロ
  ASBAircraft: 26, // 対潜哨戒機
  MediumExtraArmor: 27, // 追加装甲(中型)
  LargeExtraArmor: 28, // 追加装甲(大型)
  Searchlight: 29, // 探照灯
  STContainer: 30, // 簡易輸送部材
  RepairFacility: 31, // 艦艇修理施設
  SubmarineTorpedo: 32, // 潜水艦魚雷
  StarShell: 33, // 照明弾
  CommandFacility: 34, // 司令部施設
  AviationPersonnel: 35, // 航空要員
  AADirector: 36, // 高射装置
  ShipPersonnel: 39, // 水上艦要員
  LargeSonar: 40, // 大型ソナー
  LargeFlyingBoat: 41, // 大型飛行艇
  LargeSearchlight: 42, //大型探照灯
  CombatRation: 43, // 戦闘糧食
  Supplies: 44, // 補給物資
  SeaplaneFighter: 45, // 水上戦闘機
  SpecialATank: 46, // 特型内火艇
  LandAttackAircraft: 47, // 陸上攻撃機
  LandFighter: 48, // 局地戦闘機
  LandRecAircraft: 49, // 陸上偵察機
  TransMaterial: 50, // 輸送機材
  SubmarineEquipment: 51, // 潜水艦装備
  JetFighter: 56, // 噴式戦闘機
  JetFighterBomber: 57, //噴式戦闘爆撃機
} as const;
export type SlotitemType = Unpacked<typeof SlotitemType>;


export const SlotitemImgType = {
  syuhou_syou: 1, // 小口径
  syuhou_tyuu: 2, // 中口径
  syuhou_dai: 3, // 大口径
  fukuhou: 4, //副砲
  gyorai: 5, // 魚雷
  kanjyou_sentouki: 6, // 艦上戦闘機
  kanjyou_bakugekiki: 7,      // 艦上爆撃機
  kanjyou_kougekiki: 8,  // 艦上攻撃機
  kanjyou_teisatuki: 9, // 艦上偵察機
  suitei: 10, // 水上偵察機
  dentan: 11, // 電探
  sansikidan: 12, // 三式弾
  tekoudan: 13, // 徹甲弾
  kijyu: 15, // 機銃
  koukakuhou: 16, // 高角砲
  bakurai: 17, //爆雷
  sonar: 18, // ソナー
  engine: 19, // 機関部強化
  daihatu: 20, // 大発
  bulge: 23, // バルジ
  tansyoutou: 24, // 探照灯
  supana: 29, // 航空要員
  kousyasouti: 30, // 高射装置
  taiti: 31, // 対地装備
  mihariin: 32, // 見張り員
  oodata_hikoutei: 33, // 大型飛行艇
  sentouryousyoku: 34, //戦闘糧食
  hokyuubussi: 35, // 補給物資
  naikatei: 36, // 内火艇
  rikukou: 37, // 陸上攻撃機
  kyokusen: 38, //局戦
  funsiki1: 39, // 噴式戦闘爆撃機
  funsiki2: 40, // 噴式戦闘爆撃機
  yusoukizai: 41, // 輸送機材
  sensui_soubi: 42, // 潜水艦装備
  suijyou_sentouki: 43, // 水上戦闘機
  rikusen: 44, // 陸上戦闘機
  yasen: 45, // 夜間戦闘機
  yakou: 46, // 夜間攻撃機
  rikutaisen: 47, // 対潜哨戒機
  rikukou_oogata: 48, // 大型陸上機
} as const;
export type SlotitemImgType = Unpacked<typeof SlotitemImgType>;


/**
 * 海域
 */
export const MapAreaId = {
  area1: 1, // 鎮守府海域
  area2: 2, // 南西諸島海域
  area3: 3, // 北方海域
  area4: 4, // 西方海域
  area5: 5, // 南方海域
  area6: 6, // 中部海域
  area7: 7, // 南西海域
  area48: 48, // 2020.06 侵攻阻止！島嶼防衛強化作戦
  area49: 49, // 2020.11 護衛せよ！船団輸送作戦",
} as const;
export type MapAreaId = Unpacked<typeof MapAreaId>;


interface mapAreaNo {
  [key: number]: number[];
}

/**
 * area -> map area no
 */
export const MapAreaNo: mapAreaNo = {
  1: [1, 2, 3, 4, 5, 6, ],
  2: [1, 2, 3, 4, 5, ],
  3: [1, 2, 3, 4, 5, ],
  4: [1, 2, 3, 4, 5, ],
  5: [1, 2, 3, 4, 5, ],
  6: [1, 2, 3, 4, 5, ],
  7: [1, 2, 3, ],
  48: [1, 2, 3, 4, 5, 6, 7, ],
  49: [1, 2, 3, 4, ],
};

/**
 * gauge area
 */
export const GaugeAreaNo: mapAreaNo = {
  1: [5, 6, ],
  2: [5, ],
  3: [5, ],
  4: [5, ],
  5: [5, ],
  6: [5, ],
  7: [2, 3, ],
};

interface MapLosValue {
  map: number;
  base: number;
}
const InvalidMapLosValue = (): MapLosValue => ({
  map: 0,
  base: 0,
});

export interface SlotInfo {
  readonly api: ApiSlotitem;
  readonly mst: MstSlotitem;
}

export type Slot = SlotInfo | undefined;

export interface THCutinState {
  type: THCutin;
  enable: boolean;
}

export interface THCutinRate {
  type: THCutin;
  enable: boolean;
  rate: number;
}

export interface TKCutinState {
  entry: TKCutin[];
  type: TKCutin[];
}

export interface TKCutinRate {
  type: TKCutin;
  enable: boolean;
  rate: number;
}

export interface SenseiTaisenState {
  type: SenseiTaisenType;
  enable: boolean;
}

export interface SenseiRaigekiState { 
  type: SenseiRaigekiType;
  enable: boolean;
}

export interface FACutinState {
  type: FACutin;
  enable: boolean;
}

export interface FACutinRate {
  type: FACutin;
  enable: boolean;
  rate: number[]; // 0: kakuho, 1: yuusei
}

export interface AACutinState {
  type: AACutin;
  enable: boolean;
}

export interface AACutinRate {
  type: AACutin;
  enable: boolean;
  rate: number[]; // 0: kakuho, 1: yuusei
}

export interface YCutinState { 
  type: YCutin;
  enable: boolean;
}

export interface YCutinRate { 
  type: YCutin;
  enable: boolean;
  rate: number;
}


export interface YSCutinState {
  type: YSCutin;
  enable: boolean;
}

export interface YSCutinRate {
  type: YSCutin;
  enable: boolean;
  rate: number;
}

export interface FDState {
  enable: boolean;
}

export interface FDRate {
  enable: boolean;
  rate: number;
}

export interface SpState {
  tk: TKCutinState | undefined; // taikuu cutin
  th: THCutinState | undefined; // tokusyu hougeki
  st: SenseiTaisenState | undefined; // 
  sr: SenseiRaigekiState | undefined; //
  fa: FACutinState[]; // dantyaku
  aa: AACutinState[]; // aa cutin
  y: YCutinState[]; // yasen cutin
  ys: YSCutinState[]; // yasyuu
  fd: FDState | undefined; // funsindanmaku
}

export interface Bouku {
  readonly kt: number;
  readonly ktRaw: number;
  readonly ktRemodel: number;
  readonly ktb: number;
  readonly ktbRaw: number;
  readonly ktbRemodel: number;
}

export interface Kaihi {
  readonly kaihi: number;
  readonly kaihiRemodel: number;
}

export interface Hit {
  readonly hit: number;
  readonly hitRemodel: number;
}

export interface ShipInfo {
  readonly api: ApiShip;
  readonly mst: MstShip;
  readonly slots: Slot[];
  readonly onslotMax: number[];
}

export interface ShipInfoSp extends ShipInfo {
  readonly bouku: Bouku;
  readonly sp: SpState;
  deck_los?: number;  // 艦隊索敵値(弾着計算用)
  deck_ktb?: number;  // 艦隊防空値(撃墜計算用)
}

export interface Attackable {
  fire: boolean;
  tor: boolean;
  asw: boolean;
}

const isShipType = (ship: ShipInfo, types: ApiShipType[]): boolean => {
  return types.includes(ship.mst.api_stype);
};

const isShipId = (mst_id: number, ids: number[]): boolean => {
  return ids.includes(mst_id);
};

const isSlotitemId = (slot: Slot, ids: number[]): boolean => {
  if (slot)
    return ids.includes(slot.mst.api_id);
  return false;
};

const calcShipLos = (ship: ShipInfo): number => {
  const etc = ShipEtcs.find((v) => v.api_id === ship.mst.api_id);
  if (etc) {
    return Math.floor((etc.api_sakuteki[1] - etc.api_sakuteki[0]) * ship.api.api_lv / 99 + etc.api_sakuteki[0]);
  }
  return NaN;
};

/**
 * 加重対空
 * @param mst 
 */
const equipKT = (mst: MstSlotitem): number => {
  switch (KcsUtil.slotitemImgType(mst)) {
    case SlotitemImgType.kijyu: // 対空気銃
      return 6.0;
    case SlotitemImgType.koukakuhou: // 高角砲
    case SlotitemImgType.kousyasouti: // 高射装置
      return 4.0;
    case SlotitemImgType.dentan: // 電探
      return 3.0;    
  }
  return 0;
};

/**
 * 艦隊防空
 * @param mst 
 */
const equipKTBonus = (mst: MstSlotitem): number => {
  // 46cm三連装砲
  if (mst.api_id === 9 || mst.api_id === 276) {
    return 0.25;
  }

  switch (KcsUtil.slotitemImgType(mst)) {
    case SlotitemImgType.sansikidan: // 三式弾
      return 0.6;
    case SlotitemImgType.koukakuhou: // 高角砲
    case SlotitemImgType.kousyasouti: // 高射装置
      return 0.35;
    case SlotitemImgType.dentan: // 電探
      return 0.4;
    case SlotitemImgType.syuhou_syou: // 小口径
    case SlotitemImgType.syuhou_tyuu: // 中口径
    case SlotitemImgType.syuhou_dai: // 大口径
    case SlotitemImgType.fukuhou: // 副砲
    case SlotitemImgType.kijyu: // 対空気銃
    case SlotitemImgType.kanjyou_sentouki: // 艦上戦闘機
    case SlotitemImgType.kanjyou_bakugekiki: // 艦上爆撃機
    case SlotitemImgType.suitei: // 水上偵察機
      return 0.2;
  }
  return 0;
};

/**
 * 加重対空 改修定数
 * @param mst 
 */
const remodelKT = (mst: MstSlotitem): number => {
  switch (KcsUtil.slotitemImgType(mst)) {
    case SlotitemImgType.kijyu: // 対空気銃
      return mst.api_tyku >= 8 ? 6.0 : 4.0;
    case SlotitemImgType.koukakuhou: // 高角砲
      return mst.api_tyku >= 8 ? 3.0 : 2.0;
    case SlotitemImgType.kousyasouti: // 高射装置
      return 2.0;
  }
  return 0;
};

/**
 * 艦隊防空 改修係数
 * @param mst 
 */
const remodelKTBonus = (mst: MstSlotitem): number => {
  switch (KcsUtil.slotitemImgType(mst)) {
    case SlotitemImgType.dentan: // 電探
      if (mst.api_taik) {
        return 1.5;
      }
      break;
    case SlotitemImgType.koukakuhou: // 高角砲
      return mst.api_tyku >= 8 ? 3.0 : 2.0;
    case SlotitemImgType.kousyasouti: // 高射装置
      return 2.0;
  }
  return 0;
};

/**
 * 索敵改修係数
 * @param mst 
 */
const remodelLos = (mst: MstSlotitem): number => {
  switch (KcsUtil.slotitemType(mst)) {
    case SlotitemType.RecAircraft: // 艦上偵察機
    case SlotitemType.RecSeaplane: // 水上偵察機
      return 1.2;
    case SlotitemType.SeaplaneBomber: // 水上爆撃機
      return 1.15;
    case SlotitemType.SmallRadar: // 小型電探
      return 1.25;
    case SlotitemType.LargeRadar: // 大型電探
      return 1.4;
  }
  return 0;
};

const equipLos = (mst: MstSlotitem): number => {
  switch (KcsUtil.slotitemType(mst)) {
    case SlotitemType.Fighter: // 艦上戦闘機
    case SlotitemType.DiveBomber:      // 艦上爆撃機
    case SlotitemType.SeaplaneFighter: // 水上戦闘機
    case SlotitemType.LargeFlyingBoat: // 大型飛行艇
    case SlotitemType.ASBAircraft: // 対潜哨戒機
    case SlotitemType.Autogyro: // オートジャイロ
    case SlotitemType.JetFighterBomber: //噴式戦闘爆撃機
    case SlotitemType.SmallMainGun:  // 小口径主砲
    case SlotitemType.MediumMainGun: // 中口径主砲
    case SlotitemType.SmallRadar: // 小型電探
    case SlotitemType.LargeRadar: // 大型電探
    case SlotitemType.SubmarineTorpedo: // 潜水艦魚雷
    case SlotitemType.SubmarineEquipment: // 潜水艦装備
    case SlotitemType.Sonar: // ソナー
    case SlotitemType.LargeSonar: // 大型ソナー
    case SlotitemType.MidgetSubmarine: // 特殊潜航艇
    case SlotitemType.Searchlight: // 探照灯
    case SlotitemType.LargeSearchlight: //大型探照灯
    case SlotitemType.AviationPersonnel: // 航空要員
    case SlotitemType.ShipPersonnel: // 水上艦要員
    case SlotitemType.CommandFacility: // 司令部施設
      return 0.6;
    case SlotitemType.TorpedoBomber:  // 艦上攻撃機
      return 0.8;
    case SlotitemType.RecAircraft: // 艦上偵察機
      return 1.0;
    case SlotitemType.SeaplaneBomber: // 水上爆撃機
      return 1.1;
    case SlotitemType.RecSeaplane: // 水上偵察機
      return 1.2;
  }
  return 0;
};

/**
 * 命中改修係数
 * @param mst 
 */
const remodelHit = (mst: MstSlotitem): number => {
  switch (KcsUtil.slotitemType(mst)) {
    case SlotitemType.SmallMainGun:  // 小口径主砲
    case SlotitemType.MediumMainGun: // 中口径主砲
    case SlotitemType.LargeMainGun:  // 大口径主砲
    case SlotitemType.SecondaryGun:  // 副砲
    case SlotitemType.AAShell: // 対空強化弾
    case SlotitemType.APShell: // 対艦強化弾  
    case SlotitemType.AADirector:// 高射装置
      return 1.0;
    case SlotitemType.SmallRadar: // 小型電探
    case SlotitemType.LargeRadar: // 大型電探
      if ([27, 30, 106].includes(mst.api_id)) {
        return 1.0;
      }
      return 1.7;
  }
  return 0;
};

/**
 * 命中改修係数(雷撃)
 * @param mst 
 */
const remodelHitTor = (mst: MstSlotitem): number => {
  switch (KcsUtil.slotitemType(mst)) {
    case SlotitemType.Torpedo:
      return 2.0;
  }
  return 0;
};

/**
 * 命中改修係数(対潜)
 * @param mst 
 */
const remodelHitAsw = (mst: MstSlotitem): number => {
  switch (KcsUtil.slotitemType(mst)) {
    case SlotitemType.Sonar:
      return 1.3;
  }
  return 0;
};

const calcCI = (info: ShipInfo, ships: ShipInfoSp[]) : number => {
  const ship = info.api;
  const lvs = Math.sqrt(ship.api_lv);
  let ci: number;

  if (ship.api_lucky[0] >= 50.0) {
    ci = Math.floor(65.0 + Math.sqrt(ship.api_lucky[0]-50.0) + 0.8 * lvs);
  } else {
    ci = Math.floor(15.0 + ship.api_lucky[0] + 0.75 * lvs);
  }

  if (ships[0].api.api_id === info.api.api_id) {
    ci += 15.0;
  }

  if (info.slots.some((slot) => slot && slot.mst.api_id === 129)) {
    ci += 4.0;
  }

  return ci;
};

export const SenseiTaisenType = {
  byequip: 0,
  auto: 1,
} as const;
export type SenseiTaisenType = Unpacked<typeof SenseiTaisenType>;


export const SenseiRaigekiType = {
  byequip: 0,
  auto: 1,
} as const;
export type SenseiRaigekiType = Unpacked<typeof SenseiRaigekiType>;


export const TCutin = {

} as const;

export const YCutin = {
  SYU3: 0, // 2.0
  SYU_GYO_DEN2_3: 1, // 1.911
  SYU_FUKU: 2, // 1.75
  SGYO_SDEN: 3, // 1.75
  SYU_GYO_DEN3: 4, // 1.706
  SYU_GYO_DEN2: 5, // 1.625
  SGYO2: 6, // 1.6
  GYO2: 7, // 1.5
  SYU_GYO_DEN: 8, // 1.3
  SYU_GYO: 9, // 1.3
  GYO_MI_DEN: 10, // 1.2
  RENGEKI: 11, // 1.2
} as const;
export type YCutin = Unpacked<typeof YCutin>;


export const YCutinConst: number[] = [
  140, // SYU3 = 0, // 2.0
  130, // SYU_GYO_DEN2_3, // 1.911
  130, // SYU_FUKU, // 1.75
  122, // SGYO_SDEN, // 1.75
  130, // SYU_GYO_DEN3, // 1.706
  130, // SYU_GYO_DEN2, // 1.625
  122, // SGYO2, // 1.6
  122, // GYO2, // 1.5
  130, // SYU_GYO_DEN, // 1.3
  115, // SYU_GYO, // 1.3
  122,// GYO_MI_DEN, // 1.2
  1, // RENGEKI, // 1.2
];

export const YSCutin = {
  SEN2_KOU: 0,
  SEN_KOU: 1,
  SEN_SUI: 2,
  KOU_SUI: 3,
  SEN_ETC2: 4,
  YAKOU: 5,
} as const;
export type YSCutin = Unpacked<typeof YSCutin>;


const YSCutinConst: number[]  = [
  105, // SEN2_KOU = 0, https://twitter.com/dewydrops/status/1087663625827827715
  125, //SEN_KOU, unk 
  125, //SEN_SUI, unk 
  125, // KOU_SUI, unk
  125, // SEN_ETC2, unk
  1, // YAKOU,
];

export const FACutin = {
  SYU_SYU: 0,
  SYU_TEK: 1,
  SYU_DEN: 2,
  SYU_FUK: 3,
  RENGEKI: 4,
  KAI_KUU: 5,
  ZUI_UN: 6,
} as const;
export type FACutin = Unpacked<typeof FACutin>;


const FACutinConst: number[] = [
  150, // SYU_SYU = 0,
  140, // SYU_TEK,
  130, // SYU_DEN,
  120, // SYU_FUK,
  130, // RENGEKI,
  120, // KAI_KUU, !! caption unknown
  120, // ZUI_UN,
];

export const AACutin = {
  FBA: 0,
  BBA: 1,
  BA: 2,
} as const;
export type AACutin = Unpacked<typeof AACutin>;


const AACutinConst: number[] = [
  125, 
  140,
  155,
];

export const THCutin = {
  Nelson: 0,
  Colorado: 1,
  Nagato: 2,
  Mutu: 3,
  Kongou: 4,
  Hiei: 5,
} as const;
export type THCutin = Unpacked<typeof THCutin>;

export const TKCutin = {
  none: 0,
  id01_akizuki: 1,
  id02_akizuki: 2,
  id03_akizuki: 3,
  id04_common: 4,
  id05_common: 5,
  id06_common: 6,
  id07_common: 7,
  id08_common: 8,
  id09_common: 9,
  id10_maya: 10,
  id11_maya: 11,
  id12_common: 12,
  id13_disable: 13,
  id14_isuzu: 14,
  id15_isuzu: 15,
  id16_kasumi_yuubari: 16,
  id17_kasumi: 17,
  id18_satuki: 18,
  id19_kinu: 19,
  id20_kinu: 20,
  id21_yura: 21,
  id22_fumituki: 22,
  id23_uit25: 23,
  id24_tenryu_tatuta: 24,
  id25_ise: 25,
  id26_musasi: 26,
  id27_unknown: 27,
  id28_ise_musasi: 28,
  id29_hamakaze_isokaze: 29,
  id30_tenryu_gotland: 30,
  id31_tenryu: 31,
  id32_england_kongou: 32,
  id33_gotland: 33,
  id34_fletcher: 34,
  id35_fletcher: 35,
  id36_fletcher: 36,
  id37_fletcher: 37,
  id38_unknown: 38,
  id39_atlanta: 39,
  id40_atlanta: 40,
  id41_atlanta: 41,
} as const;
export type TKCutin = Unpacked<typeof TKCutin>;


export interface TKCutinConst {
  readonly rate: number;
  readonly kotei: number;
  readonly hendou: number;
}

const TKCutinConstV = (rate: number, kotei: number, hendou: number): TKCutinConst => {
  return { rate: rate, kotei: kotei, hendou: hendou} ;
};
export const TKCutinConsts: TKCutinConst[] = [
  TKCutinConstV(0, 0, 0), // none = 0,
  TKCutinConstV(65, 7, 1.7), // id01_akizuki = 1,
  TKCutinConstV(58, 6, 1.7), // id02_akizuki,
  TKCutinConstV(50, 4, 1.6), // id03_akizuki,
  TKCutinConstV(52, 6, 1.5), // id04_common,
  TKCutinConstV(55, 4, 1.5), // id05_common,
  TKCutinConstV(40, 4, 1.45), // id06_common,
  TKCutinConstV(45, 3, 1.35), // id07_common,
  TKCutinConstV(50, 4, 1.4), // id08_common,
  TKCutinConstV(40, 2, 1.3), // id09_common,
  TKCutinConstV(60, 8, 1.65), // id10_maya,
  TKCutinConstV(55, 6, 1.5), // id11_maya,
  TKCutinConstV(45, 3, 1.25), // id12_common,
  TKCutinConstV(0, 0, 0), // id13_disable,
  TKCutinConstV(59, 4, 1.45), // id14_isuzu, 58.93% https://twitter.com/KennethWWKK/status/706466567727423489
  TKCutinConstV(53, 3, 1.3), // id15_isuzu, 52.48% https://twitter.com/KennethWWKK/status/706464933098049536
  TKCutinConstV(60, 4, 1.4), // id16_kasumi_yuubari, 59.4% jervis
  TKCutinConstV(55, 2, 1.25), // id17_kasumi, 54.5% jervis
  TKCutinConstV(60, 2, 1.2), // id18_satuki, 59.4% jervis 
  TKCutinConstV(55, 5, 1.45), // id19_kinu, 54.5% jervis
  TKCutinConstV(70, 3, 1.25), // id20_kinu, 69.3% jervis
  TKCutinConstV(60, 5, 1.45), // id21_yura, 59.4% jervis
  TKCutinConstV(63, 2, 1.2), // id22_fumituki, 62.4% jervis
  TKCutinConstV(80, 1, 1.05), // id23_uit25, 79.2% jervis
  TKCutinConstV(60, 3, 1.25), // id24_tatuta, 59.4% jervis
  TKCutinConstV(60, 7, 1.55), // id25_ise, 59.4% jervis
  TKCutinConstV(20, 6, 1.4), // id26_musasi, 19%(9.9%:100-49.5%=50.5%) jervis
  TKCutinConstV(0, 0, 0), // id27_unknown,
  TKCutinConstV(53, 4, 1.4), // id28_ise_musasi, 52,5% jervis
  TKCutinConstV(58, 5, 1.55), // id29_hamakaze_isokaze,57.4% jervis
  TKCutinConstV(42, 3, 1.3), // id30_tenryu_gotland, 41.6 jervis
  TKCutinConstV(50, 2, 1.25), // id31_tenryu, 49.5% jervis
  TKCutinConstV(32, 3, 1.2), // id32_england_kongou, 31.7% 
  TKCutinConstV(42, 3, 1.35), // id33_gotland, 41.6% jervis
  TKCutinConstV(60, 7, 1.6), // id34_fletcher, 59.20% https://twitter.com/kankenRJ/status/1091902103381897218/
  TKCutinConstV(63, 6, 1.55), // id35_fletcher, 63.00% 
  TKCutinConstV(50, 6, 1.55), // id36_fletcher, 50.00%(26%:100-48=52% )
  TKCutinConstV(48, 4, 1.45), // id37_fletcher, 48.00%
  TKCutinConstV(0, 0, 0), // id38_unknown,
  TKCutinConstV(56, 10, 1.7), // id39_atlanta, 56.04% https://twitter.com/kankenRJ/status/1242475485113671683
  TKCutinConstV(47, 10, 1.7), // id40_atlanta, 47.24%(20.77%:100-56.04%=43.96%)
  TKCutinConstV(61, 9, 1.65),// id41_atlanta, 60.41% (14.01%: 100-76.81%=23.19%)
];

const tkCutin = (info: ShipInfo): { entry: TKCutin[], type: TKCutin[] } => {
  const ship_id = info.mst.api_id;
  const types: TKCutin[] = [];

  const retCmn = (entry: TKCutin[]): { entry: TKCutin[], type: TKCutin[] } => {
    let type: TKCutin[] = entry.slice();
    if (type.includes(TKCutin.id04_common)) {
      type = type.filter((t) => t !== TKCutin.id06_common);
    }
    if (type.includes(TKCutin.id05_common)) {
      type = type.filter((t) => t !== TKCutin.id08_common);
    }
    if (type.includes(TKCutin.id07_common)) {
      type = type.filter((t) => t !== TKCutin.id09_common);
    }
    return {entry: entry, type: type };
  };

  const addCmn = (common: { ks: number; d: number; k: number; tk: number; }): TKCutin[] => {
    const type: TKCutin[] = [];
    if (common.tk >= 2 && common.d >= 1) type.push(TKCutin.id05_common);
    else if (common.k >= 1 && common.ks >= 1 && common.d >= 1) type.push(TKCutin.id07_common);
    else if (common.k >= 1 && common.ks >= 1) type.push(TKCutin.id09_common);
    else if (common.tk >= 1 && common.d >= 1) type.push(TKCutin.id08_common);
    return type;
  };

  // common
  const common = info.slots.reduce((acc, slot) => {
    if (slot) {
      const imgtype = KcsUtil.slotitemImgType(slot.mst);
      if (imgtype === SlotitemImgType.syuhou_dai) acc.dai++;
      if (imgtype === SlotitemImgType.sansikidan) acc.s++;
      if (imgtype === SlotitemImgType.kousyasouti) acc.ks++;
      if (imgtype === SlotitemImgType.dentan && slot.mst.api_tyku > 0) acc.d++;
      if (imgtype === SlotitemImgType.kijyu) {
        acc.kj++;
        if (slot.mst.api_tyku >= 9) acc.kjt++;
        if (slot.mst.api_tyku >= 3) acc.kj3++;
      }
      if (imgtype === SlotitemImgType.koukakuhou) {
        acc.k++;
        if ([122, 130, 135, 172, 308, 275, 295, 296, 362, 363].includes(slot.mst.api_id)) acc.tk++;
      }
    }
    return acc;
  }, { dai: 0, s: 0, ks: 0, d: 0, kj: 0, kjt: 0, kj3: 0, k: 0, tk: 0 });
  if (common.dai >= 1 && common.s >= 1 && common.ks >= 1 && common.d >= 1) types.push(TKCutin.id04_common);
  if (common.tk >= 2 && common.d >= 1) types.push(TKCutin.id05_common);
  if (common.dai >= 1 && common.s >= 1 && common.ks >= 1) types.push(TKCutin.id06_common);
  if (common.k >= 1 && common.ks >= 1 && common.d >= 1) types.push(TKCutin.id07_common);
  if (common.tk >= 1 && common.d >= 1) types.push(TKCutin.id08_common);
  if (common.k >= 1 && common.ks >= 1) types.push(TKCutin.id09_common);
  if ((common.kj3-common.kjt) >= 1 && common.kj3 >= 1 && common.d >= 1) types.push(TKCutin.id12_common);

  // akizuki type
  if (isShipId(ship_id, [421, 422, 423, 532, 330, 346, 357, 537])) {
    const cnt = info.slots.reduce((acc, slot) => {
      if (slot) {
        const imgtype = KcsUtil.slotitemImgType(slot.mst);
        if (imgtype === SlotitemImgType.dentan) acc.d++;
      }
      return acc;
    }, { d: 0 });
    if (common.k >= 2 && cnt.d >= 1) types.push(TKCutin.id01_akizuki);
    if (common.k >= 1 && cnt.d >= 1) types.push(TKCutin.id02_akizuki);
    if (common.k >= 2) types.push(TKCutin.id03_akizuki);
    if (types.includes(TKCutin.id01_akizuki)) {
      return { 
        entry: types,
        type: [TKCutin.id01_akizuki]
      };
    }
    if (types.includes(TKCutin.id02_akizuki)) {
      return { 
        entry: types,
        type: [TKCutin.id02_akizuki]
      };
    }
    if (types.includes(TKCutin.id03_akizuki)) {
      return { 
        entry: types,
        type: [TKCutin.id03_akizuki]
      };
    }
    return retCmn(types);
  }

  // maya kai2
  if (ship_id === 428) {
    if (common.k >= 1 && common.kjt >= 1 && common.d >= 1) types.push(TKCutin.id10_maya);
    if (common.k >= 1 && common.kjt >= 1) types.push(TKCutin.id11_maya);
    if (types.includes(TKCutin.id10_maya)) {
      return { 
        entry: types,
        type: [TKCutin.id10_maya]
      };
    }
    if (types.includes(TKCutin.id11_maya)) {
      return { 
        entry: types,
        type: [TKCutin.id11_maya]
      };
    }
    return retCmn(types);
  }

  // isuzu kai2
  if (ship_id === 141) {
    if (common.k >= 1 && common.kj >= 1 && common.d >= 1) types.push(TKCutin.id14_isuzu);
    if (common.k >= 1 && common.kj >= 1) types.push(TKCutin.id15_isuzu);
    
    if (types.includes(TKCutin.id14_isuzu)) {
      return { 
        entry: types,
        type: [TKCutin.id14_isuzu]
      };
    }
    if (types.includes(TKCutin.id15_isuzu)) {
      return {
        entry: types,
        type: [TKCutin.id15_isuzu]
      };
    }
    return retCmn(types);
  }

  // kasumi kai2otu, yuubari kai2
  if (isShipId(ship_id, [470, 622, 623, 624])) {
    if (common.k >= 1 && common.kj >= 1 && common.d >= 1) types.push(TKCutin.id16_kasumi_yuubari);
    if (common.k >= 1 && common.kj >= 1 && ship_id === 470) types.push(TKCutin.id17_kasumi);
    if (types.includes(TKCutin.id16_kasumi_yuubari)) {
      return {
        entry: types,
        type: [TKCutin.id16_kasumi_yuubari]
      };
    }
    if (types.includes(TKCutin.id17_kasumi)) {
      return {
        entry: types,
        type: [TKCutin.id17_kasumi]
      };
    }
    return retCmn(types);
  }

  // satuki kai2, fumituki kai2
  if (ship_id === 418 || ship_id === 548) {
    let t: TKCutin = TKCutin.none;
    if (common.kjt >= 1 && ship_id === 418) t = TKCutin.id18_satuki;
    if (common.kjt >= 1 && ship_id === 548) t = TKCutin.id22_fumituki;

    if (t != TKCutin.none) {
      types.push(t);
      const type: TKCutin[] = addCmn(common);
      type.push(t);
      return {
        entry: types,
        type: type
      };
    }
    return retCmn(types);
  }

  // kinu kai2
  if (ship_id === 487) {
    const cnt = info.slots.reduce((acc, slot) => {
      if (slot) {
        const imgtype = KcsUtil.slotitemImgType(slot.mst);
        if (imgtype === SlotitemImgType.koukakuhou && slot.mst.api_tyku <= 7) acc.k++;
      }
      return acc;
    }, { k: 0 });
    if (cnt.k >= 1 && common.kj >= 1) types.push(TKCutin.id19_kinu);
    if (common.kj >= 1) types.push(TKCutin.id20_kinu);
    if (types.includes(TKCutin.id19_kinu) && types.includes(TKCutin.id20_kinu)) {
      return {
        entry: types,
        type: [TKCutin.id19_kinu, TKCutin.id20_kinu]
      };
    }
    if (types.includes(TKCutin.id20_kinu)) {
      const type: TKCutin[] = [];
      if (common.tk >= 2 && common.d >= 1) type.push(TKCutin.id05_common);
      else if (common.k >= 1 && common.ks >= 1 && common.d >= 1) type.push(TKCutin.id07_common);
      else if (common.k >= 1 && common.ks >= 1) type.push(TKCutin.id09_common);
      else if (common.tk >= 1 && common.d >= 1) type.push(TKCutin.id08_common);
      type.push(TKCutin.id20_kinu);
      return {
        entry: types,
        type: type
      };
    }
    return retCmn(types);
  }

  // yura kai2
  if (ship_id === 488) {
    if (common.k >= 1 && common.d >= 1 && ship_id === 488) types.push(TKCutin.id21_yura);
    if (types.includes(TKCutin.id21_yura)) {
      return {
        entry: types,
        type: [TKCutin.id21_yura]
      };
    }
    return retCmn(types);
  }

  // hamakaze otu kai, isokaze otu kai
  if (isShipId(ship_id, [557, 558])) {
    if (common.k >= 1 && common.d >= 1) types.push(TKCutin.id29_hamakaze_isokaze);
    if (types.includes(TKCutin.id29_hamakaze_isokaze)) {
      const type: TKCutin[] = addCmn(common);
      type.push(TKCutin.id29_hamakaze_isokaze);
      return {
        entry: types,
        type: type
      };  
    }
    return retCmn(types);
  }

  // gotland kai, gotland andra
  if (isShipId(ship_id, [579, 630])) {
    const cnt = info.slots.reduce((acc, slot) => {
      if (slot) {
        const imgtype = KcsUtil.slotitemImgType(slot.mst);
        if (imgtype === SlotitemImgType.kijyu && slot.mst.api_tyku >= 4) acc.kj++;
      }
      return acc;
    }, { kj: 0 });
    if (common.k >= 3) types.push(TKCutin.id30_tenryu_gotland);
    if (common.k >= 1 && cnt.kj >= 1) types.push(TKCutin.id33_gotland);
    if (types.includes(TKCutin.id33_gotland)) {
      const type: TKCutin[] = addCmn(common);
      type.push(TKCutin.id33_gotland);
      return {
        entry: types,
        type: type
      };
    }
    if (types.includes(TKCutin.id30_tenryu_gotland)) {
      const type: TKCutin[] = addCmn(common);
      if (! type.length) {
        type.push(TKCutin.id30_tenryu_gotland);
      }
      return {
        entry: types,
        type: type
      };
    }
    return retCmn(types);
  }

  // tenryu kai2
  if (ship_id === 477) {
    if (common.k >= 3) types.push(TKCutin.id30_tenryu_gotland);
    if (common.k >= 2 && ship_id === 477) types.push(TKCutin.id31_tenryu);
    if (common.k >= 1 && (common.kj-common.kjt) >= 1) types.push(TKCutin.id24_tenryu_tatuta);
    if (types.includes(TKCutin.id24_tenryu_tatuta)) {
      const type: TKCutin[] = addCmn(common);
      type.push(TKCutin.id24_tenryu_tatuta);
      return {
        entry: types,
        type: type
      };
    }
    if (types.includes(TKCutin.id30_tenryu_gotland) && types.includes(TKCutin.id31_tenryu)) {
      const type: TKCutin[] = addCmn(common);
      type.push(TKCutin.id30_tenryu_gotland);
      type.push(TKCutin.id31_tenryu);
      return {
        entry: types,
        type: type
      };
    }
    if (types.includes(TKCutin.id31_tenryu)) {
      const type: TKCutin[] = addCmn(common);
      type.push(TKCutin.id31_tenryu);
      return {
        entry: types,
        type: type
      };
    }
    return retCmn(types);
  }

  // uit-25, i504
  if (isShipId(ship_id, [539, 530])) {
    if ((common.kj-common.kjt) >= 1) types.push(TKCutin.id23_uit25);
    if (types.includes(TKCutin.id23_uit25)) {
      return {
        entry: types,
        type: [TKCutin.id31_tenryu]
      };
    }
    return retCmn(types);
  }

  // tatuta kai2
  if (ship_id === 478) {
    if (common.k >= 1 && (common.kj-common.kjt) >= 1) types.push(TKCutin.id24_tenryu_tatuta);
    if (types.includes(TKCutin.id24_tenryu_tatuta)) {
      const type: TKCutin[] = addCmn(common);
      type.push(TKCutin.id24_tenryu_tatuta);
      return {
        entry: types,
        type: type
      };
    }
    return retCmn(types);
  }

  // ise type kai2
  if (isShipId(ship_id, [82, 553, 88, 554])) {
    const cnt = info.slots.reduce((acc, slot) => {
      if (slot) {
        if (slot.mst.api_id === 274) acc.kj++;
      }
      return acc;
    }, { kj: 0 });
    if (cnt.kj >= 1 && common.d >= 1 && common.s >= 1) types.push(TKCutin.id25_ise);
    if (cnt.kj >= 1 && common.d >= 1) types.push(TKCutin.id28_ise_musasi);
    if (types.includes(TKCutin.id25_ise)) {
      return {
        entry: types,
        type: [TKCutin.id25_ise]
      };
    }
    if (types.includes(TKCutin.id28_ise_musasi)) {
      const type: TKCutin[] = addCmn(common);
      if (! type.length) {
        type.push(TKCutin.id28_ise_musasi);
      }
      return {
        entry: types,
        type: type,
      };
    }
    return retCmn(types);
  }
  
  // musasi kai
  if (isShipId(ship_id, [148, 546])) {
    const cnt = info.slots.reduce((acc, slot) => {
      if (slot) {
        if (slot.mst.api_id === 274) acc.kj++;
        if (slot.mst.api_id === 275) acc.k++;
      }
      return acc;
    }, { k: 0, kj: 0 });
    if (cnt.k >= 1 && common.d >= 1 && ship_id === 546) types.push(TKCutin.id26_musasi);
    if (cnt.kj >= 1 && common.d >= 1) types.push(TKCutin.id28_ise_musasi);
    if (types.includes(TKCutin.id26_musasi)) {
      const type: TKCutin[] = addCmn(common);
      type.push(TKCutin.id26_musasi);
      return {
        entry: types,
        type: type
      };
    }
    if (types.includes(TKCutin.id28_ise_musasi)) {
      const type: TKCutin[] = addCmn(common);
      if (! type.length) {
        type.push(TKCutin.id28_ise_musasi);
      }
      return {
        entry: types,
        type: type,
      };
    }
    return retCmn(types);
  }

  // england, kongou type kai2
  if (isShipId(ship_id, [439, 364, 571, 576, 515, 393, 519, 394, 520, 893, 
    149, 150, 151, 152, 591, 592])) {
    const cnt = info.slots.reduce((acc, slot) => {
      if (slot) {
        if (slot.mst.api_id === 191) acc.pon++;
        if (slot.mst.api_id === 300) acc.s300++;
        if (slot.mst.api_id === 301) acc.rocket++;
      }
      return acc;
    }, { s300: 0, pon: 0, rocket: 0 });
    if ((cnt.s300 >= 1 && cnt.pon >= 1) || (cnt.rocket >= 2) || (cnt.pon >= 1 && cnt.rocket >= 1)) types.push(TKCutin.id32_england_kongou);
    if (types.includes(TKCutin.id32_england_kongou)) {
      const type: TKCutin[] = addCmn(common);
      if (! type.length) {
        type.push(TKCutin.id32_england_kongou);
      }
      return {
        entry: types,
        type: type,
      };
    }
    return retCmn(types);
  }

  // fletchar type
  if (isShipId(ship_id, [596, 692, 628, 629, 562, 689])) {
    const cnt = info.slots.reduce((acc, slot) => {
      if (slot) {
        if (slot.mst.api_id === 284) acc.s284++;
        if (slot.mst.api_id === 307) acc.s307d++;
        if (slot.mst.api_id === 308) acc.s308++;
        if (slot.mst.api_id === 313) acc.s313++;
      }
      return acc;
    }, { s308: 0, s284: 0, s313: 0, s307d: 0 });
    if (cnt.s308 >= 2) types.push(TKCutin.id34_fletcher);
    if (cnt.s308 >= 1 && (cnt.s284+cnt.s313) >= 1) types.push(TKCutin.id35_fletcher);
    if ((cnt.s284+cnt.s313) >= 2 && cnt.s307d >= 1) types.push(TKCutin.id36_fletcher);
    if (cnt.s313 >= 2) types.push(TKCutin.id37_fletcher);
    if (types.includes(TKCutin.id34_fletcher) && types.includes(TKCutin.id35_fletcher)) {
      return {
        entry: types,
        type: [TKCutin.id34_fletcher, TKCutin.id35_fletcher]
      };
    }
    if (types.includes(TKCutin.id34_fletcher)) {
      let type: TKCutin[] = [TKCutin.id34_fletcher];
      type = type.concat(addCmn(common));
      return {
        entry: types,
        type: type,
      };
    }
    if (types.includes(TKCutin.id35_fletcher) && types.includes(TKCutin.id37_fletcher)) {
      return {
        entry: types,
        type: [TKCutin.id35_fletcher, TKCutin.id37_fletcher]
      };
    }
    if (types.includes(TKCutin.id35_fletcher)) {
      let type: TKCutin[] = [TKCutin.id35_fletcher];
      type = type.concat(addCmn(common));
      return {
        entry: types,
        type: type,
      };
    }
    if (types.includes(TKCutin.id36_fletcher) && types.includes(TKCutin.id37_fletcher)) {
      return {
        entry: types,
        type: [TKCutin.id37_fletcher, TKCutin.id36_fletcher]
      };
    }
    if (types.includes(TKCutin.id36_fletcher)) {
      return {
        entry: types,
        type: [TKCutin.id36_fletcher]
      };
    }
    if (types.includes(TKCutin.id37_fletcher)) {
      let type: TKCutin[] = [TKCutin.id37_fletcher];
      type = type.concat(addCmn(common));
      return {
        entry: types,
        type: type,
      };
    }
    return retCmn(types);
  }

  // atlanta
  if (isShipId(ship_id, [597, 696])) {
    const cnt = info.slots.reduce((acc, slot) => {
      if (slot) {
        if (slot.mst.api_id === 307) acc.s307d++;
        if (slot.mst.api_id === 362) acc.s362++;
        if (slot.mst.api_id === 363) acc.s363++;
      }
      return acc;
    }, { s307d: 0, s362: 0, s363: 0,  });
    if (cnt.s363 >= 1 && cnt.s362 >= 1) types.push(TKCutin.id39_atlanta);
    if ((cnt.s362+cnt.s363) >= 1 && cnt.s362 >= 1 && cnt.s307d >= 1) types.push(TKCutin.id40_atlanta);
    if ((cnt.s363 >= 1 && cnt.s362 >= 1) || cnt.s362 >= 2) types.push(TKCutin.id41_atlanta);
    if (types.includes(TKCutin.id39_atlanta) && types.includes(TKCutin.id40_atlanta) && types.includes(TKCutin.id41_atlanta)) {
      let type: TKCutin[] = [TKCutin.id39_atlanta, TKCutin.id40_atlanta, TKCutin.id41_atlanta];
      type = type.concat(addCmn(common));
      return {
        entry: types,
        type: type
      };
    }
    if (types.includes(TKCutin.id39_atlanta) && types.includes(TKCutin.id41_atlanta)) {
      let type: TKCutin[] = [TKCutin.id39_atlanta, TKCutin.id41_atlanta];
      type = type.concat(addCmn(common));
      return {
        entry: types,
        type: type
      };
    }
    if (types.includes(TKCutin.id41_atlanta)) {
      let type: TKCutin[] = [TKCutin.id41_atlanta];
      type = type.concat(addCmn(common));
      return {
        entry: types,
        type: type
      };
    }
    return retCmn(types);
  }

  return retCmn(types);
};

/**
 * 
 */
export class KcsUtil {

  /**
   * 
   * @param url 
   */
  public static getApi(url: string | undefined): Api | undefined {
    if (!url) {
      return undefined;
    }

    const ret = ApiTypes.find(v => url.indexOf(v[1]) !== -1);
    return ret ? ret[1] : undefined;
  }

  /**
   * 
   * @param url 
   */
  public static isKcsapi(url: string | undefined): boolean {
    if (url) {
      return url.indexOf('/kcsapi/') !== -1;
    }
    return false;
  }

  /**
   * 
   * @param url 
   */
  public static isOsapiDmmUrl(url: string | undefined): boolean {
    if (url) {
      return url.indexOf('://osapi.dmm.com/gadgets/makeRequest') !== -1;
    }
    return false;
  }
  
  /**
   * 
   * @param ip 
   */
  public static fromIpAddress(ip: string): ApiServerId {
    const m: { [key: string]: ApiServerId } = {
      '203.104.209.71': ApiServerId.world1,
      '203.104.209.87': ApiServerId.world2,
      '125.6.184.215': ApiServerId.world3,
      '203.104.209.183': ApiServerId.world4,
      '203.104.209.150': ApiServerId.world5,
      '203.104.209.134': ApiServerId.world6,
      '203.104.209.167': ApiServerId.world7,
      '203.104.209.199': ApiServerId.world8,
      '125.6.189.7': ApiServerId.world9,
      '125.6.189.39': ApiServerId.world10,
      '125.6.189.71': ApiServerId.world11,
      '125.6.189.103': ApiServerId.world12,
      '125.6.189.135': ApiServerId.world13,
      '125.6.189.167': ApiServerId.world14,
      '125.6.189.215': ApiServerId.world15,
      '125.6.189.247': ApiServerId.world16,
      '203.104.209.23': ApiServerId.world17,
      '203.104.209.39': ApiServerId.world18,
      '203.104.209.55': ApiServerId.world19,
      '203.104.209.102': ApiServerId.world20,
    };
    return m[ip] ?? ApiServerId.unknown;
  }

  /**
   * 
   */
  public static shipOnSlotMax(id: number): number[] {
    const etc = ShipEtcs.find((etc) => etc.api_id === id);
    if (etc) {
      return etc.api_onslot;
    }
    return [];
  }

  /**
   * 
   * @param mst 
   */
  public static shipCond(ship: ApiShip): Cond {
    const cond = ship.api_cond;
    if (cond > 49) {
      return Cond.good;
    }
    if (cond < 20) {
      return Cond.red;
    }
    if (cond < 30) {
      return Cond.orange;
    }
    if (cond < 40) {
      return Cond.orange_hidden;
    }
    return Cond.normal;
  }

  /**
   * 
   */
  public static slotitemType(mst: MstSlotitem): SlotitemType {
    return mst.api_type[2];
  }

  /**
   * 
   */
  public static slotitemImgType(mst: MstSlotitem): SlotitemImgType {
    return mst.api_type[3];
  }

  /**
   * 
   */
  public static hasMainGun(type: SlotitemType): boolean {
    return SlotitemType.SmallMainGun === type ||
      SlotitemType.MediumMainGun === type ||
      SlotitemType.LargeMainGun === type;
  }

  /**
   * 
   */
  public static hasOnSlot(type: SlotitemType) {
    switch(type) {
      case SlotitemType.Fighter: // 艦上戦闘機
      case SlotitemType.DiveBomber: // 艦上爆撃機
      case SlotitemType.TorpedoBomber: // 艦上攻撃機
      case SlotitemType.RecAircraft: // 艦上偵察機
      case SlotitemType.RecSeaplane: // 水上偵察機
      case SlotitemType.SeaplaneBomber: // 水上爆撃機
      case SlotitemType.Autogyro: // オートジャイロ
      case SlotitemType.ASBAircraft: // 対潜哨戒機
      case SlotitemType.LargeFlyingBoat: // 大型飛行艇
      case SlotitemType.SeaplaneFighter: // 水上戦闘機
      case SlotitemType.JetFighter: // 噴式戦闘機
      case SlotitemType.JetFighterBomber: //噴式戦闘爆撃機
        return true;
    }
    return false;
  }

  /**
   * 
   */
  public static hasRadar(type: SlotitemType): boolean {
    return SlotitemType.SmallRadar === type ||
      SlotitemType.LargeRadar === type;
  }

  /**
   * 
   */
  public static hasFASeaplane(type: SlotitemType): boolean {
    return SlotitemType.RecSeaplane === type ||
      SlotitemType.SeaplaneBomber === type;
  }

  /**
   * 
   */
  public static hasSuisei634(id: number): boolean {
    return id === 291 || id === 292 || id === 319;
  }

  /**
   * 
   */
  public static hasZuiun(id: number): boolean {
    return id === 26 || id === 79 || id === 80 || id === 81 || id === 207 || id === 237 || id === 322 || id === 323;
  }

  /**
   * 
   */
  public static hasAADefence(type: SlotitemType): boolean {
    return (SlotitemType.Fighter === type) ||
      (SlotitemType.DiveBomber === type) ||
      (SlotitemType.TorpedoBomber === type) ||
      (SlotitemType.SeaplaneBomber === type) ||
      (SlotitemType.SeaplaneFighter === type) ||
      (SlotitemType.JetFighterBomber === type) ||
      (SlotitemType.LandAttackAircraft === type) ||
      (SlotitemType.LandRecAircraft === type) ||
      (SlotitemType.LandFighter === type);
  }

  /**
   * 
   */
  public static landHasAADefence(type: SlotitemType): boolean {
    return (SlotitemType.LandAttackAircraft === type) ||
      (SlotitemType.LandFighter === type);
  }

  /**
   * 
   */
  public static isAtlantaType(id: number): boolean {
    return id === 597 || // atlanta
    id === 696 // atlanta kai
    ;
  }

  /**
   * 
   */
  public static isFletcherType(id: number): boolean {
    return id === 562 || // johnston
      id === 689 || // johnston kai
      id === 596 || // fletcher
      id === 692 || // fletcher kai
      id === 628 || // fletcher kai mod.2
      id === 629 // fletcher mk.II
      ;
  }

  /**
   * 
   */
  public static isSpecialTkShipType(id: number): boolean {
    return KcsUtil.isAtlantaType(id) || KcsUtil.isFletcherType(id);
  }

  /**
   * 
   * @param mst 
   * @param alv 
   */
  public static aaFromALevel(mst: MstSlotitem, alv: number | undefined): number {
    if (alv === undefined) {
      return 0;
    }

    alv = Math.max(0, Math.min(alv, 7));
    const inner_bonus = [0, 1, 1, 2, 2, 2, 2, 3][alv]; // 2,3
    const type = KcsUtil.slotitemType(mst);
    if ((SlotitemType.Fighter === type) ||
      (SlotitemType.SeaplaneFighter === type) ||
      (SlotitemType.LandFighter === type)) {
      const bonus = [
        0, 0, 2, 5, 9, 14, 14, 22
      ] as const;
      return bonus[alv] + inner_bonus;
    }

    if ((SlotitemType.SeaplaneBomber === type)) {
      const bonus = [
        0, 0, 1, 1, 1, 3, 3, 6
      ] as const;
      return bonus[alv] + inner_bonus;
    }
    return 0 + inner_bonus;
  }

  /**
   * 
   * @param mst 
   * @param level 
   */
  public static aaFromLevel(mst: MstSlotitem, level: number | undefined): number {
    if (level === undefined) {
      return 0;
    }
    level = Math.max(0, Math.min(level, 10));
    if (level) {
      const type = KcsUtil.slotitemType(mst);
      if ((SlotitemType.Fighter === type) ||
        (SlotitemType.SeaplaneFighter === type) ||
        (SlotitemType.LandFighter === type)) {
        return 0.2 * level;
      }

      if (SlotitemType.DiveBomber === type) {
        return 0.25 * level;
      }
    }
    return 0;
  }

  /**
   * 
   * @param mst 
   * @param level 
   */
  public static fireFromLevel(mst: MstSlotitem, level: number | undefined): number {
    if (level === undefined) {
      return 0;
    }
    level = Math.max(0, Math.min(level, 10));
    if (level) {
      const type = KcsUtil.slotitemImgType(mst);
      switch(type) {
        case SlotitemImgType.bakurai:
          if ([44, 45, 346].includes(mst.api_id)) {
            return 0.75 * Math.sqrt(level);
          }
          break;
          
        case SlotitemImgType.syuhou_syou:
        case SlotitemImgType.syuhou_tyuu:
        case SlotitemImgType.sansikidan:
        case SlotitemImgType.tekoudan:
        case SlotitemImgType.tansyoutou:
        case SlotitemImgType.daihatu:
        case SlotitemImgType.taiti:
        case SlotitemImgType.kijyu:
        case SlotitemImgType.kousyasouti:
          return Math.sqrt(level);
        case SlotitemImgType.koukakuhou:
          if ([10, 66, 220, 275, 358].includes(mst.api_id)) {
            return 0.2*level;
          }
          return Math.sqrt(level);
        case SlotitemImgType.syuhou_dai:
          return 1.5 * Math.sqrt(level);
        case SlotitemImgType.sonar:
          return 0.75 * Math.sqrt(level);          
      }
    }
    return 0;
  }

  /**
   * 
   * @param mst 
   * @param level 
   */
  public static torFromLevel(mst: MstSlotitem, level: number | undefined): number {
    if (level === undefined) {
      return 0;
    }
    level = Math.max(0, Math.min(level, 10));
    if (level) {
      const type = KcsUtil.slotitemImgType(mst);
      switch(type) {
        case SlotitemImgType.gyorai:
          return 1.2 * Math.sqrt(level);
        case SlotitemImgType.kijyu:
          return 1.2 * Math.sqrt(level);
        case SlotitemImgType.kanjyou_kougekiki:
          return 0.2 * level;
      }
    }
    return 0;
  }

  /**
   * 
   * @param mst 
   * @param level 
   */
  public static evFromLevel(mst: MstSlotitem, level: number | undefined): number {
    if (level === undefined) {
      return 0;
    }
    level = Math.max(0, Math.min(level, 10));
    if (level) {
      const type = KcsUtil.slotitemImgType(mst);
      switch(type) {
        case SlotitemImgType.engine:
          return 1.5 * Math.sqrt(level);
      }
    }
    return 0;
  }

  /**
   * 
   * @param mst 
   * @param level 
   */
  public static losFromLevel(mst: MstSlotitem, level: number | undefined): number {
    if (level === undefined) {
      return 0;
    }
    level = Math.max(0, Math.min(level, 10));
    if (level) {
      const r = remodelLos(mst);
      if (r) {
        return r * Math.sqrt(level);
      }
    }
    return 0;
  }

  /**
   * 
   * @param mst 
   * @param level 
   */
  public static armorFromLevel(mst: MstSlotitem, level: number | undefined): number {
    if (level === undefined) {
      return 0;
    }
    level = Math.max(0, Math.min(level, 10));
    if (level) {
      const type = KcsUtil.slotitemType(mst);
      switch(type) {
        case SlotitemType.MediumExtraArmor:
          return 0.2*level;
        case SlotitemType.LargeExtraArmor:
          return 0.3*level;
      }
    }
    return 0;
  }

  /**
   * 
   * @param mst 
   * @param level 
   */
  public static aswFromLevel(mst: MstSlotitem, level: number | undefined): number {
    if (level === undefined) {
      return 0;
    }
    level = Math.max(0, Math.min(level, 10));
    if (level) {
      const type = KcsUtil.slotitemType(mst);
      switch(type) {
        case SlotitemType.Sonar:
        case SlotitemType.DepthCharge:
          return Math.sqrt(level) * 2 / 3;
        case SlotitemType.Autogyro:
          if ([326,327].includes(mst.api_id)) {
            return 0.3 * level;
          }
          return 0.2 * level;
        case SlotitemType.TorpedoBomber:
          return 0.2 * level;
      }
    }
    return 0;
  }

  /**
   * 
   * @param mst 
   * @param level 
   */
  public static boukuFromLevel(mst: MstSlotitem, level: number | undefined): number {
    if (level === undefined) {
      return 0;
    }
    level = Math.max(0, Math.min(level, 10));
    if (level) {
      const r = remodelKTBonus(mst);
      if (r) {
        return r * Math.sqrt(level);
      }
    }
    return 0;
  }

  /**
   * 
   * @param mst 
   * @param level 
   */
  public static hitFromLevel(mst: MstSlotitem, level: number | undefined): number {
    if (level === undefined) {
      return 0;
    }
    level = Math.max(0, Math.min(level, 10));
    if (level) {
      const r = remodelHit(mst);
      if (r) {
        return r * Math.sqrt(level);
      }
    }
    return 0;
  }

  /**
   * 
   * @param mst 
   * @param level 
   */
  public static hitTorFromLevel(mst: MstSlotitem, level: number | undefined): number {
    if (level === undefined) {
      return 0;
    }
    level = Math.max(0, Math.min(level, 10));
    if (level) {
      const r = remodelHitTor(mst);
      if (r) {
        return r * Math.sqrt(level);
      }
    }
    return 0;
  }

  /**
   * 
   * @param mst 
   * @param level 
   */
  public static hitAswFromLevel(mst: MstSlotitem, level: number | undefined): number {
    if (level === undefined) {
      return 0;
    }
    level = Math.max(0, Math.min(level, 10));
    if (level) {
      const r = remodelHitAsw(mst);
      if (r) {
        return r * Math.sqrt(level);
      }
    }
    return 0;
  }

  /**
   * 
   * @param mst 
   * @param slotitem 
   * @param carried 
   */
  public static slotSeiku(mst: MstSlotitem, slotitem: Pick<ApiSlotitem, 'api_level' | 'api_alv'>, carried: number): number {
    const type = KcsUtil.slotitemType(mst);
    if (!KcsUtil.hasAADefence(type)) {
      return 0;
    }

    const root = Math.sqrt(carried);
    const calc = 
      root * (mst.api_tyku + KcsUtil.aaFromLevel(mst, slotitem.api_level)) + KcsUtil.aaFromALevel(mst, slotitem.api_alv);
    //return calc;
    return Math.floor(calc);
  }

  /**
   * 
   * @param ship 
   */
  public static shipSeiku(ship: ShipInfo): number {
    return ship.slots.reduce((acc, slot, index) => {
      if (slot) {
        acc += KcsUtil.slotSeiku(slot.mst, slot.api, ship.api.api_onslot[index]);
      }
      return acc;
    }, 0);
  }

  /**
   * 
   * @param ship 
   */
  public static shipsSeiku(ships: ShipInfo[]): number {
    return ships.reduce((acc, ship) => acc + KcsUtil.shipSeiku(ship), 0);
  }

  /**
   * 
   * @param ship 
   */
  public static isKuuboType(ship: ShipInfo): boolean {
    switch(ship.mst.api_stype) {
      case ApiShipType.soukou_kuubo: // 装甲空母
      case ApiShipType.kei_kuubo: // 軽空母
      case ApiShipType.seiki_kuubo: // 正規空母
        return true;
    }
  
    // 補給艦
    if (ApiShipType.hokyuukan === ship.mst.api_stype) {
      return ship.slots.some((slot) => slot && KcsUtil.slotitemType(slot.mst) === SlotitemType.TorpedoBomber);
    }
  
    return false;
  }

  /**
   * 
   * @param ship 
   */
  public static shipFire(ship: ShipInfo): number {

    const calc = ship.slots.reduce((acc, slot) => {
      if (slot) {
        if (slot.api.api_level) {
          acc.rfire += KcsUtil.fireFromLevel(slot.mst, slot.api.api_level);
        }
        acc.baku += slot.mst.api_baku;
      }
      return acc;
    }, { rfire: 0, baku: 0 });
  
    // hp state
    const hpStateFactor = [1.0, 1.0, 0.7, 0.4][KcsUtil.shipHpState(ship.api)];
    if (KcsUtil.isKuuboType(ship)) {
      const baseFire = 
        Math.floor(
          (ship.api.api_karyoku[0] + 
          ship.api.api_raisou[0] +
          Math.floor(calc.baku * 1.3)) * 1.5
        ) + 55;
      return Math.floor(baseFire * hpStateFactor);
    }
    else {
      const baseFire = ship.api.api_karyoku[0] + calc.rfire + 5;
      return Math.floor(baseFire * hpStateFactor);
    }
  }

  /**
   * 
   * @param ship 
   */
  public static shipFireAttackable(ship: ShipInfo): boolean {  
    // 潜水艦
    // 潜水空母
    if ((ship.mst.api_stype === ApiShipType.sensuikan) ||
        (ship.mst.api_stype === ApiShipType.sensui_kuubo)) {
      return false;
    }
  
    return true;
  }
  
  /**
   * 
   * @param ship 
   */
  public static shipFireHosei(ship: ShipInfo, api_stype_enemy: number): HoseiType[] {

    switch(ship.mst.api_stype) {
    case ApiShipType.kousoku_senkan: // 戦艦
    case ApiShipType.teisoku_senkan: // 戦艦
    case ApiShipType.koukuu_senkan: // 航空戦艦
    case ApiShipType.tyoudokyuu_senkan:// 超弩級戦艦
      break;
    default:
      return [];
    }

    switch(api_stype_enemy) {
      case ApiShipType.jyuujyun: // 重巡洋艦
      case ApiShipType.koujyun: // 航空巡洋艦
      case ApiShipType.kousoku_senkan: // 戦艦
      case ApiShipType.teisoku_senkan:// 戦艦
      case ApiShipType.koukuu_senkan: // 航空戦艦
      case ApiShipType.seiki_kuubo: // 正規空母
      case ApiShipType.tyoudokyuu_senkan:  // 超弩級戦艦
      case ApiShipType.soukou_kuubo:  // 装甲空母
        break;
      default:
        return [];
    }

    const calc = ship.slots.reduce((acc, slot) => {
      if (slot) {
        const type = this.slotitemType(slot.mst);
        if (SlotitemType.LargeMainGun === type) {
          acc.syuhou = true;
        }
        if (SlotitemType.APShell === type) {
          acc.tekkoudan = true;
        }
        if (SlotitemType.SecondaryGun === type) {
          acc.fukuhou = true;
        }
        if ((SlotitemType.SmallRadar === type) || (SlotitemType.LargeRadar === type)) {
          acc.dentan = true;
        }
      }
      return acc;
    }, { syuhou: false, tekkoudan: false, fukuhou: false, dentan: false });
    
    if (! calc.syuhou || ! calc.tekkoudan) {
      return [];
    }

    if (calc.fukuhou && calc.dentan) {
      return [HoseiType.tekkoudan_fukuhou_dentan];
    }
    if (calc.fukuhou) {
      return [HoseiType.tekkoudan_fukuhou];
    }
    if (calc.dentan) {
      return [HoseiType.tekkoudan_dentan];
    }

    return [HoseiType.tekkoudan];
  }

  /**
   * 
   * @param ship 
   */
  public static shipTor(ship: ShipInfo): number {
    if (KcsUtil.isKuuboType(ship)) {
      return 0;
    }

    // 海防艦
    if (ship.mst.api_stype === ApiShipType.kaiboukan) {
      return 0;
    }

    const calc = ship.slots.reduce((acc, slot) => {
      if (slot) {
        if (slot.api.api_level) {
          acc.rtor += KcsUtil.torFromLevel(slot.mst, slot.api.api_level);
        }
      }
      return acc;
    }, { rtor: 0 });

    // hp state
    const hpStateFactor = [1.0, 1.0, 0.8, 0.0][KcsUtil.shipHpState(ship.api)];
    const baseTor = ship.api.api_raisou[0] + calc.rtor + 5;
    return Math.floor(baseTor * hpStateFactor);
  }

  /**
   * 
   * @param ship 
   */
  public static shipTorAttackable(ship: ShipInfo): boolean {
    if (KcsUtil.isKuuboType(ship)) {
      return false;
    }
  
    // 海防艦
    // 揚陸艦
    // 工作艦
    // 補給艦
    if ((ship.mst.api_stype === ApiShipType.kaiboukan) ||
        (ship.mst.api_stype === ApiShipType.yourikukan) ||
        (ship.mst.api_stype === ApiShipType.kousakusen) ||
        (ship.mst.api_stype === ApiShipType.hokyuukan)) {
      return false;
    }
  
    // 戦艦
    if ((ship.mst.api_stype === ApiShipType.kousoku_senkan) || 
        (ship.mst.api_stype === ApiShipType.teisoku_senkan) || 
        (ship.mst.api_stype === ApiShipType.koukuu_senkan) || 
        (ship.mst.api_stype === ApiShipType.tyoudokyuu_senkan)) {
      // 178 Bismarck drei
      // 513 Гангут два
      // 591 金剛改二丙
      // 592 比叡改二丙
      return [178, 513, 591, 592].includes(ship.mst.api_id);
    }
    return true;
  }
  
  /**
   * 
   * @param ship 
   */
  public static shipAsw(ship: ShipInfo): number {
    const bakurai = [226, 227];
    const bakurai_t = [44, 45];
    const air_types: number[] =
      [SlotitemType.SeaplaneBomber, SlotitemType.TorpedoBomber, SlotitemType.Autogyro];

    const calc = ship.slots.reduce((acc, slot) => {
      if (slot) {
        if (slot.api.api_level) {
          acc.rasw += KcsUtil.aswFromLevel(slot.mst, slot.api.api_level);
        }
        if (bakurai.includes(slot.mst.api_id)) {
          ++acc.bakurai;
        }
        if (bakurai_t.includes(slot.mst.api_id)) {
          ++acc.bakurai_t;
        }
        const type = this.slotitemType(slot.mst);
        if (type === SlotitemType.Sonar) {
          ++acc.sonar;
        }
        if (air_types.includes(type)) {
          acc.air = true;
        }
        acc.asw += slot.mst.api_tais;
      }
      return acc;
    }, { rasw: 0, sonar: 0, bakurai: 0, bakurai_t: 0, asw: 0, air: false });

    // stype add
    let stypeAdd = 0;
    switch(ship.mst.api_stype) {
      case ApiShipType.kaiboukan: // 海防艦
      case ApiShipType.kutikukan: // 駆逐艦
      case ApiShipType.keijyun:  // 軽巡洋艦
      case ApiShipType.raijyun: // 重雷装巡洋艦
      case ApiShipType.renjyun:// 練習巡洋艦
        stypeAdd = 13;
        break;

      case ApiShipType.koujyun: // 航空巡洋艦
      case ApiShipType.kei_kuubo: // 軽空母
      case ApiShipType.koukuu_senkan: // 航空戦艦
      case ApiShipType.seiki_kuubo: // 正規空母
      case ApiShipType.suibo: // 水上機母艦
      case ApiShipType.yourikukan: // 揚陸艦
        stypeAdd = 8;
        break;
      
      case ApiShipType.hokyuukan: // 補給
        stypeAdd = calc.air ? 8 : 13;
        break;
    }

    // synergy
    let synergy = 1.0;
    if (calc.bakurai_t && calc.bakurai && calc.sonar) {
      synergy = 1.15 * 1.25;
    } else if ((calc.bakurai_t || calc.bakurai) && calc.sonar) {
      synergy = 1.15;
    } else if (calc.bakurai_t && calc.bakurai && ! calc.sonar) {
      synergy = 1.1;
    }

    const hpStateFactor = [1.0, 1.0, 0.7, 0.4][KcsUtil.shipHpState(ship.api)];
    const baseAsw = Math.sqrt(ship.api.api_taisen[0] - calc.asw) * 2 + calc.asw * 1.5 + calc.rasw +  stypeAdd;
    return Math.floor(baseAsw * synergy * hpStateFactor);
  }

  /**
   * 
   * @param ship 
   */
  public static shipAswAttackable(ship: ShipInfo): boolean {

    switch(ship.mst.api_stype) {
      case ApiShipType.kaiboukan: // 海防艦
      case ApiShipType.kutikukan: // 駆逐艦
      case ApiShipType.keijyun:  // 軽巡洋艦
      case ApiShipType.raijyun: // 重雷装巡洋艦
      case ApiShipType.renjyun: // 練習巡洋艦
      case ApiShipType.hokyuukan: // 補給艦
        return true;

      case ApiShipType.suibo: // 水上機母艦
      case ApiShipType.koujyun: // 航空巡洋艦
      case ApiShipType.koukuu_senkan: // 航空戦艦
      case ApiShipType.yourikukan: // 揚陸艦
        return ship.slots.some((slot) => {
          if (slot) {
            switch(KcsUtil.slotitemType(slot.mst)) {
              case SlotitemType.SeaplaneBomber:
              case SlotitemType.Autogyro:
              case SlotitemType.LargeFlyingBoat:
                return true;
              case SlotitemType.DiveBomber:
                return !!slot.mst.api_tais;
            }
          }
          return false;
        });

    case ApiShipType.kei_kuubo: // 軽空母
    case ApiShipType.seiki_kuubo: // 正規空母
      if (ApiShipType.seiki_kuubo === ship.mst.api_stype) {
        // 加賀改二護
        if (ship.mst.api_id !== 646) {
          return false;
        }
      }
      return ship.slots.some((slot) => {
        if (slot) {
          switch(KcsUtil.slotitemType(slot.mst)) {
            case SlotitemType.Autogyro:
            case SlotitemType.ASBAircraft:
              return true;

            case SlotitemType.TorpedoBomber:
            case SlotitemType.DiveBomber:
              return !!slot.mst.api_tais;
          }
        }
        return false;
      });    
    }

    return false;
  }

  /**
   * 
   * @param ship 
   * @param enemy 
   */
  public static shipAttackable(ship: ShipInfo, api_stype_enemy: number): Attackable {
    const enemy_is_sensuikan = (api_stype_enemy === ApiShipType.sensuikan) || (api_stype_enemy === ApiShipType.sensui_kuubo);
    const fire = enemy_is_sensuikan ? false : this.shipFireAttackable(ship);
    const tor = enemy_is_sensuikan ? false : this.shipTorAttackable(ship);
    const asw = enemy_is_sensuikan ? this.shipAswAttackable(ship) : false;
    return { fire, tor, asw }
  }

  /**
   * 
   * @param ship 
   */
  public static shipArmor(ship: ShipInfo): number {
    const calc = ship.slots.reduce((acc, slot) => {
      if (slot) {
        if (slot.api.api_level) {
          acc.rarmor += KcsUtil.armorFromLevel(slot.mst, slot.api.api_level);
        }
      }
      return acc;
    }, { rarmor: 0 });
    return ship.api.api_soukou[0] + calc.rarmor;
  }

  /**
   * 
   * @param mst 
   * @param slotitem 
   * @param carried 
   */
  public static planeSeiku(mst: MstSlotitem, slotitem: ApiSlotitem, carried: number, action: AirBaseActionKind): number {
    const type = KcsUtil.slotitemType(mst);
    //if (!KcsUtil.hasAADefence(type)) {
    //  return 0;
    //}
    const root = Math.sqrt(carried);
    let tyku = mst.api_tyku;
    if (type === SlotitemType.LandFighter) {
      if (AirBaseActionKind.bouku === action) {
        tyku += (mst.api_houk + mst.api_houm * 2);
      }
      else {
        tyku += mst.api_houk * 1.5;
      }
    }
    console.log(mst.api_name);
    const calc = root * (tyku + KcsUtil.aaFromLevel(mst, slotitem.api_level)) +
      KcsUtil.aaFromALevel(mst, slotitem.api_alv);
    //return calc;
    console.log(`plame seiku. ${mst.api_name} calced:${Math.floor(calc)} tyku:${tyku} action:${action} alv:${KcsUtil.aaFromALevel(mst, slotitem.api_alv)}`);
    return Math.floor(calc);
  }

  /**
   * 
   */
  public static calcHpState(nowhp: number, maxhp: number): ShipHpState {
    if (nowhp <= maxhp * 0.25)
      return ShipHpState.taiha;
    if (nowhp <= maxhp * 0.5)
      return ShipHpState.tyuuha;
    if (nowhp <= maxhp * 0.75)
      return ShipHpState.syouha;
    return ShipHpState.normal;
  }

  /**
   * 
   */
  public static shipHpState(ship: ApiShip): ShipHpState {
    return KcsUtil.calcHpState(ship.api_nowhp, ship.api_maxhp);
  }


  /**
   * 
   */
  public static seikuState(deck: number, enemy: number): ApiDispSeiku {
    if (0 === enemy) {
      return ApiDispSeiku.kakuho;
    }
    if (deck >= enemy * 3) {
      return ApiDispSeiku.kakuho;
    }
    if (deck >= enemy * 1.5) {
      return ApiDispSeiku.yuusei;
    }
    if (deck >= enemy * 2 / 3) {
      return ApiDispSeiku.kinkou;
    }
    if (deck >= enemy * 1 / 3) {
      return ApiDispSeiku.ressei;
    }
    return ApiDispSeiku.sousitu;
  }

  /**
   * 
   */
  public static slotitemMapLos(slotitem: ApiSlotitem, mst: MstSlotitem): MapLosValue {
    if (mst.api_saku) {
      let r = 0;
      if (slotitem.api_level) {
        r = remodelLos(mst) * Math.sqrt(slotitem.api_level);
      }
      return { map: (mst.api_saku + r) * equipLos(mst), base: mst.api_saku };
    }
    return InvalidMapLosValue();
  }

  /**
   * 
   */
  public static slotitemGetItemLos(mst: MstSlotitem, slotnum: number): number {
    if (mst.api_saku && slotnum) {
      const type = KcsUtil.slotitemType(mst);
      if (SlotitemType.RecSeaplane === type || // 水上偵察機
        SlotitemType.SeaplaneBomber === type) {// 水上爆撃機
        return mst.api_saku * Math.sqrt(Math.sqrt(slotnum));
      }
      if (SlotitemType.LargeFlyingBoat === type) {
        return mst.api_saku * Math.sqrt(slotnum);
      }
    }
    return 0;
  }

  /**
   * 
   */
  public static deckShipCount(deck: ApiDeckPort): number {
    return deck.api_ship.reduce((acc, id) => id > 0 ? acc + 1 : acc, 0);
  }

  /**
   * 
   * @param ship 
   */
  public static isTTPlus(ship: ShipInfo): boolean {
    // tyoutyou+ check
    // isekaini 553
    // hyuugakaini 554
    if (
      ApiRange.tyoutyou === ship.api.api_leng &&
      (553 === ship.mst.api_id || 554 === ship.mst.api_id)
    ) {
      const nisiki = ship.slots.some((slot) => slot && slot.mst.api_id === 61);
      if (nisiki) {
        const tyoutyou = ship.slots.some(
          (slot) =>
            slot &&
            SlotitemType.LargeMainGun === KcsUtil.slotitemType(slot.mst) &&
            ApiRange.tyoutyou === slot.mst.api_leng
        );
        if (tyoutyou) {
          return true;
        }
      }
    }
    return false;
  }

  public static shipMapLos(ship: ShipInfo): MapLosValue {
    return ship.slots.reduce((acc, slot) => {
      if (slot) {
        const v = KcsUtil.slotitemMapLos(slot.api, slot.mst);
        acc.map += v.map;
        acc.base += v.base;
      }
      return acc;
    }, InvalidMapLosValue());
  }

  public static deckMapLos(ships: ShipInfo[], maplos: number, teitoku_lv: number): number {
    const ship_los = ships.reduce((los, ship) => {
      const calc = KcsUtil.shipMapLos(ship);

      los += calc.map * maplos;
      los += Math.sqrt(ship.api.api_sakuteki[0] - calc.base);
      return los;
    }, 0);

    const c3 = teitoku_lv * 0.4;
    const c4 = 2 * (6 - ships.length);
    //console.log('ship_los', ship_los, 'c3', c3, 'c4', c4);
    return ship_los - c3 + c4;
  }

  /**
   * 
   * @param ship 
   */
  public static shipGetItemLos(ship: ShipInfo): number {
    return ship.slots.reduce((acc, slot, index) => {
      if (slot) {
        acc += KcsUtil.slotitemGetItemLos(slot.mst, ship.api.api_onslot[index] ?? 0);
      }
      return acc;
    }, 0);
  }

  /**
   * 
   * @param ships 
   */
  public static deckGetItemLos(ships: ShipInfo[]): number {
    return ships.reduce((acc, ship) => acc + KcsUtil.shipGetItemLos(ship), 0);
  }

  /**
   * 
   * @param rank 
   * @param info 
   */
  public static isPerfect(rank: string, info: PrvBattleInfo): boolean {
    if (rank.toLocaleUpperCase() !== 'S') {
      return false;
    }
    return !KcsUtil.battleDamaged(info.midday, info.midnight);  
  }

  /**
   * 
   * @param battle 
   */
  public static isVictory(win_rank: string | undefined): boolean {
    if (win_rank) { 
      return ['S', 'A', 'B'].includes(win_rank.toUpperCase());
    }
    return false;
  }
  
  /**
   * 
   */
  public static middayBattleDamaged(battle: ApiBattle | ApiSortieAirBattle | ApiSortieLdAirBattle | null): boolean {
    if (!battle) {
      return false;
    }

    if (KcsUtil.fDamaged(battle?.api_kouku?.api_stage3) ||
      KcsUtil.fDamaged(battle?.api_kouku?.api_stage3_combined)) {
      return true;
    }

    if (!KcsUtil.isBattle(battle)) {
      return false;
    }

    const nb = battle as ApiBattle;
    if (KcsUtil.hougekiDamaged(nb.api_hougeki1) ||
      KcsUtil.hougekiDamaged(nb.api_hougeki2) ||
      KcsUtil.hougekiDamaged(nb.api_hougeki3) ||
      KcsUtil.fDamaged(nb.api_opening_atack) ||
      KcsUtil.fDamaged(nb.api_raigeki) ||
      KcsUtil.hougekiDamaged(nb.api_opening_taisen)) {
      return true;
    }

    return false;
  }

  /**
   * 
   */
  public static midnightBattleDamaged(battle: ApiMidnightBattle | null): boolean {
    if (!battle) {
      return false;
    }

    if (KcsUtil.hougekiDamaged(battle?.api_hougeki)) {
      return true;
    }

    return false;
  }

  /**
   * 
   */
  public static battleDamaged(
    battle: ApiBattle | ApiSortieAirBattle | ApiSortieLdAirBattle | null,
    midnight: ApiMidnightBattle | null): boolean {
    if (KcsUtil.middayBattleDamaged(battle) ||
      KcsUtil.midnightBattleDamaged(midnight)) {
      return true;
    }
    return false;
  }

  /**
   * 
   */
  public static includesSlotType(slots: Slot[], types: SlotitemType[]): boolean {
    return slots.some((slot) => {
      if (slot) {
        return types.includes(KcsUtil.slotitemType(slot.mst));
      }
    });
  }

  /**
   * 
   */
  public static shipBouku(ship: ShipInfo): Bouku {
    const eq = ship.slots.reduce((acc, slot) => {
      if (slot) {
        acc.cnt++;
        const tyku = slot.mst.api_tyku;
        acc.tyku += tyku;
        if (tyku) {
          acc.kt += tyku * equipKT(slot.mst);
          acc.ktb += tyku * equipKTBonus(slot.mst);
          if (slot.api.api_level) {
            const lvs = Math.sqrt(slot.api.api_level);
            const rkt = remodelKT(slot.mst);
            if (rkt) {
              acc.ktRemodel += rkt * lvs;
            }
            const rktb = remodelKTBonus(slot.mst);
            if (rktb) {
              acc.ktbRemodel += rktb * lvs;
            }
          }
        }
      }
      return acc;
    }, { kt: 0, ktb: 0, tyku: 0, cnt: 0, ktRemodel: 0, ktbRemodel: 0 });
    //console.log(ship.mst.api_name, ship.api.api_taiku[0], eq.kt, eq.tyku);
    const kt = ship.api.api_taiku[0] - eq.tyku + eq.kt + eq.ktRemodel;
    const a = eq.cnt ? 2 : 1;
    return { 
      kt: a * Math.floor(kt / a), 
      ktRaw: ship.api.api_taiku[0] - eq.tyku + eq.kt,
      ktRemodel: eq.ktRemodel,
      ktb: Math.floor(eq.ktb + eq.ktbRemodel),
      ktbRaw: eq.ktb,
      ktbRemodel: eq.ktbRemodel,
     };
  }

  /**
   * 
   */
  public static shipKaihi(ship: ShipInfo): Kaihi {
    const eq = ship.slots.reduce((acc, slot) => {
      if (slot) {
        acc.eq += slot.mst.api_houk;
        acc.r += KcsUtil.evFromLevel(slot.mst, slot.api.api_level);
      }
      return acc;
    }, { eq: 0, r: 0});

    let kaihi = Math.floor(ship.api.api_kaihi[0] + eq.eq + Math.sqrt(ship.api.api_lucky[0] * 2));
    if (40 <= kaihi && kaihi < 65) {
      kaihi = 40.0 + 3 * Math.sqrt(kaihi - 40);
    } else if (kaihi >= 65) {
      kaihi = 55.0 + 2 * Math.sqrt(kaihi - 65);
    }

    const fualp = ship.api.api_fuel / ship.mst.api_fuel_max;
    const fual_mod =  (fualp <= 0.75 ? 75 - fualp*100 : 0);
    return {
      kaihi: kaihi + eq.r - fual_mod,
      kaihiRemodel: eq.r,
    };
  }

  /**
   * 
   */
  public static shipHit(ship: ShipInfo): Hit {
    const eq = ship.slots.reduce((acc, slot) => {
      if (slot) {
        acc.eq += slot.mst.api_houm;
        acc.r += KcsUtil.hitFromLevel(slot.mst, slot.api.api_level);
      }
      return acc;
    }, { eq: 0, r: 0});

    const hit = 90 + 2 * Math.sqrt(ship.api.api_lv) + 1.5 * Math.sqrt(ship.api.api_lucky[0]) + eq.eq + eq.r;
    const cond_mod = [1.0, 0.5, 0.8, 1.0, 1.2][KcsUtil.shipCond(ship.api)];

    return {
      hit: hit * cond_mod, 
      hitRemodel: eq.r,
    };
  }

  /**
   * 
   * @param ship 
   */
  public static shipTorHit(ship: ShipInfo): Hit {
    const eq = ship.slots.reduce((acc, slot) => {
      if (slot) {
        acc.eq += slot.mst.api_houm;
        acc.r += KcsUtil.hitTorFromLevel(slot.mst, slot.api.api_level);
      }
      return acc;
    }, { eq: 0, r: 0});
  
    const hit = 85 + 2 * Math.sqrt(ship.api.api_lv) + 1.5 * Math.sqrt(ship.api.api_lucky[0]) + eq.eq + eq.r + Math.sqrt(0.2 * ship.api.api_raisou[0]);
    const cond_mod = [1.0, 0.35, 0.7, 1.0, 1.35][KcsUtil.shipCond(ship.api)];
  
    return {
      hit: hit * cond_mod, 
      hitRemodel: eq.r,
    };
  }

  /**
   * 
   */
  public static shipAswHit(ship: ShipInfo): Hit {
    const eq = ship.slots.reduce((acc, slot) => {
      if (slot) {
        acc.eq += slot.mst.api_houm;
        if (this.slotitemType(slot.mst) === SlotitemType.Sonar) {
          acc.asw += slot.mst.api_tais;
        }
        acc.r += KcsUtil.hitAswFromLevel(slot.mst, slot.api.api_level);
      }
      return acc;
    }, { eq: 0, r: 0, asw: 0});

    const hit = 80 + Math.sqrt(2 * ship.api.api_lv) + Math.sqrt(1.5 * ship.api.api_lucky[0]) + eq.eq + eq.asw + eq.r;
    const cond_mod = [1.0, 0.5, 0.8, 1.0, 1.2][KcsUtil.shipCond(ship.api)];
    return {
      hit: hit * cond_mod, 
      hitRemodel: eq.r,
    };
  }

  /**
   * 
   */
  public static shipKoteiGekitui(info: ShipInfoSp, ships: ShipInfoSp[]): number {
    const deck_ktb = KcsUtil.deckKantaiBouku(ships);
    return Math.floor((info.bouku.kt+(deck_ktb*2.0/1.3))/10.0);
  }

  /**
   * 
   */
  public static deckKantaiBouku(ships: ShipInfoSp[]): number {
    if (! ships.length) {
      return 0;
    }
    let deck_ktb = ships[0].deck_ktb;
    if (! deck_ktb) {
      deck_ktb = ships.reduce((acc, ship) => acc + ship.bouku.ktb, 0);
      ships[0].deck_ktb = deck_ktb;
    }
    return deck_ktb;
  }

  /**
   * 
   */
  public static spTKCutin(info: ShipInfo): TKCutinState | undefined {
    const tk = tkCutin(info);
    if (! tk.type.length) {
      return ;
    }
    return tk;
  }

   /**
   * 
   */
  public static spSenseiRaigeki(info: ShipInfo): SenseiRaigekiState | undefined {
    switch (info.mst.api_stype) {
      case ApiShipType.suibo:
      case ApiShipType.raijyun:
      case ApiShipType.keijyun:
        break;
      case ApiShipType.sensuikan:
      case ApiShipType.sensui_kuubo:
        if (info.api.api_lv >= 10) {
          return { type: SenseiRaigekiType.auto, enable: true };
        }
        break;
      default:
        return;
    }

    if (info.slots.some((slot) => isSlotitemId(slot, [41, 309, 364]))) {
      return { type: SenseiRaigekiType.byequip, enable: true };
    }
  }

  /**
   * 
   */
  public static spSenseiTaisen(info: ShipInfo): SenseiTaisenState | undefined {
    const ship = info.api;
    const mst = info.mst;

    // auto
    if (mst.api_id === 141 || // isuzukaini
      mst.api_id === 478 || // tatutakaini
      mst.api_id === 394 || // jerviskai
      mst.api_id === 893 || // januskai
      mst.api_id === 681 || // samu kai
      KcsUtil.isFletcherType(mst.api_id)) { // fletcher mk.II
      return { type: SenseiTaisenType.auto, enable: true };
    }

    // equip
    switch (mst.api_stype) {
      case ApiShipType.kutikukan:
      case ApiShipType.keijyun:
      case ApiShipType.renjyun:
      case ApiShipType.raijyun:
      case ApiShipType.hokyuukan:
        if (ship.api_taisen[0] >= 100 &&
          KcsUtil.includesSlotType(info.slots, [SlotitemType.Sonar, SlotitemType.LargeSonar])) {
          return { type: SenseiTaisenType.byequip, enable: true };
        }
        return;

      case ApiShipType.kaiboukan:
        if (ship.api_taisen[0] >= 60 &&
          KcsUtil.includesSlotType(info.slots, [SlotitemType.Sonar])) {
          return { type: SenseiTaisenType.byequip, enable: true };
        }
        if (ship.api_taisen[0] >= 75 &&
          info.slots.reduce((acc, slot) => {
            if (slot) {
              acc += slot.mst.api_tais;
            }
            return acc;
          }, 0) >= 4) {
          return { type: SenseiTaisenType.byequip, enable: true };
        }
        return;
    }

    // keikuubo
    const keibo_check = (info: ShipInfo, limit: number, with_soner: boolean,
      equip_limit: number, slot_types: SlotitemType[]): SenseiTaisenState | undefined => {
      if (info.api.api_taisen[0] >= limit) {
        const onslot = info.api.api_onslot;
        const ret = info.slots.reduce((acc, slot, index) => {
          if (slot) {
            const type = KcsUtil.slotitemType(slot.mst);
            if ([SlotitemType.Sonar as number, SlotitemType.LargeSonar].includes(type)) {
              acc.s++;
            }
            if ([SlotitemType.Autogyro as number, SlotitemType.ASBAircraft].includes(type)) {
              acc.a++;
              if (onslot[index] ?? 0) {
                acc.ae++;
              }
            }
            if (slot.mst.api_tais > equip_limit && slot_types.includes(type)) {
              acc.a++;
              if (onslot[index] ?? 0) {
                acc.ae++;
              }
            }
          }
          return acc;
        }, { s: 0, a: 0, ae: 0 });
        if ((!with_soner || ret.s > 0) && ret.a > 0) {
          return { type: SenseiTaisenType.byequip, enable: ret.ae > 0 };
        }
      }
    };

    // taiyoukai/taiyoukaini
    // sinyoukai/sinyoukaini
    if (mst.api_id === 380 || // taiyoukai
      mst.api_id === 529 || // taiyoukaini
      mst.api_id === 381 || // sinyoukai
      mst.api_id === 536) { // sinyoukaini

      const ret = keibo_check(info, 0, false, 0, [SlotitemType.DiveBomber, SlotitemType.TorpedoBomber]);
      if (ret) {
        return ret;
      }
    }

    if (mst.api_stype === ApiShipType.kei_kuubo) {

      let ret = keibo_check(info, 100, true, 0, [SlotitemType.DiveBomber, SlotitemType.TorpedoBomber]);
      if (ret) {
        return ret;
      }
      ret = keibo_check(info, 65, false, 6, [SlotitemType.TorpedoBomber]);
      if (ret) {
        return ret;
      }
      ret = keibo_check(info, 50, true, 6, [SlotitemType.TorpedoBomber]);
      if (ret) {
        return ret;
      }
      return;
    }

    // hyuugakaini
    if (mst.api_id === 554) {
      const onslot = info.api.api_onslot;
      const ret = info.slots.reduce((acc, slot, index) => {
        if (slot) {
          if (slot.mst.api_id === 69 || // kago
            slot.mst.api_id === 324 || // ogokai
            slot.mst.api_id === 325 // ogokaini
          ) {
            acc.t1++;
            if (onslot[index] ?? 0) {
              acc.te1++;
            }
          }
          if (slot.mst.api_id === 326 || // s-51j
            slot.mst.api_id === 327 // s-51jkai
          ) {
            acc.t2++;
            if (onslot[index] ?? 0) {
              acc.te2++;
            }
          }
        }
        return acc;
      }, { t1: 0, t2: 0, te1: 0, te2: 0 });
      if (ret.t1 >= 2 || ret.t2 >= 1) {
        return { type: SenseiTaisenType.byequip, enable: ret.te1 > 0 && ret.te2 > 0 };
      }
    }
  }

  /**
   * 
   */
  public static spFD(info: ShipInfo): FDState | undefined {
    switch (info.mst.api_stype) {
      case ApiShipType.kei_kuubo:
      case ApiShipType.seiki_kuubo:
      case ApiShipType.soukou_kuubo:
      case ApiShipType.suibo:
      case ApiShipType.koukuu_senkan:
      case ApiShipType.koujyun:
        break;
      default:
        return ;
    }
    // 12cm30連装噴進砲改二
    if (! info.slots.some((slot) => slot && slot.mst.api_id === 274)) {
      return ;
    }
    return { 
      enable: true,
    };
  }

  /**
   * 
   */
  public static spYCutin(info: ShipInfo): { type: YCutin, enable: boolean }[] {
    switch (info.mst.api_stype) {
      case ApiShipType.kei_kuubo:
      case ApiShipType.seiki_kuubo:
      case ApiShipType.soukou_kuubo:
        return [];
      default:
        break;
    }

    const iskutiku = (ApiShipType.kutikukan === info.mst.api_stype);
    const cnt = info.slots.reduce((acc, slot) => {
      if (slot) {
        const type = KcsUtil.slotitemType(slot.mst);
        if (KcsUtil.hasMainGun(type)) {
          acc.s++;
        }
        if (SlotitemType.SecondaryGun === type) {
          acc.f++;
        }
        if (SlotitemType.Torpedo === type) {
          acc.g++;
        }
        if (iskutiku) {
          if (KcsUtil.hasRadar(type) && slot.mst.api_saku >= 5) {
            acc.d++;
          }
          if (SlotitemType.ShipPersonnel === type) {
            acc.m++;
          }
          // D型改二
          if (slot.mst.api_id === 267) {
            acc.s2++;
          }
          // D型改三
          if (slot.mst.api_id === 366) {
            acc.s3++;
          }
        }
        if (SlotitemType.SubmarineTorpedo === type) {
          acc.sg++;
        }
        if (SlotitemType.SubmarineEquipment === type) {
          acc.sd++;
        }
      }
      return acc;
    }, { s: 0, f: 0, g: 0, d: 0, m: 0, s2: 0, s3: 0, sg: 0, sd: 0 });

    let ret: YCutin[] = [];
    if (cnt.s >= 3) {
      ret.push(YCutin.SYU3);
    }
    if (cnt.s >= 2 && cnt.f > 0) {
      ret.push(YCutin.SYU_FUKU);
    }
    if (cnt.g >= 2) {
      ret.push(YCutin.GYO2);
    }
    if (cnt.s > 0 && cnt.g > 0) {
      ret.push(YCutin.SYU_GYO);
    }
    if (iskutiku) {
      if (cnt.g > 0 && cnt.m > 0 && cnt.d > 0) {
        ret.push(YCutin.GYO_MI_DEN);
      }
      if (cnt.s > 0 && cnt.g > 0 && cnt.d > 0) {
        ret.push(YCutin.SYU_GYO_DEN);
      }
    }

    if (cnt.sg > 0 && cnt.sd > 0) {
      ret.push(YCutin.SGYO_SDEN);
    }
    if (cnt.sg >= 2) {
      ret.push(YCutin.SGYO2);
    }

    if (!ret.length) {
      if (cnt.s >= 2 || cnt.f >= 2) {
        ret.push(YCutin.RENGEKI);
      }
    }

    if (ret.length > 0) {
      ret.sort((a, b) => a - b);
      let multi = ret.filter((ci) => [YCutin.SYU_GYO_DEN as number, YCutin.GYO_MI_DEN].includes(ci));
      if (multi.length > 0) {
        const single = ret.filter((ci) => ![YCutin.SYU_GYO_DEN as number, YCutin.GYO_MI_DEN].includes(ci));

        // dhou check
        if (multi.includes(YCutin.SYU_GYO_DEN)) {
          if (cnt.s2 > 0 && cnt.s3 > 0) {
            multi = multi.map((ci) => ci === YCutin.SYU_GYO_DEN ? YCutin.SYU_GYO_DEN2_3 : ci);
          } else if (cnt.s3 > 0) {
            multi = multi.map((ci) => ci === YCutin.SYU_GYO_DEN ? YCutin.SYU_GYO_DEN3 : ci);
          } else if (cnt.s2 > 0) {
            multi = multi.map((ci) => ci === YCutin.SYU_GYO_DEN ? YCutin.SYU_GYO_DEN2 : ci);
          }
        }
        ret = single.concat(multi);
        ret.sort((a, b) => a - b);
      } else {
        ret = [ret[0]];
      }
      return ret.map((ci) => { return { type: ci, enable: true } });
    }
    return [];
  }

  /**
   * 
   */
  public static spYSCutin(info: ShipInfo): { type: YSCutin, enable: boolean }[] {
    switch (info.mst.api_stype) {
      case ApiShipType.kei_kuubo:
      case ApiShipType.seiki_kuubo:
      case ApiShipType.soukou_kuubo:
        break;
      default:
        return [];
    }

    const yasen_kuubo = isShipId(info.mst.api_id, [545, 599]);
    const onslot = info.api.api_onslot;
    // etc slotitem id
    const hids = [242, 243, 244, 154, 320];
    // suisei
    const suids = [320];
    // yasen youin
    const yids = [258, 259];
    const cnt = info.slots.reduce((acc, slot, index) => {
      if (slot) {
        const imgtype = KcsUtil.slotitemImgType(slot.mst);
        if (imgtype === SlotitemImgType.yasen) {
          acc.s++;
          if (onslot[index] ?? 0) {
            acc.se++;
          }
        }
        if (imgtype === SlotitemImgType.yakou) {
          acc.k++;
          if (onslot[index] ?? 0) {
            acc.ke++;
          }
        }
        if (suids.includes(slot.mst.api_id)) {
          acc.sui++;
          if (onslot[index] ?? 0) {
            acc.suie++;
          }
        }
        if (imgtype === SlotitemImgType.yasen ||
          imgtype === SlotitemImgType.yakou ||
          suids.includes(slot.mst.api_id) ||
          hids.includes(slot.mst.api_id)) {
          acc.h++;
          if (onslot[index] ?? 0) {
            acc.he++;
          }
        }
        if (!yasen_kuubo) {
          if (yids.includes(slot.mst.api_id)) {
            acc.y++;
          }
        }
      }
      return acc;
    }, { s: 0, k: 0, sui: 0, h: 0, y: yasen_kuubo ? 1 : 0, se: 0, ke: 0, suie: 0, he: 0 });

    const ret = [];
    if (cnt.y > 0) {
      if (cnt.s >= 2 && cnt.k > 0) {
        ret.push({ type: YSCutin.SEN2_KOU, enable: cnt.se >= 2 && cnt.ke > 0 });
      }
      if (cnt.s > 0 && cnt.k > 0) {
        ret.push({ type: YSCutin.SEN_KOU, enable: cnt.se > 0 && cnt.ke > 0 });
      }
      if (cnt.s > 0 && cnt.sui > 0) {
        ret.push({ type: YSCutin.SEN_SUI, enable: cnt.se > 0 && cnt.suie > 0 });
      }
      if (cnt.s === 0 && cnt.k > 0 && cnt.sui > 0) {
        ret.push({ type: YSCutin.KOU_SUI, enable: cnt.ke > 0 && cnt.suie > 0 });
      }
      if (cnt.s > 0 && (cnt.h >= 3)) {
        ret.push({ type: YSCutin.SEN_ETC2, enable: cnt.se > 0 && cnt.he >= 3 });
      }

      if (!ret.length) {
        if (cnt.s > 0 || cnt.k > 0) {
          ret.push({ type: YSCutin.YAKOU, enable: cnt.se > 0 && cnt.ke > 0 });
        }
      }
    }
    return ret;
  }

  /**
   * 
   */
  public static spFACutin(info: ShipInfo): { type: FACutin, enable: boolean }[] {
    switch (info.mst.api_stype) {
      case ApiShipType.jyuujyun: // 重巡洋艦
      case ApiShipType.koujyun: // 航空巡洋艦
      case ApiShipType.keijyun: // 軽巡洋艦
      case ApiShipType.kousoku_senkan: // 戦艦
      case ApiShipType.teisoku_senkan: // 戦艦
      case ApiShipType.koukuu_senkan: // 航空戦艦
      case ApiShipType.tyoudokyuu_senkan:// 超弩級戦艦
      case ApiShipType.suibo: // 水上機母艦
      case ApiShipType.hokyuukan:  // 補給艦
      case ApiShipType.renjyun: // 練習巡洋艦
      case ApiShipType.sensuibokan: // 潜水母艦
        break;
      default:
        return [];
    }

    const onslot = info.api.api_onslot;
    const isegatakaini = (info.mst.api_id === 553 || info.mst.api_id === 554);
    const cnt = info.slots.reduce((acc, slot, index) => {
      if (slot) {
        const type = KcsUtil.slotitemType(slot.mst);
        if (KcsUtil.hasMainGun(type)) {
          acc.s++;
        }
        if (SlotitemType.SecondaryGun === type) {
          acc.f++;
        }
        if (SlotitemType.APShell === type) {
          acc.t++;
        }
        if (KcsUtil.hasRadar(type)) {
          acc.d++;
        }
        if (KcsUtil.hasFASeaplane(type)) {
          acc.tei++;
          if (onslot[index] ?? 0) {
            acc.teie++;
          }
        }
        if (isegatakaini) {
          if (type === SlotitemType.DiveBomber && KcsUtil.hasSuisei634(slot.mst.api_id)) {
            acc.sui++;
            if (onslot[index] ?? 0) {
              acc.suie++;
            }
          }
          if (type === SlotitemType.SeaplaneBomber && KcsUtil.hasZuiun(slot.mst.api_id)) {
            acc.zui++;
            if (onslot[index] ?? 0) {
              acc.zuie++;
            }
          }
        }
      }
      return acc;
    }, { s: 0, f: 0, t: 0, d: 0, tei: 0, teie: 0, sui: 0, suie: 0, zui: 0, zuie: 0 });

    const ret = [];
    if (cnt.tei > 0) {
      const enable = cnt.teie > 0;
      if (cnt.s >= 2 && cnt.t > 0) {
        ret.push({ type: FACutin.SYU_SYU, enable: enable });
      }
      if (cnt.s > 0 && cnt.f > 0 && cnt.t > 0) {
        ret.push({ type: FACutin.SYU_TEK, enable: enable });
      }
      if (cnt.s > 0 && cnt.f > 0 && cnt.d > 0) {
        ret.push({ type: FACutin.SYU_DEN, enable: enable });
      }
      if (cnt.s > 0 && cnt.f > 0) {
        ret.push({ type: FACutin.SYU_FUK, enable: enable });
      }
      if (cnt.s >= 2) {
        ret.push({ type: FACutin.RENGEKI, enable: enable });
      }
    }
    if (isegatakaini) {
      if (cnt.s > 0 && cnt.sui >= 2) {
        ret.push({ type: FACutin.KAI_KUU, enable: cnt.suie >= 2 });
      }
      if (cnt.s > 0 && cnt.zui >= 2) {
        ret.push({ type: FACutin.ZUI_UN, enable: cnt.zuie >= 2 });
      }
    }
    return ret;
  }

  /**
   * 
   */
  public static spAACutin(info: ShipInfo): { type: AACutin, enable: boolean }[] {
    switch (info.mst.api_stype) {
      case ApiShipType.kei_kuubo:
      case ApiShipType.seiki_kuubo:
      case ApiShipType.soukou_kuubo:
        break;
      default:
        return [];
    }

    const onslot = info.api.api_onslot;
    const cnt = info.slots.reduce((acc, slot, index) => {
      if (slot) {
        const type = KcsUtil.slotitemType(slot.mst);
        if (type === SlotitemType.Fighter) {
          acc.f++;
          if (onslot[index] ?? 0) {
            acc.fe++;
          }
        }
        if (type === SlotitemType.DiveBomber) {
          acc.b++;
          if (onslot[index] ?? 0) {
            acc.be++;
          }
        }
        if (type === SlotitemType.TorpedoBomber) {
          acc.a++;
          if (onslot[index] ?? 0) {
            acc.ae++;
          }
        }
      }
      return acc;
    }, { f: 0, b: 0, a: 0, fe: 0, be: 0, ae: 0 });

    const ret = [];
    if (cnt.f > 0 && cnt.b > 0 && cnt.a > 0) {
      ret.push({ type: AACutin.FBA, enable: cnt.fe > 0 && cnt.be > 0 && cnt.ae > 0 });
    }
    if (cnt.b >= 2 && cnt.a > 0) {
      ret.push({ type: AACutin.BBA, enable: cnt.be >= 2 && cnt.ae > 0 });
    }
    if (cnt.b > 0 && cnt.a > 0) {
      ret.push({ type: AACutin.BA, enable: cnt.b > 0 && cnt.ae > 0 });
    }
    return ret;
  }

  /**
   * 
   */
  public static spTHCutin(info: ShipInfo, ships: ShipInfo[]): { type: THCutin, enable: boolean } | undefined {

    const top = ships[0];

    if (top.api.api_id !== info.api.api_id) {
      return;
    }

    // nelson touch
    if (isShipId(top.mst.api_id, [571, 576])) {
      if (ships.length === 6 &&
        !ships.some((ship) => isShipType(ship, [ApiShipType.sensuikan, ApiShipType.sensui_kuubo])) &&
        !isShipType(ships[2], [ApiShipType.kei_kuubo, ApiShipType.seiki_kuubo, ApiShipType.soukou_kuubo]) &&
        !isShipType(ships[4], [ApiShipType.kei_kuubo, ApiShipType.seiki_kuubo, ApiShipType.soukou_kuubo])) {
        return { type: THCutin.Nelson, enable: true };
      }
    }

    // colorado
    if (isShipId(top.mst.api_id, [601, 1496])) {
      if (ships.length === 6 &&
        !ships.some((ship) => isShipType(ship, [ApiShipType.sensuikan, ApiShipType.sensui_kuubo])) &&
        isShipType(ships[1], [ApiShipType.kousoku_senkan, ApiShipType.teisoku_senkan, ApiShipType.koukuu_senkan]) &&
        isShipType(ships[2], [ApiShipType.kousoku_senkan, ApiShipType.teisoku_senkan, ApiShipType.koukuu_senkan])) {
        return { type: THCutin.Colorado, enable: true };
      }
    }

    // nagato, mutu
    if (isShipId(top.mst.api_id, [541, 573])) {
      if (ships.length === 6 &&
        !ships.some((ship) => isShipType(ship, [ApiShipType.sensuikan, ApiShipType.sensui_kuubo])) &&
        isShipType(ships[1], [ApiShipType.kousoku_senkan, ApiShipType.teisoku_senkan, ApiShipType.koukuu_senkan])) {
        return { type: top.mst.api_id === 541 ? THCutin.Nagato : THCutin.Mutu, enable: true };
      }
    }

    // kongou
    if (isShipId(top.mst.api_id, [591])) {
      if (ships.length >= 5 &&
        isShipId(ships[1].mst.api_id, [151, 364, 439, 592]) &&
        !ships.some((ship) => isShipType(ship, [ApiShipType.sensuikan, ApiShipType.sensui_kuubo]))) {
        return { type: THCutin.Kongou, enable: true };
      }
    }

    // hiei
    if (isShipId(top.mst.api_id, [592])) {
      if (ships.length >= 5 &&
        isShipId(ships[1].mst.api_id, [152, 591]) &&
        !ships.some((ship) => isShipType(ship, [ApiShipType.sensuikan, ApiShipType.sensui_kuubo]))) {
        return { type: THCutin.Hiei, enable: true };
      }
    }
  }

  /**
   * 
   */
  public static spAll(ship: ShipInfo, ships: ShipInfo[]): SpState {

    // tiku cutin
    const tk = KcsUtil.spTKCutin(ship);

    // thcutin
    const th = KcsUtil.spTHCutin(ship, ships);

    // sensei taisen
    const st = KcsUtil.spSenseiTaisen(ship);

    // sensei raigeki
    const sr = KcsUtil.spSenseiRaigeki(ship);

    // facutin
    const fa = KcsUtil.spFACutin(ship);

    // aacutin
    const aa = KcsUtil.spAACutin(ship);
    
    // ycutin
    const y = KcsUtil.spYCutin(ship);

    // yscutin
    const ys = KcsUtil.spYSCutin(ship);

    // funsindanmaku
    const fd = KcsUtil.spFD(ship);

    return {
      tk: tk,
      th: th,
      st: st,
      sr: sr,
      fa: fa,
      aa: aa,
      y: y,
      ys: ys,
      fd: fd
    };
  }


  // rate 

  /**
   * 
   */
  public static rateTK(tk: TKCutin): number {
    return TKCutinConsts[tk].rate/101.0;
  }

  /**
   * 
   */
  public static rateTHNelson(ships: ShipInfoSp[]): number {
    return (1.1 * (
      Math.sqrt(ships[0].api.api_lv) + 
    Math.sqrt(ships[2].api.api_lv) +
    Math.sqrt(ships[4].api.api_lv)) + 2.6 * Math.sqrt(ships[0].api.api_lucky[0]) + 16)/100;
  }

  /**
   * https://twitter.com/Xe_UCH/status/1181509684684980224
   */
  public static rateTH(info: ShipInfoSp, ships: ShipInfoSp[]) : THCutinRate | undefined {
    if (! info.sp.th) {
      return ;
    }
    if (info.sp.th.type !== THCutin.Nelson) {
      return {
        type: info.sp.th.type,
        enable: info.sp.th.enable, 
        rate: NaN,
      };
    }

    return {
      type: info.sp.th.type,
      enable: info.sp.th.enable, 
      rate: KcsUtil.rateTHNelson(ships)
    };
  }


  public static deckFALos(ships: ShipInfoSp[]): number {
    const calc = ships.reduce((acc, ship) => {
      acc.l += calcShipLos(ship);

      const onslot = ship.api.api_onslot;
      acc.t += ship.slots.reduce((t, slot, index) => {
        if (slot) {
          if (slot.mst.api_saku && KcsUtil.hasFASeaplane(KcsUtil.slotitemType(slot.mst))) {
            t += Math.floor(Math.sqrt(onslot[index] ?? 0)) * slot.mst.api_saku;
          }
        }
        return t;
      }, 0);
      return acc;
    }, { l: 0, t: 0 });

    const A = calc.l + calc.t;
    return Math.floor(Math.sqrt(A) + 0.1 * A);
  }

  /**
   * 
   */
  public static calcFAAA(info: ShipInfoSp, ships: ShipInfoSp[]): number[] {
    let hatakan_hosei = 0;
    if (ships[0].api.api_id === info.api.api_id) {
      hatakan_hosei = 15;
    }

    const luck = Math.floor(Math.sqrt(info.api.api_lucky[0]) + 10);
    let deck_los = ships[0].deck_los;
    if (! deck_los) {
      deck_los = KcsUtil.deckFALos(ships);
      ships[0].deck_los = deck_los;
    }
    const equip_los = info.slots.reduce((acc, slot) => acc + (slot ? slot.mst.api_saku : 0), 0);
    const kakuho = Math.floor(luck + 0.7 * (deck_los + 1.6 * equip_los) + 10) + hatakan_hosei;
    const yuusei = Math.floor(luck + 0.6 * (deck_los + 1.2 * equip_los)) + hatakan_hosei;  
    //console.log('decklos', deck_los, 'equip_los', equip_los, 'luck:', luck, 'kakuho:', Math.floor(kakuho*1000)/1000, 'yuusei:', Math.floor(yuusei*1000)/1000);
    return [kakuho, yuusei];
  }


  /**
   * 
   */
  public static rateFA(info: ShipInfoSp, ships: ShipInfoSp[]): FACutinRate[]{
    if (! info.sp.fa.length) {
      return [];
    }
    const ks = KcsUtil.calcFAAA(info, ships);
    return info.sp.fa.map((ci) => ({
        type: ci.type,
        enable: ci.enable,
        rate: [ ks[0]/FACutinConst[ci.type], ks[1]/FACutinConst[ci.type] ],
      }));
  }

  /**
   * 
   */
  public static rateAA(info: ShipInfoSp, ships: ShipInfoSp[]): AACutinRate[] {
    if (! info.sp.aa.length) {
      return [];
    }
    const ks = KcsUtil.calcFAAA(info, ships);
    return info.sp.aa.map((ci) => ({
        type: ci.type,
        enable: ci.enable,
        rate: [ ks[0]/AACutinConst[ci.type], ks[1]/AACutinConst[ci.type] ],
      }));
  }

  /**
   * 
   */
  public static rateY(info: ShipInfoSp, ships: ShipInfoSp[]): YCutinRate[] {
    if (! info.sp.y.length) {
      return [];
    }

    const ci = calcCI(info, ships);
    //console.log('ciy:', ci, info.mst.api_name);
    return info.sp.y.map((y) => ({
        type: y.type,
        enable: y.enable,
        rate: y.type === YCutin.RENGEKI ? 0.99 : ci/YCutinConst[y.type]
      }));
  }

  /**
   * 
   */
  public static rateYS(info: ShipInfoSp, ships: ShipInfoSp[]): YSCutinRate[] {
    if (! info.sp.ys.length) {
      return [];
    }
    const ci = calcCI(info, ships);
    //console.log('ciys:', ci, info.mst.api_name);
    return info.sp.ys.map((y) => ({
        type: y.type,
        enable: y.enable,
        rate: y.type === YSCutin.YAKOU ? 1 : ci/YSCutinConst[y.type]
      }));
  }

  /**
   * 
   */
  public static rateFD(info: ShipInfoSp): FDRate | undefined {
    if (! info.sp.fd) {
      return ;
    }

    let rate = (0.9 * info.api.api_lucky[0] + info.bouku.kt) / 281.0;
    const cnt = info.slots.reduce((acc, slot) => (slot && slot.mst.api_id === 274) ? acc+1 : acc, 0);
    if (cnt === 2) {
      rate += 0.15;
    }
    if (cnt >= 3) {
      rate += 0.30;
    }
    //  伊勢改, 日向改, 伊勢改二, 日向改二
    if (isShipId(info.mst.api_id, [82, 88, 553,554])) {
      rate += 0.25;
    }

    return {
      enable: info.sp.fd.enable,
      rate: Math.min(1, rate),
    }
  }

  /**
   * 
   * @param v 
   */
  public static isBattle(v: ApiBattleBase | null): boolean {
    return !!v && !KcsUtil.isCombinedBattle(v) && Array.isArray((v as any).api_hourai_flag);
  }

  /**
   * 
   * @param v 
   */
  public static isBattleNormal(v: ApiBattleBase | null): boolean {
    return !!v && 'api_kouku' in v;
  }

  /**
   * 
   * @param v 
   */
  public static isAirBattle(v: ApiBattleBase): boolean {
    return Array.isArray((v as any).api_stage_flag2);
  }

  /**
   * 
   * @param v 
   */
  public static isMidnightSpBattle(v: ApiBattleBase): boolean {
    return 'api_n_support_info' in v;
  }
  
  /**
   * 
   * @param v 
   */
  public static isCombinedBattle(v: ApiBattleBase | null): boolean {
    return !!v && Array.isArray((v as any).api_ship_ke_combined);
  }

  /**
   * 
   * @param v 
   */
  public static isCombinedCombinedBattle(v: ApiBattleBase): boolean {
    return this.isCombinedBattle(v) && Array.isArray((v as any).api_f_nowhps_combined);
  }
  
  /**
   * 
   * @param v 
   */
  public static fDamaged(v: ApiStage3 | ApiRaigeki | null | undefined): boolean {
    return v?.api_fdam?.some(d => !!Math.floor(d)) ?? false;
  }

  /**
   * 
   * @param hougeki 
   */
  public static hougekiDamaged(hougeki: ApiHougeki | ApiHougekiMidnight | null | undefined): boolean {
    if (!hougeki) {
      return false;
    }
    const at_eflag = hougeki.api_at_eflag;
    const damage = hougeki.api_damage;
    return at_eflag.some((eflag, i) => {
      if (eflag) {
        return damage[i]?.some(d => !!Math.floor(d)) ?? false;
      }
    });
  }

  /**
   * 
   */
  public static questlistInProgress(list: ApiQuestList): ApiQuest[] {
    return list.api_list.filter((quest) => quest.api_state !== ApiQuestState.normal);
  }

  /**
   * 
   */
  public static questCount(quest: ApiQuest): number {
    if (quest.api_state === ApiQuestState.completed) {
      return 100;
    }
    return [0, 50, 80][quest.api_progress_flag] ?? 0;
  }
}

/*
export interface EShipStatus {
  readonly api_id: number;
  readonly api_lv: number; // lv
  readonly api_taik: number; // 耐久
  readonly api_souk: number; // 装甲
  readonly api_houg: number; // 火力
  readonly api_raig: number; // 雷撃
  readonly api_tyku: number; // 対空
  readonly api_kaih: number; // 回避
  readonly api_luck: number; // 運
  readonly api_leng: ApiRange; // 射程
  readonly api_slot: number[]; // 装備スロット
  readonly api_onslot: number[]; // 搭載機
  readonly api_aa: number; // 制空値
}

export const InvalidEShipStatus = (): EShipStatus => {
  return {
    api_id: 0,
    api_lv: NaN,
    api_taik: NaN,
    api_souk: NaN,
    api_houg: NaN,
    api_raig: NaN,
    api_tyku: NaN,
    api_kaih: NaN,
    api_luck: NaN,
    api_leng: ApiRange.invalid,
    api_slot: [],
    api_onslot: [],
    api_aa: NaN,
  };
};
*/

export interface MstShipBase {
  readonly api_id: number;
  readonly api_sort_id: number;
  readonly api_name: string;
  readonly api_yomi: string;
  readonly api_stype: ApiShipType;
  readonly api_ctype: number;
  readonly api_soku: number;
  readonly api_slot_num: number;
}

export const MstShipIdBeginEnemy = 1501 as const;

export interface MstShip extends MstShipBase {
  readonly api_sortno: number;
  readonly api_afterlv: number;
  readonly api_aftershipid: string;
  readonly api_taik: number[];
  readonly api_souk: number[];
  readonly api_houg: number[];
  readonly api_raig: number[];
  readonly api_tyku: number[];
  readonly api_luck: number[];
  readonly api_leng: ApiRange;
  readonly api_maxeq: number;
  readonly api_buildtime: number;
  readonly api_broken: number[];
  readonly api_powup: number[];
  readonly api_backs: number;
  readonly api_getmes: string;
  readonly api_afterfuel: number;
  readonly api_afterbull: number;
  readonly api_fuel_max: number;
  readonly api_bull_max: number;
  readonly api_voicef: number;
}

const InvalidMstShip = (): MstShip => ({
  api_id: 0,
  api_sortno: 0,
  api_sort_id: 0,
  api_name: '',
  api_yomi: '',
  api_stype: 0,
  api_ctype: 0,
  api_afterlv: 0,
  api_aftershipid: '',
  api_taik: [0, 0],
  api_souk: [0, 0],
  api_houg: [0, 0],
  api_raig: [0, 0],
  api_tyku: [0, 0],
  api_luck: [0, 0],
  api_soku: 0,
  api_leng: ApiRange.invalid,
  api_slot_num: 0,
  api_maxeq: 0,
  api_buildtime: 0,
  api_broken: [0, 0, 0, 0],
  api_powup: [0, 0, 0, 0],
  api_backs: 0,
  api_getmes: '',
  api_afterfuel: 0,
  api_afterbull: 0,
  api_fuel_max: 0,
  api_bull_max: 0,
  api_voicef: 0,
});

export const InvalidMstShipBase = () : MstShipBase => ({
  api_id: 0,
  api_sort_id: 0,
  api_name: '',
  api_yomi: '',
  api_stype: 0,
  api_ctype: 0,
  api_soku: 0,
  api_slot_num: 0,
});

export interface MstSlotitemEquiptype {
  readonly api_id: number;
  readonly api_name: string;
  readonly api_show_flg: number;
}

export interface MstEquipExslotShip {
  readonly api_slotitem_id: number;
  readonly api_ship_ids: number[];
}

export interface MstStype {
  readonly api_id: number;
  readonly api_sortno: number;
  readonly api_name: string;
  readonly api_scnt: number;
  readonly api_kcnt: number;
  readonly api_equip_type: number[];
}

type SlotItemType = [number, number, SlotitemType, SlotitemImgType, number];
export interface MstSlotitem {
  readonly api_id: number;
  readonly api_sortno: number;
  readonly api_name: string;
  readonly api_type: SlotItemType;
  readonly api_taik: number; //
  readonly api_souk: number; // 装甲
  readonly api_houg: number; // 火力
  readonly api_raig: number; // 雷撃
  readonly api_soku: number; // 
  readonly api_baku: number; // 爆装
  readonly api_tyku: number; // 対空
  readonly api_tais: number; // 対潜
  readonly api_atap: number; // 
  readonly api_houm: number; // 命中/対爆
  readonly api_raim: number; // 雷撃命中？
  readonly api_houk: number; // 回避/追撃
  readonly api_raik: number; // 雷撃回避？
  readonly api_bakk: number; // 爆撃回避？
  readonly api_saku: number; // 索敵
  readonly api_sakb: number; // 索敵妨害？
  readonly api_luck: number; // 運
  readonly api_leng: ApiRange; // 射程
  readonly api_rare: number; // レア
  readonly api_distance?: number; // 行動半径
  readonly api_broken: number[];
  readonly api_usebull: string;
  readonly api_version: number;
}

export interface MstFurnituregraph {
  readonly api_id: number;
  readonly api_type: number;
  readonly api_no: number;
  readonly api_filename: string;
  readonly api_version: string;
}

export interface MstUseitem {
  readonly api_id: number;
  readonly api_usetype: number;
  readonly api_category: number;
  readonly api_name: string;
  readonly api_description: string[];
  readonly api_price: number;
}

export interface MstPayitem {
  readonly api_id: number;
  readonly api_type: number;
  readonly api_name: string;
  readonly api_description: string;
  readonly api_shop_description: string;
  readonly api_item: number[];
  readonly api_price: number;
}

export interface MstItemShop {
  readonly api_cabinet_1: number[];
  readonly api_cabinet_2: number[];
}

export interface MstMaparea {
  readonly api_id: number;
  readonly api_name: string;
  readonly api_type: ApiMapAreaType; // 0: normal, 1: event
}

export const ApiMapAreaType = {
  normal : 0,
  event : 1,
} as const;
export type ApiMapAreaType = Unpacked<typeof ApiMapAreaType>;

export interface MstMapinfo {
  readonly api_id: number;
  readonly api_maparea_id: number;
  readonly api_no: number;
  readonly api_name: string;
  readonly api_level: number;
  readonly api_opetext: string;
  readonly api_infotext: string;
  readonly api_item: number[];
  readonly api_max_maphp: null,
  readonly api_required_defeat_count: null,
  readonly api_sally_flag: number[];
}

export interface MstMapbgm {
  readonly api_id: number;
  readonly api_maparea_id: number;
  readonly api_no: number;
  readonly api_moving_bgm: number;
  readonly api_map_bgm: number[];
  readonly api_boss_bgm: number[];
}

export interface MstMission {
  readonly api_id: number;
  readonly api_disp_no: string;
  readonly api_maparea_id: number;
  readonly api_name: string;
  readonly api_details: string;
  readonly api_reset_type: number;
  readonly api_damage_type: number;
  readonly api_time: number;
  readonly api_deck_num: number;
  readonly api_difficulty: number;
  readonly api_use_fuel: number;
  readonly api_use_bull: number;
  readonly api_win_item1: number[];
  readonly api_win_item2: number[];
  readonly api_win_mat_level: number[];
  readonly api_return_flag: number;
  readonly api_sample_fleet: number[];
}

export interface MstConst {
  readonly api_boko_max_ships: StringIntValue;
  readonly api_parallel_quest_max: StringIntValue;
  readonly api_dpflag_quest: StringIntValue;
}

export interface StringIntValue {
  readonly api_string_value: string;
  readonly api_int_value: number;
}

export interface MstShipupgrade {
  readonly api_id: number;
  readonly api_current_ship_id: number;
  readonly api_original_ship_id: number;
  readonly api_upgrade_type: number;
  readonly api_upgrade_level: number;
  readonly api_drawing_count: number;
  readonly api_catapult_count: number;
  readonly api_report_count: number;
  readonly api_aviation_mat_count: number;
  readonly api_sortno: number;
}

export interface MstBgm {
  readonly api_id: number;
  readonly api_name: string;
}

export interface MstEquipShip {
  readonly api_ship_id: number;
  readonly api_equip_type: number[];
}

export interface MstFurniture {
  readonly api_id: number;
  readonly api_type: number;
  readonly api_no: number;
  readonly api_title: string;
  readonly api_description: string;
  readonly api_rarity: number;
  readonly api_price: number;
  readonly api_saleflg: number;
  readonly api_season: number;
  readonly api_version: number;
  readonly api_outside_id: number;
  readonly api_active_flag: number;
}

export interface MstShipgraph {
  readonly api_id: number;
  readonly api_filename: string;
  readonly api_version: string[];
  readonly api_battle_n: number[];
  readonly api_battle_d: number[];
  readonly api_sortno: number;
  readonly api_boko_n: number[];
  readonly api_boko_d: number[];
  readonly api_kaisyu_n: number[];
  readonly api_kaisyu_d: number[];
  readonly api_kaizo_n: number[];
  readonly api_kaizo_d: number[];
  readonly api_map_n: number[];
  readonly api_map_d: number[];
  readonly api_ensyuf_n: number[];
  readonly api_ensyuf_d: number[];
  readonly api_ensyue_n: number[];
  readonly api_weda: number[];
  readonly api_wedb: number[];
  readonly api_pa: number[];
}

export const ApiResult = {
  ok: 1,
} as const;
export type ApiResult = Unpacked<typeof ApiResult>;


interface ApiResponse {
  readonly api_result: number,
  readonly api_result_msg: string;
}

export const ApiMaterialId = {
  FUAL : 1, // 燃料 
  AMMO : 2, // 弾薬
  STEEL : 3, // 鋼材
  BUXITE : 4, // ボーキサイト
  FAST_BUILD : 5, // 高速建造材
  FAST_REPAIR : 6, // 高速修復材
  BUILD_KIT :7, // 開発資材
  REMODEL_KIT :8, // 改修資材
  MIN : 1,
  MAX : 8,
} as const;
export type ApiMaterialId = Unpacked<typeof ApiMaterialId>;

export interface ApiMaterial {
  readonly api_member_id: number;
  readonly api_id: ApiMaterialId;
  readonly api_value: number;
}

export const ApiItemId = {
  fast_repair: 1,	// 高速修復材
  fast_build: 2,	// 高速建造材
  build_kit: 3,	// 開発資材
  remodel_kit: 4,	// 改修資材
  kagu_small: 10,	// 家具箱（小）
  kagu_middle: 11,	// 家具箱（中）
  kagu_large: 12,	// 家具箱（大）
  fual: 31,	// 燃料
  ammo: 32,	// 弾薬
  steel: 33,	// 鋼材
  buxite: 34,	// ボーキサイト
  kagu_coin: 44,	// 家具コイン
  emergency_repair: 50,	// 応急修理要員
  emergency_repair_god: 51,	// 応急修理女神
  kagu_craftsman: 52,	// 特注家具職人
  mamiya: 54,	// 給糧艦「間宮」
  chocolate: 56,	// 艦娘からのチョコ
  medal: 57,	// 勲章
  remodel_blueprint: 58,	// 改装設計図
  irako: 59,	// 給糧艦「伊良湖」
  kou_medal: 61,	// 甲種勲章
  present_box: 60,	// プレゼント箱
  hishimochi: 62,	// 菱餅
  slot_expansion: 64, //	補強増設
  catapult: 65, // 試製甲板カタパルト
  rice_ball: 66, //戦闘糧食
  offshore_supply: 67,	// 洋上補給
  saury: 68,	//秋刀魚
  saury_canning: 69,	// 秋刀魚の缶詰
  special_crew: 70,	// 熟練搭乗員
  ne_engine: 71,	// ネ式エンジン
  decoration_item: 72,	// お飾り材料
  aircraft_blueprint: 74,	// 新型航空機設計図
  weapon_materials: 75,	// 新型砲熕兵装資材
  special_rice_ball: 76,	// 戦闘糧食(特別なおにぎり)
  aircraft_materials: 77,	// 新型航空兵装資材
  full_battle_report: 78,	// 戦闘詳報
  kaikyosyou: 79,	// 海峡章
  xmas_present_box: 80,	// Xmas Select Gift Box
  syougousyou_kou: 81,	// 捷号章
  syougousyou_otu: 82,	// 捷号章
  syougousyou_hei: 83,	// 捷号章
  syougousyou_tei: 84,	// 捷号章
  drop_rice: 85,	// お米
  drop_umeboshi: 86,	// 梅干
  drop_nori: 87,	// 海苔
  drop_otya: 88,	// お茶
  setsubun_bean: 90,	// 節分の豆
  emergency_repair_material: 91,	// 緊急修理資材
  aircraft_build_material: 92,	// 新型噴進装備開発資材
  sardine: 93,	// 鰯

  //
  teitoku_lv: -1, // 提督レベル
  teitoku_exp: -2, // 提督経験値, Number.MAX_SAFE_INTEGER: 9007199254740991
  rank: -3, // ランク(元帥など)
  ship_count: -4, // 保有艦数
  slotitem_count: -5, // 保有装備数
  win_count: -6, // 勝数
  lose_count: -7, // 敗数
  mission_count: -8, // 遠征数
  mission_success: -9, // 遠征成功数
  practice_count: -10, //  演習数
  practice_lose: -11, //  演習敗数
  //ship_exp: -12, // 艦隊総経験値
} as const;
export type ApiItemId = Unpacked<typeof ApiItemId>;

export const ApiDeckPortId = {
  deck1st: 1,
  deck2st: 2,
  deck3st: 3,
  deck4st: 4,
} as const;
export type ApiDeckPortId = Unpacked<typeof ApiDeckPortId>;


export interface ApiDeckPort {
  readonly api_member_id: number;
  readonly api_id: ApiDeckPortId; // number
  readonly api_name: string;
  readonly api_name_id: string;
  readonly api_mission: [MissionState, number, number, number]; // 0: state(0:none 1:inmission 2:ended 3:stop) 1: mission-id 2: time 3: unknown
  readonly api_flagship: string;
  readonly api_ship: number[];
}

// api req hensei preset register
interface ApiPresetRegister {
  readonly api_preset_no: number;
  readonly api_name: string;
  readonly api_name_id: string;
  readonly api_ship: number[];
}

// api req hensei preset delete param 
interface ApiPresetDeleteParam {
  readonly api_verno: string;
  readonly api_preset_no: string;
}

export interface ApiPresetDeckInfo {
  readonly api_preset_no: number;
  readonly api_name: string;
  readonly api_name_id: string;
  readonly api_ship: number[];
}

const InvalidApiPresetDeckInfo = (): ApiPresetDeckInfo => ({
  api_preset_no: 0,
  api_name: '',
  api_name_id: '',
  api_ship: [],
});

export interface ApiPresetDeck {
  readonly api_max_num: number;
  readonly api_deck: { [key: string]: ApiPresetDeckInfo };
}

export interface ApiBasic {
  readonly api_member_id: string;
  readonly api_nickname: string;
  readonly api_nickname_id: string;
  readonly api_active_flag: number;
  readonly api_starttime: number;
  readonly api_level: number;
  readonly api_rank: number;
  readonly api_experience: number;
  readonly api_fleetname: null | string;
  readonly api_comment: string;
  readonly api_comment_id: string;
  readonly api_max_chara: number;
  readonly api_max_slotitem: number;
  readonly api_max_kagu: number;
  readonly api_playtime: number;
  readonly api_tutorial: number;
  readonly api_furniture: number[];
  readonly api_count_deck: number;
  readonly api_count_kdock: number;
  readonly api_count_ndock: number;
  readonly api_fcoin: number;
  readonly api_st_win: number;
  readonly api_st_lose: number;
  readonly api_ms_count: number;
  readonly api_ms_success: number;
  readonly api_pt_win: number;
  readonly api_pt_lose: number;
  readonly api_pt_challenged: number;
  readonly api_pt_challenged_win: number;
  readonly api_firstflag: number;
  readonly api_tutorial_progress: number;
  readonly api_pvp: number[];
  readonly api_medals: number;
  readonly api_large_dock: number;
}

const InvalidApiBasic = (): ApiBasic => ({
  api_member_id: '',
  api_nickname: '',
  api_nickname_id: '',
  api_active_flag: 0,
  api_starttime: 0,
  api_level: 0,
  api_rank: 0,
  api_experience: 0,
  api_fleetname: null,
  api_comment: '',
  api_comment_id: '',
  api_max_chara: 0,
  api_max_slotitem: 0,
  api_max_kagu: 0,
  api_playtime: 0,
  api_tutorial: 0,
  api_furniture: [],
  api_count_deck: 0,
  api_count_kdock: 0,
  api_count_ndock: 0,
  api_fcoin: 0,
  api_st_win: 0,
  api_st_lose: 0,
  api_ms_count: 0,
  api_ms_success: 0,
  api_pt_win: 0,
  api_pt_lose: 0,
  api_pt_challenged: 0,
  api_pt_challenged_win: 0,
  api_firstflag: 0,
  api_tutorial_progress: 0,
  api_pvp: [],
  api_medals: 0,
  api_large_dock: 0,
});

export interface ApiEventObject {
  readonly api_m_flag: number;
  readonly api_m_flag2: number;
  readonly api_c_num: number;
}

const InvalidApiEventObject = (): ApiEventObject => ({
  api_m_flag: 0,
  api_m_flag2: 0,
  api_c_num: 0,
});

export interface ApiFriendlySetting {
  readonly api_request_flag: number;
  readonly api_request_type: number;
}

const InvalidApiFriendlySetting = (): ApiFriendlySetting => ({
  api_request_flag: 0,
  api_request_type: 0,
});

interface ApiSortieConditions {
  readonly api_war: ApiSortieConditionsApiWar;
}

interface ApiSortieConditionsApiWar {
  readonly api_win: string;
  readonly api_lose: string;
  readonly api_rate: string;
}

const InvalidApiSortieConditionsApiWar = (): ApiSortieConditionsApiWar => ({
  api_win: '',
  api_lose: '',
  api_rate: '',
});

// req combined battle result
export interface ApiCombinedBattleResult extends ApiBattleResult {
  readonly api_mvp_combined: number | null;
  readonly api_get_ship_exp_combined: number[] | null;
  readonly api_get_exp_lvup_combined: number[][] | null;
}

export interface ApiEnemyInfo {
  api_level: string;
  api_rank: string;
  api_deck_name: string;
}

export interface ApiBattleGetShip {
  api_ship_id: number; // mst ship id
  api_ship_type: string; // "駆逐艦",
  api_ship_name: string; // "霰",
  api_ship_getmes: string; // "霰です…<br>んちゃ…とかはいいません…よろしく…"
}

const InvalidApiPresetDeck = (): ApiPresetDeck => ({
  api_max_num: 0,
  api_deck: {}
});

interface ApiPresetSelectParam {
  readonly api_verno: string;
  readonly api_preset_no: string;
  readonly api_deck_id: string;
}

interface ApiPresetSelect {
  readonly api_member_id: number;
  readonly api_id: number;
  readonly api_name: string;
  readonly api_name_id: string;
  readonly api_mission: number[];
  readonly api_flagship: string;
  readonly api_ship: number[];
}

export const ApiKDockState = {
  locked: -1, // not unlock
  empty: 0, // 
  inProgress: 2, //
  completed: 3, //
} as const;
export type ApiKDockState = Unpacked<typeof ApiKDockState>;

export interface ApiKDock {
  readonly api_id: number;
  readonly api_state: ApiKDockState; // -1: 未開放 0: 空 2: in progress 3:建造済み
  readonly api_created_ship_id: number;
  readonly api_complete_time: string;
  readonly api_complete_time_str: string;
  readonly api_item1: number;
  readonly api_item2: number;
  readonly api_item3: number;
  readonly api_item4: number;
  readonly api_item5: number;
}

export const ApiNDockState = {
  locked: -1, // not unlock
  empty: 0, // 
  in: 1, //
} as const;
export type ApiNDockState = Unpacked<typeof ApiNDockState>;

export interface ApiNDock {
  readonly api_member_id: number;
  readonly api_id: number;
  readonly api_state: ApiNDockState;
  readonly api_ship_id: number;
  readonly api_complete_time: number;
  readonly api_complete_time_str: string;
  readonly api_item1: number;
  readonly api_item2: number;
  readonly api_item3: number;
  readonly api_item4: number;
}

const NDockEmpty = (): Omit<ApiNDock, 'api_member_id' | 'api_id'> => ({
  api_state: ApiNDockState.empty,
  api_ship_id: 0,
  api_complete_time: 0,
  api_complete_time_str: '',
  api_item1: 0,
  api_item2: 0,
  api_item3: 0,
  api_item4: 0,
});

export interface ApiFurniture {
  readonly api_id: number;
  readonly api_furniture_type: number;
  readonly api_furniture_no: number;
  readonly api_furniture_id: number;
}

export interface ApiShip {
  readonly api_id: number;
  readonly api_sortno: number;
  readonly api_ship_id: number;
  readonly api_lv: number;
  readonly api_exp: number[];
  readonly api_nowhp: number;
  readonly api_maxhp: number;
  readonly api_soku: number;
  readonly api_leng: ApiRange;
  readonly api_slot: number[];
  readonly api_onslot: number[];
  readonly api_slot_ex: number; // 0: no open ex slot, -1: open ex slot, not set,  > 0 ex slot set.
  readonly api_kyouka: number[];
  readonly api_backs: number;
  readonly api_fuel: number;
  readonly api_bull: number;
  readonly api_slotnum: number;
  readonly api_ndock_time: number;
  readonly api_ndock_item: number[];
  readonly api_srate: number;
  readonly api_cond: number;
  readonly api_karyoku: number[];
  readonly api_raisou: number[];
  readonly api_taiku: number[];
  readonly api_soukou: number[];
  readonly api_kaihi: number[];
  readonly api_taisen: number[];
  readonly api_sakuteki: number[];
  readonly api_lucky: number[];
  readonly api_locked: number;
  readonly api_locked_equip: number;
  readonly api_sally_area?: number; // event area
}

export const ShipHpState = {
  normal: 0, // 
  syouha: 1, //
  tyuuha: 2, //
  taiha: 3, //
} as const;
export type ShipHpState = Unpacked<typeof ShipHpState>;

export const MapLv = {
  none: 0,
  tyou: 1,
  hei: 2,
  otu: 3,
  kou: 4,
} as const;
export type MapLv = Unpacked<typeof MapLv>;

export interface ApiDeck {
  readonly api_preset_no: number;
  readonly api_name: string;
  readonly api_name_id: string;
  readonly api_ship: number[];
}

export interface ApiLog {
  readonly api_no: number;
  readonly api_type: string;
  readonly api_state: string;
  readonly api_message: string;
}

export interface ApiOssSetting {
  readonly api_language_type: number;
  readonly api_oss_items: number[];
}

export interface ApiSlotitem {
  readonly api_id: number; // アイテムID
  readonly api_slotitem_id: number; // マスターデータID
  readonly api_locked?: number; // ロック
  readonly api_level?: number; // 改修レベル
  readonly api_alv?: number;   // 熟練度
}

const fixApiSlotitemMember = (slotitem: ApiSlotitem): ApiSlotitem => {
  const fix: {
    api_locked?: number; // ロック
    api_level?: number; // 改修レベル
    api_alv?: number;   // 熟練度  
  } = {};

  if (undefined === slotitem.api_locked) {
    fix.api_locked = 0;
  }
  if (undefined === slotitem.api_level) {
    fix.api_level = 0;
  }
  if (undefined === slotitem.api_alv) {
    fix.api_alv = 0;
  }
  return Object.assign(slotitem, fix);
};

export interface ApiUseItem {
  readonly api_id: ApiItemId;
  readonly api_count: number;
}

export interface ApiPayItem {
  readonly api_payitem_id: string;
  readonly api_type: number;
  readonly api_name: string;
  readonly api_description: string;
  readonly api_price: number;
  readonly api_count: number;
}

export interface ApiUnsetSlot {
  readonly api_slottype23: number[];
  readonly api_slottype1: number[];
}

export interface UpdateData {
  readonly api: Api;
  readonly body: string;
}

// set friendly request
interface ApisSetFriendlyRequestParam {
  readonly api_verno: string;
  readonly api_request_flag: string; // 0:支援不要 1: 友軍要請
  readonly api_request_type: string; // 0:通常 1:強友軍
}

// req air corps set plane
interface ApiAirCorpsSetPlaneParam {
  readonly api_verno: string;
  readonly api_area_id: string;
  readonly api_base_id: string;
  readonly api_squadron_id: string;
  readonly api_item_id: string;
}

interface ApiAirCorpsSetPlane {
  readonly api_distance: ApiDistance;
  readonly api_plane_info: ApiPlaneInfo[];
  readonly api_after_bauxite?: number;
}

// req air corps set action
interface ApiAirCorpsSetActionParam {
  readonly api_verno: string;
  readonly api_area_id: string;
  readonly api_base_id: string;
  readonly api_action_kind: string;
}

// req airbase supply param
interface ApiAirBaseCorpsSupplyParam {
  readonly api_verno: string;
  readonly api_area_id: string;
  readonly api_base_id: string;
  readonly api_squadron_id: string; // 1%2C2%2C3%2C4
}

// req airbase supply
interface ApiAirBaseCorpsSupply {
  readonly api_after_fuel: number;
  readonly api_after_bauxite: number;
  readonly api_distance: ApiDistance;
  readonly api_plane_info: ApiPlaneInfo[];
}

type ApiBattleMap = ApiMapStart | ApiMapNext;

// api data
export interface ApiData {
  readonly api_mst_ship: MstShip[];
  readonly api_mst_slotitem_equiptype: MstSlotitemEquiptype[];
  readonly api_mst_equip_exslot: number[];
  readonly api_mst_equip_exslot_ship: MstEquipExslotShip[];
  readonly api_mst_stype: MstStype[];
  readonly api_mst_slotitem: MstSlotitem[];
  readonly api_mst_furnituregraph: MstFurnituregraph[];
  readonly api_mst_useitem: MstUseitem[];
  readonly api_mst_payitem: MstPayitem[];
  readonly api_mst_item_shop?: MstItemShop;
  readonly api_mst_maparea: MstMaparea[];
  readonly api_mst_mapinfo: MstMapinfo[];
  readonly api_mst_mapbgm: MstMapbgm[];
  readonly api_mst_mission: MstMission[];
  readonly api_mst_const?: MstConst;
  readonly api_mst_shipupgrade: MstShipupgrade[];
  readonly api_mst_bgm: MstBgm[];
  readonly api_mst_equip_ship: MstEquipShip[];
  readonly api_mst_furniture: MstFurniture[];
  readonly api_mst_shipgraph: MstShipgraph[];
  readonly api_material: ApiMaterial[];
  readonly api_air_base: ApiAirBase[],
  readonly api_basic: ApiBasic;
  readonly api_deck: ApiDeck[];
  readonly api_deck_port: ApiDeckPort[];
  readonly api_extra_supply?: number[];
  readonly api_furniture: ApiFurniture[];
  readonly api_kdock: ApiKDock[];
  readonly api_ndock: ApiNDock[];
  readonly api_log: ApiLog[];
  readonly api_oss_setting?: ApiOssSetting;
  readonly api_ship: ApiShip[];
  readonly api_slot_item: ApiSlotitem[];
  readonly api_useitem: ApiUseItem[];
  readonly api_unsetslot?: ApiUnsetSlot;
  readonly api_questlist: ApiQuestList | null;
  readonly api_mapinfo: ApiMapInfo[];
  readonly api_mission: ApiMission[];
  readonly api_event_object: ApiEventObject;
  readonly api_war: ApiSortieConditionsApiWar;
  readonly api_friendly_setting: ApiFriendlySetting;
  readonly api_preset_deck: ApiPresetDeck;
  readonly api_combined_flag: CombinedFlag;
  readonly api_max_num: number; // max number preset
  readonly api_p_bgm_id: number;
  readonly api_parallel_quest_count: number;
  readonly api_dest_ship_slot: number;
  readonly api_c_flag: number;
  readonly api_req_map: ApiBattleMap[];
  readonly api_remodel_slot_list: ApiRemodelSlotItem[];
  readonly api_position_id: number;
  readonly api_skin_id: number;
  readonly api_server_id: ApiServerId;

  readonly api_practice_battle_result: ApiPracticeBattleResult | null,
  api_remodel_slot_detail: ApiRemodelSlotlistDetail | null,

  prv_battle_infos: PrvBattleInfo[];
  prv_battle_map_info: PrvBattleMapInfo | null;
  prv_in_map: boolean;
  //api_sortie_battleresult: ApiSortieBattleResult;
  //api_combined_battleresult: ApiCombinedBattleResult;
  
}

export const CombinedFlag = {
  none: 0,
  kidou: 1,
  suijyou: 2,
  yusou: 3,
} as const;
export type CombinedFlag = Unpacked<typeof CombinedFlag>;

export interface ApiQuestList {
  readonly api_count: number;
  readonly api_completed_kind: number;
  readonly api_list: ApiQuest[];
  readonly api_exec_count: number;
  readonly api_exec_type: number;
}

export const ApiQuestCategory = {
  hensei: 1,
  syutugeki: 2,
  ensyu: 3,
  ensei: 4,
  hokyu_nukyo: 5,
  kousyou: 6,
  kaisou: 7,
  kakutyou: 8,
  kakutyou2: 9
} as const;
export type ApiQuestCategory = Unpacked<typeof ApiQuestCategory>;

export const ApiQuestType = {
  daily: 1,
  weekly: 2,
  monthly: 3,
  single: 4,
  quarterly: 5, 
} as const;
export type ApiQuestType = Unpacked<typeof ApiQuestType>;
export const ApiQuestLabelTypeYearLy = 100 as const;

export const ApiQuestState = {
  normal: 1,
  in_progress: 2,
  completed: 3,
} as const;
export type ApiQuestState = Unpacked<typeof ApiQuestState>;

export const ApiProgressFlag = {
  zero: 0,
  fifty: 1,
  eighty: 2,
} as const;
export type ApiProgressFlag = Unpacked<typeof ApiProgressFlag>;

export interface ApiQuest {
  readonly api_no: number;
  readonly api_category: ApiQuestCategory;
  readonly api_type: ApiQuestType;
  readonly api_label_type: number;
  readonly api_state: ApiQuestState;
  readonly api_title: string;
  readonly api_detail: string;
  readonly api_voice_id: number;
  readonly api_get_material: [number, number, number, number]; // 燃料, 弾薬, 鋼材, ボーキ
  readonly api_bonus_flag: number;
  readonly api_progress_flag: ApiProgressFlag;
  readonly api_invalid_flag: number;
}

// interface req member get incentive
interface ApiGetIncentive {
  readonly api_count: number;
}

// res require info 
interface ApiRequireInfo {
  readonly api_basic: ApiBasic;
  readonly api_slot_item: ApiSlotitem[];
  readonly api_kdock: ApiKDock[];
  readonly api_useitem: ApiUseItem[];
  readonly api_furniture: ApiFurniture[];
  readonly api_extra_supply: number[];
  readonly api_oss_setting: ApiOssSetting;
  readonly api_skin_id: number;
}

// res ship3
interface ApiShip3 {
  readonly api_ship_data: ApiShip[];
  readonly api_deck_data: ApiDeckPort[];
  readonly api_slot_data: number[][];
}

// req kaisou slotset
interface ApiKaisouSlotsetParam {
  readonly api_verno: string;
  readonly api_id: string;
  readonly api_item_id: string;
  readonly api_slot_idx: string;
}

// kaisou oepn exsplot
interface ApiOpenExSlotParam {
  readonly api_verno: string;
  readonly api_id: string;
}

// req kaisou unsetslot all
interface ApiKaisouUnsetslotAllParam {
  readonly api_verno: string;
  readonly api_id: string;
}

// req change slot exchange index
interface ApiChangeSlotExchangeIndex {
  readonly api_ship_data: ApiShip
}

// req hensei change index
interface ApiHenseiChangeParam {
  readonly api_id: string;
  readonly api_ship_idx: string;
  readonly api_ship_id: string; // -1: unset -2: all clear
}

// req hokyu charge
interface ApiHokyuCharge {
  readonly api_ship: ApiShip[];
  readonly api_material: number[];
  readonly api_use_bou: number;
}


// res getship
interface ApiGetShip {
  readonly api_id: number;
  readonly api_ship_id: number;
  readonly api_kdock: ApiKDock[];
  readonly api_ship: ApiShip;
  readonly api_slotitem?: ApiSlotitem[];
}

// req
interface ApiSlotitemLockParam {
  readonly api_slotitem_id: string;
}

// res api_req_kaisou/lock 
interface ApiSlotitemLock {
  readonly api_locked: number;
}

// req create item param
interface ApiCreateItemParam {
  readonly api_verno: string;
  readonly api_item1: string;
  readonly api_item2: string;
  readonly api_item3: string;
  readonly api_item4: string;
  readonly api_multiple_flag: string;
}

// req create item
export interface ApiCreateItem {
  // 0: failed
  // 1: succeeded
  readonly api_create_flag: number;
  readonly api_material: number[];
  // 0: 燃料  id: 1
  // 1: 弾薬  id: 2
  // 2: 鋼材  id: 3
  // 3: ボーキサイト  id: 4
  // 4: 高速建造材  id: 5
  // 5: 高速修復材  id: 6
  // 6: 開発資材  id: 7
  // 7: 改修資材  id: 8
  readonly api_get_items: ApiSlotitem[];
  readonly api_unset_items: null | any;
}

export interface ApiCreateItemWithParam extends ApiCreateItem {
  readonly items: number[];
}

// req hensei change index
interface ApiDestroyItem2Param {
  readonly api_slotitem_ids: string;
}

// req create ship
interface ApiCreateShipParam {
  readonly api_verno: string;
  readonly api_kdock_id: string;
  readonly api_large_flag?: string;
  readonly api_item1: string; // fual
  readonly api_item2: string; // ammo
  readonly api_item3: string; // steel
  readonly api_item4: string; // bux
  readonly api_item5: string; // dev material
  readonly api_highspeed: string;
}

// create ship param
export interface ApiCreateShipWithParam {
  readonly api_kdock_id: number;
  readonly api_ship_id: number;
  readonly api_large_flag: number;
  readonly api_highspeed: number;
  readonly api_items: number[]; // 0: fual 1: ammo 2: steel 3: bux 4: dev material
}

// res destory item2
interface ApiDestroyItem2 {
  // 0: 燃料  id: 1
  // 1: 弾薬  id: 2
  // 2: 鋼材  id: 3
  // 3: ボーキサイト  id: 4
  readonly api_get_material: number[];
}

// 
export interface ApiDestroyItem2WithParam extends ApiDestroyItem2 {
  readonly mst_ids: number[];
}

// req destroy ship req
interface ApiDestroyShipParam {
  readonly api_verno: string;
  readonly api_ship_id: string;
  readonly api_slot_dest_flag: string;
}

// req destroy ship
interface ApiDestroyShip {
  readonly api_material: number[];
}

// 
export interface ApiDestroyShipWithParam extends ApiDestroyShip {
  readonly ship_ids: number[];
}

// req powerup param
interface ApiPowerUpParam {
  readonly api_verno: string;
  readonly api_id_items: string;
  readonly api_slot_dest_flag: string;
}

// req powerup
export interface ApiPowerUp {
  readonly api_powerup_flag: number;
  readonly api_ship: ApiShip;
  readonly api_deck?: ApiDeckPort[];
}

// 
export interface ApiPowerUpWothParam {
  readonly ship_types: ApiShipType[];
  readonly api_data: ApiPowerUp;
}

// req slot deprive
interface ApiSlotDeprive {
  readonly api_ship_data: {
    readonly api_unset_ship: ApiShip;
    readonly api_set_ship: ApiShip;
  };
  readonly api_unset_list: {
    readonly api_type3No?: number;
    readonly api_slot_list: number[];
  };
}

// req slot deprive param
interface ApiSlotDepriveParam {
  readonly api_verno: string;
  readonly api_unset_idx: string;
  readonly api_set_slot_kind: string;
  readonly api_unset_slot_kind: string;
  readonly api_unset_ship: string;
  readonly api_set_idx: string;
  readonly api_set_ship: string;
}

// req remodeling
interface ApiRemodelingParam {
  readonly api_verno: string;
  readonly api_id: string;
}

// req marrige param
interface ApiMarrigeParam {
  readonly api_verno: string;
  readonly api_id: string;
}

// req marrige 
interface ApiMarrige extends ApiShip {
}

const ApiItemBonusType = {
  material: 1,
} as const;
export type ApiItemBonusType = Unpacked<typeof ApiItemBonusType>;


interface ApiItemBonus {
  readonly api_type: ApiItemBonusType;
  readonly api_count: number;
  readonly api_item: {
    readonly api_id: number;
    readonly api_name: string;
  };
}

// remodel slot list
interface ApiRemodelSlotItem {
  readonly api_id: number;
  readonly api_slot_id: number;
  readonly api_req_fuel: number;
  readonly api_req_bull: number;
  readonly api_req_steel: number;
  readonly api_req_bauxite: number;
  readonly api_req_buildkit: number;
  readonly api_req_remodelkit: number;
  readonly api_req_slot_id: number;
  readonly api_req_slot_num: number;
}

// api kousyou remodel slotlist detail
interface ApiRemodelSlotlistDetailParam {
  readonly api_verno: string;
  readonly api_id: string;
  readonly api_slot_id: string;
}

interface ApiRemodelSlotlistDetail {
  api_req_buildkit: number;
  api_req_remodelkit: number;
  api_certain_buildkit: number;
  api_certain_remodelkit: number;
  api_req_slot_id: number;
  api_req_slot_num: number;
  api_req_useitem_id?: number;
  api_req_useitem_num?: number;
  api_change_flag: number;
}

// api req kousyou remodel slot param
interface ApiRemodelSlotParam {
  readonly api_verno: string;
  readonly api_id: string;
  readonly api_slot_id: string;
  readonly api_certain_flag: string; //0: 確実化なし 1: 確実化
}
// 
interface ApiRemodelSlot {
  readonly api_remodel_flag: number; // 0: failed 1: succeeded
  readonly api_remodel_id: number[]; // 0: before slotitem id 1: after slotitem id
  readonly api_after_material: number[];
  readonly api_voice_ship_id: number;
  readonly api_voice_id: number;
  readonly api_after_slot?: ApiSlotitem;
  readonly api_use_slot_id: number[]; // remove apim ids
}

export interface ApiRemodelSlotWithParam extends ApiRemodelSlot {
  readonly api_level: number;
  readonly api_certain_flag: number;
}

export interface ApiMission {
  readonly api_mission_id: number;
  readonly api_state: number; // 0: new 1:not clear 2: cleared 
}

export const ApiMissionStateIndex = {
  state: 0, //value 0 : not mission 1: missioning 2: retrun 3: stopped
  mission_id: 1,
  time: 2,
} as const;
export type ApiMissionStateIndex = Unpacked<typeof ApiMissionStateIndex>;


export const ApiMissionClearResult = {
  failed: 0,
  succees: 1,
  great_success: 2,
} as const;
export type ApiMissionClearResult = Unpacked<typeof ApiMissionClearResult>;


// req mission result
export interface ApiMissionResult {
  api_ship_id: number[];
  api_clear_result: ApiMissionClearResult;
  api_get_exp: number;
  api_member_lv: string;
  api_member_exp: number;
  api_get_ship_exp: number[];
  api_get_exp_lvup: Array<number[]>;
  api_maparea_name: string;
  api_detail: string;
  api_quest_name: string;
  api_quest_level: number;
  api_get_material: number[];
  api_useitem_flag: ApiItemId[];
  api_get_item1?: ApiGetItem;
  api_get_item2?: ApiGetItem;
}

export interface ApiGetItem {
  api_useitem_id: ApiItemId;
  api_useitem_name: string;
  api_useitem_count: number;
}

//
interface ApiMissionList {
  readonly api_list_items: ApiMission[];
}

// req mission return instruction
interface ApiMissionReturnInstructionParam {
  readonly api_verno: string;
  readonly api_deck_id: string;
}

interface ApiMissionRetrunInstruction {
  readonly api_mission: number[];
}

interface ApiClearItemGet {
  // 0: 燃料  id: 1
  // 1: 弾薬  id: 2
  // 2: 鋼材  id: 3
  // 3: ボーキサイト  id: 4
  readonly api_material?: number[];
  readonly api_bounus_count?: number;
  readonly api_bounus?: ApiItemBonus[];
}

// get member mapinfo
interface ApiMapInfoList {
  readonly api_map_info: ApiMapInfo[];
  readonly api_air_base: ApiAirBase[];
}

export const ApiGaugeType = {
  counter: 1, 
  event: 2, 
  yusou: 3,
} as const;
export type ApiGaugeType = Unpacked<typeof ApiGaugeType>;

export interface ApiMapInfo {
  readonly api_id: number;
  readonly api_cleared: number;
  readonly api_gauge_type?: ApiGaugeType;
  readonly api_gauge_num?: number;
  readonly api_defeat_count?: number;
  readonly api_required_defeat_count?: number;
  readonly api_air_base_decks?: number;
  readonly api_eventmap?: ApiMapInfoEventmap;
  readonly api_sally_flag?: number[];
}

export interface ApiMapInfoEventmap {
  readonly api_now_maphp: number;
  readonly api_max_maphp: number;
  readonly api_state: number;
  readonly api_selected_rank: MapLv; // 4: 甲 3: 乙 2: 丙 1: 丁
}

export interface ApiAirBase {
  readonly api_area_id: number;
  readonly api_rid: number;
  readonly api_name: string;
  readonly api_distance: ApiDistance;
  readonly api_action_kind: AirBaseActionKind; // 0:待機 1: 出撃 2:防空 3:退避 4:休息
  readonly api_plane_info: ApiPlaneInfo[];
}

export const AirBaseActionKind = {
  taiki: 0,
  syutugeki: 1,
  bouku: 2,
  taihi: 3,
  kyuusoku: 4,
} as const;
export type AirBaseActionKind = Unpacked<typeof AirBaseActionKind>;


export interface ApiDistance {
  readonly api_base: number;
  readonly api_bonus: number;
}

export interface ApiPlaneInfo {
  readonly api_squadron_id: number;
  readonly api_state: number; // 1: active 2: changing
  readonly api_slotid: number;
  readonly api_count?: number;
  readonly api_max_count?: number;
  readonly api_cond?: number;
}

const planeinfoIndex = (planeinfos: ApiPlaneInfo[], squadron_id: number): number => {
  return planeinfos.findIndex(planeinfo => planeinfo.api_squadron_id === squadron_id);
};

interface ApiShipLockParam {
  readonly api_ship_id: string;
}

// req hensei combined
interface ApiCombinedParam {
  readonly api_verno: string;
  readonly api_combined_type: string; // 0: nocimbined 1: kidou 2: suijyou 3: yusou
}

interface ApiCombined {
  readonly api_combined: number; // 0: nocimbined, 1: combined
}

// get member ship deck
interface ApiShipDeck {
  readonly api_ship_data: ApiShip[];
  readonly api_deck_data: ApiDeckPort[];
}

// req member update deckname
interface ApiUpdateDeckNameParam {
  readonly api_verno: string;
  readonly api_deck_id: string;
  readonly api_name: string;
  readonly api_name_id: string;
}

// req nyukyo start param
interface ApiNyukyoStartParam {
  readonly api_verno: string;
  readonly api_highspeed: string;
  readonly api_ndock_id: string;
  readonly api_ship_id: string;
}

// req nyukyo speedchange
interface ApiNyukyoSpeedChangeParam {
  readonly api_verno: string;
  readonly api_ndock_id: string;
}

// req map select eventmap rank
interface ApiSelectEventmapRankParam {
  readonly api_verno: string;
  readonly api_maparea_id: string;
  readonly api_map_no: string;
  readonly api_rank: string;
}

// req map select eventmap rank
export interface ApiSelectEventmapRank {
  api_maphp: APIMapHp;
  api_sally_flag: number[];
}

export interface APIMapHp {
  readonly api_now_maphp:  number;
  readonly api_max_maphp:  number;
  readonly api_gauge_type: number;
  readonly api_gauge_num:  number;
}

// req map start param
interface ApiMapStartParam {
  readonly api_verno: string;
  readonly api_maparea_id: string;
  readonly api_mapinfo_no: string;
  readonly api_deck_id: string;
  readonly api_serial_cid: string;
}

// req map start
interface ApiCellData {
  readonly api_id: number;
  readonly api_no: number;
  readonly api_color_no: ApiCellColorNo;
  readonly api_passed: number;
}

// 
export const ApiCellColorNo = {
  start: 0,
  material: 2,
  uzusio: 3,
  battle: 4,
  boss: 5,
  air_search_material: 9,
} as const;
export type ApiCellColorNo = Unpacked<typeof ApiCellColorNo>;

interface ApiAirSearch {
  readonly api_plane_type: number;
  readonly api_result: number;
}

export const ApiEventId = {
  uzusio: 3,
  sortieBattle: 4,
  bossBattle: 5,
  noBattle: 6,
  airSearchMaterial: 7,
} as const;
export type ApiEventId = Unpacked<typeof ApiEventId>;

export interface ApiHappening {
  readonly api_type: number;
  readonly api_count: number;
  readonly api_usemst: number;
  readonly api_mst_id: number;
  readonly api_icon_id: number;
  readonly api_dentan: number;
}

export interface ApiMap {
  readonly api_rashin_flg: number;
  readonly api_rashin_id: number;
  readonly api_maparea_id: number;
  readonly api_mapinfo_no: number;
  readonly api_no: number;
  readonly api_color_no: number;
  readonly api_event_id: ApiEventId;
  readonly api_event_kind: number;
  readonly api_next: number;
  readonly api_bosscell_no: number;
  readonly api_bosscomp: number;
  readonly api_airsearch: ApiAirSearch;
  readonly api_happening?: ApiHappening;
  readonly api_cell_flavor?: ApiCellFlavor;
  readonly api_eventmap?: ApiEventmap;
  // caption ApiItemGet[] | ApiItemGet;
  readonly api_itemget?: ApiItemGet[];
  readonly api_itemget_eo_comment?: ApiItemGetEo;

}

export interface ApiCellFlavor {
  api_type:    number;
  api_message: string;
}

export interface ApiEventmap {
  api_max_maphp: number;
  api_now_maphp: number;
  api_dmg:       number;
}

export interface ApiMapStart extends ApiMap {
  readonly api_cell_data: ApiCellData[];
  readonly api_from_no: number;
}

export interface ApiMapNext extends ApiMap {
  readonly api_comment_kind: number;
  readonly api_production_kind: number;
  readonly api_get_eo_rate?: number;
  readonly api_itemget_eo_result?: ApiItemGetEo;
}

export const ApiItemGetUseMst = {
  material: 4,
  useitem: 5, // プレゼント箱など
 } as const;
export type ApiItemGetUseMst = Unpacked<typeof ApiItemGetUseMst>;


export const ApiItemGetItemId = {
  fual : 1, // 燃料 
  ammo : 2, // 弾薬
  steel : 3, // 鋼材
  buxite : 4, // ボーキサイト
  fastBuild : 5, // 高速建造材
  fastRepair : 6, // 高速修復材
  buildKit : 7, // 開発資材
  //remodelKit = 8, // 改修資材
} as const;
export type ApiItemGetItemId = Unpacked<typeof ApiItemGetItemId>;


export interface ApiItemGetBase {
  readonly api_usemst: ApiItemGetUseMst;
  readonly api_id: ApiItemGetItemId | ApiItemId;
  readonly api_getcount: number;
}

export interface ApiItemGet extends ApiItemGetBase {
  readonly api_name: string;
  readonly api_icon_id: number;
}

export interface ApiItemGetEo extends ApiItemGetBase {
}

export interface PrvBattleMapInfo {
  maparea_id: number;
  mapinfo_no: number;
  mapLv: MapLv;
  deck_id: number;
  uuid: string;
  start: boolean;
}

export const ApiFormation = {
  tanjyuu : 1, // 単縦陣
  fukujyuu : 2, // 複縦陣
  rinkei : 3, // 輪形陣
  teikei : 4, // 梯形陣
  tanou : 5, // 単横陣
  keikai : 6, // 警戒陣
} as const;
export type ApiFormation = Unpacked<typeof ApiFormation>;

export const ApiTactics = {
  doukou : 1, // 同航戦
  hankou : 2, // 反航戦
  t_yuuri : 3, // T字有利
  t_furi : 4, // T字不利
} as const;
export type ApiTactics = Unpacked<typeof ApiTactics>;

export const BattleType = {
  midday: 1, // sortie battle
  midnight: 2, // sortie night battle
  sp_midnight: 3, // sortie night battle
  air: 4, // airbattle 
  ld_air: 5, // ld airbattle
  combined_ec: 6, // combined ec_battle
  combined_each: 7, // combined each_battle
  combined_ec_midnight: 8, // combined ec midnight
  combined: 9, // combined
  combined_ld_air: 10, // combined ld airbattle
} as const;
export type BattleType = Unpacked<typeof BattleType>;

// ボスフレーバーテキスト
export interface ApiFlavorInfo {
  readonly api_boss_ship_id : string;
  readonly api_type : string;
  readonly api_voice_id : string;
  readonly api_class_name : string;
  readonly api_ship_name : string;
  readonly api_message : string;
  readonly api_pos_x : string;
  readonly api_pos_y : string;
  readonly api_data : string;
}

// battle
export type ApiFormations = [ApiFormation, ApiFormation, ApiTactics];
export interface ApiBattleBase {
  readonly api_deck_id: number;
  readonly api_formation: ApiFormations;
  readonly api_f_nowhps: number[];
  readonly api_f_maxhps: number[];
  readonly api_fParam: number[][];
  readonly api_ship_ke: number[];
  readonly api_ship_lv: number[];
  readonly api_e_nowhps: number[];
  readonly api_e_maxhps: number[];
  readonly api_eSlot: number[][];
  readonly api_eParam: number[][];
  readonly api_flavor_info?: ApiFlavorInfo[];
}

export interface ApiBattleNormal extends ApiBattleBase {
  readonly api_midnight_flag: number;
  readonly api_xal01? : number;
  readonly api_search: number[];
  readonly api_stage_flag: number[];
  readonly api_kouku: ApiKouku;
}

export interface ApiSupportAirAtack {
  readonly api_deck_id: number;
  readonly api_ship_id: number[];
  readonly api_undressing_flag: number[];
  readonly api_stage_flag: number[];
  readonly api_plane_from: number[][];
  readonly api_stage1: ApiSupportStage1;
  readonly api_stage2: ApiSupportStage2;
  readonly api_stage3: ApiSupportStage3;
}

export interface ApiSupportStage1 {
  readonly api_f_count: number;
  readonly api_f_lostcount: number;
  readonly api_e_count: number;
  readonly api_e_lostcount: number;
}

export interface ApiSupportStage2 {
  readonly api_f_count: number;
  readonly api_f_lostcount: number;
}

export interface ApiSupportStage3 {
  readonly api_erai_flag: number[];
  readonly api_ebak_flag: number[];
  readonly api_ecl_flag: number[];
  readonly api_edam: number[];
}

export interface ApiSupportHourai {
  readonly api_deck_id : number;
  readonly api_ship_id: number[];
  readonly api_undressing_flag: number[];
  readonly api_cl_list: number[];
  readonly api_damage: number[];
}

export interface ApiSupportInfo {
  readonly api_support_airatack : ApiSupportAirAtack | null;
  readonly api_support_hourai : ApiSupportHourai | null;
}

export interface ApiBattle extends ApiBattleNormal {
  readonly api_air_base_attack: ApiAirBaseAttack[] | undefined;
  readonly api_support_flag: number;
  readonly api_support_info: ApiSupportInfo | null;
  readonly api_opening_taisen_flag: number;
  readonly api_opening_taisen: ApiHougeki | null;
  readonly api_opening_flag: number;
  readonly api_opening_atack: ApiRaigeki | null;
  readonly api_hourai_flag: number[];
  // ここはオブジェクト順序が攻撃順の可能性がある
  readonly api_hougeki1: ApiHougeki | null;
  readonly api_hougeki2: ApiHougeki | null;
  readonly api_hougeki3: ApiHougeki | null;
  readonly api_raigeki: ApiRaigeki | null;
}

export interface ApiSortieBattle extends ApiBattle {
}

export interface ApiSortieAirBattle extends ApiBattleNormal {
  readonly api_support_flag: number;
  readonly api_support_info: ApiSupportInfo | null;
  readonly api_stage_flag2: number[];
  readonly api_kouku2: ApiKouku;
}

export interface ApiSortieLdAirBattle extends ApiBattleNormal {
}

// combined battle
export interface ApiCombinedBattle extends ApiBattle {
  readonly api_ship_ke_combined: number[];
  readonly api_ship_lv_combined: number[];
  readonly api_e_nowhps_combined: number[];
  readonly api_e_maxhps_combined: number[];
  readonly api_eSlot_combined: number[][];
  readonly api_eParam_combined: number[][];
}

// combined combined battle
export interface ApiCombinedCombinedBattle extends ApiCombinedBattle {
  readonly api_f_nowhps_combined: number[];
  readonly api_f_maxhps_combined: number[];
  readonly api_fParam_combined: number[][];
}

// night battle
export interface ApiMidnightBattle extends ApiBattleBase {
  readonly api_touch_plane: number[];
  readonly api_flare_pos: number[];
  readonly api_hougeki: ApiHougekiMidnight;
}

// night sp battle
export interface ApiMidnightSpBattle extends ApiMidnightBattle {
  readonly api_n_support_flag: number;
  readonly api_n_support_info: ApiSupportInfo;
}

export interface ApiEcMidnightBattle extends ApiMidnightBattle {
  readonly api_ship_ke_combined: number[];
  readonly api_ship_lv_combined: number[];
  readonly api_e_nowhps_combined: number[];
  readonly api_e_maxhps_combined: number[];
  readonly api_eSlot_combined: number[][];
  readonly api_eParam_combined: number[][];
  readonly api_active_deck: number[];
}

// battle info
export type ApiMiddayBattleType = 
  ApiSortieBattle | 
  ApiSortieAirBattle |
  ApiSortieLdAirBattle | 
  ApiCombinedBattle | 
  ApiCombinedCombinedBattle;

export type ApiMidnightBattleType = 
  ApiMidnightBattle |
  ApiMidnightSpBattle | 
  ApiEcMidnightBattle;

export type ApiBattleStartType = ApiMiddayBattleType | ApiMidnightBattleType;

export interface PrvBattleInfo {
  readonly uuid: string;
  readonly map: ApiMap;
  readonly mapLv: MapLv;
  readonly index: number;
  readonly cell_no: number;
  readonly isBoss: boolean;
  readonly battleType: BattleType;
  readonly midday: ApiMiddayBattleType | null;
  readonly midnight: ApiMidnightBattleType | null;
  readonly result: ApiBattleResult | null;
  readonly middayJson: string | null;
  readonly midnightJson: string | null;
}

export interface ApiSquadronPlane {
  readonly api_mst_id: number;
  readonly api_count: number;
}

type numberarrayORnull = number[] | null;
export interface ApiAirBaseAttack {
  readonly api_base_id: number;
  readonly api_stage_flag: number[];
  readonly api_plane_from: numberarrayORnull[];
  readonly api_squadron_plane: ApiSquadronPlane[];
  readonly api_stage1: ApiStage1;
  readonly api_stage2: ApiStage2;
  readonly api_stage3: ApiStage3;
  readonly api_stage3_combined: ApiStage3;
}

export interface ApiAirFire {
  readonly api_idx: number;
  readonly api_kind: number;
  readonly api_use_items: number[];
}

interface ApiKouku {
  readonly api_plane_from: numberarrayORnull[];
  readonly api_stage1: ApiStage1;
  readonly api_stage2: ApiStage2;
  readonly api_stage3: ApiStage3;
  readonly api_stage3_combined?: ApiStage3;
}

type numberORstring = number | string;
export interface ApiHougeki {
  readonly api_at_eflag: number[];
  readonly api_at_list: number[];
  readonly api_at_type: number[];
  readonly api_df_list: number[][];
  readonly api_si_list: numberORstring[][]; // カットイン装備ID
  readonly api_cl_list: number[][];
  readonly api_damage: number[][];
}

export interface ApiHougekiMidnight {
  readonly api_at_eflag: number[];
  readonly api_at_list: number[];
  readonly api_n_mother_list: number[];
  readonly api_df_list: number[][];
  readonly api_si_list: numberORstring[][];
  readonly api_cl_list: number[][];
  readonly api_sp_list: number[];
  readonly api_damage: number[][];
}

export const ApiDispSeiku = {
  kinkou : 0, // 制空均衡, 
  kakuho : 1, // 制空権確保
  yuusei : 2, // 航空優勢, 
  ressei : 3, // 航空劣勢
  sousitu : 4, // 制空権喪失
} as const;
export type ApiDispSeiku = Unpacked<typeof ApiDispSeiku>;

interface ApiStage1 {
  readonly api_f_count: number;
  readonly api_f_lostcount: number;
  readonly api_e_count: number;
  readonly api_e_lostcount: number;
  readonly api_disp_seiku: ApiDispSeiku;
  readonly api_touch_plane: number[];
}

interface ApiStage2 {
  readonly api_f_count: number;
  readonly api_f_lostcount: number;
  readonly api_e_count: number;
  readonly api_e_lostcount: number;
}

interface ApiStage3 {
  readonly api_frai_flag: number[] | null;
  readonly api_erai_flag: number[] | null;
  readonly api_fbak_flag: number[] | null;
  readonly api_ebak_flag: number[] | null;
  readonly api_fcl_flag: number[] | null;
  readonly api_ecl_flag: number[] | null;
  readonly api_fdam: number[] | null;
  readonly api_edam: number[] | null;
}

export interface ApiRaigeki {
  readonly api_frai: number[];
  readonly api_fcl: number[];
  readonly api_fdam: number[];
  readonly api_fydam: number[];
  readonly api_erai: number[];
  readonly api_ecl: number[];
  readonly api_edam: number[];
  readonly api_eydam: number[];
}

// req practice param
interface ApiPracticeBattleParam {
  readonly api_verno: string;
  readonly api_deck_id: string;
  readonly api_formation_id: string;
  readonly api_enemy_id: string;
}

// req practice battle result
export interface ApiPracticeBattleResult {
  readonly api_ship_id: number[];
  readonly api_win_rank: WinRank;
  readonly api_get_exp: number;
  readonly api_mvp: number;
  readonly api_member_lv: number;
  readonly api_member_exp: number;
  readonly api_get_base_exp: number;
  readonly api_get_ship_exp: number[];
  readonly api_get_exp_lvup: number[][];
  readonly api_enemy_info: ApiEnemyInfo;
}

export interface PrvPracticeBattleInfo {
  readonly deck_id: number;
  readonly result: ApiPracticeBattleResult;
}


export type WinRank = 'S' | 'A' | 'B' | 'C' | 'D' | 'E';

// 
export interface ApiBattleResult {
  readonly api_ship_id: number[];
  readonly api_win_rank: WinRank;
  readonly api_get_exp: number;
  readonly api_mvp: number;
  readonly api_member_lv: number;
  readonly api_member_exp: number;
  readonly api_get_base_exp: number;
  readonly api_get_ship_exp: number[];
  readonly api_get_exp_lvup: number[][];
  readonly api_dests: number;
  readonly api_destsf: number;
  readonly api_quest_name: string;
  readonly api_quest_level: number;
  readonly api_enemy_info: ApiEnemyInfo;
  readonly api_first_clear: number; // 0:cleared 1 is first clear(EO含む)
  readonly api_mapcell_incentive?: number;
  readonly api_get_flag: number[];
  readonly api_get_ship: ApiBattleGetShip;
  readonly api_get_eventflag: number; // 0: noevent
  readonly api_get_exmap_rate: number; // EOクリア時戦果
  readonly api_get_exmap_useitem_id: number; // EOクリア時Item
  readonly api_escape_flag: number;
  readonly api_escape?: null | undefined | {
    readonly api_escape_idx: number; // 退避艦ID
    readonly api_tow_idx: number; // 護衛艦ID
  };
  readonly api_get_useitem?: ApiGetItem;

}

// sortie battle result
export interface ApiSortieBattleResult extends ApiBattleResult {
}

const InvalidApiEnemyInfo = (): ApiEnemyInfo => ({
  api_level: '',
  api_rank: '',
  api_deck_name: '',
});

const InvalidApiBattleGetShip = (): ApiBattleGetShip => ({
  api_ship_id: 0,
  api_ship_type: '',
  api_ship_name: '',
  api_ship_getmes: ''
});

/*
  api callback
*/
type CallbackApiPort = (arg: any) => void;
type CallbackApiPracticeBattle = (arg: PrvPracticeBattleInfo) => void;
type CallbackApiSortieBattle = (arg: PrvBattleInfo) => void;
type CallbackApiCombinedBattle = (arg: PrvBattleInfo) => void;
type CallbackApiCreateItem = (arg: ApiCreateItemWithParam) => void;
type CallbackApiDestroyItem2 = (arg: ApiDestroyItem2WithParam) => void;
type CallbackApiCreateShip = (arg: ApiCreateShipWithParam) => void;
type CallbackApiDestroyShip = (arg: ApiDestroyShipWithParam) => void;
type CallbackApiRemodelSlot = (arg: ApiRemodelSlotWithParam) => void;
type CallbackApiMapStart = (arg: ApiMapStart) => void;
type CallbackApiMapNext = (arg: ApiMapNext) => void;
type CallbackApiMissionResult = (arg: ApiMissionResult) => void;
type CallbackApiQuestList = (arg: ApiQuestList) => void;
type CallbackApiNyukyoStart = () => void;
type CallbackApiHokyuCharge = (arg: ApiHokyuCharge) => void;
type CallbackApiPowerUp = (api_data: ApiPowerUpWothParam) => void;
type CallbackMaterialUpdated = () => void;
type CallbackShipCountUpdated = () => void;
type CallbackSlotitemCountUpdated = () => void;
type CallbackBasicUpdated = () => void;
type CallbackBattleStart = (arg: ApiBattleStartType) => void;

type CallbackArg =
  undefined |
  PrvPracticeBattleInfo |
  ApiBattleStartType |
  PrvBattleInfo |
  ApiCreateItemWithParam |
  ApiDestroyItem2WithParam |
  ApiCreateShipWithParam |
  ApiDestroyShipWithParam |
  ApiRemodelSlot |
  ApiMapStart |
  ApiMapNext |
  ApiMissionResult |
  ApiQuestList |
  ApiHokyuCharge |
  ApiPowerUpWothParam
  ;

type CallbackFunc = 
  CallbackApiPort |
  CallbackApiPracticeBattle |
  CallbackApiSortieBattle |
  CallbackApiCombinedBattle |
  CallbackApiCreateItem |
  CallbackApiCreateShip |
  CallbackApiDestroyShip |
  CallbackApiRemodelSlot |
  CallbackApiMapStart |
  CallbackApiMapNext |
  CallbackApiMissionResult |
  CallbackApiQuestList |
  CallbackApiNyukyoStart |
  CallbackApiHokyuCharge |
  CallbackApiPowerUp |
  CallbackMaterialUpdated | 
  CallbackShipCountUpdated |
  CallbackSlotitemCountUpdated |
  CallbackBasicUpdated |
  CallbackBattleStart;

type Calltype =
  typeof Api.PORT_PORT |
  typeof Api.REQ_PRACTICE_BATTLE_RESULT |
  typeof Api.REQ_SORTIE_BATTLERESULT |
  typeof Api.REQ_COMBINED_BATTLE_BATTLERESULT |
  typeof Api.REQ_KOUSYOU_CREATEITEM |
  typeof Api.REQ_KOUSYOU_DESTROYITEM2 |
  typeof Api.REQ_KOUSYOU_CREATESHIP  |
  typeof Api.REQ_KOUSYOU_DESTROYSHIP |
  typeof Api.REQ_KOUSYOU_REMODEL_SLOT |
  typeof Api.REQ_MAP_START |
  typeof Api.REQ_MAP_NEXT |
  typeof Api.REQ_MISSION_RESULT |
  typeof Api.GET_MEMBER_REQUIRE_INFO |
  typeof Api.GET_MEMBER_QUESTLIST |
  typeof Api.REQ_NYUKYO_START |
  typeof Api.REQ_HOKYU_CHARGE |
  typeof Api.REQ_KAISOU_POWERUP |
  'material-updated' |
  'ship-count-updated' |
  'slotitem-count-updated' |
  'basic-updated' |
  'battle-start';

type Callback = 
  [ typeof Api.PORT_PORT, CallbackApiPort ] |
  [ typeof Api.REQ_PRACTICE_BATTLE_RESULT, CallbackApiPracticeBattle ] |
  [ typeof Api.REQ_SORTIE_BATTLERESULT, CallbackApiSortieBattle ] |
  [ typeof Api.REQ_COMBINED_BATTLE_BATTLERESULT, CallbackApiCombinedBattle ] |
  [ typeof Api.REQ_KOUSYOU_CREATEITEM, CallbackApiCreateItem ] |
  [ typeof Api.REQ_KOUSYOU_DESTROYITEM2, CallbackApiDestroyItem2 ] |
  [ typeof Api.REQ_KOUSYOU_CREATESHIP, CallbackApiCreateShip]  |
  [ typeof Api.REQ_KOUSYOU_DESTROYSHIP, CallbackApiDestroyShip ] |
  [ typeof Api.REQ_KOUSYOU_REMODEL_SLOT, CallbackApiRemodelSlot ] |
  [ typeof Api.REQ_MAP_START, CallbackApiMapStart ] |
  [ typeof Api.REQ_MAP_NEXT, CallbackApiMapNext ] |
  [ typeof Api.REQ_MISSION_RESULT, CallbackApiMissionResult ] |
  [ typeof Api.GET_MEMBER_REQUIRE_INFO, CallbackBasicUpdated ] |
  [ typeof Api.GET_MEMBER_QUESTLIST, CallbackApiQuestList ] |
  [ typeof Api.REQ_NYUKYO_START, CallbackApiNyukyoStart ] |
  [ typeof Api.REQ_HOKYU_CHARGE, CallbackApiHokyuCharge ] |
  [ typeof Api.REQ_KAISOU_POWERUP, CallbackApiPowerUp ] |
  [ 'material-updated', CallbackMaterialUpdated ] |
  [ 'ship-count-updated', CallbackShipCountUpdated ] |
  [ 'slotitem-count-updated', CallbackSlotitemCountUpdated ] |
  [ 'basic-updated', CallbackBasicUpdated ] |
  [ 'battle-start', CallbackBattleStart ]
;

interface CallbackInfo {
  readonly id: number;
  readonly cb: [Calltype, CallbackFunc];
}

export class ApiCallback {
  private static callback_id: number = 1;
  private static callbacks: CallbackInfo[] = [];

  public static set(cb: Callback): number {
    const id = ApiCallback.callback_id++;
    ApiCallback.callbacks.push({ id: id, cb: cb });
    return id;
  }

  public static unset(id: number): void {
    const cbs = ApiCallback.callbacks;
    const idx = cbs.findIndex(cb => cb.id === id);
    if (idx !== -1) {
      cbs.splice(idx, 1);
    }
  }

  public static call(calltype: Calltype, arg: CallbackArg): void {
    const cbs = ApiCallback.callbacks;
    const cb = cbs.filter((cb) => cb.cb[0] === calltype);
    cb.forEach((cb) => cb.cb[1](arg));
  }
}


class RMap {
  private static rmap: {
    [ship_id: number]: number[]
  } = {};

  public static find(ship_id: number): number[] | undefined {
    return RMap.rmap[ship_id];
  }

  public static set(ship_id: number, rmap: number[]): void {
    RMap.rmap[ship_id] = rmap;
  }
}

const qsParse = <T>(query: string): T => {
  return (qs.parse(query) as unknown) as T;
};


interface Req {
  [api: string]: string | undefined;
}

class SvDataPrivate {
  public static arg_create_ship: ApiCreateShipWithParam | undefined;
  public static arg_remodel_slotitem: ApiSlotitem | undefined;
}

export interface NotifyData {
  api: Api;
  data: string;
}

export class SvData {

  public static readonly header = 'svdata=';

  private mstDataOk = false;
  private shipDataOk = false;
  private slotitemDataOk = false;
  private apiData: ApiData = {
    api_mst_ship: [],
    api_mst_slotitem_equiptype: [],
    api_mst_equip_exslot: [],
    api_mst_equip_exslot_ship: [],
    api_mst_stype: [],
    api_mst_slotitem: [],
    api_mst_furnituregraph: [],
    api_mst_useitem: [],
    api_mst_payitem: [],
    api_mst_maparea: [],
    api_mst_mapinfo: [],
    api_mst_mapbgm: [],
    api_mst_mission: [],
    api_mst_shipupgrade: [],
    api_mst_bgm: [],
    api_mst_equip_ship: [],
    api_mst_furniture: [],
    api_mst_shipgraph: [],
    api_material: [],
    api_air_base: [],
    api_deck: [],
    api_deck_port: [],
    api_ship: [],
    api_slot_item: [],
    api_furniture: [],
    api_kdock: [],
    api_ndock: [],
    api_useitem: [],
    api_questlist: null,
    api_mapinfo: [],
    api_mission: [],
    api_max_num: 0,
    api_log: [],
    api_war: InvalidApiSortieConditionsApiWar(),
    api_basic: InvalidApiBasic(),
    api_event_object: InvalidApiEventObject(),
    api_friendly_setting: InvalidApiFriendlySetting(),
    api_combined_flag: 0,
    api_p_bgm_id: 0,
    api_parallel_quest_count: 0,
    api_dest_ship_slot: 0,
    api_c_flag: 0,
    api_req_map: [],
    api_remodel_slot_list: [],
    api_position_id: 0,
    api_skin_id: 0,
    api_server_id: ApiServerId.unknown,

    api_preset_deck: InvalidApiPresetDeck(),
    api_practice_battle_result: null,
    api_remodel_slot_detail: null,

    prv_battle_infos: [],
    prv_battle_map_info: null,
    prv_in_map: false,
  };
  private apiReq: Req = {};
  private materialUpdated: boolean = false;
  private shipCountUpdated: boolean = false;
  private slotitemCountUpdated: boolean = false;

  public constructor() {
  }

  public toJson(): string {
    console.log('to json api req', this.apiReq);
    return JSON.stringify(this);
  }

  public setFromJson(json: string) {
    console.time('copy svdata');
    const source: SvData = JSON.parse(json);
    Object.assign(this, source);
    console.timeEnd('copy svdata');
  }

  public update(api: Api, data: string): void {
    try {
      this.materialUpdated = false;
      this.shipCountUpdated = false;
      this.slotitemCountUpdated = false;

      // parse json
      if (data.startsWith(SvData.header)) {
        data = data.substring(SvData.header.length);
      }
      const data_root: ApiDataRoot = JSON.parse(data);

      // check result
      if (! data_root.api_result) {
        throw new Error('api result ng');
      }

      // api data
      const api_data = data_root.api_data;

      // update data
      switch (api) {
        case Api.API_WORLD_GET_ID:
          this.worldGetId(api_data);
          break;

        case Api.REQ_MEMBER_GET_INCENTIVE:
          break;

        case Api.START2_GET_DATA:
          this.startGetData2(api_data);
          break;

        case Api.PORT_PORT:
          this.portPort(api_data);
          break;

        case Api.GET_MEMBER_MISSION:
          this.getMemberMission(api_data as ApiMissionList);
          break;

        case Api.GET_MEMBER_USEITEM:
          this.getMemberUseItem(api_data as ApiUseItem[]);
          break;

        case Api.GET_MEMBER_PAYITEM:
          break;

        case Api.GET_MEMBER_BASIC:
          this.getMemberBasic(api_data as ApiBasic);
          break;

        case Api.REQ_MISSION_RETURN_INSTRUCTION:
          this.reqMissionReturnInstruction(api_data as ApiMissionRetrunInstruction);
          break;

        case Api.REQ_MISSION_START:
          break;

        case Api.REQ_MISSION_RESULT:
          this.reqMissionResult(api_data as ApiMissionResult);
          break;

        case Api.GET_MEMBER_DECK:
          this.getMemberDock(api_data as ApiDeckPort[]);
          break;

        case Api.GET_MEMBER_FURNITURE:
          this.getMemberFurniture(api_data as ApiFurniture[]);
          break;

        case Api.REQ_MEMBER_UPDATEDECKNAME:
          this.reqMemberUpdateDeckName();
          break;

        case Api.REQ_MEMBER_SET_FRIENDLY_REQUEST:
          this.reqMemberSetFriendlyRequest();
          break;

        case Api.REQ_HENSEI_LOCK:
          this.reqHenseiLock();
          break;

        case Api.REQ_HENSEI_COMBINED:
          this.reqHenseiCombined(api_data as ApiCombined);
          break;

        case Api.REQ_HENSEI_CHANGE:
          this.reqHenseiChange();
          break;

        case Api.REQ_HENSEI_PRESET_SELECT:
          this.reqHenseiPresetSelect(api_data as ApiPresetSelect);
          break;

        case Api.REQ_KAISOU_LOCK:
          this.reqKaisouLock(api_data as ApiSlotitemLock);
          break;

        case Api.REQ_KAISOU_POWERUP:
          this.reqKaisouPowerUp(api_data as ApiPowerUp);
          break;

        case Api.REQ_KAISOU_SLOT_DEPRIVE:
          this.reqKaisouSlotDeprive(api_data as ApiSlotDeprive);
          break;

        case Api.REQ_KAISOU_REMODELING:
          break;

        case Api.REQ_KAISOU_MARRIGE:
          this.reqKaisouMarrige(api_data as ApiMarrige);
          break;

        case Api.GET_MEMBER_REQUIRE_INFO:
          this.getMemberRequireInfo(api_data);
          break;

        case Api.GET_MEMBER_QUESTLIST:
          this.getMemberQuestList(api_data);
          break;

        case Api.GET_MEMBER_MAPINFO:
          this.getMemberMapInfo(api_data as ApiMapInfoList);
          break;

        case Api.GET_MEMBER_MATERIAL:
          this.getMemberMaterial(api_data as ApiMaterial[]);
          break;

        case Api.GET_MEMBER_NDOCK:
          this.getMemberNDock(api_data as ApiNDock[]);
          break;

        case Api.GET_MEMBER_SHIP_DECK:
          this.getMemberShipDeck(api_data as ApiShipDeck)
          break;

        case Api.REQ_KOUSYOU_GETSHIP:
          this.reqKousyouGetShip(api_data as ApiGetShip);
          break;

        case Api.REQ_HOKYU_CHARGE:
          this.reqHokyuCharge(api_data as ApiHokyuCharge);
          break;

        case Api.GET_MEMBER_KDOCK:
          this.getMemberKDock(api_data as ApiKDock[]);
          break;

        case Api.REQ_KOUSYOU_REMODEL_SLOTLIST:
          this.reqKousyouRemodelSlotList(api_data as ApiRemodelSlotItem[]);
          break;

        case Api.REQ_KOUSYOU_REMODEL_SLOTLIST_DETAIL:
          this.reqKousyouRemodelSlotlistDetail(api_data as ApiRemodelSlotlistDetail);
          break;

        case Api.REQ_KOUSYOU_REMODEL_SLOT:
          this.reqKousyouRemodelSlot(api_data as ApiRemodelSlot);
          break;

        case Api.REQ_KOUSYOU_CREATEITEM:
          this.reqKousyouCreateItem(api_data as ApiCreateItem);
          break;

        case Api.REQ_KOUSYOU_DESTROYITEM2:
          this.reqKousyouDestroyItem2(api_data as ApiDestroyItem2);
          break;

        case Api.REQ_KOUSYOU_CREATESHIP:
          this.reqKousyouCreateShip(api_data as ApiResponse);
          break;

        case Api.REQ_KOUSYOU_DESTROYSHIP:
          this.reqKousyouDestroyShip(api_data as ApiDestroyShip);
          break;

        case Api.GET_MEMBER_SHIP2:
          this.resGetMemberShip2(api_data as ApiShip[]);
          break;

        case Api.GET_MEMBER_SHIP3:
          this.resGetMemberShip3(api_data as ApiShip3);
          break;

        case Api.REQ_KAISOU_SLOTSET:
          this.reqKaisouSlotset();
          break;

        case Api.REQ_KAISOU_OPEN_EXSLOT:
          this.reqKaisouOpenExSlot();
          break;

        case Api.REQ_KAISOU_UNSETSLOT_ALL:
          this.reqKaisouUnsetslotAll();
          break;

        case Api.REQ_KAISOU_SLOT_EXCHANGE_INDEX:
          this.reqKaisouSlotExchangeIndex(api_data as ApiChangeSlotExchangeIndex);
          break;

        case Api.REQ_QUEST_CLEARITEMGET:
          this.reqClearItemGet(api_data as ApiClearItemGet);
          break;

        case Api.GET_MEMBER_SLOT_ITEM:
          this.getMemberSlotitem(api_data as ApiSlotitem[]);
          break;

        case Api.REQ_MAP_START:
          this.reqMapStart(api_data as ApiMapStart);
          break;

        case Api.REQ_MAP_NEXT:
          this.reqMapNext(api_data as ApiMapNext);
          break;

        case Api.REQ_MAP_SELECT_EVENTMAP_RANK:
          this.reqMapSelectEventmapRank(api_data as ApiSelectEventmapRank);
          break;

        case Api.REQ_SORTIE_BATTLE:
          this.reqSortieBattle(api_data as ApiSortieBattle, data);
          break;

        case Api.REQ_SORTIE_AIRBATTLE:
          this.reqSortieAirBattle(api_data as ApiSortieAirBattle, data);
          break;
  
        case Api.REQ_SORTIE_LD_AIRBATTLE:
          this.reqSortieLdAirBattle(api_data as ApiSortieLdAirBattle, data);
          break;

        case Api.REQ_BATTLE_MIDNIGHT_BATTLE:
          this.reqMidnightBattle(api_data as ApiMidnightBattle, data);
          break;

        case Api.REQ_BATTLE_MIDNIGHT_SP_BATTLE:
          this.reqMidnightSpBattle(api_data as ApiMidnightSpBattle, data);
          break;
  
        case Api.REQ_SORTIE_BATTLERESULT:
          this.reqSortieBattleResult(api_data as ApiSortieBattleResult);
          break;

        case Api.REQ_PRACTICE_BATTLE:
          this.reqPracticeBattle();
          break;

        case Api.REQ_PRACTICE_BATTLE_RESULT:
          this.reqPracticeBattleResult(api_data as ApiPracticeBattleResult);
          break;

        case Api.REQ_COMBINED_BATTLE_BATTLE:
          this.reqCombinedCombinedBattle(api_data as ApiCombinedCombinedBattle, data);
          break;

        case Api.REQ_COMBINED_BATTLE_EACH_BATTLE:
          this.reqCombinedEachBattle(api_data as ApiCombinedCombinedBattle, data);
          break;
  
        case Api.REQ_COMBINED_BATTLE_EC_BATTLE:
          this.reqCombinedEcBattle(api_data as ApiCombinedBattle, data);
          break;

        case Api.REQ_COMBINED_BATTLE_LD_AIRBATTLE:
          this.reqCombinedBattleLdAirBattle(api_data as ApiCombinedBattle, data);
          break;
  
        case Api.REQ_COMBINED_BATTLE_EC_MIDNIGHT_BATTLE:
          this.reqCombinedEcMidnightBattle(api_data as ApiEcMidnightBattle, data);
          break;

        case Api.REQ_COMBINED_BATTLE_BATTLERESULT:
          this.reqCombinedBattleResult(api_data as ApiCombinedBattleResult);
          break;
  
        case Api.REQ_NYUKYO_START:
          this.reqNyukyoStart();
          break;

        case Api.REQ_NYUKYO_SPEEDCHANGE:
          this.reqNyukyoSpeedChange();
          break;

        case Api.REQ_HENSEI_PRESET_REGISTER:
          this.reqHenseiPresetRegister(api_data as ApiPresetRegister);
          break;

        case Api.REQ_HENSEI_PRESET_DELETE:
          this.reqHenseiPresetDelete();
          break;

        case Api.GET_MEMBER_PRESET_DECK:
          this.getMemberPresetDeck(api_data as ApiPresetDeck);
          break;

        case Api.SORTIE_CONDITIONS:
          this.getMemberSortieConditions(api_data as ApiSortieConditions)
          break;

        case Api.REQ_AIR_CORPS_SET_ACTION:
          this.reqAirCorpsSetAction();
          break;

        case Api.REQ_AIR_CORPS_SET_PLANE:
          this.reqAirCorpsSetPlane(api_data as ApiAirCorpsSetPlane);
          break;

        case Api.REQ_AIR_CORPS_SUPPLY:
          this.reqAirCorpsSupply(api_data as ApiAirBaseCorpsSupply);
          break;

        case Api.SET_OSS_CONDITION:
          break;

        default:
          break;
      }

    } catch (e) {
      console.log(e);
    }

    if (this.materialUpdated) {
      ApiCallback.call('material-updated', undefined);
    }
    if (this.shipCountUpdated) {
      ApiCallback.call('ship-count-updated', undefined);
    }
    if (this.slotitemCountUpdated) {
      ApiCallback.call('slotitem-count-updated', undefined);
    }
  }

  public get isMstDataOk() {
    return this.mstDataOk;
  }

  public get isShipDataOk() {
    return this.shipDataOk;
  }

  public get isSlotitemDataOk() {
    return this.slotitemDataOk;
  }

  public setReq(api: Api, query: string): void {
    this.apiReq[api] = query;
  }

  public getReq(api: Api): string | undefined {
    const value = this.apiReq[api];
    if (value) {
      this.apiReq[api] = undefined;
    }
    return value;
  }

  public worldGetId(api_data: ApiWorldId): void {
    Object.assign(this.apiData, {api_server_id: api_data.api_world_id });
    console.log('server id:', this.apiData.api_server_id );
  }

  public get serverId(): ApiServerId {
    return this.apiData.api_server_id;
  }

  public setServerId(server_id: number): void {
    Object.assign(this.apiData, {api_server_id: server_id});
    console.log('server id:', this.apiData.api_server_id);
  }

  private startGetData2(api_data: any): void {
    console.time('start2 data');
    assignSafeE(this.apiData, api_data);
    console.timeEnd('start2 data');
    this.mstDataOk = true;
  }

  private portPort(api_data: any): void {
    assignSafeE(this.apiData, api_data);
    this.shipDataOk = true;
    this.apiData.prv_in_map = false;
    ApiCallback.call(Api.PORT_PORT, api_data);
  }

  private getMemberMission(api_data: ApiMissionList): void {
    assignSafeE(this.apiData.api_mission, api_data.api_list_items);
  }

  private getMemberUseItem(api_data: ApiUseItem[]): void {
    replaceArray(this.apiData.api_useitem, api_data);
  }

  private getMemberBasic(api_data: ApiBasic): void {
    Object.assign(this.apiData.api_basic, api_data);
    ApiCallback.call('basic-updated', undefined);
  }

  private reqMissionReturnInstruction(api_data: ApiMissionRetrunInstruction): void {
    const query = this.getReq(Api.REQ_MISSION_RETURN_INSTRUCTION);
    if (query) {
      const req: ApiMissionReturnInstructionParam = qsParse(query);
      const deck = this.deckPort(parseInt(req.api_deck_id));
      if (deck) {
        replaceArray(deck.api_mission, api_data.api_mission);
      }
    }
  }

  private reqMissionResult(api_data: ApiMissionResult): void {
    this.updateMaterial(api_data.api_get_material, true);
    const updateItem = (item: ApiGetItem | undefined, flags: number[], index: number): void => {
      if (item) {
        if (-1 === item.api_useitem_id) {
          // to itemid
          const itemId = flags[index] ?? -1;
          switch (itemId) {
            case ApiItemId.build_kit:
              this.updateMaterialById(ApiMaterialId.BUILD_KIT, item.api_useitem_count, true);
              break;
            case ApiItemId.fast_repair:
              this.updateMaterialById(ApiMaterialId.FAST_REPAIR, item.api_useitem_count, true);
              break;
            case ApiItemId.fast_build:
              this.updateMaterialById(ApiMaterialId.FAST_BUILD, item.api_useitem_count, true);
              break;
          }
        } else {

          // 改修素材
          if (ApiItemId.remodel_kit === item.api_useitem_id) {
            this.updateMaterialById(ApiMaterialId.REMODEL_KIT, item.api_useitem_count, true);
          } else {
            this.useitemAdd(item.api_useitem_id, item.api_useitem_count);
          }
        }
      }
    };
    updateItem(api_data.api_get_item1, api_data.api_useitem_flag, 0);
    updateItem(api_data.api_get_item2, api_data.api_useitem_flag, 1);

    ApiCallback.call(Api.REQ_MISSION_RESULT, api_data);
  }

  private getMemberDock(api_data: ApiDeckPort[]): void {
    replaceArray(this.apiData.api_deck_port, api_data);
  }

  private getMemberFurniture(api_data: ApiFurniture[]): void {
    replaceArray(this.apiData.api_furniture, api_data);
  }

  private reqMemberUpdateDeckName(): void {
    const query = this.getReq(Api.REQ_MEMBER_UPDATEDECKNAME);
    if (query) {
      const req: ApiUpdateDeckNameParam = qsParse(query);
      const deck = this.deckPort(parseInt(req.api_deck_id));
      if (deck) {
        //console.log(deck);
        Object.assign(deck, {
          api_name_id: req.api_name_id,
          api_name: req.api_name
        });
        //console.log(deck);
      }
    }
  }

  private reqMemberSetFriendlyRequest(): void {
    const query = this.getReq(Api.REQ_MEMBER_SET_FRIENDLY_REQUEST);
    if (query) {
      const req: ApisSetFriendlyRequestParam = qsParse(query);
      const api_request_flag = parseInt(req.api_request_flag);
      const api_request_type = parseInt(req.api_request_type);
      if (isFinite(api_request_flag) && isFinite(api_request_type)) {
        Object.assign(
          this.apiData.api_friendly_setting,
          { api_request_flag,
            api_request_type,
          }
        );
      }
    }
  }

  private reqHenseiLock(): void {
    const query = this.getReq(Api.REQ_HENSEI_LOCK);
    if (query) {
      const req: ApiShipLockParam = qsParse(query);
      const ship = this.ship(parseInt(req.api_ship_id));
      if (ship) {
        //console.log(ship);
        Object.assign(ship, { api_locked: ship.api_locked ? 0 : 1 });
        //console.log(ship);
      }
    }
  }

  private reqHenseiCombined(api_data: ApiCombined) {
    const query = this.getReq(Api.REQ_HENSEI_COMBINED);
    if (query) {
      const req: ApiCombinedParam = qsParse(query);
      const api_combined_flag = parseInt(req.api_combined_type);
      if (isFinite(api_combined_flag)) {
        //console.log(req);
        Object.assign(this.apiData, { api_combined_flag, });
      }
    }
  }

  private reqHenseiChange(): void {
    const query = this.getReq(Api.REQ_HENSEI_CHANGE);
    if (query) {
      const req: ApiHenseiChangeParam = qsParse(query);
      const deckPort = this.deckPort(parseInt(req.api_id));
      const api_ship_idx = parseInt(req.api_ship_idx);
      const api_ship_id = parseInt(req.api_ship_id);
      if (deckPort && isFinite(api_ship_idx) && isFinite(api_ship_id)) {
        // all clear
        if (-2 === api_ship_id) {
          for (let i = 1; i < deckPort.api_ship.length; ++i) {
            deckPort.api_ship.splice(i, 1, -1);
          }
          return;
        }

        // set -> empty
        if (-1 === api_ship_id) {
          deckPort.api_ship.splice(api_ship_idx, 1);
          deckPort.api_ship.push(-1);
          return;
        }
        // empty -> set
        if (-1 === deckPort.api_ship[api_ship_idx]) {
          deckPort.api_ship.splice(api_ship_idx, 1, api_ship_id);
          return;
        }

        // change
        const shipFromIdx = deckPort.api_ship.indexOf(api_ship_id);
        if (shipFromIdx !== -1) {
          const shipTo = deckPort.api_ship[api_ship_idx];
          deckPort.api_ship.splice(api_ship_idx, 1, api_ship_id);
          deckPort.api_ship.splice(shipFromIdx, 1, shipTo);
          return;
        }

        //
        deckPort.api_ship.splice(api_ship_idx, 1, api_ship_id);
        return;
      }
    }
  }

  private reqHenseiPresetSelect(api_data: ApiPresetSelect): void {
    const query = this.getReq(Api.REQ_HENSEI_PRESET_SELECT);
    const deckPort = this.deckPort(api_data.api_id);
    if (deckPort) {
      Object.assign(deckPort, api_data);
      replaceArray(deckPort.api_mission, api_data.api_mission);
      replaceArray(deckPort.api_ship, api_data.api_ship);
    }

    // update preset
    if (query) {
      const req: ApiPresetSelectParam = qsParse(query);
      const preset = this.presetDeckFromNo(parseInt(req.api_preset_no));
      if (preset) {
        replaceArray(preset.api_ship, api_data.api_ship);
      }
    }
  }

  private reqKaisouLock(api_data: ApiSlotitemLock): void {
    const query = this.getReq(Api.REQ_KAISOU_LOCK);
    if (query) {
      const req: ApiSlotitemLockParam = qsParse(query);
      const slotitem = this.slotitem(parseInt(req.api_slotitem_id));
      if (slotitem) {
        //ship.api_locked
        //console.log(slotitem);
        Object.assign(slotitem, Object.assign({}, api_data));
        //console.log(slotitem);
      }
    }
  }

  private reqKaisouPowerUp(api_data: ApiPowerUp): void {
    if (api_data.api_powerup_flag) {
      this.updateShip([api_data.api_ship]);
      this.updateDeckPort(api_data.api_deck);

      const query = this.getReq(Api.REQ_KAISOU_POWERUP);
      if (query) {
        const req: ApiPowerUpParam = qsParse(query);
        const ship_types: ApiShipType[] = [];
        if (req.api_id_items) {
          const ship_ids = req.api_id_items.split(',').map((v) => {
            return parseInt(v);
          });
          ship_ids.forEach((ship_id) => {
            const index = this.apiData.api_ship.findIndex(ship => ship.api_id === ship_id);
            if (index !== -1) {
              const ship = this.apiData.api_ship[index];
              const mst = this.mstShip(ship.api_ship_id);
              if (mst) {
                ship_types.push(mst.api_stype);
              }
              this.apiData.api_ship.splice(index, 1);
              this.shipCountUpdated = true;
              if (req.api_slot_dest_flag === '1') {
                this.destroySlotitem(ship.api_slot);
                this.destroySlotitem([ship.api_slot_ex]);
              }
            }
          });
          ApiCallback.call(Api.REQ_KAISOU_POWERUP, { ship_types, api_data });
        }
      }
    }
  }

  private reqKaisouSlotDeprive(api_data: ApiSlotDeprive): void {
    this.updateShip([api_data.api_ship_data.api_unset_ship, api_data.api_ship_data.api_set_ship]);
  }

  private reqKaisouMarrige(api_data: ApiMarrige): void {
    this.updateShip([api_data]);
  }

  private reqHokyuCharge(api_data: ApiHokyuCharge): void {
    this.updateMaterial(api_data.api_material, false);
    this.updateShip(api_data.api_ship);
    ApiCallback.call(Api.REQ_HOKYU_CHARGE, api_data);
  }

  private getMemberRequireInfo(api_data: any): void {
    assignSafeE(this.apiData, api_data);
    this.slotitemDataOk = true;
    ApiCallback.call(Api.GET_MEMBER_REQUIRE_INFO, undefined);
  }

  private getMemberQuestList(api_data: ApiQuestList): void {
    if (! this.apiData.api_questlist) {
      Object.assign(this.apiData, { api_questlist: api_data });
    } else {
      assignSafeE(this.apiData.api_questlist, api_data);
    }
    ApiCallback.call(Api.GET_MEMBER_QUESTLIST, api_data);
  }

  private getMemberMapInfo(api_data: ApiMapInfoList): void {
    replaceArray(this.apiData.api_mapinfo, api_data.api_map_info);
    replaceArraySafe(this.apiData.api_air_base, api_data.api_air_base);
  }

  private getMemberMaterial(api_data: ApiMaterial[]): void {
    api_data.forEach(m => this.updateMaterialById(m.api_id, m.api_value, false));
  }

  private getMemberNDock(ndocks: ApiNDock[]) {
    replaceArray(this.apiData.api_ndock, ndocks);
  }

  private reqNyukyoStart(): void {
    const query = this.getReq(Api.REQ_NYUKYO_START);
    //console.log(100);
    //console.log(param);
    if (query) {
      const req: ApiNyukyoStartParam = qsParse(query);
      const ship = this.ship(parseInt(req.api_ship_id));
      if (ship) {
        const materials: number[] = [
          0, 0, 0, 0, 0, 0, 0, 0
        ];
        materials[0] = -ship.api_ndock_item[0];
        materials[2] = -ship.api_ndock_item[1];
        if (req.api_highspeed === '1') {
          materials[5] = -1;
          const update = { api_nowhp: ship.api_maxhp };
          if (ship.api_cond < 39) {
            Object.assign(update, { api_cond: 40 });
          }
          Object.assign(ship, update);
        }
        this.updateMaterial(materials, true);
      }
      ApiCallback.call(Api.REQ_NYUKYO_START, undefined);
    }
  }

  private reqNyukyoSpeedChange(): void {
    const query = this.getReq(Api.REQ_NYUKYO_SPEEDCHANGE);
    if (query) {
      const req: ApiNyukyoSpeedChangeParam = qsParse(query);
      const ndock = this.ndock(parseInt(req.api_ndock_id));
      if (ndock) {
        Object.assign(ndock, NDockEmpty());
      }
    }
  }

  private reqHenseiPresetRegister(api_data: ApiPresetRegister): void {
    //console.log(this.apiData.api_preset_deck);
    //console.log(this.apiData.api_preset_deck.api_deck[api_data.api_preset_no.toString()]);
    //console.log(api_data);
    Object.assign(
      this.apiData.api_preset_deck.api_deck[api_data.api_preset_no.toString()],
      api_data);
    replaceArray(
      this.apiData.api_preset_deck.api_deck[api_data.api_preset_no.toString()].api_ship, api_data.api_ship);
    //console.log(this.apiData.api_preset_deck.api_deck[api_data.api_preset_no.toString()]);
  }

  private reqHenseiPresetDelete(): void {
    const query = this.getReq(Api.REQ_HENSEI_PRESET_DELETE);
    if (query) {
      const req: ApiPresetDeleteParam = qsParse(query);
      const preset = this.presetDeckFromNo(parseInt(req.api_preset_no));
      if (preset) {
        //console.log('deleted:'+param.api_preset_no);
        Object.assign(preset, InvalidApiPresetDeck());
        replaceArray(preset.api_ship, []);
      }
    }
  }

  private getMemberPresetDeck(api_data: ApiPresetDeck): void {
    //console.trace(this.apiData.api_preset_deck);
    //console.trace(api_data);
    //Object.assign(this.apiData.api_preset_deck, api_data);

    const fix = (data: ApiPresetDeck): void => {
      for (let i = 1; i <= data.api_max_num; ++i) {
        if (!data.api_deck[i.toString()]) {
          data.api_deck[i.toString()] = InvalidApiPresetDeckInfo();
        }
      }
    };
    //console.trace(api_data);
    fix(api_data);
    Object.assign(this.apiData.api_preset_deck, api_data);
    //console.trace(this.apiData.api_preset_deck);
  }

  private getMemberSortieConditions(api_data: ApiSortieConditions): void {
    Object.assign(this.apiData.api_war, api_data.api_war);
  }

  private reqAirCorpsSetAction(): void {
    const query = this.getReq(Api.REQ_AIR_CORPS_SET_ACTION);
    if (query) {
      const req: ApiAirCorpsSetActionParam = qsParse(query);
      const conv = (s: string): number[] => {
        return s.split(',').map((v) => {
          return parseInt(v);
        });
      };
      const area_id = parseInt(req.api_area_id);
      const base_ids = conv(req.api_base_id);
      const action_kinds = conv(req.api_action_kind);
      if (base_ids.length === action_kinds.length) {
        for (let i = 0; i < base_ids.length; ++i) {
          const base_id = base_ids[i];
          const airbase = this.apiData.api_air_base.find((airbase) => {
            return (airbase.api_area_id === area_id) && (airbase.api_rid === base_id);
          });
          if (airbase) {
            Object.assign(airbase, { api_action_kind: action_kinds[i] });
          }
        }
      }
    }
  }

  private reqAirCorpsSetPlane(api_data: ApiAirCorpsSetPlane): void {
    const query = this.getReq(Api.REQ_AIR_CORPS_SET_PLANE);
    if (query) {
      if (api_data.api_after_bauxite) {
        this.updateMaterialById(ApiMaterialId.BUXITE, api_data.api_after_bauxite, false);
      }

      const req: ApiAirCorpsSetPlaneParam = qsParse(query);
      const area_id = parseInt(req.api_area_id);
      const base_id = parseInt(req.api_base_id);
      const airbase = this.airbaseFrom(area_id, base_id);
      if (airbase) {
        Object.assign(airbase.api_distance, api_data.api_distance);

        if (airbase.api_plane_info) {
          api_data.api_plane_info.forEach((planeinfo) => {
            const index = planeinfoIndex(airbase.api_plane_info, planeinfo.api_squadron_id);
            if (index !== -1) {
              airbase.api_plane_info.splice(index, 1, planeinfo);
            }
          });
        }
      }
    }
  }

  private reqAirCorpsSupply(api_data: ApiAirBaseCorpsSupply): void {
    const query = this.getReq(Api.REQ_AIR_CORPS_SUPPLY);
    if (query) {
      if (api_data.api_after_fuel) {
        this.updateMaterialById(ApiMaterialId.FUAL, api_data.api_after_fuel, false);
      }
      if (api_data.api_after_bauxite) {
        this.updateMaterialById(ApiMaterialId.BUXITE, api_data.api_after_bauxite, false);
      }

      const req: ApiAirBaseCorpsSupplyParam = qsParse(query);
      const area_id = parseInt(req.api_area_id);
      const base_id = parseInt(req.api_base_id);
      const airbase = this.airbaseFrom(area_id, base_id);
      if (airbase) {
        Object.assign(airbase.api_distance, api_data.api_distance);

        if (airbase.api_plane_info) {
          api_data.api_plane_info.forEach((planeinfo) => {
            const index = planeinfoIndex(airbase.api_plane_info, planeinfo.api_squadron_id);
            if (index !== -1) {
              airbase.api_plane_info.splice(index, 1, planeinfo);
            }
          });
        }
      }
    }
  }

  private getMemberShipDeck(api_data: ApiShipDeck): void {
    this.updateShip(api_data.api_ship_data);
    this.updateDeckPort(api_data.api_deck_data);
  }

  private reqKousyouGetShip(data: ApiGetShip): void {
    replaceArray(this.apiData.api_kdock, data.api_kdock);
    this.apiData.api_ship.push(data.api_ship);
    if (data.api_slotitem) {
      data.api_slotitem.forEach((slotitem) => {
        this.apiData.api_slot_item.push(fixApiSlotitemMember(slotitem));
      });
      this.slotitemCountUpdated = true;
    }
    this.shipCountUpdated = true;
  }

  private getMemberKDock(api_data: ApiKDock[]): void {
    replaceArray(this.apiData.api_kdock, api_data);

    if (SvDataPrivate.arg_create_ship) {
      const arg = SvDataPrivate.arg_create_ship;
      const kdock = this.kdock(SvDataPrivate.arg_create_ship.api_kdock_id);
      if (kdock) {
        Object.assign(arg, { api_ship_id: kdock.api_created_ship_id });
        ApiCallback.call(Api.REQ_KOUSYOU_CREATESHIP, arg);
      }
      SvDataPrivate.arg_create_ship = undefined;
    }
  }

  private reqKousyouRemodelSlotList(api_data: ApiRemodelSlotItem[]) {
    replaceArray(this.apiData.api_remodel_slot_list, api_data);
    SvDataPrivate.arg_remodel_slotitem = undefined;
  }

  private reqKousyouRemodelSlotlistDetail(api_data: ApiRemodelSlotlistDetail): void {
    const query = this.getReq(Api.REQ_KOUSYOU_REMODEL_SLOTLIST_DETAIL);
    this.apiData.api_remodel_slot_detail = Object.assign({}, api_data);
    if (query) {
      const req: ApiRemodelSlotlistDetailParam = qsParse(query);
      const slotitem = this.slotitem(parseInt(req.api_slot_id));
      if (slotitem) {
        SvDataPrivate.arg_remodel_slotitem = Object.assign({}, slotitem);
      }
    }
  }

  private reqKousyouRemodelSlot(api_data: ApiRemodelSlot): void {
    const query = this.getReq(Api.REQ_KOUSYOU_REMODEL_SLOT);
    this.updateMaterial(api_data.api_after_material, false);
    api_data.api_use_slot_id.forEach((used) => {
      const index = this.apiData.api_slot_item.findIndex(slotitem => slotitem.api_id === used);
      if (index !== -1) {
        this.apiData.api_slot_item.splice(index, 1);
        this.slotitemCountUpdated = true;
      }
    });

    //
    if (api_data.api_after_slot) {
      const slotitem = this.slotitem(api_data.api_after_slot.api_id);
      Object.assign(slotitem, api_data.api_after_slot);
    }

    // use item
    if (api_data.api_remodel_flag === 1) {
      this.useitemAdd(
        this.apiData.api_remodel_slot_detail?.api_req_useitem_id,
        -1 * (this.apiData.api_remodel_slot_detail?.api_req_useitem_num ?? 0));
    }

    if (query && SvDataPrivate.arg_remodel_slotitem) {
      const req: ApiRemodelSlotParam = qsParse(query);
      const api_certain_flag = parseInt(req.api_certain_flag);
      if (isFinite(api_certain_flag)) {
        const arg: ApiRemodelSlotWithParam = Object.assign({},
          api_data,
          {
            api_level: SvDataPrivate.arg_remodel_slotitem?.api_level ?? 0,
            api_certain_flag,
          }
        );
        ApiCallback.call(Api.REQ_KOUSYOU_REMODEL_SLOT, arg);
      }
    }
  }

  private reqKousyouCreateItem(api_data: ApiCreateItem): void {
    const query = this.getReq(Api.REQ_KOUSYOU_CREATEITEM);
    if (api_data.api_create_flag && api_data.api_get_items) {
      const created = api_data.api_get_items.filter(slotitem => slotitem.api_id !== -1);
      if (created.length) {
        created.forEach((slotitem) => this.apiData.api_slot_item.push(fixApiSlotitemMember(slotitem)));
        this.slotitemCountUpdated = true;
      }
    }

    if (api_data.api_material) {
      this.updateMaterial(api_data.api_material, false);
    }

    if (query) {
      const req: ApiCreateItemParam = qsParse(query);
      const data: ApiCreateItemWithParam = {
        ...api_data,
        items: [
          parseInt(req.api_item1),
          parseInt(req.api_item2),
          parseInt(req.api_item3),
          parseInt(req.api_item4)]
        };
      if (!data.items.some(v => isNaN(v))) {
        ApiCallback.call(Api.REQ_KOUSYOU_CREATEITEM, data);
      }
    }
  }

  private reqKousyouDestroyItem2(api_data: ApiDestroyItem2): void {
    const query = this.getReq(Api.REQ_KOUSYOU_DESTROYITEM2);
    if (query) {
      const req: ApiDestroyItem2Param = qsParse(query);
      if (req.api_slotitem_ids) {
        const slotitem_ids = req.api_slotitem_ids.split(',').map(v => parseInt(v));
        this.updateMaterial(api_data.api_get_material, true);
        const mst_ids = this.destroySlotitem(slotitem_ids);
        ApiCallback.call(Api.REQ_KOUSYOU_DESTROYITEM2, { ...api_data, mst_ids });
      }
    }
  }

  private destroySlotitem(slotitem_ids: number[]): number[] {
    const mst_ids: number[] = [];
    slotitem_ids.forEach((slotitem_id) => {
      const index = this.apiData.api_slot_item.findIndex(slotitem => slotitem.api_id === slotitem_id);
      if (index !== -1) {
        mst_ids.push(this.apiData.api_slot_item[index].api_slotitem_id);
        this.apiData.api_slot_item.splice(index, 1);
        this.slotitemCountUpdated = true;
      }
    });
    return mst_ids;
  }

  private reqKousyouCreateShip(api_data: ApiResponse) {
    SvDataPrivate.arg_create_ship = undefined;
    const query = this.getReq(Api.REQ_KOUSYOU_CREATESHIP);
    if (!query) {
      return;
    }
    const param: ApiCreateShipParam = qsParse(query);
    const items: number[] = [0, 0, 0, 0, 0];
    items[0] = parseInt(param.api_item1);
    items[1] = parseInt(param.api_item2);
    items[2] = parseInt(param.api_item3);
    items[3] = parseInt(param.api_item4);
    items[4] = parseInt(param.api_item5);
    const highspeed = parseInt(param.api_highspeed);
    const update = (id: ApiMaterialId, v: number): void => {
      if (isFinite(v)) {
        this.updateMaterialById(id, -v, true);
      }
    };
    update(ApiMaterialId.FUAL, items[0]);
    update(ApiMaterialId.AMMO, items[1]);
    update(ApiMaterialId.STEEL, items[2]);
    update(ApiMaterialId.BUXITE, items[3]);
    update(ApiMaterialId.BUILD_KIT, items[4]);
    if (isFinite(highspeed) && highspeed) {
      this.updateMaterialById(ApiMaterialId.FAST_BUILD, -1, true);
    }
    if (!items.some(v => isNaN(v))) {
      const arg: ApiCreateShipWithParam = {
        api_ship_id: -1,
        api_kdock_id: parseInt(param.api_kdock_id),
        api_large_flag: parseInt(param?.api_large_flag ?? '0'),
        api_highspeed: highspeed,
        api_items: items
      };
      if (isFinite(arg.api_highspeed) && isFinite(arg.api_kdock_id) && isFinite(arg.api_large_flag)) {
        SvDataPrivate.arg_create_ship = arg;
      }
    }
  }

  private reqKousyouDestroyShip(api_data: ApiDestroyShip) {
    this.updateMaterial(api_data.api_material, false);
    const query = this.getReq(Api.REQ_KOUSYOU_DESTROYSHIP);
    if (query) {
      const req: ApiDestroyShipParam = qsParse(query);
      if (req.api_ship_id) {
        const ship_ids = req.api_ship_id.split(',').map((v) => {
          return parseInt(v);
        });
        ship_ids.forEach((ship_id) => {
          const index = this.apiData.api_ship.findIndex((ship) => {
            return ship.api_id === ship_id;
          });
          if (index !== -1) {
            const ship = this.apiData.api_ship[index];
            this.apiData.api_ship.splice(index, 1);
            this.shipCountUpdated = true;
            if (req.api_slot_dest_flag === '1') {
              this.destroySlotitem(ship.api_slot);
              this.destroySlotitem([ship.api_slot_ex]);
            }
          }
        });
        ApiCallback.call(Api.REQ_KOUSYOU_DESTROYSHIP, {
          ...api_data,
          ship_ids,
        });
      }
    }
  }

  private resGetMemberShip2(api_data: ApiShip[]): void {
    replaceArraySafe(this.apiData.api_ship, api_data);
    this.shipCountUpdated = true;
  }

  private resGetMemberShip3(api_data: ApiShip3): void {
    replaceArray(this.apiData.api_deck_port, api_data.api_deck_data);
    this.updateShip(api_data.api_ship_data);
  }

  private reqKaisouSlotset(): void {
    const query = this.getReq(Api.REQ_KAISOU_SLOTSET);
    if (query) {
      const req: ApiKaisouSlotsetParam = qsParse(query);
      const ship = this.ship(parseInt(req.api_id));
      if (ship) {
        ship.api_slot.splice(
          parseInt(req.api_slot_idx),
          1,
          parseInt(req.api_item_id)
        );
      }
    }
  }

  private reqKaisouOpenExSlot(): void {
    const query = this.getReq(Api.REQ_KAISOU_OPEN_EXSLOT);
    if (query) {
      const req: ApiOpenExSlotParam = qsParse(query);
      const ship = this.ship(parseInt(req.api_id));
      if (ship) {
        Object.assign(ship, { api_slot_ex: -1 });
      }

      // del hokyou item count
      this.useitemAdd(64, -1);
    }

  }

  private reqKaisouUnsetslotAll(): void {
    const query = this.getReq(Api.REQ_KAISOU_UNSETSLOT_ALL);
    if (query) {
      const req: ApiKaisouUnsetslotAllParam = qsParse(query);
      const ship = this.ship(parseInt(req.api_id));
      if (ship) {
        for (let i = 0; i < ship.api_slot.length; ++i) {
          ship.api_slot.splice(i, 1, -1);
        }
      }
    }
  }

  private reqKaisouSlotExchangeIndex(data: ApiChangeSlotExchangeIndex): void {
    this.updateShip([data.api_ship_data]);
  }

  private reqClearItemGet(data: ApiClearItemGet): void {
    if (data.api_material) {
      this.updateMaterial(data.api_material, true);
    }
    if (data.api_bounus_count && data.api_bounus) {
      const materials: number[] = [
        0, 0, 0, 0, 0, 0, 0, 0,
      ];
      data.api_bounus.forEach((bonus) => {
        if (bonus.api_type === ApiItemBonusType.material) {
          const id = bonus.api_item.api_id;
          if ((ApiMaterialId.MIN <= id) && (id <= ApiMaterialId.MAX)) {
            materials[id - 1] = bonus.api_count;
          }
        }
      });
      this.updateMaterial(materials, true);
    }
  }

  private getMemberSlotitem(api_data: ApiSlotitem[]): void {
    replaceArray(this.apiData.api_slot_item, api_data);
    this.slotitemCountUpdated = true;
  }

  private reqMapSelectEventmapRank(api_data: ApiSelectEventmapRank): void {
    const query = this.getReq(Api.REQ_MAP_SELECT_EVENTMAP_RANK);
    if (! query) {
      return ;
    }

    const req: ApiSelectEventmapRankParam = qsParse(query);
    const maparea_id = parseInt(req.api_maparea_id);
    const map_no = parseInt(req.api_map_no);
    const rank = parseInt(req.api_rank);
    if (isFinite(maparea_id) && isFinite(map_no) && isFinite(rank)) {
      const mapinfo = this.mapinfoFrom(maparea_id, map_no);
      if (mapinfo) {
        Object.assign(mapinfo, { api_eventmap: {
          api_now_maphp: api_data.api_maphp.api_now_maphp,
          api_max_maphp: api_data.api_maphp.api_max_maphp,
          api_state: 1,
          api_selected_rank: rank,
          },
          api_gauge_num: api_data.api_maphp.api_gauge_num,
          api_gauge_type: api_data.api_maphp.api_gauge_type,
          api_sally_flag: api_data.api_sally_flag
        });
      }
    }
  }

  private reqMapStart(api_data: ApiMapStart): void {
    const query = this.getReq(Api.REQ_MAP_START);
    if (query) {

      this.apiData.prv_in_map = true;

      // caption: seaplane itemget is not array.
      if (api_data.api_itemget && !Array.isArray(api_data.api_itemget)) {
        const itemget = api_data.api_itemget as ApiItemGet;
        Object.assign(api_data, { api_itemget: [itemget] })
      }
      const req: ApiMapStartParam = qsParse(query);
      const maparea_id = toNumberSafe(req.api_maparea_id);
      const mapinfo_no = toNumberSafe(req.api_mapinfo_no);
      let mapLv: MapLv = MapLv.none;
      const mstMapInfo = this.mstMapInfo(maparea_id, mapinfo_no);
      if (mstMapInfo) {
        const mapinfo = this.mapinfo(mstMapInfo.api_id);
        if (mapinfo) {
          mapLv = mapinfo.api_eventmap?.api_selected_rank ?? MapLv.none;
        }
      }
      this.apiData.prv_battle_map_info = Object.assign({}, {
        maparea_id,
        mapinfo_no,
        mapLv,
        deck_id: toNumberSafe(req.api_deck_id),
        uuid: uuidv4(),
        start: true,
      });
      replaceArray(this.apiData.prv_battle_infos, []);
      replaceArray(this.apiData.api_req_map, [api_data]);

      // call callback
      ApiCallback.call(Api.REQ_MAP_START, api_data);
    }
  }

  public get mapStartOk(): boolean {
    return this.apiData.api_req_map.length > 0;
  }

  public get mapStart(): ApiMapStart | undefined {
    if (this.apiData.api_req_map.length) {
      return this.apiData.api_req_map[0] as ApiMapStart;
    }
  }

  public get inMap(): boolean {
    return this.apiData.prv_in_map;
  }

  private reqMapNext(api_data: ApiMapNext): void {
    // caption: seaplane itemget is not array.
    if (api_data.api_itemget && !Array.isArray(api_data.api_itemget)) {
      const itemget = api_data.api_itemget as ApiItemGet;
      Object.assign(api_data, { api_itemget: [itemget] })
    }
    this.apiData.api_req_map.push(api_data);

    // call callback
    ApiCallback.call(Api.REQ_MAP_NEXT, api_data);
  }

  public get mapNextOk(): boolean {
    return this.apiData.api_req_map.length > 1;
  }

  public get battleMap(): ApiBattleMap[] {
    return this.apiData.api_req_map;
  }

  public get lastMap(): ApiMap | undefined {
    if (this.mapNextOk) {
      const ar = this.apiData.api_req_map;
      return ar[ar.length - 1];
    }
    if (this.mapStartOk) {
      return this.apiData.api_req_map[0];
    }
  }

  public get lastBattle(): PrvBattleInfo | undefined {
    const ar = this.apiData.prv_battle_infos;
    if (ar.length) {
      return ar[ar.length-1];
    }
  }

  private pushMiddayBattle(battleType: BattleType, midday: ApiMiddayBattleType, middayJson: string): void {
    const map_info = this.lastMap;
    if (! map_info) {
      return ;
    }

    const finded = this.apiData.prv_battle_infos.find((info) => info.cell_no === map_info.api_no);
    if (! finded) {
      this.apiData.prv_battle_infos.push({
        index: this.apiData.prv_battle_infos.length,
        mapLv: this.apiData.prv_battle_map_info!.mapLv,
        uuid: this.apiData.prv_battle_map_info!.uuid,
        map: map_info,
        cell_no: map_info.api_no,
        isBoss: map_info.api_event_id === ApiEventId.bossBattle, 
        battleType,
        midday,
        midnight: null,
        result: null,
        middayJson,
        midnightJson: null,
      });
      ApiCallback.call('battle-start', midday);
    } else {
      Object.assign(finded, { midday, middayJson, });
    }
  }

  private pushMidnightBattle(battleType: BattleType, midnight: ApiMidnightBattleType, midnightJson: string): void {
    const map_info = this.lastMap;
    if (! map_info) {
      return ;
    }

    const finded = this.apiData.prv_battle_infos.find((info) => info.cell_no === map_info.api_no);
    if (! finded) {
      this.apiData.prv_battle_infos.push({
        index: this.apiData.prv_battle_infos.length,
        mapLv: this.apiData.prv_battle_map_info!.mapLv,
        uuid: this.apiData.prv_battle_map_info!.uuid,
        map: map_info,
        cell_no: map_info.api_no,
        isBoss: map_info.api_event_id === ApiEventId.bossBattle, 
        battleType,
        midday: null,
        midnight,
        result: null,
        middayJson: null,
        midnightJson,
      });
      ApiCallback.call('battle-start', midnight);
    } else {
      Object.assign(finded, { midnight, midnightJson });
    }
  }

  private setBattleResult(result: ApiBattleResult): PrvBattleInfo | undefined {
    const map_info = this.lastMap;
    if (! map_info) {
      return ;
    }

    const finded = this.apiData.prv_battle_infos.find((info) => info.cell_no === map_info.api_no);
    if (finded) {
      Object.assign(finded, { result });
      return finded;
    }
  }

  public get isShipDropable(): boolean {
    const basic = this.basic;
    if ((basic.api_max_slotitem+3-3) <= this.slotitems.length) {
      return false;
    }

    // todo drooped slot item count
    const dropped_ship_count = this.apiData.prv_battle_infos.reduce((acc, el) => {
      if ((el.result?.api_get_ship?.api_ship_id ?? -1) > 0) {
        ++acc;
      }
      return acc;
    }, 0);

    if (basic.api_max_chara <= (this.ships.length+dropped_ship_count)) {
      return false;
    }

    return true;
  }

  private reqSortieBattle(api_data: ApiSortieBattle, json: string): void {
    this.pushMiddayBattle(BattleType.midday, api_data, json);
  }

  private reqSortieAirBattle(api_data: ApiSortieAirBattle, json: string): void {
    this.pushMiddayBattle(BattleType.air, api_data, json);
  }

  private reqSortieLdAirBattle(api_data: ApiSortieLdAirBattle, json: string): void {
    this.pushMiddayBattle(BattleType.ld_air, api_data, json);
  }

  private reqMidnightBattle(api_data: ApiMidnightBattle, json: string): void {
    this.pushMidnightBattle(BattleType.midnight, api_data, json);
  }

  private reqMidnightSpBattle(api_data: ApiMidnightSpBattle, json: string): void {
    this.pushMidnightBattle(BattleType.sp_midnight, api_data, json);
  }

  private reqSortieBattleResult(api_data: ApiSortieBattleResult): void {
    const battle_info = this.setBattleResult(api_data);
    if (battle_info) {
      ApiCallback.call(Api.REQ_SORTIE_BATTLERESULT, battle_info);
    }
  }

  private reqCombinedCombinedBattle(api_data: ApiCombinedCombinedBattle, json: string): void {
    this.pushMiddayBattle(BattleType.combined, api_data, json);
  }

  private reqCombinedEachBattle(api_data: ApiCombinedCombinedBattle, json: string): void {
    this.pushMiddayBattle(BattleType.combined_each, api_data, json);
  }
  
  private reqCombinedEcBattle(api_data: ApiCombinedBattle, json: string): void {
    this.pushMiddayBattle(BattleType.combined_ec, api_data, json);
  }

  private reqCombinedBattleLdAirBattle(api_data: ApiCombinedBattle, json: string): void {
    this.pushMiddayBattle(BattleType.combined_ld_air, api_data, json);
  }

  private reqCombinedEcMidnightBattle(api_data: ApiEcMidnightBattle, json: string): void {
    this.pushMidnightBattle(BattleType.combined_ec_midnight, api_data, json);
  }

  private reqCombinedBattleResult(api_data: ApiCombinedBattleResult): void {
    const battle_info = this.setBattleResult(api_data);
    if (battle_info) {
      ApiCallback.call(Api.REQ_COMBINED_BATTLE_BATTLERESULT, battle_info);
    }
  }

  private reqPracticeBattle(): void {
  }

  private reqPracticeBattleResult(api_data: ApiPracticeBattleResult): void {
    if (! this.apiData.api_practice_battle_result) {
      Object.assign(this.apiData, { api_practice_battle_result: api_data });
    } else {
      Object.assign(this.apiData.api_practice_battle_result, api_data);
    }

    const query = this.getReq(Api.REQ_PRACTICE_BATTLE);
    if (query) {
      const req: ApiPracticeBattleParam = qsParse(query);
      const deck_id = toNumberSafe(req.api_deck_id);
      ApiCallback.call(Api.REQ_PRACTICE_BATTLE_RESULT, {
        deck_id: deck_id,
        result: api_data}
      );
    }
  }

  private updateMaterial(materials: number[], add: boolean): void {
    if (materials.length >= 4) {
      this.updateMaterialById(ApiMaterialId.FUAL, materials[0], add);
      this.updateMaterialById(ApiMaterialId.AMMO, materials[1], add);
      this.updateMaterialById(ApiMaterialId.STEEL, materials[2], add);
      this.updateMaterialById(ApiMaterialId.BUXITE, materials[3], add);
    }
    if (materials.length >= 6) {
      this.updateMaterialById(ApiMaterialId.FAST_BUILD, materials[4], add);
      this.updateMaterialById(ApiMaterialId.FAST_REPAIR, materials[5], add);
      this.updateMaterialById(ApiMaterialId.BUILD_KIT, materials[6], add);
      this.updateMaterialById(ApiMaterialId.REMODEL_KIT, materials[7], add);
    }
  }

  private updateMaterialById(id: ApiMaterialId, value: number, isAdd: boolean): void {
    const material = this.material(id);
    if (material) {
      this.materialUpdated = true;
      Object.assign(material, { api_value: isAdd ? material.api_value + value : value });
    }
  }

  private updateShip(ships: ApiShip[] | undefined): void {
    if (ships) {
      ships.forEach((ship) => {
        const finded = this.apiData.api_ship.find((e) => e.api_id === ship.api_id);
        if (finded) {
          Object.assign(finded, ship);
        }
      });
    }
  }

  public get mstShips(): MstShip[] {
    return this.apiData.api_mst_ship;
  }

  public mstShip(id: number): MstShip | undefined {
    if (id > 0) {
      return this.apiData.api_mst_ship.find((obj) => obj.api_id === id);
    }
  }

  public mstShipSafe(id: number): MstShip {
    const mst = this.mstShip(id);
    return mst ? mst : InvalidMstShip();
  }

  public mstShipFrom(ship_id: number) : MstShip | undefined {
    const ship = this.ship(ship_id);
    if (ship) {
      return this.mstShip(ship.api_ship_id);
    }
  }

  public mstShipBase(id: number): MstShipBase | undefined {
    if (id > 0) {
      return this.apiData.api_mst_ship.find((obj) => obj.api_id === id);
    }
  }

  public mstShipBaseSafe(id: number): MstShipBase {
    const mst = this.mstShipBase(id);
    return mst ? mst : InvalidMstShipBase();
  }

  public get ships(): ApiShip[] {
    return this.apiData.api_ship;
  }

  public ship(id: number): ApiShip | undefined {
    if (id > 0) {
      return this.apiData.api_ship.find((obj) => obj.api_id === id);
    }
  }

  private rmapCreate(id: number): number[] {
    let check_id = id;
    const rmap = [check_id];
    while (check_id > 0) {
      const mstship = this.mstShip(check_id);
      if (mstship) {
        check_id = parseInt(mstship.api_aftershipid);
        if (check_id > 0) {
          if (rmap.includes(check_id)) {
            break;
          }
          rmap.push(check_id);
          continue;
        }
      }
      break;
    }
    return rmap;
  }

  public shipMstIds(start_mstship_id: number): number[] {
    const finded = RMap.find(start_mstship_id);
    if (finded) {
      return finded;
    }
    const rmap = this.rmapCreate(start_mstship_id);
    RMap.set(start_mstship_id, rmap);
    return rmap;
  }

  public shipCounts(id: number): number[] {
    const rmap = this.shipMstIds(id);

    const ret: number[] = [];
    const ships = this.ships.filter(ship => rmap.includes(ship.api_ship_id));
    for (let i = 0; i < rmap.length; ++i) {
      ret.push(ships.filter((ship) => ship.api_ship_id === rmap[i]).length);
    }
    if (0 === ret.reduce((acc, v) => acc + v, 0)) {
      return [];
    }
    return ret;
  }

  public slotitemEquipTypeSafe(slotitem: ApiSlotitem | undefined): MstSlotitemEquiptype {
    if (slotitem) {
      const mst = this.mstSlotitem(slotitem.api_slotitem_id);
      if (mst) {
        const type = this.mstSlotitemEquiptype(mst);
        if (type) {
          return type;
        }
      }
    }
    return {
      api_id: 0,
      api_name: '',
      api_show_flg: 0
    };
  }

  public get mstSlotitems(): MstSlotitem[] {
    return this.apiData.api_mst_slotitem;
  }

  public mstSlotitem(id: number): MstSlotitem | undefined {
    if (id > 0) {
      return this.apiData.api_mst_slotitem.find(obj => obj.api_id === id);
    }
  }

  public get mstSlotitemEquiptypes(): MstSlotitemEquiptype[] {
    return this.apiData.api_mst_slotitem_equiptype;
  }

  //public mstSlotitemEquiptype(id : number) : MstSlotitemEquiptype | undefined {
  //  return this.apiData.api_mst_slotitem_equiptype.find((obj) => {
  //    return obj.api_id === id;
  //  });
  //}

  public mstSlotitemEquiptype(mstSlotitem: MstSlotitem): MstSlotitemEquiptype | undefined {
    if (mstSlotitem) {
      return this.mstSlotitemEquiptypeFroId(mstSlotitem.api_type[2]);
    }
  }

  public mstSlotitemEquiptypeFroId(id: number): MstSlotitemEquiptype | undefined {
    return this.apiData.api_mst_slotitem_equiptype.find(obj => obj.api_id === id);
  }

  public slotitem(id: number): ApiSlotitem | undefined {
    if (id > 0) {
      return this.apiData.api_slot_item.find(obj => obj.api_id === id);
    }
  }

  public slotitemCount(slotitem_id: number): number {
    return this.apiData.api_slot_item.filter(slotitem => slotitem.api_slotitem_id === slotitem_id).length;
  }

  public get slotitems(): ApiSlotitem[] {
    return this.apiData.api_slot_item;
  }

  public get mstStypes(): MstStype[] {
    return this.apiData.api_mst_stype;
  }

  public mstStype(id: number): MstStype | undefined {
    return this.apiData.api_mst_stype.find(style => style.api_id === id);
  }

  public mstStypeFromSafe(mstShip: MstShip): string {
    if (mstShip) {
      const stype = this.mstStype(mstShip.api_stype);
      if (stype) {
        return stype.api_name;
      }
    }
    return '';
  }

  /*
  public getSlotitemTypeName(slotitem: ApiSlotitem): number {
    const mst = this.mst(slotitem.api_slotitem_id);
    if (mst) {
      const equipType = this.mstEquiptype(slotitem);
      if (equipType) {
        slotitem.typeName = equipType.api_name;
      }
    }
  }
  */

  private updateDeckPort(decks: ApiDeckPort[] | undefined): void {
    if (decks) {
      decks.forEach((deck) => {
        const finded = this.apiData.api_deck_port.find((e) => e.api_id === deck.api_id);
        if (finded) {
          Object.assign(finded, deck);
        }
      });
    }
  }

  public get deckPorts(): ApiDeckPort[] {
    return this.apiData.api_deck_port;
  }

  public deckPort(id: ApiDeckPortId | number): ApiDeckPort | undefined {
    return this.apiData.api_deck_port.find(obj => obj.api_id === id);
  }

  public deckSecretary(id: ApiDeckPortId): ApiShip | undefined {
    const deck = this.deckPort(id);
    if (deck) {
      return this.ship(deck.api_ship[0]);
    }
  }

  public get presetDeck(): ApiPresetDeck {
    return this.apiData.api_preset_deck;
  }

  public presetDeckFromNo(no: number): ApiPresetDeckInfo | undefined {
    return this.apiData.api_preset_deck.api_deck[no.toString()];
  }

  public get isPresetDeckOk(): boolean {
    return this.apiData.api_preset_deck.api_max_num > 0;
  }

  public get parallelQuestCount(): number {
    return this.apiData.api_parallel_quest_count;
  }

  public get questlist(): ApiQuestList | null {
    return this.apiData.api_questlist;
  }

  public material(id: ApiMaterialId): ApiMaterial | undefined {
    //console.log('main process material called. id:' + id);
    if (this.apiData.api_material) {
      return this.apiData.api_material.find(material => material.api_id === id);
    }
  }

  public materialSafe(id: ApiMaterialId): number {
    const m = this.material(id);
    return m?.api_value ?? 0;
  }

  public get basic(): ApiBasic {
    return this.apiData.api_basic;
  }

  public get fual(): number {
    return this.materialSafe(ApiMaterialId.FUAL);
  }

  public get ammo(): number {
    return this.materialSafe(ApiMaterialId.AMMO);
  }

  public get bull(): number {
    return this.materialSafe(ApiMaterialId.AMMO);
  }

  public get steel(): number {
    return this.materialSafe(ApiMaterialId.STEEL);
  }

  public get buxite(): number {
    return this.materialSafe(ApiMaterialId.BUXITE);
  }

  public get fastRepair(): number {
    return this.materialSafe(ApiMaterialId.FAST_REPAIR);
  }

  public get fastBuild(): number {
    return this.materialSafe(ApiMaterialId.FAST_BUILD);
  }

  public get buildKit(): number {
    return this.materialSafe(ApiMaterialId.BUILD_KIT);
  }

  public get remodelKit(): number {
    return this.materialSafe(ApiMaterialId.REMODEL_KIT);
  }

  public get shipCountWithDrop(): number {
    return this.ships.length;
  }

  public get slotitemCountWithDrop(): number {
    return this.slotitems.length;
  }

  public get mstMissions(): MstMission[] {
    return this.apiData.api_mst_mission;
  }

  public mstMission(id: Number): MstMission | undefined {
    return this.apiData.api_mst_mission.find(mst => mst.api_id === id);
  }

  public get missions(): ApiMission[] {
    return this.apiData.api_mission;
  }

  public mission(mission_id: number): ApiMission | undefined {
    return this.apiData.api_mission.find(mission => mission.api_mission_id === mission_id);
  }

  public mstUseItem(id: number): MstUseitem | undefined {
    return this.apiData.api_mst_useitem.find(mst => mst.api_id === id);
  }

  public get useitems(): ApiUseItem[] {
    return this.apiData.api_useitem;
  }

  public useitemAdd(id: number | undefined, count: number): void {
    const item = this.useitem(id);
    if (item) {
      Object.assign(item, { api_count: item.api_count + count });
    }
  }

  public useitem(id: number | undefined): ApiUseItem | undefined {
    if (id)
      return this.useitems.find(item => item.api_id === id);
  }

  public get isPracticeBattleResultOk(): boolean {
    return !!this.apiData.api_practice_battle_result;
  }

  public get practiceBattleResult(): ApiPracticeBattleResult | null {
    return this.apiData.api_practice_battle_result;
  }

  public get mstBattleMapInfo(): MstMapinfo | undefined {
    if (this.mapStartOk) {
      const map = this.mapStart!;
      return this.mstMapInfo(map.api_maparea_id, map.api_mapinfo_no);
    }
  }

  public get battleInfoOk(): boolean {
    return this.apiData.prv_battle_map_info !== null;
  }

  public get battleDeck(): ApiDeckPort | undefined {
    if (this.apiData.prv_battle_map_info) {
      return this.deckPort(this.apiData.prv_battle_map_info.deck_id);
    }
  }

  public get ndocks(): ApiNDock[] {
    return this.apiData.api_ndock;
  }

  public ndock(id: number): ApiNDock | undefined {
    return this.apiData.api_ndock.find((ndock) => {
      return ndock.api_id === id;
    });
  }

  public get kdocks(): ApiKDock[] {
    return this.apiData.api_kdock;
  }

  public kdock(id: number): ApiKDock | undefined {
    return this.apiData.api_kdock.find(kdock => kdock.api_id === id);
  }

  public shipSeiku(ship: ApiShip | undefined): number {
    let ret = 0;
    if (ship) {
      for (let i = 0; i < ship.api_slot.length; ++i) {
        const onslot = ship.api_onslot[i];
        if (onslot) {
          const slotitem = this.slotitem(ship.api_slot[i]);
          if (slotitem) {
            const mst = this.mstSlotitem(slotitem.api_slotitem_id);
            if (mst) {
              ret += KcsUtil.slotSeiku(mst, slotitem, onslot);
            }
          }
        }
      }
    }
    return ret;
  }

  public deckSeiku(deck: ApiDeckPort): number {
    return deck.api_ship.reduce((acc: number, ship_id: number) => acc += this.shipSeiku(this.ship(ship_id)), 0);
  }

  public get mstMaparea(): MstMaparea[] {
    return this.apiData.api_mst_maparea;
  }

  public mstMapareaType(type: ApiMapAreaType): MstMaparea | undefined {
    return this.apiData.api_mst_maparea.find(el => el.api_type === type);
  }

  public get inEvent(): boolean {
    return !! this.mstMapareaType(ApiMapAreaType.event);
  }


  public get isCombined(): boolean {
    return this.apiData.api_combined_flag !== 0;
  }

  public get combinedFlag(): CombinedFlag {
    return this.apiData.api_combined_flag;
  }

  public get mstMapInfos(): MstMapinfo[] {
    return this.apiData.api_mst_mapinfo;
  }

  public mstMapInfo(maparea_id: number, no: number): MstMapinfo | undefined {
    return this.apiData.api_mst_mapinfo.find(mst =>
      (mst.api_maparea_id === maparea_id) && (mst.api_no == no)
    );
  }

  public get mapinfos(): ApiMapInfo[] {
    return this.apiData.api_mapinfo;
  }

  public mapinfo(id: number): ApiMapInfo | undefined {
    return this.apiData.api_mapinfo.find(info => info.api_id === id);
  }

  public mapinfoFrom(maparea_id: number, no: number): ApiMapInfo | undefined {
    const mst = this.mstMapInfo(maparea_id, no);
    if (mst) {
      return this.mapinfo(mst.api_id);
    }
  }

  public mapLevel(maparea_id: number, no: number): MapLv {
    const mapinfo = this.mapinfoFrom(maparea_id, no);
    if (mapinfo) {
      const eventmap = mapinfo.api_eventmap;
      if (eventmap) {
        return eventmap.api_selected_rank;
      }
    }
    return MapLv.kou;
  }


  public get airbases(): ApiAirBase[] {
    return this.apiData.api_air_base;
  }

  public hasAirbase(maparea_id: number, no: number): boolean {
    const mapinfo = this.mapinfoFrom(maparea_id, no);
    return !!(mapinfo?.api_air_base_decks ?? 0);
  }

  public airbase(maparea_id: number): ApiAirBase[] | undefined {
    const ret: ApiAirBase[] = this.apiData.api_air_base.filter(airbase => airbase.api_area_id === maparea_id);
    return ret.length ? ret : undefined;
  }

  public airbaseFrom(area_id: number, rid: number): ApiAirBase | undefined {
    return this.apiData.api_air_base.find(airbase =>
      (airbase.api_area_id === area_id) && (airbase.api_rid === rid)
    );
  }

  public airbaseSeiku(airbase: ApiAirBase): number {
    if (airbase.api_action_kind !== AirBaseActionKind.syutugeki &&
        airbase.api_action_kind !== AirBaseActionKind.bouku) {
          return -1;
    }

    const isSyutugeki = airbase.api_action_kind === AirBaseActionKind.syutugeki;
    const calced = airbase.api_plane_info.reduce<{aa: number, bonus: number[]}>((acc, planeinfo) => {
      if (planeinfo.api_slotid) {
        const aa = this.planeSeiku(planeinfo, airbase.api_action_kind);
        acc.aa += aa.aa;

        // calc bonus
        if (aa.mst) {
          const slotitem_type = KcsUtil.slotitemType(aa.mst);
          if (slotitem_type === SlotitemType.LandRecAircraft) {
            const base = isSyutugeki ? 1.15 : 1.18;
            const mod =  isSyutugeki ? 0.03 : 0.05;
            const bonus = base + (aa.mst.api_saku-8)*mod;
            acc.bonus.push(bonus)
          }
          if (! isSyutugeki && slotitem_type === SlotitemType.RecAircraft) {
            const bonus = aa.mst.api_saku <= 7 ? 1.20 : Math.min(1.20 + (aa.mst.api_saku-7)*0.05, 1.30);
            acc.bonus.push(bonus)
          }
          if (! isSyutugeki && (slotitem_type === SlotitemType.RecSeaplane || slotitem_type === SlotitemType.LargeFlyingBoat)) {
            const bonus = aa.mst.api_saku <= 7 ? 1.10 :  Math.min(1.10 + (aa.mst.api_saku-7)*0.03, 1.16);
            acc.bonus.push(bonus)
          }
        }
      }
      return acc;
    }, { aa: 0, bonus: [] });
    if (calced.bonus.length) {
      return Math.floor(calced.bonus.reduce((acc, el) => acc*el, calced.aa));
    }
    return calced.aa;
  }

  public planeSeiku(planeinfo: ApiPlaneInfo, action_kind: AirBaseActionKind): { aa: number, mst?: MstSlotitem } {
    const count = planeinfo?.api_count ?? 0;
    if (! count) {
      return { aa: 0 };
    }

    const sitem = this.slotitem(planeinfo.api_slotid);
    if (sitem) {
      const mst = this.mstSlotitem(sitem.api_slotitem_id);
      if (mst) {
        return { 
          aa: KcsUtil.planeSeiku(mst, sitem, count, action_kind), 
          mst, 
        };
      }
    }
    return { aa: 0 };
  }

  public slotitemMapLos(slotitem_id: number): MapLosValue {
    const slotitem = this.slotitem(slotitem_id);
    if (slotitem) {
      const mst = this.mstSlotitem(slotitem.api_slotitem_id);
      if (mst) {
        return KcsUtil.slotitemMapLos(slotitem, mst);
      }
    }
    return InvalidMapLosValue();
  }

  public deckMapLos(deck: ApiDeckPort, maplos: number): number {
    const ship_los = deck.api_ship.reduce((los, ship_id) => {
      const ship = this.ship(ship_id);
      if (ship) {
        const calc = InvalidMapLosValue();
        //console.log('ship', ret);
        const ship_los = ship.api_slot.reduce((acc, slotitem_id) => {
          const v = this.slotitemMapLos(slotitem_id);
          acc.map += v.map;
          acc.base += v.base;
          return acc;
        }, InvalidMapLosValue());
        calc.map += ship_los.map;
        calc.base += ship_los.base;

        if (ship.api_slot_ex > 0) {
          const ex_los = this.slotitemMapLos(ship.api_slot_ex);
          calc.map += ex_los.map;
          calc.base += ex_los.base;
        }

        los += calc.map * maplos;
        los += Math.sqrt(ship.api_sakuteki[0] - calc.base);

        //console.log('equip', this.calcc2(ship.api_slot, ship.api_slot_ex));
      }
      return los;
    }, 0);

    const c3 = this.basic.api_level * 0.4;
    const c4 = 2 * (6 - KcsUtil.deckShipCount(deck));
    //console.log('ship_los', ship_los, 'c3', c3, 'c4', c4);
    return ship_los - c3 + c4;
  }

  public slotitemGetItemLos(slotitem_id: number, slotnum: number): number {
    const slotitem = this.slotitem(slotitem_id);
    if (slotitem) {
      const mst = this.mstSlotitem(slotitem.api_slotitem_id);
      if (mst) {
        return KcsUtil.slotitemGetItemLos(mst, slotnum);
      }
    }
    return 0;
  }

  public deckGetItemLos(deck: ApiDeckPort): number {
    return deck.api_ship.reduce((acc, id) => {
      const ship = this.ship(id);
      if (ship) {
        ship.api_slot.forEach((slotitem_id, index) => {
          acc += this.slotitemGetItemLos(slotitem_id, ship.api_onslot[index] ?? 0);
        });
      }
      return acc;
    }, 0);
  }

  public slot(id: number): SlotInfo | undefined {
    const api = this.slotitem(id);
    if (api) {
      const mst = this.mstSlotitem(api.api_slotitem_id);
      if (mst) {
        return {api: api, mst: mst};
      }
    }
  }

  public slots(api: ApiShip): Slot[] {
    const ret: Slot[] = Array(api.api_slotnum + (0 === api.api_slot_ex ? 0 : 1)).fill(undefined);
    for (let i = 0; i < api.api_slotnum; ++i) {
      ret[i] = this.slot(api.api_slot[i]);
    }
    if (api.api_slot_ex > 0) {
      ret[api.api_slotnum] = this.slot(api.api_slot_ex);
    }
    return ret;
  }

  public shipInfo(id: number): ShipInfo | undefined {
    const api = this.ship(id);
    if (api) {
      const mst = this.mstShip(api.api_ship_id);
      if (mst) {
        return { 
          api: api, 
          mst: mst, 
          slots: this.slots(api), 
          onslotMax: KcsUtil.shipOnSlotMax(mst.api_id) 
        };
      }
    }
  }

  public shipInfos(ids: number[]): ShipInfo[] {
    return ids.reduce<ShipInfo[]>((ships, id) => {
      const ship = this.shipInfo(id);
      if (ship) {
        ships.push(ship);
      }
      return ships
    }, []);
  }

  public shipInfoSps(ids: number[]): ShipInfoSp[] {
    const ships = this.shipInfos(ids);
    return ships.map((ship) => ({
      api: ship.api,
      mst: ship.mst,
      slots: ship.slots,
      bouku: KcsUtil.shipBouku(ship),
      sp: KcsUtil.spAll(ship, ships),
      onslotMax: ship.onslotMax,
    }));
  }

}
