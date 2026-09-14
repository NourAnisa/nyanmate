<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
import type { PreparedPdf } from '../services/pdfTeaching'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

const props = defineProps<{
  pdf: PreparedPdf
  page: number
}>()

const emit = defineEmits<{
  (e: 'rendered', page: number): void
  (e: 'error', message: string): void
}>()

const canvas = ref<HTMLCanvasElement | null>(null)
const loading = ref(false)
let documentTask: ReturnType<typeof pdfjsLib.getDocument> | null = null
let pdfDocument: Awaited<ReturnType<ReturnType<typeof pdfjsLib.getDocument>['promise']['then']>> | null = null
let renderTask: { cancel: () => void; promise: Promise<unknown> } | null = null

async function loadDocument() {
  try {
    documentTask?.destroy()
    documentTask = pdfjsLib.getDocument({ data: props.pdf.bytes.slice() })
    pdfDocument = await documentTask.promise
    await renderPage()
  } catch (error) {
    console.error(error)
    emit('error', 'NyanMate could not open the prepared PDF for presentation.')
  }
}

async function renderPage() {
  if (!pdfDocument || !canvas.value) return
  loading.value = true
  try {
    renderTask?.cancel()
    const page = await pdfDocument.getPage(props.page)
    const base = page.getViewport({ scale: 1 })
    const availableWidth = Math.max(320, window.innerWidth - 48)
    const availableHeight = Math.max(240, window.innerHeight - 96)
    const scale = Math.min(availableWidth / base.width, availableHeight / base.height)
    const viewport = page.getViewport({ scale })
    const outputScale = Math.min(window.devicePixelRatio || 1, 2)
    const target = canvas.value
    const context = target.getContext('2d')
    if (!context) return

    target.width = Math.floor(viewport.width * outputScale)
    target.height = Math.floor(viewport.height * outputScale)
    target.style.width = `${Math.floor(viewport.width)}px`
    target.style.height = `${Math.floor(viewport.height)}px`

    const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined
    renderTask = page.render({ canvasContext: context, viewport, transform })
    await renderTask.promise
    emit('rendered', props.page)
  } catch (error) {
    if ((error as { name?: string }).name !== 'RenderingCancelledException') {
      console.error(error)
      emit('error', 'Could not render this PDF page.')
    }
  } finally {
    loading.value = false
  }
}

function handleResize() {
  void renderPage()
}

watch(() => props.page, async () => {
  await nextTick()
  await renderPage()
})

watch(() => props.pdf, () => {
  void loadDocument()
})

onMounted(() => {
  window.addEventListener('resize', handleResize)
  void loadDocument()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  renderTask?.cancel()
  documentTask?.destroy()
})
</script>

<template>
  <div class="pdf-stage" aria-live="polite">
    <canvas ref="canvas" class="pdf-stage-canvas"></canvas>
    <div v-if="loading" class="pdf-stage-loading">Rendering page {{ page }}…</div>
  </div>
</template>
