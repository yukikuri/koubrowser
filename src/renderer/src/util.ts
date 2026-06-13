import {
  Slot,
  KcsUtil,
  ApiShip,
  ApiSoku,
  MapAreaId,
  ApiDeckPort,
  MissionState,
  ShipHpState,
  ApiQuest,
  ApiQuestCategory,
  ApiQuestType,
  ApiQuestLabelTypeYearLy,
  MstSlotitem,
  ShipInfo,
  ApiRange,
  ApiItemId,
  InvalidApiDeckPort,
  ApiDeckPortId
} from '@common/kcs'
import { EnemyEtc, enemy_etcs } from '@common/enemy_etc'
import { svdata } from '@renderer/store/svdata'
import { DeckNames, QuestTypeText, QuestTypeTextYear, SyateiText } from '@common/locale'
import { ShipImg } from './stuff/imgs/ship'
import { SlotImg } from './stuff/imgs/slot'
import { ItemImg } from './stuff/imgs/item'

export const itemIdClassMap: Map<ApiItemId, string> = new Map(
  [
    [ApiItemId.kagu_small, 'kagu-small'],
    [ApiItemId.kagu_middle, 'kagu-middle'],
    [ApiItemId.kagu_large, 'kagu-large'],
    [ApiItemId.build_kit, 'build-kit'],
    [ApiItemId.remodel_kit, 'remodel-kit'],
    [ApiItemId.fast_build, 'fast-build'],
    [ApiItemId.fast_repair, 'fast-repair'],
    [ApiItemId.irako, 'irako']
  ]
)

export const itemIdTitleMap: Map<ApiItemId, string> = new Map(
  [
    [ApiItemId.kagu_small, '家具箱(小)'],
    [ApiItemId.kagu_middle, '家具箱(中)'],
    [ApiItemId.kagu_large, '家具箱(大)'],
    [ApiItemId.build_kit, '開発資材'],
    [ApiItemId.remodel_kit, '改修資材'],
    [ApiItemId.fast_build, '高速建造材'],
    [ApiItemId.fast_repair, '高速修復材'],
    [ApiItemId.irako, '伊良湖']
  ]
)

export interface DeckInfo {
  name: string
  deck: ApiDeckPort
  inMission: boolean
  seiku: number
  yusou: number
  isLock: boolean
}

export interface EnemyInfo {
  readonly area_id: MapAreaId
  readonly area_no: number
  readonly cell_no: number
  readonly enemy: number[]
  readonly aa: number
}

const InvalidEnemyShip = (): EnemyEtc => ({
  api_id: 0,
  api_name: '',
  api_yomi: '',
  api_stype: 0,
  api_ctype: 0,
  api_soku: 0,
  api_slot_num: 0,
  api_lv: 0,
  api_taik: 0,
  api_souk: 0,
  api_houg: 0,
  api_raig: 0,
  api_tyku: 0,
  api_leng: 0,
  api_slot: [],
  api_onslot: [],
  api_seiku: 0,
  api_kaih: 0,
  api_luck: 0
})

const MstEnemyShip = (api_id: number): EnemyEtc | undefined => {
  const mst = svdata.mstShip(api_id);
  if (! mst) {
    return
  }

  return {
    api_id: mst.api_id,
    api_name: mst.api_name,
    api_yomi: '',
    api_stype: mst.api_stype,
    api_ctype: mst.api_ctype,
    api_soku: 0,
    api_slot_num: mst.api_slot_num,
    api_lv: 0,
    api_taik: NaN,
    api_souk: NaN,
    api_houg: NaN,
    api_raig: NaN,
    api_tyku: NaN,
    api_leng: 0,
    api_slot: [],
    api_onslot: [],
    api_seiku: NaN,
    api_kaih: NaN,
    api_luck: NaN,
  }
}


export interface EnemyStatusTxt {
  readonly api_taik: string
  readonly api_souk: string
  readonly api_houg: string
  readonly api_raig: string
  readonly api_tyku: string
  readonly api_kaih: string
  readonly api_luck: string
  readonly api_seiku: string
}

export interface EShipInfo {
  readonly status: EnemyEtc
  readonly status_txt: EnemyStatusTxt
}

const toQ = (v: number): string => {
  return isNaN(v) ? '?' : v.toString()
}

const getStatusTxt = (status: EnemyEtc): EnemyStatusTxt => {
  return {
    api_taik: toQ(status.api_taik),
    api_souk: toQ(status.api_souk),
    api_houg: toQ(status.api_houg),
    api_raig: toQ(status.api_raig),
    api_tyku: toQ(status.api_tyku),
    api_kaih: toQ(status.api_kaih),
    api_luck: toQ(status.api_luck),
    api_seiku: toQ(status.api_seiku)
  }
}

const invalidStatusTxt = (): EnemyStatusTxt => {
  return {
    api_taik: '',
    api_souk: '',
    api_houg: '',
    api_raig: '',
    api_tyku: '',
    api_kaih: '',
    api_luck: '',
    api_seiku: '',
  }
}
/**
 *
 */
class RUtilImpl {
  public readonly hp_class = ['', 'syouha', 'tyuuha', 'taiha']

  /**
   *
   * @param slot
   */
  public slotTypeImg(slot: Slot): string {
    if (!slot) {
      return SlotImg.getEmptySrc()
    }
    return SlotImg.getTypeSrc(KcsUtil.slotitemImgType(slot.mst))
  }

  /**
   *
   * @param slot
   */
  public slotTypeImgSafe(mst: MstSlotitem | undefined | null): string {
    if (!mst) {
      return SlotImg.getEmptySrc();
    }
    return SlotImg.getTypeSrc(KcsUtil.slotitemImgType(mst))
  }

  /**
   *
   * @param slot
   */
  public slotTypeImgMst(mst: MstSlotitem): string {
    return SlotImg.getTypeSrc(KcsUtil.slotitemImgType(mst))
  }

  /**
   *
   */
  public slotALevelImg(alv: number): string {
    return SlotImg.getAlvSrc(alv)
  }

  /**
   *
   * @param ship
   */
  public hpClass(ship: ApiShip): string {
    return RUtil.hp_class[KcsUtil.shipHpState(ship)]
  }

  /**
   *
   * @param ship
   */
  public hpClasses(ship: ApiShip): object {
    const state = KcsUtil.shipHpState(ship)
    return {
      syouha: state === ShipHpState.syouha,
      tyuuha: state === ShipHpState.tyuuha,
      taiha: state === ShipHpState.taiha
    }
  }

  /**
   *
   * @param ship
   */
  public hpClassesTT(ship: ApiShip): object {
    const state = KcsUtil.shipHpState(ship)
    return {
      tyuuha: state === ShipHpState.tyuuha,
      taiha: state === ShipHpState.taiha
    }
  }

  /**
   *
   * @param id
   * @param dmg
   */
  public shipBannerImg(id: number | string, dmg: boolean, isCache: boolean): string {
    // todo: get img src from cache
    //if (isCache) {
    //  return Schemas.buildShipBannerUrl(id, dmg);
    //}

    return ShipImg.getSrc(id, dmg)
  }

  /**
   *
   */
  public get shipBannerNoCacheImg(): string {
    return ShipImg.getNoCacheSrc()
  }

  /**
   *
   * @param id
   */
  public eshipBannerImg(id: number): string {
    return ShipImg.getEnemySrc(id)
  }

  /**
   *
   * @param id
   */
  // public weaponImg(id: number, isCache: boolean): string {
  //   // todo: get img src from cache
  //   //if (isCache) {
  //   //  return Schemas.buildSlotCardUrl(id)
  //   //}
  //   const padding_id = id.toString().padStart(3, '0')
  //   return `./src/assets/img/weapon/weapon${padding_id}.png`
  // }

  // public get weaponImgNoCache(): string {
  //   return './src/assets/img/weapon/nocache.png'
  // }

  /**
   *
   * @param id
   */
  public itemImg(id: number): string {
    return ItemImg.getSrc(id)
  }

  /**
   *
   * @param ship
   */
  public condClass(ship: ApiShip): string {
    const cond = ship.api_cond
    if (cond > 49) {
      return 'cond-plus'
    }
    if (cond < 20) {
      return 'cond-minus2'
    }
    if (cond < 30) {
      return 'cond-minus1'
    }
    return ''
  }

  /**
   *
   * @param ship
   */
  public sokuClass(ship: ApiShip): string {
    if (ship.api_soku === ApiSoku.teisoku) {
      return 'minus-color'
    }
    if (ship.api_soku === ApiSoku.kousoku_plus || ship.api_soku === ApiSoku.saisoku) {
      return 'plus-color'
    }
    return ''
  }

  public fualClass(ship: ShipInfo): string {
    const fual = ship.api.api_fuel / ship.mst.api_fuel_max
    if (fual <= 0.5) {
      return 'minus2-color'
    }
    if (fual <= 0.75) {
      return 'minus-color'
    }
    return ''
  }

  public bullClass(ship: ShipInfo): string {
    const bull = ship.api.api_bull / ship.mst.api_bull_max
    if (bull < 0.5) {
      return 'minus-color'
    }
    return ''
  }

  public syateiClass(ship: ShipInfo): string {
    if (KcsUtil.isTTPlus(ship)) {
      return 'plus-color ttplus'
    }
    return ship.api.api_leng === ApiRange.tyoutyou ? 'plus-color' : ''
  }

  public syateiText(ship: ShipInfo): string {
    if (KcsUtil.isTTPlus(ship)) {
      return SyateiText[ApiRange.tyoutyou_plus]
    }
    return SyateiText[ship.api.api_leng] ?? ''
  }

  public evClass(ship: ShipInfo): string {
    const fual = ship.api.api_fuel / ship.mst.api_fuel_max
    if (fual <= 0.4) {
      return 'minus2-color'
    }
    if (fual <= 0.75) {
      return 'minus-color'
    }
    return ''
  }

  public deckInfos(): DeckInfo[] {
    const inMissionStates: MissionState[] = [
      MissionState.in,
      MissionState.completed,
      MissionState.stopped
    ]
    const ret = svdata.deckPorts.map((deckport, index) => ({
      name: DeckNames[index],
      deck: deckport,
      inMission: inMissionStates.includes(deckport.api_mission[0]),
      seiku: svdata.deckSeiku(deckport),
      yusou: svdata.deckYusou(deckport),
      isLock: false
    }))
    if (ret.length < 4) {
      const ids = [
        ApiDeckPortId.deck1st,
        ApiDeckPortId.deck2st,
        ApiDeckPortId.deck3st,
        ApiDeckPortId.deck4st
      ]
      for (let index = 4 - ret.length; index < 4; ++index) {
        ret.push({
          name: DeckNames[index],
          deck: InvalidApiDeckPort(ids[index]),
          inMission: false,
          seiku: 0,
          yusou: 0,
          isLock: true
        })
      }
    }
    return ret;
  }

  public eshipInfoSafe(id: number): EShipInfo {
    const status = RRes.eshipStatusSafe(id)
    return { status, status_txt: getStatusTxt(status) }
  }

  public eshipInfo(id: number): EShipInfo | undefined {
    const status = RRes.eshipStatus(id)
    if (status) {
      return { status, status_txt: getStatusTxt(status) }
    }
    return
  }

  public eshipInfos(ids: number[], fill6: boolean): EShipInfo[] {
    const ret = ids.map((id) => this.eshipInfoSafe(id))
    if (fill6 && ret.length <= 6) {
      for (let cnt = 6 - ret.length; cnt > 0; --cnt) {
        ret.push({ status: InvalidEnemyShip(), status_txt: invalidStatusTxt() })
      }
    }
    return ret
  }

  public eshipSeiku(
    eship: Pick<EnemyEtc, 'api_onslot'>,
    msts: (MstSlotitem | undefined)[]
  ): number {
    if (0 === eship.api_onslot.length) {
      return 0
    }

    return msts.reduce((acc, mst, index) => {
      if (mst) {
        acc += KcsUtil.slotSeiku(mst, {}, eship.api_onslot[index] ?? 0)
      }
      return acc
    }, 0)
  }

  public questCategoryClass(quest: ApiQuest): object {
    const isSyutugeki =
      quest.api_category === ApiQuestCategory.syutugeki ||
      quest.api_category === ApiQuestCategory.kakutyou ||
      quest.api_category === ApiQuestCategory.kakutyou2 ||
      quest.api_category === ApiQuestCategory.kakutyou3
    return {
      'is-hensei': quest.api_category === ApiQuestCategory.hensei,
      'is-syutugeki': isSyutugeki,
      'is-ensyu': quest.api_category === ApiQuestCategory.ensyu,
      'is-ensei': quest.api_category === ApiQuestCategory.ensei,
      'is-hokyu-nukyo': quest.api_category === ApiQuestCategory.hokyu_nukyo,
      'is-kousyou':
        quest.api_category === ApiQuestCategory.kousyou ||
        quest.api_category === ApiQuestCategory.kousyou2,
      'is-kaisou': quest.api_category === ApiQuestCategory.kaisou
    }
  }

  public questTypeClass(quest: ApiQuest): object {
    const isYearly = quest.api_label_type > ApiQuestLabelTypeYearLy
    return {
      'is-daily': !isYearly && quest.api_type === ApiQuestType.daily,
      'is-weekly': !isYearly && quest.api_type === ApiQuestType.weekly,
      'is-monthly': !isYearly && quest.api_type === ApiQuestType.monthly,
      'is-single': !isYearly && quest.api_type === ApiQuestType.single,
      'is-quarterly': !isYearly && quest.api_type === ApiQuestType.quarterly,
      'is-yearly': isYearly
    }
  }

  public questTypeText(quest: ApiQuest): string {
    if (quest.api_label_type > ApiQuestLabelTypeYearLy) {
      return QuestTypeTextYear
    }
    return QuestTypeText[quest.api_type] ?? '?'
  }

  private eship_slots: { [id: number]: MstSlotitem[] | undefined } = {}
  public eshipMstSlots(enemy: EnemyEtc): MstSlotitem[] {
    const cache = this.eship_slots[enemy.api_id]
    if (cache) {
      return cache
    }

    const msts = enemy.api_slot.reduce<MstSlotitem[]>((acc, el) => {
      const mst = svdata.mstSlotitem(el)
      if (mst) {
        acc.push(mst)
      }
      return acc
    }, [])
    this.eship_slots[enemy.api_id] = msts
    return msts
  }
}
export const RUtil = new RUtilImpl()

interface AAMap {
  [name: number]: number | undefined
}

export interface SpotMod {
  x: number
  y: number
}
export const modSpotXYData: { [key: string]: { [key: string]: SpotMod | undefined } | undefined } =
  {
    '1-1': {
      A: { x: -25, y: -15 },
      B: { x: 0, y: -5 },
      C: { x: 5, y: 0 }
    },
    '1-2': {
      A: { x: -25, y: -17 },
      C: { x: -15, y: -17 },
      D: { x: -25, y: -17 },
      E: { x: 10, y: 0 },
    },
    '1-3': {
      C: { x: -35, y: 20 },
      E: { x: -45, y: -5 },
      F: { x: -35, y: 20 },
      J: { x: -35, y: 25 }
    },
    '1-4': {
      B: { x: -35, y: -15 },
      D: { x: -40, y: 20 },
      H: { x: -10, y: -15 },
      I: { x: -75, y: -10 },
      J: { x: -35, y: 38 },
      L: { x: -15, y: -25 }
    },
    '1-5': {
      C: { x: -45, y: 0 }
    },
    '1-6': {
      B: { x: -65, y: 15 },
      C: { x: 8, y: 20 },
      D: { x: -60, y: -25 },
      E: { x: -35, y: 18 },
      F: { x: 10, y: -10 },
      I: { x: -20, y: -20 },
      K: { x: 8, y: 20 },
      J: { x: -70, y: -15 },
      L: { x: -80, y: -10 }
    },
    '2-1': {
      C: { x: -35, y: 18 },
      D: { x: -68, y: 25 },
      F: { x: -40, y: -20 },
      H: { x: 10, y: 0 },
    },
    '2-2': {
      K: { x: 10, y: 0 },
    },
    '2-3': {
      J: { x: -25, y: -15 },
      F: { x: -40, y: 15 },
      K: { x: -25, y: -15 },
      M: { x: -25, y: -15 },
      N: { x: -40, y: 40 }
    },
    '2-4': {
      E: { x: -25, y: -18 },
      F: { x: -40, y: -15 },
      I: { x: -35, y: 18 },
      M: { x: -70, y: -10 },
      L: { x: 8, y: 15 },
      P: { x: 10, y: 0 },
    },
    '2-5': {
      B: { x: -49, y: 0 },
      C: { x: -68, y: 25 },
      E: { x: -47, y: -5 },
      F: { x: -25, y: -17 },
      G: { x: -5, y: 10 },
      I: { x: -20, y: 5 },
      J: { x: -30, y: -18 },
      L: { x: 5, y: 15 },
      O: { x: 8, y: 0 }
    },
    '3-1': {
      B: { x: -25, y: -17 },
      C: { x: -35, y: 25 },
      D: { x: -75, y: -5 },
      G: { x: -40, y: -22 }
    },
    '3-2': {
      A: { x: -77, y: -15 },
      C: { x: -45, y: 15 },
      H: { x: -20, y: -15 },
      J: { x: -25, y: -20 },
      K: { x: -40, y: -15 },
      L: { x: 5, y: 5 }
    },
    '3-3': {
      A: { x: -40, y: 15 },
      B: { x: -35, y: 15 },
      E: { x: -40, y: -15 },
      K: { x: -35, y: 15 },
      G: { x: -80, y: 20 },
      M: { x: 5, y: 0 }
    },
    '3-4': {
      A: { x: -25, y: -15 },
      B: { x: 0, y: -2 },
      C: { x: -40, y: -15 },
      G: { x: 12, y: 13 },
      H: { x: -10, y: -13 },
      M: { x: -40, y: -15 },
      N: { x: -70, y: -7 },
      P: { x: -25, y: -15 }
    },
    '3-5': {
      B: { x: -35, y: -17 },
      D: { x: -40, y: -15 },
      E: { x: -40, y: -20 },
      F: { x: -38, y: 20 },
      G: { x: -45, y: -20 },
      H: { x: -45, y: -20 },
      K: { x: 10, y: 0 }
    },
    '4-1': {
      C: { x: -40, y: 15 },
      D: { x: -40, y: 20 },
      G: { x: -40, y: 15 },
      H: { x: -30, y: -15 },
      J: { x: -30, y: 40 }
    },
    '4-2': {
      B: { x: -37, y: 20 },
      C: { x: 10, y: 15 },
      D: { x: -80, y: 23 },
      E: { x: -75, y: -10 },
      H: { x: -37, y: 18 },
      J: { x: -35, y: 18 },
      G: { x: -45, y: -10 },
      L: { x: -35, y: 40 }
    },
    '4-3': {
      A: { x: -10, y: -15 },
      C: { x: 7, y: 10 },
      D: { x: -35, y: -15 },
      F: { x: 7, y: 20 },
      G: { x: -35, y: -18 },
      H: { x: 0, y: 11 },
      I: { x: -50, y: -15 },
      L: { x: -42, y: 17 },
      N: { x: -45, y: -15 }
    },
    '4-4': {
      A: { x: -23, y: -17 },
      B: { x: 5, y: 15 },
      E: { x: -35, y: 20 },
      F: { x: 7, y: 20 },
      G: { x: -40, y: -15 },
      H: { x: -85, y: 10 },
      I: { x: -45, y: -5 },
      K: { x: -70, y: 30 }
    },
    '4-5': {
      B: { x: 0, y: -5 },
      D: { x: 0, y: -7 },
      E: { x: 7, y: 12 },
      F: { x: 0, y: -3 },
      G: { x: 0, y: -3 },
      H: { x: -5, y: -5 },
      J: { x: -7, y: 0 },
      K: { x: -10, y: -10 },
      N: { x: -40, y: 17 },
      S: { x: -70, y: -10 },
      Q: { x: -5, y: 7 },
      T: { x: -40, y: -20 }
    },
    '5-1': {
      B: { x: -40, y: 15 },
      D: { x: -80, y: 25 },
      E: { x: -38, y: 17 },
      F: { x: -85, y: 15 },
      G: { x: -55, y: 42 },
      J: { x: -10, y: -20 }
    },
    '5-2': {
      C: { x: 7, y: 20 },
      D: { x: 0, y: -10 },
      E: { x: 7, y: 23 },
      F: { x: -20, y: -15 },
      K: { x: -37, y: 17 },
      I: { x: -65, y: 10 },
      L: { x: -45, y: -20 },
      O: { x: -80, y: 25 }
    },
    '5-3': {
      C: { x: -25, y: -17 },
      J: { x: -40, y: -15 },
      I: { x: -25, y: -20 },
      K: { x: -37, y: 20 },
      M: { x: 5, y: 0 },
      N: { x: -5, y: -12 },
      P: { x: 0, y: -2 },
      Q: { x: -80, y: 25 }
    },
    '5-4': {
      C: { x: -45, y: -10 },
      E: { x: -25, y: -17 },
      F: { x: 0, y: -1 },
      G: { x: -40, y: -15 },
      H: { x: -2, y: -10 },
      L: { x: -35, y: 15 },
      M: { x: -50, y: 5 },
      P: { x: 10, y: 5 }
    },
    '5-5': {
      B: { x: -23, y: -17 },
      C: { x: -45, y: 15 },
      K: { x: -75, y: -10 },
      J: { x: -75, y: -10 },
      H: { x: -35, y: -15 },
      G: { x: -5, y: -10 },
      M: { x: -40, y: 20 },
      N: { x: -23, y: -17 },
      P: { x: -40, y: -20 },
      O: { x: 10, y: 15 },
      S: { x: 10, y: 12 }
    },
    '5-6': {
      A: { x: -40, y: 20 },
      A1: { x: 0, y: -10 },
      A2: { x: -38, y: 18 },
      B: { x: -35, y: 15 },
      C: { x: -38, y: -16 },
      C1: { x: 8, y: 17 },
      C2: { x: -40, y: 20 },
      D: { x: 0, y: -8 },
      G: { x: -82, y: 15 },
      K: { x: -40, y: 15 },
      K1: { x: -40, y: 15 },
      H: { x: -10, y: -15 },
      J: { x: -10, y: -15 },
      L: { x: -0, y: -10 },
      N: { x: 10, y: 20 },
      K2: { x: -75, y: 12 },
      P: { x: -45, y: 10 },
      Q: { x: -38, y: 18 },
      Q1: { x: -65, y: -8 },
      Q2: { x: -5, y: -8 },
      T: { x: -5, y: -8 },
      U: { x: -38, y: 18 },
      V: { x: 3, y: 23 },
      W: { x: -40, y: 15 },
      X: { x: 8, y: 10},
      Z: { x: 8, y: 0 },
    },
    '6-1': {
      C: { x: -85, y: 5 },
      D: { x: 0, y: -10 },
      F: { x: 0, y: -15 },
      H: { x: -35, y: 20 },
      I: { x: 0, y: -15 },
      K: { x: 10, y: 10 }
    },
    '6-2': {
      B: { x: -70, y: -10 },
      C: { x: -85, y: 18 },
      F: { x: -85, y: 0 },
      H: { x: -75, y: -10 },
      I: { x: -75, y: -10 },
      J: { x: 10, y: 5 },
      K: { x: 10, y: 10 }
    },
    '6-3': {
      B: { x: -25, y: -17 },
      C: { x: 10, y: 10 },
      D: { x: 0, y: -15 },
      E: { x: -8, y: -15 },
      F: { x: 5, y: 10 },
      G: { x: 25, y: -40 },
      H: { x: -50, y: 0 },
      J: { x: 5, y: -5 }
    },
    '6-4': {
      B: { x: -50, y: 15 },
      C: { x: -98, y: 10 },
      D: { x: -40, y: -20 },
      E: { x: -25, y: -17 },
      F: { x: -85, y: 25 },
      G: { x: -45, y: -20 },
      H: { x: -60, y: -15 },
      I: { x: -45, y: -20 },
      J: { x: 0, y: -7 },
      K: { x: 15, y: 10 },
      L: { x: -40, y: -15 },
      M: { x: 0, y: -2 },
      N: { x: -100, y: -10 }
    },
    '6-5': {
      A: { x: -22, y: -15 },
      B: { x: -50, y: 20 },
      C: { x: -100, y: 20 },
      D: { x: -40, y: -20 },
      E: { x: -50, y: 15 },
      F: { x: -50, y: 20 },
      G: { x: -40, y: -20 },
      H: { x: -40, y: -20 },
      I: { x: 5, y: 15 },
      J: { x: -10, y: 35 },
      M: { x: -10, y: -15 }
    },
    '7-1': {
      B: { x: -75, y: 25 },
      C: { x: -40, y: -15 },
      G: { x: -25, y: -17 },
      H: { x: -25, y: -17 },
      K: { x: 5, y: 0 }
    },
    '7-2': {
      B: { x: -35, y: 17 },
      C: { x: -27, y: -18 },
      E: { x: 5, y: 5 },
      G: { x: 5, y: -5 },
      H: { x: 8, y: 30 },
      I: { x: -38, y: -15 },
      J: { x: 3, y: -2 },
      M: { x: 5, y: 0 }
    },
    '7-3': {
      B: { x: -35, y: 15 },
      C: { x: -45, y: 15 },
      D: { x: 0, y: -15 },
      E: { x: -40, y: 7 },
      J: { x: -25, y: -13 },
      M: { x: -5, y: -15 },
      N: { x: -40, y: 40 },
      P: { x: -52, y: 15 }
    },
    '7-4': {
      B: { x: -26, y: -18 },
      C: { x: -52, y: 15 },
      D: { x: -55, y: 35 },
      E: { x: -37, y: -22 },
      G: { x: -47, y: -17 },
      J: { x: -49, y: 20 },
      H: { x: -96, y: 15 },
      K: { x: -67, y: 5 },
      M: { x: -85, y: 28 },
      L: { x: -28, y: -17 },
      P: { x: 5, y: -15 },
    },
    '7-5': {
      A: { x: 10, y: 10 },
      D: { x: -5, y: -17 },
      E: { x: -22, y: -17 },
      K: { x: -42, y: -15 },
      J: { x: -23, y: -17 },
      N: { x: -26, y: -20 },
      Q: { x: -67, y: 32 },
      R: { x: -72, y: 27 },
      T: { x: -52, y: 5 },
    },
    '49-1': {
      B: { x: 5, y: 15 },
      C: { x: 0, y: 27 },
      D: { x: -20, y: -20 },
      H: { x: -35, y: -15 },
      J: { x: 10, y: 10 },
      K: { x: -30, y: -15 },
      G: { x: -25, y: -20 },
      L: { x: -50, y: -10 },
      O: { x: -35, y: 40 }
    },
    '49-2': {
      A: { x: -30, y: -15 },
      C: { x: -40, y: -14 },
      D: { x: -47, y: 0 },
      E: { x: -47, y: -2 },
      F: { x: -25, y: 40 },
      G: { x: -15, y: -20 },
      N: { x: 5, y: 0 },
      Q: { x: 5, y: 0 }
    },
    '49-3': {
      C: { x: -35, y: 20 },
      D: { x: -47, y: -5 },
      F: { x: -45, y: -20 },
      H: { x: -70, y: -15 },
      I: { x: -35, y: 15 },
      J: { x: -45, y: -15 },
      K: { x: 8, y: 15 },
      G: { x: -40, y: 35 },
      Q: { x: -40, y: 20 },
      P: { x: 5, y: 0 },
      R: { x: 7, y: 15 },
      T: { x: -35, y: 20 },
      X: { x: -55, y: -10 },
      Z: { x: -30, y: -10 }
    },
    '49-4': {
      A: { x: 5, y: 35 },
      R: { x: -85, y: 15 },
      S: { x: -10, y: -25 },
      B: { x: 5, y: 35 },
      F: { x: -35, y: 13 },
      H: { x: -35, y: 20 },
      I: { x: 0, y: -5 },
      J: { x: -35, y: 20 },
      K: { x: -40, y: -20 },
      G: { x: -40, y: -20 },
      L: { x: -40, y: 15 },
      Q: { x: -35, y: 0 },
      T: { x: 3, y: 15 },
      U: { x: 5, y: 10 },
      W: { x: 0, y: 35 },
      X2: { x: -5, y: -10 },
      Y1: { x: -5, y: -10 },
      Y2: { x: -35, y: -15 },
      Y3: { x: 0, y: 5 },
      Y5: { x: -75, y: 25 },
      Z: { x: -90, y: 0 }
    }
  } as const

export const modSpotXY = (area_id: number, area_no: number, label: string): SpotMod | undefined => {
  const mod = modSpotXYData[`${area_id}-${area_no}`]
  if (mod) {
    return mod[label]
  }
  return
}

/**
 *
 */
class RResImpl {
  /**
   *
   */
  public eshipStatus(id: number): EnemyEtc | undefined {
    return enemy_etcs.find((el) => el.api_id === id)
  }

  public eshipStatusSafe(id: number): EnemyEtc {
    const eship = this.eshipStatus(id)
    if (eship) {
      return eship
    }

    const mst = MstEnemyShip(id)
    if (mst) {
      return mst
    }
    return InvalidEnemyShip()
  }
}

export const RRes = new RResImpl()
