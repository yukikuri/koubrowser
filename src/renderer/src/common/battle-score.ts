/////////////////////////////////////////////////////////////////////////////////////
// eo 
export interface EoInfo {
  mapId: number;
  name: string;
  rate: number;
}
export const eoRates: EoInfo[] = [
  { mapId: 15, name: '1-5 鎮守府近海', rate: 75 },
  { mapId: 16, name: '1-6 鎮守府近海航路', rate: 75 },
  { mapId: 25, name: '2-5 沖ノ島沖', rate: 100 },
  { mapId: 35, name: '3-5 北方AL海域', rate: 150 },
  { mapId: 75, name: '7-5 ジャワ島沖', rate: 170 },
  { mapId: 45, name: '4-5 カレー洋リランカ島沖', rate: 180 },
  { mapId: 55, name: '5-5 サーモン海域北方', rate: 200 },
  { mapId: 56, name: '5-6 ラバウル方面海域', rate: 225 },
  { mapId: 65, name: '6-5 KW環礁沖海域', rate: 250 },
];

export function getEoRateByMapId(mapId: number): number {
  const rate = eoRates.find((er) => er.mapId === mapId);
  return rate?.rate ?? 0;
}


/////////////////////////////////////////////////////////////////////////////////////
// quest
export interface QuestInfo {
  no: number;
  name: string;
}
export const quarterlyQuests: QuestInfo[] = [
  { no: 284, name: '南西諸島方面「海上警備行動」発令！' },
  { no: 845, name: '発令！「西方海域作戦」' },
  { no: 854, name: '戦果拡張任務！「Z作戦」前段作戦' },
  { no: 872, name: '戦果拡張任務！「Z作戦」後段作戦' },
  { no: 888, name: '新編成「三川艦隊」、鉄底海峡に突入せよ！' },
  { no: 893, name: '泊地周辺海域の安全確保を徹底せよ！' },
  { no: 903, name: '拡張「六水戦」、最前線へ！' },
];
export const yearlyQuests: QuestInfo[] = [
  { no: 947, name: 'AL作戦' },
  { no: 948, name: '機動部隊決戦' },
];

export const eventQuests: QuestInfo[] = [
  { no: 955, name: '【梅雨任務拡張作戦】南方反攻望楼作戦を叩け！' },
]

export const isQuarterlyQuest = (questNo: number): boolean => {
  return !!quarterlyQuests.find((e) => e.no === questNo);
}

export const isYearlyQuest = (questNo: number): boolean => {
  return !!yearlyQuests.find((e) => e.no === questNo);
}

export const isEventQuest = (questNo: number): boolean => {
  return !!eventQuests.find((e) => e.no === questNo);
}
