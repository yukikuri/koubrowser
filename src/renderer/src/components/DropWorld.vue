<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ApiMapAreaType } from '@common/kcs'
import DropAreas from '@renderer/components/DropAreas.vue'
import { svdata } from '@renderer/store/svdata'
import { EventName, eventNames } from '@common/area_name'

type Props = { deck_index?: number }
const props = withDefaults(defineProps<Props>(), { deck_index: 0 })

const index = ref(0)
const selectedAreaId = ref(0)

const onChange = (valueNew: number): void => {
  // debug log if needed
  console.log('world tab changed', 'old world:', index.value, 'new world:', valueNew)
  if (valueNew !== 7) {
    eventSelected(0);
    selectedAreaId.value = 0;
  }
}

const inEvent = (): boolean => {
  return svdata.inEvent
}

const eventAreaId = computed<number>(() => svdata.mstMapareaType(ApiMapAreaType.event)?.api_id ?? 0)

onMounted(() => {
  console.log('world mounted')
})

onUnmounted(() => {
})

interface EventAreaDropDownItem extends EventName {
  isSelected?: boolean
}

const eventDropdownItems: EventAreaDropDownItem[] = [...eventNames.toReversed()];

function eventSelected(areaId: number) {
  console.log('event area selected:', areaId)
  const oldSelected = eventDropdownItems.find(item => item.isSelected);
  if (oldSelected) {
    oldSelected.isSelected = false;
  }

  if (areaId) {
    const newSelected = eventDropdownItems.find(item => item.areaId === areaId);
    if (newSelected) {
      newSelected.isSelected = true;
      selectedAreaId.value = newSelected.areaId;
    }
    index.value = 7;
  }
}

const selectedEventPeriod = computed((): string => {
  const selected = eventDropdownItems.find(item => selectedAreaId.value === item.areaId);
  if (selected) {
    return selected.periodName;
  } else {
    return '';
  }
});

const selectedEventTitle = computed((): string => {
  const selected = eventDropdownItems.find(item => selectedAreaId.value === item.areaId);
  if (selected) {
    return selected.title;
  } else {
    return 'イベント海域を選択';
  }
});

</script>

<template>
  <div class="world-root">
    <b-tabs
      type="is-toggle"
      size="is-small"
      expanded
      class="world-tabs"
      @update:modelValue="onChange"
      v-model="index"
    >
      <b-tab-item>
        <template #header>
          <img class="world-img" title="1: 鎮守府海域" src="../assets/img/world/world1.png" />
        </template>
        <DropAreas v-if="index === 0" :area_id="1" />
      </b-tab-item>
      <b-tab-item>
        <template #header>
          <img class="world-img" title="2: 南西諸島海域" src="../assets/img/world/world2.png" />
        </template>
        <DropAreas v-if="index === 1" :area_id="2" />
      </b-tab-item>
      <b-tab-item>
        <template #header>
          <img class="world-img" title="3: 北方海域" src="../assets/img/world/world3.png" />
        </template>
        <DropAreas v-if="index === 2" :area_id="3" />
      </b-tab-item>
      <b-tab-item>
        <template #header>
          <img class="world-img" title="7: 南西海域" src="../assets/img/world/world7.png" />
        </template>
        <DropAreas v-if="index === 3" :area_id="7" />
      </b-tab-item>
      <b-tab-item>
        <template #header>
          <img class="world-img" title="4: 西方海域" src="../assets/img/world/world4.png" />
        </template>
        <DropAreas v-if="index === 4" :area_id="4" />
      </b-tab-item>
      <b-tab-item>
        <template #header>
          <img class="world-img" title="5: 南方海域" src="../assets/img/world/world5.png" />
        </template>
        <DropAreas v-if="index === 5" :area_id="5" />
      </b-tab-item>
      <b-tab-item>
        <template #header>
          <img class="world-img" title="6: 中部海域" src="../assets/img/world/world6.png" />
        </template>
        <DropAreas v-if="index === 6" :area_id="6" />
      </b-tab-item>
      <b-tab-item headerClass="is-event-tab">
        <DropAreas
          v-if="index === 7"
          :key="selectedAreaId"
          :area_id="selectedAreaId"
        />
      </b-tab-item>
    </b-tabs>
    <div class="event-select-dropdown" :class="{ 'is-selected': index===7}">
      <!-- todo fix warning dropdown item selected
      https://w3c.github.io/aria/#aria-hidden -->
      <b-dropdown
        @change="eventSelected">
          <template #trigger="{ active }">
            <div class="trigger" :class="{ 'active' : active }">
              <div class="name-parts">
                <span class="event-period-name">{{ selectedEventPeriod }}</span>
                <span class="event-title">{{ selectedEventTitle }}</span>
              </div>
              <div class="chevron-parts">
                <b-icon pack="fa" icon="chevron-down"/>
              </div>
            </div>
          </template>
          <b-dropdown-item v-for="(item, index) in eventDropdownItems" :key="index" 
            :value="item.areaId"><span 
              class="event-period-name">{{ item.periodName }}</span><span 
              class="event-title">{{ item.title }}</span></b-dropdown-item>          
      </b-dropdown>
    </div>
  </div>
</template>