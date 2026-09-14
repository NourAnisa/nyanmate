<script setup lang="ts">
import { computed } from 'vue'
import type { PageAssessment } from '../services/assessment'

const props = defineProps<{
  assessment: PageAssessment
  remaining: number
  selectedOptionId: string
  revealed: boolean
}>()

const emit = defineEmits<{
  (e: 'select', id: string): void
  (e: 'reveal'): void
  (e: 'close'): void
}>()

const timeText = computed(() => `${String(Math.floor(props.remaining / 60)).padStart(2, '0')}:${String(props.remaining % 60).padStart(2, '0')}`)
</script>

<template>
  <section class="assessment-overlay">
    <div class="assessment-card-live">
      <header>
        <div><small>{{ assessment.kind.toUpperCase() }}</small><h2>{{ assessment.question }}</h2></div>
        <b :class="{ urgent: remaining <= 10 }">⏱ {{ timeText }}</b>
      </header>
      <div class="assessment-live-options">
        <button
          v-for="option in assessment.options"
          :key="option.id"
          :class="{
            selected: selectedOptionId === option.id,
            correct: revealed && assessment.correctOptionId === option.id,
            wrong: revealed && selectedOptionId === option.id && assessment.correctOptionId !== option.id,
          }"
          @click="emit('select', option.id)"
        >
          <span>{{ option.id.toUpperCase() }}</span>{{ option.text }}
        </button>
      </div>
      <div v-if="revealed" class="assessment-explanation">✓ {{ assessment.explanation }}</div>
      <footer>
        <button @click="emit('close')">Close</button>
        <button class="primary" @click="emit('reveal')">{{ revealed ? 'Answer revealed' : 'Reveal answer' }}</button>
      </footer>
    </div>
  </section>
</template>
