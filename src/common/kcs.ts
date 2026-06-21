import qs from 'qs'
import { v4 as uuidv4 } from 'uuid'
import { ShipEtcs } from '@common/kcsetc'
import { assignSafeE, replaceArray, replaceArraySafe, toNumberSafe } from '@common/ts'
import * as KcsApi from '@common/kcsapi'
import { calcEnemyHps } from '@common/kcsbattle'
import { MathUtil } from './math'

/////////////////////////////////////////////////////////////////////////////////////
// kc stuff
export interface ApiDataRoot {
  readonly api_result: ApiResult
  readonly api_result_msg: string
  readonly api_data: any
}

export interface ApiWorldId {
  readonly api_world_id: KcsApi.ApiServerId
}

export interface ApiGetOptionSetting {
  readonly api_skin_id: number;
  readonly api_volume_setting: ApiVolumeSetting;
}

export interface ApiVolumeSetting {
  readonly api_be_left: number;
  readonly api_duty: number;
  readonly api_bgm: number;
  readonly api_se: number;
  readonly api_voice: number;
}

export class KcsConst {
  static readonly MaxLv = 188;
}

export const ApiShipType = {
  none: 0, // 値なし
  kaiboukan: 1, // 海防艦
  kutikukan: 2, // 駆逐艦
  keijyun: 3, // 軽巡洋艦
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

  internal_goei_kuubo: -1, // 内部：護衛空母
  internal_tokumukan: -2 // 内部：特務艦
} as const
export type ApiShipType = (typeof ApiShipType)[keyof typeof ApiShipType]

export const ApiShipTypeSenkanClasses: ApiShipType[] = [
  ApiShipType.kousoku_senkan,
  ApiShipType.teisoku_senkan,
  ApiShipType.koukuu_senkan,
  ApiShipType.tyoudokyuu_senkan
] as const

export const ApiShipTypeKuboClasses: ApiShipType[] = [
  ApiShipType.kei_kuubo,
  ApiShipType.seiki_kuubo,
  ApiShipType.soukou_kuubo
] as const

export const ApiShipTypeJyujyunClasses: ApiShipType[] = [
  ApiShipType.jyuujyun,
  ApiShipType.koujyun
] as const

export const ApiShipTypeKeijyunClasses: ApiShipType[] = [
  ApiShipType.keijyun,
  ApiShipType.renjyun,
  ApiShipType.raijyun
] as const

export const ApiShipTypeKutikukanClasses: ApiShipType[] = [
  ApiShipType.kutikukan
] as const

export const ApiShipTypeKaiboukanClasses: ApiShipType[] = [
  ApiShipType.kaiboukan
] as const

export const ApiShipTypeSensuikanClasses: ApiShipType[] = [
  ApiShipType.sensuikan,
  ApiShipType.sensui_kuubo
] as const

export const ApiShipTypeHojoClasses: ApiShipType[] = [
  ApiShipType.kousakusen,
  ApiShipType.sensuibokan,
  ApiShipType.hokyuukan,
  ApiShipType.suibo,
  ApiShipType.yourikukan
] as const

export const ApiShipCategory = {
  none: 0, // 値なし
  ayanami: 1, // 綾波型
  ise: 2, // 伊勢型
  kaga: 3, // 加賀型
  kuma: 4, // 球磨型
  akatuki: 5, // 暁型
  kongou: 6, // 金剛型
  furutaka: 7, // 古鷹型
  takao: 8, // 高雄型
  mogami: 9, // 最上型
  hatuharu: 10, // 初春型
  syouhou: 11, // 祥鳳型
  fubuki: 12, // 吹雪型
  aoba: 13, // 青葉型
  akagi: 14, // 赤城型
  titose: 15, // 千歳型
  sendai: 16, // 川内型
  souryu: 17, // 蒼龍型
  asasio: 18, // 朝潮型
  nagato: 19, // 長門型
  nagara: 20, // 長良型
  tenryu: 21, // 天龍型
  simakaze: 22, // 島風型
  siratuyu: 23, // 白露型
  hiyou: 24, // 飛鷹型
  hiryu: 25, // 飛龍型
  fusou: 26, // 扶桑型
  housyou: 27, // 鳳翔型
  mutuki: 28, // 睦月型
  myoukou: 29, // 妙高型
  kagerou: 30, // 陽炎型
  tome: 31, // 利根型
  ryuujyou: 32, // 龍驤型
  syoukaku: 33, // 翔鶴型
  yuubari: 34, // 夕張型
  i168: 35, // 伊168型
  i58: 36, // 伊58型
  yamato: 37, // 大和型
  yuugumo: 38, // 夕雲型
  i19: 39, // 伊19型
  i8: 40, // 伊8型
  agano: 41, // 阿賀野型
  taihou: 43, // 大鳳型
  i401: 44, // 伊401型
  akitu: 45, // あきつ丸型
  maruyu: 46, // まるゆ型
  bismarck: 47, // Bismarck型
  z1: 48, // Z1型
  akasi: 49, // 明石型
  taigei: 50, // 大鯨型
  ryuuhou: 51, // 龍鳳型
  ooyodo: 52, // 大淀型
  unryuu: 53, // 雲龍型
  akizuki: 54, // 秋月型
  admiralHipper: 55, // Admiral Hipper型
  katori: 56, // 香取型
  guglielmoMarcon: 57, // Guglielmo Marcon型
  vVeneto: 58, // V.Veneto型
  akitusima: 59, // 秋津洲型
  hayasui: 60, // 速吸型
  maestrale: 61, // Maestrale型
  mizuho: 62, // 瑞穂型
  grafZeppelin: 63, // GrafZeppelin型
  zara: 64, // Zara型
  iowa: 65, // Iowa型
  kamikaze: 66, // 神風型
  queenElizabeth: 67, // Queen Elizabeth型
  aquila: 68, // Aquila型
  lexington: 69, // Lexington型
  commandantTeste: 70, // Commandant Teste型
  i13: 71, // i13型
  kamoi: 72, // 神威型
  Гангут: 73, // Гангут型
  simusyu: 74, // 占守型
  kasugamaru: 75, // 春日丸型
  taiyou: 76, // 大鷹型
  etorofu: 77, // 択捉型
  arkRoyal: 78, // Ark Royal型
  richelieu: 79, // Richelieu型
  i504: 80, // i504型
  taшкeнт: 81, // Ташкент型
  jervis: 82, // Jervis型
  gambierBay: 83, // Gambier Bay型
  intrepid: 84, // Intrepid型
  hiburi: 85, // 日振型
  rogou: 86, // 呂500型
  johnCButle: 87, // John C.Butle型
  nelson: 88, // Nelson型
  gotland: 89, // Gotland級
  nisshin: 90, // 日進型
  fletcher: 91, // Fletcher級
  l_d_S_D_d_Abruzzi: 92, // L.d.S.D.d.Abruzzi型
  colorado: 93, // Colorado型
  mikura: 94, // 御蔵型
  northampton: 95, // Northampton型
  perth: 96, // Perth型
  sinsyuumaru: 97, // 神州丸型
  deRuyter: 98, // De Ruyter型
  atlanta: 99, // Atlanta型
  jingei: 100, // 迅鯨型
  matu: 101, // 松型
  southDakota: 102, // South Dakota型
  i47: 103, // 伊47型
  tyougataKaiboukan: 104, // 丁型海防艦
  yorktown: 105, // Yorktown型
  st_Louis: 106, // St.Louis型
  northCarolina: 107, // North Carolina型
  town: 108, // Town型
  i201: 109, // 伊201型
  brooklyn: 110, // Brooklyn型
  souya: 111, // 宗谷型
  illustrious: 112, // Illustrious型
  contediCavour: 113, // Conte di Cavour型
  gato: 114, // Gato型
  yamasiomaru: 115, // 山汐丸型
  independence: 116, // Independence級
  ukuru: 117, // 鵜来型
  ranger: 118, // Ranger級
  tokusyusen_mheigata: 119, // 特種船M丙型  熊野丸等
  sensya_yourikukan: 120, // 戦車揚陸艦 第百一号輸送艦等
  new_orleans: 121, // New Orleans級 Minneapolis等
  salmon: 122, // Salmon級
  kai_sikisimagata: 123, // 改敷島型 朝日等
  marcello: 124, // Marcello級 C.Cappellini等
  nevada: 125, // Nevada級
  kai_hikawamaru: 126, // 改氷川丸級 平安丸等
  jyunsennotusen: 127, // 巡潜乙型改 伊41頭
  la_galissonniere: 128, // La Galissonniere級 Gloire等
  mogador: 129, // Mogador級
  ootomari: 130, // 大泊型
  kиров: 131, // Киров型
  simanemaru: 132, // しまね丸型
  norge: 133, // Norge型
  courageous_jyunyou: 134, // Courageous型(Glorious 巡戦)
  courageous_kubo: 135, // Courageous型(Glorious 空母)
  reitousen: 136, // 冷凍船
  thonburi: 137, // Thonburi型
} as const
export type ApiShipCategory = (typeof ApiShipCategory)[keyof typeof ApiShipCategory]

export const ApiShipBacks = {
  none: 0,
  common1: 1,
  common2: 2,
  common3: 3,
  rare1: 4,
  rare2: 5,
  unique1: 6,
  unique2: 7,
  unique3: 8,
} as const
export type ApiShipBacks = (typeof ApiShipBacks)[keyof typeof ApiShipBacks]

export const isShipRare = (backs: ApiShipBacks): boolean => {
  return ApiShipBacks.rare1 <= backs && backs <= ApiShipBacks.rare2
}

export const isShipUnique = (backs: ApiShipBacks): boolean => {
  return backs >= ApiShipBacks.unique1
}

export const GoeiKuuboIds: number[] = [
  380, // taiyou kai
  381, // sinyou kai
  382, // unnyou kai
  396, // Gambier Bay kai
  526, // taiyou
  529, // taiyou kaini
  534, // sinyou
  536, // sinyou kaini
  544, // Gambier Bay
  560, // zuihoukaini otu
  707, // Gambier Bay Mk.II
  883, // ryuuhou kaini bo
  884, // unnyou
  888, // ryuuhou kaini
  889 // unnyoukaini
]

export const TokumukanIds: number[] = [
  645, // souya
  650, // souya
  699 // souya
]

export interface ShipTypeName {
  longName: string
  shortName: string
}

const toSipTypeName = (longName: string, shortName?: string): ShipTypeName => {
  return {
    longName,
    shortName: shortName ?? longName
  }
}

const ShipTypeNames: Map<ApiShipType, ShipTypeName> = new Map([
  [ApiShipType.kaiboukan, toSipTypeName('海防艦')],
  [ApiShipType.kutikukan, toSipTypeName('駆逐艦')],
  [ApiShipType.keijyun, toSipTypeName('軽巡洋艦', '軽巡')],
  [ApiShipType.raijyun, toSipTypeName('重雷装巡洋艦', '雷巡')],
  [ApiShipType.jyuujyun, toSipTypeName('重巡洋艦', '重巡')],
  [ApiShipType.koujyun, toSipTypeName('航空巡洋艦', '航巡')],
  [ApiShipType.kei_kuubo, toSipTypeName('軽空母', '軽空母')],
  [ApiShipType.kousoku_senkan, toSipTypeName('戦艦')],
  [ApiShipType.teisoku_senkan, toSipTypeName('戦艦')],
  [ApiShipType.koukuu_senkan, toSipTypeName('航空戦艦', '航戦')],
  [ApiShipType.seiki_kuubo, toSipTypeName('正規空母')],
  [ApiShipType.tyoudokyuu_senkan, toSipTypeName('戦艦')],
  [ApiShipType.sensuikan, toSipTypeName('潜水艦')],
  [ApiShipType.sensui_kuubo, toSipTypeName('潜水空母')],
  [ApiShipType.hokyuukan_enemy, toSipTypeName('補給艦')],
  [ApiShipType.suibo, toSipTypeName('水上機母艦', '水母')],
  [ApiShipType.yourikukan, toSipTypeName('揚陸艦')],
  [ApiShipType.soukou_kuubo, toSipTypeName('装甲空母')],
  [ApiShipType.kousakusen, toSipTypeName('工作艦')],
  [ApiShipType.sensuibokan, toSipTypeName('潜水母艦')],
  [ApiShipType.renjyun, toSipTypeName('練習巡洋艦', '練巡')],
  [ApiShipType.hokyuukan, toSipTypeName('補給艦')],
  [ApiShipType.internal_goei_kuubo, toSipTypeName('護衛空母')]
])

export const ApiRange = {
  invalid: 0,// なし
  tan: 1, // 短
  tyuu: 2, // 中
  tyou: 3, // 長
  tyoutyou: 4, // 長超
  tyoutyou_plus: 5 // 長超+ internal, not display
} as const
export type ApiRange = (typeof ApiRange)[keyof typeof ApiRange]

export const ApiSoku = {
  none: 0,
  teisoku: 5,
  kousoku: 10,
  kousoku_plus: 15,
  saisoku: 20
} as const
export type ApiSoku = (typeof ApiSoku)[keyof typeof ApiSoku]

export const MissionState = {
  no: 0,
  in: 1,
  completed: 2,
  stopped: 3
} as const
export type MissionState = (typeof MissionState)[keyof typeof MissionState]

export const Cond = {
  normal: 0, // 通常
  red: 1, // 重度疲労
  orange: 2, // 疲労
  orange_hidden: 3, // 隠れ疲労
  good: 4 // キラ状態
} as const
export type Cond = (typeof Cond)[keyof typeof Cond]

export const HoseiType = {
  none: 0,
  tekkoudan: 1,
  tekkoudan_dentan: 2,
  tekkoudan_fukuhou: 3,
  tekkoudan_fukuhou_dentan: 4
} as const
export type HoseiType = (typeof HoseiType)[keyof typeof HoseiType]

export const HoseiConst: number[] = [
  0, // none
  1.08, // tekkoudan
  1.1, // tekkoudan_dentan
  1.15, // tekkoudan_fukuhou
  1.15 // tekkoudan_fukuhou_dentan
]

export const SlotitemType = {
  SmallMainGun: 1, // 小口径主砲
  MediumMainGun: 2, // 中口径主砲
  LargeMainGun: 3, // 大口径主砲
  SecondaryGun: 4, // 副砲
  Torpedo: 5, // 魚雷
  Fighter: 6, // 艦上戦闘機
  DiveBomber: 7, // 艦上爆撃機
  TorpedoBomber: 8, // 艦上攻撃機
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
  AntiGroundEquipment: 37, // 対地装備
  ShipPersonnel: 39, // 水上艦要員
  LargeSonar: 40, // 大型ソナー
  LargeFlyingBoat: 41, // 大型飛行艇
  LargeSearchlight: 42, //大型探照灯
  CombatRation: 43, // 戦闘糧食
  Supplies: 44, // 補給物資
  SeaplaneFighter: 45, // 水上戦闘機
  SpecialATank: 46, // 特型内火艇
  LandAttackAircraft: 47, // 陸上攻撃機
  LandFighter: 48, // 陸上戦闘機/局地戦闘機
  LandRecAircraft: 49, // 陸上偵察機
  TransMaterial: 50, // 輸送機材
  SubmarineEquipment: 51, // 潜水艦装備
  LandingForce: 52, // 陸戦部隊
  LargeLandPlane: 53, // 大型陸上機
  SurfaceShipEquipment: 54, // 艦載発煙装置
  JetFighter: 56, // 噴式戦闘機
  JetFighterBomber: 57 //噴式戦闘爆撃機
} as const
export type SlotitemType = (typeof SlotitemType)[keyof typeof SlotitemType]

export const SlotitemImgType = {
  syuhou_syou: 1, // 小口径
  syuhou_tyuu: 2, // 中口径
  syuhou_dai: 3, // 大口径
  fukuhou: 4, //副砲
  gyorai: 5, // 魚雷
  kanjyou_sentouki: 6, // 艦上戦闘機
  kanjyou_bakugekiki: 7, // 艦上爆撃機
  kanjyou_kougekiki: 8, // 艦上攻撃機
  kanjyou_teisatuki: 9, // 艦上偵察機
  suitei: 10, // 水上偵察機
  dentan: 11, // 電探
  sansikidan: 12, // 三式弾
  tekoudan: 13, // 徹甲弾
  damekon: 14, // ダメコン
  kijyu: 15, // 機銃
  koukakuhou: 16, // 高角砲
  bakurai: 17, // 爆雷
  sonar: 18, // ソナー
  engine: 19, // 機関部強化
  daihatu: 20, // 大発
  heri: 21, // 回転翼機
  taisensyoukaiki: 22, // 対潜哨戒機
  bulge: 23, // バルジ
  tansyoutou: 24, // 探照灯
  drumcan: 25, // ドラム缶
  syuurisisetu: 26, // 艦艇修理施設
  syoumeidan: 27, // 照明弾
  sireibu: 28, // 司令部施設
  supana: 29, // 航空要員
  kousyasouti: 30, // 高射装置
  taiti: 31, // 対地装備
  mihariin: 32, // 見張り員
  oogata_hikoutei: 33, // 大型飛行艇
  sentouryousyoku: 34, //戦闘糧食
  hokyuubussi: 35, // 補給物資
  naikatei: 36, // 内火艇
  rikukou: 37, // 陸上攻撃機
  kyokusen: 38, // 局戦
  funsiki1: 39, // 噴式戦闘爆撃機
  funsiki2: 40, // 噴式戦闘爆撃機
  yusoukizai: 41, // 輸送機材
  sensui_soubi: 42, // 潜水艦装備
  suijyou_sentouki: 43, // 水上戦闘機
  rikusen: 44, // 陸上戦闘機
  yakan_sentouki: 45, // 夜間戦闘機
  yakan_kougekiki: 46, // 夜間攻撃機
  rikutaisen: 47, // 陸上対潜哨戒機
  rikukou2: 48, // 陸上攻撃機2
  rikukou_jyuubaku: 49, // 大型陸上機(重爆)
  yatei: 50, // 夜偵
  yakan_zuiun: 51, // 夜間瑞雲
  rikusen_butai: 52, // 陸戦部隊
  hatuensouti: 54, // 艦載発煙装置
  bouku_kikyu: 55, // 防空気球
  kyokusen2: 56, // 局戦2
  kyokusen3: 57, // 局戦3
  yakan_bakugekiki: 58, // 夜間爆撃機
} as const
export type SlotitemImgType = (typeof SlotitemImgType)[keyof typeof SlotitemImgType]

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
  area49: 49 // 2020.11 護衛せよ！船団輸送作戦",
} as const
export type MapAreaId = (typeof MapAreaId)[keyof typeof MapAreaId]

interface mapAreaNo {
  [key: number]: number[]
}

/**
 * gauge area
 */
export const GaugeAreaNo: mapAreaNo = {
  1: [5, 6],
  2: [5],
  3: [5],
  4: [5],
  5: [5,6],
  6: [5],
  7: [1, 2, 3, 4, 5]
}

export interface MapLosValue {
  map: number
  base: number
}
const InvalidMapLosValue = (): MapLosValue => ({
  map: 0,
  base: 0
})

export interface SlotInfo {
  readonly api: ApiSlotitem
  readonly mst: MstSlotitem
}

export type Slot = SlotInfo | undefined

export interface THCutinState {
  type: THCutin
  enable: boolean
}

export interface THCutinRate {
  type: THCutin
  enable: boolean
  rate: number
}

export interface TKCutinState {
  entry: TKCutin[]
  type: TKCutin[]
}

export interface TKCutinRate {
  type: TKCutin
  enable: boolean
  rate: number
}

export interface SenseiTaisenState {
  type: SenseiTaisenType
  enable: boolean
}

export interface SenseiRaigekiState {
  type: SenseiRaigekiType
  enable: boolean
}

export interface FACutinState {
  type: FACutin
  enable: boolean
}

export interface FACutinRate {
  type: FACutin
  enable: boolean
  rate: number[] // 0: kakuho, 1: yuusei
}

export interface AACutinState {
  type: AACutin
  enable: boolean
}

export interface AACutinRate {
  type: AACutin
  enable: boolean
  rate: number[] // 0: kakuho, 1: yuusei
}

export interface YCutinState {
  type: YCutin
  enable: boolean
}

export interface YCutinRate {
  type: YCutin
  enable: boolean
  rate: number
}

export interface YSCutinState {
  type: YSCutin
  enable: boolean
}

export interface YSCutinRate {
  type: YSCutin
  enable: boolean
  rate: number
}

export interface FDState {
  enable: boolean
}

export interface FDRate {
  enable: boolean
  rate: number
}

export interface YateiState {
  enable: boolean
}

export interface YateiRate {
  enable: boolean
  rate: number
}

export interface SpState {
  tk: TKCutinState | undefined // taikuu cutin
  th: THCutinState[] | undefined // tokusyu hougeki
  st: SenseiTaisenState | undefined //
  sr: SenseiRaigekiState | undefined //
  fa: FACutinState[] // dantyaku
  aa: AACutinState[] // aa cutin
  y: YCutinState[] // yasen cutin
  ys: YSCutinState[] // yasyuu
  fd: FDState | undefined // funsindanmaku
  yt: YateiState | undefined // yatei
}

export interface Bouku {
  readonly kt: number
  readonly ktRaw: number
  readonly ktRemodel: number
  readonly ktb: number
  readonly ktbRaw: number
  readonly ktbRemodel: number
}

export interface Kaihi {
  readonly kaihi: number
  readonly kaihiRemodel: number
}

export interface Hit {
  readonly hit: number
  readonly hitRemodel: number
}

export interface ShipInfo {
  readonly api: ApiShip
  readonly mst: MstShip
  readonly slots: Slot[]
  readonly onslotMax: number[]
}

export interface SlotWithOnSlot {
  readonly api: ApiSlotitem | null
  readonly mst: MstSlotitem | null
  readonly onslot: number
  readonly onslotMax: number
}

export interface ShipInfoSp extends ShipInfo {
  readonly bouku: Bouku
  readonly sp: SpState
  deck_los?: number // 艦隊索敵値(弾着計算用)
  deck_ktb?: number // 艦隊防空値(撃墜計算用)
}

export interface Attackable {
  fire: boolean
  tor: boolean
  asw: boolean
}

export function isShipIds(svdata: SvData, ship_id: number, mst_ship_ids: number[]): boolean {
  const mst = svdata.mstShipFrom(ship_id)
  if (mst) {
    return mst_ship_ids.includes(mst.api_id)
  }
  return false
}

export function isShipIdLvs(
  svdata: SvData, ship_id: number, id_lvs: { ids: number[], lv: number }[]): boolean {
  const mst = svdata.mstShipFrom(ship_id)
  if (!mst) {
    return false;
  }
  const api = svdata.ship(ship_id)
  if (! api) {
    return false;
  }

  for (let i = 0; i < id_lvs.length; ++i) {
    if (id_lvs[i].ids.includes(mst.api_id) && api.api_lv >= id_lvs[i].lv) {
      return true
    }
  }
  return false
}

export interface ShipMst {
  readonly api: ApiShip
  readonly mst: MstShip
}

export function toShipMsts(svdata: SvData, ship_ids: number[]): ShipMst[] {
  return ship_ids.reduce<ShipMst[]>((acc, ship_id) => {
    const api = svdata.ship(ship_id)
    let mst
    if (api) {
      mst = svdata.mstShip(api.api_ship_id)
      if (mst) {
        acc.push({ api, mst })
      }
    }
    return acc
  }, [])
}

export function deckShipCount(ship_ids: number[]): number {
  return ship_ids.reduce((acc, el) => (el > 0 ? acc + 1 : acc), 0)
}

export function shipCount(ships: ShipMst[], mst_ship_ids: number[]): number {
  return ships.reduce((acc, ship) => {
    if (mst_ship_ids.includes(ship.mst.api_id)) {
      ++acc
    }
    return acc
  }, 0)
}

export function shipTypeCount(ships: ShipMst[], ship_types: ApiShipType[], lv?: number): number {
  return ships.reduce((acc, ship) => {
    if (ship_types.includes(ship.mst.api_stype)) {
      if (lv !== undefined) {
        if (ship.api.api_lv >= lv) {
          ++acc
        }
      } else {
        ++acc
      }
    }
    return acc
  }, 0)
}

export const shipCategoryCount = (ships: ShipMst[], cats: ApiShipCategory[]): number => {
  return ships.reduce((acc, el) => {
    if (cats.includes(el.mst.api_ctype)) {
      ++acc
    }
    return acc
  }, 0)
}


export function isShipType(mst: MstShip, types: ApiShipType[]): boolean {
  return types.includes(mst.api_stype)
}

export const isShipCategory = (category: ApiShipCategory, categories: ApiShipCategory[]): boolean => {
  return categories.includes(category)
}

const isShipId = (mst_id: number, ids: number[]): boolean => {
  return ids.includes(mst_id)
}

const isSlotitemId = (slot: Slot, ids: number[]): boolean => {
  if (slot) return ids.includes(slot.mst.api_id)
  return false
}

const calcShipLos = (ship: ShipInfo): number => {
  const etc = ShipEtcs.find((v) => v.api_id === ship.mst.api_id)
  if (etc) {
    return Math.floor(
      ((etc.api_sakuteki[1] - etc.api_sakuteki[0]) * ship.api.api_lv) / 99 + etc.api_sakuteki[0]
    )
  }
  return NaN
}

/**
 * 加重対空 係数
 * @param mst
 */
const equipKT = (mst: MstSlotitem): number => {
  switch (KcsUtil.slotitemImgType(mst)) {
    case SlotitemImgType.kijyu: // 対空気銃
      return 6.0
    case SlotitemImgType.kousyasouti: // 高射装置
      return 4.0
    case SlotitemImgType.dentan: // 電探
      return 3.0
  }
  return 0
}

/**
 * 艦隊防空 係数
 * @param mst
 */
const equipKB = (mst: MstSlotitem): number => {
  // 46cm三連装砲
  if (mst.api_id === 9 || mst.api_id === 276) {
    return 0.25
  }

  switch (KcsUtil.slotitemImgType(mst)) {
    case SlotitemImgType.sansikidan: // 三式弾
      return 0.6
    case SlotitemImgType.koukakuhou: // 高角砲
    case SlotitemImgType.kousyasouti: // 高射装置
      return 0.35
    case SlotitemImgType.dentan: // 電探
      return 0.4
    case SlotitemImgType.rikusen: 
    case SlotitemImgType.kyokusen:
    case SlotitemImgType.kyokusen2:
    case SlotitemImgType.kyokusen3:
      return 0;
    default: 
      if (mst.api_tyku > 2) {
        // 係数×対空値+0.5された値が1以下は艦隊防空なし
        return 0.2
      }
      break;
    // case SlotitemImgType.syuhou_syou: // 小口径
    // case SlotitemImgType.syuhou_tyuu: // 中口径
    // case SlotitemImgType.syuhou_dai: // 大口径
    // case SlotitemImgType.fukuhou: // 副砲
    // case SlotitemImgType.kijyu: // 対空気銃
    // case SlotitemImgType.kanjyou_sentouki: // 艦上戦闘機
    // case SlotitemImgType.kanjyou_bakugekiki: // 艦上爆撃機
    // case SlotitemImgType.suitei: // 水上偵察機
    // case SlotitemImgType.suitei: // 水上偵察機
    // return 0.2
  }
  return 0
}

/**
 * 艦隊防空 改修係数
 * @param mst
 */
const remodelKB = (mst: MstSlotitem): number => {
  switch (KcsUtil.slotitemImgType(mst)) {
    case SlotitemImgType.dentan: // 電探
      if (mst.api_tyku) {
        return 1.5
      }
      break
    case SlotitemImgType.koukakuhou: // 高角砲
      return mst.api_tyku >= 8 ? 3.0 : 2.0
    case SlotitemImgType.kousyasouti: // 高射装置
      return 2.0
  }
  return 0
}

/**
 * 加重対空 改修定数
 * @param mst
 */
const remodelKT = (mst: MstSlotitem): number => {
  switch (KcsUtil.slotitemImgType(mst)) {
    case SlotitemImgType.kijyu: // 対空機銃
      return mst.api_tyku >= 8 ? 6.0 : 4.0
    case SlotitemImgType.koukakuhou: // 高角砲
      return mst.api_tyku >= 8 ? 3.0 : 2.0
    case SlotitemImgType.kousyasouti: // 高射装置
      return 2.0
  }
  return 0
}

/**
 * 索敵改修係数
 * @param mst
 */
const remodelLos = (mst: MstSlotitem): number => {
  switch (KcsUtil.slotitemType(mst)) {
    case SlotitemType.ASBAircraft: // 対潜哨戒機
      return 1.0
    case SlotitemType.RecAircraft: // 艦上偵察機
    case SlotitemType.RecSeaplane: // 水上偵察機
    case SlotitemType.LargeFlyingBoat: // 大型飛行艇
      return 1.2
    case SlotitemType.SeaplaneBomber: // 水上爆撃機
      return 1.15
    case SlotitemType.SmallRadar: // 小型電探
      return 1.25
    case SlotitemType.LargeRadar: // 大型電探
      return 1.4
  }
  return 0
}

const equipLos = (mst: MstSlotitem): number => {
  switch (KcsUtil.slotitemType(mst)) {
    case SlotitemType.Fighter: // 艦上戦闘機
    case SlotitemType.DiveBomber: // 艦上爆撃機
    case SlotitemType.SeaplaneFighter: // 水上戦闘機
    case SlotitemType.LargeFlyingBoat: // 大型飛行艇
    case SlotitemType.ASBAircraft: // 対潜哨戒機
    case SlotitemType.Autogyro: // オートジャイロ
    case SlotitemType.JetFighterBomber: //噴式戦闘爆撃機
    case SlotitemType.SmallMainGun: // 小口径主砲
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
      return 0.6
    case SlotitemType.TorpedoBomber: // 艦上攻撃機
      return 0.8
    case SlotitemType.RecAircraft: // 艦上偵察機
      return 1.0
    case SlotitemType.SeaplaneBomber: // 水上爆撃機
      return 1.1
    case SlotitemType.RecSeaplane: // 水上偵察機
      return 1.2
  }
  return 0
}

/**
 * 命中改修係数
 * @param mst
 */
const remodelHit = (mst: MstSlotitem): number => {
  switch (KcsUtil.slotitemType(mst)) {
    case SlotitemType.SmallMainGun: // 小口径主砲
    case SlotitemType.MediumMainGun: // 中口径主砲
    case SlotitemType.LargeMainGun: // 大口径主砲
    case SlotitemType.SecondaryGun: // 副砲
    case SlotitemType.AAShell: // 対空強化弾
    case SlotitemType.APShell: // 対艦強化弾
    case SlotitemType.Searchlight: // 探照灯
    case SlotitemType.LargeSearchlight: //大型探照灯
    case SlotitemType.AADirector: // 高射装置
    case SlotitemType.ShipPersonnel: // 水上艦要員
    case SlotitemType.LandingCraft: // 上陸用舟艇
    case SlotitemType.SpecialATank: // 特型内火艇
    case SlotitemType.LandingForce: // 陸戦部隊
    case SlotitemType.CommandFacility: // 司令部施設
    case SlotitemType.SurfaceShipEquipment: // 艦載発煙装置
      return 1.0
    case SlotitemType.SmallRadar: // 小型電探
    case SlotitemType.LargeRadar: // 大型電探
      if ([27, 30, 106].includes(mst.api_id)) {
        return 1.0
      }
      return 1.7
  }
  return 0
}

/**
 * 命中改修係数(雷撃)
 * @param mst
 */
const remodelHitTor = (mst: MstSlotitem): number => {
  switch (KcsUtil.slotitemType(mst)) {
    case SlotitemType.Torpedo:
      return 2.0
  }
  return 0
}

/**
 * 命中改修係数(対潜)
 * @param mst
 */
const remodelHitAsw = (mst: MstSlotitem): number => {
  switch (KcsUtil.slotitemType(mst)) {
    case SlotitemType.Sonar:
    case SlotitemType.LargeSonar:
    case SlotitemType.DepthCharge:
      return 1.3
  }
  return 0
}

const calcCI = (info: ShipInfo, ships: ShipInfoSp[]): number => {
  const ship = info.api
  const lvs = Math.sqrt(ship.api_lv)
  let ci: number

  if (ship.api_lucky[0] >= 50.0) {
    ci = Math.floor(65.0 + Math.sqrt(ship.api_lucky[0] - 50.0) + 0.8 * lvs)
  } else {
    ci = Math.floor(15.0 + ship.api_lucky[0] + 0.75 * lvs)
  }

  // 艦種補正
  if (ships[0].api.api_id === info.api.api_id) {
    ci += 15.0
  }

  // 探照灯補正
  if (ships.some((s) => s.slots.some((slot) => slot && KcsUtil.slotitemImgType(slot.mst) === SlotitemImgType.tansyoutou))) {
    ci += 7.0
  }

  // 照明弾は確率発動のため計算に含めない

  // 装備補正
  info.slots.forEach((slot) => {
    if (slot) {
      // 見張員
      if (slot.mst.api_id === 129) {
        ci += 5.0
      }
      // 水雷戦隊 熟練見張員
      if (slot.mst.api_id === 412) {
        if (([ApiShipType.kutikukan, ApiShipType.keijyun, ApiShipType.raijyun] as number[]).includes(info.mst.api_stype)) {
          ci += 8.0
        }
      }
    }
  })

  return ci
}

export const SenseiTaisenType = {
  byequip: 0,
  auto: 1
} as const
export type SenseiTaisenType = (typeof SenseiTaisenType)[keyof typeof SenseiTaisenType]

export const SenseiRaigekiType = {
  byequip: 0,
  auto: 1
} as const
export type SenseiRaigekiType = (typeof SenseiRaigekiType)[keyof typeof SenseiRaigekiType]

/**
 * 夜戦カットイン種別
 */
export const YCutin = {
  COMMON_RENGEKI: 0, // 連撃
  COMMON_SYU3: 1, // 汎用 主砲カットイン
  COMMON_SYU_FUKU: 2, // 汎用 主副カットイン
  COMMON_GYO2: 3, // 汎用 魚雷カットイン
  COMMON_SYU_GYO: 4, // 汎用 主魚カットイン

  KUTIKU_SYU_GYO_DEN: 20, // 駆逐 主魚電カットイン
  KUTIKU_SYU_GYO_DEN3_3: 21, // 駆逐 主魚電カットイン D型改三 x 2 装備時
  KUTIKU_SYU_GYO_DEN2_3: 22, // 駆逐 主魚電カットイン D型改二+D型改三 装備時
  KUTIKU_SYU_GYO_DEN2_2: 23, // 駆逐 主魚電カットイン D型改二 x 2 装備時
  KUTIKU_SYU_GYO_DEN3: 24, // 駆逐 主魚電カットイン D型改三 装備時
  KUTIKU_SYU_GYO_DEN2: 25, // 駆逐 主魚電カットイン D型改二 装備時

  KUTIKU_GYO_MI_DEN: 30, // 駆逐 魚見(水)電カットイン
  KUTIKU_GYO_MI_DEN3_3: 31, // 駆逐 魚見(水)電カットイン D型改三 x 2 装備時
  KUTIKU_GYO_MI_DEN2_3: 32, // 駆逐 魚見(水)電カットイン D型改二+D型改三 装備時
  KUTIKU_GYO_MI_DEN2_2: 33, // 駆逐 魚見(水)電カットイン D型改二 x 2 装備時
  KUTIKU_GYO_MI_DEN3: 34, // 駆逐 魚見(水)電カットイン D型改三 装備時
  KUTIKU_GYO_MI_DEN2: 35, // 駆逐 魚見(水)電カットイン D型改二 装備時

  KUTIKU_MI_GYO2: 40, // 駆逐 水雷戦隊 熟練水雷見張員 魚雷カットイン
  KUTIKU_MI_GYO_D: 41, // 駆逐 水雷戦隊 熟練水雷見張員 魚雷カットイン ドラム缶装備

  YAKAN_ZUIUN1: 50, // 夜間瑞雲 x 1 カットイン
  YAKAN_ZUIUN1_DEN: 51, // 夜間瑞雲 x 1 カットイン 電探装備時
  YAKAN_ZUIUN2: 52, // 夜間瑞雲 x 2 カットイン 電探装備時
  YAKAN_ZUIUN2_DEN: 53, // 夜間瑞雲 x 2 カットイン 電探装備時

  SENSUI_SGYO_SDEN: 100, // 潜水艦 電魚魚カットイン 
  SENSUI_SGYO2: 101, // 潜水艦 魚魚魚カットイン

} as const
export type YCutin = (typeof YCutin)[keyof typeof YCutin]

const isCommonYCutin = (ci: YCutin): boolean => {
  return ci === YCutin.COMMON_RENGEKI 
    || ci === YCutin.COMMON_SYU3
    || ci === YCutin.COMMON_SYU_FUKU
    || ci === YCutin.COMMON_GYO2
    || ci === YCutin.COMMON_SYU_GYO
}

/**
 * 夜戦種別係数
 */
const YConst = (ciConst: number, aRatio: number): { ciConst: number, aRatio: number } => ({
  ciConst,
  aRatio
})
export const YCutinConst = {
  [YCutin.COMMON_RENGEKI]: YConst(0, 0),
  [YCutin.COMMON_SYU3]: YConst(140, 2.00),
  [YCutin.COMMON_SYU_FUKU]: YConst(130, 1.75),
  [YCutin.COMMON_GYO2]: YConst(122, 1.50),
  [YCutin.COMMON_SYU_GYO]: YConst(115, 1.30),

  [YCutin.KUTIKU_SYU_GYO_DEN]: YConst(115, 1.30),
  [YCutin.KUTIKU_SYU_GYO_DEN3_3]: YConst(115, 2.002),
  [YCutin.KUTIKU_SYU_GYO_DEN2_3]: YConst(115, 1.911),
  [YCutin.KUTIKU_SYU_GYO_DEN2_2]: YConst(115, 1.82),
  [YCutin.KUTIKU_SYU_GYO_DEN3]: YConst(115, 1.706),
  [YCutin.KUTIKU_SYU_GYO_DEN2]: YConst(115, 1.625),

  [YCutin.KUTIKU_GYO_MI_DEN]: YConst(140, 1.20),
  [YCutin.KUTIKU_GYO_MI_DEN3_3]: YConst(140, 1.848),
  [YCutin.KUTIKU_GYO_MI_DEN2_3]: YConst(140, 1.768),
  [YCutin.KUTIKU_GYO_MI_DEN2_2]: YConst(140, 1.68),
  [YCutin.KUTIKU_GYO_MI_DEN3]: YConst(140, 1.575),
  [YCutin.KUTIKU_GYO_MI_DEN2]: YConst(140, 1.5),

  [YCutin.KUTIKU_MI_GYO2]: YConst(126, 1.50),
  [YCutin.KUTIKU_MI_GYO_D]: YConst(122, 1.30),

  [YCutin.YAKAN_ZUIUN1]: YConst(135, 1.24),
  [YCutin.YAKAN_ZUIUN1_DEN]: YConst(135, 1.28),
  [YCutin.YAKAN_ZUIUN2]: YConst(135, 1.32),
  [YCutin.YAKAN_ZUIUN2_DEN]: YConst(135, 1.36),

  [YCutin.SENSUI_SGYO_SDEN]: YConst(105, 1.75),
  [YCutin.SENSUI_SGYO2]: YConst(110, 1.60),

} satisfies Record<YCutin, { 
  ciConst: number
  aRatio: number
}>

/**
 * 夜襲カットイン
 */
export const YSCutin = {
  YAKOU: 0,
  SEN2_KOU1: 1,
  SEN1_KOU1: 2,
  SEN1_KOUSUISEI1: 3,
  KOU1_KOUSUISEI1: 4,
  SEN1_BAKU1: 5,
  KOU1_BAKU1: 6,
  BAKU1_KOUSUISEI1: 7,
  SEN1_YAKANKOKU2: 8,
} as const
export type YSCutin = (typeof YSCutin)[keyof typeof YSCutin]

/**
 * 夜戦種別係数(夜襲)
 */
const YSConst = (ciConst: number, aRatio: number, order: number): { ciConst: number, aRatio: number, order: number } => ({
  ciConst,
  aRatio,
  order
})
const YSCutinConst = {
  [YSCutin.YAKOU]: YSConst(1, 1.0, 0),
  [YSCutin.SEN2_KOU1]: YSConst(105, 1.25, 50),
  [YSCutin.SEN1_KOU1]: YSConst(120, 1.20, 40),
  [YSCutin.SEN1_KOUSUISEI1]: YSConst(120, 1.20, 30),
  [YSCutin.KOU1_KOUSUISEI1]: YSConst(120, 1.20, 29),
  [YSCutin.SEN1_BAKU1]: YSConst(120, 1.20, 28),
  [YSCutin.KOU1_BAKU1]: YSConst(120, 1.20, 27),
  [YSCutin.BAKU1_KOUSUISEI1]: YSConst(120, 1.20, 26),
  [YSCutin.SEN1_YAKANKOKU2]: YSConst(130, 1.18, 20),
} satisfies Record<YSCutin, { 
  ciConst: number
  aRatio: number
}>

export const FACutin = {
  SYU_SYU: 0,
  SYU_TEK: 1,
  SYU_DEN: 2,
  SYU_FUK: 3,
  RENGEKI: 4,
  KAI_KUU: 5,
  ZUI_UN: 6
} as const
export type FACutin = (typeof FACutin)[keyof typeof FACutin]

const FACutinConst: number[] = [
  150, // SYU_SYU = 0,
  140, // SYU_TEK,
  130, // SYU_DEN,
  120, // SYU_FUK,
  130, // RENGEKI,
  120, // KAI_KUU, !! caption unknown
  120 // ZUI_UN,
]

export const AACutin = {
  FBA: 0,
  BBA: 1,
  BA: 2
} as const
export type AACutin = (typeof AACutin)[keyof typeof AACutin]

const AACutinConst: number[] = [125, 140, 155]

export const THCutin = {
  Nelson: 0,
  Colorado: 1,
  Nagato: 2,
  Mutu: 3,
  Kongou: 4,
  Hiei: 5,
  Haruna: 6,
  Kirisima: 7,
  YamatoType1: 8,
  YamatoType2: 9,
} as const
export type THCutin = (typeof THCutin)[keyof typeof THCutin]

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
  id13_common: 13,
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
  id27_ooyodo_kai: 27,
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
  id38_atlanta: 38,
  id39_atlanta: 39,
  id40_atlanta: 40,
  id41_atlanta: 41,
  id42_yamatogata_kai2: 42,
  id43_yamatogata_kai2: 43,
  id44_yamatogata_kai2: 44,
  id45_yamatogata_kai2: 45,
  id46_haruna_kai2_otu: 46,
  id47_siratuyu_kai2: 47,
  id48_akizuki_kai: 48,
  id49_fubuki_kai2: 49,
  id50_fubuki_kai2: 50,
  id51_fubuki_kai2: 51,
  id52_fubuki_kai2: 52,
  id53_hiryu_kai3: 53,
} as const
export type TKCutin = (typeof TKCutin)[keyof typeof TKCutin]

export interface TKCutinConst {
  readonly rate: number
  readonly kotei: number
  readonly hendou: number
}

const TKCutinConstV = (rate: number, kotei: number, hendou: number): TKCutinConst => {
  return { rate: rate, kotei: kotei, hendou: hendou }
}
// rate src: https://docs.google.com/spreadsheets/d/1agGoLv57g5eOXLXtNIKHRoBYy61OQYxibWP6Vi_DMuY/edit?gid=13450409#gid=13450409
// 小数第1で四捨五入
export const TKCutinConsts = {
  [TKCutin.none]: TKCutinConstV(0, 0, 0),
  [TKCutin.id01_akizuki]: TKCutinConstV(64, 8, 1.7),
  [TKCutin.id02_akizuki]: TKCutinConstV(58, 7, 1.7), 
  [TKCutin.id03_akizuki]: TKCutinConstV(50, 5, 1.6), 
  [TKCutin.id04_common]: TKCutinConstV(51, 7, 1.5), 
  [TKCutin.id05_common]: TKCutinConstV(54, 5, 1.5), 
  [TKCutin.id06_common]: TKCutinConstV(40, 6, 1.45), 
  [TKCutin.id07_common]: TKCutinConstV(44, 4, 1.35), 
  [TKCutin.id08_common]: TKCutinConstV(50, 5, 1.4), 
  [TKCutin.id09_common]: TKCutinConstV(40, 3, 1.3), 
  [TKCutin.id10_maya]: TKCutinConstV(59, 9, 1.65), 
  [TKCutin.id11_maya]: TKCutinConstV(54, 7, 1.5), 
  [TKCutin.id12_common]: TKCutinConstV(44, 4, 1.25), 
  [TKCutin.id13_common]: TKCutinConstV(34, 5, 1.25), 
  [TKCutin.id14_isuzu]: TKCutinConstV(62, 5, 1.45), 
  [TKCutin.id15_isuzu]: TKCutinConstV(53, 4, 1.3), 
  [TKCutin.id16_kasumi_yuubari]: TKCutinConstV(61, 5, 1.4), 
  [TKCutin.id17_kasumi]: TKCutinConstV(56, 3, 1.25), 
  [TKCutin.id18_satuki]: TKCutinConstV(58, 3, 1.2), 
  [TKCutin.id19_kinu]: TKCutinConstV(56, 6, 1.45), 
  [TKCutin.id20_kinu]: TKCutinConstV(64, 4, 1.25), 
  [TKCutin.id21_yura]: TKCutinConstV(59, 6, 1.45), 
  [TKCutin.id22_fumituki]: TKCutinConstV(64, 3, 1.2), 
  [TKCutin.id23_uit25]: TKCutinConstV(79, 2, 1.05), 
  [TKCutin.id24_tenryu_tatuta]: TKCutinConstV(61, 4, 1.25), 
  [TKCutin.id25_ise]: TKCutinConstV(59, 8, 1.55), 
  [TKCutin.id26_musasi]: TKCutinConstV(55, 7, 1.4), 
  [TKCutin.id27_ooyodo_kai]: TKCutinConstV(52, 7, 1.55), 
  [TKCutin.id28_ise_musasi]: TKCutinConstV(55, 5, 1.4), 
  [TKCutin.id29_hamakaze_isokaze]: TKCutinConstV(59, 6, 1.55), 
  [TKCutin.id30_tenryu_gotland]: TKCutinConstV(50, 4, 1.3), 
  [TKCutin.id31_tenryu]: TKCutinConstV(50, 3, 1.25), 
  [TKCutin.id32_england_kongou]: TKCutinConstV(59, 4, 1.2), 
  [TKCutin.id33_gotland]: TKCutinConstV(42, 4, 1.35), 
  [TKCutin.id34_fletcher]: TKCutinConstV(59, 8, 1.6), 
  [TKCutin.id35_fletcher]: TKCutinConstV(54, 7, 1.55), 
  [TKCutin.id36_fletcher]: TKCutinConstV(50, 7, 1.55), 
  [TKCutin.id37_fletcher]: TKCutinConstV(40, 5, 1.45), 
  [TKCutin.id38_atlanta]: TKCutinConstV(59, 11, 1.85), 
  [TKCutin.id39_atlanta]: TKCutinConstV(55, 11, 1.7), 
  [TKCutin.id40_atlanta]: TKCutinConstV(55, 11, 1.7), 
  [TKCutin.id41_atlanta]: TKCutinConstV(59, 10, 1.65), 
  [TKCutin.id42_yamatogata_kai2]: TKCutinConstV(64, 11, 1.7),
  [TKCutin.id43_yamatogata_kai2]: TKCutinConstV(59, 9, 1.65),
  [TKCutin.id44_yamatogata_kai2]: TKCutinConstV(54, 7, 1.65),
  [TKCutin.id45_yamatogata_kai2]: TKCutinConstV(49, 7, 1.6),
  [TKCutin.id46_haruna_kai2_otu]: TKCutinConstV(49, 7, 1.55),
  [TKCutin.id47_siratuyu_kai2]: TKCutinConstV(70, 3, 1.3),
  [TKCutin.id48_akizuki_kai]: TKCutinConstV(64, 9, 1.75),
  [TKCutin.id49_fubuki_kai2]: TKCutinConstV(40, 7, 1.5), // 40% 仮
  [TKCutin.id50_fubuki_kai2]: TKCutinConstV(40, 8, 1.5), // 40% 仮
  [TKCutin.id51_fubuki_kai2]: TKCutinConstV(40, 6, 1.4), // 40% 仮
  [TKCutin.id52_fubuki_kai2]: TKCutinConstV(40, 6, 1.4), // 40% 仮
  [TKCutin.id53_hiryu_kai3]: TKCutinConstV(60, 5, 1.6),
} satisfies Record<TKCutin, TKCutinConst>

const tkCutin = (info: ShipInfo): { entry: TKCutin[]; type: TKCutin[] } => {
  const ship_id = info.mst.api_id
  const types: TKCutin[] = []

  const retCmn = (entry: TKCutin[]): { entry: TKCutin[]; type: TKCutin[] } => {
    let type: TKCutin[] = entry.slice()
    if (type.includes(TKCutin.id04_common)) {
      type = type.filter((t) => t !== TKCutin.id06_common)
    }
    if (type.includes(TKCutin.id05_common)) {
      type = type.filter((t) => t !== TKCutin.id08_common)
    }
    if (type.includes(TKCutin.id07_common)) {
      type = type.filter((t) => t !== TKCutin.id09_common)
    }
    if (type.includes(TKCutin.id13_common)) {
      type = type.filter((t) => t !== TKCutin.id12_common)
    }
    return { entry: entry, type: type }
  }

  const addCmn = (common: { ks: number; d: number; k: number; tk: number }): TKCutin[] => {
    const type: TKCutin[] = []
    if (common.tk >= 2 && common.d >= 1) type.push(TKCutin.id05_common)
    else if (common.k >= 1 && common.ks >= 1 && common.d >= 1) type.push(TKCutin.id07_common)
    else if (common.k >= 1 && common.ks >= 1) type.push(TKCutin.id09_common)
    else if (common.tk >= 1 && common.d >= 1) type.push(TKCutin.id08_common)
    return type
  }

  const checkFletcherTk = (): { entry: TKCutin[]; type: TKCutin[] }  => {
    const cnt = info.slots.reduce(
      (acc, slot) => {
        if (slot) {
          if (slot.mst.api_id === 284) acc.s284++
          if (slot.mst.api_id === 307) acc.s307d++
          if (slot.mst.api_id === 308) acc.s308++
          if (slot.mst.api_id === 313) acc.s313++
        }
        return acc
      },
      { s308: 0, s284: 0, s313: 0, s307d: 0 }
    )
    if (cnt.s308 >= 2) types.push(TKCutin.id34_fletcher)
    if (cnt.s308 >= 1 && cnt.s284 + cnt.s313 >= 1) types.push(TKCutin.id35_fletcher)
    if (cnt.s284 + cnt.s313 >= 2 && cnt.s307d >= 1) types.push(TKCutin.id36_fletcher)
    if (cnt.s313 >= 2) { 
      if (! isShipId(info.mst.api_id, [1040])) {
        types.push(TKCutin.id37_fletcher)
      }
    }
    if (types.includes(TKCutin.id34_fletcher) && types.includes(TKCutin.id35_fletcher)) {
      return {
        entry: types,
        type: [TKCutin.id34_fletcher, TKCutin.id35_fletcher]
      }
    }
    if (types.includes(TKCutin.id34_fletcher)) {
      let type: TKCutin[] = [TKCutin.id34_fletcher]
      type = type.concat(addCmn(common))
      return {
        entry: types,
        type: type
      }
    }
    if (types.includes(TKCutin.id35_fletcher) && types.includes(TKCutin.id37_fletcher)) {
      return {
        entry: types,
        type: [TKCutin.id35_fletcher, TKCutin.id37_fletcher]
      }
    }
    if (types.includes(TKCutin.id35_fletcher)) {
      let type: TKCutin[] = [TKCutin.id35_fletcher]
      type = type.concat(addCmn(common))
      return {
        entry: types,
        type: type
      }
    }
    if (types.includes(TKCutin.id36_fletcher) && types.includes(TKCutin.id37_fletcher)) {
      return {
        entry: types,
        type: [TKCutin.id37_fletcher, TKCutin.id36_fletcher]
      }
    }
    if (types.includes(TKCutin.id36_fletcher)) {
      return {
        entry: types,
        type: [TKCutin.id36_fletcher]
      }
    }
    if (types.includes(TKCutin.id37_fletcher)) {
      let type: TKCutin[] = [TKCutin.id37_fletcher]
      type = type.concat(addCmn(common))
      return {
        entry: types,
        type: type
      }
    }
    return retCmn(types)
  };

  // common
  const common = info.slots.reduce(
    (acc, slot) => {
      if (slot) {
        const imgtype = KcsUtil.slotitemImgType(slot.mst)
        if (imgtype === SlotitemImgType.syuhou_dai) acc.dai++
        if (imgtype === SlotitemImgType.sansikidan) acc.s++
        if (imgtype === SlotitemImgType.kousyasouti) acc.ks++
        if (imgtype === SlotitemImgType.dentan && slot.mst.api_tyku > 0) acc.d++
        if (imgtype === SlotitemImgType.kijyu) {
          acc.kj++
          if (slot.mst.api_tyku >= 9) acc.kjt++
          if (slot.mst.api_tyku >= 3) acc.kj3++
        }
        if (imgtype === SlotitemImgType.koukakuhou) {
          acc.k++
          if (slot.mst.api_tyku >= 8) acc.tk++
        }
      }
      return acc
    },
    { dai: 0, s: 0, ks: 0, d: 0, kj: 0, kjt: 0, kj3: 0, k: 0, tk: 0 }
  )
  if (common.dai >= 1 && common.s >= 1 && common.ks >= 1 && common.d >= 1)
    types.push(TKCutin.id04_common)
  if (common.tk >= 2 && common.d >= 1) types.push(TKCutin.id05_common)
  if (common.dai >= 1 && common.s >= 1 && common.ks >= 1) types.push(TKCutin.id06_common)
  if (common.k >= 1 && common.ks >= 1 && common.d >= 1) types.push(TKCutin.id07_common)
  if (common.tk >= 1 && common.d >= 1) types.push(TKCutin.id08_common)
  if (common.k >= 1 && common.ks >= 1) types.push(TKCutin.id09_common)
  if (common.kj3 - common.kjt >= 1 && common.kj3 >= 1 && common.d >= 1)
    types.push(TKCutin.id12_common)
  if (common.tk >= 1 && common.kjt >= 1 && common.d >= 1 && ship_id !== 428)
    types.push(TKCutin.id13_common)

  // akizuki type
  // fubuki kai3
  const isFubukikai3Go = isShipId(ship_id, [1040])
  if (isShipCategory(info.mst.api_ctype, [ApiShipCategory.akizuki]) ||
      isFubukikai3Go) {
    const cnt = info.slots.reduce(
      (acc, slot) => {
        if (slot) {
          const imgtype = KcsUtil.slotitemImgType(slot.mst)
          if (imgtype === SlotitemImgType.dentan) {
            acc.d++
            if (slot.mst.api_tyku >= 4) acc.d4++
          }
          if (slot.mst.api_id === 553) acc.s553++
          if (slot.mst.api_id === 533) acc.s533++
          if (slot.mst.api_id === 121) acc.s121++
        }
        return acc
      },
      { d: 0, s553: 0, s533: 0, s121: 0, d4: 0 }
    )

    if (common.k >= 2 && cnt.d >= 1) {
      if (! isFubukikai3Go) {
        types.push(TKCutin.id01_akizuki)
      }
    }
    if (common.tk >= 1 && cnt.d >= 1) types.push(TKCutin.id02_akizuki)
    if (common.k >= 2) {
      if (! isShipId(ship_id, [1040])) {
        types.push(TKCutin.id03_akizuki)
      }
    }
    // akiduki, fubuki kai3 go
    if ((cnt.s553+cnt.s533) >= 2 && cnt.d4 >= 1 && cnt.s121 >= 1) types.push(TKCutin.id50_fubuki_kai2);

    // fubuki kai3 go
    if (isFubukikai3Go) {
      if (common.tk >= 2 && cnt.d4 >= 1) types.push(TKCutin.id49_fubuki_kai2);
      if ((cnt.s553+cnt.s533) >= 1 && cnt.d4 >= 1 && common.kj3 >= 1) types.push(TKCutin.id51_fubuki_kai2);
      if (cnt.s553 >= 2 && cnt.s121 >= 1) types.push(TKCutin.id52_fubuki_kai2);
    }

    // kai,kai2 only 
    // fubuki kai2 go
    if (isShipId(ship_id, [
      330, // akiduki kai
      963, // akiduki kai2
      346, // teruduki kai
      537, // suzutuki kai
      357, // hatuduki kai
      968, // hatuduki kai2
      538, // fuyutuki kai
    ]) || isFubukikai3Go) {
      if (cnt.s533 >= 2 && cnt.d4 >= 1) types.push(TKCutin.id48_akizuki_kai)
    }

    if (types.includes(TKCutin.id48_akizuki_kai)) {
      return {
        entry: types,
        type: [TKCutin.id48_akizuki_kai]
      }
    }
    if (types.includes(TKCutin.id01_akizuki)) {
      return {
        entry: types,
        type: [TKCutin.id01_akizuki]
      }
    }
    if (types.includes(TKCutin.id50_fubuki_kai2)) {
      return {
        entry: types,
        type: [TKCutin.id50_fubuki_kai2]
      }
    }

    if (types.includes(TKCutin.id49_fubuki_kai2)) {
      let type: TKCutin[] = [TKCutin.id49_fubuki_kai2]
      return {
        entry: types,
        type: type
      }
    }

    if (types.includes(TKCutin.id51_fubuki_kai2)) {
      let type: TKCutin[] = [TKCutin.id51_fubuki_kai2]
      return {
        entry: types,
        type: type
      }
    }

    if (types.includes(TKCutin.id52_fubuki_kai2)) {
      let type: TKCutin[] = [TKCutin.id52_fubuki_kai2]
      return {
        entry: types,
        type: type
      }
    }

    if (types.includes(TKCutin.id02_akizuki)) {
      return {
        entry: types,
        type: [TKCutin.id02_akizuki]
      }
    }
    if (types.includes(TKCutin.id03_akizuki)) {
      return {
        entry: types,
        type: [TKCutin.id03_akizuki]
      }
    }

    // fubukikai3 go: check fletcher tk
    if (isFubukikai3Go) {
      return checkFletcherTk()
    }
    return retCmn(types)
  }

  // maya kai2
  if (ship_id === 428) {
    if (common.k >= 1 && common.kjt >= 1 && common.d >= 1) types.push(TKCutin.id10_maya)
    if (common.k >= 1 && common.kjt >= 1) types.push(TKCutin.id11_maya)
    if (types.includes(TKCutin.id10_maya)) {
      return {
        entry: types,
        type: [TKCutin.id10_maya]
      }
    }
    if (types.includes(TKCutin.id11_maya)) {
      return {
        entry: types,
        type: [TKCutin.id11_maya]
      }
    }
    return retCmn(types)
  }

  // isuzu kai2
  if (ship_id === 141) {
    if (common.k >= 1 && common.kj >= 1 && common.d >= 1) types.push(TKCutin.id14_isuzu)
    if (common.k >= 1 && common.kj >= 1) types.push(TKCutin.id15_isuzu)

    if (types.includes(TKCutin.id14_isuzu)) {
      return {
        entry: types,
        type: [TKCutin.id14_isuzu]
      }
    }
    if (types.includes(TKCutin.id15_isuzu)) {
      return {
        entry: types,
        type: [TKCutin.id15_isuzu]
      }
    }
    return retCmn(types)
  }

  // kasumi kai2otu, yuubari kai2
  if (isShipId(ship_id, [470, 622, 623, 624])) {
    if (common.k >= 1 && common.kj >= 1 && common.d >= 1) types.push(TKCutin.id16_kasumi_yuubari)
    if (common.k >= 1 && common.kj >= 1 && ship_id === 470) types.push(TKCutin.id17_kasumi)
    if (types.includes(TKCutin.id16_kasumi_yuubari)) {
      return {
        entry: types,
        type: [TKCutin.id16_kasumi_yuubari]
      }
    }
    if (types.includes(TKCutin.id17_kasumi)) {
      return {
        entry: types,
        type: [TKCutin.id17_kasumi]
      }
    }
    return retCmn(types)
  }

  // satuki kai2, fumituki kai2
  if (ship_id === 418 || ship_id === 548) {
    let t: TKCutin = TKCutin.none
    if (common.kjt >= 1 && ship_id === 418) t = TKCutin.id18_satuki
    if (common.kjt >= 1 && ship_id === 548) t = TKCutin.id22_fumituki

    if (t != TKCutin.none) {
      types.push(t)
      const type: TKCutin[] = addCmn(common)
      type.push(t)
      return {
        entry: types,
        type: type
      }
    }
    return retCmn(types)
  }

  // kinu kai2
  if (ship_id === 487) {
    const cnt = info.slots.reduce(
      (acc, slot) => {
        if (slot) {
          const imgtype = KcsUtil.slotitemImgType(slot.mst)
          if (imgtype === SlotitemImgType.koukakuhou && slot.mst.api_tyku <= 7) acc.k++
        }
        return acc
      },
      { k: 0 }
    )
    if (cnt.k >= 1 && common.kj >= 1) types.push(TKCutin.id19_kinu)
    if (common.kj >= 1) types.push(TKCutin.id20_kinu)
    if (types.includes(TKCutin.id19_kinu) && types.includes(TKCutin.id20_kinu)) {
      return {
        entry: types,
        type: [TKCutin.id19_kinu, TKCutin.id20_kinu]
      }
    }
    if (types.includes(TKCutin.id20_kinu)) {
      const type: TKCutin[] = []
      if (common.tk >= 2 && common.d >= 1) type.push(TKCutin.id05_common)
      else if (common.k >= 1 && common.ks >= 1 && common.d >= 1) type.push(TKCutin.id07_common)
      else if (common.k >= 1 && common.ks >= 1) type.push(TKCutin.id09_common)
      else if (common.tk >= 1 && common.d >= 1) type.push(TKCutin.id08_common)
      type.push(TKCutin.id20_kinu)
      return {
        entry: types,
        type: type
      }
    }
    return retCmn(types)
  }

  // yura kai2
  if (ship_id === 488) {
    if (common.k >= 1 && common.d >= 1 && ship_id === 488) types.push(TKCutin.id21_yura)
    if (types.includes(TKCutin.id21_yura)) {
      return {
        entry: types,
        type: [TKCutin.id21_yura]
      }
    }
    return retCmn(types)
  }

  // ooyodo kai
  if (ship_id === 321) {
    const cnt = info.slots.reduce(
      (acc, slot) => {
        if (slot) {
          if (slot.mst.api_id === 275) acc.s275++
          if (slot.mst.api_id === 274) acc.s274++
        }
        return acc
      },
      { s275: 0, s274: 0 }
    )
    if (cnt.s274 >= 1 && cnt.s275 >= 1 && common.d >= 1) types.push(TKCutin.id27_ooyodo_kai)

    if (types.includes(TKCutin.id27_ooyodo_kai)) {
      const type: TKCutin[] = [TKCutin.id27_ooyodo_kai]
      return {
        entry: types,
        type: type
      }
    }

    return retCmn(types)
  }

  // hamakaze otu kai, isokaze otu kai
  if (isShipId(ship_id, [557, 558])) {
    if (common.k >= 1 && common.d >= 1) types.push(TKCutin.id29_hamakaze_isokaze)
    if (types.includes(TKCutin.id29_hamakaze_isokaze)) {
      const type: TKCutin[] = addCmn(common)
      type.push(TKCutin.id29_hamakaze_isokaze)
      return {
        entry: types,
        type: type
      }
    }
    return retCmn(types)
  }

  // gotland kai, gotland andra
  if (isShipId(ship_id, [579, 630])) {
    const cnt = info.slots.reduce(
      (acc, slot) => {
        if (slot) {
          const imgtype = KcsUtil.slotitemImgType(slot.mst)
          if (imgtype === SlotitemImgType.kijyu && slot.mst.api_tyku >= 4) acc.kj++
        }
        return acc
      },
      { kj: 0 }
    )
    if (common.k >= 3) types.push(TKCutin.id30_tenryu_gotland)
    if (common.k >= 1 && cnt.kj >= 1) types.push(TKCutin.id33_gotland)
    if (types.includes(TKCutin.id33_gotland)) {
      const type: TKCutin[] = addCmn(common)
      type.push(TKCutin.id33_gotland)
      return {
        entry: types,
        type: type
      }
    }
    if (types.includes(TKCutin.id30_tenryu_gotland)) {
      const type: TKCutin[] = addCmn(common)
      if (!type.length) {
        type.push(TKCutin.id30_tenryu_gotland)
      }
      return {
        entry: types,
        type: type
      }
    }
    return retCmn(types)
  }

  // tenryu kai2
  if (ship_id === 477) {
    if (common.k >= 3) types.push(TKCutin.id30_tenryu_gotland)
    if (common.k >= 2 && ship_id === 477) types.push(TKCutin.id31_tenryu)
    if (common.k >= 1 && common.kj - common.kjt >= 1) types.push(TKCutin.id24_tenryu_tatuta)
    if (types.includes(TKCutin.id24_tenryu_tatuta)) {
      const type: TKCutin[] = addCmn(common)
      type.push(TKCutin.id24_tenryu_tatuta)
      return {
        entry: types,
        type: type
      }
    }
    if (types.includes(TKCutin.id30_tenryu_gotland) && types.includes(TKCutin.id31_tenryu)) {
      const type: TKCutin[] = addCmn(common)
      type.push(TKCutin.id30_tenryu_gotland)
      type.push(TKCutin.id31_tenryu)
      return {
        entry: types,
        type: type
      }
    }
    if (types.includes(TKCutin.id31_tenryu)) {
      const type: TKCutin[] = addCmn(common)
      type.push(TKCutin.id31_tenryu)
      return {
        entry: types,
        type: type
      }
    }
    return retCmn(types)
  }

  // uit-25, i504
  if (isShipId(ship_id, [539, 530])) {
    if (common.kj - common.kjt >= 1) types.push(TKCutin.id23_uit25)
    if (types.includes(TKCutin.id23_uit25)) {
      return {
        entry: types,
        type: [TKCutin.id31_tenryu]
      }
    }
    return retCmn(types)
  }

  // tatuta kai2
  if (ship_id === 478) {
    if (common.k >= 1 && common.kj - common.kjt >= 1) types.push(TKCutin.id24_tenryu_tatuta)
    if (types.includes(TKCutin.id24_tenryu_tatuta)) {
      const type: TKCutin[] = addCmn(common)
      type.push(TKCutin.id24_tenryu_tatuta)
      return {
        entry: types,
        type: type
      }
    }
    return retCmn(types)
  }

  // ise type kai2
  if (isShipId(ship_id, [82, 553, 88, 554])) {
    const cnt = info.slots.reduce(
      (acc, slot) => {
        if (slot) {
          if (slot.mst.api_id === 274) acc.kj++
        }
        return acc
      },
      { kj: 0 }
    )
    if (cnt.kj >= 1 && common.d >= 1 && common.s >= 1) types.push(TKCutin.id25_ise)
    if (cnt.kj >= 1 && common.d >= 1) types.push(TKCutin.id28_ise_musasi)
    if (types.includes(TKCutin.id25_ise)) {
      return {
        entry: types,
        type: [TKCutin.id25_ise]
      }
    }
    if (types.includes(TKCutin.id28_ise_musasi)) {
      const type: TKCutin[] = addCmn(common)
      if (!type.length) {
        type.push(TKCutin.id28_ise_musasi)
      }
      return {
        entry: types,
        type: type
      }
    }
    return retCmn(types)
  }

  // musasi kai
  if (isShipId(ship_id, [148, 546])) {
    const cnt = info.slots.reduce(
      (acc, slot) => {
        if (slot) {
          if (slot.mst.api_id === 274) acc.kj++
          if (slot.mst.api_id === 275) acc.k++
        }
        return acc
      },
      { k: 0, kj: 0 }
    )
    if (cnt.k >= 1 && common.d >= 1 && ship_id === 546) types.push(TKCutin.id26_musasi)
    if (cnt.kj >= 1 && common.d >= 1) types.push(TKCutin.id28_ise_musasi)
    if (types.includes(TKCutin.id26_musasi)) {
      const type: TKCutin[] = addCmn(common)
      type.push(TKCutin.id26_musasi)
      return {
        entry: types,
        type: type
      }
    }
    if (types.includes(TKCutin.id28_ise_musasi)) {
      const type: TKCutin[] = addCmn(common)
      if (!type.length) {
        type.push(TKCutin.id28_ise_musasi)
      }
      return {
        entry: types,
        type: type
      }
    }
    return retCmn(types)
  }

  // england, kongou type kai2, nelson type
  if (
    isShipId(
      ship_id,
      [439, 364, 571, 572, 576, 577, 515, 393, 519, 394, 520, 893, 149, 150, 151, 152, 591, 592]
    )
  ) {
    const cnt = info.slots.reduce(
      (acc, slot) => {
        if (slot) {
          if (slot.mst.api_id === 191) acc.pon++
          if (slot.mst.api_id === 300) acc.s300++
          if (slot.mst.api_id === 301) acc.rocket++
        }
        return acc
      },
      { s300: 0, pon: 0, rocket: 0 }
    )
    if ((cnt.s300 >= 1 && cnt.pon >= 1) || cnt.rocket >= 2 || (cnt.pon >= 1 && cnt.rocket >= 1))
      types.push(TKCutin.id32_england_kongou)
    if (types.includes(TKCutin.id32_england_kongou)) {
      const type: TKCutin[] = addCmn(common)
      if (!type.length) {
        type.push(TKCutin.id32_england_kongou)
      }
      return {
        entry: types,
        type: type
      }
    }
    return retCmn(types)
  }

  // fletchar type
  // fubuki kaisan go: already checked in akizuki type
  if (isShipCategory(info.mst.api_ctype, [ApiShipCategory.fletcher])) {
      return checkFletcherTk()
  }

  // atlanta
  if (isShipCategory(info.mst.api_ctype, [ApiShipCategory.atlanta])) {
    const cnt = info.slots.reduce(
      (acc, slot) => {
        if (slot) {
          if (slot.mst.api_id === 307) acc.s307d++
          if (slot.mst.api_id === 362) acc.s362++
          if (slot.mst.api_id === 363) acc.s363++
        }
        return acc
      },
      { s307d: 0, s362: 0, s363: 0 }
    )
    if (cnt.s363 >= 2) types.push(TKCutin.id38_atlanta)
    if (cnt.s363 >= 1 && cnt.s362 >= 1) types.push(TKCutin.id39_atlanta)
    if (cnt.s362 + cnt.s363 >= 1 && cnt.s362 >= 1 && cnt.s307d >= 1)
      types.push(TKCutin.id40_atlanta)
    if ((cnt.s363 >= 1 && cnt.s362 >= 1) || cnt.s362 >= 2) types.push(TKCutin.id41_atlanta)

    if (
      types.includes(TKCutin.id38_atlanta) &&
      types.includes(TKCutin.id41_atlanta)
    ) {
      let type: TKCutin[] = [TKCutin.id38_atlanta, TKCutin.id41_atlanta]
      type = type.concat(addCmn(common))
      return {
        entry: types,
        type: type
      }
    }

    if (
      types.includes(TKCutin.id38_atlanta) &&
      types.includes(TKCutin.id40_atlanta) &&
      types.includes(TKCutin.id41_atlanta)
    ) {
      let type: TKCutin[] = [TKCutin.id38_atlanta, TKCutin.id40_atlanta, TKCutin.id41_atlanta]
      type = type.concat(addCmn(common))
      return {
        entry: types,
        type: type
      }
    }

    if (
      types.includes(TKCutin.id39_atlanta) &&
      types.includes(TKCutin.id40_atlanta) &&
      types.includes(TKCutin.id41_atlanta)
    ) {
      let type: TKCutin[] = [TKCutin.id39_atlanta, TKCutin.id40_atlanta, TKCutin.id41_atlanta]
      type = type.concat(addCmn(common))
      return {
        entry: types,
        type: type
      }
    }
    if (types.includes(TKCutin.id39_atlanta) && types.includes(TKCutin.id41_atlanta)) {
      let type: TKCutin[] = [TKCutin.id39_atlanta, TKCutin.id41_atlanta]
      type = type.concat(addCmn(common))
      return {
        entry: types,
        type: type
      }
    }
    if (types.includes(TKCutin.id41_atlanta)) {
      let type: TKCutin[] = [TKCutin.id41_atlanta]
      type = type.concat(addCmn(common))
      return {
        entry: types,
        type: type
      }
    }
    return retCmn(types)
  }

  // yamato kaini
  if (
    isShipId(
      ship_id,
      [911, 916, 546]
    )
  ) {
    const cnt = info.slots.reduce(
      (acc, slot) => {
        if (slot) {
          const imgtype = KcsUtil.slotitemImgType(slot.mst)
          if (slot.mst.api_id === 464) acc.s464++
          if (slot.mst.api_id === 142) acc.s142++
          if (slot.mst.api_id === 460) acc.s460++
          if (imgtype === SlotitemImgType.kijyu && slot.mst.api_tyku >= 6) {
            acc.kj6++
          }
        }
        return acc
      },
      { s464: 0, s142: 0, s460: 0, kj6: 0 }
    )

    if (cnt.s464 >= 2 && (cnt.s142+cnt.s460) >= 1 && cnt.kj6 >= 1) types.push(TKCutin.id42_yamatogata_kai2)
    if (cnt.s464 >= 2 && (cnt.s142+cnt.s460) >= 1 && ! cnt.kj6) types.push(TKCutin.id43_yamatogata_kai2)
    if (cnt.s464 === 1 && (cnt.s142+cnt.s460) >= 1 && cnt.kj6 >= 1) types.push(TKCutin.id44_yamatogata_kai2)
    if (cnt.s464 === 1 && (cnt.s142+cnt.s460) >= 1 && ! cnt.kj6) types.push(TKCutin.id45_yamatogata_kai2)

    if (types.includes(TKCutin.id42_yamatogata_kai2)) {
      let type: TKCutin[] = [TKCutin.id42_yamatogata_kai2]
      return {
        entry: types,
        type: type
      }
    }

    if (types.includes(TKCutin.id43_yamatogata_kai2)) {
      let type: TKCutin[] = [TKCutin.id43_yamatogata_kai2]
      return {
        entry: types,
        type: type
      }
    }

    if (types.includes(TKCutin.id44_yamatogata_kai2)) {
      let type: TKCutin[] = [TKCutin.id44_yamatogata_kai2]
      return {
        entry: types,
        type: type
      }
    }

    if (types.includes(TKCutin.id45_yamatogata_kai2)) {
      let type: TKCutin[] = [TKCutin.id45_yamatogata_kai2]
      return {
        entry: types,
        type: type
      }
    }

    return retCmn(types)
  }

  // haruna kaini otu
  if (
    isShipId(
      ship_id,
      [593]
    )
  ) {
    const cnt = info.slots.reduce(
      (acc, slot) => {
        if (slot) {
          if (slot.mst.api_id === 503) acc.s503++
          if (slot.mst.api_id === 502) acc.s502++
        }
        return acc
      },
      { s503: 0, s502: 0 }
    )

    if ((cnt.s502+cnt.s503) >= 1 &&  common.kjt >= 1 && common.d >= 1) types.push(TKCutin.id46_haruna_kai2_otu)
    if (types.includes(TKCutin.id46_haruna_kai2_otu)) {
      let type: TKCutin[] = [TKCutin.id46_haruna_kai2_otu]
      return {
        entry: types,
        type: type
      }
    }

    return retCmn(types)
  }

  // id47_siratuyu_kaini
  if (
    isShipId(
      ship_id,
      [497, 145, 961, 498, 975]
    )
  ) {
    const cnt = info.slots.reduce(
      (acc, slot) => {
        if (slot) {
          const imgtype = KcsUtil.slotitemImgType(slot.mst)
          if (slot.mst.api_id === 529) acc.s529++
          if (slot.mst.api_id === 505) acc.s505++
          if (imgtype === SlotitemImgType.dentan && slot.mst.api_tyku >= 4) {
            acc.d4++
          }
        }
        return acc
      },
      { s529: 0, s505: 0, d4: 0 }
    )

    if (cnt.s529 >= 2) types.push(TKCutin.id47_siratuyu_kai2)
    if (cnt.s529 >= 1 && (cnt.s505+cnt.d4) >= 1 ) types.push(TKCutin.id47_siratuyu_kai2)

    if (types.includes(TKCutin.id47_siratuyu_kai2)) {
      let type: TKCutin[] = [TKCutin.id47_siratuyu_kai2]
      return {
        entry: types,
        type: type
      }
    }

    return retCmn(types)
  }

  // fubuki kaini
  if (
    isShipId(
      ship_id,
      [
        426, // fubuki kai2
        986, // sirayuki kai2
        987, // hatuyuki kai2
        981, // fujinami kai2
        983, // hamanami kai2
        982, // hayanami kai2
        1033, // tamanami kai2
        1035, // fubuki kai3: 
        // 1040, // fubukikai3 go: already checked in akizuki type
      ]
    ) ||
    isShipCategory(info.mst.api_ctype, [ApiShipCategory.akizuki])
  ) {
    const cnt = info.slots.reduce(
      (acc, slot) => {
        if (slot) {
          const imgtype = KcsUtil.slotitemImgType(slot.mst)
          if (slot.mst.api_id === 553) acc.s553++
          if (slot.mst.api_id === 533) acc.s533++
          if (slot.mst.api_id === 121) acc.s121++
          if (imgtype === SlotitemImgType.dentan && slot.mst.api_tyku >= 4) {
            acc.d4++
          }
        }
        return acc
      },
      { s553: 0, s533: 0, s121: 0, d4: 0 }
    )

    if (common.tk >= 2 && cnt.d4 >= 1) types.push(TKCutin.id49_fubuki_kai2);
    if ((cnt.s553+cnt.s533) >= 2 && cnt.d4 >= 1 && cnt.s121 >= 1) types.push(TKCutin.id50_fubuki_kai2);
    if ((cnt.s553+cnt.s533) >= 1 && cnt.d4 >= 1 && common.kj3 >= 1) types.push(TKCutin.id51_fubuki_kai2);
    if (cnt.s553 >= 2 && cnt.s121 >= 1) types.push(TKCutin.id52_fubuki_kai2);


    if (types.includes(TKCutin.id50_fubuki_kai2)) {
      let type: TKCutin[] = [TKCutin.id50_fubuki_kai2]
      return {
        entry: types,
        type: type
      }
    }

    if (types.includes(TKCutin.id49_fubuki_kai2)) {
      let type: TKCutin[] = [TKCutin.id49_fubuki_kai2]
      return {
        entry: types,
        type: type
      }
    }

    if (types.includes(TKCutin.id51_fubuki_kai2)) {
      let type: TKCutin[] = [TKCutin.id51_fubuki_kai2]
      return {
        entry: types,
        type: type
      }
    }

    if (types.includes(TKCutin.id52_fubuki_kai2)) {
      let type: TKCutin[] = [TKCutin.id52_fubuki_kai2]
      return {
        entry: types,
        type: type
      }
    }

    return retCmn(types)
  }

  // hiryu kai3
  if (ship_id === 1031) {
    const cnt = info.slots.reduce(
      (acc, slot) => {
        if (slot) {
          const imgtype = KcsUtil.slotitemImgType(slot.mst)
          if (slot.mst.api_id === 275) acc.s275++
          if (slot.mst.api_id === 274) acc.s274++
          if (imgtype === SlotitemImgType.dentan) {
            if (slot.mst.api_tyku >= 4) { 
              acc.d4++
            }
          }
          if (imgtype === SlotitemImgType.koukakuhou) {
            if (slot.mst.api_tyku >= 4) { 
              acc.k9++
            }
          }
        }
        return acc
      }, { d4: 0, k9: 0, s275: 0, s274: 0 }
    )

    if (types.includes(TKCutin.id27_ooyodo_kai)) {
      const type: TKCutin[] = [TKCutin.id27_ooyodo_kai]
      return {
        entry: types,
        type: type
      }
    }

    if (cnt.k9 >= 1 && cnt.d4 >= 1) types.push(TKCutin.id53_hiryu_kai3);
    if (common.k >= 1 && common.kjt >= 1 && common.d >= 1) types.push(TKCutin.id10_maya)
    if (common.k >= 1 && common.kjt >= 1) types.push(TKCutin.id11_maya);
    if (cnt.s274 >= 1 && cnt.s275 >= 1 && common.d >= 1) types.push(TKCutin.id27_ooyodo_kai)

    if (types.includes(TKCutin.id10_maya)) {
      let type: TKCutin[] = [TKCutin.id10_maya]
      return {
        entry: types,
        type: type
      }
    }

    if (types.includes(TKCutin.id11_maya)) {
      let type: TKCutin[] = [TKCutin.id11_maya]
      return {
        entry: types,
        type: type
      }
    }

    if (types.includes(TKCutin.id27_ooyodo_kai)) {
      let type: TKCutin[] = [TKCutin.id27_ooyodo_kai]
      return {
        entry: types,
        type: type
      }
    }

    if (types.includes(TKCutin.id53_hiryu_kai3)) {
      let type: TKCutin[] = [TKCutin.id53_hiryu_kai3]
      return {
        entry: types,
        type: type
      }
    }

    return retCmn(types)
  }

  return retCmn(types)
}

/**
 *
 */
export class KcsUtil {

  /**
   *
   */
  public static getDeckProgressMissionId(deck: ApiDeckPort): ApiMissionId {
    return deck.api_mission[1];
  }

  /**
   * 
   * @param ship 
   * @returns 
   */
  public static getSlotsWithOnSlot = (ship: ShipInfo): SlotWithOnSlot[] => {
    const onslotEnable = ship.mst.api_maxeq.some((maxeq) => maxeq > 0)
    const slotNum = ship.api.api_slotnum
    return ship.slots.map((el, index) => {
      let onslotMax = -1;
      if (onslotEnable && index < slotNum) {
        onslotMax = ship.mst.api_maxeq[index] ?? -1
      }
      return {
        api: el ? el.api : null,
        mst: el ? el.mst : null,
        onslot: ship.api.api_onslot[index],
        onslotMax
      }
    })
  }

  /**
   *
   * @param mst
   */
  public static shipCond(ship: ApiShip): Cond {
    const cond = ship.api_cond
    if (cond > 49) {
      return Cond.good
    }
    if (cond < 20) {
      return Cond.red
    }
    if (cond < 30) {
      return Cond.orange
    }
    if (cond < 40) {
      return Cond.orange_hidden
    }
    return Cond.normal
  }

  /**
   *
   */
  public static slotitemType(mst: MstSlotitem): SlotitemType {
    return mst.api_type[2]
  }

  /**
   *
   */
  public static slotitemImgType(mst: MstSlotitem): SlotitemImgType {
    return mst.api_type[3]
  }

  /**
   *
   */
  public static hasMainGun(type: SlotitemType): boolean {
    return (
      SlotitemType.SmallMainGun === type ||
      SlotitemType.MediumMainGun === type ||
      SlotitemType.LargeMainGun === type
    )
  }

  /**
   *
   */
  public static hasOnSlot(type: SlotitemType) {
    switch (type) {
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
        return true
    }
    return false
  }

  /**
   *
   */
  public static hasRadar(type: SlotitemType): boolean {
    return SlotitemType.SmallRadar === type || SlotitemType.LargeRadar === type
  }

  /**
   *
   */
  public static hasFASeaplane(type: SlotitemType): boolean {
    return SlotitemType.RecSeaplane === type || SlotitemType.SeaplaneBomber === type
  }

  /**
   *
   */
  public static hasSuisei634(id: number): boolean {
    return id === 291 || id === 292 || id === 319
  }

  /**
   *
   */
  public static hasZuiun(id: number): boolean {
    return (
      id === 26 ||
      id === 79 ||
      id === 80 ||
      id === 81 ||
      id === 207 ||
      id === 237 ||
      id === 322 ||
      id === 323 ||
      id === 490
    )
  }

  /**
   *
   */
  public static hasAADefence(type: SlotitemType): boolean {
    return (
      SlotitemType.Fighter === type ||
      SlotitemType.DiveBomber === type ||
      SlotitemType.TorpedoBomber === type ||
      SlotitemType.SeaplaneBomber === type ||
      SlotitemType.SeaplaneFighter === type ||
      SlotitemType.JetFighterBomber === type ||
      SlotitemType.LandAttackAircraft === type ||
      SlotitemType.LandRecAircraft === type ||
      SlotitemType.LandFighter === type
    )
  }

  /**
   *
   */
  public static yusouFromSlotitem(mst: MstSlotitem): number {
    switch (mst.api_id) {
      case 75:
        return 5.0
      case 68:
      case 193:
      case 166:
      case 230:
      case 355:
      case 408:
      case 409:
      case 436:
      case 449:
      case 482:
        return 8.0
      case 167:
        return 2.0
      case 145:
      case 150:
      case 241:
        return 1.0
      default:
        break
    }
    return 0.0
  }

  /**
   *
   * @param api
   * @param mst
   */
  public static yusouFromShip(_api: ApiShip, mst: MstShip): number {
    // kinu kaini
    if (mst.api_id === 487) {
      return 10.0
    }

    switch (mst.api_stype) {
      case ApiShipType.kutikukan:
        return 5.0
      case ApiShipType.keijyun:
        return 2.0
      case ApiShipType.koukuu_senkan:
        return 7.0
      case ApiShipType.suibo:
        return 9.0
      case ApiShipType.sensui_kuubo:
        return 1.0
      case ApiShipType.renjyun:
        return 6.0
      case ApiShipType.koujyun:
        return 4.0
      case ApiShipType.hokyuukan:
        return 15.0
      case ApiShipType.yourikukan:
        return 12.0
      case ApiShipType.sensuibokan:
        return 7.0
      default:
        break
    }
    return 0.0
  }

  /**
   *
   */
  public static landHasAADefence(type: SlotitemType): boolean {
    return SlotitemType.LandAttackAircraft === type || SlotitemType.LandFighter === type
  }

  /**
   *
   */
  public static isAtlantaType(id: number): boolean {
    return (
      id === 597 || // atlanta
      id === 696 // atlanta kai
    )
  }

  /**
   *
   */
  public static isFletcherType(id: number): boolean {
    return (
      id === 562 || // johnston
      id === 689 || // johnston kai
      id === 596 || // fletcher
      id === 692 || // fletcher kai
      id === 628 || // fletcher kai mod.2
      id === 629 || // fletcher mk.II
      id === 726 || // Heywood L.E.改
      id === 737    // Richard P.Leary改
    )
  }

  /**
   *
   */
  public static isSpecialTkShipType(id: number): boolean {
    return KcsUtil.isAtlantaType(id) || KcsUtil.isFletcherType(id)
  }

  /**
   *
   * @param mst
   * @param alv
   */
  public static aaFromALevel(mst: MstSlotitem, alv: number | undefined): number {
    if (alv === undefined) {
      return 0
    }

    alv = Math.max(0, Math.min(alv, 7))
    const inner_bonus_const = [0, 10, 25, 40, 55, 70, 85, 120][alv]
    const inner_bonus_v = Math.sqrt(inner_bonus_const/10.0)
    const type = KcsUtil.slotitemType(mst)
    if (
      SlotitemType.Fighter === type ||
      SlotitemType.SeaplaneFighter === type ||
      SlotitemType.LandFighter === type
    ) {
      const bonus = [0, 0, 2, 5, 9, 14, 14, 22] as const
      return bonus[alv] + inner_bonus_v
    }

    if (SlotitemType.SeaplaneBomber === type) {
      const bonus = [0, 0, 1, 1, 1, 3, 3, 6] as const
      return bonus[alv] + inner_bonus_v
    }
    return 0 + inner_bonus_v
  }

  /**
   * 
   */
  public static aa25DriveBomberIds: number[] = [
    60, 154, 219, 447,  
  ]
  /**
   * 
   */
  public static aa30DriveBomberIds: number[] = [
    487, 
  ]

  /**
   *
   * @param mst
   * @param level
   */
  public static aaFromLevel(mst: MstSlotitem, level: number | undefined): number {
    if (level === undefined) {
      return 0
    }
    level = Math.max(0, Math.min(level, 10))
    if (level) {
      const type = KcsUtil.slotitemType(mst)
      if (
        SlotitemType.Fighter === type) {
          if ([486].includes(mst.api_id)) {
            return 0.3 * level
        }
        return 0.2 * level
      }

      if (
        SlotitemType.SeaplaneFighter === type ||
        SlotitemType.LandFighter === type
      ) {
        return 0.2 * level
      }

      if (SlotitemType.DiveBomber === type) {
        if (KcsUtil.aa25DriveBomberIds.includes(mst.api_id)) {
          return 0.25 * level
        }
        if (KcsUtil.aa30DriveBomberIds.includes(mst.api_id)) {
          return 0.3 * level
        }
        return 0
      }

      if (SlotitemType.LandAttackAircraft === type) { // 陸上攻撃機
        return 0.50 * Math.sqrt(level)
      }

      // 航空要員
      if ([478].includes(mst.api_id)) {
        const bonus = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1]
        return bonus[level]
      }
    }
    return 0
  }

  /**
   *
   * @param mst
   * @param level
   */
  public static fireFromLevel(mst: MstSlotitem, level: number | undefined): number {
    if (level === undefined) {
      return 0
    }
    level = Math.max(0, Math.min(level, 10))
    if (level) {
      const type = KcsUtil.slotitemImgType(mst)
      switch (type) {
        case SlotitemImgType.bakurai:
          if ([44, 45, 346].includes(mst.api_id)) {
            return 0.75 * Math.sqrt(level)
          }
          break

        case SlotitemImgType.supana: // 航空要員
          if ([478].includes(mst.api_id)) {
            const bonus = [0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 3]
            return bonus[level]+Math.sqrt(level)
          }
          break;

        case SlotitemImgType.syuhou_syou:
        case SlotitemImgType.syuhou_tyuu:
        case SlotitemImgType.sansikidan:
        case SlotitemImgType.tekoudan:
        case SlotitemImgType.tansyoutou:
        case SlotitemImgType.daihatu: // 上陸用舟艇
        case SlotitemImgType.taiti:
        case SlotitemImgType.kijyu:
        case SlotitemImgType.kousyasouti:
        case SlotitemImgType.mihariin: // 見張り員
        case SlotitemImgType.naikatei: // 特型内火艇
        case SlotitemImgType.rikusen_butai: // 陸戦部隊
        case SlotitemImgType.sireibu: // 司令部施設
        case SlotitemImgType.hatuensouti: // 艦載発煙装置
          return Math.sqrt(level)
        case SlotitemImgType.koukakuhou:
          if ([10, 66, 220, 275, 358].includes(mst.api_id)) {
            return 0.2 * level
          }
          if ([467].includes(mst.api_id)) {
            return 0.3 * level
          }
          return Math.sqrt(level)
        case SlotitemImgType.fukuhou:
          if ([12, 234, 247].includes(mst.api_id)) {
            return 0.3 * level
          }
          return Math.sqrt(level)
        case SlotitemImgType.syuhou_dai:
          return 1.5 * Math.sqrt(level)
        case SlotitemImgType.sonar:
          return 0.75 * Math.sqrt(level)
      }
    }
    return 0
  }

  /**
   *
   * @param mst
   * @param level
   */
  public static torFromLevel(mst: MstSlotitem, level: number | undefined): number {
    if (level === undefined) {
      return 0
    }
    level = Math.max(0, Math.min(level, 10))
    if (level) {
      const type = KcsUtil.slotitemType(mst)
      switch (type) {
        case SlotitemType.Torpedo:
        case SlotitemType.AAGun:
          return 1.2 * Math.sqrt(level)
        case SlotitemType.LandAttackAircraft:
          return 0.7 * Math.sqrt(level)
        case SlotitemType.TorpedoBomber:
        case SlotitemType.SubmarineTorpedo:
          return 0.2 * level
      }
      // 航空要員
      if ([478].includes(mst.api_id)) {
        const bonus = [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1]
        return bonus[level]
      }
    }
    return 0
  }

  /**
   *
   * @param mst
   * @param level
   */
  public static torHitFromLevel(mst: MstSlotitem, level: number | undefined): number {
    if (level === undefined) {
      return 0
    }
    level = Math.max(0, Math.min(level, 10))
    if (level) {
      const type = KcsUtil.slotitemType(mst)
      switch (type) {
        case SlotitemType.Torpedo:
        case SlotitemType.AAGun:
          return 2.0 * Math.sqrt(level)
      }
    }
    return 0
  }

  /**
   *
   * @param mst
   * @param level
   */
  public static evFromLevel(mst: MstSlotitem, level: number | undefined): number {
    if (level === undefined) {
      return 0
    }
    level = Math.max(0, Math.min(level, 10))
    if (level) {
      const type = KcsUtil.slotitemImgType(mst)
      switch (type) {
        case SlotitemImgType.engine:
          return 1.5 * Math.sqrt(level)
        case SlotitemImgType.sensui_soubi:
          return 1.5 * Math.sqrt(level)
      }

      // 航空要員
      if ([478].includes(mst.api_id)) {
        const bonus = [0, 0, 0, 1, 1, 1, 1, 1, 1, 2, 2]
        return bonus[level]
      }
    }
    return 0
  }

  /**
   * 雷撃回避 改修上昇値
   * 
   * @param mst
   * @param level
   */
  public static evTorFromLevel(mst: MstSlotitem, level: number | undefined): number {
    if (level === undefined) {
      return 0
    }
    level = Math.max(0, Math.min(level, 10))
    if (level) {
      const type = KcsUtil.slotitemType(mst)
      switch (type) {
        case SlotitemType.Sonar:
        case SlotitemType.LargeSonar:
          return 1.5 * Math.sqrt(level)
      }
    }
    return 0
  }

  /**
   *
   * @param mst
   * @param level
   */
  public static losFromLevel(mst: MstSlotitem, level: number | undefined): number {
    if (level === undefined) {
      return 0
    }
    level = Math.max(0, Math.min(level, 10))
    if (level) {
      const r = remodelLos(mst)
      if (r) {
        return r * Math.sqrt(level)
      }
    }
    return 0
  }

  /**
   *
   * @param mst
   * @param level
   */
  public static armorFromLevel(mst: MstSlotitem, level: number | undefined): number {
    if (level === undefined) {
      return 0
    }
    level = Math.max(0, Math.min(level, 10))
    if (level) {
      const type = KcsUtil.slotitemType(mst)
      switch (type) {
        case SlotitemType.MediumExtraArmor:
          return 0.2 * level
        case SlotitemType.LargeExtraArmor:
          return 0.3 * level
      }
    }
    return 0
  }

  /**
   *
   * @param mst
   * @param level
   */
  public static aswFromLevel(mst: MstSlotitem, level: number | undefined): number {
    if (level === undefined) {
      return 0
    }
    level = Math.max(0, Math.min(level, 10))
    if (level) {
      const type = KcsUtil.slotitemType(mst)
      switch (type) {
        case SlotitemType.Sonar:
        case SlotitemType.LargeSonar:
        case SlotitemType.DepthCharge: {
           let ret = (Math.sqrt(level) * 2) / 3
           if ([227].includes(mst.api_id)) { 
            const bonus = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2]
            ret += bonus[level]
           }
           return ret;
        }
        case SlotitemType.Autogyro:
        case SlotitemType.ASBAircraft:
          if ([326, 327].includes(mst.api_id)) {
            return 0.3 * level
          }
          return 0.2 * level
        case SlotitemType.TorpedoBomber:
          return 0.2 * level
        case SlotitemType.DiveBomber:
          if (! KcsUtil.aa25DriveBomberIds.includes(mst.api_id)) {
            return 0.2 * level
          }
          return 0;
      }
    }
    return 0
  }

  /**
   *
   * @param mst
   * @param level
   */
  public static bomFromLevel(mst: MstSlotitem, level: number | undefined): number {
    if (level === undefined) {
      return 0
    }
    level = Math.max(0, Math.min(level, 10))
    if (level) {
      const type = KcsUtil.slotitemType(mst)
      switch (type) {
        case SlotitemType.SeaplaneBomber: // 水上爆撃機
          return 0.2 * level
        case SlotitemType.DiveBomber: // 艦上爆撃機
          if (! KcsUtil.aa25DriveBomberIds.includes(mst.api_id) &&
              ! KcsUtil.aa30DriveBomberIds.includes(mst.api_id)) {
            return 0.2 * level
          }
          return 0;
        case SlotitemType.LandAttackAircraft: // 陸上攻撃機
          return 0.7 * Math.sqrt(level)
      }

      // 航空要員
      if ([478].includes(mst.api_id)) {
        const bonus = [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1]
        return bonus[level]
      }
    }
    return 0
  }

  /**
   * 艦隊防空 改修上昇値
   * @param mst
   * @param level
   */
  public static kbFromLevel(mst: MstSlotitem, level: number | undefined): number {
    if (level === undefined) {
      return 0
    }
    level = Math.max(0, Math.min(level, 10))
    if (level) {
      const r = remodelKB(mst)
      if (r) {
        return r * Math.sqrt(level)
      }
    }
    return 0
  }

  /**
   * 加重対空 改修上昇値
   * @param mst
   * @param level
   */
  public static ktFromLevel(mst: MstSlotitem, level: number | undefined): number {
    if (level === undefined) {
      return 0
    }
    level = Math.max(0, Math.min(level, 10))
    if (level) {
      const r = remodelKT(mst)
      if (r) {
        return r * Math.sqrt(level)
      }
    }
    return 0
  }

  /**
   *
   * @param mst
   * @param level
   */
  public static hitFromLevel(mst: MstSlotitem, level: number | undefined): number {
    if (level === undefined) {
      return 0
    }
    level = Math.max(0, Math.min(level, 10))
    if (level) {
      const r = remodelHit(mst)
      if (r) {
        return r * Math.sqrt(level)
      }

      // 航空要員
      if ([478].includes(mst.api_id)) {
        const bonus = [0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 2]
        return bonus[level];
      }
    }
    return 0
  }

  /**
   *
   * @param mst
   * @param level
   */
  public static hitTorFromLevel(mst: MstSlotitem, level: number | undefined): number {
    if (level === undefined) {
      return 0
    }
    level = Math.max(0, Math.min(level, 10))
    if (level) {
      const r = remodelHitTor(mst)
      if (r) {
        return r * Math.sqrt(level)
      }
    }
    return 0
  }

  /**
   * 対潜命中 改修上昇値
   * 
   * @param mst
   * @param level
   */
  public static hitAswFromLevel(mst: MstSlotitem, level: number | undefined): number {
    if (level === undefined) {
      return 0
    }
    level = Math.max(0, Math.min(level, 10))
    if (level) {
      const r = remodelHitAsw(mst)
      if (r) {
        return r * Math.sqrt(level)
      }
    }
    return 0
  }

  /**
   * 艦隊防空値
   * @param mst
   * @param level
   */
  public static kbFromMst(mst: MstSlotitem): number {
    const kb = equipKB(mst)
    if(! kb) {
      return 0;
    }
    return kb * mst.api_tyku; 
  }

  /**
   * 加重対空値
   * @param mst
   * @param level
   */
  public static ktFromMst(mst: MstSlotitem): number {
    const kt = equipKT(mst)
    if(! kt) {
      return 0;
    }
    return kt * mst.api_tyku; 
  }

  /**
   *
   * @param mst
   * @param slotitem
   * @param carried
   */
  public static slotSeiku(
    mst: MstSlotitem,
    slotitem: Pick<ApiSlotitem, 'api_level' | 'api_alv'>,
    carried: number
  ): number {
    const type = KcsUtil.slotitemType(mst)
    if (!KcsUtil.hasAADefence(type)) {
      return 0
    }

    const root = Math.sqrt(carried)
    const calc =
      root * (mst.api_tyku + KcsUtil.aaFromLevel(mst, slotitem.api_level)) +
      KcsUtil.aaFromALevel(mst, slotitem.api_alv)
    //return calc;
    return Math.floor(calc)
  }

  /**
   *
   * @param ship
   */
  public static shipSeiku(ship: ShipInfo): number {
    return ship.slots.reduce((acc, slot, index) => {
      if (slot) {
        acc += KcsUtil.slotSeiku(slot.mst, slot.api, ship.api.api_onslot[index])
      }
      return acc
    }, 0)
  }

  /**
   *
   * @param ship
   */
  public static shipsSeiku(ships: ShipInfo[]): number {
    return ships.reduce((acc, ship) => acc + KcsUtil.shipSeiku(ship), 0)
  }

  /**
   *
   * @param ship
   */
  public static isKuuboType(ship: ShipInfo): boolean {
    switch (ship.mst.api_stype) {
      case ApiShipType.soukou_kuubo: // 装甲空母
      case ApiShipType.kei_kuubo: // 軽空母
      case ApiShipType.seiki_kuubo: // 正規空母
        return true
    }

    // 補給艦
    if (ApiShipType.hokyuukan === ship.mst.api_stype) {
      return ship.slots.some(
        (slot) => slot && KcsUtil.slotitemType(slot.mst) === SlotitemType.TorpedoBomber
      )
    }

    return false
  }

  /**
   *
   * @param ship
   */
  public static shipFire(ship: ShipInfo): number {
    const calc = ship.slots.reduce(
      (acc, slot) => {
        if (slot) {
          if (slot.api.api_level) {
            acc.rfire += KcsUtil.fireFromLevel(slot.mst, slot.api.api_level)
          }
          acc.baku += slot.mst.api_baku
        }
        return acc
      },
      { rfire: 0, baku: 0 }
    )

    // hp state
    const hpStateFactor = [1.0, 1.0, 0.7, 0.4][KcsUtil.shipHpState(ship.api)]
    if (KcsUtil.isKuuboType(ship)) {
      const baseFire =
        Math.floor(
          (ship.api.api_karyoku[0] + ship.api.api_raisou[0] + Math.floor(calc.baku * 1.3)) * 1.5
        ) + 55
      return Math.floor(baseFire * hpStateFactor)
    } else {
      const baseFire = ship.api.api_karyoku[0] + calc.rfire + 5
      return Math.floor(baseFire * hpStateFactor)
    }
  }

  /**
   *
   * @param ship
   */
  public static shipFireAttackable(ship: ShipInfo): boolean {
    // 潜水艦
    // 潜水空母
    if (
      ship.mst.api_stype === ApiShipType.sensuikan ||
      ship.mst.api_stype === ApiShipType.sensui_kuubo
    ) {
      return false
    }

    return true
  }

  /**
   *
   * @param ship
   */
  public static shipFireHosei(ship: ShipInfo, api_stype_enemy: number): HoseiType[] {
    switch (ship.mst.api_stype) {
      case ApiShipType.kousoku_senkan: // 戦艦
      case ApiShipType.teisoku_senkan: // 戦艦
      case ApiShipType.koukuu_senkan: // 航空戦艦
      case ApiShipType.tyoudokyuu_senkan: // 超弩級戦艦
        break
      default:
        return []
    }

    switch (api_stype_enemy) {
      case ApiShipType.jyuujyun: // 重巡洋艦
      case ApiShipType.koujyun: // 航空巡洋艦
      case ApiShipType.kousoku_senkan: // 戦艦
      case ApiShipType.teisoku_senkan: // 戦艦
      case ApiShipType.koukuu_senkan: // 航空戦艦
      case ApiShipType.seiki_kuubo: // 正規空母
      case ApiShipType.tyoudokyuu_senkan: // 超弩級戦艦
      case ApiShipType.soukou_kuubo: // 装甲空母
        break
      default:
        return []
    }

    const calc = ship.slots.reduce(
      (acc, slot) => {
        if (slot) {
          const type = this.slotitemType(slot.mst)
          if (SlotitemType.LargeMainGun === type) {
            acc.syuhou = true
          }
          if (SlotitemType.APShell === type) {
            acc.tekkoudan = true
          }
          if (SlotitemType.SecondaryGun === type) {
            acc.fukuhou = true
          }
          if (SlotitemType.SmallRadar === type || SlotitemType.LargeRadar === type) {
            acc.dentan = true
          }
        }
        return acc
      },
      { syuhou: false, tekkoudan: false, fukuhou: false, dentan: false }
    )

    if (!calc.syuhou || !calc.tekkoudan) {
      return []
    }

    if (calc.fukuhou && calc.dentan) {
      return [HoseiType.tekkoudan_fukuhou_dentan]
    }
    if (calc.fukuhou) {
      return [HoseiType.tekkoudan_fukuhou]
    }
    if (calc.dentan) {
      return [HoseiType.tekkoudan_dentan]
    }

    return [HoseiType.tekkoudan]
  }

  /**
   *
   * @param ship
   */
  public static shipTor(ship: ShipInfo): number {
    if (KcsUtil.isKuuboType(ship)) {
      return 0
    }

    // 海防艦
    if (ship.mst.api_stype === ApiShipType.kaiboukan) {
      return 0
    }

    const calc = ship.slots.reduce(
      (acc, slot) => {
        if (slot) {
          if (slot.api.api_level) {
            acc.rtor += KcsUtil.torFromLevel(slot.mst, slot.api.api_level)
          }
        }
        return acc
      },
      { rtor: 0 }
    )

    // hp state
    const hpStateFactor = [1.0, 1.0, 0.8, 0.0][KcsUtil.shipHpState(ship.api)]
    const baseTor = ship.api.api_raisou[0] + calc.rtor + 5
    return Math.floor(baseTor * hpStateFactor)
  }

  /**
   *
   * @param ship
   */
  public static shipTorAttackable(ship: ShipInfo): boolean {
    if (KcsUtil.isKuuboType(ship)) {
      return false
    }

    // 海防艦
    // 揚陸艦
    // 工作艦
    // 補給艦
    if (
      ship.mst.api_stype === ApiShipType.kaiboukan ||
      ship.mst.api_stype === ApiShipType.yourikukan ||
      ship.mst.api_stype === ApiShipType.kousakusen ||
      ship.mst.api_stype === ApiShipType.hokyuukan
    ) {
      return false
    }

    // 戦艦
    if (
      ship.mst.api_stype === ApiShipType.kousoku_senkan ||
      ship.mst.api_stype === ApiShipType.teisoku_senkan ||
      ship.mst.api_stype === ApiShipType.koukuu_senkan ||
      ship.mst.api_stype === ApiShipType.tyoudokyuu_senkan
    ) {
      // 178 Bismarck drei
      // 513 Гангут два
      // 591 金剛改二丙
      // 592 比叡改二丙
      return [178, 513, 591, 592].includes(ship.mst.api_id)
    }
    return true
  }

  /**
   *
   * @param ship
   */
  public static shipAsw(ship: ShipInfo): number {
    const bakurai = [226, 227]
    const bakurai_t = [44, 45]
    const air_types: number[] = [
      SlotitemType.SeaplaneBomber,
      SlotitemType.TorpedoBomber,
      SlotitemType.Autogyro
    ]

    const calc = ship.slots.reduce(
      (acc, slot) => {
        if (slot) {
          if (slot.api.api_level) {
            acc.rasw += KcsUtil.aswFromLevel(slot.mst, slot.api.api_level)
          }
          if (bakurai.includes(slot.mst.api_id)) {
            ++acc.bakurai
          }
          if (bakurai_t.includes(slot.mst.api_id)) {
            ++acc.bakurai_t
          }
          const type = this.slotitemType(slot.mst)
          if (type === SlotitemType.Sonar) {
            ++acc.sonar
          }
          if (air_types.includes(type)) {
            acc.air = true
          }
          acc.asw += slot.mst.api_tais
        }
        return acc
      },
      { rasw: 0, sonar: 0, bakurai: 0, bakurai_t: 0, asw: 0, air: false }
    )

    // stype add
    let stypeAdd = 0
    switch (ship.mst.api_stype) {
      case ApiShipType.kaiboukan: // 海防艦
      case ApiShipType.kutikukan: // 駆逐艦
      case ApiShipType.keijyun: // 軽巡洋艦
      case ApiShipType.raijyun: // 重雷装巡洋艦
      case ApiShipType.renjyun: // 練習巡洋艦
        stypeAdd = 13
        break

      case ApiShipType.koujyun: // 航空巡洋艦
      case ApiShipType.kei_kuubo: // 軽空母
      case ApiShipType.koukuu_senkan: // 航空戦艦
      case ApiShipType.seiki_kuubo: // 正規空母
      case ApiShipType.suibo: // 水上機母艦
      case ApiShipType.yourikukan: // 揚陸艦
        stypeAdd = 8
        break

      case ApiShipType.hokyuukan: // 補給
        stypeAdd = calc.air ? 8 : 13
        break
    }

    // synergy
    let synergy = 1.0
    if (calc.bakurai_t && calc.bakurai && calc.sonar) {
      synergy = 1.15 * 1.25
    } else if ((calc.bakurai_t || calc.bakurai) && calc.sonar) {
      synergy = 1.15
    } else if (calc.bakurai_t && calc.bakurai && !calc.sonar) {
      synergy = 1.1
    }

    const hpStateFactor = [1.0, 1.0, 0.7, 0.4][KcsUtil.shipHpState(ship.api)]
    const baseAsw =
      Math.sqrt(ship.api.api_taisen[0] - calc.asw) * 2 + calc.asw * 1.5 + calc.rasw + stypeAdd
    return Math.floor(baseAsw * synergy * hpStateFactor)
  }

  /**
   *
   * @param ship
   */
  public static shipAswAttackable(ship: ShipInfo): boolean {
    switch (ship.mst.api_stype) {
      case ApiShipType.kaiboukan: // 海防艦
      case ApiShipType.kutikukan: // 駆逐艦
      case ApiShipType.keijyun: // 軽巡洋艦
      case ApiShipType.raijyun: // 重雷装巡洋艦
      case ApiShipType.renjyun: // 練習巡洋艦
      case ApiShipType.hokyuukan: // 補給艦
        return true

      case ApiShipType.suibo: // 水上機母艦
      case ApiShipType.koujyun: // 航空巡洋艦
      case ApiShipType.koukuu_senkan: // 航空戦艦
      case ApiShipType.yourikukan: // 揚陸艦
        return ship.slots.some((slot) => {
          if (slot) {
            switch (KcsUtil.slotitemType(slot.mst)) {
              case SlotitemType.SeaplaneBomber:
              case SlotitemType.Autogyro:
              case SlotitemType.LargeFlyingBoat:
                return true
              case SlotitemType.DiveBomber:
                return !!slot.mst.api_tais
            }
          }
          return false
        })

      case ApiShipType.kei_kuubo: // 軽空母
      case ApiShipType.seiki_kuubo: // 正規空母
        if (ApiShipType.seiki_kuubo === ship.mst.api_stype) {
          // 加賀改二護
          if (ship.mst.api_id !== 646) {
            return false
          }
        }
        return ship.slots.some((slot) => {
          if (slot) {
            switch (KcsUtil.slotitemType(slot.mst)) {
              case SlotitemType.Autogyro:
              case SlotitemType.ASBAircraft:
                return true

              case SlotitemType.TorpedoBomber:
              case SlotitemType.DiveBomber:
                return !!slot.mst.api_tais
            }
          }
          return false
        })
    }

    return false
  }

  /**
   *
   * @param ship
   * @param enemy
   */
  public static shipAttackable(ship: ShipInfo, api_stype_enemy: number): Attackable {
    const enemy_is_sensuikan =
      api_stype_enemy === ApiShipType.sensuikan || api_stype_enemy === ApiShipType.sensui_kuubo
    const fire = enemy_is_sensuikan ? false : this.shipFireAttackable(ship)
    const tor = enemy_is_sensuikan ? false : this.shipTorAttackable(ship)
    const asw = enemy_is_sensuikan ? this.shipAswAttackable(ship) : false
    return { fire, tor, asw }
  }

  /**
   *
   * @param ship
   */
  public static shipArmor(ship: ShipInfo): number {
    const calc = ship.slots.reduce(
      (acc, slot) => {
        if (slot) {
          if (slot.api.api_level) {
            acc.rarmor += KcsUtil.armorFromLevel(slot.mst, slot.api.api_level)
          }
        }
        return acc
      },
      { rarmor: 0 }
    )
    return ship.api.api_soukou[0] + calc.rarmor
  }

  /**
   *
   * @param mst
   * @param slotitem
   * @param carried
   */
  public static planeSeiku(
    mst: MstSlotitem,
    slotitem: ApiSlotitem,
    carried: number,
    action: AirBaseActionKind
  ): number {
    const type = KcsUtil.slotitemType(mst)
    //if (!KcsUtil.hasAADefence(type)) {
    //  return 0;
    //}
    const root = Math.sqrt(carried)
    let tyku = mst.api_tyku
    if (type === SlotitemType.LandFighter) {
      if (AirBaseActionKind.bouku === action) {
        tyku += mst.api_houk + mst.api_houm * 2
      } else {
        tyku += mst.api_houk * 1.5
      }
    }
    console.log(mst.api_name)
    const calc =
      root * (tyku + KcsUtil.aaFromLevel(mst, slotitem.api_level)) +
      KcsUtil.aaFromALevel(mst, slotitem.api_alv)
    //return calc;
    console.log(
      `plame seiku. ${mst.api_name} calced:${Math.floor(calc)} tyku:${tyku} action:${action} alv:${KcsUtil.aaFromALevel(mst, slotitem.api_alv)}`
    )
    return Math.floor(calc)
  }

  /**
   *
   */
  public static calcHpState(nowhp: number, maxhp: number): ShipHpState {
    if (nowhp <= maxhp * 0.25) return ShipHpState.taiha
    if (nowhp <= maxhp * 0.5) return ShipHpState.tyuuha
    if (nowhp <= maxhp * 0.75) return ShipHpState.syouha
    return ShipHpState.normal
  }

  /**
   *
   */
  public static shipHpState(ship: ApiShip): ShipHpState {
    return KcsUtil.calcHpState(ship.api_nowhp, ship.api_maxhp)
  }

  /**
   *
   */
  public static shipIsDmaged(ship: ApiShip): boolean {
    return ShipHpState.tyuuha <= KcsUtil.shipHpState(ship)
  }

  /**
   *
   */
  public static seikuState(deck: number, enemy: number): ApiDispSeiku {
    if (0 === enemy) {
      return ApiDispSeiku.kakuho
    }
    if (deck >= enemy * 3) {
      return ApiDispSeiku.kakuho
    }
    if (deck >= enemy * 1.5) {
      return ApiDispSeiku.yuusei
    }
    if (deck >= (enemy * 2) / 3) {
      return ApiDispSeiku.kinkou
    }
    if (deck >= (enemy * 1) / 3) {
      return ApiDispSeiku.ressei
    }
    return ApiDispSeiku.sousitu
  }

  /**
   *
   */
  public static slotitemMapLos(slotitem: ApiSlotitem, mst: MstSlotitem): MapLosValue {
    if (mst.api_saku) {
      let r = 0
      if (slotitem.api_level) {
        r = remodelLos(mst) * Math.sqrt(slotitem.api_level)
      }
      return { map: (mst.api_saku + r) * equipLos(mst), base: mst.api_saku }
    }
    return InvalidMapLosValue()
  }

  /**
   *
   */
  public static slotitemGetItemLos(mst: MstSlotitem, slotnum: number): number {
    if (mst.api_saku && slotnum) {
      const type = KcsUtil.slotitemType(mst)
      if (
        SlotitemType.RecSeaplane === type || // 水上偵察機
        SlotitemType.SeaplaneBomber === type
      ) {
        // 水上爆撃機
        return mst.api_saku * Math.sqrt(Math.sqrt(slotnum))
      }
      if (SlotitemType.LargeFlyingBoat === type) {
        return mst.api_saku * Math.sqrt(slotnum)
      }
    }
    return 0
  }

  /**
   *
   */
  public static deckShipCount(deck: ApiDeckPort): number {
    return deck.api_ship.reduce((acc, id) => (id > 0 ? acc + 1 : acc), 0)
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
      const nisiki = ship.slots.some((slot) => slot && slot.mst.api_id === 61)
      if (nisiki) {
        const tyoutyou = ship.slots.some(
          (slot) =>
            slot &&
            SlotitemType.LargeMainGun === KcsUtil.slotitemType(slot.mst) &&
            ApiRange.tyoutyou === slot.mst.api_leng
        )
        if (tyoutyou) {
          return true
        }
      }
    }
    return false
  }

  public static shipMapLos(ship: ShipInfo): MapLosValue {
    return ship.slots.reduce((acc, slot) => {
      if (slot) {
        const v = KcsUtil.slotitemMapLos(slot.api, slot.mst)
        acc.map += v.map
        acc.base += v.base
      }
      return acc
    }, InvalidMapLosValue())
  }

  public static deckMapLos(ships: ShipInfo[], maplos: number, teitoku_lv: number): number {
    const ship_los = ships.reduce((los, ship) => {
      const calc = KcsUtil.shipMapLos(ship)

      los += calc.map * maplos
      los += Math.sqrt(ship.api.api_sakuteki[0] - calc.base)
      return los
    }, 0)

    const c3 = teitoku_lv * 0.4
    const c4 = 2 * (6 - ships.length)
    //console.log('ship_los', ship_los, 'c3', c3, 'c4', c4);
    return ship_los - c3 + c4
  }

  /**
   *
   * @param ship
   */
  public static shipGetItemLos(ship: ShipInfo): number {
    return ship.slots.reduce((acc, slot, index) => {
      if (slot) {
        acc += KcsUtil.slotitemGetItemLos(slot.mst, ship.api.api_onslot[index] ?? 0)
      }
      return acc
    }, 0)
  }

  /**
   *
   * @param ships
   */
  public static deckGetItemLos(ships: ShipInfo[]): number {
    return ships.reduce((acc, ship) => acc + KcsUtil.shipGetItemLos(ship), 0)
  }

  /**
   *
   * @param rank
   * @param info
   */
  public static isPerfect(rank: string, info: PrvBattleInfo): boolean {
    if (rank.toLocaleUpperCase() !== 'S') {
      return false
    }
    return !KcsUtil.battleDamaged(info.midday, info.midnight)
  }

  /**
   *
   * @param battle
   */
  public static isVictory(win_rank: string | undefined): boolean {
    if (win_rank) {
      return ['S', 'A', 'B'].includes(win_rank.toUpperCase())
    }
    return false
  }

  /**
   *
   */
  public static middayBattleDamaged(
    battle: ApiBattle | ApiSortieAirBattle | ApiSortieLdAirBattle | null
  ): boolean {
    if (!battle) {
      return false
    }

    if (
      KcsUtil.fDamaged(battle?.api_kouku?.api_stage3) ||
      KcsUtil.fDamaged(battle?.api_kouku?.api_stage3_combined)
    ) {
      return true
    }

    if (!KcsUtil.isBattle(battle)) {
      return false
    }

    const nb = battle as ApiBattle
    if (
      KcsUtil.hougekiDamaged(nb.api_hougeki1) ||
      KcsUtil.hougekiDamaged(nb.api_hougeki2) ||
      KcsUtil.hougekiDamaged(nb.api_hougeki3) ||
      KcsUtil.fDamaged(nb.api_opening_atack) ||
      KcsUtil.fDamaged(nb.api_raigeki) ||
      KcsUtil.hougekiDamaged(nb.api_opening_taisen)
    ) {
      return true
    }

    return false
  }

  /**
   *
   */
  public static midnightBattleDamaged(battle: ApiMidnightBattle | null): boolean {
    if (!battle) {
      return false
    }

    if (KcsUtil.hougekiDamaged(battle?.api_hougeki)) {
      return true
    }

    return false
  }

  /**
   *
   */
  public static battleDamaged(
    battle: ApiBattle | ApiSortieAirBattle | ApiSortieLdAirBattle | null,
    midnight: ApiMidnightBattle | null
  ): boolean {
    if (KcsUtil.middayBattleDamaged(battle) || KcsUtil.midnightBattleDamaged(midnight)) {
      return true
    }
    return false
  }

  /**
   *
   */
  public static includesSlotType(slots: Slot[], types: SlotitemType[]): boolean {
    return slots.some((slot) => {
      if (slot) {
        return types.includes(KcsUtil.slotitemType(slot.mst))
      }
      return false
    })
  }

  /**
   *
   */
  public static shipBouku(ship: ShipInfo): Bouku {
    const eq = ship.slots.reduce(
      (acc, slot) => {
        if (slot) {
          acc.cnt++
          const tyku = slot.mst.api_tyku
          acc.tyku += tyku
          if (tyku) {
            acc.kt += tyku * equipKT(slot.mst)
            acc.ktb += tyku * equipKB(slot.mst)
            if (slot.api.api_level) {
              const lvs = Math.sqrt(slot.api.api_level)
              const rkt = remodelKT(slot.mst)
              if (rkt) {
                acc.ktRemodel += rkt * lvs
              }
              const rktb = remodelKB(slot.mst)
              if (rktb) {
                acc.ktbRemodel += rktb * lvs
              }
            }
          }
        }
        return acc
      },
      { kt: 0, ktb: 0, tyku: 0, cnt: 0, ktRemodel: 0, ktbRemodel: 0 }
    )
    //console.log(ship.mst.api_name, ship.api.api_taiku[0], eq.kt, eq.tyku);
    const kt = ship.api.api_taiku[0] - eq.tyku + eq.kt + eq.ktRemodel
    const a = eq.cnt ? 2 : 1
    return {
      kt: a * Math.floor(kt / a),
      ktRaw: ship.api.api_taiku[0] - eq.tyku + eq.kt,
      ktRemodel: eq.ktRemodel,
      ktb: Math.floor(eq.ktb + eq.ktbRemodel),
      ktbRaw: eq.ktb,
      ktbRemodel: eq.ktbRemodel
    }
  }

  /**
   *
   */
  public static shipKaihi(ship: ShipInfo): Kaihi {
    const eq = ship.slots.reduce(
      (acc, slot) => {
        if (slot) {
          acc.eq += slot.mst.api_houk
          acc.r += KcsUtil.evFromLevel(slot.mst, slot.api.api_level)
        }
        return acc
      },
      { eq: 0, r: 0 }
    )

    let kaihi = Math.floor(ship.api.api_kaihi[0] + eq.eq + Math.sqrt(ship.api.api_lucky[0] * 2))
    if (40 <= kaihi && kaihi < 65) {
      kaihi = 40.0 + 3 * Math.sqrt(kaihi - 40)
    } else if (kaihi >= 65) {
      kaihi = 55.0 + 2 * Math.sqrt(kaihi - 65)
    }

    const fualp = ship.api.api_fuel / ship.mst.api_fuel_max
    const fual_mod = fualp <= 0.75 ? 75 - fualp * 100 : 0
    return {
      kaihi: kaihi + eq.r - fual_mod,
      kaihiRemodel: eq.r
    }
  }

  /**
   *
   */
  public static shipHit(ship: ShipInfo): Hit {
    const eq = ship.slots.reduce(
      (acc, slot) => {
        if (slot) {
          acc.eq += slot.mst.api_houm
          acc.r += KcsUtil.hitFromLevel(slot.mst, slot.api.api_level)
        }
        return acc
      },
      { eq: 0, r: 0 }
    )

    const hit =
      90 + 2 * Math.sqrt(ship.api.api_lv) + 1.5 * Math.sqrt(ship.api.api_lucky[0]) + eq.eq + eq.r
    const cond_mod = [1.0, 0.5, 0.8, 1.0, 1.2][KcsUtil.shipCond(ship.api)]

    return {
      hit: hit * cond_mod,
      hitRemodel: eq.r
    }
  }

  /**
   *
   * @param ship
   */
  public static shipTorHit(ship: ShipInfo): Hit {
    const eq = ship.slots.reduce(
      (acc, slot) => {
        if (slot) {
          acc.eq += slot.mst.api_houm
          acc.r += KcsUtil.hitTorFromLevel(slot.mst, slot.api.api_level)
        }
        return acc
      },
      { eq: 0, r: 0 }
    )

    const hit =
      85 +
      2 * Math.sqrt(ship.api.api_lv) +
      1.5 * Math.sqrt(ship.api.api_lucky[0]) +
      eq.eq +
      eq.r +
      Math.sqrt(0.2 * ship.api.api_raisou[0])
    const cond_mod = [1.0, 0.35, 0.7, 1.0, 1.35][KcsUtil.shipCond(ship.api)]

    return {
      hit: hit * cond_mod,
      hitRemodel: eq.r
    }
  }

  /**
   *
   */
  public static shipAswHit(ship: ShipInfo): Hit {
    const eq = ship.slots.reduce(
      (acc, slot) => {
        if (slot) {
          acc.eq += slot.mst.api_houm
          if (this.slotitemType(slot.mst) === SlotitemType.Sonar) {
            acc.asw += slot.mst.api_tais
          }
          acc.r += KcsUtil.hitAswFromLevel(slot.mst, slot.api.api_level)
        }
        return acc
      },
      { eq: 0, r: 0, asw: 0 }
    )

    const hit =
      80 +
      Math.sqrt(2 * ship.api.api_lv) +
      Math.sqrt(1.5 * ship.api.api_lucky[0]) +
      eq.eq +
      eq.asw +
      eq.r
    const cond_mod = [1.0, 0.5, 0.8, 1.0, 1.2][KcsUtil.shipCond(ship.api)]
    return {
      hit: hit * cond_mod,
      hitRemodel: eq.r
    }
  }

  /**
   * 
   * @param ship 
   */
  public static getShipSpCount(ship: ShipInfoSp): number {
    const sp = ship.sp

    let ret = 0;
    if (sp.tk) ret++
    if (sp.th?.length) ret += sp.th.length
    if (sp.st) ret++ 
    if (sp.sr) ret++
    if (sp.fa?.length) {
      ret += sp.fa.length
      if (sp.fa.length >= 2) {
        ret++ // 合計
      }
    }
    if (sp.aa?.length) {
      ret += sp.aa.length
      if (sp.aa.length >= 2) {
        ret++ // 合計
      }
    }
    if (sp.y.length) {
      ret += sp.y.length
      if (sp.y.length >= 2) { 
        ret++ // 合計
      }
    }
    if (sp.ys?.length) {
      ret += sp.ys.length
      if (sp.ys.length >= 2) {
        ret++ // 合計
      }
    }
    if (sp.fd) ret++
    if (sp.yt) ret++
    return ret;
  }

  /**
   *
   */
  public static shipKoteiGekitui(info: ShipInfoSp, ships: ShipInfoSp[]): number {
    const deck_ktb = KcsUtil.deckKantaiBouku(ships)
    return Math.floor((info.bouku.kt + (deck_ktb * 2.0) / 1.3) / 10.0)
  }

  /**
   *
   */
  public static deckKantaiBouku(ships: ShipInfoSp[]): number {
    if (!ships.length) {
      return 0
    }
    let deck_ktb = ships[0].deck_ktb
    if (!deck_ktb) {
      deck_ktb = ships.reduce((acc, ship) => acc + ship.bouku.ktb, 0)
      ships[0].deck_ktb = deck_ktb
    }
    return deck_ktb
  }

  /**
   *
   */
  public static spTKCutin(info: ShipInfo): TKCutinState | undefined {
    const tk = tkCutin(info)
    if (!tk.type.length) {
      return
    }
    return tk
  }

  /**
   *
   */
  public static spSenseiRaigeki(info: ShipInfo): SenseiRaigekiState | undefined {
    switch (info.mst.api_stype) {
      case ApiShipType.suibo:
      case ApiShipType.raijyun:
      case ApiShipType.keijyun:
        break
      case ApiShipType.sensuikan:
      case ApiShipType.sensui_kuubo:
        if (info.api.api_lv >= 10) {
          return { type: SenseiRaigekiType.auto, enable: true }
        }
        break
      default:
        return
    }

    if (info.slots.some((slot) => isSlotitemId(slot, [41, 309, 364]))) {
      return { type: SenseiRaigekiType.byequip, enable: true }
    }

    return
  }

  /**
   *
   */
  public static spSenseiTaisen(info: ShipInfo): SenseiTaisenState | undefined {
    const ship = info.api
    const mst = info.mst

    // auto
    if (
      mst.api_id === 141 || // isuzukaini
      mst.api_id === 478 || // tatutakaini
      mst.api_id === 394 || // jerviskai
      mst.api_id === 893 || // januskai
      mst.api_id === 906 || // javelin kai
      mst.api_id === 681 || // samu kai
      mst.api_id === 920 || // samu kaini
      mst.api_id === 624 || // yuubari kaini tyou
      mst.api_id === 1040 || // fubukikaisan go
      KcsUtil.isFletcherType(mst.api_id) // fletcher
    ) {
      return { type: SenseiTaisenType.auto, enable: true }
    }

    // equip
    switch (mst.api_stype) {
      case ApiShipType.kutikukan:
      case ApiShipType.keijyun:
      case ApiShipType.renjyun:
      case ApiShipType.raijyun:
      case ApiShipType.hokyuukan:
        if (
          ship.api_taisen[0] >= 100 &&
          KcsUtil.includesSlotType(info.slots, [SlotitemType.Sonar, SlotitemType.LargeSonar])
        ) {
          return { type: SenseiTaisenType.byequip, enable: true }
        }
        return

      case ApiShipType.kaiboukan:
        if (
          ship.api_taisen[0] >= 60 &&
          KcsUtil.includesSlotType(info.slots, [SlotitemType.Sonar])
        ) {
          return { type: SenseiTaisenType.byequip, enable: true }
        }
        if (
          ship.api_taisen[0] >= 75 &&
          info.slots.reduce((acc, slot) => {
            if (slot) {
              acc += slot.mst.api_tais
            }
            return acc
          }, 0) >= 4
        ) {
          return { type: SenseiTaisenType.byequip, enable: true }
        }
        return
    }

    // keikuubo
    const keibo_check = (
      info: ShipInfo,
      limit: number,
      with_soner: boolean,
      equip_limit: number,
      slot_types: SlotitemType[]
    ): SenseiTaisenState | undefined => {
      if (info.api.api_taisen[0] >= limit) {
        const onslot = info.api.api_onslot
        const ret = info.slots.reduce(
          (acc, slot, index) => {
            if (slot) {
              const type = KcsUtil.slotitemType(slot.mst)
              if ([SlotitemType.Sonar as number, SlotitemType.LargeSonar].includes(type)) {
                acc.s++
              }
              if ([SlotitemType.Autogyro as number, SlotitemType.ASBAircraft].includes(type)) {
                acc.a++
                if (onslot[index] ?? 0) {
                  acc.ae++
                }
              }
              if (slot.mst.api_tais > equip_limit && slot_types.includes(type)) {
                acc.a++
                if (onslot[index] ?? 0) {
                  acc.ae++
                }
              }
            }
            return acc
          },
          { s: 0, a: 0, ae: 0 }
        )
        if ((!with_soner || ret.s > 0) && ret.a > 0) {
          return { type: SenseiTaisenType.byequip, enable: ret.ae > 0 }
        }
      }

      return
    }

    // taiyoukai/taiyoukaini
    // sinyoukai/sinyoukaini
    // kagakaini go
    if (
      mst.api_id === 380 || // taiyoukai
      mst.api_id === 529 || // taiyoukaini
      mst.api_id === 381 || // sinyoukai
      mst.api_id === 536 || // sinyoukaini
      mst.api_id === 646
    ) {
      // kagakaini go
      const ret = keibo_check(info, 0, false, 0, [
        SlotitemType.DiveBomber,
        SlotitemType.TorpedoBomber
      ])
      if (ret) {
        return ret
      }
    }

    if (mst.api_stype === ApiShipType.kei_kuubo) {
      let ret = keibo_check(info, 100, true, 0, [
        SlotitemType.DiveBomber,
        SlotitemType.TorpedoBomber
      ])
      if (ret) {
        return ret
      }
      ret = keibo_check(info, 65, false, 6, [SlotitemType.TorpedoBomber])
      if (ret) {
        return ret
      }
      ret = keibo_check(info, 50, true, 6, [SlotitemType.TorpedoBomber])
      if (ret) {
        return ret
      }
      return
    }

    // hyuugakaini
    if (mst.api_id === 554) {
      const onslot = info.api.api_onslot
      const ret = info.slots.reduce(
        (acc, slot, index) => {
          if (slot) {
            if (
              slot.mst.api_id === 69 || // kago
              slot.mst.api_id === 324 || // ogokai
              slot.mst.api_id === 325 // ogokaini
            ) {
              acc.t1++
              if (onslot[index] ?? 0) {
                acc.te1++
              }
            }
            if (
              slot.mst.api_id === 326 || // s-51j
              slot.mst.api_id === 327 // s-51jkai
            ) {
              acc.t2++
              if (onslot[index] ?? 0) {
                acc.te2++
              }
            }
          }
          return acc
        },
        { t1: 0, t2: 0, te1: 0, te2: 0 }
      )
      if (ret.t1 >= 2 || ret.t2 >= 1) {
        let enable = false
        if (ret.t1 > 0 && ret.te1 > 0) {
          enable = true
        }
        if (ret.t2 > 0 && ret.te2 > 0) {
          enable = true
        }
        return { type: SenseiTaisenType.byequip, enable }
      }
    }

    return
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
        break
      default:
        return
    }
    // 12cm30連装噴進砲改二
    if (!info.slots.some((slot) => slot && slot.mst.api_id === 274)) {
      return
    }
    return {
      enable: true
    }
  }

  /**
   *
   */
  public static spYatei(info: ShipInfo): YateiState | undefined {
    // 夜偵
    if (!info.slots.some((slot) => {
        if (slot) {
          const imgtype = KcsUtil.slotitemImgType(slot.mst)
          return imgtype === SlotitemImgType.yatei
        }
        return false
    })) {
      return 
    }
    return {
      enable: true
    }
  }

  /**
   *
   */
  public static spYCutin(info: ShipInfo): { type: YCutin; enable: boolean }[] {
    switch (info.mst.api_stype) {
      case ApiShipType.kei_kuubo:
      case ApiShipType.seiki_kuubo:
      case ApiShipType.soukou_kuubo:
        return []
      default:
        break
    }

    const iskutiku = ApiShipType.kutikukan === info.mst.api_stype
    const isCanYakanZuiunCI = ([
      ApiShipType.keijyun, 
      ApiShipType.koujyun, 
      ApiShipType.koukuu_senkan,
      ApiShipType.suibo] as number[]).includes(info.mst.api_stype)
    const cnt = info.slots.reduce(
      (acc, slot) => {
        if (slot) {
          const type = KcsUtil.slotitemType(slot.mst)
          if (KcsUtil.hasMainGun(type)) {
            acc.s++
          }
          if (SlotitemType.SecondaryGun === type) {
            acc.f++
          }
          if (SlotitemType.Torpedo === type) {
            acc.g++
          }

          if (KcsUtil.hasRadar(type) && slot.mst.api_saku >= 5) {
            acc.d5++
          }

          if (iskutiku) {
            if (SlotitemType.ShipPersonnel === type) {
              acc.m++
            }
            // D型改二
            if (slot.mst.api_id === 267) {
              acc.s2++
            }
            // D型改三
            if (slot.mst.api_id === 366) {
              acc.s3++
            }
            // 水雷戦隊 熟練水雷見張員
            if (slot.mst.api_id === 412) {
              acc.mj++
            }
            // ドラム缶(輸送用)
            if (slot.mst.api_id === 75) {
              acc.dram++
            }
          }

          if (slot.mst.api_id === 490) {
            if (isCanYakanZuiunCI) {
              acc.yz++
            }
          }
          if (SlotitemType.SubmarineTorpedo === type) {
            acc.sg++
          }
          if (SlotitemType.SubmarineEquipment === type) {
            acc.sd++
          }
        }
        return acc
      },
      { s: 0, f: 0, g: 0, d5: 0, m: 0, s2: 0, s3: 0, sg: 0, sd: 0, mj: 0, dram: 0, yz: 0}
    )

    let ret: YCutin[] = []
    if (cnt.s >= 3) {
      ret.push(YCutin.COMMON_SYU3)
    }
    if (cnt.s >= 2 && cnt.f > 0) {
      ret.push(YCutin.COMMON_SYU_FUKU)
    }
    if (cnt.g >= 2) {
      ret.push(YCutin.COMMON_GYO2)
    }
    if (cnt.s > 0 && cnt.g > 0) {
      ret.push(YCutin.COMMON_SYU_GYO)
    }

    if (iskutiku) {
      if (cnt.g > 0 && cnt.m > 0 && cnt.d5 > 0) {
        ret.push(YCutin.KUTIKU_GYO_MI_DEN)
      }
      if (cnt.s > 0 && cnt.g > 0 && cnt.d5 > 0) {
        ret.push(YCutin.KUTIKU_SYU_GYO_DEN)
      }
      if (cnt.mj > 0) {
        if (cnt.g > 1) {
          ret.push(YCutin.KUTIKU_MI_GYO2)
        }
        if (cnt.g > 0 && cnt.dram > 0) {
          ret.push(YCutin.KUTIKU_MI_GYO_D)
        }
      }
    }

    if (cnt.yz > 0 && cnt.s > 1) {
      if (cnt.yz > 0) {
        ret.push(YCutin.YAKAN_ZUIUN1)
        if (cnt.d5 > 0) {
          ret.push(YCutin.YAKAN_ZUIUN1_DEN)
        }
      }
      if (cnt.yz > 1) {
        ret.push(YCutin.YAKAN_ZUIUN2)
        if (cnt.d5 > 0) {
          ret.push(YCutin.YAKAN_ZUIUN2_DEN)
        }
      }
    }

    if (cnt.sg > 0 && cnt.sd > 0) {
      ret.push(YCutin.SENSUI_SGYO_SDEN)
    }
    if (cnt.sg >= 2) {
      ret.push(YCutin.SENSUI_SGYO2)
    }

    if ((cnt.s + cnt.f) === 2) {
      ret.push(YCutin.COMMON_RENGEKI)
    }

    if (ret.length > 0) {

      // 倍率降順ソート
      ret.sort((a, b) => YCutinConst[b].aRatio - YCutinConst[a].aRatio)

      // 駆逐艦、夜間瑞雲CI以外は多重判定無し、倍率が最も高いものを返却
      if (!iskutiku && ! isCanYakanZuiunCI) {
        ret = [ret[0]]
      } else if (isCanYakanZuiunCI) {

        // 夜間瑞雲CIは多重判定有り、条件を満たすものを全て返却
        const common_cutins = ret.filter((ci) => isCommonYCutin(ci)).slice(0, 1)
        const yakan_zuiuns = ret.filter((ci) => 
          ([YCutin.YAKAN_ZUIUN1, 
            YCutin.YAKAN_ZUIUN1_DEN, 
            YCutin.YAKAN_ZUIUN2, 
            YCutin.YAKAN_ZUIUN2_DEN] as number[]).includes(ci))
        ret = common_cutins.concat(yakan_zuiuns)
        
      } else {

        // 駆逐艦は多重判定有り、条件を満たすものを全て返却

        // 汎用
        const common_cutins = ret.filter((ci) => isCommonYCutin(ci)).slice(0, 1)
        // 条件を満たす主魚電カットイン
        let syu_gyo_dens: YCutin[] = []
        // 条件を満たす魚見(水)電カットイン
        let gyo_mi_dens: YCutin[] = []
        // 条件を満たす水雷戦隊 熟練水雷見張員カットイン
        let mi_gyos: YCutin[] = ret.filter((ci) => 
          ([YCutin.KUTIKU_MI_GYO2, YCutin.KUTIKU_MI_GYO_D] as number[]).includes(ci)
        )

        // 主魚電カットイン チェック
        if (ret.includes(YCutin.KUTIKU_SYU_GYO_DEN)) {

          if (cnt.s3 > 1) {
            syu_gyo_dens.push(YCutin.KUTIKU_SYU_GYO_DEN3_3)
          } else if (cnt.s2 > 0 && cnt.s3 > 0) {
            syu_gyo_dens.push(YCutin.KUTIKU_SYU_GYO_DEN2_3)
          } else if (cnt.s2 > 1) {
            syu_gyo_dens.push(YCutin.KUTIKU_SYU_GYO_DEN2_2)
          } else if (cnt.s3 > 0) {
            syu_gyo_dens.push(YCutin.KUTIKU_SYU_GYO_DEN3)
          } else if (cnt.s2 > 0) {
            syu_gyo_dens.push(YCutin.KUTIKU_SYU_GYO_DEN2)
          }

          if (! syu_gyo_dens.length ) {
            syu_gyo_dens.push(YCutin.KUTIKU_SYU_GYO_DEN)
          }
        }

        // 魚見(水)電カットイン チェック
        if (ret.includes(YCutin.KUTIKU_GYO_MI_DEN)) {

          if (cnt.s3 > 1) {
            gyo_mi_dens.push(YCutin.KUTIKU_GYO_MI_DEN3_3 )
          } else if (cnt.s2 > 0 && cnt.s3 > 0) {
            gyo_mi_dens.push(YCutin.KUTIKU_GYO_MI_DEN2_3)
          } else if (cnt.s2 > 1) {
            gyo_mi_dens.push(YCutin.KUTIKU_GYO_MI_DEN2_2)
          } else if (cnt.s3 > 0) {
            gyo_mi_dens.push(YCutin.KUTIKU_GYO_MI_DEN3)
          } else if (cnt.s2 > 0) {
            gyo_mi_dens.push(YCutin.KUTIKU_GYO_MI_DEN2)
          }

          if (! gyo_mi_dens.length ) {
            gyo_mi_dens.push(YCutin.KUTIKU_GYO_MI_DEN)
          }
        }

        ret = common_cutins.concat(syu_gyo_dens).concat(gyo_mi_dens).concat(mi_gyos)

      }

      // 倍率降順ソート カットイン種別も考慮
      ret.sort((a, b) => {
        const aisCommon = isCommonYCutin(a)
        const bisCommon = isCommonYCutin(b)
        if (aisCommon && bisCommon) {
          return YCutinConst[b].aRatio - YCutinConst[a].aRatio;
        } else if (aisCommon) {
          return 1
        } else if (bisCommon) {
          return -1
        } else {
          return YCutinConst[b].aRatio - YCutinConst[a].aRatio
        }
      })

      return ret.map((ci) => {
        return { type: ci, enable: true }
      })
    }
    return []
  }

  /**
   *
   */
  public static spYSCutin(info: ShipInfo): { type: YSCutin; enable: boolean }[] {
    switch (info.mst.api_stype) {
      case ApiShipType.kei_kuubo:
      case ApiShipType.seiki_kuubo:
      case ApiShipType.soukou_kuubo:
        break
      default:
        return []
    }

    // 夜戦空母
    const yasen_kuubo = isShipId(info.mst.api_id, [
      545, // Saratoga Mk.II
      599, // 赤城改二戊
      610, // 加賀改二戊
      883, // 龍鳳改二戊
    ])
    const onslot = info.api.api_onslot
    // yakan kokuki
    const hids = [242, 243, 244, 154]
    // suisei
    const suids = [320]
    // yasen youin
    const yids = [258, 259]
    type Counter = {
      cnt: number, 
      onslot: number
    }
    const initCount = (): Counter => ({cnt: 0, onslot: 0})
    type ReduceCount = {
      s: Counter // 夜戦
      k: Counter // 夜攻
      b: Counter // 夜爆
      sui: Counter // 光電管彗星
      h: Counter // 夜間飛行機
      yEquip: number // 夜間作戦航空要員 or ＋熟練甲板員
    }
    const cnt = info.slots.reduce<ReduceCount>(
      (acc, slot, index) => {
        if (slot) {
          const imgtype = KcsUtil.slotitemImgType(slot.mst)
          if (imgtype === SlotitemImgType.yakan_sentouki) {
            acc.s.cnt++
            if (onslot[index] ?? 0) {
              acc.s.onslot++
            }
          }
          if (imgtype === SlotitemImgType.yakan_kougekiki) {
            acc.k.cnt++
            if (onslot[index] ?? 0) {
              acc.k.onslot++
            }
          }
          if (imgtype === SlotitemImgType.yakan_bakugekiki) {
            acc.b.cnt++
            if (onslot[index] ?? 0) {
              acc.b.onslot++
            }
          }
          if (suids.includes(slot.mst.api_id)) {
            acc.sui.cnt++
            if (onslot[index] ?? 0) {
              acc.sui.onslot++
            }
          }
          if (
            imgtype === SlotitemImgType.yakan_sentouki ||
            imgtype === SlotitemImgType.yakan_kougekiki ||
            imgtype === SlotitemImgType.yakan_bakugekiki ||
            hids.includes(slot.mst.api_id)
          ) {
            acc.h.cnt++
            if (onslot[index] ?? 0) {
              acc.h.onslot++
            }
          }
          if (!yasen_kuubo) {
            if (yids.includes(slot.mst.api_id)) {
              acc.yEquip++
            }
          }
        }
        return acc
      }, { 
        s: initCount(),
        k: initCount(),
        b: initCount(),
        sui: initCount(),
        h: initCount(),
        yEquip: yasen_kuubo ? 1 : 0
      }
    )

    const ret: { type: YSCutin; enable: boolean }[] = []
    if (cnt.yEquip > 0) {

      if (cnt.s.cnt >= 2 && cnt.k.cnt > 0) {
        ret.push({ type: YSCutin.SEN2_KOU1, enable: cnt.s.onslot >= 2 && cnt.k.onslot > 0 })
      }
      if (cnt.s.cnt > 0 && cnt.k.cnt > 0) {
        ret.push({ type: YSCutin.SEN1_KOU1, enable: cnt.s.onslot > 0 && cnt.k.onslot > 0 })
      }
      if (cnt.s.cnt > 0 && cnt.sui.cnt > 0) {
        ret.push({ type: YSCutin.SEN1_KOUSUISEI1, enable: cnt.s.onslot > 0 && cnt.sui.onslot > 0 })
      }
      if (cnt.s.cnt === 0 && cnt.k.cnt > 0 && cnt.sui.cnt > 0) {
        ret.push({ type: YSCutin.KOU1_KOUSUISEI1, enable: cnt.k.onslot > 0 && cnt.sui.onslot > 0 })
      }
      if (cnt.s.cnt > 0 && cnt.b.cnt > 0) {
        ret.push({ type: YSCutin.SEN1_BAKU1, enable: cnt.s.onslot > 0 && cnt.b.onslot > 0 })
      }
      if (cnt.k.cnt > 0 && cnt.b.cnt > 0) {
        ret.push({ type: YSCutin.KOU1_BAKU1, enable: cnt.k.onslot > 0 && cnt.b.onslot > 0 })
      }
      if (cnt.b.cnt > 0 && cnt.sui.cnt > 0) {
        ret.push({ type: YSCutin.BAKU1_KOUSUISEI1, enable: cnt.b.onslot > 0 && cnt.sui.onslot > 0 })
      }
      if (cnt.s.cnt > 0 && cnt.h.cnt >= 2) {
        ret.push({ type: YSCutin.SEN1_YAKANKOKU2, enable: cnt.s.onslot > 0 && cnt.h.onslot >= 2 })
      }

      if (!ret.length) {
        if (cnt.s.cnt > 0 || cnt.k.cnt > 0) {
          ret.push({ type: YSCutin.YAKOU, enable: cnt.s.onslot > 0 && cnt.k.onslot > 0 })
        }
      }

      // orderでソート
      ret.sort((a, b) => YSCutinConst[b.type].order - YSCutinConst[a.type].order)
    }
    return ret
  }

  /**
   *
   */
  public static spFACutin(info: ShipInfo): { type: FACutin; enable: boolean }[] {
    switch (info.mst.api_stype) {
      case ApiShipType.jyuujyun: // 重巡洋艦
      case ApiShipType.koujyun: // 航空巡洋艦
      case ApiShipType.keijyun: // 軽巡洋艦
      case ApiShipType.kousoku_senkan: // 戦艦
      case ApiShipType.teisoku_senkan: // 戦艦
      case ApiShipType.koukuu_senkan: // 航空戦艦
      case ApiShipType.tyoudokyuu_senkan: // 超弩級戦艦
      case ApiShipType.suibo: // 水上機母艦
      case ApiShipType.hokyuukan: // 補給艦
      case ApiShipType.renjyun: // 練習巡洋艦
      case ApiShipType.sensuibokan: // 潜水母艦
        break
      default:
        return []
    }

    const onslot = info.api.api_onslot
    const isegatakaini = info.mst.api_id === 553 || info.mst.api_id === 554
    const cnt = info.slots.reduce(
      (acc, slot, index) => {
        if (slot) {
          const type = KcsUtil.slotitemType(slot.mst)
          if (KcsUtil.hasMainGun(type)) {
            acc.s++
          }
          if (SlotitemType.SecondaryGun === type) {
            acc.f++
          }
          if (SlotitemType.APShell === type) {
            acc.t++
          }
          if (KcsUtil.hasRadar(type)) {
            acc.d++
          }
          if (KcsUtil.hasFASeaplane(type)) {
            acc.tei++
            if (onslot[index] ?? 0) {
              acc.teie++
            }
          }
          if (isegatakaini) {
            if (type === SlotitemType.DiveBomber && KcsUtil.hasSuisei634(slot.mst.api_id)) {
              acc.sui++
              if (onslot[index] ?? 0) {
                acc.suie++
              }
            }
            if (type === SlotitemType.SeaplaneBomber && KcsUtil.hasZuiun(slot.mst.api_id)) {
              acc.zui++
              if (onslot[index] ?? 0) {
                acc.zuie++
              }
            }
          }
        }
        return acc
      },
      { s: 0, f: 0, t: 0, d: 0, tei: 0, teie: 0, sui: 0, suie: 0, zui: 0, zuie: 0 }
    )

    const ret: { type: FACutin; enable: boolean }[] = []
    if (cnt.tei > 0) {
      const enable = cnt.teie > 0
      if (cnt.s >= 2 && cnt.t > 0) {
        ret.push({ type: FACutin.SYU_SYU, enable: enable })
      }
      if (cnt.s > 0 && cnt.f > 0 && cnt.t > 0) {
        ret.push({ type: FACutin.SYU_TEK, enable: enable })
      }
      if (cnt.s > 0 && cnt.f > 0 && cnt.d > 0) {
        ret.push({ type: FACutin.SYU_DEN, enable: enable })
      }
      if (cnt.s > 0 && cnt.f > 0) {
        ret.push({ type: FACutin.SYU_FUK, enable: enable })
      }
      if (cnt.s >= 2) {
        ret.push({ type: FACutin.RENGEKI, enable: enable })
      }
    }
    if (isegatakaini) {
      if (cnt.s > 0 && cnt.sui >= 2) {
        ret.push({ type: FACutin.KAI_KUU, enable: cnt.suie >= 2 })
      }
      if (cnt.s > 0 && cnt.zui >= 2) {
        ret.push({ type: FACutin.ZUI_UN, enable: cnt.zuie >= 2 })
      }
    }
    return ret
  }

  /**
   *
   */
  public static spAACutin(info: ShipInfo): { type: AACutin; enable: boolean }[] {
    switch (info.mst.api_stype) {
      case ApiShipType.kei_kuubo:
      case ApiShipType.seiki_kuubo:
      case ApiShipType.soukou_kuubo:
        break
      default:
        return []
    }

    const onslot = info.api.api_onslot
    const cnt = info.slots.reduce(
      (acc, slot, index) => {
        if (slot) {
          const type = KcsUtil.slotitemType(slot.mst)
          if (type === SlotitemType.Fighter) {
            acc.f++
            if (onslot[index] ?? 0) {
              acc.fe++
            }
          }
          if (type === SlotitemType.DiveBomber) {
            acc.b++
            if (onslot[index] ?? 0) {
              acc.be++
            }
          }
          if (type === SlotitemType.TorpedoBomber) {
            acc.a++
            if (onslot[index] ?? 0) {
              acc.ae++
            }
          }
        }
        return acc
      },
      { f: 0, b: 0, a: 0, fe: 0, be: 0, ae: 0 }
    )

    const ret: { type: AACutin; enable: boolean }[] = []
    if (cnt.f > 0 && cnt.b > 0 && cnt.a > 0) {
      ret.push({ type: AACutin.FBA, enable: cnt.fe > 0 && cnt.be > 0 && cnt.ae > 0 })
    }
    if (cnt.b >= 2 && cnt.a > 0) {
      ret.push({ type: AACutin.BBA, enable: cnt.be >= 2 && cnt.ae > 0 })
    }
    if (cnt.b > 0 && cnt.a > 0) {
      ret.push({ type: AACutin.BA, enable: cnt.b > 0 && cnt.ae > 0 })
    }
    return ret
  }

  /**
   *
   */
  public static spTHCutin(
    info: ShipInfo,
    ships: ShipInfo[]
  ): { type: THCutin; enable: boolean }[] | undefined {
    const top = ships[0]

    if (top.api.api_id !== info.api.api_id) {
      return
    }

    // nelson touch
    if (isShipCategory(top.mst.api_ctype, [ApiShipCategory.nelson])) {
      if (
        ships.length >= 6 &&
        !ships.some((ship) =>
          isShipType(ship.mst, [ApiShipType.sensuikan, ApiShipType.sensui_kuubo])
        ) &&
        !isShipType(ships[2].mst, [
          ApiShipType.kei_kuubo,
          ApiShipType.seiki_kuubo,
          ApiShipType.soukou_kuubo
        ]) &&
        !isShipType(ships[4].mst, [
          ApiShipType.kei_kuubo,
          ApiShipType.seiki_kuubo,
          ApiShipType.soukou_kuubo
        ])
      ) {
        return [{ type: THCutin.Nelson, enable: true }]
      }
    }

    // colorado
    if (isShipCategory(top.mst.api_ctype, [ApiShipCategory.colorado])) {
      if (
        ships.length >= 6 &&
        !ships.some((ship) =>
          isShipType(ship.mst, [ApiShipType.sensuikan, ApiShipType.sensui_kuubo])
        ) &&
        isShipType(ships[1].mst, [
          ApiShipType.kousoku_senkan,
          ApiShipType.teisoku_senkan,
          ApiShipType.koukuu_senkan
        ]) &&
        isShipType(ships[2].mst, [
          ApiShipType.kousoku_senkan,
          ApiShipType.teisoku_senkan,
          ApiShipType.koukuu_senkan
        ])
      ) {
        return [{ type: THCutin.Colorado, enable: true }]
      }
    }

    // nagato, mutu
    if (isShipId(top.mst.api_id, [541, 573])) {
      if (
        ships.length >= 6 &&
        !ships.some((ship) =>
          isShipType(ship.mst, [ApiShipType.sensuikan, ApiShipType.sensui_kuubo])
        ) &&
        isShipType(ships[1].mst, [
          ApiShipType.kousoku_senkan,
          ApiShipType.teisoku_senkan,
          ApiShipType.koukuu_senkan
        ])
      ) {
        return [{ type: top.mst.api_id === 541 ? THCutin.Nagato : THCutin.Mutu, enable: true }]
      }
    }

    // kongou
    if (isShipId(top.mst.api_id, [591])) {
      if (
        ships.length >= 5 &&
        isShipId(ships[1].mst.api_id, [
          592, // 比叡改二丙
          151, 593, 954, // 榛名改二/乙/丙
          694, // 霧島改二丙
          439, 364, // Warspite
          927, 733, // Valiant
        ]) &&
        !ships.some((ship) => isShipType(ship.mst, [ApiShipType.sensuikan, ApiShipType.sensui_kuubo]))
      ) {
        return [{ type: THCutin.Kongou, enable: true }]
      }
    }

    // hiei
    if (isShipId(top.mst.api_id, [592])) {
      if (
        ships.length >= 5 &&
        isShipId(ships[1].mst.api_id, [
          591, // 金剛改二丙
          593, 954, // 榛名改二乙/丙
          152, 694, // 霧島改二/丙
        ]) &&
        !ships.some((ship) => isShipType(ship.mst, [ApiShipType.sensuikan, ApiShipType.sensui_kuubo]))
      ) {
        return [{ type: THCutin.Hiei, enable: true }]
      }
    }

    // haruna
    if (isShipId(top.mst.api_id, [593, 954])) {
      if (
        ships.length >= 5 &&
        isShipId(ships[1].mst.api_id, [
          591, // 金剛改二丙
          592, // 比叡改二丙
          694, // 霧島改二丙
        ]) &&
        !ships.some((ship) => isShipType(ship.mst, [ApiShipType.sensuikan, ApiShipType.sensui_kuubo]))
      ) {
        return [{ type: THCutin.Haruna, enable: true }]
      }
    }

    // kirisima
    if (isShipId(top.mst.api_id, [694])) {
      if (
        ships.length >= 5 &&
        isShipId(ships[1].mst.api_id, [
          591, // 金剛改二丙
          592, // 比叡改二丙
          593, 954, // 榛名改二乙/丙
          697, // South Dakota改
        ]) &&
        !ships.some((ship) => isShipType(ship.mst, [ApiShipType.sensuikan, ApiShipType.sensui_kuubo]))
      ) {
        return [{ type: THCutin.Kirisima, enable: true }]
      }
    }

    // yamato, musasi
    if (isShipId(top.mst.api_id, [911, 916, 546])) {
      if (
        ships.length >= 6 &&
        !ships.some((ship) =>
          isShipType(ship.mst, [ApiShipType.sensuikan, ApiShipType.sensui_kuubo])
        ) &&
        isShipType(ships[1].mst, [
          ApiShipType.kousoku_senkan,
          ApiShipType.teisoku_senkan,
          ApiShipType.koukuu_senkan
        ])) {
          const ret: { type: THCutin, enable: boolean }[] = []
          const shipId2 = ships[1].mst.api_id
          const isYamatoTop = isShipId(top.mst.api_id, [911, 916])

          // yamato, check type1
          if (isYamatoTop &&
            isShipType(ships[2].mst, [
              ApiShipType.kousoku_senkan,
              ApiShipType.teisoku_senkan,
              ApiShipType.koukuu_senkan
          ])) {
            const shipId3 = ships[2].mst.api_id
            if (
              (shipId2 === 546 && shipId3 === 541) || // 武蔵改二, 長門改二
              (shipId2 === 546 && shipId3 === 573) || // 武蔵改二, 陸奥改二
              (isShipId(shipId2, [541, 573]) && isShipId(shipId3, [541, 573])) || // 長門改二, 陸奥改二
              (isShipId(shipId2, [553, 554]) && isShipId(shipId3, [553, 554])) || // 伊勢改二, 日向改二
              (isShipId(shipId2, [411, 412]) && isShipId(shipId3, [411, 412])) || // 扶桑改二, 山城改二
              (isShipId(shipId2, [591]) && isShipId(shipId3, [592, 593, 954])) || // 金剛改二丙, 比叡改二丙/榛名改二乙/丙
              (isShipId(shipId2, [592, 593, 954]) && isShipId(shipId3, [591])) || // 比叡改二丙/榛名改二乙/丙, 金剛改二丙
              (isShipId(shipId2, [591, 592]) && isShipId(shipId3, [694])) || // 金剛改二丙/比叡改二丙,  霧島改二丙
              (isShipId(shipId2, [446, 447]) && isShipId(shipId3, [446, 447])) || // Italia, Roma改
              (isShipId(shipId2, [364, 576]) && isShipId(shipId3, [364, 576])) || // Warspite改, Nelson改
              (isShipId(shipId2, [364, 733]) && isShipId(shipId3, [364, 733])) || // Warspite改, Valiant改
              (isShipId(shipId2, [576, 577]) && isShipId(shipId3, [576, 577])) || // Nelson改, Rodney改
              (isShipId(shipId2, [659, 697]) && isShipId(shipId3, [659, 697])) || // Washington改, South Dakota改
              (isShipId(shipId2, [392, 969, 724]) && isShipId(shipId3, [392, 969, 724]))  // Richelieu改/Deux, Jean Bart改
            ) {
              ret.push({ type: THCutin.YamatoType1, enable: true })
            }
          }

          // yamato,musasi check type2
          if (
            isShipId(shipId2, [911, 916, 546]) || // 大和改二, 武蔵改二
            (isYamatoTop && isShipId(shipId2, [360])) || // Iowa改
            (isYamatoTop && isShipId(shipId2, [178])) || // Bismarck drei
            (isYamatoTop && isShipId(shipId2, [392, 969, 724])) // Richelieu改/Deux, Jean Bart改
          ) {
            ret.push({ type: THCutin.YamatoType2, enable: true })
          }

          if (ret.length > 0) {
            return ret;
          }
        }
    }
  

    return
  }

  /**
   *
   */
  public static spAll(ship: ShipInfo, ships: ShipInfo[]): SpState {
    // tiku cutin
    const tk = KcsUtil.spTKCutin(ship)

    // thcutin
    const th = KcsUtil.spTHCutin(ship, ships)

    // sensei taisen
    const st = KcsUtil.spSenseiTaisen(ship)

    // sensei raigeki
    const sr = KcsUtil.spSenseiRaigeki(ship)

    // facutin
    const fa = KcsUtil.spFACutin(ship)

    // aacutin
    const aa = KcsUtil.spAACutin(ship)

    // ycutin
    const y = KcsUtil.spYCutin(ship)

    // yscutin
    const ys = KcsUtil.spYSCutin(ship)

    // funsindanmaku
    const fd = KcsUtil.spFD(ship)

    // yatei
    const yt = KcsUtil.spYatei(ship)

    return {
      tk,
      th,
      st,
      sr,
      fa,
      aa,
      y,
      ys,
      fd,
      yt,
    }
  }

  // rate

  /**
   *
   */
  public static rateTK(tk: TKCutin): number {
    return TKCutinConsts[tk].rate / 101.0
  }

  /**
   *
   */
  public static rateTHNelson(ships: ShipInfoSp[]): number {
    return (
      (1.1 *
        (Math.sqrt(ships[0].api.api_lv) +
          Math.sqrt(ships[2].api.api_lv) +
          Math.sqrt(ships[4].api.api_lv)) +
        1.4 * Math.sqrt(ships[0].api.api_lucky[0]) +
        25) /
      100
    )
  }

  /**
   *
   */
  public static rateTHNagato(ships: ShipInfoSp[]): number {
    const v1 = Math.sqrt(ships[0].api.api_lv) + Math.sqrt(ships[1].api.api_lv)
    const v2 = Math.sqrt(ships[0].api.api_lucky[0]) + Math.sqrt(ships[1].api.api_lucky[0])
    return (v1 + 1.2*v2 + 30) / 100
  }

  /**
   *
   */
  public static rateTHKongo(ships: ShipInfoSp[]): number {
    const v1 = Math.sqrt(ships[0].api.api_lv)
    const v2 = Math.sqrt(ships[1].api.api_lv)
    const v3 = Math.sqrt(ships[0].api.api_lucky[0])
    const v4 = Math.sqrt(ships[1].api.api_lucky[0])

    let vA = 0;
    let vB = 0;
    const shipId = ships[0].mst.api_id
    ships[0].slots.forEach((slot) => {
      if (! slot) {
        return
      }

      // 水上電探
      const imgtype = KcsUtil.slotitemImgType(slot.mst)
      if (imgtype === SlotitemImgType.dentan && slot.mst.api_saku >= 8) {
        // kongo kaini hei
        if (isShipId(shipId, [591])) {
          vA = 30;
        }
        // hiei kaini hei
        if (isShipId(shipId, [592])) {
          vA = 10;
        }
        // haruna kaini otu
        if (isShipId(shipId, [593])) {
          vA = 15;
        }
        // haruna kaini hei
        if (isShipId(shipId, [954])) {
          vA = 20;
        }
        // kirisima kaini hei
        if (isShipId(shipId, [694])) {
          vA = 20;
        }
      }
      // 大型探照灯
      if (slot.mst.api_id === 140) {
        // kongo kaini hei
        if (isShipId(shipId, [591])) {
          vB = 10;
        }
        // hiei kaini hei
        if (isShipId(shipId, [592])) {
          vB = 30;
        }
        // kirisima kaini hei
        if (isShipId(shipId, [694])) {
          vB = 20;
        }
      }
    })

    return (6.0*v1 + 3.0*v2 + 1.5*v3 + 0.75*v4 + vA + vB - 57) / 100
  }

  /**
   *
   */
  public static rateTHYamatoType1(ships: ShipInfoSp[]): number {
    return NaN
  }

  /**
   *
   */
  public static rateTHYamatoType2(ships: ShipInfoSp[]): number {
    const shipId1 = ships[0].mst.api_id
    const shipId2 = ships[1].mst.api_id

    const v1 = Math.sqrt(ships[0].api.api_lv)
    const v2 = Math.sqrt(ships[1].api.api_lv)
    const v3 = Math.sqrt(ships[0].api.api_lucky[0])
    const v4 = Math.sqrt(ships[1].api.api_lucky[0])
    const hasDentan = (ship: ShipInfoSp): boolean => {
      return !!ship.slots.some((slot) => {
        if (slot) {
          const imgtype = KcsUtil.slotitemImgType(slot.mst)
          if (imgtype === SlotitemImgType.dentan && slot.mst.api_houm >= 8) {
            return true
          }
        }
        return false
      });
    };
    const dc = (hasDentan(ships[0]) ? 1 : 0) + (hasDentan(ships[1]) ? 1 : 0)
    const yamatoHosei = isShipId(shipId1, [911, 916]) ? 2 : 0

    // check 2nd
    let const2nd = NaN
    if (isShipId(shipId2, [911, 916, 546])) { // 大和改二, 武蔵改二
      const2nd = 40
    }
    if (isShipId(shipId2, [360, 392])) { // Iowa改, Richelieu改
      const2nd = 35
    }

    return (v1 + v2 + v3 + v4 + const2nd + dc*10.0 + yamatoHosei) / 100
  }

  /**
   * 
   */
  public static rateTH(th: THCutinState | undefined, ships: ShipInfoSp[]): THCutinRate | undefined {
    if (!th) {
      return
    }

    if (th.type === THCutin.Nelson) {
      return {
        type: th.type,
        enable: th.enable,
        rate: KcsUtil.rateTHNelson(ships)
      }
    }

    const nagatos: THCutin[] = [THCutin.Nagato, THCutin.Mutu]
    if (nagatos.includes(th.type)) {
      return {
        type: th.type,
        enable: th.enable,
        rate: KcsUtil.rateTHNagato(ships)
      }
    }

    const kongos: THCutin[] = [THCutin.Kongou, THCutin.Hiei, THCutin.Haruna, THCutin.Kirisima]
    if (kongos.includes(th.type)) {
      return {
        type: th.type,
        enable: th.enable,
        rate: KcsUtil.rateTHKongo(ships)
      }
    }

    if (th.type === THCutin.YamatoType1) {
      return {
        type: th.type,
        enable: th.enable,
        rate: KcsUtil.rateTHYamatoType1(ships)
      }
    }

    if (th.type === THCutin.YamatoType2) {
      return {
        type: th.type,
        enable: th.enable,
        rate: KcsUtil.rateTHYamatoType2(ships)
      }
    }

    return {
      type: th.type,
      enable: th.enable,
      rate: NaN
    }
  }

  public static deckFALos(ships: ShipInfoSp[]): number {
    const calc = ships.reduce(
      (acc, ship) => {
        acc.l += calcShipLos(ship)

        const onslot = ship.api.api_onslot
        acc.t += ship.slots.reduce((t, slot, index) => {
          if (slot) {
            if (slot.mst.api_saku && KcsUtil.hasFASeaplane(KcsUtil.slotitemType(slot.mst))) {
              t += Math.floor(Math.sqrt(onslot[index] ?? 0)) * slot.mst.api_saku
            }
          }
          return t
        }, 0)
        return acc
      },
      { l: 0, t: 0 }
    )

    const A = calc.l + calc.t
    return Math.floor(Math.sqrt(A) + 0.1 * A)
  }

  /**
   *
   */
  public static calcFAAA(info: ShipInfoSp, ships: ShipInfoSp[]): number[] {
    let hatakan_hosei = 0
    if (ships[0].api.api_id === info.api.api_id) {
      hatakan_hosei = 15
    }

    const luck = Math.floor(Math.sqrt(info.api.api_lucky[0]) + 10)
    let deck_los = ships[0].deck_los
    if (!deck_los) {
      deck_los = KcsUtil.deckFALos(ships)
      ships[0].deck_los = deck_los
    }
    const equip_los = info.slots.reduce((acc, slot) => acc + (slot ? slot.mst.api_saku : 0), 0)
    const kakuho = Math.floor(luck + 0.7 * (deck_los + 1.6 * equip_los) + 10) + hatakan_hosei
    const yuusei = Math.floor(luck + 0.6 * (deck_los + 1.2 * equip_los)) + hatakan_hosei
    //console.log('decklos', deck_los, 'equip_los', equip_los, 'luck:', luck, 'kakuho:', Math.floor(kakuho*1000)/1000, 'yuusei:', Math.floor(yuusei*1000)/1000);
    return [kakuho, yuusei]
  }

  /**
   *
   */
  public static rateFA(info: ShipInfoSp, ships: ShipInfoSp[]): FACutinRate[] {
    if (!info.sp.fa.length) {
      return []
    }
    const ks = KcsUtil.calcFAAA(info, ships)
    return info.sp.fa.map((ci) => ({
      type: ci.type,
      enable: ci.enable,
      rate: [ks[0] / FACutinConst[ci.type], ks[1] / FACutinConst[ci.type]]
    }))
  }

  /**
   *
   */
  public static rateAA(info: ShipInfoSp, ships: ShipInfoSp[]): AACutinRate[] {
    if (!info.sp.aa.length) {
      return []
    }
    const ks = KcsUtil.calcFAAA(info, ships)
    return info.sp.aa.map((ci) => ({
      type: ci.type,
      enable: ci.enable,
      rate: [ks[0] / AACutinConst[ci.type], ks[1] / AACutinConst[ci.type]]
    }))
  }

  /**
   *
   */
  public static rateY(info: ShipInfoSp, ships: ShipInfoSp[]): YCutinRate[] {
    if (!info.sp.y.length) {
      return []
    }

    const ci = calcCI(info, ships)
    //console.log('ciy:', ci, info.mst.api_name);
    return info.sp.y.map((y) => ({
      type: y.type,
      enable: y.enable,
      rate: y.type === YCutin.COMMON_RENGEKI ? 0.99 : ci / YCutinConst[y.type].ciConst
    }))
  }

  /**
   *
   */
  public static rateYS(info: ShipInfoSp, ships: ShipInfoSp[]): YSCutinRate[] {
    if (!info.sp.ys.length) {
      return []
    }
    const ci = calcCI(info, ships)
    //console.log('ciys:', ci, info.mst.api_name);
    return info.sp.ys.map((y) => ({
      type: y.type,
      enable: y.enable,
      rate: y.type === YSCutin.YAKOU ? 1 : ci / YSCutinConst[y.type].ciConst
    }))
  }

  /**
   *
   */
  public static rateFD(info: ShipInfoSp): FDRate | undefined {
    if (!info.sp.fd) {
      return
    }

    let rate = (0.9 * info.api.api_lucky[0] + info.bouku.kt) / 281.0
    const cnt = info.slots.reduce(
      (acc, slot) => (slot && slot.mst.api_id === 274 ? acc + 1 : acc),
      0
    )
    if (cnt === 2) {
      rate += 0.15
    }
    if (cnt >= 3) {
      rate += 0.3
    }
    //  伊勢改, 日向改, 伊勢改二, 日向改二
    if (isShipId(info.mst.api_id, [82, 88, 553, 554])) {
      rate += 0.25
    }

    return {
      enable: info.sp.fd.enable,
      rate: Math.min(1, rate)
    }
  }
  
  /**
   * 
   * @param ships 
   */
  static enableYatei(ships: ShipInfoSp[]): boolean {

    // 艦隊チェック無しは常にtrue
    if (ships.length === 0) {
      return true
    }

    // 航空戦に参加する装備がない場合は夜偵発動不可
    const types: SlotitemType[] = [
      SlotitemType.Fighter,
      SlotitemType.DiveBomber,
      SlotitemType.TorpedoBomber,
      SlotitemType.SeaplaneBomber,
      SlotitemType.Autogyro,
      SlotitemType.ASBAircraft, 
      SlotitemType.SeaplaneFighter,
      SlotitemType.JetFighter,
      SlotitemType.JetFighterBomber,
    ]
    return ships.some((ship) => {
      return ship.slots.some((slot) => {
        if (! slot) {
          return false
        }
        const type = KcsUtil.slotitemType(slot.mst)
        return types.includes(type)
    })})
  }
  
  /**
   *
   */
  public static rateYatei(info: ShipInfoSp, ships: ShipInfoSp[]): YateiRate | undefined {
    if (!info.sp.yt) {
      return
    }

    const rates = info.slots.reduce<number[]>((acc, slot) => {
      if (slot) {
        const imgtype = KcsUtil.slotitemImgType(slot.mst)
        if (imgtype == SlotitemImgType.yatei) {
          acc.push(Math.sqrt(slot.mst.api_saku * info.api.api_lv)*4 / 100)
        }
      }
      return acc;
    }, []);

    if (rates.length === 0) {
      return 
    }

    if (rates.length === 1) {
      return {
        enable: KcsUtil.enableYatei(ships),
        rate: Math.min(1, rates[0])
      }
    }
    
    return {
      enable: KcsUtil.enableYatei(ships),
      rate: Math.min(1, MathUtil.totalRate(rates).total)
    }
  }

  /**
   *
   * @param v
   */
  public static isBattle(v: ApiBattleBase | null): boolean {
    return !!v && Array.isArray((v as any).api_hourai_flag)
  }

  /**
   *
   * @param v
   */
  public static isBattleNormal(v: ApiBattleBase | null): boolean {
    return !!v && 'api_kouku' in v
  }

  /**
   *
   * @param v
   */
  public static isAirBattle(v: ApiBattleBase): boolean {
    return Array.isArray((v as any).api_stage_flag2)
  }

  /**
   *
   * @param v
   */
  public static isMidnightSpBattle(v: ApiBattleBase): boolean {
    return 'api_n_support_info' in v
  }

  /**
   *
   * @param v
   */
  public static isNormalVsCombinedBattle(v: ApiBattleBase | null): boolean {
    return (
      !!v &&
      !Array.isArray((v as any).api_f_nowhps_combined) &&
      Array.isArray((v as any).api_ship_ke_combined)
    )
  }

  /**
   *
   * @param v
   */
  public static isCombinedVsNormalBattle(v: ApiBattleBase | null): boolean {
    return (
      !!v &&
      Array.isArray((v as any).api_f_nowhps_combined) &&
      !Array.isArray((v as any).api_ship_ke_combined)
    )
  }

  /**
   *
   * @param v
   */
  public static isCombinedVsCombinedBattle(v: ApiBattleBase): boolean {
    return (
      !!v &&
      Array.isArray((v as any).api_f_nowhps_combined) &&
      Array.isArray((v as any).api_ship_ke_combined)
    )
  }

  /**
   *
   * @param v
   */
  public static isEnemyCombined(v: ApiBattleBase | null): boolean {
    return !!v && Array.isArray((v as any).api_ship_ke_combined)
  }

  /**
   *
   * @param v
   */
  public static fDamaged(v: ApiStage3 | ApiRaigeki | null | undefined): boolean {
    return v?.api_fdam?.some((d) => !!Math.floor(d)) ?? false
  }

  /**
   *
   * @param hougeki
   */
  public static hougekiDamaged(
    hougeki: ApiHougeki | ApiHougekiMidnight | null | undefined
  ): boolean {
    if (!hougeki) {
      return false
    }
    const at_eflag = hougeki.api_at_eflag
    const damage = hougeki.api_damage
    return at_eflag.some((eflag, i) => {
      if (eflag) {
        return damage[i]?.some((d) => !!Math.floor(d)) ?? false
      }
      return false
    })
  }

  /**
   *
   */
  public static questlistInProgress(list: ApiQuestList): ApiQuest[] {
    return list.api_list.filter((quest) => quest.api_state !== ApiQuestState.not_started)
  }

  /**
   *
   */
  public static questCount(quest: ApiQuest): number {
    if (quest.api_state === ApiQuestState.completed) {
      return 100
    }
    return [0, 50, 80][quest.api_progress_flag] ?? 0
  }

  /**
   * 期間限定クエストか判定
   * @param quest_no
   */
  public static questIsSpecial(quest_no: number): boolean {
    return [
      329, 840, 841,
      //843,
      441
    ].includes(quest_no)
  }

  /**
   * 戦果
   * @param id
   */
  public static questSenka(id: number): number {
    const m: { [key: number]: number } = {
      284: 80, // 南西諸島方面「海上警備行動」発令！
      //843: 250, // 【節分拡張任務】節分作戦二〇二二、全力出撃！
      845: 330, // 発令！「西方海域作戦」
      854: 350, // 戦果拡張任務！「Z作戦」前段作戦
      872: 400, // 戦果拡張任務！「Z作戦」後段作戦
      888: 200, // 新編成「三川艦隊」、鉄底海峡に突入せよ！
      893: 300, // 泊地周辺海域の安全確保を徹底せよ！
      903: 390, // 拡張「六水戦」、最前線へ！
      947: 480, // AL作戦
      948: 600, // 機動部隊決戦
      955: 500, // 【梅雨任務拡張作戦】南方反攻望楼作戦を叩け！
    }
    return m[id] ?? 0
  }

  /**
   *
   * @param shipType
   * @returns
   */
  public static getShipTypeName(shipType: ApiShipType): ShipTypeName {
    const name = ShipTypeNames.get(shipType)
    return name ?? { longName: '', shortName: '' }
  }

  /**
   *
   * @param shipType
   * @returns
   */
  public static getShipTypeNameFromInfo(ship: ShipInfo): ShipTypeName {
    if (KcsUtil.isGoeiKuubo(ship.mst)) {
      return KcsUtil.getShipTypeName(ApiShipType.internal_goei_kuubo)
    }
    return KcsUtil.getShipTypeName(ship.mst.api_stype)
  }

  /**
   *
   * @param mst
   * @returns
   */
  public static isGoeiKuubo(mst: MstShip): boolean {
    return GoeiKuuboIds.some((el) => mst.api_id === el)
  }

  /**
   *
   * @param mst
   * @returns
   */
  public static isTokumukan(mst: MstShip): boolean {
    return TokumukanIds.some((el) => mst.api_id === el)
  }

  /**
   *
   * @param ship
   * @param ship_types
   * @returns
   */
  public static findShipType(ship: ShipInfo, ship_types: ApiShipType[]): number {
    for (let i = 0; i < ship_types.length; ++i) {
      const ship_type = ship_types[i]

      if (ship_type === ApiShipType.internal_goei_kuubo) {
        if (KcsUtil.isGoeiKuubo(ship.mst)) {
          return i
        }
      }

      if (ship_type === ApiShipType.internal_tokumukan) {
        if (KcsUtil.isTokumukan(ship.mst)) {
          return i
        }
      }

      if (ship.mst.api_stype === ship_type) {
        return i
      }
    }

    return -1
  }

  /**
   * 
   * @param api 
   * @returns 
   */
  public static apiShipFire(api: ApiShip): number {
    return api.api_karyoku[0] + KcsUtil.getSpEffectStatus(api, 'api_houg');
  }

  /**
   * 
   * @param api 
   * @returns 
   */
  public static apiShipEv(api: ApiShip): number {
    return api.api_kaihi[0] + KcsUtil.getSpEffectStatus(api, 'api_kaih');
  }

  /**
   * 
   * @param api 
   * @returns 
   */
  public static apiShipTor(api: ApiShip): number {
    return api.api_raisou[0] + KcsUtil.getSpEffectStatus(api, 'api_raig');
  }

  /**
   * 
   * @param api 
   * @returns 
   */
  public static apiShipArmor(api: ApiShip): number {
    return api.api_soukou[0] + KcsUtil.getSpEffectStatus(api, 'api_souk');
  }

  /**
   * 
   * @param api 
   * @param status 
   * @returns 
   */
  public static getSpEffectStatus(
    api: ApiShip,
    status: 'api_souk' | 'api_raig' | 'api_kaih' | 'api_houg'): number {
    if (! api.api_sp_effect_items) {
      return 0;
    }
    return api.api_sp_effect_items.reduce<number>((acc, item) => {
      if (item[status]) {
        acc += item[status]
      }
      return acc
    }, 0)
  }

  /**
   * 
   * @param api 
   * @param status 
   * @returns 
   */
  static isSpEffectStatusPlus(
    api: ApiShip,
    status: 'api_souk' | 'api_raig' | 'api_kaih' | 'api_houg'): boolean {
    return api.api_sp_effect_items?.find(
      (item) => !!item[status]) !== undefined
  }

  /**
   * 
   * @param area_id 
   * @returns 
   */
  static isEventAreaId(area_id: number): boolean {
    return area_id > 40;
  }

  /**
   * 
   */
  static isNobattleCell(map: ApiMap): boolean { 
    return KcsUtil.isNobattleCellValue(map.api_event_kind, map.api_event_id)
  }

  /**
   * 
   */
  static isNobattleCellValue(api_event_kind: ApiEventKind, api_event_id: number): boolean { 
    if (api_event_kind === ApiEventKind.nobattle) {
      return true
    }

    if ((api_event_id === ApiEventId.noevent) ||
        (api_event_id === ApiEventId.imagination)) {
      return true
    }
    return false
  }


  /**
   * 
   * @param itemget 
   * @returns 
   */
  static toItemGetId(itemget: ApiItemGetBase): { valid: boolean; id?: ApiItemId } {
    if (itemget.api_usemst === ApiItemGetUseMst.material) {
      switch (itemget.api_id) {
        case ApiItemGetItemId.fual:
          return { valid: true, id: ApiItemId.fual }
        case ApiItemGetItemId.ammo:
          return { valid: true, id: ApiItemId.ammo }
        case ApiItemGetItemId.steel:
          return { valid: true, id: ApiItemId.steel }
        case ApiItemGetItemId.buxite:
          return { valid: true, id: ApiItemId.buxite }
        case ApiItemGetItemId.fastRepair:
          return { valid: true, id: ApiItemId.fast_repair }
        case ApiItemGetItemId.fastBuild:
          return { valid: true, id: ApiItemId.fast_build }
        case ApiItemGetItemId.buildKit:
          return { valid: true, id: ApiItemId.build_kit }
        default:
          return { valid: false }
      }
    }

    return { valid: true, id: itemget.api_id as ApiItemId }
  }
  
}

export interface MstShipBase {
  readonly api_id: number
  readonly api_sort_id: number
  readonly api_name: string
  readonly api_yomi: string
  readonly api_stype: ApiShipType
  readonly api_ctype: ApiShipCategory
  readonly api_soku: number
  readonly api_slot_num: number
}

export const MstShipIdBeginEnemy = 1501 as const

export interface MstShip extends MstShipBase {
  readonly api_sortno: number
  readonly api_afterlv: number
  readonly api_aftershipid: string
  readonly api_taik: number[]
  readonly api_souk: number[]
  readonly api_houg: number[]
  readonly api_raig: number[]
  readonly api_tyku: number[]
  readonly api_luck: number[]
  readonly api_leng: ApiRange
  readonly api_maxeq: number[]
  readonly api_buildtime: number
  readonly api_broken: number[]
  readonly api_powup: number[]
  readonly api_backs: ApiShipBacks
  readonly api_getmes: string
  readonly api_afterfuel: number
  readonly api_afterbull: number
  readonly api_fuel_max: number
  readonly api_bull_max: number
  readonly api_voicef: number
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
  api_maxeq: [],
  api_buildtime: 0,
  api_broken: [0, 0, 0, 0],
  api_powup: [0, 0, 0, 0],
  api_backs: 0,
  api_getmes: '',
  api_afterfuel: 0,
  api_afterbull: 0,
  api_fuel_max: 0,
  api_bull_max: 0,
  api_voicef: 0
})

export const InvalidMstShipBase = (): MstShipBase => ({
  api_id: 0,
  api_sort_id: 0,
  api_name: '',
  api_yomi: '',
  api_stype: 0,
  api_ctype: 0,
  api_soku: 0,
  api_slot_num: 0
})

export interface MstSlotitemEquiptype {
  readonly api_id: number
  readonly api_name: string
  readonly api_show_flg: number
}

export interface MstEquipExslotShip {
  readonly api_slotitem_id: number
  readonly api_ship_ids: number[]
}

export interface MstStype {
  readonly api_id: number
  readonly api_sortno: number
  readonly api_name: string
  readonly api_scnt: number
  readonly api_kcnt: number
  readonly api_equip_type: number[]
}

type SlotitemTypeArray = [number, number, SlotitemType, SlotitemImgType, number]
export interface MstSlotitem {
  readonly api_id: number
  readonly api_sortno: number
  readonly api_name: string
  readonly api_type: SlotitemTypeArray
  readonly api_taik: number //
  readonly api_souk: number // 装甲
  readonly api_houg: number // 火力
  readonly api_raig: number // 雷撃
  readonly api_soku: number //
  readonly api_baku: number // 爆装
  readonly api_tyku: number // 対空
  readonly api_tais: number // 対潜
  readonly api_atap: number //
  readonly api_houm: number // 命中/対爆
  readonly api_raim: number // 雷撃命中？
  readonly api_houk: number // 回避/追撃
  readonly api_raik: number // 雷撃回避？
  readonly api_bakk: number // 爆撃回避？
  readonly api_saku: number // 索敵
  readonly api_sakb: number // 索敵妨害？
  readonly api_luck: number // 運
  readonly api_leng: ApiRange // 射程
  readonly api_rare: ApiRare // レア
  readonly api_distance?: number // 行動半径
  readonly api_broken: number[]
  readonly api_usebull: string
  readonly api_version: number
}

export const ApiRare = {
  common: 0, // コモン
  rare: 1, // レア
  holo: 2, // ホロ
  s_holo: 3, // Sホロ
  ss_holo: 4, // SSホロ
  sss_holo: 5, // SSホロ
  ss_holo_plus: 6, // SSホロ+
  ss_plus_plus: 7, // SS++
} as const
export type ApiRare = (typeof ApiRare)[keyof typeof ApiRare]

export interface MstFurnituregraph {
  readonly api_id: number
  readonly api_type: number
  readonly api_no: number
  readonly api_filename: string
  readonly api_version: string
}

export interface MstUseitem {
  readonly api_id: number
  readonly api_usetype: number
  readonly api_category: number
  readonly api_name: string
  readonly api_description: string[]
  readonly api_price: number
}

export interface MstPayitem {
  readonly api_id: number
  readonly api_type: number
  readonly api_name: string
  readonly api_description: string
  readonly api_shop_description: string
  readonly api_item: number[]
  readonly api_price: number
}

export interface MstItemShop {
  readonly api_cabinet_1: number[]
  readonly api_cabinet_2: number[]
}

export interface MstMaparea {
  readonly api_id: number
  readonly api_name: string
  readonly api_type: ApiMapAreaType // 0: normal, 1: event
}

export const ApiMapAreaType = {
  normal: 0,
  event: 1
} as const
export type ApiMapAreaType = (typeof ApiMapAreaType)[keyof typeof ApiMapAreaType]

export interface MstMapinfo {
  readonly api_id: number
  readonly api_maparea_id: number
  readonly api_no: number
  readonly api_name: string
  readonly api_level: number
  readonly api_opetext: string
  readonly api_infotext: string
  readonly api_item: number[]
  readonly api_max_maphp: null
  readonly api_required_defeat_count: null
  readonly api_sally_flag: number[]
}

export interface MstMapbgm {
  readonly api_id: number
  readonly api_maparea_id: number
  readonly api_no: number
  readonly api_moving_bgm: number
  readonly api_map_bgm: number[]
  readonly api_boss_bgm: number[]
}

export interface MstMission {
  readonly api_id: number
  readonly api_disp_no: string
  readonly api_maparea_id: number
  readonly api_name: string
  readonly api_details: string
  readonly api_reset_type: number
  readonly api_damage_type: number
  readonly api_time: number
  readonly api_deck_num: number
  readonly api_difficulty: number
  readonly api_use_fuel: number
  readonly api_use_bull: number
  readonly api_win_item1: number[]
  readonly api_win_item2: number[]
  readonly api_win_mat_level: number[]
  readonly api_return_flag: number
  readonly api_sample_fleet: number[]
}

export interface MstConst {
  readonly api_boko_max_ships: StringIntValue
  readonly api_parallel_quest_max: StringIntValue
  readonly api_dpflag_quest: StringIntValue
}

export interface StringIntValue {
  readonly api_string_value: string
  readonly api_int_value: number
}

export interface MstShipupgrade {
  readonly api_id: number
  readonly api_current_ship_id: number
  readonly api_original_ship_id: number
  readonly api_upgrade_type: number
  readonly api_upgrade_level: number
  readonly api_drawing_count: number
  readonly api_catapult_count: number
  readonly api_report_count: number
  readonly api_aviation_mat_count: number
  readonly api_sortno: number
}

export interface MstBgm {
  readonly api_id: number
  readonly api_name: string
}

export interface MstEquipShip {
  readonly api_ship_id: number
  readonly api_equip_type: number[]
}

export interface MstFurniture {
  readonly api_id: number
  readonly api_type: number
  readonly api_no: number
  readonly api_title: string
  readonly api_description: string
  readonly api_rarity: number
  readonly api_price: number
  readonly api_saleflg: number
  readonly api_season: number
  readonly api_version: number
  readonly api_outside_id: number
  readonly api_active_flag: number
}

export interface MstShipgraph {
  readonly api_id: number
  readonly api_filename: string
  readonly api_version: string[]
  readonly api_battle_n: number[]
  readonly api_battle_d: number[]
  readonly api_sortno: number
  readonly api_boko_n: number[]
  readonly api_boko_d: number[]
  readonly api_kaisyu_n: number[]
  readonly api_kaisyu_d: number[]
  readonly api_kaizo_n: number[]
  readonly api_kaizo_d: number[]
  readonly api_map_n: number[]
  readonly api_map_d: number[]
  readonly api_ensyuf_n: number[]
  readonly api_ensyuf_d: number[]
  readonly api_ensyue_n: number[]
  readonly api_weda: number[]
  readonly api_wedb: number[]
  readonly api_pa: number[]
}

export const ApiResult = {
  ok: 1
} as const
export type ApiResult = (typeof ApiResult)[keyof typeof ApiResult]

interface ApiResponse {
  readonly api_result: number
  readonly api_result_msg: string
}

export const ApiMaterialId = {
  FUAL: 1, // 燃料
  AMMO: 2, // 弾薬
  STEEL: 3, // 鋼材
  BUXITE: 4, // ボーキサイト
  FAST_BUILD: 5, // 高速建造材
  FAST_REPAIR: 6, // 高速修復材
  BUILD_KIT: 7, // 開発資材
  REMODEL_KIT: 8, // 改修資材
  MIN: 1,
  MAX: 8
} as const
export type ApiMaterialId = (typeof ApiMaterialId)[keyof typeof ApiMaterialId]

export interface ApiMaterial {
  readonly api_member_id: number
  readonly api_id: ApiMaterialId
  readonly api_value: number
}

export const ApiItemId = {
  fast_repair: 1, // 高速修復材
  fast_build: 2, // 高速建造材
  build_kit: 3, // 開発資材
  remodel_kit: 4, // 改修資材
  kagu_small: 10, // 家具箱（小）
  kagu_middle: 11, // 家具箱（中）
  kagu_large: 12, // 家具箱（大）
  fual: 31, // 燃料
  ammo: 32, // 弾薬
  steel: 33, // 鋼材
  buxite: 34, // ボーキサイト
  kagu_coin: 44, // 家具コイン
  emergency_repair: 50, // 応急修理要員
  emergency_repair_god: 51, // 応急修理女神
  kagu_craftsman: 52, // 特注家具職人
  mamiya: 54, // 給糧艦「間宮」
  kekkonn_kakkokari: 55, // ケッコンカッコカリ
  chocolate: 56, // 艦娘からのチョコ
  medal: 57, // 勲章
  remodel_blueprint: 58, // 改装設計図
  irako: 59, // 給糧艦「伊良湖」
  kou_medal: 61, // 甲種勲章
  present_box: 60, // プレゼント箱
  hishimochi: 62, // 菱餅
  slot_expansion: 64, //	補強増設
  catapult: 65, // 試製甲板カタパルト
  rice_ball: 66, //戦闘糧食
  offshore_supply: 67, // 洋上補給
  saury: 68, //秋刀魚
  saury_canning: 69, // 秋刀魚の缶詰
  special_crew: 70, // 熟練搭乗員
  ne_engine: 71, // ネ式エンジン
  decoration_item: 72, // お飾り材料
  aircraft_blueprint: 74, // 新型航空機設計図
  weapon_materials: 75, // 新型砲熕兵装資材
  special_rice_ball: 76, // 戦闘糧食(特別なおにぎり)
  aircraft_materials: 77, // 新型航空兵装資材
  full_battle_report: 78, // 戦闘詳報
  kaikyosyou: 79, // 海峡章
  xmas_present_box: 80, // Xmas Select Gift Box
  syougousyou_kou: 81, // 捷号章
  syougousyou_otu: 82, // 捷号章
  syougousyou_hei: 83, // 捷号章
  syougousyou_tei: 84, // 捷号章
  drop_rice: 85, // お米
  drop_umeboshi: 86, // 梅干
  drop_nori: 87, // 海苔
  drop_otya: 88, // お茶
  setsubun_bean: 90, // 節分の豆
  emergency_repair_material: 91, // 緊急修理資材
  aircraft_build_material: 92, // 新型噴進装備開発資材
  sardine: 93, // 鰯
  new_model_armament_material: 94, // 新型兵装資材
  submarine_supply_material: 95, // 潜水艦補給物資
  pumpkin: 96, // 南瓜
  teru_teru_bouzu: 97, // てるてる坊主
  sea_colored_ribbon: 98, // 海色リボン
  white_tasuki: 99, // 白たすき
  latest_overseas_warship_technology: 100, // 海外艦最新技術
  night_skilled_crew_member: 101, // 夜戦熟練搭乗員
  special_aviation_ration: 102, // 特別航空戦食

  // private
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
  practice_lose: -11 //  演習敗数
  //ship_exp: -12, // 艦隊総経験値
} as const
export type ApiItemId = (typeof ApiItemId)[keyof typeof ApiItemId]

export const ApiDeckPortId = {
  deck1st: 1,
  deck2st: 2,
  deck3st: 3,
  deck4st: 4
} as const
export type ApiDeckPortId = (typeof ApiDeckPortId)[keyof typeof ApiDeckPortId]

export interface ApiDeckPort {
  readonly api_member_id: number
  readonly api_id: ApiDeckPortId // number
  readonly api_name: string
  readonly api_name_id: string
  readonly api_mission: [MissionState, ApiMissionId, number, number] // 0: state(0:none 1:inmission 2:ended 3:stop) 1: mission-id 2: time 3: unknown
  readonly api_flagship: string
  readonly api_ship: number[]
}

export function InvalidApiDeckPort(id: ApiDeckPortId): ApiDeckPort {
  return {
    api_member_id: 0,
    api_id: id,
    api_name: '',
    api_name_id: '',
    api_mission: [MissionState.no, 0, 0, 0],
    api_flagship: '',
    api_ship: []
  }
}

// api req hensei preset register
interface ApiPresetRegister {
  readonly api_preset_no: number
  readonly api_name: string
  readonly api_name_id: string
  readonly api_ship: number[]
}

// api req hensei preset delete param
interface ApiPresetDeleteParam {
  readonly api_verno: string
  readonly api_preset_no: string
}

export interface ApiPresetDeckInfo {
  readonly api_preset_no: number
  readonly api_name: string
  readonly api_name_id: string
  readonly api_ship: number[]
}

const InvalidApiPresetDeckInfo = (): ApiPresetDeckInfo => ({
  api_preset_no: 0,
  api_name: '',
  api_name_id: '',
  api_ship: []
})

export interface ApiPresetDeck {
  readonly api_max_num: number
  readonly api_deck: { [key: string]: ApiPresetDeckInfo }
}

export interface ApiBasic {
  readonly api_member_id: string
  readonly api_nickname: string
  readonly api_nickname_id: string
  readonly api_active_flag: number
  readonly api_starttime: number
  readonly api_level: number
  readonly api_rank: number
  readonly api_experience: number
  readonly api_fleetname: null | string
  readonly api_comment: string
  readonly api_comment_id: string
  readonly api_max_chara: number
  readonly api_max_slotitem: number
  readonly api_max_kagu: number
  readonly api_playtime: number
  readonly api_tutorial: number
  readonly api_furniture: number[]
  readonly api_count_deck: number
  readonly api_count_kdock: number
  readonly api_count_ndock: number
  readonly api_fcoin: number
  readonly api_st_win: number
  readonly api_st_lose: number
  readonly api_ms_count: number
  readonly api_ms_success: number
  readonly api_pt_win: number
  readonly api_pt_lose: number
  readonly api_pt_challenged: number
  readonly api_pt_challenged_win: number
  readonly api_firstflag: number
  readonly api_tutorial_progress: number
  readonly api_pvp: number[]
  readonly api_medals: number
  readonly api_large_dock: number
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
  api_large_dock: 0
})

export interface ApiEventObject {
  readonly api_m_flag: number // 
  readonly api_m_flag2?: number
  readonly api_c_num: number
}

const InvalidApiEventObject = (): ApiEventObject => ({
  api_m_flag: 0,
  api_c_num: 0
})

export interface ApiFriendlySetting {
  readonly api_request_flag: number
  readonly api_request_type: number
}

const InvalidApiFriendlySetting = (): ApiFriendlySetting => ({
  api_request_flag: 0,
  api_request_type: 0
})

interface ApiSortieConditions {
  readonly api_war: ApiSortieConditionsApiWar
}

interface ApiSortieConditionsApiWar {
  readonly api_win: string
  readonly api_lose: string
  readonly api_rate: string
}

const InvalidApiSortieConditionsApiWar = (): ApiSortieConditionsApiWar => ({
  api_win: '',
  api_lose: '',
  api_rate: ''
})

// req combined battle result
export interface ApiCombinedBattleResult extends ApiBattleResult {
  readonly api_mvp_combined: number | null
  readonly api_get_ship_exp_combined: number[] | null
  readonly api_get_exp_lvup_combined: number[][] | null
}

export interface ApiEnemyInfo {
  api_level: string
  api_rank: string
  api_deck_name: string
}

export interface ApiBattleGetShip {
  api_ship_id: number // mst ship id
  api_ship_type: string // "駆逐艦",
  api_ship_name: string // "霰",
  api_ship_getmes: string // "霰です…<br>んちゃ…とかはいいません…よろしく…"
}

const InvalidApiPresetDeck = (): ApiPresetDeck => ({
  api_max_num: 0,
  api_deck: {}
})

interface ApiPresetSelectParam {
  readonly api_verno: string
  readonly api_preset_no: string
  readonly api_deck_id: string
}

interface ApiPresetSelect {
  readonly api_member_id: number
  readonly api_id: number
  readonly api_name: string
  readonly api_name_id: string
  readonly api_mission: number[]
  readonly api_flagship: string
  readonly api_ship: number[]
}

export const ApiKDockState = {
  locked: -1, // not unlock
  empty: 0, //
  inProgress: 2, //
  completed: 3 //
} as const
export type ApiKDockState = (typeof ApiKDockState)[keyof typeof ApiKDockState]

export interface ApiKDock {
  readonly api_id: number
  readonly api_state: ApiKDockState // -1: 未開放 0: 空 2: in progress 3:建造済み
  readonly api_created_ship_id: number
  readonly api_complete_time: number
  readonly api_complete_time_str: string
  readonly api_item1: number
  readonly api_item2: number
  readonly api_item3: number
  readonly api_item4: number
  readonly api_item5: number
}

export const ApiNDockState = {
  locked: -1, // not unlock
  empty: 0, //
  in: 1 //
} as const
export type ApiNDockState = (typeof ApiNDockState)[keyof typeof ApiNDockState]

export interface ApiNDock {
  readonly api_member_id: number
  readonly api_id: number
  readonly api_state: ApiNDockState
  readonly api_ship_id: number
  readonly api_complete_time: number
  readonly api_complete_time_str: string
  readonly api_item1: number
  readonly api_item2: number
  readonly api_item3: number
  readonly api_item4: number
}

const NDockEmpty = (): Omit<ApiNDock, 'api_member_id' | 'api_id'> => ({
  api_state: ApiNDockState.empty,
  api_ship_id: 0,
  api_complete_time: 0,
  api_complete_time_str: '',
  api_item1: 0,
  api_item2: 0,
  api_item3: 0,
  api_item4: 0
})

export interface ApiFurniture {
  readonly api_id: number
  readonly api_furniture_type: number
  readonly api_furniture_no: number
  readonly api_furniture_id: number
}

export const ApiSpEffectItemKind = {
  blue_ribbon: 1,
  white_tasuki: 2,
} as const
export type ApiSpEffectItemKind = (typeof ApiSpEffectItemKind)[keyof typeof ApiSpEffectItemKind]

export interface ApiSpEffectItem {
  readonly api_kind: ApiSpEffectItemKind;
  readonly api_houg?: number;
  readonly api_kaih?: number;
  readonly api_raig?: number;
  readonly api_souk?: number;
}

export interface ApiShip {
  readonly api_id: number
  readonly api_sortno: number
  readonly api_ship_id: number
  readonly api_lv: number
  readonly api_exp: number[]
  readonly api_nowhp: number
  readonly api_maxhp: number
  readonly api_soku: number
  readonly api_leng: ApiRange
  readonly api_slot: number[]
  readonly api_onslot: number[]
  readonly api_slot_ex: number // 0: no open ex slot, -1: open ex slot, not set,  > 0 ex slot set.
  readonly api_kyouka: [number, number, number, number, number, number, number] // 0:火力 1:雷装 2:対空 3:装甲 4:運 5:耐久 6:対潜
  readonly api_backs: ApiShipBacks
  readonly api_fuel: number
  readonly api_bull: number
  readonly api_slotnum: number
  readonly api_ndock_time: number
  readonly api_ndock_item: number[]
  readonly api_srate: number
  readonly api_cond: number
  readonly api_karyoku: number[]
  readonly api_raisou: number[]
  readonly api_taiku: number[]
  readonly api_soukou: number[]
  readonly api_kaihi: number[]
  readonly api_taisen: number[]
  readonly api_sakuteki: number[]
  readonly api_lucky: number[]
  readonly api_locked: number
  readonly api_locked_equip: number
  readonly api_sp_effect_items?: ApiSpEffectItem[]
  readonly api_sally_area?: number // event area
}

export const ApiKyoukaIndex = {
  fire: 0, // 火力
  tor: 1, // 雷装
  aa: 2, // 対空
  armor: 3, // 装甲
  luck: 4, // 運
  hp: 5, // 耐久
  asw: 6 // 対潜
}
export type ApiKyoukaIndex = (typeof ApiKyoukaIndex)[keyof typeof ApiKyoukaIndex]

export const ShipHpState = {
  normal: 0, //
  syouha: 1, //
  tyuuha: 2, //
  taiha: 3 //
} as const
export type ShipHpState = (typeof ShipHpState)[keyof typeof ShipHpState]

export const MapLv = {
  none: 0,
  tyou: 1,
  hei: 2,
  otu: 3,
  kou: 4
} as const
export type MapLv = (typeof MapLv)[keyof typeof MapLv]

export interface ApiDeck {
  readonly api_preset_no: number
  readonly api_name: string
  readonly api_name_id: string
  readonly api_ship: number[]
}

export interface ApiLog {
  readonly api_no: number
  readonly api_type: string
  readonly api_state: string
  readonly api_message: string
}

export interface ApiOssSetting {
  readonly api_language_type: number
  readonly api_oss_items: number[]
}

export interface ApiSlotitem {
  readonly api_id: number // アイテムID
  readonly api_slotitem_id: number // マスターデータID
  readonly api_locked?: number // ロック
  readonly api_level?: number // 改修レベル
  readonly api_alv?: number // 熟練度
}

const fixApiSlotitemMember = (slotitem: ApiSlotitem): ApiSlotitem => {
  const fix: {
    api_locked?: number // ロック
    api_level?: number // 改修レベル
    api_alv?: number // 熟練度
  } = {}

  if (undefined === slotitem.api_locked) {
    fix.api_locked = 0
  }
  if (undefined === slotitem.api_level) {
    fix.api_level = 0
  }
  if (undefined === slotitem.api_alv) {
    fix.api_alv = 0
  }
  return Object.assign(slotitem, fix)
}

export interface ApiUseItem {
  readonly api_id: ApiItemId
  readonly api_count: number
}

// res itemuse
export const ApiItemUseMst = {
  slotitem: 2, // mst_id is mst slotitem id.
  kaku_coin: 5 // mst_is is item id.
} as const
export type ApiItemUseMst = (typeof ApiItemUseMst)[keyof typeof ApiItemUseMst]

export interface ApiItemUse {
  readonly api_caution_flag: number
  readonly api_flag: number
  readonly api_getitem: (ApiItemUseGetitem | null)[]
}

interface ApiItemUseGetitem {
  readonly api_usemst: ApiItemUseMst
  readonly api_mst_id: number
  readonly api_getcount: number
  readonly api_slotitem: ApiSlotitem
}

export interface ApiPayItem {
  readonly api_payitem_id: string
  readonly api_type: number
  readonly api_name: string
  readonly api_description: string
  readonly api_price: number
  readonly api_count: number
}

export interface ApiUnsetSlot {
  readonly api_slottype23: number[]
  readonly api_slottype1: number[]
}

export interface UpdateData {
  readonly api: KcsApi.Api
  readonly body: string
}

// set friendly request
interface ApisSetFriendlyRequestParam {
  readonly api_verno: string
  readonly api_request_flag: string // 0:支援不要 1: 友軍要請
  readonly api_request_type: string // 0:通常 1:強友軍
}

// req air corps set plane
interface ApiAirCorpsSetPlaneParam {
  readonly api_verno: string
  readonly api_area_id: string
  readonly api_base_id: string
  readonly api_squadron_id: string
  readonly api_item_id: string
}

interface ApiAirCorpsSetPlane {
  readonly api_distance: ApiDistance
  readonly api_plane_info: ApiPlaneInfo[]
  readonly api_after_bauxite?: number
}

// req air corps set action
interface ApiAirCorpsSetActionParam {
  readonly api_verno: string
  readonly api_area_id: string
  readonly api_base_id: string
  readonly api_action_kind: string
}

// req airbase supply param
interface ApiAirBaseCorpsSupplyParam {
  readonly api_verno: string
  readonly api_area_id: string
  readonly api_base_id: string
  readonly api_squadron_id: string // 1%2C2%2C3%2C4
}

// req airbase supply
interface ApiAirBaseCorpsSupply {
  readonly api_after_fuel: number
  readonly api_after_bauxite: number
  readonly api_distance: ApiDistance
  readonly api_plane_info: ApiPlaneInfo[]
}

type ApiBattleMap = ApiMapStart | ApiMapNext

// api data
export interface ApiData {
  readonly api_mst_ship: MstShip[]
  readonly api_mst_slotitem_equiptype: MstSlotitemEquiptype[]
  readonly api_mst_equip_exslot: number[]
  readonly api_mst_equip_exslot_ship: MstEquipExslotShip[]
  readonly api_mst_stype: MstStype[]
  readonly api_mst_slotitem: MstSlotitem[]
  readonly api_mst_furnituregraph: MstFurnituregraph[]
  readonly api_mst_useitem: MstUseitem[]
  readonly api_mst_payitem: MstPayitem[]
  readonly api_mst_item_shop?: MstItemShop
  readonly api_mst_maparea: MstMaparea[]
  readonly api_mst_mapinfo: MstMapinfo[]
  readonly api_mst_mapbgm: MstMapbgm[]
  readonly api_mst_mission: MstMission[]
  readonly api_mst_const?: MstConst
  readonly api_mst_shipupgrade: MstShipupgrade[]
  readonly api_mst_bgm: MstBgm[]
  readonly api_mst_equip_ship: MstEquipShip[]
  readonly api_mst_furniture: MstFurniture[]
  readonly api_mst_shipgraph: MstShipgraph[]
  readonly api_material: ApiMaterial[]
  readonly api_air_base: ApiAirBase[]
  readonly api_basic: ApiBasic
  readonly api_deck: ApiDeck[]
  readonly api_deck_port: ApiDeckPort[]
  readonly api_extra_supply?: number[]
  readonly api_furniture: ApiFurniture[]
  readonly api_kdock: ApiKDock[]
  readonly api_ndock: ApiNDock[]
  readonly api_log: ApiLog[]
  readonly api_oss_setting?: ApiOssSetting
  readonly api_ship: ApiShip[]
  readonly api_slot_item: ApiSlotitem[]
  readonly api_useitem: ApiUseItem[]
  readonly api_unsetslot?: ApiUnsetSlot
  readonly api_questlist: ApiQuestList | null
  readonly api_mapinfo: ApiMapInfo[]
  readonly api_mission: ApiMission[]
  readonly api_event_object: ApiEventObject
  readonly api_war: ApiSortieConditionsApiWar
  readonly api_friendly_setting: ApiFriendlySetting
  readonly api_preset_deck: ApiPresetDeck
  readonly api_combined_flag: CombinedFlag
  readonly api_max_num: number // max number preset
  readonly api_p_bgm_id: number
  readonly api_parallel_quest_count: number
  readonly api_dest_ship_slot: number
  readonly api_c_flag: number
  readonly api_req_map: ApiBattleMap[]
  readonly api_remodel_slot_list: ApiRemodelSlotItem[]
  readonly api_position_id: number
  readonly api_skin_id: number
  readonly api_server_id: KcsApi.ApiServerId

  readonly api_practice_battle_result: ApiPracticeBattleResult | null
  api_remodel_slot_detail: ApiRemodelSlotlistDetail | null

  prv_battle_infos: PrvBattleInfo[]
  prv_battle_map_info: PrvBattleMapInfo | null
  prv_in_map: boolean
  //api_sortie_battleresult: ApiSortieBattleResult;
  //api_combined_battleresult: ApiCombinedBattleResult;
}

export const CombinedFlag = {
  none: 0,
  kidou: 1,
  suijyou: 2,
  yusou: 3
} as const
export type CombinedFlag = (typeof CombinedFlag)[keyof typeof CombinedFlag]

export interface ApiCList {
  readonly api_no: number
  readonly api_state: number
  readonly api_progress_flag: number
  readonly api_c_flag: number
}

export interface ApiQuestList {
  readonly api_count: number
  readonly api_completed_kind: number
  readonly api_list: ApiQuest[]
  readonly api_exec_count: number
  readonly api_c_list?: ApiCList[]
  readonly api_exec_type: number
}

export const EmptyApiQuestList = (): ApiQuestList => {
  return {
    api_count: 0,
    api_completed_kind: 0,
    api_list: [],
    api_exec_count: 0,
    api_exec_type: 0
  }
}

export interface ApiQuestListWithParam extends ApiQuestList {
  readonly api_tab_id: ApiQuestListParamTabId
}

export const ApiQuestListParamTabId = {
  all: 0,
  in_progress: 9,
  daily: 1,
  weekly: 2,
  monthly: 3,
  once: 4,
  others: 5,
} as const 
export type ApiQuestListParamTabId = (typeof ApiQuestListParamTabId)[keyof typeof ApiQuestListParamTabId]

export interface ApiQuestListParam {
  readonly api_verno: string
  readonly api_tab_id: string; // ApiQuestListParamTabId
}

export interface ApiQuestStartParam {
  readonly api_verno: string
  readonly api_quest_id: string
}

export interface ApiQuestStopParam {
  readonly api_verno: string
  readonly api_quest_id: string
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
  kakutyou2: 9,
  kakutyou3: 10,
  kousyou2: 11
} as const
export type ApiQuestCategory = (typeof ApiQuestCategory)[keyof typeof ApiQuestCategory]

export const ApiQuestType = {
  daily: 1,
  weekly: 2,
  monthly: 3,
  single: 4,
  quarterly: 5
} as const
export type ApiQuestType = (typeof ApiQuestType)[keyof typeof ApiQuestType]
export const ApiQuestLabelTypeYearLy = 100 as const

export const ApiQuestState = {
  not_started: 1,
  in_progress: 2,
  completed: 3
} as const
export type ApiQuestState = (typeof ApiQuestState)[keyof typeof ApiQuestState]

export const ApiProgressFlag = {
  zero: 0,
  fifty: 1,
  eighty: 2
} as const
export type ApiProgressFlag = (typeof ApiProgressFlag)[keyof typeof ApiProgressFlag]

// 選択報酬
export interface ApiSelectReward {
  readonly api_no: number
  readonly api_kind: number
  readonly api_mst_id: number
  readonly api_count: number
}

export interface ApiQuest {
  readonly api_no: number
  readonly api_category: ApiQuestCategory
  readonly api_type: ApiQuestType
  readonly api_label_type: number
  readonly api_state: ApiQuestState
  readonly api_title: string
  readonly api_detail: string
  readonly api_voice_id: number
  readonly api_select_rewards?: ApiSelectReward[]
  readonly api_get_material: [number, number, number, number] // 燃料, 弾薬, 鋼材, ボーキ
  readonly api_bonus_flag: number
  readonly api_progress_flag: ApiProgressFlag
  readonly api_invalid_flag: number
}

// interface req member get incentive
//interface ApiGetIncentive {
//  readonly api_count: number
//}

// res require info
// interface ApiRequireInfo {
//   readonly api_basic: ApiBasic
//   readonly api_slot_item: ApiSlotitem[]
//   readonly api_kdock: ApiKDock[]
//   readonly api_useitem: ApiUseItem[]
//   readonly api_furniture: ApiFurniture[]
//   readonly api_extra_supply: number[]
//   readonly api_oss_setting: ApiOssSetting
//   readonly api_skin_id: number
// }

// res ship3
interface ApiShip3 {
  readonly api_ship_data: ApiShip[]
  readonly api_deck_data: ApiDeckPort[]
  readonly api_slot_data: number[][]
}

// req kaisou slotset
interface ApiKaisouSlotsetParam {
  readonly api_verno: string
  readonly api_id: string
  readonly api_item_id: string
  readonly api_slot_idx: string
}

// kaisou oepn exsplot
interface ApiOpenExSlotParam {
  readonly api_verno: string
  readonly api_id: string
}

// req kaisou unsetslot all
interface ApiKaisouUnsetslotAllParam {
  readonly api_verno: string
  readonly api_id: string
}

// req change slot exchange index
interface ApiChangeSlotExchangeIndex {
  readonly api_ship_data: ApiShip
}

// req hensei change index
interface ApiHenseiChangeParam {
  readonly api_id: string
  readonly api_ship_idx: string
  readonly api_ship_id: string // -1: unset -2: all clear
}

// req hokyu charge
interface ApiHokyuCharge {
  readonly api_ship: ApiShip[]
  readonly api_material: number[]
  readonly api_use_bou: number
}

// res getship
interface ApiGetShip {
  readonly api_id: number
  readonly api_ship_id: number
  readonly api_kdock: ApiKDock[]
  readonly api_ship: ApiShip
  readonly api_slotitem?: ApiSlotitem[]
}

// req
interface ApiSlotitemLockParam {
  readonly api_slotitem_id: string
}

// res api_req_kaisou/lock
interface ApiSlotitemLock {
  readonly api_locked: number
}

// req create item param
interface ApiCreateItemParam {
  readonly api_verno: string
  readonly api_item1: string
  readonly api_item2: string
  readonly api_item3: string
  readonly api_item4: string
  readonly api_multiple_flag: string
}

// req create item
export interface ApiCreateItem {
  // 0: failed
  // 1: succeeded
  readonly api_create_flag: number
  readonly api_material: number[]
  // 0: 燃料  id: 1
  // 1: 弾薬  id: 2
  // 2: 鋼材  id: 3
  // 3: ボーキサイト  id: 4
  // 4: 高速建造材  id: 5
  // 5: 高速修復材  id: 6
  // 6: 開発資材  id: 7
  // 7: 改修資材  id: 8
  readonly api_get_items: ApiSlotitem[]
  readonly api_unset_items: null | any
}

export interface ApiCreateItemWithParam extends ApiCreateItem {
  readonly items: number[]
}

// req hensei change index
interface ApiDestroyItem2Param {
  readonly api_slotitem_ids: string
}

// req create ship
interface ApiCreateShipParam {
  readonly api_verno: string
  readonly api_kdock_id: string
  readonly api_large_flag?: string
  readonly api_item1: string // fual
  readonly api_item2: string // ammo
  readonly api_item3: string // steel
  readonly api_item4: string // bux
  readonly api_item5: string // dev material
  readonly api_highspeed: string
}

// create ship param
export interface ApiCreateShipWithParam {
  readonly api_kdock_id: number
  readonly api_ship_id: number
  readonly api_large_flag: number
  readonly api_highspeed: number
  readonly api_items: number[] // 0: fual 1: ammo 2: steel 3: bux 4: dev material
}

// res destory item2
interface ApiDestroyItem2 {
  // 0: 燃料  id: 1
  // 1: 弾薬  id: 2
  // 2: 鋼材  id: 3
  // 3: ボーキサイト  id: 4
  readonly api_get_material: number[]
}

//
export interface ApiDestroyItem2WithParam extends ApiDestroyItem2 {
  readonly destroy_slotitems: ApiSlotitem[]
}

// req destroy ship req
interface ApiDestroyShipParam {
  readonly api_verno: string
  readonly api_ship_id: string
  readonly api_slot_dest_flag: string
}

// req destroy ship
interface ApiDestroyShip {
  readonly api_material: number[]
}

//
export interface ApiDestroyShipWithParam extends ApiDestroyShip {
  readonly ship_ids: number[]
}

// req powerup param
interface ApiPowerUpParam {
  readonly api_verno: string
  readonly api_id_items: string
  readonly api_slot_dest_flag: string
}

// powerup flag
export const ApiPowerupFlag = {
  failed: 0,
  succeeded: 1
} as const
export type ApiPowerupFlag = (typeof ApiPowerupFlag)[keyof typeof ApiPowerupFlag]

// req powerup
export interface ApiPowerUp {
  readonly api_powerup_flag: ApiPowerupFlag
  readonly api_ship: ApiShip
  readonly api_deck?: ApiDeckPort[]
}

//
export interface ApiPowerUpWothParam {
  readonly use_ships: MstShip[]
  readonly api_data: ApiPowerUp
}

// req slot deprive
interface ApiSlotDeprive {
  readonly api_ship_data: {
    readonly api_unset_ship: ApiShip
    readonly api_set_ship: ApiShip
  }
  readonly api_unset_list: {
    readonly api_type3No?: number
    readonly api_slot_list: number[]
  }
}

// req slot deprive param
// interface ApiSlotDepriveParam {
//   readonly api_verno: string
//   readonly api_unset_idx: string
//   readonly api_set_slot_kind: string
//   readonly api_unset_slot_kind: string
//   readonly api_unset_ship: string
//   readonly api_set_idx: string
//   readonly api_set_ship: string
// }

// req remodeling
// interface ApiRemodelingParam {
//   readonly api_verno: string
//   readonly api_id: string
// }

// req marrige param
// interface ApiMarrigeParam {
//   readonly api_verno: string
//   readonly api_id: string
// }

// req marrige
interface ApiMarrige extends ApiShip {}

export const ApiItemBonusType = {
  material: 1, // 資材 api_item:入手資材
  use_item1: 3, // アイテム api_item:アイテム
  ship: 11, // 艦船 api_item:入手艦船
  slotitem: 12, // 装備 api_item:入手装備
  use_item2: 13, // 豆 api_item:入手item
  kagu: 14, // 家具 api_item:入手家具 
  change: 15, // 交換 api_item:交換前後情報
  senka: 18 // 戦果 api_count:戦果 api_item設定なし
} as const
export type ApiItemBonusType = (typeof ApiItemBonusType)[keyof typeof ApiItemBonusType]

//type 1
export interface ApiItemBonusMaterial {
  readonly api_id: ApiMaterialId // material id
  readonly api_name: string // material name
}

//type 3, 13
export interface ApiItemBonusUseItem {
  readonly api_id: ApiItemId // material id
  readonly api_name: string // material name
}

// type 11
export interface ApiItemBonusShip {
  readonly api_id: number // mst ship id
  readonly api_name: string // ship name
  readonly api_getmes: string // ship get message
}

// type 12
export interface ApiItemBonusSlotitem {
  readonly api_id: number // mst slotitem id
  readonly api_name: string // slotitem name
  readonly api_slotitem_level?: number
}

// type 14
export interface ApiItemBonusKagu {
  readonly api_id: number // mst furniture id
  readonly api_name: string // furniture name
}

// type 15
export interface ApiItemBonusChange {
  readonly api_id_from: number
  readonly api_id_to: number
  readonly api_message: string
}

export interface ApiItemBonus {
  readonly api_type: ApiItemBonusType
  readonly api_count: number
  readonly api_item?: 
    ApiItemBonusMaterial | 
    ApiItemBonusShip |
    ApiItemBonusSlotitem | 
    ApiItemBonusUseItem | 
    ApiItemBonusKagu | 
    ApiItemBonusChange
}

// remodel slot list
interface ApiRemodelSlotItem {
  readonly api_id: number
  readonly api_slot_id: number
  readonly api_req_fuel: number
  readonly api_req_bull: number
  readonly api_req_steel: number
  readonly api_req_bauxite: number
  readonly api_req_buildkit: number
  readonly api_req_remodelkit: number
  readonly api_req_slot_id: number
  readonly api_req_slot_num: number
}

// api kousyou remodel slotlist detail
interface ApiRemodelSlotlistDetailParam {
  readonly api_verno: string
  readonly api_id: string
  readonly api_slot_id: string
}

interface ApiRemodelSlotlistDetail {
  api_req_buildkit: number
  api_req_remodelkit: number
  api_certain_buildkit: number
  api_certain_remodelkit: number
  api_req_slot_id: number
  api_req_slot_num: number
  api_req_useitem_id?: number
  api_req_useitem_num?: number
  api_change_flag: number
}

// api req kousyou remodel slot param
interface ApiRemodelSlotParam {
  readonly api_verno: string
  readonly api_id: string
  readonly api_slot_id: string
  readonly api_certain_flag: string //0: 確実化なし 1: 確実化
}
//
interface ApiRemodelSlot {
  readonly api_remodel_flag: number // 0: failed 1: succeeded
  readonly api_remodel_id: number[] // 0: before slotitem id 1: after slotitem id
  readonly api_after_material: number[]
  readonly api_voice_ship_id: number
  readonly api_voice_id: number
  readonly api_after_slot?: ApiSlotitem
  readonly api_use_slot_id?: number[] // remove apim ids
}

export interface ApiRemodelSlotWithParam extends ApiRemodelSlot {
  readonly api_level: number
  readonly api_certain_flag: number
}

export interface ApiMission {
  readonly api_mission_id: ApiMissionId
  readonly api_state: ApiMissionState
}

export const ApiMissionId = {
  なし: 0,
  練習航海: 1,
  長距離練習航海: 2,
  警備任務: 3,
  対潜警戒任務: 4,
  海上護衛任務: 5,
  防空射撃演習: 6,
  観艦式予行: 7,
  観艦式: 8,
  タンカー護衛任務: 9,
  強行偵察任務: 10,
  ボーキサイト輸送任務: 11,
  資源輸送任務: 12,
  鼠輸送作戦: 13,
  包囲陸戦隊撤収作戦: 14,
  囮機動部隊支援作戦: 15,
  艦隊決戦援護作戦: 16,
  敵地偵察作戦: 17,
  航空機輸送作戦: 18,
  北号作戦: 19,
  潜水艦哨戒任務: 20,
  北方鼠輸送作戦: 21,
  艦隊演習: 22,
  航空戦艦運用演習: 23,
  北方航路海上護衛: 24,
  通商破壊作戦: 25,
  敵母港空襲作戦: 26,
  潜水艦通商破壊作戦: 27,
  西方海域封鎖作戦: 28,
  潜水艦派遣演習: 29,
  潜水艦派遣作戦: 30,
  海外艦との接触: 31,
  遠洋練習航海: 32,
  前衛支援任務_南方: 33,
  決戦支援任務_南方: 34,
  MO作戦: 35,
  水上機基地建設: 36,
  東京急行: 37,
  東京急行弐: 38,
  遠洋潜水艦作戦: 39,
  水上機前線輸送: 40,
  ブルネイ泊地沖哨戒: 41,
  ミ船団護衛一号船団: 42,
  ミ船団護衛二号船団: 43,
  航空装備輸送任務: 44,
  ボーキサイト船団護衛: 45,
  南西海域戦闘哨戒: 46,
  兵站強化任務: 100,
  海峡警備行動: 101,
  長時間対潜警戒: 102,
  南西方面連絡線哨戒: 103,
  小笠原沖哨戒線: 104,
  小笠原沖戦闘哨戒: 105,
  南西方面航空偵察作戦: 110,
  敵泊地強襲反撃作戦: 111,
  南西諸島離島哨戒作戦: 112,
  南西諸島離島防衛作戦: 113,
  南西諸島捜索撃滅戦: 114,
  精鋭水雷戦隊夜襲: 115,
  西方海域偵察作戦: 131,
  西方潜水艦作戦: 132,
  欧州方面友軍との接触: 133,
  ラバウル方面艦隊進出: 141,
  強行鼠輸送作戦: 142,
} as const
export type ApiMissionId = (typeof ApiMissionId)[keyof typeof ApiMissionId]

export const ApiMissionState = {
  new: 0,
  not_clear: 1,
  cleared: 2
} as const
export type ApiMissionState = (typeof ApiMissionState)[keyof typeof ApiMissionState]

export const ApiMissionStateIndex = {
  state: 0, //value 0 : not mission 1: missioning 2: retrun 3: stopped
  mission_id: 1,
  time: 2
} as const
export type ApiMissionStateIndex = (typeof ApiMissionStateIndex)[keyof typeof ApiMissionStateIndex]

export const ApiMissionClearResult = {
  failed: 0,
  succees: 1,
  great_success: 2
} as const
export type ApiMissionClearResult = (typeof ApiMissionClearResult)[keyof typeof ApiMissionClearResult]

// req mission result
export interface ApiMissionResult {
  api_ship_id: number[]
  api_clear_result: ApiMissionClearResult
  api_get_exp: number
  api_member_lv: string
  api_member_exp: number
  api_get_ship_exp: number[]
  api_get_exp_lvup: Array<number[]>
  api_maparea_name: string
  api_detail: string
  api_quest_name: string
  api_quest_level: number
  api_get_material: number[]
  api_useitem_flag: ApiItemId[]
  api_get_item1?: ApiGetItem
  api_get_item2?: ApiGetItem
}

export interface ApiGetItem {
  api_useitem_id: ApiItemId
  api_useitem_name: string
  api_useitem_count: number
}

//
export interface ApiMissionList {
  readonly api_list_items: ApiMission[]
  readonly api_limit_time: number[]
}

export const EmptyApiMissionList = (): ApiMissionList => {
  return {
    api_list_items: [],
    api_limit_time: []
  }
}

// req mission return instruction
interface ApiMissionReturnInstructionParam {
  readonly api_verno: string
  readonly api_deck_id: string
}

interface ApiMissionRetrunInstruction {
  readonly api_mission: number[]
}

// clear item get param
interface ApiClearItemGet {
  // 0: 燃料  id: 1
  // 1: 弾薬  id: 2
  // 2: 鋼材  id: 3
  // 3: ボーキサイト  id: 4
  readonly api_material?: number[]
  readonly api_bounus_count?: number
  readonly api_bounus?: ApiItemBonus[]
}

//
interface ApiClearItemGetParam {
  readonly api_verno: string
  readonly api_quest_id: string
}

export interface ApiClearItemGetWithParam extends ApiClearItemGet {
  readonly api_quest_id: number
}

export interface ApiAirBaseExpandedInfo {
  readonly api_area_id: number;
  readonly api_maintenance_level: number;
}

// get member mapinfo
export interface ApiMapInfoList {
  readonly api_map_info: ApiMapInfo[]
  readonly api_air_base: ApiAirBase[]
  readonly api_air_base_expanded_info: ApiAirBaseExpandedInfo[];
}

export const EmptyApiMapInfoList = (): ApiMapInfoList => {
  return {
    api_map_info: [],
    api_air_base: [],
    api_air_base_expanded_info: []
  }
}

export const ApiGaugeType = {
  counter: 1,
  event: 2,
  yusou: 3
} as const
export type ApiGaugeType = (typeof ApiGaugeType)[keyof typeof ApiGaugeType]

export interface ApiMapInfo {
  readonly api_id: number
  readonly api_cleared: number
  readonly api_gauge_type?: ApiGaugeType
  readonly api_gauge_num?: number
  readonly api_defeat_count?: number
  readonly api_required_defeat_count?: number
  readonly api_air_base_decks?: number
  readonly api_eventmap?: ApiMapInfoEventmap
  readonly api_sally_flag?: number[]
}

export interface ApiMapInfoEventmap {
  readonly api_now_maphp: number
  readonly api_max_maphp: number
  readonly api_state: number
  readonly api_selected_rank: MapLv // 4: 甲 3: 乙 2: 丙 1: 丁
}

export interface ApiAirBase {
  readonly api_area_id: number
  readonly api_rid: number
  readonly api_name: string
  readonly api_distance: ApiDistance
  readonly api_action_kind: AirBaseActionKind // 0:待機 1: 出撃 2:防空 3:退避 4:休息
  readonly api_plane_info: ApiPlaneInfo[]
}

export const AirBaseActionKind = {
  taiki: 0,
  syutugeki: 1,
  bouku: 2,
  taihi: 3,
  kyuusoku: 4
} as const
export type AirBaseActionKind = (typeof AirBaseActionKind)[keyof typeof AirBaseActionKind]

export interface ApiDistance {
  readonly api_base: number
  readonly api_bonus: number
}

export interface ApiPlaneInfo {
  readonly api_squadron_id: number
  readonly api_state: number // 1: active 2: changing
  readonly api_slotid: number
  readonly api_count?: number
  readonly api_max_count?: number
  readonly api_cond?: number
}

const planeinfoIndex = (planeinfos: ApiPlaneInfo[], squadron_id: number): number => {
  return planeinfos.findIndex((planeinfo) => planeinfo.api_squadron_id === squadron_id)
}

interface ApiShipLockParam {
  readonly api_ship_id: string
}

// req hensei combined
interface ApiCombinedParam {
  readonly api_verno: string
  readonly api_combined_type: string // 0: nocimbined 1: kidou 2: suijyou 3: yusou
}

interface ApiCombined {
  readonly api_combined: number // 0: nocimbined, 1: combined
}

// get member ship deck
interface ApiShipDeck {
  readonly api_ship_data: ApiShip[]
  readonly api_deck_data: ApiDeckPort[]
}

// req member update deckname
interface ApiUpdateDeckNameParam {
  readonly api_verno: string
  readonly api_deck_id: string
  readonly api_name: string
  readonly api_name_id: string
}

// req nyukyo start param
interface ApiNyukyoStartParam {
  readonly api_verno: string
  readonly api_highspeed: string
  readonly api_ndock_id: string
  readonly api_ship_id: string
}

// req nyukyo speedchange
interface ApiNyukyoSpeedChangeParam {
  readonly api_verno: string
  readonly api_ndock_id: string
}

// req map select eventmap rank
interface ApiSelectEventmapRankParam {
  readonly api_verno: string
  readonly api_maparea_id: string
  readonly api_map_no: string
  readonly api_rank: string
}

// req map select eventmap rank
export interface ApiSelectEventmapRank {
  api_maphp: APIMapHp
  api_sally_flag: number[]
}

export interface APIMapHp {
  readonly api_now_maphp: number
  readonly api_max_maphp: number
  readonly api_gauge_type: number
  readonly api_gauge_num: number
}

// req map start param
interface ApiMapStartParam {
  readonly api_verno: string
  readonly api_maparea_id: string
  readonly api_mapinfo_no: string
  readonly api_deck_id: string
  readonly api_serial_cid: string
}

// api map start callback param
export interface ApiMapStartReqRes {
  readonly req: ApiMapStartParam
  readonly res: ApiMapStart
}

// req map start
export interface ApiCellData {
  readonly api_id: number
  readonly api_no: number
  readonly api_color_no: ApiCellColorNo | number
  readonly api_passed: number
}

//
export const ApiCellColorNo = {
  start: 0,
  material: 2,
  uzusio: 3,
  battle: 4,
  boss: 5,
  air_search_material: 9
} as const
export type ApiCellColorNo = (typeof ApiCellColorNo)[keyof typeof ApiCellColorNo]

//
export const ApiAirSearchResult = {
  failed: 0,
  success: 1,
  great_success: 2
} as const
export type ApiAirSearchResult = (typeof ApiAirSearchResult)[keyof typeof ApiAirSearchResult]

interface ApiAirSearch {
  readonly api_plane_type: number
  readonly api_result: ApiAirSearchResult
}

export const ApiEventId = {
  initpos: 0,
  noevent: 1,
  getMaterial: 2,
  uzusio: 3,
  sortieBattle: 4,
  bossBattle: 5,
  imagination: 6,
  airBattleOrAirSsearch: 7,
  eoMaterialGet: 8, // 1-6 goal
  landingPoint: 9,
  anchorage: 10,
} as const
export type ApiEventId = (typeof ApiEventId)[keyof typeof ApiEventId]

export const ApiEventKind = {
  nobattle: 0,
  normalBattle: 1,
  nightBattle: 2,
  nightMidnightBattle: 3,
  airBattle: 4,
  combinedBattle: 5,
  longRangeAirBattle: 6,
  nightMidnightCombinedBattle: 7,
  radarGuidedFire: 8,
} as const
export type ApiEventKind = (typeof ApiEventKind)[keyof typeof ApiEventKind]

export interface ApiHappening {
  readonly api_type: number
  readonly api_count: number
  readonly api_usemst: number
  readonly api_mst_id: number
  readonly api_icon_id: number
  readonly api_dentan: number
}

export interface ApiEDeckInfo {
  readonly api_kind: number
  readonly api_ship_ids: number[]
}

export interface ApiMap {
  readonly api_rashin_flg: number
  readonly api_rashin_id: number
  readonly api_maparea_id: number
  readonly api_mapinfo_no: number
  readonly api_no: number
  readonly api_color_no: number
  readonly api_event_id: ApiEventId
  readonly api_event_kind: ApiEventKind
  readonly api_next: number
  readonly api_bosscell_no: number
  readonly api_bosscomp: number
  readonly api_airsearch: ApiAirSearch
  readonly api_e_deck_info?: ApiEDeckInfo[]
  readonly api_happening?: ApiHappening
  readonly api_cell_flavor?: ApiCellFlavor
  readonly api_eventmap?: ApiEventmap
  // caption ApiItemGet[] | ApiItemGet;
  readonly api_itemget?: ApiItemGet[]
  readonly api_itemget_eo_comment?: ApiItemGetEo
  readonly api_limit_state?: number
}

export interface ApiEDeckInfo {
  readonly api_kind: number
  readonly api_ship_ids: number[]
}

export interface ApiCellFlavor {
  api_type: number
  api_message: string
}

export interface ApiEventmap {
  api_max_maphp: number
  api_now_maphp: number
  api_dmg: number
}

export interface ApiMapStart extends ApiMap {
  readonly api_cell_data: ApiCellData[]
  readonly api_from_no: number
}

export interface ApiMapNext extends ApiMap {
  readonly api_comment_kind: number
  readonly api_production_kind: number
  readonly api_get_eo_rate?: number
  readonly api_itemget_eo_result?: ApiItemGetEo
}

export const ApiItemGetUseMst = {
  material: 4,
  useitem: 5 // プレゼント箱など
} as const
export type ApiItemGetUseMst = (typeof ApiItemGetUseMst)[keyof typeof ApiItemGetUseMst]

export const ApiItemGetItemId = {
  fual: 1, // 燃料
  ammo: 2, // 弾薬
  steel: 3, // 鋼材
  buxite: 4, // ボーキサイト
  fastBuild: 5, // 高速建造材
  fastRepair: 6, // 高速修復材
  buildKit: 7 // 開発資材
  //remodelKit = 8, // 改修資材
} as const
export type ApiItemGetItemId = (typeof ApiItemGetItemId)[keyof typeof ApiItemGetItemId]

export interface ApiItemGetBase {
  readonly api_usemst: ApiItemGetUseMst
  readonly api_id: ApiItemGetItemId | ApiItemId
  readonly api_getcount: number
}

export interface ApiItemGet extends ApiItemGetBase {
  readonly api_name: string
  readonly api_icon_id: number
}

export interface ApiItemGetEo extends ApiItemGetBase {}

export interface PrvBattleMapInfo {
  maparea_id: number
  mapinfo_no: number
  mapLv: MapLv
  deck_id: number
  uuid: string
  start: boolean
  escape_indexs: number[] // 1起算 1～6 第一艦隊 7~12 第二艦隊
  tow_indexs: number[] // 1起算 1～6 第一艦隊 7~12 第二艦隊
}

export const ApiFormation = {
  tanjyuu: 1, // 単縦陣
  fukujyuu: 2, // 複縦陣
  rinkei: 3, // 輪形陣
  teikei: 4, // 梯形陣
  tanou: 5, // 単横陣
  keikai: 6, // 警戒陣
  combined_dai1_keikai: 11, // 第一警戒航行序列(対潜警戒)
  combined_dai2_zenpou_keikai: 12, // 第二警戒航行序列(前方警戒)
  combined_dai3_rinkei: 13, // 第三警戒航行序列(輪形陣)
  combined_dai4_sentou: 14 // 第四警戒航行序列(戦闘隊形)
} as const
export type ApiFormation = (typeof ApiFormation)[keyof typeof ApiFormation]

export const ApiTactics = {
  doukou: 1, // 同航戦
  hankou: 2, // 反航戦
  t_yuuri: 3, // T字有利
  t_furi: 4 // T字不利
} as const
export type ApiTactics = (typeof ApiTactics)[keyof typeof ApiTactics]

export const BattleType = {
  nobattle: 0, // no battle
  midday: 1, // sortie battle
  midnight: 2, // sortie night battle
  sp_midnight: 3, // sortie night battle
  air: 4, // airbattle
  ld_air: 5, // ld airbattle
  combined_ec: 6, // combined ec_battle
  combined_each: 7, // combined each_battle
  combined_ec_midnight: 8, // combined ec midnight
  combined: 9, // combined
  combined_ld_air: 10 // combined ld airbattle
} as const
export type BattleType = (typeof BattleType)[keyof typeof BattleType]

// ボスフレーバーテキスト
export interface ApiFlavorInfo {
  readonly api_boss_ship_id: string
  readonly api_type: string
  readonly api_voice_id: string
  readonly api_class_name: string
  readonly api_ship_name: string
  readonly api_message: string
  readonly api_pos_x: string
  readonly api_pos_y: string
  readonly api_data: string
}

// battle
export type ApiFormations = [ApiFormation, ApiFormation, ApiTactics] // 味方,敵,交戦形態
export interface ApiBattleBase {
  readonly api_deck_id: number
  readonly api_formation: ApiFormations
  readonly api_f_nowhps: number[]
  readonly api_f_maxhps: number[]
  readonly api_fParam: number[][]
  readonly api_ship_ke: number[]
  readonly api_ship_lv: number[]
  readonly api_e_nowhps: number[]
  readonly api_e_maxhps: number[]
  readonly api_eSlot: number[][]
  readonly api_eParam: number[][]
  readonly api_flavor_info?: ApiFlavorInfo[]
  readonly api_smoke_type?: number
  readonly api_balloon_cell?: number
  readonly api_atoll_cell?: number
  readonly api_m1?: number
  readonly api_m2?: number
}

export interface ApiBattleNormal extends ApiBattleBase {
  readonly api_midnight_flag: number
  readonly api_xal01?: number
  readonly api_search: number[]
  readonly api_stage_flag: number[]
  readonly api_kouku: ApiKouku
}

export interface ApiSupportAirAtack {
  readonly api_deck_id: number
  readonly api_ship_id: number[]
  readonly api_undressing_flag: number[]
  readonly api_stage_flag: number[]
  readonly api_plane_from: number[][]
  readonly api_stage1: ApiSupportStage1
  readonly api_stage2: ApiSupportStage2
  readonly api_stage3: ApiSupportStage3
}

export interface ApiSupportStage1 {
  readonly api_f_count: number
  readonly api_f_lostcount: number
  readonly api_e_count: number
  readonly api_e_lostcount: number
}

export interface ApiSupportStage2 {
  readonly api_f_count: number
  readonly api_f_lostcount: number
}

export interface ApiSupportStage3 {
  readonly api_erai_flag: number[]
  readonly api_ebak_flag: number[]
  readonly api_ecl_flag: number[]
  readonly api_edam: number[]
}

export interface ApiSupportHourai {
  readonly api_deck_id: number
  readonly api_ship_id: number[]
  readonly api_undressing_flag: number[]
  readonly api_cl_list: number[]
  readonly api_damage: number[]
}

export interface ApiSupportInfo {
  readonly api_support_airatack: ApiSupportAirAtack | null
  readonly api_support_hourai: ApiSupportHourai | null
}

export interface ApiBattle extends ApiBattleNormal {
  readonly api_air_base_attack: ApiAirBaseAttack[] | undefined
  readonly api_support_flag: number
  readonly api_support_info: ApiSupportInfo | null
  readonly api_opening_taisen_flag: number
  readonly api_opening_taisen: ApiHougeki | null
  readonly api_opening_flag: number
  readonly api_opening_atack: ApiRaigeki | null
  readonly api_hourai_flag: number[]
  // ここはオブジェクト順序が攻撃順の可能性がある
  readonly api_hougeki1: ApiHougeki | null
  readonly api_hougeki2: ApiHougeki | null
  readonly api_hougeki3: ApiHougeki | null
  readonly api_raigeki: ApiRaigeki | null
}

export interface ApiSortieBattle extends ApiBattle {}

export interface ApiSortieAirBattle extends ApiBattleNormal {
  readonly api_support_flag: number
  readonly api_support_info: ApiSupportInfo | null
  readonly api_stage_flag2: number[]
  readonly api_kouku2: ApiKouku
}

export interface ApiSortieLdAirBattle extends ApiBattleNormal {}

// normal vs combined battle
export interface ApiNormalVsCombinedBattle extends ApiBattle {
  readonly api_ship_ke_combined: number[]
  readonly api_ship_lv_combined: number[]
  readonly api_e_nowhps_combined: number[]
  readonly api_e_maxhps_combined: number[]
  readonly api_eSlot_combined: number[][]
  readonly api_eParam_combined: number[][]
}

// combined vs normal battle
export interface ApiCombinedVsNormalBattle extends ApiBattle {
  readonly api_f_nowhps_combined: number[]
  readonly api_f_maxhps_combined: number[]
  readonly api_fParam_combined: number[][]
}

// combined combined battle
export interface ApiCombinedVsCombinedBattle extends ApiBattle {
  readonly api_f_nowhps_combined: number[]
  readonly api_f_maxhps_combined: number[]
  readonly api_fParam_combined: number[][]

  readonly api_ship_ke_combined: number[]
  readonly api_ship_lv_combined: number[]
  readonly api_e_nowhps_combined: number[]
  readonly api_e_maxhps_combined: number[]
  readonly api_eSlot_combined: number[][]
  readonly api_eParam_combined: number[][]
}

// friendly battle info
export interface ApiFriendlyBattle {
  readonly api_flare_pos: number[]
  readonly api_hougeki: ApiFriendlyHougeki
}

export interface ApiFriendlyHougeki {
  readonly api_at_eflag: number[]
  readonly api_at_list: number[]
  readonly api_n_mother_list: number[]
  readonly api_df_list: number[][]
  readonly api_si_list: number[][]
  readonly api_cl_list: number[][]
  readonly api_sp_list: number[]
  readonly api_damage: number[][]
}

export interface ApiFriendlyInfo {
  readonly api_production_type: number
  readonly api_ship_id: number[]
  readonly api_ship_lv: number[]
  readonly api_nowhps: number[]
  readonly api_maxhps: number[]
  readonly api_Slot: number[][]
  readonly api_Param: number[][]
  readonly api_voice_id: number[]
  readonly api_voice_p_no: number[]
}

// night battle
export interface ApiMidnightBattle extends ApiBattleBase {
  readonly api_touch_plane: number[]
  readonly api_flare_pos: number[]
  readonly api_hougeki: ApiHougekiMidnight
  readonly api_friendly_info?: ApiFriendlyInfo
  readonly api_friendly_battle?: ApiFriendlyBattle
}

// night sp battle
export interface ApiMidnightSpBattle extends ApiMidnightBattle {
  readonly api_n_support_flag: number
  readonly api_n_support_info: ApiSupportInfo
}

export interface ApiEcMidnightBattle extends ApiMidnightBattle {
  readonly api_ship_ke_combined: number[]
  readonly api_ship_lv_combined: number[]
  readonly api_e_nowhps_combined: number[]
  readonly api_e_maxhps_combined: number[]
  readonly api_eSlot_combined: number[][]
  readonly api_eParam_combined: number[][]
  readonly api_active_deck: number[]
}

// battle info
export type ApiMiddayBattleType =
  | ApiSortieBattle
  | ApiSortieAirBattle
  | ApiSortieLdAirBattle
  | ApiCombinedVsNormalBattle
  | ApiNormalVsCombinedBattle
  | ApiCombinedVsCombinedBattle

export type ApiMidnightBattleType = ApiMidnightBattle | ApiMidnightSpBattle | ApiEcMidnightBattle

export type ApiBattleStartType = ApiMiddayBattleType | ApiMidnightBattleType

export interface PrvBattleInfo {
  readonly uuid: string
  readonly map: ApiMap
  readonly mapLv: MapLv
  readonly cell_no: number
  readonly isBoss: boolean
  readonly battleType: BattleType
  readonly eventId: ApiEventId
  readonly eventKind: number
  readonly midday: ApiMiddayBattleType | null
  readonly midnight: ApiMidnightBattleType | null
  readonly result: ApiBattleResult | null
  readonly middayJson: string | null
  readonly midnightJson: string | null
}

export interface ApiSquadronPlane {
  readonly api_mst_id: number
  readonly api_count: number
}

type numberarrayORnull = number[] | null
export interface ApiAirBaseAttack {
  readonly api_base_id: number
  readonly api_stage_flag: number[]
  readonly api_plane_from: numberarrayORnull[]
  readonly api_squadron_plane: ApiSquadronPlane[]
  readonly api_stage1: ApiStage1
  readonly api_stage2: ApiStage2 | null
  readonly api_stage3: ApiStage3 | null
  readonly api_stage3_combined?: ApiStage3
}

export interface ApiAirFire {
  readonly api_idx: number
  readonly api_kind: number
  readonly api_use_items: number[]
}

interface ApiKouku {
  readonly api_plane_from: numberarrayORnull[]
  readonly api_stage1: ApiStage1
  readonly api_stage2: ApiStage2
  readonly api_stage3: ApiStage3
  readonly api_stage3_combined?: ApiStage3
}

type numberORstring = number | string
export interface ApiHougeki {
  readonly api_at_eflag: number[]
  readonly api_at_list: number[]
  readonly api_at_type: number[]
  readonly api_df_list: number[][]
  readonly api_si_list: numberORstring[][] // カットイン装備ID
  readonly api_cl_list: number[][]
  readonly api_damage: number[][]
}

export interface ApiHougekiMidnight {
  readonly api_at_eflag: number[]
  readonly api_at_list: number[]
  readonly api_n_mother_list: number[]
  readonly api_df_list: number[][]
  readonly api_si_list: numberORstring[][]
  readonly api_cl_list: number[][]
  readonly api_sp_list: number[]
  readonly api_damage: number[][]
}

export const ApiDispSeiku = {
  kinkou: 0, // 制空均衡,
  kakuho: 1, // 制空権確保
  yuusei: 2, // 航空優勢,
  ressei: 3, // 航空劣勢
  sousitu: 4 // 制空権喪失
} as const
export type ApiDispSeiku = (typeof ApiDispSeiku)[keyof typeof ApiDispSeiku]

interface ApiStage1 {
  readonly api_f_count: number
  readonly api_f_lostcount: number
  readonly api_e_count: number
  readonly api_e_lostcount: number
  readonly api_disp_seiku: ApiDispSeiku
  readonly api_touch_plane: number[]
}

interface ApiStage2 {
  readonly api_f_count: number
  readonly api_f_lostcount: number
  readonly api_e_count: number
  readonly api_e_lostcount: number
}

interface ApiStage3 {
  readonly api_frai_flag: number[] | null
  readonly api_erai_flag: number[] | null
  readonly api_fbak_flag: number[] | null
  readonly api_ebak_flag: number[] | null
  readonly api_fcl_flag: number[] | null
  readonly api_ecl_flag: number[] | null
  readonly api_fdam: number[] | null
  readonly api_edam: number[] | null
}

export interface ApiRaigeki {
  readonly api_frai: number[]
  readonly api_fcl: number[]
  readonly api_fdam: number[]
  readonly api_fydam: number[]
  readonly api_erai: number[]
  readonly api_ecl: number[]
  readonly api_edam: number[]
  readonly api_eydam: number[]
}

// req practice param
interface ApiPracticeBattleParam {
  readonly api_verno: string
  readonly api_deck_id: string
  readonly api_formation_id: string
  readonly api_enemy_id: string
}

// req practice battle result
export interface ApiPracticeBattleResult {
  readonly api_ship_id: number[]
  readonly api_win_rank: WinRank
  readonly api_get_exp: number
  readonly api_mvp: number
  readonly api_member_lv: number
  readonly api_member_exp: number
  readonly api_get_base_exp: number
  readonly api_get_ship_exp: number[]
  readonly api_get_exp_lvup: number[][]
  readonly api_enemy_info: ApiEnemyInfo
}

export interface PrvPracticeBattleInfo {
  readonly deck_id: number
  readonly result: ApiPracticeBattleResult
}

export type WinRank = 'S' | 'A' | 'B' | 'C' | 'D' | 'E'
export type WinRankDrop = Extract<WinRank, 'S' | 'A' | 'B'>

//
export interface ApiLandingHp {
  readonly api_max_hp: number
  readonly api_now_hp: number
  readonly api_sub_value: number
}

//
export interface ApiBattleResult {
  readonly api_ship_id: number[]
  readonly api_win_rank: WinRank
  readonly api_get_exp: number
  readonly api_mvp: number
  readonly api_member_lv: number
  readonly api_member_exp: number
  readonly api_get_base_exp: number
  readonly api_get_ship_exp: number[]
  readonly api_get_exp_lvup: number[][]
  readonly api_dests: number
  readonly api_destsf: number
  readonly api_quest_name: string
  readonly api_quest_level: number
  readonly api_enemy_info: ApiEnemyInfo
  readonly api_first_clear: number // 0:cleared 1 is first clear(EO含む)
  readonly api_mapcell_incentive?: number
  readonly api_get_flag: number[]
  readonly api_get_ship: ApiBattleGetShip
  readonly api_get_eventflag: number // 0: noevent
  readonly api_get_exmap_rate: number // EOクリア時戦果
  readonly api_get_exmap_useitem_id: number // EOクリア時Item
  readonly api_landing_hp?: ApiLandingHp // 輸送ゲージ情報
  readonly api_escape_flag: number
  readonly api_escape?:
    | null
    | undefined
    | {
        readonly api_escape_idx: number[] // 退避艦 index
        readonly api_tow_idx: number[] // 護衛艦 index
      }
  readonly api_get_useitem?: ApiGetItem
  readonly api_m1?: number
  readonly api_m2?: number
}

// sortie battle result
export interface ApiSortieBattleResult extends ApiBattleResult {}

// const InvalidApiEnemyInfo = (): ApiEnemyInfo => ({
//   api_level: '',
//   api_rank: '',
//   api_deck_name: ''
// })

// const InvalidApiBattleGetShip = (): ApiBattleGetShip => ({
//   api_ship_id: 0,
//   api_ship_type: '',
//   api_ship_name: '',
//   api_ship_getmes: ''
// })

/*
  api callback
*/
type CallbackApiPort = (arg: any) => void
type callbackApiHenseiChange = () => void
type CallbackApiPracticeBattle = (arg: PrvPracticeBattleInfo) => void
type CallbackApiSortieBattle = (arg: PrvBattleInfo) => void
type CallbackApiCombinedBattle = (arg: PrvBattleInfo) => void
type CallbackApiCreateItem = (arg: ApiCreateItemWithParam) => void
type CallbackApiDestroyItem2 = (arg: ApiDestroyItem2WithParam) => void
type CallbackApiCreateShip = (arg: ApiCreateShipWithParam) => void
type CallbackApiDestroyShip = (arg: ApiDestroyShipWithParam) => void
type CallbackApiRemodelSlot = (arg: ApiRemodelSlotWithParam) => void
type CallbackApiMapStart = (arg: ApiMapStartReqRes) => void
type CallbackApiMapNext = (arg: ApiMapNext) => void
type CallbackApiMissionList = (arg: ApiMissionList) => void
type CallbackApiMissionStart = () => void
type CallbackApiMissionResult = (arg: ApiMissionResult) => void
type CallbackApiMapInfo = (arg: ApiMapInfoList) => void
type CallbackApiQuestList = (arg: ApiQuestListWithParam) => void
type CallbackApiQuestStart = (api_quest_id: number) => void
type CallbackApiQuestStop = (api_quest_id: number) => void
type CallbackApiClearItemGet = (arg: ApiClearItemGetWithParam) => void
type CallbackApiNyukyoStart = () => void
type CallbackApiHokyuCharge = (arg: ApiHokyuCharge) => void
type CallbackApiPowerUp = (arg: ApiPowerUpWothParam) => void
type CallbackApiGetMemberUseItem = (arg: ApiUseItem[]) => void
type CallbackMaterialUpdated = () => void
type CallbackShipCountUpdated = () => void
type CallbackSlotitemCountUpdated = () => void
type CallbackBasicUpdated = () => void
type CallbackBattleStart = (arg: ApiBattleStartType) => void

type CallbackArg =
  | undefined
  | PrvPracticeBattleInfo
  | ApiBattleStartType
  | PrvBattleInfo
  | ApiCreateItemWithParam
  | ApiDestroyItem2WithParam
  | ApiCreateShipWithParam
  | ApiDestroyShipWithParam
  | ApiRemodelSlot
  | ApiMapStartReqRes
  | ApiMapNext
  | ApiMissionList
  | ApiMissionResult
  | ApiMapInfoList
  | ApiQuestListWithParam
  | ApiClearItemGetWithParam
  | ApiHokyuCharge
  | ApiPowerUpWothParam
  | ApiUseItem[]
  | number

type CallbackFunc =
  | CallbackApiPort
  | callbackApiHenseiChange
  | CallbackApiPracticeBattle
  | CallbackApiSortieBattle
  | CallbackApiCombinedBattle
  | CallbackApiCreateItem
  | CallbackApiCreateShip
  | CallbackApiDestroyShip
  | CallbackApiRemodelSlot
  | CallbackApiMapStart
  | CallbackApiMapNext
  | CallbackApiMissionList
  | CallbackApiMissionStart
  | CallbackApiMissionResult
  | CallbackApiMapInfo
  | CallbackApiQuestList
  | CallbackApiQuestStart
  | CallbackApiQuestStop
  | CallbackApiClearItemGet
  | CallbackApiNyukyoStart
  | CallbackApiHokyuCharge
  | CallbackApiPowerUp
  | CallbackMaterialUpdated
  | CallbackShipCountUpdated
  | CallbackSlotitemCountUpdated
  | CallbackBasicUpdated
  | CallbackBattleStart

type Calltype =
  | typeof KcsApi.Api.PORT_PORT
  | typeof KcsApi.Api.REQ_HENSEI_CHANGE
  | typeof KcsApi.Api.REQ_PRACTICE_BATTLE_RESULT
  | typeof KcsApi.Api.REQ_SORTIE_BATTLERESULT
  | typeof KcsApi.Api.REQ_COMBINED_BATTLE_BATTLERESULT
  | typeof KcsApi.Api.REQ_KOUSYOU_CREATEITEM
  | typeof KcsApi.Api.REQ_KOUSYOU_DESTROYITEM2
  | typeof KcsApi.Api.REQ_KOUSYOU_CREATESHIP
  | typeof KcsApi.Api.REQ_KOUSYOU_DESTROYSHIP
  | typeof KcsApi.Api.REQ_KOUSYOU_REMODEL_SLOT
  | typeof KcsApi.Api.REQ_MAP_START
  | typeof KcsApi.Api.REQ_MAP_NEXT
  | typeof KcsApi.Api.GET_MEMBER_MISSION
  | typeof KcsApi.Api.REQ_MISSION_START
  | typeof KcsApi.Api.REQ_MISSION_RESULT
  | typeof KcsApi.Api.GET_MEMBER_MAPINFO
  | typeof KcsApi.Api.GET_MEMBER_REQUIRE_INFO
  | typeof KcsApi.Api.GET_MEMBER_QUESTLIST
  | typeof KcsApi.Api.REQ_QUEST_START
  | typeof KcsApi.Api.REQ_QUEST_STOP
  | typeof KcsApi.Api.REQ_QUEST_CLEARITEMGET
  | typeof KcsApi.Api.REQ_NYUKYO_START
  | typeof KcsApi.Api.REQ_HOKYU_CHARGE
  | typeof KcsApi.Api.REQ_KAISOU_POWERUP
  | typeof KcsApi.Api.GET_MEMBER_USEITEM
  | 'material-updated'
  | 'ship-count-updated'
  | 'slotitem-count-updated'
  | 'basic-updated'
  | 'battle-start'

type Callback =
  | [typeof KcsApi.Api.PORT_PORT, CallbackApiPort]
  | [typeof KcsApi.Api.REQ_HENSEI_CHANGE, callbackApiHenseiChange]
  | [typeof KcsApi.Api.REQ_PRACTICE_BATTLE_RESULT, CallbackApiPracticeBattle]
  | [typeof KcsApi.Api.REQ_SORTIE_BATTLERESULT, CallbackApiSortieBattle]
  | [typeof KcsApi.Api.REQ_COMBINED_BATTLE_BATTLERESULT, CallbackApiCombinedBattle]
  | [typeof KcsApi.Api.REQ_KOUSYOU_CREATEITEM, CallbackApiCreateItem]
  | [typeof KcsApi.Api.REQ_KOUSYOU_DESTROYITEM2, CallbackApiDestroyItem2]
  | [typeof KcsApi.Api.REQ_KOUSYOU_CREATESHIP, CallbackApiCreateShip]
  | [typeof KcsApi.Api.REQ_KOUSYOU_DESTROYSHIP, CallbackApiDestroyShip]
  | [typeof KcsApi.Api.REQ_KOUSYOU_REMODEL_SLOT, CallbackApiRemodelSlot]
  | [typeof KcsApi.Api.REQ_MAP_START, CallbackApiMapStart]
  | [typeof KcsApi.Api.REQ_MAP_NEXT, CallbackApiMapNext]
  | [typeof KcsApi.Api.GET_MEMBER_MISSION, CallbackApiMissionList]
  | [typeof KcsApi.Api.REQ_MISSION_START, CallbackApiMissionStart]
  | [typeof KcsApi.Api.REQ_MISSION_RESULT, CallbackApiMissionResult]
  | [typeof KcsApi.Api.GET_MEMBER_MAPINFO, CallbackApiMapInfo]
  | [typeof KcsApi.Api.GET_MEMBER_REQUIRE_INFO, CallbackBasicUpdated]
  | [typeof KcsApi.Api.GET_MEMBER_QUESTLIST, CallbackApiQuestList]
  | [typeof KcsApi.Api.REQ_QUEST_START, CallbackApiQuestStart]
  | [typeof KcsApi.Api.REQ_QUEST_STOP, CallbackApiQuestStop]
  | [typeof KcsApi.Api.REQ_QUEST_CLEARITEMGET, CallbackApiClearItemGet]
  | [typeof KcsApi.Api.REQ_NYUKYO_START, CallbackApiNyukyoStart]
  | [typeof KcsApi.Api.REQ_HOKYU_CHARGE, CallbackApiHokyuCharge]
  | [typeof KcsApi.Api.REQ_KAISOU_POWERUP, CallbackApiPowerUp]
  | [typeof KcsApi.Api.GET_MEMBER_USEITEM, CallbackApiGetMemberUseItem]
  | ['material-updated', CallbackMaterialUpdated]
  | ['ship-count-updated', CallbackShipCountUpdated]
  | ['slotitem-count-updated', CallbackSlotitemCountUpdated]
  | ['basic-updated', CallbackBasicUpdated]
  | ['battle-start', CallbackBattleStart]

interface CallbackInfo {
  readonly id: number
  readonly cb: [Calltype, CallbackFunc]
}

export class ApiCallback {
  private static callback_id: number = 1
  private static callbacks: CallbackInfo[] = []

  public static set(cb: Callback): number {
    const id = ApiCallback.callback_id++
    ApiCallback.callbacks.push({ id: id, cb: cb })
    return id
  }

  public static unset(id: number): void {
    const cbs = ApiCallback.callbacks
    const idx = cbs.findIndex((cb) => cb.id === id)
    if (idx !== -1) {
      cbs.splice(idx, 1)
    }
  }

  public static call(calltype: Calltype, arg: CallbackArg): void {
    const cbs = ApiCallback.callbacks
    const cb = cbs.filter((cb) => cb.cb[0] === calltype)
    cb.forEach((cb) => cb.cb[1](arg))
  }
}

class RMap {
  private static rmap: {
    [ship_id: number]: number[]
  } = {}

  public static find(ship_id: number): number[] | undefined {
    return RMap.rmap[ship_id]
  }

  public static set(ship_id: number, rmap: number[]): void {
    RMap.rmap[ship_id] = rmap
  }
}

const qsParse = <T>(query: string): T => {
  return qs.parse(query) as unknown as T
}

interface Req {
  [api: string]: string | undefined
}

class SvDataPrivate {
  public static arg_create_ship: ApiCreateShipWithParam | undefined
  public static arg_remodel_slotitem: ApiSlotitem | undefined
}

export interface SvDataRaw {
  mstDataOk: boolean
  shipDataOk: boolean
  slotitemDataOk: boolean
  gimmickFlagDetected: boolean
  mapChangeDetected: boolean
  gimmickFlagDetectedClear: boolean
  apiData: ApiData
  apiReq: Req
}

export function createSvDataRaw() : SvDataRaw {
  return {
    mstDataOk: false,
    shipDataOk: false,
    slotitemDataOk: false,
    gimmickFlagDetected: false,
    mapChangeDetected: false,
    gimmickFlagDetectedClear: false,
    apiData: {
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
      api_server_id: KcsApi.ApiServerId.unknown,

      api_preset_deck: InvalidApiPresetDeck(),
      api_practice_battle_result: null,
      api_remodel_slot_detail: null,

      prv_battle_infos: [],
      prv_battle_map_info: null,
      prv_in_map: false
    },
    apiReq: {},
  }
}

export class SvData {
  public static readonly header = 'svdata='

  private svdata: SvDataRaw
  private materialUpdated = false
  private shipCountUpdated = false
  private slotitemCountUpdated = false
  private mstShipCache: Map<number, MstShip | null> = new Map()
  private mstSlotitemCache: Map<number, MstSlotitem | null> = new Map()

  public get svdataRaw(): SvDataRaw {
    return this.svdata
  }

  public constructor(svdata: SvDataRaw) {
    this.svdata = svdata
  }

  public get prvBattleMapInfo(): PrvBattleMapInfo | null {
    return this.svdata.apiData.prv_battle_map_info
  }

  public update(api: KcsApi.Api, data: string): void {
    try {
      this.materialUpdated = false
      this.shipCountUpdated = false
      this.slotitemCountUpdated = false

      // parse json
      if (data.startsWith(SvData.header)) {
        data = data.substring(SvData.header.length)
      }
      const data_root: ApiDataRoot = JSON.parse(data)

      // check result
      if (!data_root.api_result) {
        throw new Error('api result ng')
      }

      // api data
      const api_data = data_root.api_data

      // update data
      switch (api) {
        case KcsApi.Api.API_WORLD_GET_ID:
          this.worldGetId(api_data)
          break

        case KcsApi.Api.START2_GET_OPTION_SETTING:
          break

        case KcsApi.Api.REQ_MEMBER_GET_INCENTIVE:
          break

        case KcsApi.Api.START2_GET_DATA:
          this.startGetData2(api_data)
          break

        case KcsApi.Api.PORT_PORT:
          this.portPort(api_data)
          break

        case KcsApi.Api.GET_MEMBER_MISSION:
          this.getMemberMission(api_data as ApiMissionList)
          break

        case KcsApi.Api.REQ_MEMBER_ITEMUSE:
          this.getMemberItemUse(api_data as ApiItemUse)
          break

        case KcsApi.Api.GET_MEMBER_USEITEM:
          this.getMemberUseItem(api_data as ApiUseItem[])
          break

        case KcsApi.Api.GET_MEMBER_PAYITEM:
          break

        case KcsApi.Api.GET_MEMBER_BASIC:
          this.getMemberBasic(api_data as ApiBasic)
          break

        case KcsApi.Api.REQ_MISSION_RETURN_INSTRUCTION:
          this.reqMissionReturnInstruction(api_data as ApiMissionRetrunInstruction)
          break

        case KcsApi.Api.REQ_MISSION_START:
          this.reqMissionStart()
          break

        case KcsApi.Api.REQ_MISSION_RESULT:
          this.reqMissionResult(api_data as ApiMissionResult)
          break

        case KcsApi.Api.GET_MEMBER_DECK:
          this.getMemberDock(api_data as ApiDeckPort[])
          break

        case KcsApi.Api.GET_MEMBER_FURNITURE:
          this.getMemberFurniture(api_data as ApiFurniture[])
          break

        case KcsApi.Api.REQ_MEMBER_UPDATEDECKNAME:
          this.reqMemberUpdateDeckName()
          break

        case KcsApi.Api.REQ_MEMBER_SET_FRIENDLY_REQUEST:
          this.reqMemberSetFriendlyRequest()
          break

        case KcsApi.Api.REQ_HENSEI_LOCK:
          this.reqHenseiLock()
          break

        case KcsApi.Api.REQ_HENSEI_COMBINED:
          this.reqHenseiCombined(api_data as ApiCombined)
          break

        case KcsApi.Api.REQ_HENSEI_CHANGE:
          this.reqHenseiChange()
          break

        case KcsApi.Api.REQ_HENSEI_PRESET_SELECT:
          this.reqHenseiPresetSelect(api_data as ApiPresetSelect)
          break

        case KcsApi.Api.REQ_KAISOU_LOCK:
          this.reqKaisouLock(api_data as ApiSlotitemLock)
          break

        case KcsApi.Api.REQ_KAISOU_POWERUP:
          this.reqKaisouPowerUp(api_data as ApiPowerUp)
          break

        case KcsApi.Api.REQ_KAISOU_SLOT_DEPRIVE:
          this.reqKaisouSlotDeprive(api_data as ApiSlotDeprive)
          break

        case KcsApi.Api.REQ_KAISOU_REMODELING:
          break

        case KcsApi.Api.REQ_KAISOU_MARRIGE:
          this.reqKaisouMarrige(api_data as ApiMarrige)
          break

        case KcsApi.Api.GET_MEMBER_REQUIRE_INFO:
          this.getMemberRequireInfo(api_data)
          break

        case KcsApi.Api.GET_MEMBER_QUESTLIST:
          this.getMemberQuestList(api_data)
          break

        case KcsApi.Api.REQ_QUEST_START:
          this.reqQuestStart()
          break

        case KcsApi.Api.REQ_QUEST_STOP:
          this.reqQuestStop()
          break

        case KcsApi.Api.GET_MEMBER_MAPINFO:
          this.getMemberMapInfo(api_data as ApiMapInfoList)
          break

        case KcsApi.Api.GET_MEMBER_MATERIAL:
          this.getMemberMaterial(api_data as ApiMaterial[])
          break

        case KcsApi.Api.GET_MEMBER_NDOCK:
          this.getMemberNDock(api_data as ApiNDock[])
          break

        case KcsApi.Api.GET_MEMBER_SHIP_DECK:
          this.getMemberShipDeck(api_data as ApiShipDeck)
          break

        case KcsApi.Api.REQ_KOUSYOU_GETSHIP:
          this.reqKousyouGetShip(api_data as ApiGetShip)
          break

        case KcsApi.Api.REQ_HOKYU_CHARGE:
          this.reqHokyuCharge(api_data as ApiHokyuCharge)
          break

        case KcsApi.Api.GET_MEMBER_KDOCK:
          this.getMemberKDock(api_data as ApiKDock[])
          break

        case KcsApi.Api.REQ_KOUSYOU_REMODEL_SLOTLIST:
          this.reqKousyouRemodelSlotList(api_data as ApiRemodelSlotItem[])
          break

        case KcsApi.Api.REQ_KOUSYOU_REMODEL_SLOTLIST_DETAIL:
          this.reqKousyouRemodelSlotlistDetail(api_data as ApiRemodelSlotlistDetail)
          break

        case KcsApi.Api.REQ_KOUSYOU_REMODEL_SLOT:
          this.reqKousyouRemodelSlot(api_data as ApiRemodelSlot)
          break

        case KcsApi.Api.REQ_KOUSYOU_CREATEITEM:
          this.reqKousyouCreateItem(api_data as ApiCreateItem)
          break

        case KcsApi.Api.REQ_KOUSYOU_DESTROYITEM2:
          this.reqKousyouDestroyItem2(api_data as ApiDestroyItem2)
          break

        case KcsApi.Api.REQ_KOUSYOU_CREATESHIP:
          this.reqKousyouCreateShip(api_data as ApiResponse)
          break

        case KcsApi.Api.REQ_KOUSYOU_DESTROYSHIP:
          this.reqKousyouDestroyShip(api_data as ApiDestroyShip)
          break

        case KcsApi.Api.GET_MEMBER_SHIP2:
          this.resGetMemberShip2(api_data as ApiShip[])
          break

        case KcsApi.Api.GET_MEMBER_SHIP3:
          this.resGetMemberShip3(api_data as ApiShip3)
          break

        case KcsApi.Api.REQ_KAISOU_SLOTSET:
          this.reqKaisouSlotset()
          break

        case KcsApi.Api.REQ_KAISOU_OPEN_EXSLOT:
          this.reqKaisouOpenExSlot()
          break

        case KcsApi.Api.REQ_KAISOU_UNSETSLOT_ALL:
          this.reqKaisouUnsetslotAll()
          break

        case KcsApi.Api.REQ_KAISOU_SLOT_EXCHANGE_INDEX:
          this.reqKaisouSlotExchangeIndex(api_data as ApiChangeSlotExchangeIndex)
          break

        case KcsApi.Api.REQ_QUEST_CLEARITEMGET:
          this.reqClearItemGet(api_data as ApiClearItemGet)
          break

        case KcsApi.Api.GET_MEMBER_SLOT_ITEM:
          this.getMemberSlotitem(api_data as ApiSlotitem[])
          break

        case KcsApi.Api.REQ_MAP_START:
          this.reqMapStart(api_data as ApiMapStart)
          break

        case KcsApi.Api.REQ_MAP_NEXT:
          this.reqMapNext(api_data as ApiMapNext)
          break

        case KcsApi.Api.REQ_MAP_SELECT_EVENTMAP_RANK:
          this.reqMapSelectEventmapRank(api_data as ApiSelectEventmapRank)
          break

        case KcsApi.Api.REQ_SORTIE_BATTLE:
          this.reqSortieBattle(api_data as ApiSortieBattle, data)
          break

        case KcsApi.Api.REQ_SORTIE_AIRBATTLE:
          this.reqSortieAirBattle(api_data as ApiSortieAirBattle, data)
          break

        case KcsApi.Api.REQ_SORTIE_LD_AIRBATTLE:
          this.reqSortieLdAirBattle(api_data as ApiSortieLdAirBattle, data)
          break

        case KcsApi.Api.REQ_BATTLE_MIDNIGHT_BATTLE:
          this.reqMidnightBattle(api_data as ApiMidnightBattle, data)
          break

        case KcsApi.Api.REQ_BATTLE_MIDNIGHT_SP_BATTLE:
          this.reqMidnightSpBattle(api_data as ApiMidnightSpBattle, data)
          break

        case KcsApi.Api.REQ_SORTIE_BATTLERESULT:
          this.reqSortieBattleResult(api_data as ApiSortieBattleResult)
          break

        case KcsApi.Api.REQ_PRACTICE_BATTLE:
          this.reqPracticeBattle()
          break

        case KcsApi.Api.REQ_PRACTICE_BATTLE_RESULT:
          this.reqPracticeBattleResult(api_data as ApiPracticeBattleResult)
          break

        case KcsApi.Api.REQ_COMBINED_BATTLE_BATTLE:
          this.reqCombinedCombinedBattle(api_data as ApiCombinedVsNormalBattle, data)
          break

        case KcsApi.Api.REQ_COMBINED_BATTLE_EACH_BATTLE:
          this.reqCombinedEachBattle(api_data as ApiCombinedVsCombinedBattle, data)
          break

        case KcsApi.Api.REQ_COMBINED_BATTLE_EC_BATTLE:
          this.reqCombinedEcBattle(api_data as ApiNormalVsCombinedBattle, data)
          break

        case KcsApi.Api.REQ_COMBINED_BATTLE_LD_AIRBATTLE:
          this.reqCombinedBattleLdAirBattle(api_data as ApiCombinedVsNormalBattle, data)
          break

        case KcsApi.Api.REQ_COMBINED_BATTLE_EC_MIDNIGHT_BATTLE:
          this.reqCombinedEcMidnightBattle(api_data as ApiEcMidnightBattle, data)
          break

        case KcsApi.Api.REQ_COMBINED_BATTLE_BATTLERESULT:
          this.reqCombinedBattleResult(api_data as ApiCombinedBattleResult)
          break

        case KcsApi.Api.REQ_COMBINED_BATTLE_GOBACK_PORT:
          this.reqCombinedBattleGobackPort()
          break

        case KcsApi.Api.REQ_NYUKYO_START:
          this.reqNyukyoStart()
          break

        case KcsApi.Api.REQ_NYUKYO_SPEEDCHANGE:
          this.reqNyukyoSpeedChange()
          break

        case KcsApi.Api.REQ_HENSEI_PRESET_REGISTER:
          this.reqHenseiPresetRegister(api_data as ApiPresetRegister)
          break

        case KcsApi.Api.REQ_HENSEI_PRESET_DELETE:
          this.reqHenseiPresetDelete()
          break

        case KcsApi.Api.GET_MEMBER_PRESET_DECK:
          this.getMemberPresetDeck(api_data as ApiPresetDeck)
          break

        case KcsApi.Api.SORTIE_CONDITIONS:
          this.getMemberSortieConditions(api_data as ApiSortieConditions)
          break

        case KcsApi.Api.REQ_AIR_CORPS_SET_ACTION:
          this.reqAirCorpsSetAction()
          break

        case KcsApi.Api.REQ_AIR_CORPS_SET_PLANE:
          this.reqAirCorpsSetPlane(api_data as ApiAirCorpsSetPlane)
          break

        case KcsApi.Api.REQ_AIR_CORPS_SUPPLY:
          this.reqAirCorpsSupply(api_data as ApiAirBaseCorpsSupply)
          break

        case KcsApi.Api.SET_OSS_CONDITION:
          break

        default:
          break
      }
    } catch (e) {
      console.log(e)
    }

    if (this.materialUpdated) {
      ApiCallback.call('material-updated', undefined)
    }
    if (this.shipCountUpdated) {
      ApiCallback.call('ship-count-updated', undefined)
    }
    if (this.slotitemCountUpdated) {
      ApiCallback.call('slotitem-count-updated', undefined)
    }
  }

  public get isMstDataOk() {
    return this.svdata.mstDataOk
  }

  public get isShipDataOk() {
    return this.svdata.shipDataOk
  }

  public get isSlotitemDataOk() {
    return this.svdata.slotitemDataOk
  }

  public setReq(api: KcsApi.Api, query: string): void {
    this.svdata.apiReq[api] = query
  }

  public getReq(api: KcsApi.Api): string | undefined {
    const value = this.svdata.apiReq[api]
    if (value) {
      this.svdata.apiReq[api] = undefined
    }
    return value
  }

  public get apiData(): ApiData {
    return this.svdata.apiData
  }

  public worldGetId(api_data: ApiWorldId): void {
    Object.assign(this.apiData, { api_server_id: api_data.api_world_id })
    console.log('server id:', this.apiData.api_server_id)
  }

  public get serverId(): KcsApi.ApiServerId {
    return this.apiData.api_server_id
  }

  public setServerId(server_id: number): void {
    Object.assign(this.apiData, { api_server_id: server_id })
    console.log('server id:', this.apiData.api_server_id)
  }

  private startGetData2(api_data: any): void {
    console.time('start2 data')
    assignSafeE(this.apiData, api_data)
    console.timeEnd('start2 data')
    this.svdata.mstDataOk = true
  }

  private portPort(api_data: any): void {
    // backup deck_port for mission check
    const api_deck_port = api_data.api_deck_port
    if (api_data.api_deck_port) {
      this.replaceDeckPort(api_data.api_deck_port as ApiDeckPort[])
      delete api_data.api_deck_port
    }

    // reset event object
    assignSafeE(this.apiData.api_event_object, InvalidApiEventObject())

    // update port data
    assignSafeE(this.apiData, api_data)
    api_data.api_deck_port = api_deck_port
    this.svdata.shipDataOk = true
    this.apiData.prv_in_map = false
    if (this.apiData.prv_battle_map_info) {
      replaceArray(this.apiData.prv_battle_map_info.escape_indexs, [])
      replaceArray(this.apiData.prv_battle_map_info.tow_indexs, [])
    }

    // check gimmick flag
    if (! this.svdata.gimmickFlagDetectedClear) {

      const flagCheck = this.apiData.api_event_object.api_m_flag > 0;
      const flag2Check = (this.apiData.api_event_object.api_m_flag2 ?? 0) > 0;
      const gimmickFlagDetected = (flagCheck || flag2Check)

      let isEventMap = false
      let mapChangeDetected = false;
      const lastBattle = this.lastBattle;
      if (lastBattle) {
        isEventMap = KcsUtil.isEventAreaId(lastBattle.map.api_maparea_id)
        const api_m1 = lastBattle.result?.api_m1 ?? 0;
        const api_m2 = lastBattle.result?.api_m2 ?? 0;
        mapChangeDetected = (api_m1 > 0 || api_m2 > 0)
      }

      // イベントマップの場合は両方表示
      // 通常海域はMAP変更を優先でどちらか表示
      if (isEventMap) {
        this.svdata.gimmickFlagDetected = gimmickFlagDetected
        this.svdata.mapChangeDetected = mapChangeDetected
      } else {
        if (mapChangeDetected) {
          this.svdata.mapChangeDetected = true
          this.svdata.gimmickFlagDetected = false
        } else if (gimmickFlagDetected) {
          this.svdata.gimmickFlagDetected = true
          this.svdata.mapChangeDetected = false
        } else {
          this.svdata.gimmickFlagDetected = false
          this.svdata.mapChangeDetected = false
        }
      }

      // clear if map start
      this.svdata.gimmickFlagDetectedClear = true
    }

    ApiCallback.call(KcsApi.Api.PORT_PORT, api_data)
  }

  private getMemberMission(api_data: ApiMissionList): void {
    assignSafeE(this.apiData.api_mission, api_data.api_list_items)
    ApiCallback.call(KcsApi.Api.GET_MEMBER_MISSION, api_data)
  }

  private getMemberItemUse(api_data: ApiItemUse): void {
    if (!Array.isArray(api_data.api_getitem)) {
      return
    }

    // 資材やアイテムは、この後全取得が行われる。
    // スロットアイテムは、追加する必要がある。
    api_data.api_getitem.forEach((getitem) => {
      if (getitem === null) {
        return
      }
      if (ApiItemUseMst.slotitem === getitem.api_usemst) {
        for (let i = 0; i < getitem.api_getcount; ++i) {
          this.apiData.api_slot_item.push(fixApiSlotitemMember(getitem.api_slotitem))
        }
      }
    })
  }

  private getMemberUseItem(api_data: ApiUseItem[]): void {
    replaceArray(this.apiData.api_useitem, api_data)
    ApiCallback.call(KcsApi.Api.GET_MEMBER_USEITEM, api_data)
  }

  private getMemberBasic(api_data: ApiBasic): void {
    Object.assign(this.apiData.api_basic, api_data)
    ApiCallback.call('basic-updated', undefined)
  }

  private reqMissionReturnInstruction(api_data: ApiMissionRetrunInstruction): void {
    const query = this.getReq(KcsApi.Api.REQ_MISSION_RETURN_INSTRUCTION)
    if (query) {
      const req: ApiMissionReturnInstructionParam = qsParse(query)
      const deck = this.deckPort(parseInt(req.api_deck_id))
      if (deck) {
        replaceArray(deck.api_mission, api_data.api_mission)
      }
    }
  }

  private reqMissionStart(): void {
    ApiCallback.call(KcsApi.Api.REQ_MISSION_START, undefined)
  }

  private reqMissionResult(api_data: ApiMissionResult): void {
    this.updateMaterial(api_data.api_get_material, true)
    const updateItem = (item: ApiGetItem | undefined, flags: number[], index: number): void => {
      if (item) {
        if (-1 === item.api_useitem_id) {
          // to itemid
          const itemId = flags[index] ?? -1
          switch (itemId) {
            case ApiItemId.build_kit:
              this.updateMaterialById(ApiMaterialId.BUILD_KIT, item.api_useitem_count, true)
              break
            case ApiItemId.fast_repair:
              this.updateMaterialById(ApiMaterialId.FAST_REPAIR, item.api_useitem_count, true)
              break
            case ApiItemId.fast_build:
              this.updateMaterialById(ApiMaterialId.FAST_BUILD, item.api_useitem_count, true)
              break
          }
        } else {
          // 改修素材
          if (ApiItemId.remodel_kit === item.api_useitem_id) {
            this.updateMaterialById(ApiMaterialId.REMODEL_KIT, item.api_useitem_count, true)
          } else {
            this.useitemAdd(item.api_useitem_id, item.api_useitem_count)
          }
        }
      }
    }
    updateItem(api_data.api_get_item1, api_data.api_useitem_flag, 0)
    updateItem(api_data.api_get_item2, api_data.api_useitem_flag, 1)

    ApiCallback.call(KcsApi.Api.REQ_MISSION_RESULT, api_data)
  }

  private getMemberDock(api_data: ApiDeckPort[]): void {
    this.replaceDeckPort(api_data)
  }

  private getMemberFurniture(api_data: ApiFurniture[]): void {
    replaceArray(this.apiData.api_furniture, api_data)
  }

  private reqMemberUpdateDeckName(): void {
    const query = this.getReq(KcsApi.Api.REQ_MEMBER_UPDATEDECKNAME)
    if (query) {
      const req: ApiUpdateDeckNameParam = qsParse(query)
      const deck = this.deckPort(parseInt(req.api_deck_id))
      if (deck) {
        //console.log(deck);
        Object.assign(deck, {
          api_name_id: req.api_name_id,
          api_name: req.api_name
        })
        //console.log(deck);
      }
    }
  }

  private reqMemberSetFriendlyRequest(): void {
    const query = this.getReq(KcsApi.Api.REQ_MEMBER_SET_FRIENDLY_REQUEST)
    if (query) {
      const req: ApisSetFriendlyRequestParam = qsParse(query)
      const api_request_flag = parseInt(req.api_request_flag)
      const api_request_type = parseInt(req.api_request_type)
      if (isFinite(api_request_flag) && isFinite(api_request_type)) {
        Object.assign(this.apiData.api_friendly_setting, { api_request_flag, api_request_type })
      }
    }
  }

  private reqHenseiLock(): void {
    const query = this.getReq(KcsApi.Api.REQ_HENSEI_LOCK)
    if (query) {
      const req: ApiShipLockParam = qsParse(query)
      const ship = this.ship(parseInt(req.api_ship_id))
      if (ship) {
        //console.log(ship);
        Object.assign(ship, { api_locked: ship.api_locked ? 0 : 1 })
        //console.log(ship);
      }
    }
  }

  private reqHenseiCombined(_api_data: ApiCombined) {
    const query = this.getReq(KcsApi.Api.REQ_HENSEI_COMBINED)
    if (query) {
      const req: ApiCombinedParam = qsParse(query)
      const api_combined_flag = parseInt(req.api_combined_type)
      if (isFinite(api_combined_flag)) {
        //console.log(req);
        Object.assign(this.apiData, { api_combined_flag })
      }
    }
  }

  private reqHenseiChange(): void {
    const query = this.getReq(KcsApi.Api.REQ_HENSEI_CHANGE)
    if (query) {
      const req: ApiHenseiChangeParam = qsParse(query)
      const deck_id = parseInt(req.api_id)
      const deckPort = this.deckPort(deck_id)
      const api_ship_idx = parseInt(req.api_ship_idx)
      const api_ship_id = parseInt(req.api_ship_id)
      if (deckPort && isFinite(api_ship_idx) && isFinite(api_ship_id)) {
        console.log('hensei change:', req)

        // all clear
        if (-2 === api_ship_id) {
          for (let i = 1; i < deckPort.api_ship.length; ++i) {
            deckPort.api_ship.splice(i, 1, -1)
          }
          console.log('all clear', deckPort.api_ship)
          ApiCallback.call(KcsApi.Api.REQ_HENSEI_CHANGE, undefined)
          return
        }

        // set -> empty
        if (-1 === api_ship_id) {
          deckPort.api_ship.splice(api_ship_idx, 1)
          deckPort.api_ship.push(-1)
          console.log('set -> empty', deckPort.api_ship)
          ApiCallback.call(KcsApi.Api.REQ_HENSEI_CHANGE, undefined)
          return
        }

        // empty -> set
        if (-1 === deckPort.api_ship[api_ship_idx]) {
          deckPort.api_ship.splice(api_ship_idx, 1, api_ship_id)
          // other deck
          this.deckPorts.forEach((el) => {
            if (el.api_id !== deck_id) {
              const found_idx = el.api_ship.indexOf(api_ship_id)
              console.log('empty -> set found_idx:', found_idx, el)
              if (found_idx >= 0) {
                el.api_ship.splice(found_idx, 1)
                el.api_ship.push(-1)
              }
              console.log('empty -> set after found_idx:', found_idx, el)
            }
          })
          console.log('empty -> set', deckPort.api_ship)
          ApiCallback.call(KcsApi.Api.REQ_HENSEI_CHANGE, undefined)
          return
        }

        // change in deck
        const shipFromIdx = deckPort.api_ship.indexOf(api_ship_id)
        if (shipFromIdx !== -1) {
          const shipTo = deckPort.api_ship[api_ship_idx]
          deckPort.api_ship.splice(api_ship_idx, 1, api_ship_id)
          deckPort.api_ship.splice(shipFromIdx, 1, shipTo)
          console.log(
            'change shipFromIdx:',
            shipFromIdx,
            ' api_ship_idx:',
            api_ship_idx,
            ' shipTo:',
            shipTo,
            ' req:',
            req
          )
          ApiCallback.call(KcsApi.Api.REQ_HENSEI_CHANGE, undefined)
          return
        }

        // change other deck
        const shipTo = deckPort.api_ship[api_ship_idx]
        deckPort.api_ship.splice(api_ship_idx, 1, api_ship_id)
        if (shipTo > 0) {
          this.deckPorts.forEach((el) => {
            if (el.api_id !== deck_id) {
              const found_idx = el.api_ship.indexOf(api_ship_id)
              console.log('change other deck found_idx:', found_idx, el)
              if (found_idx >= 0) {
                el.api_ship.splice(found_idx, 1, shipTo)
              }
              console.log('change other deck after found_idx:', found_idx, el)
            }
          })
        }
        console.log('default', deckPort.api_ship)
        ApiCallback.call(KcsApi.Api.REQ_HENSEI_CHANGE, undefined)
        return
      }
    }
  }

  private reqHenseiPresetSelect(api_data: ApiPresetSelect): void {
    const query = this.getReq(KcsApi.Api.REQ_HENSEI_PRESET_SELECT)
    const deckPort = this.deckPort(api_data.api_id)
    if (deckPort) {
      Object.assign(deckPort, api_data)
      replaceArray(deckPort.api_mission, api_data.api_mission)
      replaceArray(deckPort.api_ship, api_data.api_ship)
    }

    // update preset
    if (query) {
      const req: ApiPresetSelectParam = qsParse(query)
      const preset = this.presetDeckFromNo(parseInt(req.api_preset_no))
      if (preset) {
        replaceArray(preset.api_ship, api_data.api_ship)
      }
    }
  }

  private reqKaisouLock(api_data: ApiSlotitemLock): void {
    const query = this.getReq(KcsApi.Api.REQ_KAISOU_LOCK)
    if (query) {
      const req: ApiSlotitemLockParam = qsParse(query)
      const slotitem = this.slotitem(parseInt(req.api_slotitem_id))
      if (slotitem) {
        //ship.api_locked
        //console.log(slotitem);
        Object.assign(slotitem, Object.assign({}, api_data))
        //console.log(slotitem);
      }
    }
  }

  private reqKaisouPowerUp(api_data: ApiPowerUp): void {
    if (api_data.api_powerup_flag) {
      this.updateShip([api_data.api_ship])
      this.updateDeckPort(api_data.api_deck)

      const query = this.getReq(KcsApi.Api.REQ_KAISOU_POWERUP)
      if (query) {
        const req: ApiPowerUpParam = qsParse(query)
        const use_ships: MstShip[] = []
        if (req.api_id_items) {
          const ship_ids = req.api_id_items.split(',').map((v) => {
            return parseInt(v)
          })
          ship_ids.forEach((ship_id) => {
            const index = this.apiData.api_ship.findIndex((ship) => ship.api_id === ship_id)
            if (index !== -1) {
              const ship = this.apiData.api_ship[index]
              const mst = this.mstShip(ship.api_ship_id)
              if (mst) {
                use_ships.push(mst)
              }
              this.apiData.api_ship.splice(index, 1)
              this.shipCountUpdated = true
              if (req.api_slot_dest_flag === '1') {
                this.destroySlotitem(ship.api_slot)
                this.destroySlotitem([ship.api_slot_ex])
              }
            }
          })
          ApiCallback.call(KcsApi.Api.REQ_KAISOU_POWERUP, { use_ships, api_data })
        }
      }
    }
  }

  private reqKaisouSlotDeprive(api_data: ApiSlotDeprive): void {
    this.updateShip([api_data.api_ship_data.api_unset_ship, api_data.api_ship_data.api_set_ship])
  }

  private reqKaisouMarrige(api_data: ApiMarrige): void {
    this.updateShip([api_data])
    this.useitemAdd(ApiItemId.kekkonn_kakkokari, -1)
  }

  private reqHokyuCharge(api_data: ApiHokyuCharge): void {
    this.updateMaterial(api_data.api_material, false)
    this.updateShip(api_data.api_ship)
    ApiCallback.call(KcsApi.Api.REQ_HOKYU_CHARGE, api_data)
  }

  private getMemberRequireInfo(api_data: any): void {
    assignSafeE(this.apiData, api_data)
    this.svdata.slotitemDataOk = true
    ApiCallback.call(KcsApi.Api.GET_MEMBER_REQUIRE_INFO, undefined)
  }

  private getMemberQuestList(api_data: ApiQuestList): void {
    const query = this.getReq(KcsApi.Api.GET_MEMBER_QUESTLIST)
    let api_tab_id = -1;
    if (query) {
      const req: ApiQuestListParam = qsParse(query)
      api_tab_id = parseInt(req.api_tab_id)
    }
    // update questlist if all
    if (ApiQuestListParamTabId.all === api_tab_id) {
      if (!this.apiData.api_questlist) {
        Object.assign(this.apiData, { api_questlist: api_data })
      } else {
        assignSafeE(this.apiData.api_questlist, api_data)
      }
    }

    if (api_tab_id !== -1) {
      const arg: ApiQuestListWithParam = Object.assign({}, api_data, {
        api_tab_id: api_tab_id as ApiQuestListParamTabId
      })
      ApiCallback.call(KcsApi.Api.GET_MEMBER_QUESTLIST, arg)
    }
  }

  private reqQuestStart(): void {
    const query = this.getReq(KcsApi.Api.REQ_QUEST_START)
    if (query) {
      const req: ApiQuestStartParam = qsParse(query)
      const api_quest_id = parseInt(req.api_quest_id)
      const questlist = this.apiData.api_questlist
      if (questlist) {
        const quest = questlist.api_list.find((q) => q.api_no === api_quest_id)
        if (quest) {
          Object.assign(quest, { api_state: ApiQuestState.in_progress } )
        }
      }
      ApiCallback.call(KcsApi.Api.REQ_QUEST_START, api_quest_id)
    }
  }

  private reqQuestStop(): void {
    const query = this.getReq(KcsApi.Api.REQ_QUEST_STOP)
    if (query) {
      const req: ApiQuestStopParam = qsParse(query)
      const api_quest_id = parseInt(req.api_quest_id)
      const questlist = this.apiData.api_questlist
      if (questlist) {
        const quest = questlist.api_list.find((q) => q.api_no === api_quest_id)
        if (quest) {
          Object.assign(quest, { api_state: ApiQuestState.not_started })
        }
      }
      ApiCallback.call(KcsApi.Api.REQ_QUEST_STOP, api_quest_id)
    }
  }

  private getMemberMapInfo(api_data: ApiMapInfoList): void {
    replaceArray(this.apiData.api_mapinfo, api_data.api_map_info)
    replaceArraySafe(this.apiData.api_air_base, api_data.api_air_base)
    ApiCallback.call(KcsApi.Api.GET_MEMBER_MAPINFO, api_data)
  }

  private getMemberMaterial(api_data: ApiMaterial[]): void {
    api_data.forEach((m) => this.updateMaterialById(m.api_id, m.api_value, false))
  }

  private getMemberNDock(ndocks: ApiNDock[]) {
    replaceArray(this.apiData.api_ndock, ndocks)
  }

  private reqNyukyoStart(): void {
    const query = this.getReq(KcsApi.Api.REQ_NYUKYO_START)
    if (query) {
      const req: ApiNyukyoStartParam = qsParse(query)
      const ship = this.ship(parseInt(req.api_ship_id))
      if (ship) {
        const materials: number[] = [0, 0, 0, 0, 0, 0, 0, 0]
        materials[0] = -ship.api_ndock_item[0]
        materials[2] = -ship.api_ndock_item[1]
        if (req.api_highspeed === '1') {
          materials[5] = -1
          const update = { api_nowhp: ship.api_maxhp }
          if (ship.api_cond < 39) {
            Object.assign(update, { api_cond: 40 })
          }
          Object.assign(ship, update)
        }
        this.updateMaterial(materials, true)
      }
      ApiCallback.call(KcsApi.Api.REQ_NYUKYO_START, undefined)
    }
  }

  private reqNyukyoSpeedChange(): void {
    const query = this.getReq(KcsApi.Api.REQ_NYUKYO_SPEEDCHANGE)
    if (query) {
      const req: ApiNyukyoSpeedChangeParam = qsParse(query)
      const ndock = this.ndock(parseInt(req.api_ndock_id))
      if (ndock) {
        Object.assign(ndock, NDockEmpty())
      }
    }
  }

  private reqHenseiPresetRegister(api_data: ApiPresetRegister): void {
    //console.log(this.apiData.api_preset_deck);
    //console.log(this.apiData.api_preset_deck.api_deck[api_data.api_preset_no.toString()]);
    //console.log(api_data);
    Object.assign(
      this.apiData.api_preset_deck.api_deck[api_data.api_preset_no.toString()],
      api_data
    )
    replaceArray(
      this.apiData.api_preset_deck.api_deck[api_data.api_preset_no.toString()].api_ship,
      api_data.api_ship
    )
    //console.log(this.apiData.api_preset_deck.api_deck[api_data.api_preset_no.toString()]);
  }

  private reqHenseiPresetDelete(): void {
    const query = this.getReq(KcsApi.Api.REQ_HENSEI_PRESET_DELETE)
    if (query) {
      const req: ApiPresetDeleteParam = qsParse(query)
      const preset = this.presetDeckFromNo(parseInt(req.api_preset_no))
      if (preset) {
        //console.log('deleted:'+param.api_preset_no);
        Object.assign(preset, InvalidApiPresetDeck())
        replaceArray(preset.api_ship, [])
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
          data.api_deck[i.toString()] = InvalidApiPresetDeckInfo()
        }
      }
    }
    //console.trace(api_data);
    fix(api_data)
    Object.assign(this.apiData.api_preset_deck, api_data)
    //console.trace(this.apiData.api_preset_deck);
  }

  private getMemberSortieConditions(api_data: ApiSortieConditions): void {
    Object.assign(this.apiData.api_war, api_data.api_war)
  }

  private reqAirCorpsSetAction(): void {
    const query = this.getReq(KcsApi.Api.REQ_AIR_CORPS_SET_ACTION)
    if (query) {
      const req: ApiAirCorpsSetActionParam = qsParse(query)
      const conv = (s: string): number[] => {
        return s.split(',').map((v) => {
          return parseInt(v)
        })
      }
      const area_id = parseInt(req.api_area_id)
      const base_ids = conv(req.api_base_id)
      const action_kinds = conv(req.api_action_kind)
      if (base_ids.length === action_kinds.length) {
        for (let i = 0; i < base_ids.length; ++i) {
          const base_id = base_ids[i]
          const airbase = this.apiData.api_air_base.find((airbase) => {
            return airbase.api_area_id === area_id && airbase.api_rid === base_id
          })
          if (airbase) {
            Object.assign(airbase, { api_action_kind: action_kinds[i] })
          }
        }
      }
    }
  }

  private reqAirCorpsSetPlane(api_data: ApiAirCorpsSetPlane): void {
    const query = this.getReq(KcsApi.Api.REQ_AIR_CORPS_SET_PLANE)
    if (query) {
      if (api_data.api_after_bauxite) {
        this.updateMaterialById(ApiMaterialId.BUXITE, api_data.api_after_bauxite, false)
      }

      const req: ApiAirCorpsSetPlaneParam = qsParse(query)
      const area_id = parseInt(req.api_area_id)
      const base_id = parseInt(req.api_base_id)
      const airbase = this.airbaseFrom(area_id, base_id)
      if (airbase) {
        Object.assign(airbase.api_distance, api_data.api_distance)

        if (airbase.api_plane_info) {
          api_data.api_plane_info.forEach((planeinfo) => {
            const index = planeinfoIndex(airbase.api_plane_info, planeinfo.api_squadron_id)
            if (index !== -1) {
              airbase.api_plane_info.splice(index, 1, planeinfo)
            }
          })
        }
      }
    }
  }

  private reqAirCorpsSupply(api_data: ApiAirBaseCorpsSupply): void {
    const query = this.getReq(KcsApi.Api.REQ_AIR_CORPS_SUPPLY)
    if (query) {
      if (api_data.api_after_fuel) {
        this.updateMaterialById(ApiMaterialId.FUAL, api_data.api_after_fuel, false)
      }
      if (api_data.api_after_bauxite) {
        this.updateMaterialById(ApiMaterialId.BUXITE, api_data.api_after_bauxite, false)
      }

      const req: ApiAirBaseCorpsSupplyParam = qsParse(query)
      const area_id = parseInt(req.api_area_id)
      const base_id = parseInt(req.api_base_id)
      const airbase = this.airbaseFrom(area_id, base_id)
      if (airbase) {
        Object.assign(airbase.api_distance, api_data.api_distance)

        if (airbase.api_plane_info) {
          api_data.api_plane_info.forEach((planeinfo) => {
            const index = planeinfoIndex(airbase.api_plane_info, planeinfo.api_squadron_id)
            if (index !== -1) {
              airbase.api_plane_info.splice(index, 1, planeinfo)
            }
          })
        }
      }
    }
  }

  private getMemberShipDeck(api_data: ApiShipDeck): void {
    this.updateShip(api_data.api_ship_data)
    this.updateDeckPort(api_data.api_deck_data)
  }

  private reqKousyouGetShip(data: ApiGetShip): void {
    replaceArray(this.apiData.api_kdock, data.api_kdock)
    this.apiData.api_ship.push(data.api_ship)
    if (data.api_slotitem) {
      data.api_slotitem.forEach((slotitem) => {
        this.apiData.api_slot_item.push(fixApiSlotitemMember(slotitem))
      })
      this.slotitemCountUpdated = true
    }
    this.shipCountUpdated = true
  }

  private getMemberKDock(api_data: ApiKDock[]): void {
    replaceArray(this.apiData.api_kdock, api_data)

    if (SvDataPrivate.arg_create_ship) {
      const arg = SvDataPrivate.arg_create_ship
      const kdock = this.kdock(SvDataPrivate.arg_create_ship.api_kdock_id)
      if (kdock) {
        Object.assign(arg, { api_ship_id: kdock.api_created_ship_id })
        ApiCallback.call(KcsApi.Api.REQ_KOUSYOU_CREATESHIP, arg)
      }
      SvDataPrivate.arg_create_ship = undefined
    }
  }

  private reqKousyouRemodelSlotList(api_data: ApiRemodelSlotItem[]) {
    replaceArray(this.apiData.api_remodel_slot_list, api_data)
    SvDataPrivate.arg_remodel_slotitem = undefined
  }

  private reqKousyouRemodelSlotlistDetail(api_data: ApiRemodelSlotlistDetail): void {
    const query = this.getReq(KcsApi.Api.REQ_KOUSYOU_REMODEL_SLOTLIST_DETAIL)
    this.apiData.api_remodel_slot_detail = Object.assign({}, api_data)
    if (query) {
      const req: ApiRemodelSlotlistDetailParam = qsParse(query)
      const slotitem = this.slotitem(parseInt(req.api_slot_id))
      if (slotitem) {
        SvDataPrivate.arg_remodel_slotitem = Object.assign({}, slotitem)
      }
    }
  }

  private reqKousyouRemodelSlot(api_data: ApiRemodelSlot): void {
    const query = this.getReq(KcsApi.Api.REQ_KOUSYOU_REMODEL_SLOT)
    this.updateMaterial(api_data.api_after_material, false)
    if (api_data.api_use_slot_id) {
      api_data.api_use_slot_id.forEach((used) => {
        const index = this.apiData.api_slot_item.findIndex((slotitem) => slotitem.api_id === used)
        if (index !== -1) {
          this.apiData.api_slot_item.splice(index, 1)
          this.slotitemCountUpdated = true
        }
      })
    }

    //
    if (api_data.api_after_slot) {
      const slotitem = this.slotitem(api_data.api_after_slot.api_id)
      if (slotitem) {
        Object.assign(slotitem, api_data.api_after_slot)
      }
    }

    // use item
    if (api_data.api_remodel_flag === 1) {
      this.useitemAdd(
        this.apiData.api_remodel_slot_detail?.api_req_useitem_id,
        -1 * (this.apiData.api_remodel_slot_detail?.api_req_useitem_num ?? 0)
      )
    }

    if (query && SvDataPrivate.arg_remodel_slotitem) {
      const req: ApiRemodelSlotParam = qsParse(query)
      const api_certain_flag = parseInt(req.api_certain_flag)
      console.log('remodel 34', req, api_certain_flag, isFinite(api_certain_flag))
      if (isFinite(api_certain_flag)) {
        const arg: ApiRemodelSlotWithParam = Object.assign({}, api_data, {
          api_level: SvDataPrivate.arg_remodel_slotitem?.api_level ?? 0,
          api_certain_flag
        })
        ApiCallback.call(KcsApi.Api.REQ_KOUSYOU_REMODEL_SLOT, arg)
      }
    }
  }

  private reqKousyouCreateItem(api_data: ApiCreateItem): void {
    const query = this.getReq(KcsApi.Api.REQ_KOUSYOU_CREATEITEM)
    if (api_data.api_create_flag && api_data.api_get_items) {
      const created = api_data.api_get_items.filter((slotitem) => slotitem.api_id !== -1)
      if (created.length) {
        created.forEach((slotitem) =>
          this.apiData.api_slot_item.push(fixApiSlotitemMember(slotitem))
        )
        this.slotitemCountUpdated = true
      }
    }

    if (api_data.api_material) {
      this.updateMaterial(api_data.api_material, false)
    }

    if (query) {
      const req: ApiCreateItemParam = qsParse(query)
      const data: ApiCreateItemWithParam = {
        ...api_data,
        items: [
          parseInt(req.api_item1),
          parseInt(req.api_item2),
          parseInt(req.api_item3),
          parseInt(req.api_item4)
        ]
      }
      if (!data.items.some((v) => isNaN(v))) {
        ApiCallback.call(KcsApi.Api.REQ_KOUSYOU_CREATEITEM, data)
      }
    }
  }

  private reqKousyouDestroyItem2(api_data: ApiDestroyItem2): void {
    const query = this.getReq(KcsApi.Api.REQ_KOUSYOU_DESTROYITEM2)
    if (query) {
      const req: ApiDestroyItem2Param = qsParse(query)
      if (req.api_slotitem_ids) {
        const slotitem_ids = req.api_slotitem_ids.split(',').map((v) => parseInt(v))
        this.updateMaterial(api_data.api_get_material, true)
        const items = this.destroySlotitem(slotitem_ids)
        ApiCallback.call(KcsApi.Api.REQ_KOUSYOU_DESTROYITEM2, 
          { ...api_data, destroy_slotitems: items })
      }
    }
  }

  private destroySlotitem(slotitem_ids: number[]): ApiSlotitem[] {
    const items: ApiSlotitem[] = []
    slotitem_ids.forEach((slotitem_id) => {
      const index = this.apiData.api_slot_item.findIndex(
        (slotitem) => slotitem.api_id === slotitem_id
      )
      if (index !== -1) {
        const slotitem = this.apiData.api_slot_item[index]
        items.push(slotitem);
        this.apiData.api_slot_item.splice(index, 1)
        this.slotitemCountUpdated = true
      }
    })
    return items
  }

  private reqKousyouCreateShip(_api_data: ApiResponse) {
    SvDataPrivate.arg_create_ship = undefined
    const query = this.getReq(KcsApi.Api.REQ_KOUSYOU_CREATESHIP)
    if (!query) {
      return
    }
    const param: ApiCreateShipParam = qsParse(query)
    const items: number[] = [0, 0, 0, 0, 0]
    items[0] = parseInt(param.api_item1)
    items[1] = parseInt(param.api_item2)
    items[2] = parseInt(param.api_item3)
    items[3] = parseInt(param.api_item4)
    items[4] = parseInt(param.api_item5)
    const highspeed = parseInt(param.api_highspeed)
    const update = (id: ApiMaterialId, v: number): void => {
      if (isFinite(v)) {
        this.updateMaterialById(id, -v, true)
      }
    }
    update(ApiMaterialId.FUAL, items[0])
    update(ApiMaterialId.AMMO, items[1])
    update(ApiMaterialId.STEEL, items[2])
    update(ApiMaterialId.BUXITE, items[3])
    update(ApiMaterialId.BUILD_KIT, items[4])
    if (isFinite(highspeed) && highspeed) {
      this.updateMaterialById(ApiMaterialId.FAST_BUILD, -1, true)
    }
    if (!items.some((v) => isNaN(v))) {
      const arg: ApiCreateShipWithParam = {
        api_ship_id: -1,
        api_kdock_id: parseInt(param.api_kdock_id),
        api_large_flag: parseInt(param?.api_large_flag ?? '0'),
        api_highspeed: highspeed,
        api_items: items
      }
      if (
        isFinite(arg.api_highspeed) &&
        isFinite(arg.api_kdock_id) &&
        isFinite(arg.api_large_flag)
      ) {
        SvDataPrivate.arg_create_ship = arg
      }
    }
  }

  private reqKousyouDestroyShip(api_data: ApiDestroyShip) {
    this.updateMaterial(api_data.api_material, false)
    const query = this.getReq(KcsApi.Api.REQ_KOUSYOU_DESTROYSHIP)
    if (query) {
      const req: ApiDestroyShipParam = qsParse(query)
      if (req.api_ship_id) {
        const ship_ids = req.api_ship_id.split(',').map((v) => {
          return parseInt(v)
        })
        ship_ids.forEach((ship_id) => {
          const index = this.apiData.api_ship.findIndex((ship) => {
            return ship.api_id === ship_id
          })
          if (index !== -1) {
            const ship = this.apiData.api_ship[index]
            this.apiData.api_ship.splice(index, 1)
            this.shipCountUpdated = true
            if (req.api_slot_dest_flag === '1') {
              this.destroySlotitem(ship.api_slot)
              this.destroySlotitem([ship.api_slot_ex])
            }
          }
        })
        ApiCallback.call(KcsApi.Api.REQ_KOUSYOU_DESTROYSHIP, {
          ...api_data,
          ship_ids
        })
      }
    }
  }

  private resGetMemberShip2(api_data: ApiShip[]): void {
    replaceArraySafe(this.apiData.api_ship, api_data)
    this.shipCountUpdated = true
  }

  private resGetMemberShip3(api_data: ApiShip3): void {
    this.replaceDeckPort(api_data.api_deck_data)
    this.updateShip(api_data.api_ship_data)
  }

  private reqKaisouSlotset(): void {
    const query = this.getReq(KcsApi.Api.REQ_KAISOU_SLOTSET)
    if (query) {
      const req: ApiKaisouSlotsetParam = qsParse(query)
      const ship = this.ship(parseInt(req.api_id))
      if (ship) {
        ship.api_slot.splice(parseInt(req.api_slot_idx), 1, parseInt(req.api_item_id))
      }
    }
  }

  private reqKaisouOpenExSlot(): void {
    const query = this.getReq(KcsApi.Api.REQ_KAISOU_OPEN_EXSLOT)
    if (query) {
      const req: ApiOpenExSlotParam = qsParse(query)
      const ship = this.ship(parseInt(req.api_id))
      if (ship) {
        Object.assign(ship, { api_slot_ex: -1 })
      }

      // del hokyou item count
      this.useitemAdd(64, -1)
    }
  }

  private reqKaisouUnsetslotAll(): void {
    const query = this.getReq(KcsApi.Api.REQ_KAISOU_UNSETSLOT_ALL)
    if (query) {
      const req: ApiKaisouUnsetslotAllParam = qsParse(query)
      const ship = this.ship(parseInt(req.api_id))
      if (ship) {
        for (let i = 0; i < ship.api_slot.length; ++i) {
          ship.api_slot.splice(i, 1, -1)
        }
      }
    }
  }

  private reqKaisouSlotExchangeIndex(data: ApiChangeSlotExchangeIndex): void {
    this.updateShip([data.api_ship_data])
  }

  private reqClearItemGet(data: ApiClearItemGet): void {
    if (data.api_material) {
      this.updateMaterial(data.api_material, true)
    }
    if (data.api_bounus_count && data.api_bounus) {
      const materials: number[] = [0, 0, 0, 0, 0, 0, 0, 0]
      data.api_bounus.forEach((bonus) => {
        if (bonus.api_type === ApiItemBonusType.material) {
          if (bonus.api_item) {
            const materialItem = bonus.api_item as ApiItemBonusMaterial
            const id = materialItem.api_id
            if (ApiMaterialId.MIN <= id && id <= ApiMaterialId.MAX) {
              materials[id - 1] = bonus.api_count
            }
          }
        }
      })
      this.updateMaterial(materials, true)
    }

    const query = this.getReq(KcsApi.Api.REQ_QUEST_CLEARITEMGET)
    if (query) {
      const req: ApiClearItemGetParam = qsParse(query)
      const api_quest_id = parseInt(req.api_quest_id)
      if (!isNaN(api_quest_id)) {
        const withParam: ApiClearItemGetWithParam = {
          ...data,
          api_quest_id
        }
        // call callback
        ApiCallback.call(KcsApi.Api.REQ_QUEST_CLEARITEMGET, withParam)
      }
    }
  }

  private getMemberSlotitem(api_data: ApiSlotitem[]): void {
    replaceArray(this.apiData.api_slot_item, api_data)
    this.slotitemCountUpdated = true
  }

  private reqMapSelectEventmapRank(api_data: ApiSelectEventmapRank): void {
    const query = this.getReq(KcsApi.Api.REQ_MAP_SELECT_EVENTMAP_RANK)
    if (!query) {
      return
    }

    const req: ApiSelectEventmapRankParam = qsParse(query)
    const maparea_id = parseInt(req.api_maparea_id)
    const map_no = parseInt(req.api_map_no)
    const rank = parseInt(req.api_rank)
    if (isFinite(maparea_id) && isFinite(map_no) && isFinite(rank)) {
      const mapinfo = this.mapinfoFrom(maparea_id, map_no)
      if (mapinfo) {
        Object.assign(mapinfo, {
          api_eventmap: {
            api_now_maphp: api_data.api_maphp.api_now_maphp,
            api_max_maphp: api_data.api_maphp.api_max_maphp,
            api_state: 1,
            api_selected_rank: rank
          },
          api_gauge_num: api_data.api_maphp.api_gauge_num,
          api_gauge_type: api_data.api_maphp.api_gauge_type,
          api_sally_flag: api_data.api_sally_flag
        })
      }
    }
  }

  private reqMapStart(api_data: ApiMapStart): void {
    const query = this.getReq(KcsApi.Api.REQ_MAP_START)
    if (query) {
      this.apiData.prv_in_map = true

      // clear gimmick flags
      if (this.svdata.gimmickFlagDetectedClear) {
        this.svdata.gimmickFlagDetectedClear = false
        this.svdata.gimmickFlagDetected = false
        this.svdata.mapChangeDetected = false
      }

      // caption: seaplane itemget is not array.
      if (api_data.api_itemget && !Array.isArray(api_data.api_itemget)) {
        const itemget = api_data.api_itemget as ApiItemGet
        Object.assign(api_data, { api_itemget: [itemget] })
      }
      const req: ApiMapStartParam = qsParse(query)
      const maparea_id = toNumberSafe(req.api_maparea_id)
      const mapinfo_no = toNumberSafe(req.api_mapinfo_no)
      let mapLv: MapLv = MapLv.none
      const mstMapInfo = this.mstMapInfo(maparea_id, mapinfo_no)
      if (mstMapInfo) {
        const mapinfo = this.mapinfo(mstMapInfo.api_id)
        if (mapinfo) {
          mapLv = mapinfo.api_eventmap?.api_selected_rank ?? MapLv.none
        }
      }
      this.apiData.prv_battle_map_info = Object.assign(
        {},
        {
          maparea_id,
          mapinfo_no,
          mapLv,
          deck_id: toNumberSafe(req.api_deck_id),
          uuid: uuidv4(),
          start: true,
          escape_indexs: [],
          tow_indexs: []
        }
      )
      replaceArray(this.apiData.prv_battle_infos, [])
      replaceArray(this.apiData.api_req_map, [api_data])

      // call callback
      ApiCallback.call(KcsApi.Api.REQ_MAP_START, { req: req, res: api_data })
    }
  }

  public get mapStartOk(): boolean {
    return this.apiData.api_req_map.length > 0
  }

  public get mapStart(): ApiMapStart | undefined {
    if (this.apiData.api_req_map.length) {
      return this.apiData.api_req_map[0] as ApiMapStart
    }
    return
  }

  public get inMap(): boolean {
    return this.apiData.prv_in_map
  }

  private reqMapNext(api_data: ApiMapNext): void {
    // caption: seaplane itemget is not array.
    if (api_data.api_itemget && !Array.isArray(api_data.api_itemget)) {
      const itemget = api_data.api_itemget as ApiItemGet
      Object.assign(api_data, { api_itemget: [itemget] })
    }
    this.apiData.api_req_map.push(api_data)

    // call callback
    ApiCallback.call(KcsApi.Api.REQ_MAP_NEXT, api_data)
  }

  public get mapNextOk(): boolean {
    return this.apiData.api_req_map.length > 1
  }

  public get battleMap(): ApiBattleMap[] {
    return this.apiData.api_req_map
  }

  public get lastMap(): ApiMap | undefined {
    if (this.mapNextOk) {
      const ar = this.apiData.api_req_map
      return ar[ar.length - 1]
    }
    if (this.mapStartOk) {
      return this.apiData.api_req_map[0]
    }
    return
  }

  public get lastBattle(): PrvBattleInfo | undefined {
    const ar = this.apiData.prv_battle_infos
    if (ar.length) {
      return ar[ar.length - 1]
    }
    return
  }

  private pushMiddayBattle(
    battleType: BattleType,
    midday: ApiMiddayBattleType,
    middayJson: string
  ): void {
    const map_info = this.lastMap
    if (!map_info) {
      return
    }

    const finded = this.apiData.prv_battle_infos.find((info) => info.cell_no === map_info.api_no)
    if (!finded) {
      this.apiData.prv_battle_infos.push({
        mapLv: this.apiData.prv_battle_map_info!.mapLv,
        uuid: this.apiData.prv_battle_map_info!.uuid,
        map: map_info,
        cell_no: map_info.api_no,
        isBoss: map_info.api_event_id === ApiEventId.bossBattle,
        battleType,
        eventId: map_info.api_event_id,
        eventKind: map_info.api_event_kind,
        midday,
        midnight: null,
        result: null,
        middayJson,
        midnightJson: null
      })
      ApiCallback.call('battle-start', midday)
    } else {
      Object.assign(finded, { midday, middayJson })
    }
  }

  private pushMidnightBattle(
    battleType: BattleType,
    midnight: ApiMidnightBattleType,
    midnightJson: string
  ): void {
    const map_info = this.lastMap
    if (!map_info) {
      return
    }

    const finded = this.apiData.prv_battle_infos.find((info) => info.cell_no === map_info.api_no)
    if (!finded) {
      this.apiData.prv_battle_infos.push({
        mapLv: this.apiData.prv_battle_map_info!.mapLv,
        uuid: this.apiData.prv_battle_map_info!.uuid,
        map: map_info,
        cell_no: map_info.api_no,
        isBoss: map_info.api_event_id === ApiEventId.bossBattle,
        battleType,
        eventId: map_info.api_event_id,
        eventKind: map_info.api_event_kind,
        midday: null,
        midnight,
        result: null,
        middayJson: null,
        midnightJson
      })
      ApiCallback.call('battle-start', midnight)
    } else {
      Object.assign(finded, { midnight, midnightJson })
    }
  }

  private setBattleResult(result: ApiBattleResult): PrvBattleInfo | undefined {
    const map_info = this.lastMap
    if (!map_info) {
      return
    }

    const finded = this.apiData.prv_battle_infos.find((info) => info.cell_no === map_info.api_no)
    if (finded) {
      Object.assign(finded, { result })
      return finded
    }

    return
  }

  private reqSortieBattle(api_data: ApiSortieBattle, json: string): void {
    this.pushMiddayBattle(BattleType.midday, api_data, json)
  }

  private reqSortieAirBattle(api_data: ApiSortieAirBattle, json: string): void {
    this.pushMiddayBattle(BattleType.air, api_data, json)
  }

  private reqSortieLdAirBattle(api_data: ApiSortieLdAirBattle, json: string): void {
    this.pushMiddayBattle(BattleType.ld_air, api_data, json)
  }

  private reqMidnightBattle(api_data: ApiMidnightBattle, json: string): void {
    this.pushMidnightBattle(BattleType.midnight, api_data, json)
  }

  private reqMidnightSpBattle(api_data: ApiMidnightSpBattle, json: string): void {
    this.pushMidnightBattle(BattleType.sp_midnight, api_data, json)
  }

  private reqSortieBattleResult(api_data: ApiSortieBattleResult): void {
    const battle_info = this.setBattleResult(api_data)
    if (battle_info) {
      this.updateGaugeCount(battle_info)
      ApiCallback.call(KcsApi.Api.REQ_SORTIE_BATTLERESULT, battle_info)
    }
  }

  private reqCombinedCombinedBattle(api_data: ApiCombinedVsNormalBattle, json: string): void {
    this.pushMiddayBattle(BattleType.combined, api_data, json)
  }

  private reqCombinedEachBattle(api_data: ApiCombinedVsCombinedBattle, json: string): void {
    this.pushMiddayBattle(BattleType.combined_each, api_data, json)
  }

  private reqCombinedEcBattle(api_data: ApiNormalVsCombinedBattle, json: string): void {
    this.pushMiddayBattle(BattleType.combined_ec, api_data, json)
  }

  private reqCombinedBattleLdAirBattle(api_data: ApiCombinedVsNormalBattle, json: string): void {
    this.pushMiddayBattle(BattleType.combined_ld_air, api_data, json)
  }

  private reqCombinedEcMidnightBattle(api_data: ApiEcMidnightBattle, json: string): void {
    this.pushMidnightBattle(BattleType.combined_ec_midnight, api_data, json)
  }

  private reqCombinedBattleResult(api_data: ApiCombinedBattleResult): void {
    const battle_info = this.setBattleResult(api_data)
    if (battle_info) {
      this.updateGaugeCount(battle_info)
      ApiCallback.call(KcsApi.Api.REQ_COMBINED_BATTLE_BATTLERESULT, battle_info)
    }
  }

  private reqCombinedBattleGobackPort(): void {
    const result = this.lastBattle?.result
    if (!result || !result.api_escape) {
      return
    }

    const prv_battle_map_info = this.apiData.prv_battle_map_info
    if (!prv_battle_map_info) {
      return
    }

    const escape_index = result.api_escape.api_escape_idx.find(
      (el) => !prv_battle_map_info.escape_indexs.includes(el)
    )
    if (escape_index !== undefined) {
      prv_battle_map_info.escape_indexs.push(escape_index)
    }

    const tow_index = result.api_escape.api_tow_idx.find(
      (el) => !prv_battle_map_info.tow_indexs.includes(el)
    )
    if (tow_index !== undefined) {
      prv_battle_map_info.tow_indexs.push(tow_index)
    }
  }

  private reqPracticeBattle(): void {}

  private reqPracticeBattleResult(api_data: ApiPracticeBattleResult): void {
    if (!this.apiData.api_practice_battle_result) {
      Object.assign(this.apiData, { api_practice_battle_result: api_data })
    } else {
      Object.assign(this.apiData.api_practice_battle_result, api_data)
    }

    const query = this.getReq(KcsApi.Api.REQ_PRACTICE_BATTLE)
    if (query) {
      const req: ApiPracticeBattleParam = qsParse(query)
      const deck_id = toNumberSafe(req.api_deck_id)
      ApiCallback.call(KcsApi.Api.REQ_PRACTICE_BATTLE_RESULT, {
        deck_id: deck_id,
        result: api_data
      })
    }
  }

  private updateMaterial(materials: number[], add: boolean): void {
    if (materials.length >= 4) {
      this.updateMaterialById(ApiMaterialId.FUAL, materials[0], add)
      this.updateMaterialById(ApiMaterialId.AMMO, materials[1], add)
      this.updateMaterialById(ApiMaterialId.STEEL, materials[2], add)
      this.updateMaterialById(ApiMaterialId.BUXITE, materials[3], add)
    }
    if (materials.length >= 6) {
      this.updateMaterialById(ApiMaterialId.FAST_BUILD, materials[4], add)
      this.updateMaterialById(ApiMaterialId.FAST_REPAIR, materials[5], add)
      this.updateMaterialById(ApiMaterialId.BUILD_KIT, materials[6], add)
      this.updateMaterialById(ApiMaterialId.REMODEL_KIT, materials[7], add)
    }
  }

  private updateMaterialById(id: ApiMaterialId, value: number, isAdd: boolean): void {
    const material = this.material(id)
    if (material) {
      this.materialUpdated = true
      Object.assign(material, { api_value: isAdd ? material.api_value + value : value })
    }
  }

  private updateShip(ships: ApiShip[] | undefined): void {
    if (ships) {
      ships.forEach((ship) => {
        const finded = this.apiData.api_ship.find((e) => e.api_id === ship.api_id)
        if (finded) {
          Object.assign(finded, ship)
        }
      })
    }
  }

  public get mstShips(): MstShip[] {
    return this.apiData.api_mst_ship
  }

  public mstShip(id: number): MstShip | undefined {
    if (id > 0) {
      // check cache
      const cached = this.mstShipCache.get(id)
      if (cached) {
        return cached === null ? undefined : cached
      }
      // search and cache
      const finded = this.apiData.api_mst_ship.find((obj) => obj.api_id === id)
      this.mstShipCache.set(id, finded ? finded : null)
      return finded
    }
    return
  }

  public mstShipSafe(id: number): MstShip {
    const mst = this.mstShip(id)
    return mst ? mst : InvalidMstShip()
  }

  public mstShipFrom(ship_id: number): MstShip | undefined {
    const ship = this.ship(ship_id)
    if (ship) {
      return this.mstShip(ship.api_ship_id)
    }
    return
  }

  public mstShipBase(id: number): MstShipBase | undefined {
    if (id > 0) {
      return this.apiData.api_mst_ship.find((obj) => obj.api_id === id)
    }
    return
  }

  public mstShipBaseSafe(id: number): MstShipBase {
    const mst = this.mstShipBase(id)
    return mst ? mst : InvalidMstShipBase()
  }

  public get ships(): ApiShip[] {
    return this.apiData.api_ship
  }

  public ship(id: number): ApiShip | undefined {
    if (id > 0) {
      return this.apiData.api_ship.find((obj) => obj.api_id === id)
    }
    return
  }

  private rmapCreate(id: number): number[] {
    let check_id = id
    const rmap = [check_id]
    while (check_id > 0) {
      const mstship = this.mstShip(check_id)
      if (mstship) {
        check_id = parseInt(mstship.api_aftershipid)
        if (check_id > 0) {
          if (rmap.includes(check_id)) {
            break
          }
          rmap.push(check_id)
          continue
        }
      }
      break
    }
    return rmap
  }

  public shipMstIds(start_mstship_id: number): number[] {
    const finded = RMap.find(start_mstship_id)
    if (finded) {
      return finded
    }
    const rmap = this.rmapCreate(start_mstship_id)
    RMap.set(start_mstship_id, rmap)
    return rmap
  }

  public shipCounts(id: number): number[] {
    const rmap = this.shipMstIds(id)

    const ret: number[] = []
    const ships = this.ships.filter((ship) => rmap.includes(ship.api_ship_id))
    for (let i = 0; i < rmap.length; ++i) {
      ret.push(ships.filter((ship) => ship.api_ship_id === rmap[i]).length)
    }
    if (0 === ret.reduce((acc, v) => acc + v, 0)) {
      return []
    }
    return ret
  }

  public slotitemEquipTypeSafe(slotitem: ApiSlotitem | undefined): MstSlotitemEquiptype {
    if (slotitem) {
      const mst = this.mstSlotitem(slotitem.api_slotitem_id)
      if (mst) {
        const type = this.mstSlotitemEquiptype(mst)
        if (type) {
          return type
        }
      }
    }
    return {
      api_id: 0,
      api_name: '',
      api_show_flg: 0
    }
  }

  public get mstSlotitems(): MstSlotitem[] {
    return this.apiData.api_mst_slotitem
  }

  public mstSlotitem(id: number): MstSlotitem | undefined {
    if (id > 0) {
      // check cache
      const cached = this.mstSlotitemCache.get(id)
      if (cached) {
        return cached === null ? undefined : cached
      }

      // search and cache
      const finded = this.apiData.api_mst_slotitem.find((obj) => obj.api_id === id)
      this.mstSlotitemCache.set(id, finded ? finded : null)
      return finded
    }
    return
  }

  public get mstSlotitemEquiptypes(): MstSlotitemEquiptype[] {
    return this.apiData.api_mst_slotitem_equiptype
  }

  //public mstSlotitemEquiptype(id : number) : MstSlotitemEquiptype | undefined {
  //  return this.apiData.api_mst_slotitem_equiptype.find((obj) => {
  //    return obj.api_id === id;
  //  });
  //}

  public mstSlotitemEquiptype(mstSlotitem: MstSlotitem): MstSlotitemEquiptype | undefined {
    if (mstSlotitem) {
      return this.mstSlotitemEquiptypeFroId(mstSlotitem.api_type[2])
    }
    return
  }

  public mstSlotitemEquiptypeFroId(id: number): MstSlotitemEquiptype | undefined {
    return this.apiData.api_mst_slotitem_equiptype.find((obj) => obj.api_id === id)
  }

  public slotitem(id: number): ApiSlotitem | undefined {
    if (id > 0) {
      return this.apiData.api_slot_item.find((obj) => obj.api_id === id)
    }
    return
  }

  public slotitemCount(slotitem_id: number): number {
    return this.apiData.api_slot_item.filter((slotitem) => slotitem.api_slotitem_id === slotitem_id)
      .length
  }

  public get slotitems(): ApiSlotitem[] {
    return this.apiData.api_slot_item
  }

  public get slotitemCountForTitle(): number {
    const oneItem = new Set([
      42, // okyuusyuuriyouinn
      43, // oukyuusyuurimegami
      145, // sentouryousyoku
      146, // youjyouhokyuu
      150, // sanmanokannzume
      241 // sentouryousyoku(tokubetunaonigiri)
    ])
    return this.slotitems.reduce((acc: number, slotitem: ApiSlotitem) => {
      if (!oneItem.has(slotitem.api_slotitem_id)) {
        ++acc
      }
      return acc
    }, 0)
  }

  public get mstStypes(): MstStype[] {
    return this.apiData.api_mst_stype
  }

  public mstStype(id: number): MstStype | undefined {
    return this.apiData.api_mst_stype.find((style) => style.api_id === id)
  }

  public mstStypeFromSafe(mstShip: MstShip): string {
    if (mstShip) {
      const stype = this.mstStype(mstShip.api_stype)
      if (stype) {
        return stype.api_name
      }
    }
    return ''
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

  private replaceDeckPort(decks: ApiDeckPort[]): void {
    const deckPorts = this.deckPorts
    //console.log('replaceDeckPort deckPort', deckPorts, 'api decks', decks)
    replaceArray(deckPorts, decks)
  }

  private updateDeckPort(src: ApiDeckPort[] | undefined): void {
    if (src) {
      const dst = this.apiData.api_deck_port
      src.forEach((deck) => {
        const finded = dst.find((e) => e.api_id === deck.api_id)
        if (finded) {
          Object.assign(finded, deck)
        } else {
          dst.push(deck)
        }
      })
    }
  }

  public get deckPorts(): ApiDeckPort[] {
    return this.apiData.api_deck_port
  }

  public deckPort(id: ApiDeckPortId | number): ApiDeckPort | undefined {
    return this.apiData.api_deck_port.find((obj) => obj.api_id === id)
  }

  public deckSecretary(id: ApiDeckPortId): ApiShip | undefined {
    const deck = this.deckPort(id)
    if (deck) {
      return this.ship(deck.api_ship[0])
    }
    return
  }

  public get presetDeck(): ApiPresetDeck {
    return this.apiData.api_preset_deck
  }

  public presetDeckFromNo(no: number): ApiPresetDeckInfo | undefined {
    return this.apiData.api_preset_deck.api_deck[no.toString()]
  }

  public get isPresetDeckOk(): boolean {
    return this.apiData.api_preset_deck.api_max_num > 0
  }

  public get parallelQuestCount(): number {
    return this.apiData.api_parallel_quest_count
  }

  public get questlist(): ApiQuestList | null {
    return this.apiData.api_questlist
  }

  public material(id: ApiMaterialId): ApiMaterial | undefined {
    //console.log('main process material called. id:' + id);
    if (this.apiData.api_material) {
      return this.apiData.api_material.find((material) => material.api_id === id)
    }
    return
  }

  public materialSafe(id: ApiMaterialId): number {
    const m = this.material(id)
    return m?.api_value ?? 0
  }

  public get basic(): ApiBasic {
    return this.apiData.api_basic
  }

  public get fual(): number {
    return this.materialSafe(ApiMaterialId.FUAL)
  }

  public get ammo(): number {
    return this.materialSafe(ApiMaterialId.AMMO)
  }

  public get bull(): number {
    return this.materialSafe(ApiMaterialId.AMMO)
  }

  public get steel(): number {
    return this.materialSafe(ApiMaterialId.STEEL)
  }

  public get buxite(): number {
    return this.materialSafe(ApiMaterialId.BUXITE)
  }

  public get fastRepair(): number {
    return this.materialSafe(ApiMaterialId.FAST_REPAIR)
  }

  public get fastBuild(): number {
    return this.materialSafe(ApiMaterialId.FAST_BUILD)
  }

  public get buildKit(): number {
    return this.materialSafe(ApiMaterialId.BUILD_KIT)
  }

  public get remodelKit(): number {
    return this.materialSafe(ApiMaterialId.REMODEL_KIT)
  }

  public get shipCountWithDrop(): number {
    return this.ships.length
  }

  public get slotitemCountWithDrop(): number {
    return this.slotitems.length
  }

  public get mstMissions(): MstMission[] {
    return this.apiData.api_mst_mission
  }

  public mstMission(id: Number): MstMission | undefined {
    return this.apiData.api_mst_mission.find((mst) => mst.api_id === id)
  }

  public get missions(): ApiMission[] {
    return this.apiData.api_mission
  }

  public mission(mission_id: number): ApiMission | undefined {
    return this.apiData.api_mission.find((mission) => mission.api_mission_id === mission_id)
  }

  public mstUseItem(id: number): MstUseitem | undefined {
    return this.apiData.api_mst_useitem.find((mst) => mst.api_id === id)
  }

  public get useitems(): ApiUseItem[] {
    return this.apiData.api_useitem
  }

  public useitemAdd(id: number | undefined, count: number): void {
    const item = this.useitem(id)
    if (item) {
      Object.assign(item, { api_count: item.api_count + count })
    }
  }

  public useitem(id: number | undefined): ApiUseItem | undefined {
    if (id) {
      return this.useitems.find((item) => item.api_id === id)
    }
    return
  }

  public get isPracticeBattleResultOk(): boolean {
    return !!this.apiData.api_practice_battle_result
  }

  public get practiceBattleResult(): ApiPracticeBattleResult | null {
    return this.apiData.api_practice_battle_result
  }

  public get mstBattleMapInfo(): MstMapinfo | undefined {
    if (this.mapStartOk) {
      const map = this.mapStart!
      return this.mstMapInfo(map.api_maparea_id, map.api_mapinfo_no)
    }
    return
  }

  public get battleInfoOk(): boolean {
    return this.apiData.prv_battle_map_info !== null
  }

  public get battleDeck(): ApiDeckPort | undefined {
    if (this.apiData.prv_battle_map_info) {
      return this.deckPort(this.apiData.prv_battle_map_info.deck_id)
    }
    return
  }

  public get ndocks(): ApiNDock[] {
    return this.apiData.api_ndock
  }

  public ndock(id: number): ApiNDock | undefined {
    return this.apiData.api_ndock.find((ndock) => {
      return ndock.api_id === id
    })
  }

  public get kdocks(): ApiKDock[] {
    return this.apiData.api_kdock
  }

  public kdock(id: number): ApiKDock | undefined {
    return this.apiData.api_kdock.find((kdock) => kdock.api_id === id)
  }

  public isShipEscaped(deck: ApiDeckPort, index: number): boolean {
    if (!this.isCombined) {
      return false
    }

    const map_info = this.apiData.prv_battle_map_info
    if (!map_info) {
      return false
    }

    // escape start index: 1. not 0.
    const start_index = deck.api_id === ApiDeckPortId.deck2st ? 7 : 1
    const check_indexs = map_info.escape_indexs.concat(map_info.tow_indexs)
    return check_indexs.includes(start_index + index)
  }

  public shipSeiku(ship: ApiShip | undefined): number {
    let ret = 0
    if (ship) {
      for (let i = 0; i < ship.api_slot.length; ++i) {
        const onslot = ship.api_onslot[i]
        if (onslot) {
          const slotitem = this.slotitem(ship.api_slot[i])
          if (slotitem) {
            const mst = this.mstSlotitem(slotitem.api_slotitem_id)
            if (mst) {
              ret += KcsUtil.slotSeiku(mst, slotitem, onslot)
            }
          }
        }
      }
    }
    return ret
  }

  public shipYusou(ship: ApiShip | undefined): number {
    let ret = 0
    if (ship) {
      for (let i = 0; i < ship.api_slot.length; ++i) {
        const slotitem = this.slotitem(ship.api_slot[i])
        if (slotitem) {
          const mst = this.mstSlotitem(slotitem.api_slotitem_id)
          if (mst) {
            ret += KcsUtil.yusouFromSlotitem(mst)
          }
        }
      }
      const mstShip = this.mstShip(ship.api_ship_id)
      if (mstShip) {
        ret += KcsUtil.yusouFromShip(ship, mstShip)
      }
    }
    return ret
  }

  public deckSeiku(deck: ApiDeckPort): number {
    return deck.api_ship.reduce(
      (acc: number, ship_id: number) => (acc += this.shipSeiku(this.ship(ship_id))),
      0
    )
  }

  public deckYusou(deck: ApiDeckPort): number {
    const yusou = deck.api_ship.reduce(
      (acc: number, ship_id: number) => (acc += this.shipYusou(this.ship(ship_id))),
      0
    )
    return Math.floor(yusou)
  }

  public get mstMaparea(): MstMaparea[] {
    return this.apiData.api_mst_maparea
  }

  public mstMapareaType(type: ApiMapAreaType): MstMaparea | undefined {
    return this.apiData.api_mst_maparea.find((el) => el.api_type === type)
  }

  public get inEvent(): boolean {
    return !!this.mstMapareaType(ApiMapAreaType.event)
  }

  public get isCombined(): boolean {
    return this.apiData.api_combined_flag !== 0
  }

  public get combinedFlag(): CombinedFlag {
    return this.apiData.api_combined_flag
  }

  public get mstMapInfos(): MstMapinfo[] {
    return this.apiData.api_mst_mapinfo
  }

  public mstMapInfo(maparea_id: number, no: number): MstMapinfo | undefined {
    return this.apiData.api_mst_mapinfo.find(
      (mst) => mst.api_maparea_id === maparea_id && mst.api_no == no
    )
  }

  public get mapinfos(): ApiMapInfo[] {
    return this.apiData.api_mapinfo
  }

  public mapinfo(id: number): ApiMapInfo | undefined {
    return this.apiData.api_mapinfo.find((info) => info.api_id === id)
  }

  public mapinfoFrom(maparea_id: number, no: number): ApiMapInfo | undefined {
    const mst = this.mstMapInfo(maparea_id, no)
    if (mst) {
      return this.mapinfo(mst.api_id)
    }
    return
  }

  public mapLevel(maparea_id: number, no: number): MapLv {
    const mapinfo = this.mapinfoFrom(maparea_id, no)
    if (mapinfo) {
      const eventmap = mapinfo.api_eventmap
      if (eventmap) {
        return eventmap.api_selected_rank
      }
    }
    return MapLv.kou
  }

  public get airbases(): ApiAirBase[] {
    return this.apiData.api_air_base
  }

  public hasAirbase(maparea_id: number, no: number): boolean {
    const mapinfo = this.mapinfoFrom(maparea_id, no)
    return !!(mapinfo?.api_air_base_decks ?? 0)
  }

  public airbase(maparea_id: number): ApiAirBase[] | undefined {
    const ret: ApiAirBase[] = this.apiData.api_air_base.filter(
      (airbase) => airbase.api_area_id === maparea_id
    )
    return ret.length ? ret : undefined
  }

  public airbaseFrom(area_id: number, rid: number): ApiAirBase | undefined {
    return this.apiData.api_air_base.find(
      (airbase) => airbase.api_area_id === area_id && airbase.api_rid === rid
    )
  }

  public airbaseSeiku(airbase: ApiAirBase): number {
    if (
      airbase.api_action_kind !== AirBaseActionKind.syutugeki &&
      airbase.api_action_kind !== AirBaseActionKind.bouku
    ) {
      return -1
    }

    const isSyutugeki = airbase.api_action_kind === AirBaseActionKind.syutugeki
    const calced = airbase.api_plane_info.reduce<{ aa: number; bonus: number[] }>(
      (acc, planeinfo) => {
        if (planeinfo.api_slotid) {
          const aa = this.planeSeiku(planeinfo, airbase.api_action_kind)
          acc.aa += aa.aa

          // calc bonus
          if (aa.mst) {
            const slotitem_type = KcsUtil.slotitemType(aa.mst)
            if (slotitem_type === SlotitemType.LandRecAircraft) {
              const base = isSyutugeki ? 1.15 : 1.18
              const mod = isSyutugeki ? 0.03 : 0.05
              const bonus = base + (aa.mst.api_saku - 8) * mod
              acc.bonus.push(bonus)
            }
            if (!isSyutugeki && slotitem_type === SlotitemType.RecAircraft) {
              const bonus =
                aa.mst.api_saku <= 7 ? 1.2 : Math.min(1.2 + (aa.mst.api_saku - 7) * 0.05, 1.3)
              acc.bonus.push(bonus)
            }
            if (
              !isSyutugeki &&
              (slotitem_type === SlotitemType.RecSeaplane ||
                slotitem_type === SlotitemType.LargeFlyingBoat)
            ) {
              const bonus =
                aa.mst.api_saku <= 7 ? 1.1 : Math.min(1.1 + (aa.mst.api_saku - 7) * 0.03, 1.16)
              acc.bonus.push(bonus)
            }
          }
        }
        return acc
      },
      { aa: 0, bonus: [] }
    )
    if (calced.bonus.length) {
      return Math.floor(calced.bonus.reduce((acc, el) => acc * el, calced.aa))
    }
    return calced.aa
  }

  public planeSeiku(
    planeinfo: ApiPlaneInfo,
    action_kind: AirBaseActionKind
  ): { aa: number; mst?: MstSlotitem } {
    const count = planeinfo?.api_count ?? 0
    if (!count) {
      return { aa: 0 }
    }

    const sitem = this.slotitem(planeinfo.api_slotid)
    if (sitem) {
      const mst = this.mstSlotitem(sitem.api_slotitem_id)
      if (mst) {
        return {
          aa: KcsUtil.planeSeiku(mst, sitem, count, action_kind),
          mst
        }
      }
    }
    return { aa: 0 }
  }

  public slotitemMapLos(slotitem_id: number): MapLosValue {
    const slotitem = this.slotitem(slotitem_id)
    if (slotitem) {
      const mst = this.mstSlotitem(slotitem.api_slotitem_id)
      if (mst) {
        return KcsUtil.slotitemMapLos(slotitem, mst)
      }
    }
    return InvalidMapLosValue()
  }

  public deckMapLos(deck: ApiDeckPort, maplos: number): number {
    const ship_los = deck.api_ship.reduce((los, ship_id) => {
      const ship = this.ship(ship_id)
      if (ship) {
        const calc = InvalidMapLosValue()
        //console.log('ship', ret);
        const ship_los = ship.api_slot.reduce((acc, slotitem_id) => {
          const v = this.slotitemMapLos(slotitem_id)
          acc.map += v.map
          acc.base += v.base
          return acc
        }, InvalidMapLosValue())
        calc.map += ship_los.map
        calc.base += ship_los.base

        if (ship.api_slot_ex > 0) {
          const ex_los = this.slotitemMapLos(ship.api_slot_ex)
          calc.map += ex_los.map
          calc.base += ex_los.base
        }

        los += calc.map * maplos
        los += Math.sqrt(ship.api_sakuteki[0] - calc.base)

        //console.log('equip', this.calcc2(ship.api_slot, ship.api_slot_ex));
      }
      return los
    }, 0)

    const c3 = this.basic.api_level * 0.4
    const c4 = 2 * (6 - KcsUtil.deckShipCount(deck))
    //console.log('ship_los', ship_los, 'c3', c3, 'c4', c4);
    return ship_los - c3 + c4
  }

  public slotitemGetItemLos(slotitem_id: number, slotnum: number): number {
    const slotitem = this.slotitem(slotitem_id)
    if (slotitem) {
      const mst = this.mstSlotitem(slotitem.api_slotitem_id)
      if (mst) {
        return KcsUtil.slotitemGetItemLos(mst, slotnum)
      }
    }
    return 0
  }

  public deckGetItemLos(deck: ApiDeckPort): number {
    return deck.api_ship.reduce((acc, id) => {
      const ship = this.ship(id)
      if (ship) {
        ship.api_slot.forEach((slotitem_id, index) => {
          acc += this.slotitemGetItemLos(slotitem_id, ship.api_onslot[index] ?? 0)
        })
      }
      return acc
    }, 0)
  }

  public slot(id: number): SlotInfo | undefined {
    const api = this.slotitem(id)
    if (api) {
      const mst = this.mstSlotitem(api.api_slotitem_id)
      if (mst) {
        return { api: api, mst: mst }
      }
    }
    return
  }

  public slots(api: ApiShip): Slot[] {
    const ret: Slot[] = Array(api.api_slotnum + (0 === api.api_slot_ex ? 0 : 1)).fill(undefined)
    for (let i = 0; i < api.api_slotnum; ++i) {
      ret[i] = this.slot(api.api_slot[i])
    }
    if (api.api_slot_ex > 0) {
      ret[api.api_slotnum] = this.slot(api.api_slot_ex)
    }
    return ret
  }

  public shipInfo(id: number): ShipInfo | undefined {
    const api = this.ship(id)
    if (api) {
      const mst = this.mstShip(api.api_ship_id)
      if (mst) {
        const onslotMax = mst.api_maxeq.filter((eq) => eq > 0);
        return {
          api: api,
          mst: mst,
          slots: this.slots(api),
          onslotMax
        }
      }
    }
    return
  }

  public shipInfos(ids: number[]): ShipInfo[] {
    return ids.reduce<ShipInfo[]>((ships, id) => {
      const ship = this.shipInfo(id)
      if (ship) {
        ships.push(ship)
      }
      return ships
    }, [])
  }

  public shipInfoSps(ids: number[]): ShipInfoSp[] {
    const ships = this.shipInfos(ids)
    return ships.map((ship) => ({
      api: ship.api,
      mst: ship.mst,
      slots: ship.slots,
      bouku: KcsUtil.shipBouku(ship),
      sp: KcsUtil.spAll(ship, ships),
      onslotMax: ship.onslotMax
    }))
  }

  /**
   * ゲージカウンタを更新
   * 
   * @param info 
   * @returns 
   */
  private updateGaugeCount(info: PrvBattleInfo): void {

    // ボス戦以外は更新しない
    if (! info.isBoss) {
      return 
    }

    const mapId = info.map.api_maparea_id * 10 + info.map.api_mapinfo_no
    const eoMapIds = [
      15, 25, 35, 45, 55, 56, 65, 75
    ]
    if (! eoMapIds.includes(mapId)) {
      return
    }

    // クリア済みなら更新しない
    const mi = this.mapinfoFrom(info.map.api_maparea_id, info.map.api_mapinfo_no);
    if (! mi || mi.api_cleared) {
      return
    }

    // ゲージカウンタが無い場合更新しない
    if (undefined === mi.api_defeat_count || undefined === mi.api_required_defeat_count) {
      return
    }

    // ゲージタイプがカウンタ
    if (mi.api_gauge_type === ApiGaugeType.counter) {
      // 敵旗艦HP0以下でゲージカウンタ更新
      const eHps = calcEnemyHps(info)
      const isUpdate = eHps.length > 0 && eHps[0].hp <= 0
      console.log('updateGaugeCount eHps:', eHps, 'is update:', isUpdate, 'mapId:', mapId);
      if (isUpdate) {
        Object.assign(mi, {
          api_defeat_count: mi.api_defeat_count + 1
        })
      }
    }

    // ゲージタイプが輸送ゲージ
    if (mi.api_gauge_type === ApiGaugeType.yusou) {
      if (info.result && info.result.api_landing_hp) {
        const landingHp = info.result.api_landing_hp
        const value = Math.min(mi.api_defeat_count + landingHp.api_sub_value, mi.api_required_defeat_count)
        // 輸送終わりの場合は、ゲージカウンタを必要撃破数にする
        if (value >= mi.api_required_defeat_count) {
          Object.assign(mi, {
            api_defeat_count: 0,
            api_required_defeat_count: 2,
            api_gauge_type: 1,
            api_gauge_num: 2
          })
        } else {
          Object.assign(mi, {
            api_defeat_count: value
          })
        }
      }
    }
  }
}
