<template>
  <div class="timeline-root" contenteditable="true" @beforeinput="onBeforeInput"
    :class="{ 'is-block': isShow }" 
    @blur="onBlur">
    <section>
      <div class="timeline-title px-1 py-1">
        <div>遂行中任務</div>
        <div v-if="isQuestsValid">{{questCountText}}</div>
      </div>
      <div class="px-2 py-1">
        <div class="quest-content" v-if="isQuestsValid">
          <div class="mr-1" v-for="(quest, q_index) in quests" :key="q_index">
            <span class="quest-category" :class="questCategoryClass(quest)">{{questCategoryText(quest)}}</span>
            <span class="quest-type mr-1" :class="questTypeClass(quest)">{{questTypeText(quest)}}</span>
            <span>{{quest.api_title}}</span>
            <span v-if="isQuestStateVisible(quest)" class="quest-state" :class="questStateClass(quest)">{{questStateText(quest)}}</span>
          </div>
        </div>
        <div v-else class="quest-content">
           <div class="quest-help"><span class="img mr-2"><InfoImg/></span>クエスト情報が未取得です。任務(クエスト)画面を開いてください。</div>
        </div>
      </div>
    </section>
    <section>
      <div class="timeline-title px-1 pb-1">出撃履歴</div>
      <div v-if="isBattleRecordsValid">
        <div class="card" v-for="(record, b_index) in battleRecords" :key="b_index">
          <div class="card-content">
            <div class="media">
              <div class="media-left">
                <div class="rank">
                  <span>{{record.rank}}</span>
                </div>
              </div>
              <div class="media-content is-overflow-hidden">
                <p class="title is-6">{{battleMapText(record)}} Cell:{{record.cellId}} <span class="tag is-radiusless is-danger is-normal" v-if="record.isBoss">BOSS</span> {{record.enemyDeckName}} {{battleSeikuText(record)}} {{battleFormationText(record)}}</p>
                <p class="subtitle is-7">{{toLocalDateText(record.date)}} <span v-if="record.drop.shipId===-2">母港FULL</span> <span v-if="record.drop.shipId>0">{{record.drop.shipName}}(id:{{record.drop.shipId}})</span></p>
              </div>
              <div class="media-right" v-if="record.drop.shipId>0">
                <figure>
                  <img class="ship-bunner" :src="`./img/ship/s${record.drop.shipId}.png`">
                </figure>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="quest-content">
         <div class="mx-2 my-2"><span class="img mr-2"><InfoImg/></span>出撃履歴がありません。</div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, PropSync } from 'vue-property-decorator';
import { BattleRecord } from '@/lib/record';
import { TimelineResult } from '@/lib/app';
import { DispSeikuText, QuestCategoryText, QuestTypeText, QuestTypeTextYear, TacticsText } from '@/lib/locale';
import { ApiProgressFlag, ApiQuest, ApiQuestCategory, ApiQuestState, ApiQuestType } from '@/lib/kcs';
import InfoImg from '@/renderer/assets/info.svg';
import { RUtil } from '@/renderer/util';
import  moment from 'moment';

@Component({
  components: {
    InfoImg,
  },
})
export default class extends Vue {

  @PropSync('show', { type: Boolean })
  private show_timeline!: boolean;

  @Prop()
  private data!: TimelineResult;

  constructor() {
    super();
  }

  private get isQuestsValid(): boolean {
    return this.data[0].quests != null;
  }

  private get isBattleRecordsValid(): boolean {
    return this.data[1].length > 0;
  }

  private get questCountText(): string {
    return ` 遂行中: ${this.quests.length} 受託可能: ${this.data[0].quest_max}`;
  }

  private get quests(): ApiQuest[] {
    return this.data[0].quests ?? [];
  }

  private get battleRecords(): BattleRecord[] {
    return this.data[1];
  }

  private questCategoryText(quest: ApiQuest): string {
    return QuestCategoryText[quest.api_category] ?? '?';
  }

  private questCategoryClass(quest: ApiQuest): object {
    return RUtil.questCategoryClass(quest);
  }

  private questTypeText(quest: ApiQuest): string {
    return RUtil.questTypeText(quest);
  }

  private questTypeClass(quest: ApiQuest): object {
    return RUtil.questTypeClass(quest);
  }

  private isQuestStateVisible(quest: ApiQuest): boolean {
     return quest.api_state === ApiQuestState.completed || quest.api_progress_flag !== ApiProgressFlag.zero;
  }

  private questStateText(quest: ApiQuest): string {
    if (quest.api_state === ApiQuestState.completed) {
      return '達成';
    }
    const text = ['', '50%', '80%'];
    return text[quest.api_progress_flag] ?? '';
  }
  
  private questStateClass(quest: ApiQuest): object {
    return {
      'is-completed': quest.api_state === ApiQuestState.completed,
    };
  }

  private battleMapText(record: BattleRecord): string {
    const map = Math.floor(record.mapId/10);
    const area = record.mapId%10;
    const map_txt = map > 10 ? 'E' : map.toString();
    return `${map_txt}-${area}`;
  }

  private toLocalDateText(date: string): string {
    return moment(date).format('YYYY-MM-DD HH:mm:ss');
  }

  private battleFormationText(record: BattleRecord): string {
    return TacticsText[record.formations?.[2]] ?? '';
  } 
  
  private battleSeikuText(record: BattleRecord): string {
    return DispSeikuText[record?.seiku] ?? '';
  }

  private get isShow(): boolean {
    console.log('timeline is show', this.show_timeline);
    return this.show_timeline;
  }

  private onBeforeInput(event: InputEvent): void {
    // prevent content change.
    event.preventDefault();
  }

  private onBlur(event: Event): void {
    console.log('timeline blue', event);
    this.show_timeline = false;
  }
}
</script>
