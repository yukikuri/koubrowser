<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

interface Props {
  message?: string
}

withDefaults(defineProps<Props>(), {
  message:
    'DMM ログイン後、「GAME START」画面まで自動で遷移を行います。\n「GAME START」ボタンからゲームを開始すると情報が表示されます。'
})

onMounted(() => {
  console.debug('invalid mounted')
})

onUnmounted(() => {
  console.debug('invalid destroyed')
})
</script>
<template>
  <section class="invalid-root hero is-dark is-fullheight">
    <div class="hero-body">
      <div class="container invalid-container">
        <section class="invalid-card">
          <h1 class="title is-5 invalid-title">艦隊情報表示</h1>
          <p
            v-for="line in message.split('\n')"
            :key="line"
            class="subtitle is-6 invalid-message"
          >
            {{ line }}
        </p>
        </section>
      </div>
    </div>
  </section>
</template>
