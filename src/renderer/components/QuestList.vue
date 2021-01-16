<template>
  <section class="questlist">
    <div class="questlist-title">任務情報 遂行中: {{questLen}}/{{maxQuest}}</div>
    <b-tooltip always0 v-for="(quest, index) in quests" 
      :key="index" position="is-right" multilined type="is-dark" 
      :square="true" :animated="true" class="questtip">
      <template v-slot:content>
        <div class="quest-tip">
          <div class="tiptitle">
            <span>{{quest.record.no}}: {{quest.record.quest.api_title}}</span>
            <span>達成度: {{quest.progressText}}</span>  
          </div>
          <hr>
          <div class="tipdetail">{{quest.tipDetail}}</div>
        </div>
      </template>
      <div class="quest">
        <span class="quest-category" :class="quest.categoryClass">{{quest.categoryText}}</span>
        <span class="quest-type" :class="quest.typeClass">{{quest.typeText}}</span>
        <span class="quest-progress" :class="{'is-completed': quest.completed}">{{quest.progressText}}</span>
        <span class="quest-title">
          <span v-if="quest.is_special" class="quest-category is-special pl-1 pr-1">限定</span>
          <span class="quest-category is-senka pl-1 pr-1" v-if="quest.senka>0">戦果{{quest.senka}}</span>
          <span class="ml-1">{{quest.record.quest.api_title}}</span>
        </span><!--<span v-if="quest.progressDetail">( {{quest.progressDetail}} )</span>-->
        <b-progress format="percent" :max="100" show-value0 class="quest-bar is-radiusless">
          <b-progress-bar v-for="(state, state_index) in quest.states" :key="state_index" 
            slot="bar" :value="state.percent" :class="state.className"></b-progress-bar>
          <span v-if="quest.progressDetail" slot="bar" class="quest-progress-text">
            <span v-if="quest.deckOk===true" class="deckOk">編成条件:OK</span>
            <span v-if="quest.deckOk===false" class="deckNg">編成条件:NG</span>
            <span>{{quest.progressDetail}}</span></span>
        </b-progress>
      </div>
    </b-tooltip>
  </section>
</template>

<script lang="ts">
// {{state.percentText}}
import { KcsUtil, ApiQuestState, ApiQuest, ApiQuestCategory } from '@/lib/kcs';
import { svdata } from '@/renderer/store/svdata';
import { quests } from '@/renderer/store/quests';
import { Component, Vue, Prop } from 'vue-property-decorator';
import { Quest, QuestCounter, questIsDeckMatch, questProgress, questProgressDetail } from '@/lib/record';
import { RUtil } from '@/renderer/util';
import { QuestCategoryText } from '@/lib/locale';
import { AppStuff } from '@/lib/app';
import { MathUtil } from '@/lib/math';

interface QuestContent {
  countTotal: number;
  countTotalMax: number;
  completed: boolean;
  progress: number;
  progressText: string;
  categoryClass: object;
  categoryText: string;
  typeClass: object;
  typeText: string;
  progressDetail: string;
  deckOk: boolean | undefined;
  senka: number;
  is_special: boolean;
  tipDetail: string;
  record: Quest;
  states: QuestState[];
}

interface QuestState {
  className: string;
  percent: number;
  percentText: string;
  count: number;
  countMax: number;
}
const progressClasses = [
  'is-success',
  'is-success',// 'is-info',
  'is-success',//'is-warning',
  'is-success',//'is-danger',
  'is-success',// 'is-dark',
  //'is-info',
] as const;

const questStates = (quest: Quest, countTotal: number, countTotalMax: number): QuestState[] => {
  if (quest.state === null) {
    const count = KcsUtil.questCount(quest.quest);
    return [
      {
        className: progressClasses[0],
        percent: count,
        percentText: count ? count+'%' : '',
        count, 
        countMax: 100,
      }
    ];
  }

  if (0 === countTotal) {
    return [
      {
        className: '',
        percent: 0,
        percentText: '',
        count: 0, 
        countMax: 0,
      },
    ];
  }

  const state = quest.state as QuestCounter;
  const len = state.count.length;
  return state.count.map((count, index) => {
    const countMax = state.countMax[index];
    const percent = MathUtil.floor(count/countTotalMax*100, 2);
    const state_percent = Math.floor(count/countMax*100);
    let percentText = '';
    if (count) {
      if (len < 4) {
        percentText = `${state_percent}%(${count}/${countMax})`;
      }
      else {
        if (percent >= 10) {
          percentText = `${state_percent}%(${count}/${countMax})`;
        }
        else if (percent >= 2) {
          percentText = `${state_percent}%`;
        }
      }
    }

    return {
      className: progressClasses[index%progressClasses.length],
      percent,
      percentText,
      count, 
      countMax,
    };
  });
};

@Component({
  components: {
  },
})
export default class extends Vue {

private mounted(): void {
    console.log('questlist mounted');
  }

  private get questLen(): number {
    return quests.list.length;
  }

  private get quests(): QuestContent[] {
    return quests.list.map(el => {
      const countTotal = el.state === null ? KcsUtil.questCount(el.quest) : (el.state as QuestCounter).count.reduce((acc, value) => acc+value, 0);
      const countTotalMax = el.state === null ? 100 : (el.state as QuestCounter).countMax.reduce((acc, value) => acc+value, 0);
      const progress = questProgress(el);
      let progressDetail = questProgressDetail(el);
      let deckOk = undefined;
      if (! progressDetail) {
        if (el.quest.api_state === ApiQuestState.completed) {
          progressDetail = '100%';
        }
      } else {
        deckOk = questIsDeckMatch(svdata, el);
      }

      return {
        completed: progress >= 100,
        progress,
        progressText: progress >= 100 ? '達成!' : progress+'%',
        categoryClass: RUtil.questCategoryClass(el.quest),
        categoryText: QuestCategoryText[el.quest.api_category] ?? '?',
        typeClass: RUtil.questTypeClass(el.quest),
        typeText: RUtil.questTypeText(el.quest),
        record: el,
        tipDetail: el.quest.api_detail.replace(/<br>/g, ''),
        progressDetail,
        deckOk,
        senka: KcsUtil.questSenka(el.no),
        is_special: KcsUtil.questIsSpecial(el.no),
        countTotal,
        countTotalMax,
        states: questStates(el, countTotal, countTotalMax),
      };
    });
  }

  private get maxQuest(): number {
    return svdata.parallelQuestCount;
  }
}
</script>
