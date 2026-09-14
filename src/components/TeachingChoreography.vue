<script setup lang="ts">
import { computed } from 'vue'
import type { ChoreographyStep } from '../services/teachingChoreography'

const props = defineProps<{
  steps: ChoreographyStep[]
  index: number
  autoPlay: boolean
}>()

const emit = defineEmits<{
  (e: 'previous'): void
  (e: 'next'): void
  (e: 'toggle-auto'): void
}>()

const current = computed(() => props.steps[props.index] ?? null)
</script>

<template>
  <aside v-if="current" class="choreography-card">
    <div class="choreography-head">
      <span>🎬 Teaching choreography</span>
      <b>{{ index + 1 }} / {{ steps.length }}</b>
    </div>
    <strong>{{ current.label }}</strong>
    <small>{{ current.action }} · {{ Math.round(current.durationMs / 100) / 10 }}s</small>
    <div class="choreography-progress">
      <i v-for="(_, stepIndex) in steps" :key="stepIndex" :class="{ active: stepIndex <= index }"></i>
    </div>
    <div class="choreography-controls">
      <button :disabled="index <= 0" @click="emit('previous')">← Cue</button>
      <button :class="{ active: autoPlay }" @click="emit('toggle-auto')">{{ autoPlay ? '⏸ Auto' : '▶ Auto' }}</button>
      <button :disabled="index >= steps.length - 1" @click="emit('next')">Cue →</button>
    </div>
  </aside>
</template>
