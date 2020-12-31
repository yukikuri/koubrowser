<template>
  <div class="mission-badge" :title="missionName">
    <b-tag type="is-primary">
      <div class="wrapper">
        <div class="mission-label">遠征中</div>
        <div class="state" :class="{completed: completed}">
          <DoneImg v-if="completed" />
          {{stateText}}
        </div>
      </div>
    </b-tag>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { ApiDeckPort, MissionState } from '@/lib/kcs';
import DoneImg from '@/renderer/assets/done.svg';
import moment, { duration } from 'moment';
import { svdata } from '@/renderer/store/svdata';

const toStr = (v: number, prefix: string): string => {
  return (prefix + Math.floor(v)).slice(-2);
}

@Component({
  components: {
    DoneImg,
  },
})
export default class extends Vue {

  @Prop({ required: true })
  public deck!: ApiDeckPort;

  // mission end to duration
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
    const end = moment(this.deck.api_mission[2]);
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
  private get inMission(): boolean {
    return this.dur.as('ms') > 0 && this.deck.api_mission[0] === MissionState.in;
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
  private get stateText(): string {
    //console.log('state text', this.deck.api_id, this.dur.as('ms'));

    // completed
    if (this.completed) {
      return '完了';
    }

    const hour = this.dur.asHours();
    if (hour < 1.0) {
      return `${toStr(this.dur.minutes(), '')}:${toStr(this.dur.seconds(), '0')}`;
    }
    return `${toStr(this.dur.asHours(), '')}:${toStr(this.dur.minutes(), '0')}:${toStr(this.dur.seconds(), '0')}`;
  }

  private get missionName(): string {
    const mission = svdata.mstMission(this.deck.api_mission[1]);
    return `${this.deck.api_mission[1]}: ${mission?.api_name ?? ''}`;
  }

}

</script>
