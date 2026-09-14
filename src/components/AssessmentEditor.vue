<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { PreparedPdf } from '../services/pdfTeaching'
import {
  createDefaultAssessment,
  loadAssessmentConfig,
  saveAssessmentConfig,
  type AssessmentConfig,
  type AssessmentKind,
  type PageAssessment,
} from '../services/assessment'

const props = defineProps<{ pdf: PreparedPdf | null }>()
const emit = defineEmits<{ (e: 'change', value: AssessmentConfig): void }>()

const config = ref<AssessmentConfig | null>(null)
const selectedPage = ref(1)
const current = computed(() => config.value?.pages.find(item => item.page === selectedPage.value) ?? null)

watch(() => props.pdf?.name, () => {
  if (!props.pdf) { config.value = null; return }
  config.value = loadAssessmentConfig(props.pdf.name)
  selectedPage.value = config.value.pages[0]?.page ?? 1
  emit('change', config.value)
}, { immediate: true })

function persist() {
  if (!config.value) return
  saveAssessmentConfig(config.value)
  emit('change', config.value)
}

function addAssessment(kind: AssessmentKind = 'quiz') {
  if (!config.value || !props.pdf) return
  const page = Math.max(1, Math.min(props.pdf.pageCount, selectedPage.value))
  if (!config.value.pages.some(item => item.page === page)) config.value.pages.push(createDefaultAssessment(page, kind))
  config.value.pages.sort((a, b) => a.page - b.page)
  persist()
}

function removeAssessment() {
  if (!config.value) return
  config.value.pages = config.value.pages.filter(item => item.page !== selectedPage.value)
  persist()
}

function update(mutator: (item: PageAssessment) => void) {
  if (!current.value) return
  mutator(current.value)
  persist()
}
</script>

<template>
  <section v-if="pdf" class="assessment-editor section">
    <h3>🧠 Assessment & interaction</h3>
    <div class="assessment-page-picker">
      <span>Page</span>
      <input v-model.number="selectedPage" type="number" min="1" :max="pdf.pageCount" />
      <button v-if="!current" @click="addAssessment('quiz')">+ Quiz</button>
      <button v-else class="danger-lite" @click="removeAssessment">Remove</button>
    </div>

    <template v-if="current">
      <div class="assessment-grid">
        <label>Type<select :value="current.kind" @change="update(i => i.kind = ($event.target as HTMLSelectElement).value as AssessmentKind)"><option value="quiz">Quiz</option><option value="check">Check</option><option value="practice">Practice</option></select></label>
        <label>Countdown<input :value="current.countdownSec" type="number" min="5" max="600" @change="update(i => i.countdownSec = Number(($event.target as HTMLInputElement).value))" /></label>
      </div>
      <label>Question<textarea :value="current.question" rows="2" @input="update(i => i.question = ($event.target as HTMLTextAreaElement).value)"></textarea></label>
      <div class="assessment-options">
        <label v-for="option in current.options" :key="option.id">
          <input type="radio" :name="`correct-${current.page}`" :checked="current.correctOptionId === option.id" @change="update(i => i.correctOptionId = option.id)" />
          <span>{{ option.id.toUpperCase() }}</span>
          <input :value="option.text" @input="update(i => { const target = i.options.find(o => o.id === option.id); if (target) target.text = ($event.target as HTMLInputElement).value })" />
        </label>
      </div>
      <label>Reveal explanation<textarea :value="current.explanation" rows="2" @input="update(i => i.explanation = ($event.target as HTMLTextAreaElement).value)"></textarea></label>
      <small>Everything is stored locally with this PDF.</small>
    </template>
    <small v-else>Add a quiz/check/practice interaction to this page.</small>
  </section>
</template>
