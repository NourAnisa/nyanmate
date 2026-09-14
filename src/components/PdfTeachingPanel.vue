<script setup lang="ts">
import { computed, ref } from 'vue'
import { preparePdf, type PreparedPdf, type TeachingCue } from '../services/pdfTeaching'

const emit = defineEmits<{
  (e: 'prepared', payload: PreparedPdf): void
  (e: 'cue', payload: TeachingCue): void
}>()

const loading = ref(false)
const error = ref('')
const prepared = ref<PreparedPdf | null>(null)
const currentPage = ref(1)

const currentCue = computed(() => prepared.value?.cues[currentPage.value - 1] ?? null)
const confidenceText = computed(() => currentCue.value ? `${Math.round(currentCue.value.confidence * 100)}%` : '—')

async function handleFile(file?: File) {
  if (!file) return
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    error.value = 'Please choose a PDF file.'
    return
  }

  loading.value = true
  error.value = ''
  try {
    prepared.value = await preparePdf(file)
    currentPage.value = 1
    emit('prepared', prepared.value)
    if (currentCue.value) emit('cue', currentCue.value)
  } catch (err) {
    console.error(err)
    error.value = 'NyanMate could not read this PDF.'
  } finally {
    loading.value = false
  }
}

function inputChanged(event: Event) {
  const input = event.target as HTMLInputElement
  handleFile(input.files?.[0])
}

function dropFile(event: DragEvent) {
  handleFile(event.dataTransfer?.files?.[0])
}

function go(delta: number) {
  if (!prepared.value) return
  currentPage.value = Math.max(1, Math.min(prepared.value.pageCount, currentPage.value + delta))
  if (currentCue.value) emit('cue', currentCue.value)
}

function setPage(page: number) {
  if (!prepared.value) return
  currentPage.value = Math.max(1, Math.min(prepared.value.pageCount, page))
  if (currentCue.value) emit('cue', currentCue.value)
}

defineExpose({ go, setPage })
</script>

<template>
  <section class="pdf-panel" @dragover.prevent @drop.prevent="dropFile">
    <div v-if="!prepared" class="pdf-dropzone">
      <strong>📄 Prepare PDF Teaching</strong>
      <p>Drop your lecture PDF here. NyanMate analyzes it locally and prepares gestures for each page.</p>
      <label class="pdf-picker">
        {{ loading ? 'Reading PDF…' : 'Choose PDF' }}
        <input type="file" accept="application/pdf,.pdf" :disabled="loading" @change="inputChanged" />
      </label>
      <small v-if="error" class="pdf-error">{{ error }}</small>
    </div>

    <div v-else class="pdf-ready">
      <div class="pdf-title-row">
        <div><strong>📄 {{ prepared.name }}</strong><small>{{ prepared.pageCount }} pages · prepared locally</small></div>
        <label class="pdf-replace">Replace<input type="file" accept="application/pdf,.pdf" @change="inputChanged" /></label>
      </div>

      <div v-if="currentCue" class="cue-card">
        <div class="cue-head"><span>Page {{ currentPage }} / {{ prepared.pageCount }}</span><b>{{ currentCue.title }}</b></div>
        <p>{{ currentCue.message }}</p>
        <div class="focus-meta">
          <span>🎯 {{ currentCue.focusLabel }}</span>
          <span>{{ currentCue.focusKind }}</span>
          <span>{{ confidenceText }}</span>
          <span>pet: {{ currentCue.safeSide }}</span>
        </div>
        <small v-if="currentCue.textPreview">“{{ currentCue.textPreview }}{{ currentCue.textPreview.length >= 180 ? '…' : '' }}”</small>
      </div>

      <div class="pdf-controls">
        <button :disabled="currentPage <= 1" @click="go(-1)">← Previous</button>
        <input :value="currentPage" type="number" min="1" :max="prepared.pageCount" @change="setPage(Number(($event.target as HTMLInputElement).value))" />
        <button :disabled="currentPage >= prepared.pageCount" @click="go(1)">Next →</button>
      </div>
    </div>
  </section>
</template>
