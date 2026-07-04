<script setup lang="ts">
const minimize = (): void => {
  window.optionApi.minimize()
}

const close = (): void => {
  window.optionApi.close()
}
</script>

<template>
  <header class="option-titlebar">
    <div class="sidebar"></div>
    <div class="drag-area"></div>
    <div class="buttons">
      <button class="button minimize is-size-7" type="button" aria-label="最小化" @click="minimize">
        <span>&#x2014;</span>
      </button>
      <button class="button close" type="button" aria-label="閉じる" @click="close">
        <span>&#10005;</span>
      </button>
    </div>
  </header>
</template>
