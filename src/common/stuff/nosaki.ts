import { 
  type ApiDeckPort, 
  type ApiDeckPortId, 
  deckShipCount, 
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
  EnableChanged: 2, // 野崎有効(野崎有効から野崎の配置が変更された場合、配置位置が2番から1番に変わったなど)
  EnableNoChange: 3 // 野崎有効(野崎有効だが配置に変更なし、野崎以外の配置変更など)
} as const
export type NosakiCheckResult = (typeof NosakiCheckResult)[keyof typeof NosakiCheckResult]

/**
 * 野崎チェック
 * 最後にチェックした情報を憶えておき、次回のチェックで変更があればタイマーはリセットする
 */
class NosakiStuff {

  private last_check: {
    deck_port_id: ApiDeckPortId
    index: number
  } | null = null

  static isDeckEnable(svdata: SvData, deckPort: ApiDeckPort): { enabled: boolean, index: number} {
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

      return nosakiShipIds.includes(mst.api_id)
    })

    debug("is deck enable. index:", index, 'deck id:', deckPort.api_id)
    return { enabled: index !== -1, index }
  }
  
  check(svdata: SvData): NosakiCheckResult {

    for (const deck of svdata.deckPorts) {

      const ret = NosakiStuff.isDeckEnable(svdata, deck)

      if (ret.enabled) {

        if (! this.last_check) {
          this.last_check = {
            deck_port_id: deck.api_id,
            index: ret.index
          }
          debug("nosaki enabled for the first time. deck id:", deck.api_id, "index:", ret.index)
          return NosakiCheckResult.Enable
        }

        // check if the last check is the same as the current one
        if (this.last_check.deck_port_id === deck.api_id && this.last_check.index === ret.index) {
          debug("nosaki enabled but no change. deck id:", deck.api_id, "index:", ret.index)
          return NosakiCheckResult.EnableNoChange
        }

        if (this.last_check.deck_port_id !== deck.api_id || this.last_check.index !== ret.index) {
          this.last_check = {
            deck_port_id: deck.api_id,
            index: ret.index
          }
          debug("nosaki enabled changed. deck id:", deck.api_id, "index:", ret.index)
          return NosakiCheckResult.EnableChanged
        }

        this.last_check = {
          deck_port_id: deck.api_id,
          index: ret.index
        }
        debug("nosaki enabled but no change. deck id:", deck.api_id, "index:", ret.index)
        return NosakiCheckResult.Enable
      }
    }
    debug("nosaki not enabled in any deck")
    return NosakiCheckResult.Disable
  }
}

export const nosakiStuff: NosakiStuff = new NosakiStuff()
