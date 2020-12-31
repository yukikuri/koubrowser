<template>
  <div class="game-container">
    <webview 
      id="kb"
      class="kb" 
      :src="gameUrl"
      enableremotemodule="false"
      webPreferences="backgroundThrottling=off ,spellcheck=off"
      ></webview>
  </div>
</template>

<script lang="ts">
// memo webview attr
//nodeintegration="false"
//disablewebsecurity="false"
//enableremotemodule="false"
//nodeintegrationinsubframes="false"
// webPreferences="allowRunningInsecureContent=on, backgroundThrottling=on ,spellcheck=off"
// webPreferences="backgroundThrottling=on ,spellcheck=off"
import path from 'path';
import { 
  WebviewTag, 
  NewWindowEvent, 
  BrowserWindow, 
  ipcRenderer, 
  DidFrameFinishLoadEvent, 
  LoadCommitEvent, 
  IpcRendererEvent 
} from 'electron';
import { gameSetting } from '@/renderer/store/gamesetting';
import { MainChannel, GameChannel } from '@/lib/app';
import { Unpacked } from '@/lib/ts'; 
import { GameSetting } from '@/lib/setting';
import { Component, Vue, Watch } from 'vue-property-decorator';

const Stage = {
  None: 0,
  GameTopLoading: 1,
  GameTopLoaded: 2,
  GameStartLoading: 3,
  GameStartLoaded: 4,
} as const;
type StageType = Unpacked<typeof Stage>;

//disablewebsecurity
//allowpopups
@Component({
  components: {},
})
export default class extends Vue {
  private stage_: StageType = Stage.None;
  private game_setting: GameSetting;
  
  constructor() {
    super();
    this.game_setting = gameSetting;
    console.log('game ctor', this.game_setting);
  }

  @Watch('game_setting.zoom_factor') 
  private zoomFactorChanged(): void {
    console.log('zoom factor changed', gameSetting.zoom_factor);
    this.getWebviewUnsafe.setZoomFactor(gameSetting.zoom_factor);
  }

  private get gameUrl(): string {
    return 'http://www.dmm.com/netgame/feature/kancolle.html';
  }

  public get getWebview(): WebviewTag | undefined {
    const ret = this.$el.querySelector('#kb');
    if (ret) {
      return ret as WebviewTag;
    }
    return undefined;
  }

  public get getWebviewUnsafe(): WebviewTag {
    return this.getWebview as WebviewTag;
  }

  private mounted(): void {
    const webview = this.getWebview;
    console.log('game mounted >> webview', !!webview);
    if (webview) {
      webview.addEventListener('dom-ready', (event) => this.domReady(event));
      webview.addEventListener('load-commit', (event) => this.loadCommit(event));
      webview.addEventListener('did-start-loading', () => {console.log('did-start-loading');});
      webview.addEventListener('did-finish-loading', () => {console.log('did-finish-loading');});
      webview.addEventListener('did-frame-finish-load', (event) => this.didFrameFinishLoad(event));
      webview.addEventListener('new-window', (event) => this.newWindow(event));
      webview.addEventListener('media-started-playing', (event) => this.mediaStartedPlaying(event));
      webview.addEventListener('media-paused', (event) => this.mediaPaused(event));
    }
    this.stage = Stage.GameTopLoading;
    ipcRenderer.on(GameChannel.set_zoom_factor, this.setZoomFactor);
    console.log('game mounted <<');
  }

  private destroyed(): void {
    console.log('game destroyed webview:', !! this.getWebview);
    /*
    const webview = this.getWebview;
    if (webview) {
      webview.removeEventListener('dom-ready', this.domReady);
      webview.removeEventListener('load-commit', this.loadCommit);
      webview.removeEventListener('did-frame-finish-load', this.didFrameFinishLoad);
      webview.removeEventListener('new-window', this.newWindow);
      webview.removeEventListener('media-started-playing', this.mediaStartedPlaying);
      webview.removeEventListener('media-paused', this.mediaPaused);
    }
    */
  }

  private setZoomFactor(event: IpcRendererEvent, factor: number): void {
    console.log(GameChannel.set_zoom_factor, factor);
    this.getWebviewUnsafe.setZoomFactor(factor);
  }

  private domReady(event: Event): void {
    console.log('domReady domRady');
    this.getWebviewUnsafe.setZoomFactor(gameSetting.zoom_factor);
    //this._muted = this.webview?.isAudioMuted() ?? false;
  }

  private loadCommit(event: LoadCommitEvent): void {
    //console.log('loadCommit', 'mainframe:', event.isMainFrame, 'url:', event.url, event);
    if (this.isStage(Stage.GameStartLoading) && 
        ! event.isMainFrame &&
        event.url.startsWith('http://osapi.dmm.com/')) {
      this.insertModCss();
    }
  }

  private didFrameFinishLoad(event: DidFrameFinishLoadEvent): void {
    //console.log('didFrameFinishLoad', event, this.webviewUnsafe.getURL());
    if (event.isMainFrame && this.isStage(Stage.GameTopLoading)) {
      const code = `(function(){
        let a = document.querySelector('.fn-rollover.btn a');
        if (a) {
          a.click();
          return true;
        }
        return false;
      })()`;
      this.getWebviewUnsafe.executeJavaScript(code).then((any) => {
        console.log('clicked', any);
        if (any) {
          this.stage = Stage.GameStartLoading;
        }
      });
    }
  }

  private insertModCss() {  
    const css = 
`
body {
  margin: 0 !important;
  overflow: hidden;
}
#spacing_top {
  display: none;
}
.dmm-ntgnavi {
  margin-bottom: 0px !important;
  position: relative;
  z-index: 1;
  border-bottom: 0 !important;
}
.ntgnavi-right {
  margin-right: 5px !important;
}
#main-ntg {
  transform: translateY(-16px);
}
#ntg-recommend {
  display: none !important;
}
#game_frame {
  height: 736px !important;
  width: 1200px !important;
}
`;
    this.getWebviewUnsafe.insertCSS(css);
  }

  private newWindow(event: NewWindowEvent): void {
    ipcRenderer.invoke(MainChannel.new_window, event.url).then(result => {
      console.log('new window opened');
    });
  }

  private mediaStartedPlaying(event: Event): void {
    console.log('mediaStartedPlaying');
  }

  private mediaPaused(event: Event): void {
    console.log('mediaPaused');
  }

  public setMute(mute: boolean): void {
    const webview = this.getWebview;
    if (webview) {
      console.log('now muted:', webview.isAudioMuted());
      webview.setAudioMuted(mute);
      gameSetting.muted = webview.isAudioMuted();
      console.log('set muted:', gameSetting.muted);
    }
  }

  private get stage(): StageType {
    return this.stage_;
  }

  private set stage(stage: StageType) {
    this.stage_ = stage;
  }

  private isStage(stage: StageType): boolean {
    return this.stage_ === stage;
  }
}
</script>
