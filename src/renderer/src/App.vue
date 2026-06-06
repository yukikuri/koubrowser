<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { Const } from '@common/const'
import { InvalidQuestContext, TimelineResult } from '@common/channel'
import { gameSetting } from '@renderer/store/gamesetting'
import { EnvRenderer } from '@renderer/common/env-renderer'
import TitleBar from '@renderer/components/TitleBar.vue'
import Timeline from '@renderer/components/Timeline.vue'
import QuestList from '@renderer/components/QuestList.vue'
import NDockList from '@renderer/components/NDockList.vue'
import KDockList from '@renderer/components/KDockList.vue'
import Game from '@renderer/components/Game.vue'
import Assist from '@renderer/components/Assist.vue'
import { captureStuff } from '@renderer/stuff/capture'
import { recorderStuffRenderer } from '@renderer/stuff/recorder'
import { gameState } from '@renderer/store/gamestate'
import { appState } from '@global/appstate'
import { BattleRecord, recordMapIdToIdNo } from '@common/record'
import { CellInfo } from '@common/map'
import { mapInfoCache } from './common/mapinfo'
const el = ref<HTMLElement | null>(null)
const game = ref<InstanceType<typeof Game> | null>(null)

const in_timeline_query = ref(false)
const show_timeline = ref(false)
const timeline_data: TimelineResult = reactive([InvalidQuestContext(), []])

const rendererIsGame = (): boolean => {
  return !EnvRenderer.isAssist
}

onMounted(() => {
  console.log('main mounted', timeline_data, in_timeline_query.value, show_timeline.value)

})

function getGame() {
  return game.value
}

const mainStyle = computed(() => {
  return {
    '--game-width': gameSetting.assistInGame ? `${Const.GameWidth}px` : '100%',
    '--game-height': gameSetting.assistInGame ? `${Const.GameHeight + 40}px` : '100%'
  }
})

const gameStyle = computed(() => {
  return {
    '--assist-width': gameSetting.assistInGame ? `${Const.AssistWidth}px` : '0px'
  }
})

const assistInGame = (): boolean => {
  return gameSetting.assistInGame
}

async function fetchCellInfo(records: BattleRecord[]): Promise<CellInfo[]> {
  const tasks: Promise<CellInfo>[] = [];
  const queries = new Set<number>();
  records.forEach((record) => {
    if (queries.has(record.mapId)) {
      return;
    }
    const { areaId, areaNo } = recordMapIdToIdNo(record.mapId);
    tasks.push(mapInfoCache.get(areaId, areaNo));
    queries.add(record.mapId);
  })
  return Promise.all(tasks);
}

const onTimeline = (): void => {
  console.log('on timeline clicked isshow:', show_timeline.value, in_timeline_query.value)
  if (show_timeline.value) {
    in_timeline_query.value = false
    show_timeline.value = false
    return
  }

  if (!in_timeline_query.value) {
    in_timeline_query.value = true
    window.api
      .timeline()
      .then((result: TimelineResult) => {
        fetchCellInfo(result[1])
        .then(() => {
          if (in_timeline_query.value) {
            in_timeline_query.value = false
            console.log('timeline result', result, timeline_data)
            Object.assign(timeline_data, result)
          }
        })
      })
      .catch((error: any) => {
        console.log('timeline ipc error', error)
        in_timeline_query.value = false
      })
    show_timeline.value = true
    nextTick(() => {
      const timeline = el.value!.querySelector('#timeline')! as HTMLElement
      timeline.focus()
    })
  }
}

const onRec = (): void => {
  console.log(
    'rec >>',
    'record_ready',
    gameState.record_ready,
    'recording_state',
    gameState.recording_state,
    appState.media_source_id
  )
  recorderStuffRenderer.start()
  console.log(
    'rec <<',
    'record_ready',
    gameState.record_ready,
    'recording_state',
    gameState.recording_state
  )
}

const onRecStop = (): void => {
  console.log(
    'rec stop >>',
    'record_ready',
    gameState.record_ready,
    'recording_state',
    gameState.recording_state,
    appState.media_source_id
  )
  recorderStuffRenderer.stop()
  console.log(
    'rec stop <<',
    'record_ready',
    gameState.record_ready,
    'recording_state',
    gameState.recording_state
  )
}

const onScreenShot = (): void => {
  console.log('screenshot')
  const webview = getGame()?.getWebview()
  if (webview) {
    captureStuff.capture(webview)
  }
}

const onGameDevTool = (): void => {
  const game_wv = getGame()?.getWebview()
  if (game_wv) {
    if (game_wv.isDevToolsOpened()) {
      game_wv.closeDevTools()
    } else {
      game_wv.openDevTools()
    }
  }
}

const onMute = (): void => {
  getGame()?.setMute(!gameState.muted)
}
</script>

<template>
  <div class="main-root" ref="el">
    <TitleBar
      v-if="rendererIsGame()"
      @timeline="onTimeline"
      :timeline_pressed="show_timeline"
      @rec="onRec"
      @recStop="onRecStop"
      @screenshot="onScreenShot"
      @gameDevtool="onGameDevTool"
      @mute="onMute"
    />
    <div class="main-content" :style="mainStyle">
      <div class="game-content" v-if="rendererIsGame()" :style="gameStyle">
        <Game ref="game" />
      </div>
      <div
        class="assist-right-content"
        :class="{ 'is-hidden': rendererIsGame() && !assistInGame() }"
      >
        <Assist />
      </div>
      <div
        v-if="rendererIsGame()"
        class="assist-bottom-content"
        :class="{ 'is-hidden': !assistInGame() }"
      >
        <div><QuestList /></div>
        <div><NDockList /></div>
        <div><KDockList /></div>
      </div>
    </div>
    <Timeline
      id="timeline"
      v-if="show_timeline"
      v-model:show="show_timeline"
      :data="timeline_data"
    />
  </div>
</template>
