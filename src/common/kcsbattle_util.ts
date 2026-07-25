import { type ApiDeckPort, ApiDeckPortId, SvData } from "@common/kcs"
import { type AfterBattleFleetHpsInfo } from "@common/message";
import { calcFleetHps } from "@common/kcsbattle";

/////////////////////////////////////////////////////////////////////////////////////
// デバッグログ
const DEBUG = 0;

const debug = (...args: any[]) => {
  if (DEBUG) console.debug("[KcBattleUtil]", ...args);
};

/**
 * 
 * @param svdata 
 * @returns 
 */
export function getAfterBattleFleetHpsInfo(svdata: SvData): AfterBattleFleetHpsInfo | undefined {

  const lastBattle = svdata.lastBattle
  if (!lastBattle) {
    return
  }

  const mapInfo = svdata.prvBattleMapInfo
  if (!mapInfo) {
    return
  }

  // 想定しない戦闘があったときに備え、例外はキャッチする
  try {

    // 戦闘内容から味方HPを計算する
    const fleetHps = calcFleetHps(lastBattle)
    return {
      deckId: mapInfo.deck_id,
      deck: fleetHps.deck,
      combined: fleetHps.combined
    }
  } catch (e) {
    console.error('updateFleetHps error:', e)
  }

  return 
}

/**
 * 
 * @param svdata 
 * @param deck 
 * @param hps 
 */
const updateHps = (svdata: SvData, deck: ApiDeckPort, hps: number[]) : void => {

  for (let i = 0; i < deck.api_ship.length; i++) {
    const ship = svdata.ship(deck.api_ship[i])
    if (ship) {
      const hp = hps[i]
      debug('updateHps shipId:', deck.api_ship[i], 'hp:', ship.api_nowhp, 'after:', hp)
      if (hp !== undefined) {
        Object.assign(ship, { api_nowhp: hp })
      }
    }
  }
}

/**
 * 戦闘後味方HP更新
 * 
 * @param svdata 
 * @param info 
 */
export function updateFleetHps(svdata: SvData, info: AfterBattleFleetHpsInfo): void {

  // 対象デッキの味方HPを更新する
  const deck = svdata.deckPort(info.deckId)
  if (deck) {
    debug('updateFleetHps deckId:', info.deckId, 'hps:', info.deck)
    updateHps(svdata, deck, info.deck)
  }

  // 出撃deck_idが1stで連合艦隊の場合は、第二艦隊の艦船HPも更新する
  if (info.deckId === ApiDeckPortId.deck1st && svdata.isCombined && info.combined) {
    const deck2 = svdata.deckPort(ApiDeckPortId.deck2st)
    if (deck2) {
      debug('updateFleetHps(combined) deckId:', ApiDeckPortId.deck2st, 'hps:', info.combined)
      updateHps(svdata, deck2, info.combined)
    }
  }
}
