import {
  MapLv,
  ApiBattleResult,
  SvData,
  ApiEventId,
  ApiDeckPortId,
  ApiCreateItemWithParam,
  ApiCreateShipWithParam,
  ApiRemodelSlotWithParam,
  ApiItemId,
  ApiMap,
  ApiItemGetBase,
  ApiGetItem,
  ApiItemGetUseMst,
  ApiItemGetItemId,
  KcsUtil,
  ApiBattle,
  ApiHougeki,
  ApiHougekiMidnight,
  ApiNormalVsCombinedBattle,
  ApiMidnightSpBattle,
  ApiMidnightBattleType,
  ApiMissionClearResult,
  ApiMissionResult,
  PrvBattleInfo,
  BattleType,
  ApiQuest,
  ApiQuestState,
} from '@/lib/kcs'
import moment, { now } from 'moment';
import { isDeckMatch, questProgressDetailFormat } from '@/lib/kcquest';
import { svdata } from '@/main/svdata';
import { app } from 'electron';

// port
export interface PortRecord {
  date: string;
  [id: number]: number | undefined;
}

// drop ship and item
export interface DropRecord {
  mapId: number;
  cellId: number;
  isBoss: boolean;
  enemyFormation: number;
  mapLv: MapLv;
  shipId: number;
  shipName: string;
  shipCounts: number[];
  rank: string;
  questName: string;
  enemyDeckName: string;
  exp: number;
  baseExp: number;
  teitokuLv: number;
  firstClear: boolean;
  enemyShips1: number[];
  enemyShips2?: number[];
  origin: string;
  itemId: number;
  itemCount: number;
  date: string;
}

// slotitem info
export interface SlotitemInfo {
  slotitem_id: number;
  level: number;
  alv: number;
}

// ship info
export interface ShipInfo {
  shipId: number;
  lv: number;
  nowhp: number;
  maxhp: number;
  slotitem: SlotitemInfo[];
  onslot: number[];
  slotitemEx: undefined | null | SlotitemInfo;
  fuel: number;
  bull: number;
  cond: number;
  karyoku: number;
  soukou: number;
  raisou: number;
  kaihi: number;
  taiku: number;
  soku: number;
  taisen: number;
  sakuteki: number
  lucky: number;
}

// itemget
export interface ItemGetRecord {
  mapId: number;
  cellId: number;
  mapLv: MapLv;
  teitokuLv: number;
  airsearchResult: number; // api_airsearch -> api_result
  itemId: ApiItemId;
  itemCount: number;
  ships1: ShipInfo[];
  ships2?: ShipInfo[];
  origin: string;
  date: string;
}

// build item
export interface ItemRecord {
  items: number[];
  secretary: number;
  itemId: number;
  teitokuLv: number;
  successful: boolean;
  origin: string;
  date: string;
}

// build ship
export interface ShipRecord {
  kdockId: number;
  secretary: number;
  shipId: number;
  highspeed: number;
  teitokuLv: number;
  largeFlag: boolean;
  origin: string;
  items: number[];
  date: string;
}

// remodel item 
export interface RemodelRecord {
  successful: boolean;
  itemId: number;
  itemLevel: number;
  flagshipId: number;
  flagshipLevel: number;
  flagshipCond: number;
  consortId: number;
  consortLevel: number;
  consortCond: number;
  teitokuLv: number;
  certain: boolean;
  origin: string;
  date: string;
}

// mission result
interface GetItemInfo {
  id: ApiItemId;
  count: number;
}
export interface MissionRecord {
  clearResult: ApiMissionClearResult;
  mapareaName: string;
  questName: string;
  getMaterial: number[];
  ships: ShipInfo[];
  getItem1?: GetItemInfo;
  getItem2?: GetItemInfo;
  origin: string;
  date: string;
}

type EParam = [number | null, number | null, number | null, number | null, number | null, number | null]; // 火力, 雷装, 対空, 装甲, maxhp, afterhp,
interface EnemyParam {
  slot: number[];
  param: EParam;
}


export interface BattleRecord {
  uuid: string;
  index: number;
  mapId: number;
  cellId: number;
  isBoss: boolean;
  type: BattleType;
  mapLv: MapLv;
  ships1: ShipInfo[];
  ships2?: ShipInfo[];
  rank: string;
  exp: number;
  baseExp: number;
  teitokuLv: number;
  questName: string;
  enemyDeckName: string;
  firstClear: boolean;
  formations: number[];
  seiku: number;
  middayJson: string | null;
  midnightJson: string | null,
  drop: DropRecord;
  origin: string;
  date: string;
}

export const serverDate = (): Date => {
  const localTime = new Date();
  const serverTime = new Date(
    /* UTC */(localTime.getTime() + localTime.getTimezoneOffset() * 60000)
    + /* JST = UTC+9 */
    9 * 60000 * 60);
  return serverTime;
};

export const recordDate = (upload: boolean): string => {
  const date = serverDate();
  if (upload) {
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
  }
  return moment(date).format();
};

const toRecordMapId = (map: ApiMap): number =>
  map.api_maparea_id * 10 + map.api_mapinfo_no;

const damaged = (hps: number[], damages: number[] | null | undefined, offset: number = 0): void => {
  const hpLen = hps.length;
  damages?.forEach((damage, index) => {
    console.log('index:', index, 'damage:', damage, 'nowhp:', hps[index]);
    if (index < hpLen) {
      hps[offset + index] -= Math.floor(damage);
    }
  });
};


const hougekiDam = (hps: number[], hougeki: ApiHougeki | ApiHougekiMidnight | undefined | null): void => {
  if (!hougeki) {
    return;
  }

  console.log('>> hougeki damage info. hps:', hps, 'api_damage:', hougeki.api_damage, 'api_fd_list:', hougeki.api_df_list);
  hougeki.api_at_eflag.forEach((eflag, index) => {
    if (0 === eflag) {
      const df_list = hougeki.api_df_list[index];
      console.log('hougeki index:', index, 'eflags:', eflag, 'df_list:', df_list);
      const dmg = hougeki.api_damage[index];
      df_list?.forEach((df, df_index) => {
        console.log('gamage from, to:', index, df, 'to hp:', hps[df] ?? null, 'damage:', dmg?.[df_index] ?? null);
        if (df < hps.length) {
          hps[df] -= Math.floor(dmg?.[df_index] ?? 0);
        }
      });
    }
  });
  console.log('<< hougeki damage info. hps:', hps);
};

const calcMiddayDamage = (hps: number[], api_battle: ApiBattle): void => {

  const air_base_attack = api_battle.api_air_base_attack;
  const stage3_edam = api_battle.api_kouku?.api_stage3?.api_edam;
  const stage3_edam_combined = api_battle.api_kouku?.api_stage3_combined?.api_edam;
  const opening_atack_edam = api_battle.api_opening_atack?.api_edam;
  const opening_taisen_edam = api_battle.api_opening_taisen;
  const support_air_dam = api_battle.api_support_info?.api_support_airatack?.api_stage3.api_edam;
  const support_hourai_dam = api_battle.api_support_info?.api_support_hourai?.api_damage;
  const hougeki1 = api_battle.api_hougeki1;
  const hougeki2 = api_battle.api_hougeki2;
  const hougeki3 = api_battle.api_hougeki3;
  const raigeki_dam = api_battle.api_raigeki?.api_edam;

  //
  air_base_attack?.forEach((attack, index) => {
    {
      const edam = attack.api_stage3.api_edam;
      //console.log('>> air base attack:', index, ' dam:', edam, 'hps:', hps);
      damaged(hps, edam);
      //console.log('<< air base attack:', index, ' dam:', edam, 'hps:', hps);
    }

    {
      const edam = attack.api_stage3_combined?.api_edam;
      //console.log('>> air base attack combined:', index, ' dam:', edam, 'hps:', hps);
      damaged(hps, edam, 6);
      //console.log('<< air base attack combined:', index, ' dam:', edam, 'hps:', hps);
    }
  })
  
  //
  //console.log('>> stage3 dam:', stage3_edam, 'hps:', hps);
  damaged(hps, stage3_edam);
  //console.log('<< stage3 dam hps:', hps);

  //
  //console.log('>> stage3 dam combined:', stage3_edam_combined, 'hps:', hps);
  damaged(hps, stage3_edam_combined, 6);
  //console.log('<< stage3 dam combined hps:', hps);
  
  // 
  //console.log('>> support air dam:', support_air_dam, 'hps:', hps);
  damaged(hps, support_air_dam);
  //console.log('<< support air hps:', hps);

  // 
  //console.log('>> support hourai dam:', support_hourai_dam, 'hps:', hps);
  damaged(hps, support_hourai_dam);
  //console.log('<< support hourai dam hps:', hps);

  //
  //console.log('>> opening dam:', opening_atack_edam, 'hps:', hps);
  damaged(hps, opening_atack_edam);
  //console.log('<< opening dam hps:', hps);

  //
  //console.log('>> raigeki dam:', raigeki_dam, 'hps:', hps);
  damaged(hps, raigeki_dam);
  //console.log('<< raigeki dam hps:', hps);

  //
  //console.log('>> opening taisen dam:', opening_taisen_edam, 'hps:', hps);
  hougekiDam(hps, opening_taisen_edam);
  //console.log('<< opening taisen dam:', opening_taisen_edam, 'hps:', hps);

  // 
  //console.log('>> hougeki1 dam:', hougeki1, 'hps:', hps);
  hougekiDam(hps, hougeki1);
  //console.log('<< hougeki1 dam:', hougeki1, 'hps:', hps);

  // 
  //console.log('>> hougeki2 dam:', hougeki2, 'hps:', hps);
  hougekiDam(hps, hougeki2);
  //console.log('<< hougeki2 dam:', hougeki2, 'hps:', hps);

  //
  //console.log('>> hougeki3 dam:', hougeki3, 'hps:', hps);
  hougekiDam(hps, hougeki3);
  //console.log('<<  hougeki3 dam:', hougeki3, 'hps:', hps);
};

const calcMidnightDamage = (hps: number[], midnight: ApiMidnightBattleType): void => {

  //
  if (KcsUtil.isMidnightSpBattle(midnight)) {
    const sp = midnight as ApiMidnightSpBattle;
    const support_air_dam = sp.api_n_support_info?.api_support_airatack?.api_stage3.api_edam;
    const support_hourai_dam = sp.api_n_support_info?.api_support_hourai?.api_damage;
    damaged(hps, support_air_dam);
    damaged(hps, support_hourai_dam);
  }

  // friendly
  if (midnight.api_friendly_battle) {
    const hougeki = midnight.api_friendly_battle.api_hougeki;
    console.log('>> midnight hougeki friendly dam:', hougeki, 'hps:', hps);
    hougekiDam(hps, hougeki);
    console.log('<< midnight hougeki friendly dam:', hougeki, 'hps:', hps);  
  }

  // 
  console.log('>> midnight hougeki dam:', midnight.api_hougeki, 'hps:', hps);
  hougekiDam(hps, midnight.api_hougeki);
  console.log('<< midnight hougeki dam:', midnight.api_hougeki, 'hps:', hps);
};

const enemyParam = (arg: PrvBattleInfo): EnemyParam[] => {

  const ship_ke = arg.midday ? arg.midday.api_ship_ke : arg.midnight?.api_ship_ke ?? [];
  const eSlot = arg.midday ? arg.midday.api_eSlot : arg.midnight?.api_eSlot ?? [];
  const eParam = arg.midday ? arg.midday.api_eParam : arg.midnight?.api_eParam ?? [];
  const e_maxhps = arg.midday ? arg.midday.api_e_maxhps : arg.midnight?.api_e_maxhps ?? [];
  const e_nowhps = arg.midday ? arg.midday.api_e_nowhps : arg.midnight?.api_e_nowhps ?? [];
  const nowhps = e_nowhps.concat();

  if (KcsUtil.isBattle(arg.midday)) {
    calcMiddayDamage(nowhps, arg.midday as ApiBattle);
  }

  if (arg.midnight) {
    calcMidnightDamage(nowhps, arg.midnight);
  }

  return ship_ke.map((_, index) => {
    const prm = eParam[index];
    const param: EParam = [
      prm[0] ?? null,
      prm[1] ?? null,
      prm[2] ?? null,
      prm[3] ?? null,
      e_maxhps[index] ?? null,
      nowhps[index] ?? null,
    ];
    //console.log('enemy param slot:', eSlot[index], 'param:', param);
    return {
      slot: eSlot[index] ?? [],
      param,
    };
  });
};

interface EnemyState {
  id: number;
  hp: number;
}

export const calcEnemyHps = (arg: PrvBattleInfo): EnemyState[] => {

  const e_ship_ke = arg.midday ? arg.midday.api_ship_ke : arg.midnight?.api_ship_ke ?? [];
  const e_nowhps = arg.midday ? arg.midday.api_e_nowhps : arg.midnight?.api_e_nowhps ?? [];
  const ship_ke = e_ship_ke.concat();
  const nowhps = e_nowhps.concat();

  console.log('ship_ke', ship_ke, nowhps);

  const pushCombined = (battle: any): void => {
    if (Array.isArray(battle.api_ship_ke_combined) &&
       Array.isArray(battle.api_e_nowhps_combined)) {
      ship_ke.push(...(battle.api_ship_ke_combined) as number[]);
      nowhps.push(...(battle.api_e_nowhps_combined) as number[]);
    }
  };

  if (arg.midday) {
    pushCombined(arg.midday as any);
    console.log('ship_ke2', ship_ke, nowhps);
  } else if (arg.midnight) {
    pushCombined(arg.midnight as any);
    console.log('ship_ke3', ship_ke, nowhps);
  }

  if (KcsUtil.isBattle(arg.midday)) {
    calcMiddayDamage(nowhps, arg.midday as ApiBattle);
    console.log('ship_ke4', ship_ke, nowhps);
  }

  if (arg.midnight) {
    calcMidnightDamage(nowhps, arg.midnight);
    console.log('ship_ke5', ship_ke, nowhps);
  }

  const ret = ship_ke.map((el, index) => ({ id: el, hp: nowhps[index] ?? 9999 }));
  console.log('calc enemy hps', ret);
  return ret;
};

/*
const enemyParamCombined = (arg: PrvBattleInfo): EnemyParam[] => {

  const fParam = arg.midday ? arg.midday.api_fParam : arg.midnight?.api_fParam ?? [];
  const e_maxhps = arg.midday ? arg.midday.api_f_maxhps : arg.midnight?.api_f_maxhps ?? [];
  let e_nowhps = arg.midday ? arg.midday.api_e_nowhps : arg.midnight?.api_e_nowhps ?? [];
  const stage3_dam = arg.midday?.api_kouku?.api_stage3?.api_edam;
  const api_battle = KcsUtil.isBattle(arg.midday) ? (arg.midday as ApiBattle) : undefined;
  const opening_atack_dam = api_battle?.api_opening_atack?.api_edam;
  const hougeki1 = api_battle?.api_hougeki1;
  const hougeki2 = api_battle?.api_hougeki2;
  const hougeki3 = api_battle?.api_hougeki3;
  const raigeki_dam = api_battle?.api_raigeki?.api_edam;
  const midnight_hougeki = arg.midnight?.api_hougeki;

  e_nowhps = e_nowhps.map((hp, index) => {
    hp -= stage3_dam?.[index] ?? 0;
    hp -= opening_atack_dam?.[index] ?? 0;
    hp -= raigeki_dam?.[index] ?? 0;
    return hp;
  });
  e_nowhps = hougekiDam(e_nowhps, hougeki1);
  e_nowhps = hougekiDam(e_nowhps, hougeki2);
  e_nowhps = hougekiDam(e_nowhps, hougeki3);
  e_nowhps = hougekiDam(e_nowhps, midnight_hougeki);
  return fParam.map((param, index) => {
    const maxhp = e_maxhps[index] ?? -1;
    const nowhp = e_nowhps[index] ?? -1;
    param.push(maxhp);
    param.push(nowhp);
    return [param[0] ?? -1, param[1] ?? -1, param[2] ?? -1, param[3] ?? -1, maxhp, nowhp];
  });
};
*/

let _orign = '';
const getOrign = (): string => {
  if (_orign.length === 0) {
    _orign = 'koubrowser/'+app.getVersion();
  }
  return _orign;
};

const ApiItemIdsAdd = Object.entries(ApiItemId).map(ids => ids[1]).
  filter((id =>
    (id !== ApiItemId.fast_repair) &&
    (id !== ApiItemId.fast_build) &&
    (id !== ApiItemId.build_kit) &&
    (id !== ApiItemId.remodel_kit) &&
    (id !== ApiItemId.fual) &&
    (id !== ApiItemId.ammo) &&
    (id !== ApiItemId.steel) &&
    (id !== ApiItemId.buxite) &&
    (id !== ApiItemId.kagu_coin) &&
    (id !== ApiItemId.emergency_repair) &&
    (id !== ApiItemId.emergency_repair_god) &&
    (id !== ApiItemId.rice_ball) &&
    (id !== ApiItemId.offshore_supply) &&
    (id !== ApiItemId.special_rice_ball)
  ));

const toSlotitemInfo = (svdata: SvData, slotitem_id: number): SlotitemInfo | undefined => {
  const slotitem = svdata.slotitem(slotitem_id);
  if (!slotitem) {
    return;
  }
  return {
    slotitem_id: slotitem.api_slotitem_id,
    level: slotitem?.api_level ?? 0,
    alv: slotitem?.api_alv ?? 0,
  };
};

const toShipInfo = (svdata: SvData, ship_id: number): ShipInfo | undefined => {
  const ship = svdata.ship(ship_id);
  if (!ship) {
    return;
  }

  const slotitems: SlotitemInfo[] = [];
  for (let i = 0; i < ship.api_slot.length; ++i) {
    const slotitem_id = ship.api_slot[i];
    if (slotitem_id > 0) {
      const slotiteminfo = toSlotitemInfo(svdata, slotitem_id);
      if (!slotiteminfo) {
        return;
      }
      slotitems.push(slotiteminfo);
    }
    else {
      break;
    }
  }

  let exslotinfo = undefined;
  if (ship.api_slot_ex == -1) {
    exslotinfo = null;
  }
  if (ship.api_slot_ex > 0) {
    exslotinfo = toSlotitemInfo(svdata, ship.api_slot_ex);
    if (!exslotinfo) {
      return;
    }
  }
  return {
    shipId: ship.api_ship_id,
    lv: ship.api_lv,
    nowhp: ship.api_nowhp,
    maxhp: ship.api_maxhp,
    slotitem: slotitems,
    onslot: ship.api_onslot,
    slotitemEx: exslotinfo,
    fuel: ship.api_fuel,
    bull: ship.api_bull,
    cond: ship.api_cond,
    karyoku: ship.api_karyoku[0],
    soukou: ship.api_soukou[0],
    raisou: ship.api_raisou[0],
    kaihi: ship.api_kaihi[0],
    taiku: ship.api_taiku[0],
    soku: ship.api_soku,
    taisen: ship.api_taisen[0],
    sakuteki: ship.api_sakuteki[0],
    lucky: ship.api_lucky[0],
  }
};

const toShipsInfo = (svdata: SvData, ships: number[]): ShipInfo[] | undefined => {
  const ret: ShipInfo[] = [];
  for (let i = 0; i < ships.length; ++i) {
    const id = ships[i];
    if (-1 !== id) {
      const shipinfo = toShipInfo(svdata, id);
      if (!shipinfo) {
        return;
      }
      ret.push(shipinfo);
    }
  }
  return ret;
};

const toItemGetId = (itemget: ApiItemGetBase): { valid: boolean, id?: ApiItemId } => {
  const ret = (valid: boolean, id?: ApiItemId) => {
    return { valid, id };
  };
  if (itemget.api_usemst === ApiItemGetUseMst.material) {
    switch (itemget.api_id) {
      case ApiItemGetItemId.fual:
        return ret(true, ApiItemId.fual);
      case ApiItemGetItemId.ammo:
        return ret(true, ApiItemId.ammo);
      case ApiItemGetItemId.steel:
        return ret(true, ApiItemId.steel);
      case ApiItemGetItemId.buxite:
        return ret(true, ApiItemId.buxite);
      case ApiItemGetItemId.fastRepair:
        return ret(true, ApiItemId.fast_repair);
      case ApiItemGetItemId.fastBuild:
        return ret(true, ApiItemId.fast_build);
      case ApiItemGetItemId.buildKit:
        return ret(true, ApiItemId.build_kit);
      default:
        return ret(false);
    }
  }

  return ret(true, itemget.api_id as ApiItemId);
};

const toGetItem = (item: ApiGetItem | undefined, flags: ApiItemId[], index: number): GetItemInfo | undefined => {
  if (!item) {
    return;
  }

  if (-1 === item.api_useitem_id) {
    if (index < flags.length) {
      return { id: flags[index], count: item.api_useitem_count };
    }
    return;
  }
  return { id: item.api_useitem_id, count: item.api_useitem_count };
}

export class RecordUtil {

  public static toPortRecord(svdata: SvData): PortRecord | undefined {
    const basic = svdata.basic;
    if (!basic) {
      return;
    }

    const ret: PortRecord = {
      date: moment(serverDate()).format(),
    };


    const useitems = svdata.useitems;
    ret[ApiItemId.fual] = svdata.fual;
    ret[ApiItemId.ammo] = svdata.ammo;
    ret[ApiItemId.steel] = svdata.steel;
    ret[ApiItemId.buxite] = svdata.buxite;
    ret[ApiItemId.fast_repair] = svdata.fastRepair;
    ret[ApiItemId.fast_build] = svdata.fastBuild;
    ret[ApiItemId.build_kit] = svdata.buildKit;
    ret[ApiItemId.remodel_kit] = svdata.remodelKit;
    ret[ApiItemId.kagu_coin] = basic?.api_fcoin ?? -1;
    ret[ApiItemId.emergency_repair] = svdata.slotitemCount(42);
    ret[ApiItemId.emergency_repair_god] = svdata.slotitemCount(43);
    ret[ApiItemId.rice_ball] = svdata.slotitemCount(145);
    ret[ApiItemId.special_rice_ball] = svdata.slotitemCount(241);
    ret[ApiItemId.offshore_supply] = svdata.slotitemCount(146);

    ret[ApiItemId.teitoku_lv] = basic.api_level;
    ret[ApiItemId.teitoku_exp] = basic.api_experience;
    ret[ApiItemId.rank] = basic.api_rank;
    ret[ApiItemId.ship_count] = svdata.ships.length;
    ret[ApiItemId.slotitem_count] = svdata.slotitems.length;
    ret[ApiItemId.win_count] = basic?.api_st_win ?? -1;
    ret[ApiItemId.lose_count] = basic?.api_st_lose ?? -1;
    ret[ApiItemId.mission_count] = basic?.api_ms_count ?? -1;
    ret[ApiItemId.mission_success] = basic?.api_ms_success ?? -1;
    ret[ApiItemId.practice_count] = basic?.api_pt_win ?? -1;
    ret[ApiItemId.practice_lose] = basic?.api_pt_lose ?? -1;

    useitems.forEach(useitem => {
      if (ApiItemIdsAdd.includes(useitem.api_id)) {
        ret[useitem.api_id] = useitem.api_count;
      }
    });
    //ret[ApiItemId.ship_exp] = svdata.ships.reduce((acc, el) => acc+el.api_exp[0], 0);
    return ret;
  }

  public static toDropRecord(svdata: SvData, info: PrvBattleInfo): DropRecord | undefined {
    const result = info.result;
    if (!result) {
      return;
    }

    let ship_id = result.api_get_ship?.api_ship_id ?? -1;
    if (ship_id < 0 && !svdata.isShipDropable) {
      ship_id = -2;
    }
    let enemyShips2 = undefined;
    if (KcsUtil.isEnemyCombined(info.midday)) {
      enemyShips2 = (info.midday as any).api_ship_ke_combined;
    }

    const mst_ship = svdata.mstShip(ship_id);
    return {
      mapId: toRecordMapId(info.map),
      cellId: info.cell_no,
      isBoss: info.isBoss,
      enemyFormation: info.midday?.api_formation[1] ?? 0,
      mapLv: MapLv.none,
      shipId: ship_id,
      shipName: mst_ship?.api_name ?? '',
      shipCounts: ship_id === -1 ? [] : svdata.shipCounts(ship_id),
      rank: result.api_win_rank,
      questName: result.api_quest_name,
      enemyDeckName: result.api_enemy_info.api_deck_name,
      exp: result.api_get_exp,
      baseExp: result.api_get_base_exp,
      teitokuLv: result.api_member_lv,
      firstClear: result.api_first_clear !== 0,
      enemyShips1: info.midday?.api_ship_ke ?? [],
      enemyShips2: enemyShips2,
      origin: getOrign(),
      itemId: result.api_get_useitem?.api_useitem_id ?? -1,
      itemCount: result.api_get_useitem?.api_useitem_count ?? 0,
      date: recordDate(false),
    }
  }

  public static toBattleRecord(svdata: SvData, arg: PrvBattleInfo, drop: DropRecord): BattleRecord | undefined {

    const deck = svdata.battleDeck;
    const basic = svdata.basic;
    if (!deck || !basic) {
      return;
    }

    const ships1 = toShipsInfo(svdata, deck.api_ship);
    if (!ships1) {
      return;
    }

    let ships2: ShipInfo[] | undefined = undefined;
    if (svdata.isCombined) {
      const deck2st = svdata.deckPort(ApiDeckPortId.deck2st);
      if (!deck2st) {
        return;
      }
      ships2 = toShipsInfo(svdata, deck2st.api_ship);
    }

    /*
    const enemyShips1 = arg.midday?.api_ship_ke ?? [];
    const enemyParams1 = enemyParam(arg);
    let enemyShips2 = undefined;
    const enemyParams2 = undefined;
    if (KcsUtil.isCombinedBattle(arg.midday)) {
      enemyShips2 = (arg.midday as ApiCombinedBattle).api_ship_ke_combined;
    }
    */

    return {
      uuid: arg.uuid,
      index: arg.index,
      mapId: toRecordMapId(arg.map),
      cellId: arg.cell_no,
      isBoss: arg.isBoss,
      type: arg.battleType,
      mapLv: arg.mapLv,
      ships1: ships1,
      ships2: ships2,
      rank: arg.result?.api_win_rank ?? '',
      questName: arg.result?.api_quest_name ?? '',
      enemyDeckName: arg.result?.api_enemy_info.api_deck_name ?? '',
      exp: arg.result?.api_get_exp ?? -1,
      baseExp: arg.result?.api_get_base_exp ?? -1,
      teitokuLv: basic.api_level,
      firstClear: arg.result?.api_first_clear !== 0,
      formations: arg.midday?.api_formation ?? [],
      seiku: arg.midday?.api_kouku.api_stage1.api_disp_seiku ?? -1,
      middayJson: arg.middayJson ?? null,
      midnightJson: arg.midnightJson ?? null,
      drop: drop,
      origin: getOrign(),
      date: drop.date,
    };
  }

  public static toItemGetRecord(svdata: SvData, arg: ApiMap): ItemGetRecord[] | undefined {
    const itemget = arg.api_itemget;
    if (!itemget || !itemget.length) {
      if (!arg.api_itemget_eo_comment) {
        return;
      }
    }

    const deck = svdata.battleDeck;
    const basic = svdata.basic;
    if (!deck || !basic) {
      return;
    }

    const ships1 = toShipsInfo(svdata, deck.api_ship);
    if (!ships1) {
      return;
    }

    let ships2: ShipInfo[] | undefined = undefined;
    if (svdata.isCombined) {
      const deck2st = svdata.deckPort(ApiDeckPortId.deck2st);
      if (!deck2st) {
        return;
      }
      ships2 = toShipsInfo(svdata, deck2st.api_ship);
    }

    const date = recordDate(false);
    const airsearch_result = arg.api_airsearch?.api_result ?? -1;
    const mapId = toRecordMapId(arg);

    if (arg.api_itemget_eo_comment) {
      const item = arg.api_itemget_eo_comment;
      const itemId = toItemGetId(item);
      if (itemId.valid) {
        return [{
          mapId: mapId,
          cellId: arg.api_no,
          mapLv: MapLv.none,
          teitokuLv: basic.api_level,
          airsearchResult: airsearch_result,
          itemId: itemId.id!,
          itemCount: item.api_getcount,
          ships1: ships1,
          ships2: ships2,
          origin: getOrign(),
          date: date,
        }];
      }
    }

    if (itemget && itemget.length) {
      return itemget.map(item => {
        return {
          mapId: mapId,
          cellId: arg.api_no,
          mapLv: MapLv.none,
          teitokuLv: basic.api_level,
          airsearchResult: airsearch_result,
          itemId: toItemGetId(item).id!,
          itemCount: item.api_getcount,
          ships1: ships1,
          ships2: ships2,
          origin: getOrign(),
          date: date,
        }
      });
    }
  }

  public static toItemRecord(
    svdata: SvData,
    arg: ApiCreateItemWithParam): ItemRecord[] | undefined {
    const ship = svdata.deckSecretary(ApiDeckPortId.deck1st);
    const basic = svdata.basic;
    if (!ship || !basic.api_level) {
      return;
    }
    return arg.api_get_items.map((item) => {
      return {
        items: arg.items,
        secretary: ship.api_ship_id,
        itemId: item?.api_slotitem_id ?? -1,
        teitokuLv: basic.api_level,
        successful: item.api_id !== -1,
        origin: getOrign(),
        date: recordDate(false),
      }
    });
  }

  public static toShipRecord(
    svdata: SvData,
    arg: ApiCreateShipWithParam
  ): ShipRecord | undefined {
    const ship = svdata.deckSecretary(ApiDeckPortId.deck1st);
    const basic = svdata.basic;
    if (!ship || !basic.api_level) {
      return;
    }
    return {
      kdockId: arg.api_kdock_id,
      secretary: ship.api_ship_id,
      shipId: arg.api_ship_id,
      highspeed: arg.api_highspeed,
      teitokuLv: basic.api_level,
      largeFlag: 1 === arg.api_large_flag,
      origin: getOrign(),
      items: arg.api_items,
      date: recordDate(false)
    };
  }

  public static toRemodelRecord(
    svdata: SvData,
    arg: ApiRemodelSlotWithParam): RemodelRecord | undefined {
    const deck = svdata.deckPort(ApiDeckPortId.deck1st);
    const ship0 = svdata.ship(deck?.api_ship[0] ?? -1);
    const ship1 = svdata.ship(deck?.api_ship[1] ?? -1);
    const basic = svdata.basic;
    if (!deck || !ship0 || !ship1 || !basic.api_level) {
      return;
    }

    if (!arg.api_remodel_id[0]) {
      return;
    }

    return {
      successful: arg.api_remodel_flag !== 0,
      itemId: arg.api_remodel_id[0],
      itemLevel: arg.api_level,
      flagshipId: ship0.api_ship_id,
      flagshipLevel: ship0.api_lv,
      flagshipCond: ship0.api_cond,
      consortId: ship1.api_ship_id,
      consortLevel: ship1.api_lv,
      consortCond: ship1.api_cond,
      teitokuLv: basic.api_level,
      certain: arg.api_certain_flag !== 0,
      origin: getOrign(),
      date: recordDate(false),
    };
  }

  public static toMissionRecord(
    svdata: SvData,
    arg: ApiMissionResult): MissionRecord | undefined {

    const ships = toShipsInfo(svdata, arg.api_ship_id);
    if (!ships) {
      return;
    }

    return {
      clearResult: arg.api_clear_result,
      mapareaName: arg.api_maparea_name,
      questName: arg.api_quest_name,
      getMaterial: arg.api_get_material,
      ships: ships,
      getItem1: toGetItem(arg.api_get_item1, arg.api_useitem_flag, 0),
      getItem2: toGetItem(arg.api_get_item2, arg.api_useitem_flag, 1),
      origin: getOrign(),
      date: recordDate(false),
    };
  }
}

export interface Quest<T extends any = any> {
  no: number;
  dateKey: string;
  date: string;
  quest: ApiQuest
  state: T;
}

export interface QuestCounter {
  count: number[];
  countMax: number[];
}

export const isQuestCounter = (state: any): boolean => {
  if (Array.isArray(state.count) && Array.isArray(state.countMax)) {
    return ((state.count as number[]).length === (state.countMax as number[]).length)
  }
  return false;
};

export const questCounter = (count: number[], countMax: number[]): QuestCounter => ({
  count: count.slice(),
  countMax: countMax.slice(),
});

export type QuestState = QuestCounter | object;

// -1: error, 0, 100: valid
export const questProgress = (quest: Quest): number => {

  if (quest.quest.api_state === ApiQuestState.completed) {
    return 100;
  }

  if (quest.state) {
    if (isQuestCounter(quest.state)) {
      const state = quest.state as QuestCounter;
      const total = state.count.reduce((acc, el) => acc + el, 0);
      const totalMax = state.countMax.reduce((acc, el) => acc + el, 0);
      return Math.floor((total / totalMax) * 100);
    }
  }

  return [0, 50, 80]?.[quest.quest.api_progress_flag] ?? 0;
}

export const questProgressDetail = (quest: Quest): string => {
  return questProgressDetailFormat(quest);
}

export const questIsDeckMatch = (svdata: SvData, quest: Quest): boolean | undefined => {
  return isDeckMatch(svdata, quest);
}
