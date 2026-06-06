import { AggregateShipType } from "@common/calc_record"
import { ApiFormation, ApiShipBacks, YCutin, YSCutin } from "@common/kcs"

export const SyateiText = ['', '短', '中', '長', '超長', '超長+'] as const

export const SokuText = ['', '低速', '高速', '高速+', '最速'] as const

export const FACutinText = ['主主', '主徹', '主電', '主副', '連撃', '海空', '瑞立'] as const

export const AACutinText = ['FBA', 'BBA', 'BA'] as const

export const SlotitemRareTextMap: { [key: number]: string } = {
  0: 'コモン',
  1: 'レア',
  2: 'ホロ',
  3: 'Sホロ',
  4: 'SSホロ',
  5: 'SSホロ',
  6: 'SSホロ+',
  7: 'SS++'
}

export type LongShortText = {
  long: string
  short: string
}
const longShortText = (long: string, short?: string): LongShortText => {
  return { long, short: short || long }
}
const YCutinText: { [key in YCutin] : { long: string, short: string } } = {
  [YCutin.COMMON_RENGEKI]: longShortText('夜連撃', '連撃'),
  [YCutin.COMMON_SYU3]: longShortText('主主(2.0)', '主主'),
  [YCutin.COMMON_SYU_FUKU]: longShortText('主副(1.75)', '主副'),
  [YCutin.COMMON_GYO2]: longShortText('魚雷(1.5)', '魚雷'),
  [YCutin.COMMON_SYU_GYO]: longShortText('主魚(1.3)', '主魚'),

  [YCutin.KUTIKU_SYU_GYO_DEN]: longShortText('主魚電(1.3)', '主魚電弱'),
  [YCutin.KUTIKU_SYU_GYO_DEN3_3]: longShortText('主魚電(2.0)', '主魚電強+'),
  [YCutin.KUTIKU_SYU_GYO_DEN2_3]: longShortText('主魚電(1.9)', '主魚電強+'),
  [YCutin.KUTIKU_SYU_GYO_DEN2_2]: longShortText('主魚電(1.8)', '主魚電強+'),
  [YCutin.KUTIKU_SYU_GYO_DEN3]: longShortText('主魚電(1.7)', '主魚電強'),
  [YCutin.KUTIKU_SYU_GYO_DEN2]: longShortText('主魚電(1.6)', '主魚電強'),

  [YCutin.KUTIKU_GYO_MI_DEN]: longShortText('魚見電(1.2)', '魚見電弱'),
  [YCutin.KUTIKU_GYO_MI_DEN3_3]: longShortText('魚見電(1.84)', '魚見電強+'),
  [YCutin.KUTIKU_GYO_MI_DEN2_3]: longShortText('魚見電(1.76)', '魚見電強+'),
  [YCutin.KUTIKU_GYO_MI_DEN2_2]: longShortText('魚見電(1.68)', '魚見電強+'),
  [YCutin.KUTIKU_GYO_MI_DEN3]: longShortText('魚見電(1.57)', '魚見電強'),
  [YCutin.KUTIKU_GYO_MI_DEN2]: longShortText('魚見電(1.5)', '魚見電強'),

  [YCutin.KUTIKU_MI_GYO2]: longShortText('魚水魚(1.5)', '魚水魚'),
  [YCutin.KUTIKU_MI_GYO_D]: longShortText('ド水魚(1.3)', 'ド水魚'),

  [YCutin.YAKAN_ZUIUN1]: longShortText('夜瑞(1.24)', '夜瑞'),
  [YCutin.YAKAN_ZUIUN1_DEN]: longShortText('夜瑞電(1.28)', '夜瑞電'),
  [YCutin.YAKAN_ZUIUN2]: longShortText('夜瑞2(1.32)', '夜瑞2'),
  [YCutin.YAKAN_ZUIUN2_DEN]: longShortText('夜瑞2電(1.36)', '夜瑞2電'),

  [YCutin.SENSUI_SGYO_SDEN]: longShortText('潜魚電(1.75)', '潜魚電'),
  [YCutin.SENSUI_SGYO2]: longShortText('潜魚(1.6)', '潜魚'),

 } as const

export const getYCutinText = (cutin: YCutin, isShort: boolean): string => {
  const text = YCutinText[cutin]
  if (!text) {
    return ''
  }
  return isShort ? text.short : text.long
}

export const isMaxYCutins: YCutin[] = [
  YCutin.COMMON_SYU3,
  YCutin.KUTIKU_SYU_GYO_DEN3,
  YCutin.KUTIKU_SYU_GYO_DEN2_3,
  YCutin.KUTIKU_SYU_GYO_DEN3_3,
  YCutin.KUTIKU_GYO_MI_DEN3,
  YCutin.KUTIKU_GYO_MI_DEN2_3,
  YCutin.KUTIKU_GYO_MI_DEN3_3,
  YCutin.YAKAN_ZUIUN1_DEN,
  YCutin.YAKAN_ZUIUN2_DEN,
  YCutin.SENSUI_SGYO_SDEN,
] as const

const YSCutinText: { [key in YSCutin] : LongShortText } = {
  [YSCutin.YAKOU]: longShortText('夜攻'),
  [YSCutin.SEN2_KOU1]: longShortText('戦戦攻(1.25)', '戦戦攻'),
  [YSCutin.SEN1_KOU1]: longShortText('戦攻(1.2)', '戦攻'),
  [YSCutin.SEN1_KOUSUISEI1]: longShortText('戦彗(1.2)', '戦彗'),
  [YSCutin.KOU1_KOUSUISEI1]: longShortText('攻彗(1.2)', '攻彗'),
  [YSCutin.SEN1_BAKU1]: longShortText('戦爆(1.2)', '戦爆'),
  [YSCutin.KOU1_BAKU1]: longShortText('攻爆(1.2)', '攻爆'),
  [YSCutin.BAKU1_KOUSUISEI1]: longShortText('爆彗(1.2)', '爆彗'),
  [YSCutin.SEN1_YAKANKOKU2]: longShortText('戦他他(1.18)', '戦他他'),
} as const

export const getYSCutinText = (cutin: YSCutin, isShort: boolean): string => {
  const text = YSCutinText[cutin]
  if (!text) {
    return ''
  }
  return isShort ? text.short : text.long
}

export const SenseiTaisenText = ['先制対潜', '自動対潜'] as const

export const DeckNames = ['第一艦隊', '第二艦隊', '第三艦隊', '第四艦隊'] as const

// 制空権
export const DispSeikuText = [
  '制空均衡', // kinkou = 0
  '制空権確保', // kakuho = 1
  '航空優勢', // yuusei = 2
  '航空劣勢', // ressei = 3
  '制空権喪失' // sousitu = 4
] as const

// 戦術
export const TacticsText = [
  '',
  '同航戦', // doukou = 1
  '反航戦', // hankou = 2
  'T字有利', // t_yuuri = 3
  'T字不利' // t_furi = 4
] as const

export function getTacticsText(tactics: number | undefined): string {
  if (tactics === undefined) {
    return ''
  }
  return TacticsText[tactics] || ''
}

export const QuestCategoryText = [
  '',
  '編成', // hensei: 1,
  '出撃', //  syutugeki: 2,
  '演習', // ensyu: 3,
  '遠征', // ensei: 4,
  '補/入', // hokyuu_nuukyo: 5,
  '工廠', // kousyou: 6,
  '改装', // kaisou: 7,
  '出撃', // 'kakutyou: 8,
  '出撃', // kakutyou2: 9,
  '出撃', // kakutyou3: 10
  '工廠' // kousyou2: 11,
] as const

export const QuestTypeText = [
  '',
  '日', // daily: 1,
  '週', // weekly: 2,
  '月', // monthly: 3,
  '単', // single: 4,
  '他' // quarterly: 5,
] as const

export const QuestTypeTextYear = '年' as const

export const MapLvText = ['', '丁', '丙', '乙', '甲'] as const

export const StateText = ['均衡', '確保', '優勢', '劣勢', '喪失'] as const
export function getStateText(seiku: number): string {
  return StateText[seiku] || ''
}

// 0:待機 1: 出撃 2:防空 3:退避 4:休息
export const AirbaseActionKindText = ['待機', '出撃', '防空', '退避', '休息'] as const

// 陣形
const FormationText = [
  '',
  '単縦陣', // 1
  '複縦陣', // 2
  '輪形陣', // 3
  '梯形陣', // 4
  '単横陣', // 5
  '警戒陣', // 6
  '', // 7
  '', // 8,
  '', // 9,
  '', // 10,
  '第一対潜警戒', // 11 第一警戒航行序列(対潜警戒)
  '第二前方警戒', // 12 第二警戒航行序列(前方警戒)
  '第三輪形陣', // 13 第三警戒航行序列(輪形陣)
  '第四戦闘隊形' // 14 第四警戒航行序列(戦闘隊形)
] as const

export function getFormationText(formationId: ApiFormation, errText: string): string {
  return FormationText[formationId] || errText
}

// 陣形
export const FormationShortText = [
  '',
  '単縦', // 1
  '複縦', // 2
  '輪形', // 3
  '梯形', // 4
  '単横', // 5
  '警戒', // 6
  '', // 7
  '', // 8,
  '', // 9,
  '', // 10,
  '第一', // 11 第一警戒航行序列(対潜警戒)
  '第二', // 12 第二警戒航行序列(前方警戒)
  '第三', // 13 第三警戒航行序列(輪形陣)
  '第四' // 14 第四警戒航行序列(戦闘隊形)
] as const

export function getFormationShortText(formation: number): string {
  return FormationShortText[formation] || ''
}

// 艦タイプ
export const ShipTypeText: { [key in AggregateShipType]: string } = {
  [AggregateShipType.nodrop]: 'ドロップなし',
  [AggregateShipType.unknown]: '不明',
  [AggregateShipType.senkan]: '戦艦級',
  [AggregateShipType.kubo]: '空母級',
  [AggregateShipType.jyujyun]: '重巡級',
  [AggregateShipType.keijyun]: '軽巡級',
  [AggregateShipType.kutikukan]: '駆逐艦',
  [AggregateShipType.kaiboukan]: '海防艦',
  [AggregateShipType.sensuikan]: '潜水艦',
  [AggregateShipType.hojo]: '補助'
} as const;

// レア度
export const ShipRareText: { [key in ApiShipBacks]: string } = {
  [ApiShipBacks.none]: '-',
  [ApiShipBacks.common1]: 'コモン',
  [ApiShipBacks.common2]: 'コモン',
  [ApiShipBacks.common3]: 'コモン',
  [ApiShipBacks.rare1]: 'レア',
  [ApiShipBacks.rare2]: 'レア',
  [ApiShipBacks.unique1]: 'ユニーク',
  [ApiShipBacks.unique2]: 'ユニーク',
  [ApiShipBacks.unique3]: 'ユニーク',
}
export function getShipRareText(rare: ApiShipBacks): string {
  if(rare > ApiShipBacks.unique3) {
    return ShipRareText[ApiShipBacks.unique3]
  }
  return ShipRareText[rare] || ''
}

// 偵察結果
export const AirSearchResultText = ['失敗', '成功', '大成功'] as const
export function getAirSearchResultText(result: number): string {
  return AirSearchResultText[result] || ''
}

