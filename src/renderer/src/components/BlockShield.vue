<script setup lang="ts">
import { ref, computed, useId } from 'vue'
import { RectRate } from '@common/const'
import { EnvRenderer } from '@renderer/common/env-renderer'

/////////////////////////////////////////////////////////////////////////////////////
// デバッグログ
const DEBUG = 0;

const debug = (...args: any[]) => {
  if (DEBUG) console.debug("[block shield]", ...args);
};

/////////////////////////////////////////////////////////////////////////////////////
// 
const props = defineProps<{ 
  rectRate: RectRate;  // ブロックUI配置箇所
}>()
const shieldGlowId = `shield-glow-${useId().replaceAll(':', '-')}`
const shieldGlowUrl = `url(#${shieldGlowId})`

/////////////////////////////////////////////////////////////////////////////////////
// 
const toPercent = (value: number): string => `${value * 100}%`
const buttonCoverStyle = computed(() => {
  const rectRate = props.rectRate
  const outline = EnvRenderer.isTestMode ? '1px solid red' : undefined
  const opacity = EnvRenderer.isTestMode ? 1.0 : undefined
  const ret = {
    '--left': toPercent(rectRate.left),
    '--top': toPercent(rectRate.top),
    '--width': toPercent(rectRate.width),
    '--height': toPercent(rectRate.height),
    '--shield-glow-url': shieldGlowUrl,
    outline,
    opacity
  }
  debug('buttonCoverStyle', ret)
  return ret
})

const isGuardHit = ref(false)
const guardHitEffectMs = 550
let guardHitEffectTimer: ReturnType<typeof setTimeout> | null = null

function doGuardHitEffect(): void {

  // シールドアニメーション表示開始
  if (guardHitEffectTimer) {
    clearTimeout(guardHitEffectTimer)
    guardHitEffectTimer = null
  }

  isGuardHit.value = false

  requestAnimationFrame(() => {
    isGuardHit.value = true

    guardHitEffectTimer = setTimeout(() => {
      isGuardHit.value = false
      guardHitEffectTimer = null
    }, guardHitEffectMs)
  })
}

const onButtonCoverClick = (_event: MouseEvent): void => {
  doGuardHitEffect()
}

// exports
defineExpose({
  doGuardHitEffect,
})

</script>
<template>
  <div class="button-cover" 
    title="大破進撃防止" 
    :class="{ 'is-guard-hit': isGuardHit }"
    :style="buttonCoverStyle"
    @click.prevent.stop="onButtonCoverClick">
    <svg
      class="button-cover-shield"
      :class="{ 'is-guard-hit': isGuardHit }"
      viewBox="0 0 220 120"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <filter :id="shieldGlowId" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feFlood flood-color="#56f6ff" flood-opacity="0.85" result="glowColor" />
          <feComposite in="glowColor" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <polygon
        class="shield-fill"
        points="38,2 182,2 218,60 182,118 38,118 2,60"
        vector-effect="non-scaling-stroke"
      />

      <polygon
        class="shield-border-outer"
        points="38,2 182,2 218,60 182,118 38,118 2,60"
        vector-effect="non-scaling-stroke"
      />

      <polygon
        class="shield-border-inner"
        points="45,12 175,12 205,60 175,108 45,108 15,60"
        vector-effect="non-scaling-stroke"
      />
    </svg>
  </div>
</template>
