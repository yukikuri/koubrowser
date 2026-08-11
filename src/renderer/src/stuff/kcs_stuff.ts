import { svdata } from "@renderer/store/svdata";
import { mapInfo as storeMapInfo } from '@renderer/store/mapinfo'
import { ApiDeck, ApiDeckPort, ApiDeckPortId, ApiGaugeType, ApiShip, KcsUtil, ShipHpState, SvData } from "@common/kcs";
import { computed } from "vue";

export function isGimmickFlagDetected() {
  const ret = computed<boolean>(() => {
    return svdata.svdataRaw.gimmickFlagDetected;
  })
  return {computed: ret};
}

export function isMapChangeDetected() {
  const ret = computed<boolean>(() => {
    return svdata.svdataRaw.mapChangeDetected;
  })
  return {computed: ret};
}

// 輸送ゲージマップがある場合、輸送値を表示する
// 輸送値は常には表示しない
// 常に表示しないのは、表示が煩雑になることを避けるため
export function isShowYusou() {
  const ret = computed<boolean>(() => {
    const svdataMapInfos = svdata.mapinfos;
    if (svdataMapInfos.length) {
      return !!svdataMapInfos.some(mi => mi.api_gauge_type === ApiGaugeType.yusou)
    }
    return storeMapInfo.api_map_info.some(mi => mi.api_gauge_type === ApiGaugeType.yusou)
  });
  return {computed: ret};
}

export type TaihaEquipInfo = {
  api_ship: ApiShip
  equips: EquipType[]
}

export type CheckTaihaSingekiResult =
  | {
      isTaihaSingeki: true
      infos: TaihaEquipInfo[]
    }
  | {
      isTaihaSingeki: false
      infos?: never
    }

export const EquipType = {
  flagship_repair: 'flagship_repair',
  flagship_megami: 'flagship_megami',
  repair: 'repair',
  megami: 'megami',
} as const
export type EquipType  = (typeof EquipType)[keyof typeof EquipType]

/**
 * 
 * @param svdata 
 * @param ship 
 * @param isFlagship 
 * @returns 
 */
const getEquipType = (svdata: SvData, ship: ApiShip, isFlagship: boolean): EquipType[] => {

  const addEquip = (slotitem_id: number, equips: EquipType[]): void => {
    const slotitem = svdata.slotitem(slotitem_id)
    if (slotitem) {

      // 応急修理要員
      if (slotitem.api_slotitem_id === 42) {
        equips.push(isFlagship ? EquipType.flagship_repair : EquipType.repair)
      }

      // 女神
      if (slotitem.api_slotitem_id === 43) {
        equips.push(isFlagship ? EquipType.flagship_megami : EquipType.megami)
      }
    }

  };

  const equips: EquipType[] = ship.api_slot.reduce<EquipType[]>((acc, slotitem_id) => {
    addEquip(slotitem_id, acc)
    return acc
  }, []);

  if (ship.api_slot_ex > 0) {
    addEquip(ship.api_slot_ex, equips)
  }

  return equips
}

/**
 * 
 * @param svdata 
 * @param deck 
 * @returns 
 */
type TaihaShip = {
  index: number
  api_ship: ApiShip
}
const filterTaihaShip = (svdata: SvData, deck: ApiDeckPort): TaihaShip[] => {

  const ships = deck.api_ship
  return ships.reduce<TaihaShip[]>((acc, ship_id, index) => {

    // 連合艦隊第2旗艦は判定しない
    if (
      (deck.api_id === ApiDeckPortId.deck2st) && 
      (0 === index) &&
      svdata.isCombined
    ) {
      return acc
    }

    // 退避している場合は大破判定しない
    if (svdata.isShipEscaped(deck, index)) {
      return acc      
    }

    const api_ship = svdata.ship(ship_id)
    if (!api_ship) {
      return acc
    }

    if (KcsUtil.shipHpState(api_ship) == ShipHpState.taiha) {
      acc.push({
        index,
        api_ship
      })
    }

    return acc;
  }, [])
}

/**
 * 進撃前での大破艦が存在するかのチェック
 * 
 * @returns 
 */
export function checkTaihaSingeki(): CheckTaihaSingekiResult {

  // 出撃中で判定する
  if (!svdata.inMap) {
    return { isTaihaSingeki: false }
  }

  // 出撃艦隊情報が無いとき判定しない
  const battleDeck = svdata.battleDeck
  if (!battleDeck) {
    return { isTaihaSingeki: false }
  }

  // 行き止まりの場合は判定しない
  const lastMap = svdata.lastMap
  if (! lastMap) {
    return { isTaihaSingeki: false }
  }
  if (! lastMap.api_next) {
    return { isTaihaSingeki: false }
  }

  // 退避艦は除外し、大破艦が存在するか？
  // 存在すれば大破進撃
  const taihaShips = filterTaihaShip(svdata, battleDeck)

  // 出撃が第一艦隊で連合艦隊の場合は第二艦隊も判定する
  const taihaShips2: TaihaShip[] = []
  if (battleDeck.api_id == ApiDeckPortId.deck1st && svdata.isCombined) {
    const deck2 = svdata.deckPort(ApiDeckPortId.deck2st)
    if (deck2) {
      taihaShips2.push(...filterTaihaShip(svdata, deck2))
    }
  }

  // 大破艦が存在する場合は、装備情報を返す
  if (taihaShips.length || taihaShips2.length) {
    const infos: TaihaEquipInfo[] = []
    taihaShips.forEach(taihaShip => {
      infos.push({
        api_ship: taihaShip.api_ship,
        equips: getEquipType(svdata, taihaShip.api_ship, 0 === taihaShip.index)
      })
    })
    taihaShips2.forEach(taihaShip => {
      infos.push({
        api_ship: taihaShip.api_ship,
        equips: getEquipType(svdata, taihaShip.api_ship, false)
      })
    })
    return {
      isTaihaSingeki: true,
      infos
    }
  }

  return { isTaihaSingeki: false }
}
