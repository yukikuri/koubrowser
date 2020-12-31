<template>
  <span :class="{'is-completed': completed}">{{timeText}}</span>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import moment, { duration } from 'moment';

@Component({
  components: {
  },
})
export default class extends Vue {

  @Prop({ required: true })
  public complete_time!: number;

  @Prop({ required: true })
  public progress_text!: string;

  @Prop({ required: true })
  public completed_text!: string;

  // end to duration
  private dur: moment.Duration;

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
      this.timeout_comp = window.setTimeout(() => this.onCompleted(), this.dur.asMilliseconds());
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
      return this.completed_text;
    }
    
    return this.progress_text;
  }

}

</script>
