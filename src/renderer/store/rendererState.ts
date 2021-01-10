import Vue from 'vue';
import { RendererState } from '@/lib/setting';
export const rendererState: RendererState = Vue.observable(new RendererState());
