import Vue from 'vue';
import { Quest } from '@/lib/record';
interface Quests {
  list: Quest[];
}
export const quests: Quests = Vue.observable({ list: [] });
