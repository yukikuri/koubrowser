import { reactive } from 'vue'
import { Quest } from '@common/record'
interface Quests {
  list: Quest[]
}
export const quests: Quests = reactive({ list: [] })
