import {
  Slot, 
  KcsUtil, 
  ApiShip, 
  ApiSoku, 
  MstShipBase, 
  MapAreaId, 
  InvalidMstShipBase, 
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
} from '@/lib/kcs';
import { EnemyEtc, enemy_etcs } from '@/lib/enemy_etc';
import { svdata } from '@/renderer/store/svdata';
import { DeckNames, QuestTypeText, QuestTypeTextYear, SyateiText } from '@/lib/locale';

export interface DeckInfo {
  name: string;
  deck: ApiDeckPort;
  inMission: boolean;
}

export interface EnemyInfo {
  readonly area_id: MapAreaId;
  readonly area_no: number;
  readonly cell_no: number;
  readonly enemy: number[];
  readonly aa: number;
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
  api_luck: 0,
});

export interface EnemyStatusTxt {
  readonly api_kaih: string;
  readonly api_luck: string;
}

export interface EShipInfo {
  readonly status: EnemyEtc;
  readonly status_txt: EnemyStatusTxt;
}

const toQ = (v: number): string => {
   return isNaN(v) ? '?' : v.toString();
};

const getStatusTxt = (status: EnemyEtc): EnemyStatusTxt => {
  return {
    api_kaih: toQ(status.api_kaih),
    api_luck: toQ(status.api_luck),
  }
};

const invalidStatusTxt = (): EnemyStatusTxt => {
  return {
    api_kaih: '',
    api_luck: '',
  }
};
/**
 * 
 */
export class RUtil {

  public static readonly hp_class = ['', 'syouha', 'tyuuha', 'taiha'];

  /**
   * 
   * @param slot 
   */
  public static slotTypeImg(slot: Slot): string {
    if (! slot) {
      return '/img/slot/empty.png';
    }
    return `/img/slot/type${KcsUtil.slotitemImgType(slot.mst)}.png`;
  }

  /**
   * 
   * @param slot 
   */
  public static slotTypeImgMst(mst: MstSlotitem): string {
    return `/img/slot/type${KcsUtil.slotitemImgType(mst)}.png`;
  }

  /**
   * 
   */
  public static slotALevelImg(alv: number): string {
    return `/img/slot/alv/alv${alv}.png`;
  }

  /**
   * 
   * @param ship 
   */
  public static hpClass(ship: ApiShip): string {
    return RUtil.hp_class[KcsUtil.shipHpState(ship)];
  }

  /**
   * 
   * @param ship 
   */
  public static hpClasses(ship: ApiShip): object {
    const state = KcsUtil.shipHpState(ship);
    return {
       syouha: state === ShipHpState.syouha,
       tyuuha: state === ShipHpState.tyuuha,
       taiha: state === ShipHpState.taiha,
    };
  }

  /**
   * 
   * @param ship 
   */
  public static hpClassesTT(ship: ApiShip): object {
    const state = KcsUtil.shipHpState(ship);
    return {
       tyuuha: state === ShipHpState.tyuuha,
       taiha: state === ShipHpState.taiha,
    };
  }

  /**
   * 
   * @param id 
   * @param dmg 
   */
  public static shipBannerImg(id: number, dmg: boolean): string {
    if (dmg) {
      return `/img/ship-dmg/s${id}.png`;
    }
    return `/img/ship/s${id}.png`;
  }

  /**
   * 
   * @param id 
   */
  public static eshipBannerImg(id: number): string {
    return `/img/enemy/s${id}.png`;
  }

  /**
   * 
   * @param id 
   */
  public static weaponImg(id: number): string {
    return `/img/weapon/weapon${('00'+id).substr(-3)}.png`;
  }

  /**
   * 
   * @param id 
   */
  public static itemImg(id: number): string {
    return `/img/item/item${id}.png`;
  }
  /**
   * 
   * @param ship 
   */
  public static condClass(ship: ApiShip): string {
    const cond = ship.api_cond;
    if (cond > 49) {
      return 'cond-plus';
    }
    if (cond < 20) {
      return 'cond-minus2';
    }
    if (cond < 30) {
      return 'cond-minus1';
    }
    return '';
  }
  
  /**
   * 
   * @param ship 
   */
  public static sokuClass(ship: ApiShip): string {
    if (ship.api_soku === ApiSoku.teisoku) {
      return 'minus-color';
    }
    if (
      ship.api_soku === ApiSoku.kousoku_plus ||
      ship.api_soku === ApiSoku.saisoku
    ) {
      return 'plus-color';
    }
    return '';
  }

  public static fualClass(ship: ShipInfo): string {
    const fual = ship.api.api_fuel / ship.mst.api_fuel_max;
    if (fual <= 0.50) {
      return 'minus2-color';
    }
    if (fual <= 0.75) {
      return 'minus-color';
    }
    return '';
  }

  public static bullClass(ship: ShipInfo): string {
    const bull = ship.api.api_bull / ship.mst.api_bull_max;
    if (bull < 0.50) {
      return 'minus-color';
    }
    return '';
  }

  public static syateiClass(ship: ShipInfo): string {
    if (KcsUtil.isTTPlus(ship)) {
      return 'plus-color ttplus';
    }
    return ship.api.api_leng === ApiRange.tyoutyou ? 'plus-color' : '';
  }

  public static syateiText(ship: ShipInfo): string {
    if (KcsUtil.isTTPlus(ship)) {
      return SyateiText[ApiRange.tyoutyou_plus];
    }
    return SyateiText[ship.api.api_leng] ?? '';
  }

  public static evClass(ship: ShipInfo): string {
    const fual = ship.api.api_fuel / ship.mst.api_fuel_max;
    if (fual <= 0.40) {
      return 'minus2-color';
    }
    if (fual <= 0.75) {
      return 'minus-color';
    }
    return '';
  }
  
  public static deckInfos(): DeckInfo[] {
    return svdata.deckPorts.map((deckport, index) => ({
      name: DeckNames[index],
      deck: deckport,
      inMission: [MissionState.in as number, MissionState.completed].includes(deckport.api_mission[0]),
    }));
  }

  public static eshipInfoSafe(id: number): EShipInfo {
    const status = RRes.eshipStatusSafe(id);
    return { status , status_txt: getStatusTxt(status) };
  }

  public static eshipInfo(id: number): EShipInfo | undefined {
    const status = RRes.eshipStatus(id);
    if (status) {
      return { status, status_txt: getStatusTxt(status)};
    }
  }

  public static eshipInfos(ids: number[], fill6: boolean): EShipInfo[] {
    const ret = ids.map((id) => this.eshipInfoSafe(id));
    if (fill6 && ret.length <= 6) {
      for (let cnt = 6-ret.length; cnt > 0; --cnt) {
        ret.push(
          { status: InvalidEnemyShip(), status_txt: invalidStatusTxt() });
      }
    }
    return ret;
  }

  public static eshipSeiku(eship: Pick<EnemyEtc, 'api_onslot'>, msts: (MstSlotitem | undefined)[]): number {
    if (0 === eship.api_onslot.length) {
      return 0;
    }

    return msts.reduce((acc, mst, index) => {
      if (mst) {
        acc += KcsUtil.slotSeiku(mst, {}, eship.api_onslot[index] ?? 0);
      }
      return acc;
    }, 0);
  }

  public static questCategoryClass(quest: ApiQuest): object {
    const isSyutugeki = 
      quest.api_category === ApiQuestCategory.syutugeki || 
      quest.api_category === ApiQuestCategory.kakutyou ||
      quest.api_category === ApiQuestCategory.kakutyou2;
    return {
      'is-hensei': quest.api_category === ApiQuestCategory.hensei,
      'is-syutugeki': isSyutugeki,
      'is-ensyu': quest.api_category === ApiQuestCategory.ensyu,
      'is-ensei': quest.api_category === ApiQuestCategory.ensei,
      'is-hokyu-nukyo': quest.api_category === ApiQuestCategory.hokyu_nukyo,
      'is-kousyou': quest.api_category === ApiQuestCategory.kousyou,
      'is-kaisou': quest.api_category === ApiQuestCategory.kaisou,
    };
  }

  public static questTypeClass(quest: ApiQuest): object {
    const isYearly = quest.api_label_type > ApiQuestLabelTypeYearLy;
    return {
      'is-daily': !isYearly && quest.api_type === ApiQuestType.daily,
      'is-weekly': !isYearly && quest.api_type === ApiQuestType.weekly,
      'is-monthly': !isYearly && quest.api_type === ApiQuestType.monthly,
      'is-single': !isYearly && quest.api_type === ApiQuestType.single,
      'is-quarterly': !isYearly && quest.api_type === ApiQuestType.quarterly,
      'is-yearly': isYearly,
    };
  }

  public static questTypeText(quest: ApiQuest): string {
    if (quest.api_label_type > ApiQuestLabelTypeYearLy) {
      return QuestTypeTextYear;
    }
    return QuestTypeText[quest.api_type] ?? '?';
  }

  private static eship_slots: { [id: number]: MstSlotitem[] | undefined } = {};
  public static eshipMstSlots(enemy: EnemyEtc): MstSlotitem[] {
    const cache = this.eship_slots[enemy.api_id];
    if (cache) {
      return cache;
    }

    const msts = enemy.api_slot.reduce<MstSlotitem[]>((acc, el) => {
      const mst = svdata.mstSlotitem(el);
      if (mst) {
        acc.push(mst);
      }
      return acc;
    }, []);
    this.eship_slots[enemy.api_id] = msts;
    return msts;
  }
}

interface AAMap {
  [name: number]: number | undefined;
}

/**
 * 
 */
export class RRes {

  /**
   * 
   */
  public static eshipStatus(id: number): EnemyEtc | undefined {
    return enemy_etcs.find(el => el.api_id === id);
  }

  public static eshipStatusSafe(id: number): EnemyEtc {
    const eship = this.eshipStatus(id);
    return eship ? eship : InvalidEnemyShip();
  }

}
