import type { 
  ApiBattle, 
  ApiBattleBase, 
  ApiHougeki, 
  ApiHougekiMidnight, 
  ApiMiddayBattleType, 
  ApiMidnightBattleType, 
  ApiMidnightSpBattle, 
  ApiSortieAirBattle, 
  PrvBattleInfo
} from "@common/kcs"

/////////////////////////////////////////////////////////////////////////////////////
// デバッグログ
const DEBUG = 0;

const debug = (...args: unknown[]): void => {
  if (DEBUG) console.debug("[KcBattle]", ...args);
};

/////////////////////////////////////////////////////////////////////////////////////
// 
export interface AfterBattleFleetHps { 
  deck: number[];
  combined?: number[];
}

export interface EnemyState {
  id: number
  hp: number
}

/////////////////////////////////////////////////////////////////////////////////////
// type checkers
const hasAirBaseInjection = (
  battle: ApiMiddayBattleType
): battle is ApiBattle & { api_air_base_injection: NonNullable<ApiBattle['api_air_base_injection']> } => {
  return (battle as ApiBattle).api_air_base_injection !== undefined
}

const hasInjectionKouku = (
  battle: ApiMiddayBattleType
): battle is ApiBattle & { api_injection_kouku: NonNullable<ApiBattle['api_injection_kouku']> } => {
  return (battle as ApiBattle).api_injection_kouku !== undefined
}

const hasAirBaseAttack = (
  battle: ApiMiddayBattleType
): battle is ApiBattle & { api_air_base_attack: NonNullable<ApiBattle['api_air_base_attack']> } => {
  return Array.isArray((battle as ApiBattle).api_air_base_attack)
}

const hasOpeningAttack = (
  battle: ApiMiddayBattleType
): battle is ApiBattle & { api_opening_atack: NonNullable<ApiBattle['api_opening_atack']> } => {
  return (battle as ApiBattle).api_opening_atack != null
}

const hasOpeningTaisen = (
  battle: ApiMiddayBattleType
): battle is ApiBattle & { api_opening_taisen: NonNullable<ApiBattle['api_opening_taisen']> } => {
  return (battle as ApiBattle).api_opening_taisen != null
}

const hasSupportInfo = (
  battle: ApiMiddayBattleType
): battle is ApiBattle & { api_support_info: NonNullable<ApiBattle['api_support_info']> } => {
  return (battle as ApiBattle).api_support_info != null
}

const hasHougeki1 = (
  battle: ApiMiddayBattleType
): battle is ApiBattle & { api_hougeki1: NonNullable<ApiBattle['api_hougeki1']> } => {
  return (battle as ApiBattle).api_hougeki1 != null
}

const hasHougeki2 = (
  battle: ApiMiddayBattleType
): battle is ApiBattle & { api_hougeki2: NonNullable<ApiBattle['api_hougeki2']> } => {
  return (battle as ApiBattle).api_hougeki2 != null
}

const hasHougeki3 = (
  battle: ApiMiddayBattleType
): battle is ApiBattle & { api_hougeki3: NonNullable<ApiBattle['api_hougeki3']> } => {
  return (battle as ApiBattle).api_hougeki3 != null
}

const hasRaigeki = (
  battle: ApiMiddayBattleType
): battle is ApiBattle & { api_raigeki: NonNullable<ApiBattle['api_raigeki']> } => {
  return (battle as ApiBattle).api_raigeki != null
}

const hasKouku2 = (
  battle: ApiMiddayBattleType
): battle is ApiSortieAirBattle => {
  return 'api_kouku2' in battle
}

const isMidnightSpBattle = (v: ApiBattleBase): boolean => {
    return 'api_n_support_info' in v
}

/////////////////////////////////////////////////////////////////////////////////////
// 
export function damaged(
  hps: number[],
  damages: number[] | null | undefined,
  offset: number = 0
): void {
  const hpLen = hps.length
  damages?.forEach((damage, index) => {
    const target = offset + index
    debug('damaged index:', index, 'offset:', offset, 'damage:', damage, 'nowhp:', hps[target])
    if (target < hpLen) {
      hps[target] -= Math.floor(damage)
    }
  })
}

const CalcEFlag = {
  FleetAttackToEnemy: 0, // 味方から敵への攻撃を判定
  EnemyAttackToFleet: 1 // 敵から味方への攻撃を判定
} as const
type CalcEFlag = (typeof CalcEFlag)[keyof typeof CalcEFlag]
function hougekiDam(
  hps: number[],
  hougeki: ApiHougeki | ApiHougekiMidnight | undefined | null,
  calcEFlag: CalcEFlag
): void {
  if (!hougeki) {
    return
  }

  debug(
    '>> hougeki damage info. hps:',
    hps,
    'api_damage:',
    hougeki.api_damage,
    'api_fd_list:',
    hougeki.api_df_list
  )
  hougeki.api_at_eflag.forEach((eflag, index) => {
    if (calcEFlag === eflag) {
      const df_list = hougeki.api_df_list[index]
      debug('hougeki index:', index, 'eflags:', eflag, 'df_list:', df_list)
      const dmg = hougeki.api_damage[index]
      df_list?.forEach((df, df_index) => {
        debug(
          'gamage from, to:',
          index,
          df,
          'to hp:',
          hps[df] ?? null,
          'damage:',
          dmg?.[df_index] ?? null
        )
        if (df < hps.length) {
          hps[df] -= Math.floor(dmg?.[df_index] ?? 0)
        }
      })
    }
  })
  debug('<< hougeki damage info. hps:', hps)
}

function calcMiddayEtoFDamage(hps: number[], api_battle: ApiMiddayBattleType): void {
  const stage3_fdam = api_battle.api_kouku?.api_stage3?.api_fdam
  const stage3_fdam_combined = api_battle.api_kouku?.api_stage3_combined?.api_fdam

  //
  debug('>> stage3 dam(EtoF):', stage3_fdam, 'hps:', hps);
  damaged(hps, stage3_fdam)
  debug('<< stage3 dam(EtoF) hps:', hps);

  //
  debug('>> stage3 dam combined(EtoF):', stage3_fdam_combined, 'hps:', hps);
  damaged(hps, stage3_fdam_combined, 6)
  debug('<< stage3 dam combined(EtoF) hps:', hps);

  //
  if (hasKouku2(api_battle)) {
    const stage3_fdam2 = api_battle.api_kouku2?.api_stage3?.api_fdam
    const stage3_fdam_combined2 = api_battle.api_kouku2?.api_stage3_combined?.api_fdam

    //
    debug('>> stage3_2 dam(EtoF):', stage3_fdam2, 'hps:', hps);
    damaged(hps, stage3_fdam2)
    debug('<< stage3_2 dam(EtoF) hps:', hps);

    //
    debug('>> stage3_2 dam combined(EtoF):', stage3_fdam_combined2, 'hps:', hps);
    damaged(hps, stage3_fdam_combined2, 6)
    debug('<< stage3_2 dam combined(EtoF) hps:', hps);
  }

  //
  if (hasOpeningAttack(api_battle)) {
    const opening_atack_fdam = api_battle.api_opening_atack.api_fdam

    debug('>> opening dam(EtoF):', opening_atack_fdam, 'hps:', hps);
    damaged(hps, opening_atack_fdam)
    debug('<< opening dam(EtoF) hps:', hps);
  }

  //
  if (hasRaigeki(api_battle)) {
    const raigeki_dam = api_battle.api_raigeki.api_fdam

    debug('>> raigeki dam(EtoF):', raigeki_dam, 'hps:', hps);
    damaged(hps, raigeki_dam)
    debug('<< raigeki dam(EtoF) hps:', hps);
  }

  //
  if (hasOpeningTaisen(api_battle)) {
    const opening_taisen_dam = api_battle.api_opening_taisen

    debug('>> opening taisen dam(EtoF):', opening_taisen_dam, 'hps:', hps);
    hougekiDam(hps, opening_taisen_dam, CalcEFlag.EnemyAttackToFleet)
    debug('<< opening taisen dam(EtoF):', opening_taisen_dam, 'hps:', hps);
  }

  //
  if (hasHougeki1(api_battle)) {
    const hougeki1 = api_battle.api_hougeki1

    debug('>> hougeki1 dam(EtoF):', hougeki1, 'hps:', hps);
    hougekiDam(hps, hougeki1, CalcEFlag.EnemyAttackToFleet)
    debug('<< hougeki1 dam(EtoF) hps:', hougeki1, 'hps:', hps);
  }

  //
  if (hasHougeki2(api_battle)) {
    const hougeki2 = api_battle.api_hougeki2

    debug('>> hougeki2 dam(EtoF):', hougeki2, 'hps:', hps);
    hougekiDam(hps, hougeki2, CalcEFlag.EnemyAttackToFleet)
    debug('<< hougeki2 dam(EtoF):', hougeki2, 'hps:', hps);
  }

  //
  if (hasHougeki3(api_battle)) {
    const hougeki3 = api_battle.api_hougeki3

    debug('>> hougeki3 dam(EtoF):', hougeki3, 'hps:', hps);
    hougekiDam(hps, hougeki3, CalcEFlag.EnemyAttackToFleet)
    debug('<< hougeki3 dam(EtoF):', hougeki3, 'hps:', hps);
  }
}

export function calcMiddayFtoEDamage(hps: number[], api_battle: ApiMiddayBattleType): void {
  const stage3_edam = api_battle.api_kouku?.api_stage3?.api_edam
  const stage3_edam_combined = api_battle.api_kouku?.api_stage3_combined?.api_edam

  //
  if (hasAirBaseInjection(api_battle)) {
    const air_base_injection = api_battle.api_air_base_injection
    const stage3_edam = air_base_injection?.api_stage3?.api_edam
    const stage3_edam_combined = air_base_injection?.api_stage3_combined?.api_edam

    //
    debug('>> airbase injection stage3 dam(FtoE):', stage3_edam, 'hps:', hps);
    damaged(hps, stage3_edam)
    debug('<< airbase injection stage3 dam(FtoE) hps:', hps);

    //
    debug('>> airbase injection stage3 dam combined(FtoE):', stage3_edam_combined, 'hps:', hps);
    damaged(hps, stage3_edam_combined, 6)
    debug('<< airbase injection stage3 dam combined(FtoE) hps:', hps);
  }

  //
  if (hasInjectionKouku(api_battle)) {
    const injection_kouku = api_battle.api_injection_kouku
    const stage3_edam = injection_kouku?.api_stage3?.api_edam
    const stage3_edam_combined = injection_kouku?.api_stage3_combined?.api_edam

    //
    debug('>> injection kouku stage3 dam(FtoE):', stage3_edam, 'hps:', hps);
    damaged(hps, stage3_edam)
    debug('<< injection kouku stage3 dam(FtoE) hps:', hps);

    //
    debug('>> injection kouku stage3 dam combined(FtoE):', stage3_edam_combined, 'hps:', hps);
    damaged(hps, stage3_edam_combined, 6)
    debug('<< injection kouku stage3 dam combined(FtoE) hps:', hps);
  }

  //
  if (hasAirBaseAttack(api_battle)) {
    const air_base_attack = api_battle.api_air_base_attack
    air_base_attack.forEach((attack, index) => {
      {
        const edam = attack.api_stage3?.api_edam
        debug('>> air base attack(FtoE):', index, ' dam:', edam, 'hps:', hps);
        damaged(hps, edam)
        debug('<< air base attack(FtoE):', index, ' dam:', edam, 'hps:', hps);
      }

      {
        const edam = attack.api_stage3_combined?.api_edam
        debug('>> air base attack combined(FtoE):', index, ' dam:', edam, 'hps:', hps);
        damaged(hps, edam, 6)
        debug('<< air base attack combined(FtoE):', index, ' dam:', edam, 'hps:', hps);
      }
    })
  }

  //
  debug('>> stage3 dam(FtoE):', stage3_edam, 'hps:', hps);
  damaged(hps, stage3_edam)
  debug('<< stage3 dam(FtoE) hps:', hps);

  //
  debug('>> stage3 dam combined(FtoE):', stage3_edam_combined, 'hps:', hps);
  damaged(hps, stage3_edam_combined, 6)
  debug('<< stage3 dam combined(FtoE) hps:', hps);

  //
  if (hasKouku2(api_battle)) {
    const stage3_edam2 = api_battle.api_kouku2?.api_stage3?.api_edam
    const stage3_edam_combined2 = api_battle.api_kouku2?.api_stage3_combined?.api_edam

    //
    debug('>> stage3_2 dam(FtoE):', stage3_edam2, 'hps:', hps);
    damaged(hps, stage3_edam2)
    debug('<< stage3_2 dam(FtoE) hps:', hps);

    //
    debug('>> stage3_2 dam combined(FtoE):', stage3_edam_combined2, 'hps:', hps);
    damaged(hps, stage3_edam_combined2, 6)
    debug('<< stage3_2 dam combined(FtoE) hps:', hps);
  }

  //
  if (hasSupportInfo(api_battle)) {
    const support_air_dam = api_battle.api_support_info?.api_support_airatack?.api_stage3.api_edam
    const support_hourai_dam = api_battle.api_support_info?.api_support_hourai?.api_damage

    debug('>> support air dam(FtoE):', support_air_dam, 'hps:', hps);
    damaged(hps, support_air_dam)
    debug('<< support air dam(FtoE) hps:', hps);

    //
    debug('>> support hourai dam(FtoE):', support_hourai_dam, 'hps:', hps);
    damaged(hps, support_hourai_dam)
    debug('<< support hourai dam(FtoE) hps:', hps);
  }

  //
  if (hasOpeningAttack(api_battle)) {
    const opening_atack_edam = api_battle.api_opening_atack.api_edam

    debug('>> opening dam(FtoE):', opening_atack_edam, 'hps:', hps);
    damaged(hps, opening_atack_edam)
    debug('<< opening dam(FtoE) hps:', hps);
  }

  //
  if (hasRaigeki(api_battle)) {
    const raigeki_dam = api_battle.api_raigeki.api_edam

    debug('>> raigeki dam(FtoE):', raigeki_dam, 'hps:', hps);
    damaged(hps, raigeki_dam)
    debug('<< raigeki dam(FtoE) hps:', hps);
  }

  //
  if (hasOpeningTaisen(api_battle)) {
    const opening_taisen_dam = api_battle.api_opening_taisen

    debug('>> opening taisen dam(FtoE):', opening_taisen_dam, 'hps:', hps);
    hougekiDam(hps, opening_taisen_dam, CalcEFlag.FleetAttackToEnemy)
    debug('<< opening taisen dam(FtoE):', opening_taisen_dam, 'hps:', hps);
  }

  //
  if (hasHougeki1(api_battle)) {
    const hougeki1 = api_battle.api_hougeki1

    debug('>> hougeki1 dam(FtoE):', hougeki1, 'hps:', hps);
    hougekiDam(hps, hougeki1, CalcEFlag.FleetAttackToEnemy)
    debug('<< hougeki1 dam(FtoE) hps:', hougeki1, 'hps:', hps);
  }

  //
  if (hasHougeki2(api_battle)) {
    const hougeki2 = api_battle.api_hougeki2

    debug('>> hougeki2 dam(FtoE):', hougeki2, 'hps:', hps);
    hougekiDam(hps, hougeki2, CalcEFlag.FleetAttackToEnemy)
    debug('<< hougeki2 dam(FtoE):', hougeki2, 'hps:', hps);
  }


  //
  if (hasHougeki3(api_battle)) {
    const hougeki3 = api_battle.api_hougeki3

    debug('>> hougeki3 dam(FtoE):', hougeki3, 'hps:', hps);
    hougekiDam(hps, hougeki3, CalcEFlag.FleetAttackToEnemy)
    debug('<< hougeki3 dam(FtoE):', hougeki3, 'hps:', hps);
  }
}

const calcMidnightEtoFDamage = (hps: number[], midnight: ApiMidnightBattleType): void => {

  //
  debug('>> midnight hougeki dam(EtoF):', midnight.api_hougeki, 'hps:', hps)
  hougekiDam(hps, midnight.api_hougeki, CalcEFlag.EnemyAttackToFleet)
  debug('<< midnight hougeki dam(EtoF):', midnight.api_hougeki, 'hps:', hps)
}

const calcMidnightFtoEDamage = (hps: number[], midnight: ApiMidnightBattleType): void => {
  //
  if (isMidnightSpBattle(midnight)) {
    const sp = midnight as ApiMidnightSpBattle
    const support_air_dam = sp.api_n_support_info?.api_support_airatack?.api_stage3.api_edam
    const support_hourai_dam = sp.api_n_support_info?.api_support_hourai?.api_damage
    damaged(hps, support_air_dam)
    damaged(hps, support_hourai_dam)
  }

  // friendly
  if (midnight.api_friendly_battle) {
    const hougeki = midnight.api_friendly_battle.api_hougeki
    debug('>> midnight hougeki friendly dam(FtoE):', hougeki, 'hps:', hps)
    hougekiDam(hps, hougeki, CalcEFlag.FleetAttackToEnemy)
    debug('<< midnight hougeki friendly dam(FtoE):', hougeki, 'hps:', hps)
  }

  //
  debug('>> midnight hougeki dam(FtoE):', midnight.api_hougeki, 'hps:', hps)
  hougekiDam(hps, midnight.api_hougeki, CalcEFlag.FleetAttackToEnemy)
  debug('<< midnight hougeki dam(FtoE):', midnight.api_hougeki, 'hps:', hps)
}

/*
const enemyParam = (arg: PrvBattleInfo): EnemyParam[] => {
  const ship_ke = arg.midday ? arg.midday.api_ship_ke : (arg.midnight?.api_ship_ke ?? [])
  const eSlot = arg.midday ? arg.midday.api_eSlot : (arg.midnight?.api_eSlot ?? [])
  const eParam = arg.midday ? arg.midday.api_eParam : (arg.midnight?.api_eParam ?? [])
  const e_maxhps = arg.midday ? arg.midday.api_e_maxhps : (arg.midnight?.api_e_maxhps ?? [])
  const e_nowhps = arg.midday ? arg.midday.api_e_nowhps : (arg.midnight?.api_e_nowhps ?? [])
  const nowhps = e_nowhps.concat()

  if (KcsUtil.isBattle(arg.midday)) {
    calcMiddayDamage(nowhps, arg.midday as ApiBattle)
  }

  if (arg.midnight) {
    calcMidnightDamage(nowhps, arg.midnight)
  }

  return ship_ke.map((_, index) => {
    const prm = eParam[index]
    const param: EParam = [
      prm[0] ?? null,
      prm[1] ?? null,
      prm[2] ?? null,
      prm[3] ?? null,
      e_maxhps[index] ?? null,
      nowhps[index] ?? null
    ]
    //debug('enemy param slot:', eSlot[index], 'param:', param);
    return {
      slot: eSlot[index] ?? [],
      param
    }
  })
}
*/

export function calcFleetHps(arg: PrvBattleInfo): AfterBattleFleetHps {
  const f_nowhps = arg.midday ? arg.midday.api_f_nowhps : (arg.midnight?.api_f_nowhps ?? [])
  const deckShipCount = f_nowhps.length
  const nowhps = f_nowhps.concat()
  let combined = false

  type BattleWithCombinedHps = {
    api_f_nowhps_combined?: unknown
  }

  const hasCombinedHps = (battle: unknown): battle is BattleWithCombinedHps => {
    return (
      !!battle &&
      typeof battle === 'object' &&
      'api_f_nowhps_combined' in battle &&
      Array.isArray((battle as BattleWithCombinedHps).api_f_nowhps_combined)
    )
  }

  const pushCombined = (battle: unknown): void => {
    if (!hasCombinedHps(battle)) {
      return
    }
    if(!combined) {
      combined = true

      // 6隻に満たない場合NaNで6隻まで追加
      // api_fdamが12要素あるため
      while (nowhps.length < 6) {
        nowhps.push(NaN)
      }
    }
    nowhps.push(...(battle.api_f_nowhps_combined as number[]))
  }

  // 連合艦隊の場合、味方HPを追加
  if (arg.midday) {
    pushCombined(arg.midday)
    debug('calc fleet hps(midday combined):', nowhps)
  } else if (arg.midnight) {
    pushCombined(arg.midnight)
    debug('calc fleet hps(midnight combined):', nowhps)
  }

  debug('fleet nowhp', nowhps)

  // 昼戦で敵から味方へのダメージ計算
  if(arg.midday) {
    calcMiddayEtoFDamage(nowhps, arg.midday)
    debug('calc fleet hps(midday calced):', nowhps)
  }

  // 夜戦で敵から味方へのダメージ計算
  if (arg.midnight) {
    calcMidnightEtoFDamage(nowhps, arg.midnight)
    debug('calc fleet hps(midnight calced):', nowhps)
  }

  debug('calc fleet hps', nowhps)

  // 連合艦隊の場合、味方HPを分割
  if (combined) {
    const filtered = nowhps.filter((value) => !Number.isNaN(value))
    const deck = filtered.slice(0, deckShipCount)
    const combined = filtered.slice(deckShipCount)
    debug('calc fleet hps. deck:', deck, 'combined:', combined)
    return { deck, combined }
  }
  return { deck: nowhps }
}

const toHpNumber = (hp: number | string): number => {
  if (typeof hp === 'number') {
    return hp
  }

  const trimmed = hp.trim()
  if (trimmed === '') {
    return NaN
  }

  const value = Number(trimmed)
  return Number.isNaN(value) ? NaN : value
}

export function calcEnemyHps(arg: PrvBattleInfo): EnemyState[] {
  const e_ship_ke = arg.midday ? arg.midday.api_ship_ke : (arg.midnight?.api_ship_ke ?? [])
  const e_nowhps = arg.midday ? arg.midday.api_e_nowhps : (arg.midnight?.api_e_nowhps ?? [])
  const ship_ke = e_ship_ke.concat()
  const apiNowhps = e_nowhps.concat()

  debug('ship_ke', ship_ke, apiNowhps)

  type BattleWithCombinedHps = {
    api_ship_ke_combined?: unknown
    api_e_nowhps_combined?: unknown
  }

  const hasCombinedHps = (battle: unknown): battle is BattleWithCombinedHps => {
    return (
      !!battle &&
      typeof battle === 'object' &&
     'api_ship_ke_combined' in battle &&
      Array.isArray((battle as BattleWithCombinedHps).api_ship_ke_combined) &&
      'api_e_nowhps_combined' in battle &&
      Array.isArray((battle as BattleWithCombinedHps).api_e_nowhps_combined)
    )
  }

  const pushCombined = (battle: unknown): void => {
    if (hasCombinedHps(battle)) {
      ship_ke.push(...(battle.api_ship_ke_combined as number[]))
      apiNowhps.push(...(battle.api_e_nowhps_combined as number[]))
    }
  }

  if (arg.midday) {
    pushCombined(arg.midday)
    debug('calc enemy hps. ship_ke2:', ship_ke, apiNowhps)
  } else if (arg.midnight) {
    pushCombined(arg.midnight)
    debug('calc enemy hps. ship_ke3', ship_ke, apiNowhps)
  }

  const nowhps = apiNowhps.map(toHpNumber)

  if (arg.midday) {
    calcMiddayFtoEDamage(nowhps, arg.midday)
    debug('calc enemy hps. ship_ke4', ship_ke, nowhps)
  }

  if (arg.midnight) {
    calcMidnightFtoEDamage(nowhps, arg.midnight)
    debug('calc enemy hps. ship_ke5', ship_ke, nowhps)
  }

  const ret = ship_ke.map((el, index) => ({ id: el, hp: nowhps[index] ?? 9999 }))
  debug('calc enemy hps', ret)
  return ret
}

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

