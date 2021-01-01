<template>
  <div class="titlebar" :class="{ 'is-taiha-singeki': isTaihaSingeki }">
    <div>
      <div class="icon-container" :style="iconContainerStyle">
        <img class="icon" :src="icon">
        <span class="kou-num kou-max" :class="{ kouMax: isKouMax }">{{kouNum}}</span>
      </div>
    </div>
    <div class="title-content" :class="{ dragable: isDragable }">
      {{title}}
    </div>
    <div class="titlebar-buttons head" :class="{ dragable: isDragable }">
      <div>
        <div class="titlebar-button assist" :class="{ checked: isAssistShown, disabled: !isAssistOk }" title="アシストを表示" @click="onAssist"><ShowAssistImage/></div>
      </div>
    </div>
    <div class="mapinfo" :class="{ dragable: isDragable }">
      <div class="mapinfo-content">
        <div class="map-in-out-img" :class="{ 'in-map': inMap }"><MapInOutImage/></div>
        <div>{{mapAreaText}}</div>
        <div class="timeline-button" :class="{ 'press': timeline_pressed }" title="タイムライン"><TimelineImage class="timeline-img"/>▼</div>
        <div>{{mapCellText}} {{dispSeikuText}} {{tacticsText}}</div>
      </div>
    </div>
    <div class="materials" :class="{ dragable: isDragable }">
      <div v-if="isMaterialOk" class="material-content">
        <div class="s-icon titlebar-fuel"><span>{{fual}}</span></div>
        <div class="s-icon titlebar-steel"><span>{{steel}}</span></div>
        <div class="s-icon titlebar-fast-repair"><span>{{fastRepair}}</span></div>
        <div class="s-icon titlebar-build-kit"><span>{{buildKit}}</span></div>
        <div class="s-icon titlebar-ship" :class="shipCountClass"><span>{{ship_count}}</span></div>
        <div class="s-icon titlebar-bull"><span>{{bull}}</span></div>
        <div class="s-icon titlebar-buxite"><span>{{buxite}}</span></div>
        <div class="s-icon titlebar-fast-build"><span>{{fastBuild}}</span></div>
        <div class="s-icon titlebar-remodel-kit"><span>{{remodelKit}}</span></div>
        <div class="s-icon titlebar-slotitem" :class="slotitemCountClass"><span>{{slotitem_count}}</span></div>
      </div>
    </div>
    <div class="titlebar-buttons" :class="{ dragable: isDragable, 'in-assist-main': inAssistMain }">
      <div>
        <div class="titlebar-button rec" :class="{ checked: isRecording, disabled: !isRecordReady }" title="録画を開始" @click="onRec"><RecImage/></div>
        <div class="titlebar-button" title="ツールを再読み込みします" @click="onRefreshAssist"><RefreshAssistImage/></div>
        <div class="titlebar-button" title="スクリーンショット・録画フォルダを開く" @click="onOpenCaptureFolder"><OpenCaptureFolderImage/></div>
        <div class="titlebar-button" title="スクリーンショット" @click="onScreenshot"><CaptureImage/></div>
        <div class="titlebar-button" :title="muteTitle" @click="onMute"><SoundOffImage v-if="isMute"/><SoundOnImage v-if="!isMute"/></div>
        <div class="titlebar-button" title="ページを再読み込みします" @click="onReload"><ReloadImage/></div>
        <div v-if="isProduction" class="titlebar-button" title="デベロッパー ツール" @click="onDevTool"><DevToolImage/></div>
        <div v-if="isProduction" class="titlebar-button" title="Game側デベロッパー ツール" @click="onGameDevTool"><GameDevToolImage/></div>
        <div class="titlebar-button" title="アシストウインドウを表示" @click="onOpenAssist"><OpenAssistImage/></div>
        <div class="titlebar-button" :class="{ checked: isTopMost }" title="常に最前面に表示する" @click="onTopMost"><TopMostImage/></div>
        <div class="titlebar-button" title="最小化" @click="onMinimize"><span>&#x2014;</span></div>
        <!--<div class="button" @click="onMaximize"><span>&#9744;</span></div>-->
        <div class="titlebar-button close" title="閉じる" @click="onClose"><span>&#10005;</span></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ipcRenderer } from 'electron';
import { Const } from '@/lib/const';
import { DispSeikuText, TacticsText } from '@/lib/locale';
import { MainChannel } from '@/lib/app';
import { AppStuff } from '@/lib/app';
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { gameSetting } from '@/renderer/store/gamesetting';
import MapInOutImage from '@/renderer/assets/map-in-out.svg';
import TimelineImage from '@/renderer/assets/timeline.svg';
import ArrowDropDownImage from '@/renderer/assets/arrow-drop-down.svg';
import ShowAssistImage from '@/renderer/assets/show-assist.svg';
import RecImage from '@/renderer/assets/rec.svg';
import RefreshAssistImage from '@/renderer/assets/refresh-assist.svg';
import OpenCaptureFolderImage from '@/renderer/assets/open-capture-folder.svg';
import CaptureImage from '@/renderer/assets/capture.svg';
import ReloadImage from '@/renderer/assets/reload.svg';
import DevToolImage from '@/renderer/assets/devtool.svg';
import GameDevToolImage from '@/renderer/assets/game-devtool.svg';
import OpenAssistImage from '@/renderer/assets/open-assist.svg';
import TopMostImage from '@/renderer/assets/topmost.svg';
import SoundOnImage from '@/renderer/assets/sound-on.svg';
import SoundOffImage from '@/renderer/assets/sound-off.svg';
import { gameState } from '@/renderer/store/gamestate';
import { svdata } from '@/renderer/store/svdata';
import { Api, ApiCallback, ApiDeckPortId, ApiShipType, KcsUtil, ShipHpState } from '@/lib/kcs';

@Component({
  components: {
    MapInOutImage,
    TimelineImage,
    ShowAssistImage,
    ArrowDropDownImage,
    RecImage,
    RefreshAssistImage,
    OpenCaptureFolderImage,
    CaptureImage,
    ReloadImage,
    DevToolImage,
    GameDevToolImage,
    OpenAssistImage,
    TopMostImage,
    SoundOnImage,
    SoundOffImage,
  },
})
export default class extends Vue {

  @Prop({required: true})
  public timeline_pressed!: boolean;

  private cb_map_next: number = 0;
  private cb_port: number = 0;
  private taiha_singeki: boolean = false;

  constructor() {
    super();
  }

  private get title(): string {
    if (this.isTaihaSingeki) {
      return '！大破進撃です！';
    }
    return '甲ブラウザ(仮)';
  }

  private get isTaihaSingeki(): boolean {
    return this.taiha_singeki;
  }

  private get icon(): string {
    return './img/icon.png';
  }

  private get isProduction(): boolean {
    return AppStuff.isProduction;
  }

  private get inAssistMain(): boolean {
    return gameSetting.assistInGame;
  }

  private get kouNum(): string {
    if (gameSetting.medals) {
      return `${gameSetting.medals}`;
    }
    return '';
  }
  
  private get isMaterialOk(): boolean {
    return isFinite(gameSetting.fual) && 
      isFinite(gameSetting.bull) && 
      isFinite(gameSetting.steel) && 
      isFinite(gameSetting.buxite) &&
      isFinite(gameSetting.fast_build) &&
      isFinite(gameSetting.fast_repair) &&
      isFinite(gameSetting.build_kit) &&
      isFinite(gameSetting.remodel_kit) &&
      isFinite(gameSetting.ship_count) &&
      isFinite(gameSetting.slotitem_count);
  }

  private get fual(): number {
    return gameSetting.fual;
  }
  
  private get bull(): number {
    return gameSetting.bull;
  }
  
  private get steel(): number {
    return gameSetting.steel;
  }

  private get buxite(): number {
    return gameSetting.buxite;
  }

  private get fastRepair(): number {
    return gameSetting.fast_repair;
  }

  private get buildKit(): number {
    return gameSetting.build_kit;
  }

  private get fastBuild(): number {
    return gameSetting.fast_build;
  }

  private get remodelKit(): number {
    return gameSetting.remodel_kit;
  }

  private get ship_count(): number {
    return gameSetting.ship_count;
  }

  private get shipCountClass(): object {
    return {
      'ship-count-over' : (gameSetting.max_ship_count-5) <= gameSetting.ship_count,
    };
  }

  private get slotitem_count(): number {
    return gameSetting.slotitem_count;
  }

  private get slotitemCountClass(): object {
    const max_count = gameSetting.max_slotitem_count+3;
    const over1 = (max_count-20) < gameSetting.slotitem_count;
    const over2 = (max_count-3) <= gameSetting.slotitem_count;

    return {
      'slotitem-count-over1' : over1 && ! over2, 
      'slotitem-count-over2' : over2, 
    };    
  }

  private get isKouMax(): boolean {
    return gameSetting.medals === Const.MaxMedals;
  }

  private get iconContainerStyle() {
    let kouNum = this.kouNum;
    const width = [30, 36, 38][kouNum.length] ?? 30;
    return {
      '--width': `${width}px`,
    };
  }

  private get inMap(): boolean {
    return gameSetting.inMap;
  }

  private get isMapInfoOk(): boolean {
    return isFinite(gameSetting.maparea_id) && isFinite(gameSetting.mapinfo_no);
  }

  private get mapAreaText(): string {
    if (! this.isMapInfoOk) {
      return '出撃情報がありません';
    }

    const s1 = gameSetting.inMap ? '出撃中' : '出撃帰';
    return `${s1}: ${gameSetting.maparea_id > 10 ? 'E' : gameSetting.maparea_id}-${gameSetting.mapinfo_no} ${gameSetting.mapname}`;
  }

  private get mapCellText(): string {
    return gameSetting.mapcell_labels.join('-');
  }

  private get dispSeikuText(): string {
    console.log('dispSeikuText', gameSetting.disp_seiku);
    if (gameSetting.disp_seiku !== null) {
      return DispSeikuText[gameSetting.disp_seiku] ?? '';
    }
    return '';
  }

  private get tacticsText(): string {
    console.log('tacticsText', gameSetting.formations);
    if (gameSetting.formations !== null) {
      return TacticsText[gameSetting.formations[2]] ?? '';
    }
    return '';
  }

  private onTimelineHandler: ((event: Event) => void) | null = null;

  private mounted(): void {
    console.log('titlebar mounted');
    this.setTimelineClickEvent(true);

    // taiha singeki check
    this.cb_port = ApiCallback.set([Api.PORT_PORT, () => this.onPort()]);
    this.cb_map_next = ApiCallback.set([Api.REQ_MAP_NEXT, () => this.onMapNext()]);
  }

  private onPort(): void {
    this.taiha_singeki = false;
  }

  private onMapNext(): void {
    this.taiha_singeki = checkTaihaSingeki();
  }

  private setTimelineClickEvent(set: boolean): void {
    const setted = this.onTimelineHandler !== null;
    if (setted !== set) {
        const el = this.$el.querySelector('.timeline-button')! as HTMLElement;
      if (set) {
        this.onTimelineHandler = this.onTimeline.bind(this);
        el.addEventListener('click', this.onTimelineHandler);
      } else {
        el.removeEventListener('click', this.onTimelineHandler!);
        this.onTimelineHandler = null;
      }
    }
  }

  @Watch('timeline_pressed') 
  private timelinePressedChanged(): void {
    // prevent show timeline tip
    //console.log('timeline pressed changed', this.timeline_pressed, this.onTimeline0);
    if (! this.timeline_pressed) {
      window.setTimeout(() => this.setTimelineClickEvent(true), 200);
    }
  }

  private onTimeline(event: Event): void {
    console.log('on timeline timeline_pressed', this.timeline_pressed, event);
    this.setTimelineClickEvent(false);
    event.stopPropagation();
    this.$emit('timeline');
  }

  private get isDragable(): boolean {
    //console.log('isDragable', this.timeline_pressed);
    return ! this.timeline_pressed;
  }

  private get isAssistShown(): boolean {
    return gameSetting.assistInGame;
  } 
  
  private get isAssistOk(): boolean {
    return gameSetting.assist_ok;
  }

  private onAssist(): void {
    if (! gameSetting.assist_ok) {
      return ;
    }
    this.$emit(gameSetting.assistInGame ? 'assistHide' : 'assist');
  }

  private get isRecordReady(): boolean {
    return gameState.record_ready === 'ready';
  }

  private get isRecording(): boolean {
    return gameState.recording_state === 'recording';
  }

  private onRec(): void {
    if (! this.isRecordReady) {
      return ;
    }
    this.$emit(this.isRecording ? 'recStop': 'rec');
  }

  private onRefreshAssist(): void {
    this.$emit('refreshAssist');
  }

  private onOpenCaptureFolder(): void {
    this.$emit('openCaptureFolder');
  }

  private onScreenshot(): void {
    this.$emit('screenshot');
  }

  private onReload(): void {
    this.$emit('reload');
  }

  private onDevTool(): void {
    this.$emit('devtool');
  }

  private onGameDevTool(): void {
    this.$emit('gameDevtool');
  }

  private get isMute(): boolean {
    return gameSetting.muted;
  }
  
  private get muteTitle(): string {
    return this.isMute ? 'サウンドはオフ状態' : 'サウンドはオン状態';
  }

  private onOpenAssist(): void {
    this.$emit('openAssist');
  }

  private onTopMost(): void {
    this.$emit('topmost');
  }

  private get isTopMost(): boolean {
    return gameSetting.topmost;
  }

  private onMute(): void {
    this.$emit('mute');
  }

  private onMinimize(): void {
    this.$emit('minimize');
  }

  private onClose(): void {
    this.$emit('close');
  }
}

const checkTaihaSingeki = (): boolean => {
  if (! svdata.inMap) {
    return false;
  }

  const battleDeck = svdata.battleDeck;
  if (! battleDeck) {
    return false;
  }

  if (battleDeck.api_ship.some((el) => {
    const ship = svdata.ship(el);
    if (! ship) {
      return false;
    }

    return KcsUtil.shipHpState(ship) == ShipHpState.taiha;
  })) {
    return true;
  }

  if (! svdata.isCombined) {
    return false;
  }

  const deck2 = svdata.deckPort(ApiDeckPortId.deck2st);
  if (! deck2) {
    return false;
  }

  if (deck2.api_ship.some((el, index) => {
    // 第2旗艦は判定しない
    if (0 === index) {
      return false;
    }

    const ship = svdata.ship(el);
    if (! ship) {
      return false;
    }
    return KcsUtil.shipHpState(ship) == ShipHpState.taiha;
  })) {
    return true;
  }

  return false;
};
    

</script>
