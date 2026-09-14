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
import { loadReportHistory } from '../services/assessment'
import {
  applyAllLessonRebalanceSuggestions,
  applyLessonRebalanceSuggestion,
  buildLessonRebalanceSuggestions,
  type LessonRebalanceSuggestion,
} from '../services/lessonRebalancer'

const props = defineProps<{ pdf: PreparedPdf | null }>()
const emit = defineEmits<{ (e: 'change', flow: LessonFlowConfig): void }>()

const flow = ref<LessonFlowConfig | null>(null)
const selectedPage = ref(1)
const rebalanceOpen = ref(false)
const stages = Object.keys(lessonStageLabels) as LessonStage[]
const selectedPlan = computed(() => flow.value?.pages.find(item => item.page === selectedPage.value) ?? null)
const reports = computed(() => props.pdf ? loadReportHistory(props.pdf.name) : [])
const rebalanceSuggestions = computed(() => buildLessonRebalanceSuggestions(flow.value, reports.value))
const selectedSuggestion = computed(() => rebalanceSuggestions.value.find(item => item.page === selectedPage.value) ?? null)
const durationText = (seconds: number) => seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`

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

function acceptSuggestion(suggestion: LessonRebalanceSuggestion) {
  if (!flow.value) return
  flow.value = applyLessonRebalanceSuggestion(flow.value, suggestion)
  persist()
}

function acceptAllSuggestions() {
  if (!flow.value || !rebalanceSuggestions.value.length) return
  flow.value = applyAllLessonRebalanceSuggestions(flow.value, rebalanceSuggestions.value)
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

    <div v-if="reports.length" class="lesson-rebalancer">
      <div class="lesson-rebalancer-head">
        <div><strong>✨ Smart Lesson Rebalancer</strong><small>{{ reports.length }} sesi historis · rekomendasi lokal, bukan perubahan otomatis.</small></div>
        <button @click="rebalanceOpen = !rebalanceOpen">{{ rebalanceOpen ? 'Hide' : `Review ${rebalanceSuggestions.length}` }}</button>
      </div>
      <div v-if="rebalanceOpen" class="rebalance-body">
        <p v-if="!rebalanceSuggestions.length" class="rebalance-empty">Durasi saat ini cukup dekat dengan pola historis, atau belum ada minimal 2 sesi yang bisa dibandingkan.</p>
        <template v-else>
          <article v-for="item in rebalanceSuggestions" :key="item.page" class="rebalance-card" :class="`confidence-${item.confidence}`">
            <button class="rebalance-page" @click="selectedPage = item.page">Page {{ item.page }}</button>
            <div><strong>{{ durationText(item.currentSec) }} → {{ durationText(item.suggestedSec) }}</strong><small>{{ item.stage }} · {{ item.sessions }} sesi · confidence {{ item.confidence }}</small><p>{{ item.reason }}</p></div>
            <span :class="item.direction">{{ item.deltaSec > 0 ? '+' : '' }}{{ item.deltaSec }}s</span>
            <button class="rebalance-accept" @click="acceptSuggestion(item)">Accept</button>
          </article>
          <div class="rebalance-footer"><small>Saran dibulatkan ke 5 detik dan menggunakan campuran target saat ini + rata-rata aktual agar perubahan tidak terlalu agresif.</small><button @click="acceptAllSuggestions">Accept all</button></div>
        </template>
      </div>
    </div>

    <div class="lesson-page-strip">
      <button
        v-for="plan in flow.pages"
        :key="plan.page"
        :class="[`stage-${plan.stage}`, { active: selectedPage === plan.page, suggested: rebalanceSuggestions.some(item => item.page === plan.page) }]"
        @click="selectedPage = plan.page"
      >
        <b>{{ plan.page }}</b><span>{{ lessonStageLabels[plan.stage] }}</span>
      </button>
    </div>

    <div v-if="selectedPlan" class="lesson-plan-form">
      <div class="lesson-plan-title"><strong>Page {{ selectedPlan.page }}</strong><small>{{ pdf.cues[selectedPlan.page - 1]?.title }}</small></div>
      <div v-if="selectedSuggestion" class="selected-rebalance-hint"><span>✨ Historical suggestion</span><strong>{{ durationText(selectedSuggestion.currentSec) }} → {{ durationText(selectedSuggestion.suggestedSec) }}</strong><button @click="acceptSuggestion(selectedSuggestion)">Apply</button></div>
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
