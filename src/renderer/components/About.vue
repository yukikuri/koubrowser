<template>
  <section class="about-root hero is-dark is-fullheight">
    <div class="hero-body">
      <div class="container">
        <h2 class="subtitle">艦隊運用支援</h2>
        <h1 class="title">甲ブラウザ(仮)<span class="version">ver 0.0.2</span></h1>
        <p>著作権法第32条に基づき画像を引用しております。</p>
        <p>開発情報：<a class="has-text-success" @click="clickDevPage" target="_blank" href="https://twitter.com/kurimoto_y">作者Twitter(デフォルトブラウザで開きます)</a></p>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { MainChannel } from '@/lib/app';
import { ipcRenderer } from 'electron';
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component({
  components: {},
})
export default class extends Vue {


  private mounted() {
    console.debug('about mounted');
  }

  private destroyed() {
    console.debug('about destroyed');
  }

  private clickDevPage(ev: Event) {
    console.log(ev);
    ev.preventDefault();
    ipcRenderer.invoke(MainChannel.open_url_by_external, (ev.target as HTMLAnchorElement).href);
  }
}
</script>
