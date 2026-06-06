<script setup lang="ts">
import { ApiShipType, ApiShipTypeHojoClasses, ApiShipTypeJyujyunClasses, ApiShipTypeKaiboukanClasses, ApiShipTypeKeijyunClasses, ApiShipTypeKuboClasses, ApiShipTypeKutikukanClasses, ApiShipTypeSenkanClasses, ApiShipTypeSensuikanClasses, MstShip, MstShipIdBeginEnemy } from '@common/kcs';
import { svdata } from '@renderer/store/svdata';
import { onMounted, onUnmounted, computed, ref, toRaw, isProxy, nextTick } from 'vue';
import ShipBanner from './ShipBanner.vue';
const tabIndex = ref<number>(0);
const el = ref<HTMLElement | null>(null);
let selectedId = 0;

// -----------------------------------------------------------------
//
const props = withDefaults(
  defineProps<{
    selected_ship_id: number
  }>(),
  {
    selected_ship_id: 0,
  }
)

const emit = defineEmits<{
  (e: 'update:selected_ship_id', v: number): void
}>()

// -----------------------------------------------------------------
//
interface TabInfo {
  name: string;
  types: ApiShipType[];
}
const tabNames: TabInfo[] = [
  { name: '戦艦級', types: ApiShipTypeSenkanClasses },
  { name: '航空母艦', types: ApiShipTypeKuboClasses },  
  { name: '重巡級', types: ApiShipTypeJyujyunClasses },
  { name: '軽巡級', types: ApiShipTypeKeijyunClasses },
  { name: '駆逐艦', types: ApiShipTypeKutikukanClasses },
  { name: '海防艦', types: ApiShipTypeKaiboukanClasses },
  { name: '潜水艦', types: ApiShipTypeSensuikanClasses },
  { name: '補助艦艇', types: ApiShipTypeHojoClasses },
];

// -----------------------------------------------------------------
//
const dropShips = ref<MstShip[]>([])
function initShipRMap(): void {
  // ドロップ艦の抽出
  interface RMapInfo {
    afters: MstShip[]
  }
  const shipRInfos : RMapInfo[] = []
  const msts = toRaw(svdata.mstShips).filter(mst => {
    // 敵は除外
    if (mst.api_id >= MstShipIdBeginEnemy) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    return a.api_sort_id - b.api_sort_id;
  });

  for (const mst of msts) {
    let mstAfterId = parseInt(mst.api_aftershipid);
    const finded = shipRInfos.find((rinfo) => {
      return rinfo.afters.find((after) => {
        const afterid = parseInt(after.api_aftershipid)
        return afterid === mst.api_id || 
        after.api_id === mstAfterId
      })
    })
    if (finded) {
      // 登録済み
    } else {
      // 新規登録
      // 改装順をたどり、最初の艦をドロップ艦とする

      const afters: MstShip[] = [];

      const findMstByAfterId =(api_id: number): MstShip | undefined => {
        const idStr = api_id.toString();
        return msts.find((m) => {
          return m.api_aftershipid === idStr;
        });
      }

      // find first
      let preMst = findMstByAfterId(mst.api_id);
      if (preMst) {
        const checkIds: number[] = [];
        checkIds.push(preMst.api_id);
        while(preMst) {
          const prepre = findMstByAfterId(preMst.api_id);
          if (prepre && ! checkIds.includes(prepre.api_id)) {
            checkIds.push(prepre.api_id);
            preMst = prepre;
          } else {
            break;
          }
        }
      } else {
        preMst = mst;
      }

      let nextMst : MstShip | undefined = preMst;
      while(nextMst) {
        afters.push(nextMst);
        mstAfterId = parseInt(nextMst.api_aftershipid);
        if (afters.find((m) => m.api_id === mstAfterId)) {
          // 無限ループ防止
          break;
        }
        nextMst =  mstAfterId ? msts.find((m) => {
          return m.api_id === mstAfterId;
        }) : undefined
      }

      if (afters.length) {
        shipRInfos.push({afters});
      }
    }
  }

  // 改装前の艦をドロップ艦として登録
  const dropShipsLocal: MstShip[] = []
  shipRInfos.forEach((rinfo) => {
    dropShipsLocal.push(rinfo.afters[0]);
  })
  dropShips.value = dropShipsLocal;
}

// -----------------------------------------------------------------
//
interface ShipInfo {
  mst: MstShip
}

const shipsByType = computed(() : ShipInfo[] => {
  console.log('shipsByType computed. tabIndex:', tabIndex.value);

  const msts = dropShips.value
  const ret: ShipInfo[] = [];
  const tab = tabNames[tabIndex.value];
  for (const mst of msts) {
    if (tab.types.indexOf(mst.api_stype) >= 0) {
      ret.push({mst});
    }
  }
  return ret;
})

onMounted(() => {
  console.log('DropByShipControl mounted');
});

onUnmounted(() => {
  console.log('DropByShipControl unmounted');
}); 

const setSelectedStyle = (id: number, selected: boolean) => {
  const selector = '#ship-selector-' + id;
  const elSelected = el.value?.querySelector(selector);
  const selectedClassName = 'is-selected';
  if (elSelected) {
    if (selected) {
      elSelected.classList.add(selectedClassName);
      console.log('added selected class to', id);
    } else {
      elSelected.classList.remove(selectedClassName);
      console.log('removed selected class from', id);
    }
  }
}

function selectShipChanged(id: number) {
  if (selectedId === id) {
   return;
  }
  if (selectedId > 0) {
    setSelectedStyle(selectedId, false);
  }
  selectedId = id;
  if (selectedId > 0) {
    setSelectedStyle(selectedId, true);
  }
}

function shipSelected(mst_id: number): void {
  console.log('ship selected:', mst_id, !!el.value);
  selectShipChanged(mst_id);
  emit('update:selected_ship_id', mst_id);
}

function onTabChange(_value: number): void {
  console.log('ship type tab changed:', _value, 'selectedId:', selectedId);
  nextTick(() => {
    if (selectedId > 0) {
      setSelectedStyle(selectedId, true);
    }
  });
}

// -----------------------------------------------------------------
// initialize
(() => {
  initShipRMap();
  console.log('dropShips count:', dropShips.value.length);
})();

// -----------------------------------------------------------------
// ref elem
</script>
<template>
  <section class="ship-select-control" ref="el">
    <b-tabs type="is-toggle" size="is-small" class="ship-type-tabs" :animated="false" destroy-on-hide
      expanded v-model="tabIndex" @update:modelValue="onTabChange">
      <b-tab-item v-for="(tab, tabIndex) in tabNames" :key="tabIndex"
        :label="tab.name">
        <div class="ship-selector-container">
          <span v-for="(ship) in shipsByType" :key="ship.mst.api_id">
            <span class="ship-selector"
              :id="'ship-selector-'+ship.mst.api_id"
              @click="shipSelected(ship.mst.api_id)"
              :title="ship.mst.api_id.toString() + ' ' + ship.mst.api_name"><ShipBanner 
                :mst_id="ship.mst.api_id" /><span 
                class="ship-name">{{ ship.mst.api_name }}</span></span>
          </span>
        </div>
      </b-tab-item>
    </b-tabs>
  </section>
</template>
