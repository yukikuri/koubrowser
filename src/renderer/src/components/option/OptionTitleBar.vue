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
    <div class="option-titlebar-sidebar"></div>
    <div class="option-titlebar-drag-area"></div>
    <div class="option-titlebar-buttons">
      <button class="option-titlebar-button" type="button" aria-label="最小化" @click="minimize">
        -
      </button>
      <button class="option-titlebar-button close" type="button" aria-label="閉じる" @click="close">
        x
      </button>
    </div>
  </header>
</template>
