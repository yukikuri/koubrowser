import { svdata } from "@renderer/store/svdata";
import { mapInfo as storeMapInfo } from '@renderer/store/mapinfo'
import { ApiDeckPort, ApiDeckPortId, ApiEventId, ApiEventKind, ApiGaugeType, ApiShip, KcsUtil, ShipHpState, SvData } from "@common/kcs";
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

export type TaihaShipInfo = {
  api_ship: ApiShip
  canEscape: boolean
  equips: EquipType[]
}

export type CheckTaihaSingekiResult =
  | {
      isTaihaSingeki: true
      infos: TaihaShipInfo[]
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
  canEscape: boolean
  api_ship: ApiShip
}
const filterTaihaShip = (svdata: SvData, deck: ApiDeckPort): TaihaShip[] => {

  const ships = deck.api_ship
  const escape = svdata.lastBattle?.result?.api_escape
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

      // 退避可能か？
      let canEscape = false
      if (escape) {
        let offset = 1;
        if ((deck.api_id === ApiDeckPortId.deck2st) &&
          svdata.isCombined) {
          offset = 7
        }
        canEscape = escape.api_escape_idx.includes(index+offset)
      }

      acc.push({
        index,
        canEscape,
        api_ship
      })
    }

    return acc;
  }, [])
}

const DameconSlotitemIds = [42, 43]

const isEquipDamegeControl = (svdata: SvData, ship: ApiShip): boolean => {
  const hasDamecon = ship.api_slot.some(slotitem_id => {
    const slotitem = svdata.slotitem(slotitem_id)
    if (!slotitem) {
      return false
    }
    return DameconSlotitemIds.includes(slotitem.api_slotitem_id)
  })

  if (hasDamecon) {
    return true
  }
  if (ship.api_slot_ex > 0) {
    const slotitem = svdata.slotitem(ship.api_slot_ex)
    if (slotitem) {
      return DameconSlotitemIds.includes(slotitem.api_slotitem_id)
    }
  }

  return false
}

export const TaihaCheckPhase = {
  afterBattle: 0, // 戦闘後
  afterMapNext: 1, // マップ移動後
} as const
export type TaihaCheckPhase = (typeof TaihaCheckPhase)[keyof typeof TaihaCheckPhase]

/**
 * 進撃前での大破艦が存在するかのチェック
 * 
 * @param checkPhase 
 * @returns 
 */
export function checkTaihaSingeki(checkPhase: TaihaCheckPhase): CheckTaihaSingekiResult {

  // 出撃中で判定する
  if (!svdata.inMap) {
    return { isTaihaSingeki: false }
  }

  // 出撃艦隊情報が無いとき判定しない
  const battleDeck = svdata.battleDeck
  if (!battleDeck) {
    return { isTaihaSingeki: false }
  }

  // マップ情報が無いとき判定しない
  const lastMap = svdata.lastMap
  if (! lastMap) {
    return { isTaihaSingeki: false }
  }

  // 戦闘後：行き止まりの場合は判定しない
  if (checkPhase === TaihaCheckPhase.afterBattle) {
    if (! lastMap.api_next) {
      return { isTaihaSingeki: false }
    }
  }

  // マップ移動後：行き止まりで戦闘マス以外は判定しない
  if (checkPhase === TaihaCheckPhase.afterMapNext) {
    if (! lastMap.api_next) {
      const noBattleEventId: ApiEventId[] = [
        ApiEventId.noevent,
        ApiEventId.getMaterial, 
        ApiEventId.imagination,
        ApiEventId.eoMaterialGet,
      ]
      if (noBattleEventId.includes(lastMap.api_event_id)) {
        return { isTaihaSingeki: false }
      }
    }
  }

  // 退避艦は除外し、大破艦が存在するか？
  // 存在すれば大破進撃
  const taihaShips = filterTaihaShip(svdata, battleDeck)

  // 旗艦が大破している場合でダメコンなしは強制で進撃できない
  // falseで返す
  const taihaFlagship = taihaShips.find(ts => ts.index === 0)
  if (taihaFlagship) {
    if (!isEquipDamegeControl(svdata, taihaFlagship.api_ship)) {
      return { isTaihaSingeki: false }
    }
  }

  // 出撃が第一艦隊で連合艦隊の場合は第二艦隊も判定する
  const taihaShips2: TaihaShip[] = []
  if (battleDeck.api_id == ApiDeckPortId.deck1st && svdata.isCombined) {
    const deck2 = svdata.deckPort(ApiDeckPortId.deck2st)
    if (deck2) {
      taihaShips2.push(...filterTaihaShip(svdata, deck2))
    }
  }

  // 旗艦大破でダメコンあり、他に大破艦が存在しなければ大破進撃ではない
  if (taihaFlagship && !taihaShips2.length) {
    if (isEquipDamegeControl(svdata, taihaFlagship.api_ship)) {
      if (taihaShips.length === 1) {
        return { isTaihaSingeki: false }
      }
    }
  }

  // 大破艦が存在すれば大破進撃
  // 大破艦装備情報を返す
  if (taihaShips.length || taihaShips2.length) {
    const infos: TaihaShipInfo[] = []
    taihaShips.forEach(taihaShip => {
      infos.push({
        api_ship: taihaShip.api_ship,
        canEscape: taihaShip.canEscape,
        equips: getEquipType(svdata, taihaShip.api_ship, 0 === taihaShip.index)
      })
    })
    taihaShips2.forEach(taihaShip => {
      infos.push({
        api_ship: taihaShip.api_ship,
        canEscape: taihaShip.canEscape,
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

/**
 * 現在のセルが以下のセルでtrueを返す
 * 
 * ・1-6.鎮守府近海航路 Bマス<br>
 * ・2-2.バシー海峡 Bマス<br>
 * ・3-1.モーレイ海 Bマス<br>
 * ・3-2.キス島沖 Aマス<br>
 * ・7-2.タウイタウイ泊地沖 Jマス<br>
 * ・5-6.ラバウル方面海域 Hマス
 * 
 * @returns 
 */
export function currentIsSafeCell(): boolean {

  // マップ情報が無いとき判定しない
  const lastMap = svdata.lastMap
  if (! lastMap) {
    return false
  }

  // 安全セル情報
  const safecells: {
    mapId: number
    cellIds: number[]
  }[] = [
    {
      mapId: 16, cellIds:[13]
    },
    {
      mapId: 22, cellIds:[2]
    },
    {
      mapId: 31, cellIds:[2]
    },
    {
      mapId: 32, cellIds:[1,13]
    },
    {
      mapId: 72, cellIds:[12]
    },
    {
      mapId: 56, cellIds:[18]
    }
  ] as const

  const mapId = lastMap.api_maparea_id * 10 + lastMap.api_mapinfo_no
  return safecells.some(sc => sc.mapId === mapId && sc.cellIds.includes(lastMap.api_no))
}
