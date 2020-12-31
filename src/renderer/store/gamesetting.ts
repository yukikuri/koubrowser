import Vue from 'vue'
import { GameSetting } from '@/lib/setting'
export const gameSetting: GameSetting = Vue.observable(new GameSetting());
