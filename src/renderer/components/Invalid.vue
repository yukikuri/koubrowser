<template>
  <section class="invalid-root hero is-dark is-fullheight">
    <div class="hero-body">
      <div class="container">
        <h2 class="subtitle is-small">{{message}}</h2>
        <h1 class="title"></h1>
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

  @Prop({default: 'GAMEを開始すると情報が表示されます'})
  public message!: string;

  private mounted() {
    console.debug('invalid mounted');
  }

  private destroyed() {
    console.debug('invalid destroyed');
  }
}
</script>
