<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import * as place from '@renderer/stuff/place';

/////////////////////////////////////////////////////////////////////////////////////
// debug
const DEBUG = false;

const debug = (...args: any[]) => {
  if (DEBUG) console.debug("[area/line]", ...args);
};

/////////////////////////////////////////////////////////////////////////////////////
// 
const dur = '2.2s'; // アニメーション時間
const maskr = 10; // マスク円の半径
const minWH = 3; // 最小幅・高さ
const anims = ref<SVGAnimateElement[]>([])
const setAnimRef = (el) => {
  if (el) {
    anims.value.push(el)
  }
};
const dasharray = '8 5'

// ----------------------------------------------------------------------------------
// props
const props = defineProps<{ 
  x1: number; y1: number;
  x2: number; y2: number;
  isAnimate: boolean;
  color: string;
  dashed?: boolean;
}>()

const lineWidth = Math.abs(props.x2 - props.x1)
const lineHeight = Math.abs(props.y2 - props.y1)
const direction = place.getDirection(props.x1, props.y1, props.x2, props.y2);
let x1: number, y1: number, x2: number, y2: number;

interface ViewBox {
  minX: number; 
  minY: number;
  maxX: number; 
  maxY: number;
  width: number; 
  height: number;
} 
function calcViewBox(): ViewBox {
  let minX = 0;
  let minY = 0;
  let width = lineWidth;
  let height = lineHeight;
  if (lineWidth < minWH) {
    minX = -minWH
    width = minWH * 2;
  }
  const maxX = minX + width;  
  if (lineHeight < minWH) {
    minY = -minWH
    height = minWH * 2;
  }
  const maxY = minY + height;

  return { minX, minY, maxX, maxY, width, height };
}
const viewbox = calcViewBox();
const viewboxValue = `${viewbox.minX} ${viewbox.minY} ${viewbox.width} ${viewbox.height}`;
const viewboxWidth = viewbox.maxX - viewbox.minX;
const viewboxHeight = viewbox.maxY - viewbox.minY;
debug('calced direction:', direction, 'viewbox:', viewbox, 'viewboxValue:', viewboxValue);

interface AniAttr {
  name: string; 
  from: number; 
  to: number;
}

interface Ani {
  x: number; y: number;
  width: number; height: number;
  attr1: AniAttr;
  attr2: AniAttr;
}

let ani: Ani | null = null;
if (direction === place.Direction.RightDown) {
  const heightFrom = viewbox.minY < 0 ? viewboxHeight : 0
  const widthFrom = viewbox.minX < 0 ? viewboxWidth : 0
  x1 = 0
  y1 = 0
  x2 = lineWidth;
  y2 = lineHeight;
  ani = {
    x: viewbox.minX, 
    y: viewbox.minY,
    width: widthFrom, 
    height: heightFrom,
    attr1: { name: 'width', from: widthFrom, to: viewboxWidth },
    attr2: { name: 'height', from: heightFrom, to: viewboxHeight },
  };
} else if (direction === place.Direction.RightUp) {
  const widthFrom = viewbox.minX < 0 ? viewboxWidth : 0
  const yFrom = viewbox.minY < 0 ? viewbox.minY : viewbox.maxY
  x1 = 0;
  y1 = lineHeight;
  x2 = lineWidth;
  y2 = 0;
  ani = {
    x: viewbox.minX, 
    y: yFrom,
    width: widthFrom, 
    height: viewboxHeight,
    attr1: { name: 'width', from: widthFrom, to: viewboxWidth },
    attr2: { name: 'y', from: yFrom, to: viewbox.minY },
  };
} else if (direction === place.Direction.LeftDown) {
  const xFrom = viewbox.minX < 0 ? viewbox.minX : viewbox.maxX
  const heightFrom = viewbox.minY < 0 ? viewboxHeight : 0
  x1 = lineWidth;
  y1 = 0;
  x2 = 0;
  y2 = lineHeight;
  ani = {
    x: xFrom,
    y: viewbox.minY,
    width: viewboxWidth, 
    height: heightFrom,
    attr1: { name: 'x', from: xFrom, to: viewbox.minX },
    attr2: { name: 'height', from: heightFrom, to: viewboxHeight },
  };
} else { // LeftUp
  const xFrom = viewbox.minX < 0 ? viewbox.minX : viewbox.maxX  
  const yFrom = viewbox.minY < 0 ? viewbox.minY : viewbox.maxY
  x1 = lineWidth;
  y1 = lineHeight;
  x2 = 0;
  y2 = 0;
  ani = {
    x: xFrom, 
    y: yFrom,
    width: viewboxWidth, 
    height: viewboxHeight,
    attr1: { name: 'x', from: xFrom, to: viewbox.minX },
    attr2: { name: 'y', from: yFrom, to: viewbox.minY },
  };
}

function calcStyle() {
  const left = Math.min(props.x1, props.x2) + viewbox.minX
  const top = Math.min(props.y1, props.y2) + viewbox.minY
  return {
    '--left': `${left}px`,
    '--top': `${top}px`,
    '--width': `${viewboxWidth}px`,
    '--height': `${viewboxHeight}px`,
  }
}
const styleValue = calcStyle();

onMounted(() => {
  debug('area/line mounted', props.x1, props.y1, props.x2, props.y2, 'animate:', props.isAnimate)
  nextTick(() => {
    // レイアウト確定後に開始（環境により rAF が効く）
    requestAnimationFrame(() => {
      debug('area/line animation start')
      anims.value.forEach((anim) => {
        anim.beginElement()
      })
    })
  })
})

onUnmounted(() => {
  debug('area/line destroyed')
})

const maskId = `linemask-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 4)}`;

</script>

<style scoped lang="scss">
.area-line {
  position: absolute;
  left: var(--left);
  top: var(--top);
  width: var(--width);
  height: var(--height);
  z-index: 0;
  svg {
    display: block;
    width: 100%;
    height: 100%;
  }
}
</style>

<template>
  <div class="area-line" :style="styleValue">
    <svg :viewBox="viewboxValue" preserveAspectRatio="none" :width="viewboxWidth" :height="viewboxHeight">
      <defs>
        <mask :id="maskId" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse">
          
          <!-- マスクで線が伸びることを表現 -->
          <rect v-if="props.isAnimate" :x="ani.x" :y="ani.y" :width="ani.width" :height="ani.height" fill="white">
            <animate :ref="setAnimRef" :attributeName="ani.attr1.name" :from="ani.attr1.from" :to="ani.attr1.to" :dur="dur" begin="indefinite" fill="freeze" />
            <animate :ref="setAnimRef" :attributeName="ani.attr2.name" :from="ani.attr2.from" :to="ani.attr2.to" :dur="dur" begin="indefinite" fill="freeze" />
          </rect>

          <rect v-if="!props.isAnimate" :x="viewbox.minX" :y="viewbox.minY" width="100%" height="100%" fill="white" />

          <!-- 開始・終了部分を1/4円マスクで非表示-->
          <circle :cx="x1" :cy="y1" :r="maskr" fill="black" />
          <circle :cx="x2" :cy="y2" :r="maskr" fill="black" />

        </mask>
      </defs>
      <line
        :x1="x1" :y1="y1" :x2="x2" :y2="y2"
        :stroke="props.color"
        stroke-width="3"
        :stroke-dasharray="props.dashed ? dasharray : ''"
        vector-effect="non-scaling-stroke"
        :mask="'url(#'+maskId+')'"
      />
    </svg>
  </div>
</template>