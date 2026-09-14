<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { PreparedPdf } from '../services/pdfTeaching'
import {
  createDefaultLessonFlow,
  lessonStageLabels,
  loadLessonFlow,
  saveLessonFlow,
  type LessonFlowConfig,
  type LessonStage,
} from '../services/lessonFlow'

const props = defineProps<{ pdf: PreparedPdf | null }>()
const emit = defineEmits<{ (e: 'change', flow: LessonFlowConfig): void }>()

const flow = ref<LessonFlowConfig | null>(null)
const selectedPage = ref(1)
const stages = Object.keys(lessonStageLabels) as LessonStage[]
const selectedPlan = computed(() => flow.value?.pages.find(item => item.page === selectedPage.value) ?? null)

function load() {
  if (!props.pdf) {
    flow.value = null
    return
  }
  flow.value = loadLessonFlow(props.pdf.name) ?? createDefaultLessonFlow(props.pdf.name, props.pdf.cues, props.pdf.pageCount)
  selectedPage.value = Math.min(selectedPage.value, props.pdf.pageCount)
  emit('change', flow.value)
}

function persist() {
  if (!props.pdf || !flow.value) return
  saveLessonFlow(props.pdf.name, flow.value)
  emit('change', flow.value)
}

function resetFlow() {
  if (!props.pdf) return
  flow.value = createDefaultLessonFlow(props.pdf.name, props.pdf.cues, props.pdf.pageCount)
  selectedPage.value = 1
  persist()
}

watch(() => props.pdf?.name, load, { immediate: true })
</script>

<template>
  <section v-if="pdf && flow" class="lesson-flow-editor">
    <div class="lesson-flow-head">
      <div>
        <strong>🧭 Lesson Flow Editor</strong>
        <small>Atur peran setiap halaman sebelum mengajar.</small>
      </div>
      <button @click="resetFlow">Reset</button>
    </div>

    <div class="lesson-page-strip">
      <button
        v-for="plan in flow.pages"
        :key="plan.page"
        :class="[`stage-${plan.stage}`, { active: selectedPage === plan.page }]"
        @click="selectedPage = plan.page"
      >
        <b>{{ plan.page }}</b><span>{{ lessonStageLabels[plan.stage] }}</span>
      </button>
    </div>

    <div v-if="selectedPlan" class="lesson-plan-form">
      <div class="lesson-plan-title"><strong>Page {{ selectedPlan.page }}</strong><small>{{ pdf.cues[selectedPlan.page - 1]?.title }}</small></div>
      <label>Lesson stage
        <select v-model="selectedPlan.stage" @change="persist">
          <option v-for="stage in stages" :key="stage" :value="stage">{{ lessonStageLabels[stage] }}</option>
        </select>
      </label>
      <div class="lesson-duration-grid">
        <label>Page time (sec)<input v-model.number="selectedPlan.durationSec" type="number" min="5" max="1800" @change="persist" /></label>
        <label>Discussion (sec)<input v-model.number="selectedPlan.discussionSec" type="number" min="0" max="1800" @change="persist" /></label>
      </div>
      <label class="lesson-check"><input v-model="selectedPlan.autoAdvanceCue" type="checkbox" @change="persist" /> Auto-play choreography cues on this page</label>
      <label>Lecturer note<textarea v-model="selectedPlan.note" rows="3" placeholder="Contoh: minta mahasiswa memberi contoh kasus…" @input="persist"></textarea></label>
    </div>

    <small class="lesson-flow-save">Flow tersimpan lokal per PDF dan dipakai otomatis saat presentasi.</small>
  </section>
</template>
