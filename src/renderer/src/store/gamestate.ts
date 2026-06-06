import { reactive } from 'vue'
import { GameState } from '@common/state'
export const gameState = reactive(new GameState())
