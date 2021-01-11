export const SyateiText = [
  '', '短', '中', '長', '超長', '超長+'
] as const;

export const SokuText = [
  '', '低速', '高速', '高速+', '最速'
] as const;

export const FACutinText = [
  '主主', '主徹', '主電', '主副', '連撃', '海空', '瑞立' 
] as const;

export const AACutinText = [
  'FBA', 'BBA', 'BA' 
] as const;

export const YCutinText = [
  '主主CI',
  '主魚電CI(強++)', 
  '主副CI',
  '潜魚電CI',
  '主魚電CI(強+)',
  '主魚電CI(強)',
  '潜魚CI',
  '魚雷CI',
  '主魚電CI',
  '主魚CI',
  '魚見電CI',
  '夜戦連撃',
] as const;

export const YSCutinText = [
  '戦戦攻CI',
  '戦攻CI',
  '戦彗CI',
  '攻彗CI',
  '戦他CI',
  '夜攻',
] as const;

export const SenseiTaisenText = [
  '先制対潜', '自動先潜'
] as const;

export const DeckNames = [
  '第一艦隊', '第二艦隊', '第三艦隊', '第四艦隊'
] as const;

export const DispSeikuText = [
  '制空均衡', // kinkou = 0
  '制空権確保', // kakuho = 1
  '航空優勢', // yuusei = 2
  '航空劣勢', // ressei = 3
  '制空権喪失', // sousitu = 4
] as const;

export const TacticsText = [
  '',
  '同航戦', // doukou = 1
  '反航戦', // hankou = 2
  'T字有利', // t_yuuri = 3
  'T字不利', // t_furi = 4
] as const;

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
  '出撃', // kakutyou2: 9
] as const;

export const QuestTypeText = [
  '',
  '日', // daily: 1,
  '週', // weekly: 2,
  '月', // monthly: 3,
  '単', // single: 4,
  '他', // quarterly: 5, 
] as const;

export const QuestTypeTextYear = '年' as const;

export const MapLvText = [
  '',
  '丁',
  '丙',
  '乙',
  '甲'
] as const;

export const StateText = ['均衡', '確保', '優勢', '劣勢', '喪失'] as const;

// 0:待機 1: 出撃 2:防空 3:退避 4:休息
export const AirbaseActionKindText = [
  '待機',
  '出撃',
  '防空',
  '退避',
  '休息'
] as const;

// 陣形
export const FormationText = [
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
  '第三輪形陣',   // 13 第三警戒航行序列(輪形陣)
  '第四戦闘隊形', // 14 第四警戒航行序列(戦闘隊形)
] as const;
