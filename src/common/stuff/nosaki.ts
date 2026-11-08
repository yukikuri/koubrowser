import { 
  type ApiDeckPort, 
  deckShipCount, 
  KcsUtil, 
  MissionState, 
  ShipHpState, 
  SvData } from "@common/kcs"

/////////////////////////////////////////////////////////////////////////////////////
// デバッグログ
const DEBUG = 0;

const debug = (...args: unknown[]): void => {
  if (DEBUG) console.debug("[Nosaki]", ...args);
};

/////////////////////////////////////////////////////////////////////////////////////
// 

// nosaki mst ship id
const nosakiShipIds: readonly number[] = [996, 1002] as const

export const NosakiCheckResult = {
  Disable: 0, // 野崎無効
  Enable: 1, // 野崎有効(野崎無効から野崎有効)
} as const
export type NosakiCheckResult = (typeof NosakiCheckResult)[keyof typeof NosakiCheckResult]

export type NosakiCheckResultContext = {
  result: typeof NosakiCheckResult.Enable
  // enable: deckid_ship_api_id1_ship_api_id2_...
  context: string
} | {
  result: typeof NosakiCheckResult.Disable
  context: ''
}

/**
 * 野崎チェック
 * 
 * 編成の状態はship idの文字列として返却することで、構成変更時のタイマーリセットを可能にする
 */
class NosakiStuff {

  static isDeckEnable(svdata: SvData, deckPort: ApiDeckPort): { enabled: boolean, index: number} {

    // in mission
    if (deckPort.api_mission[0] !== MissionState.no) {
      debug("nosaki check. Deck is in mission")
      return { enabled: false, index: -1 }
    }

    const ship_ids = deckPort.api_ship.filter(el => el > 0)
    if (deckShipCount(ship_ids) < 1) {
      debug("nosaki check. Deck has less than 1 ship")
      return { enabled: false, index: -1 }
    }

    // check flagship ships, secound ship in the deck
    const index = ship_ids.slice(0, 2).findIndex(el => {
      const api = svdata.ship(el)
      if (! api) {
        return false
      }

      const mst = svdata.mstShip(api.api_ship_id)
      if (! mst) {
        return false 
      }

      if (! nosakiShipIds.includes(mst.api_id)) {
        return false
      }

      // check hokyuu
      if (api.api_fuel !== mst.api_fuel_max) {
        debug("nosaki check. Ship fuel is not full")
        return false
      }
      if (api.api_bull !== mst.api_bull_max) {
        debug("nosaki check. Ship ammunition is not full")
        return false
      }

      // check damage
      const state = KcsUtil.shipHpState(api)
      if (state === ShipHpState.syouha || state === ShipHpState.taiha) {
        debug("nosaki check. Ship is damaged")
        return false
      }

      // cond check
      if (api.api_cond < 30) {
        debug("nosaki check. Ship condition is below 30")
        return false
      }

      // check ndock
      if (svdata.ndocks.some(el => el.api_ship_id === api.api_id)) {
        debug("nosaki check. Ship is in ndock")
        return false
      }

      return true
    })

    debug("is deck enable. index:", index, 'deck id:', deckPort.api_id)
    return { enabled: index !== -1, index }
  }
  
  private static getContextString(deck: ApiDeckPort): string {
    const shipIds = deck.api_ship.join('_')
    return `${deck.api_id}_${shipIds}`
  }

  check(svdata: SvData): NosakiCheckResultContext {

    for (const deck of svdata.deckPorts) {

      const ret = NosakiStuff.isDeckEnable(svdata, deck)

      if (ret.enabled) {
        debug("nosaki enabled. deck id:", deck.api_id, "index:", ret.index)
        return {
          result: NosakiCheckResult.Enable,
          context: NosakiStuff.getContextString(deck)
        }
      }
    }

    debug("nosaki not enabled in any deck")
    return {
      result: NosakiCheckResult.Disable,
      context: ''
    }
  }
}

export const nosakiStuff: NosakiStuff = new NosakiStuff()
