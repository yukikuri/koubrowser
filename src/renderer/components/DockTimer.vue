<template>
  <span>{{timeText}}</span>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import moment, { duration } from 'moment';

const toStr = (v: number, prefix: string): string => {
  return (prefix + Math.floor(v)).slice(-2);
}

@Component({
  components: {
  },
})
export default class extends Vue {

  @Prop({ required: true })
  public complete_time!: number;

  // end to duration
  private dur: moment.Duration;

  // 1 sec interval timer
  private interval: number | undefined;

  // completed timer(use os resume)
  private timeout_comp: number | undefined;

  /**
   * 
   */
  public constructor() {
    super();
    const end = moment(this.complete_time);
    this.dur = duration(end.diff(moment()));
    if (! this.completed) {
      this.interval = window.setInterval(() => this.onInterval(), 1000);
      console.log('comp', this.dur.asMilliseconds());
      this.timeout_comp = window.setTimeout(() => this.onCompleted(), this.dur.asMilliseconds());
    }
  }

  /**
   * 
   */
  private onInterval(): void {
    this.dur.add(-1000);
    if (this.dur.as('ms') <= 0) {
      this.clearTimer();
    }
  }
  
  /**
   * 
   */
  private onCompleted(): void {
    this.dur = duration(0);
    this.clearTimer();
  }

  /**
   * 
   */
  private clearTimer(): void {

    if (this.interval !== undefined) {
      window.clearInterval(this.interval);
      this.interval = undefined;
    }

    if (this.timeout_comp !== undefined) {
      window.clearTimeout(this.timeout_comp);
      this.timeout_comp = undefined;
    }
  }

  /**
   * 
   */
  private destroyed() {
    this.clearTimer();
  }

  /**
   * 
   */
  private get completed(): boolean {
    return this.dur.as('ms') <= 0;
  }

  /**
   * 
   */
  private get timeText(): string {

    // completed
    if (this.completed) {
      return '00:00:00';
    }
    
    return `${toStr(this.dur.asHours(), '0')}:${toStr(this.dur.minutes(), '0')}:${toStr(this.dur.seconds(), '0')}`;
  }

}

</script>
