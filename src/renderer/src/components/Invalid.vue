<script setup lang="ts">
import { t } from '../i18n'
import { computed, onMounted, onUnmounted } from 'vue'

const displayMessage = computed(
  () => t('invalid.message')
)

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
          <h1 class="title is-5 invalid-title">{{ t('invalid.title') }}</h1>
          <p
            v-for="line in displayMessage.split('\n')"
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
