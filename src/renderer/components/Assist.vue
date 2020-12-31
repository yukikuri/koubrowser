<template>
  <div class="assist-container">
    <webview 
      id="assist"
      class="assist" 
      src="about:blank"
      enableremotemodule="false"
      nodeintegration
      webPreferences="spellcheck=off"
    ></webview>
  </div>
</template>

<script lang="ts">

import { WebviewTag, ipcRenderer, NewWindowEvent, } from 'electron';
import { MainChannel, GameChannel } from '@/lib/app';
import { gameSetting } from '@/renderer/store/gamesetting';
import { Component, Vue, Watch } from 'vue-property-decorator';

@Component({
  components: {},
})
export default class extends Vue {

  private do_readyed: boolean = false;
  private webcontent_id: number = 0;

  public getWebview(): WebviewTag | undefined {
    const ret = this.$el.querySelector('#assist');
    if (ret) {
      return ret as WebviewTag;
    }
    return undefined;
  }

  public getWebviewUnsafe(): WebviewTag {
    return this.getWebview() as WebviewTag;
  }

  private mounted(): void {
    const webview = this.getWebview();
    console.log('assist mounted >> webview:', !!webview, this.do_readyed, this.webcontent_id);
    if (webview) {
      /*
      webview.addEventListener('did-finish-load', () => this.wvDidFinishLoad());
      webview.addEventListener('new-window', (ev) => this.wvNewWindow(ev));
      webview.addEventListener('destroyed', () => this.wvDestroyed());
      */
    }
    console.log('assist mounted <<');
  }

  private destroyed(): void {
    console.log('assist: destroyed', this.do_readyed, this.webcontent_id);
    if (this.do_readyed) {
      this.do_readyed = false;
      ipcRenderer.invoke(MainChannel.assist_destroyed, this.webcontent_id);
    }    
  }

  private wvDidFinishLoad(): void {
    if (gameSetting.assistInGame) {
      console.log('assist: webview did finish load. readyed:', this.do_readyed, this.getWebviewUnsafe().getWebContentsId());
      if (! this.do_readyed) {
        this.do_readyed = true;
        const webview = this.getWebviewUnsafe();
        this.webcontent_id = webview.getWebContentsId();
        ipcRenderer.invoke(MainChannel.assist_ready, webview.getWebContentsId());
      }
    }
  }

  private wvNewWindow(ev: NewWindowEvent): void {
    console.log('assist: webview prevent new window');
    ev.preventDefault();
  }

  private wvDestroyed(): void {
    console.log('assist: webview destroyed');
    if (this.do_readyed) {
      this.do_readyed = false;
      ipcRenderer.invoke(MainChannel.assist_destroyed, this.webcontent_id);
    }    
  }

}
</script>
