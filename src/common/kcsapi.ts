/**
 * API一覧
 */
export const Api = {
  // ワールド決定
  API_WORLD_GET_ID: '/api_world/get_id',

  // 設定取得
  START2_GET_OPTION_SETTING: '/api_start2/get_option_setting',
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
  // アイテム - 家具コイン使用、豆、勲章使用など
  REQ_MEMBER_ITEMUSE: '/api_req_member/itemuse',
  // アイテム - 家具コインなど使用後、ただしスロットアイテムは全取得されない
  // アイテム一覧取得
  GET_MEMBER_USEITEM: '/api_get_member/useitem',
  // 購入アイテム一覧
  GET_MEMBER_PAYITEM: '/api_get_member/payitem',
  // アイテム - 家具コイン使用後 その後
  GET_MEMBER_BASIC: '/api_get_member/basic',
  // 家具
  GET_MEMBER_FURNITURE: '/api_get_member/furniture',
  // チャート追加情報
  GET_MEMBER_CHART_ADDITIONAL_INFO: '/api_get_member/chart_additional_info',

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
  // 出撃(連合-通常) - 戦闘開始
  REQ_COMBINED_BATTLE_BATTLE: '/api_req_combined_battle/battle',
  // 出撃(連合-通常空襲) - 戦闘開始
  REQ_COMBINED_BATTLE_LD_AIRBATTLE: '/api_req_combined_battle/ld_airbattle',
  // 出撃(連合) - 護衛退避
  REQ_COMBINED_BATTLE_GOBACK_PORT: 'api_req_combined_battle/goback_port',

  // airbase set order
  REQ_AIR_CORPS_SET_PLANE: '/api_req_air_corps/set_plane',
  // airbase set action
  REQ_AIR_CORPS_SET_ACTION: '/api_req_air_corps/set_action',
  // airbase supply
  REQ_AIR_CORPS_SUPPLY: '/api_req_air_corps/supply',

  // unknown api
  SET_OSS_CONDITION: '/api_req_member/set_oss_condition'

} as const
export type Api = (typeof Api)[keyof typeof Api]
const ApiTypes = Object.entries(Api)

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
  world20: 20 // 柱島泊地
} as const
export type ApiServerId = (typeof ApiServerId)[keyof typeof ApiServerId]

/**
 *
 * @param url
 */
export function getApi(url: string | undefined): Api | undefined {
  if (!url) {
    return
  }

  const ret = ApiTypes.find((v) => url.indexOf(v[1]) !== -1)
  return ret ? ret[1] : undefined
}

/**
 *
 * @param url
 */
export function isKcsapi(url: string | undefined): boolean {
  if (url) {
    return url.indexOf('/kcsapi/') !== -1
  }
  return false
}

/**
 * 
 * @param url 
 */
export function getServerId(url: string | undefined): ApiServerId | undefined {
  if (! url) {
    return
  }

  const match = url.match(/^https?:\/\/w([0-9.]+)[a-z].kancolle-server.com\//)
  if (! match) {
    return
  }

  const id = Number(match[1])
  if (isNaN(id)) {
    return
  }

  const ids = Object.entries(ApiServerId)
  const ret = ids.find((v) => id ===v[1])
  return ret ? ret[1] : undefined
}
