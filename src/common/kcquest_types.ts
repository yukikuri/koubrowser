/**
 * クエストの種類
 */
export const QuestType = {
  practice: 'practice',
  practiceDeck: 'practiceDeck',
  nyukyo: 'nyukyo',
  collectItem: 'collectItem',
  collectItemCondition: 'collectItemCondition',
  mapStart: 'mapStart',
  mapStartDeck: 'mapStartDeck',
  battle: 'battle',
  battleEnemy: 'battleEnemy',
  battle214: 'battle214',
  battleMap: 'battleMap',
  battleMapDeck: 'battleMapDeck',
  mapGoal: 'mapGoal',
  gaugeClear: 'gaugeClear',
  missionStart: 'missionStart',
  mission: 'mission',
  missionSpecific: 'missionSpecific',
  kaisou: 'kaisou',
  kaisouUseType: 'kaisouUseType',
  kaisouUseId: 'kaisouUseId',
  kaisouUseIdToId: 'kaisouUseIdToId',
  kaisouUseTypeToId: 'kaisouUseTypeToId',
  kaisouUseCategoryToCategory: 'kaisouUseCategoryToCategory',
  kaisouUseCategoryToType: 'kaisouUseCategoryToType',
  hokyu: 'hokyu',
  remodel: 'remodel',
  createItem: 'createItem',
  destroyItem: 'destroyItem',
  destroyItemIdOrType: 'destroyItemIdOrType',
  createShip: 'createShip',
  destroyShip: 'destroyShip',
  hensei: 'hensei',
  slotitemCondition: 'slotitemCondition'
} as const
export type QuestType = (typeof QuestType)[keyof typeof QuestType]

/**
 * クエストキー
 */
export const QuestKey = {
  infer: 'infer', // クエストデータからキーを生成
  single: 'single',
  daily: 'daily',
  weekly: 'weekly',
  monthly: 'monthly',
  quarterly: 'quarterly',
  yearly: 'yearly'
} as const
export type QuestKey = (typeof QuestKey)[keyof typeof QuestKey]

