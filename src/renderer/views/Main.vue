<template>
  <div class="main-root">
    <TitleBar 
      @timeline="onTimeline"
      :timeline_pressed="show_timeline"
      @assist="onShowAssist"
      @assistHide="onHideAssist"
      @rec="onRec"
      @recStop="onRecStop"
      @refreshAssist="onRefreshAssist"
      @openCaptureFolder="onOpenCaptureFolder"
      @screenshot="onScreenShot"
      @reload="onReload"
      @devtool="onDevTool"
      @gameDevtool="onGameDevTool"
      @mute="onMute"
      @openAssist="onOpenAssist"
      @topmost="onTopMost"
      @minimize="onMinimize"
      @close="onClose" />
    <div class="main-content" :style="mainStyle">
      <div class="game-content" :style="gameStyle">
        <Game ref="game"/>
      </div>
      <div class="assist-right-content" :class="{ 'is-hidden': !isAssistVisible }">
        <Assist/>
      </div>
      <div class="assist-bottom-content" :class="{ 'is-hidden': !isAssistVisible }">
        <div><QuestList/></div>
        <div><NDockList/></div>
        <div><KDockList/></div>
      </div>
    </div>
    <Timeline id="timeline" v-if="isShowTimeline" :show.sync="show_timeline" :data="timeline_data"/>
  </div>
</template>

<script lang="ts">
import { ipcRenderer, IpcRendererEvent, Rectangle, WebviewTag } from 'electron';
import { Const, SupportCodecs } from '@/lib/const';
import { InvalidQuestContext, MainChannel, TimelineResult } from '@/lib/app';
import { gameSetting } from '@/renderer/store/gamesetting';
import { rendererState } from '@/renderer/store/rendererState';
import { appState } from '@/global/appstate';
import TitleBar from '@/renderer/components/TitleBar.vue';
import Timeline from '@/renderer/components/Timeline.vue';
import QuestList from '@/renderer/components/QuestList.vue';
import NDockList from '@/renderer/components/NDockList.vue';
import KDockList from '@/renderer/components/KDockList.vue';
import Game from '@/renderer/components/Game.vue';
//import Assist from '@/renderer/components/Assist.vue';
import Assist from '@/renderer/views/Assist.vue';
import { gameState } from '@/renderer/store/gamestate';
import { recorderStuff } from '@/renderer/stuff/recorder';
import { captureStuff } from '@/renderer/stuff/capture';
import { ApiQuest } from '@/lib/kcs';
import { replaceArray } from '@/lib/ts';
import { BattleRecord } from '@/lib/record';
import { Component, Vue } from 'vue-property-decorator';

@Component({
  components: {
    TitleBar,
    Timeline,
    Game,
    //Assist,
    Assist,
    QuestList,
    NDockList,
    KDockList,
  },
})
export default class extends Vue {
  
  private in_timeline_query: boolean = false;
  private show_timeline: boolean = false;
  private timeline_data: TimelineResult = [ InvalidQuestContext(), []];

  constructor() {
    super();
    recorderStuff.prepare();
    recorderStuff.on('recorded', (buffer: Buffer) => {
       ipcRenderer.invoke(MainChannel.save_rec, new Date(), buffer);
    });
  }

  private mounted(): void {
    console.log('main mounted');
  }

  private getGame(): Game | undefined {
    return this.$refs.game as Game;
  }

  private get mainStyle(): object {
    return {
      '--game-width': gameSetting.assistInGame ? `${Const.GameWidth}px` : '100%',
      '--game-height': gameSetting.assistInGame ? `${Const.GameHeight+40}px` : '100%',
    };
  }

  private get gameStyle(): object {
    return {
      '--assist-width': gameSetting.assistInGame ? `${Const.AssistWidth}px` : '0px' 
    };
  }

  private get assistTopStyle(): object {
    return { 
    };
  }

  private get assistRightStyle(): object {
    return {
      '--width': gameSetting.assistInGame ? `${Const.AssistWidth}px` : '0px' 
    };
  }

  private get isAssistVisible(): boolean {
    return gameSetting.assistInGame;
  }

  private get isShowTimeline(): boolean {
    return this.show_timeline;
  }

  private onTimeline(): void {
    if (this.show_timeline) {
      this.in_timeline_query = false;
      this.show_timeline = false;
      return ;
    }

    if(! this.in_timeline_query) {
      this.in_timeline_query = true;
      ipcRenderer.invoke(MainChannel.timeline).then((result: TimelineResult) => {
        if (this.in_timeline_query) {
          this.in_timeline_query = false;
          console.log('timeline result', result);
          replaceArray(this.timeline_data, result);
        }
      }).catch((error: any) => {
        console.log('timeline ipc error', error);
        this.in_timeline_query = false;
      });
      this.show_timeline = true;
      this.$nextTick(() => {
        const timeline = this.$el.querySelector('#timeline')! as HTMLElement;
        timeline.focus();
      });
    }
  }

  private onShowAssist(): void {
    ipcRenderer.invoke(MainChannel.show_assist);
  }

  private onHideAssist(): void {
    ipcRenderer.invoke(MainChannel.hide_assist);
  }

  private onRec(): void {
    console.log('rec >>');
    recorderStuff.start();
    console.log('rec <<');
  }

  private onRecStop(): void {
    recorderStuff.stop();
  }

  private onRefreshAssist(): void {
    ipcRenderer.invoke(MainChannel.refresh_assist);
  }

  private onOpenCaptureFolder() : void {
    ipcRenderer.invoke(MainChannel.open_capture_folder);
  }

  private onScreenShot(): void {
    console.log('screenshot');
    const webview = this.getGame()?.getWebview;
    if (webview) {
      captureStuff.capture(webview);
    }
  }

  private onReload(): void {
    ipcRenderer.invoke(MainChannel.reload, true);
  }

  private onDevTool(): void {
    ipcRenderer.invoke(MainChannel.devtool);
  }

  private onGameDevTool(): void {
    const game_wv = this.getGame()?.getWebview;
    if (game_wv) {
      if (game_wv.isDevToolsOpened()) {
        game_wv.closeDevTools();
      } else {
        game_wv.openDevTools();
      }
    }

    /*
    if (gameSetting.assist_in_game) {
      const assist_wv = this.getAssist()?.getWebview();
      if (assist_wv) {
        if (assist_wv.isDevToolsOpened()) {
          assist_wv.closeDevTools();
        } else {
          assist_wv.openDevTools();
        }
      }
    }
    */
  }

  private onMute(): void {
    this.getGame()?.setMute(!rendererState.muted);
  }
  
  private onOpenAssist(): void {
    ipcRenderer.invoke(MainChannel.openAssist);
  }

  private onTopMost(): void {
    ipcRenderer.invoke(MainChannel.topmost);
  }

  private onMinimize(): void {
    ipcRenderer.invoke(MainChannel.minimize);
  }

  private onClose(): void {
    ipcRenderer.invoke(MainChannel.close);
  }

}
</script>
