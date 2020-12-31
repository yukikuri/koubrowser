import Vue from 'vue'
import { GameState } from '@/lib/state'
export const gameState: GameState = Vue.observable(new GameState());
