<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { emit, listen, type UnlistenFn } from '@tauri-apps/api/event'
import { getCurrentWindow, primaryMonitor } from '@tauri-apps/api/window'

interface PresenterState {
  active: boolean
  topic: string
  page: number
  total: number
  cueTitle: string
  cueMessage: string
  textPreview: string
  notes: string
  choreographyLabel: string
  choreographyAction: string
  choreographyIndex: number
  choreographyTotal: number
  choreographyAutoPlay: boolean
}

const state = ref<PresenterState>({
  active: false,
  topic: 'NyanMate Teaching',
  page: 1,
  total: 1,
  cueTitle: 'Waiting',
  cueMessage: 'Start a presentation from the NyanMate window.',
  textPreview: '',
  notes: '',
  choreographyLabel: 'Waiting',
  choreographyAction: 'explain',
  choreographyIndex: 0,
  choreographyTotal: 0,
  choreographyAutoPlay: true,
})

let unlisten: UnlistenFn | undefined

const progress = computed(() => Math.round((state.value.page / Math.max(1, state.value.total)) * 100))
const choreographyProgress = computed(() => state.value.choreographyTotal
  ? Math.round((state.value.choreographyIndex / state.value.choreographyTotal) * 100)
  : 0)

function control(action: 'prev' | 'next' | 'question' | 'discussion' | 'cue-prev' | 'cue-next' | 'auto' | 'end') {
  void emit('presenter-control', { action })
}

onMounted(async () => {
  try {
    const primary = await primaryMonitor()
    if (primary) await getCurrentWindow().setPosition(primary.position)
  } catch {
    // Browser preview or restricted window API: keep the default position.
  }

  unlisten = await listen<PresenterState>('presenter-state', (event) => {
    state.value = event.payload
  })
  await emit('presenter-ready')
})

onUnmounted(() => unlisten?.())
</script>

<template>
  <main class="presenter-console">
    <header class="presenter-console-header">
      <div>
        <small>NyanMate Presenter Console</small>
        <h1>{{ state.topic }}</h1>
      </div>
      <span class="presenter-live" :class="{ active: state.active }">{{ state.active ? 'LIVE' : 'STANDBY' }}</span>
    </header>

    <section class="presenter-progress-card">
      <div><strong>Page {{ state.page }} / {{ state.total }}</strong><span>{{ progress }}%</span></div>
      <progress :value="state.page" :max="state.total"></progress>
    </section>

    <section class="presenter-card cue">
      <small>Teaching cue</small>
      <h2>{{ state.cueTitle }}</h2>
      <p>{{ state.cueMessage }}</p>
    </section>

    <section class="presenter-card choreography-console-card">
      <div class="presenter-choreo-head">
        <small>🎬 Choreography</small>
        <span>{{ state.choreographyIndex }} / {{ state.choreographyTotal }}</span>
      </div>
      <h2>{{ state.choreographyLabel }}</h2>
      <p>{{ state.choreographyAction }} · {{ choreographyProgress }}%</p>
      <progress :value="state.choreographyIndex" :max="Math.max(1, state.choreographyTotal)"></progress>
      <div class="presenter-choreo-controls">
        <button @click="control('cue-prev')">← Cue</button>
        <button :class="{ active: state.choreographyAutoPlay }" @click="control('auto')">{{ state.choreographyAutoPlay ? '⏸ Auto' : '▶ Auto' }}</button>
        <button @click="control('cue-next')">Cue →</button>
      </div>
    </section>

    <section v-if="state.textPreview" class="presenter-card">
      <small>Slide preview</small>
      <p>{{ state.textPreview }}</p>
    </section>

    <section class="presenter-card notes-card">
      <small>Private presenter notes</small>
      <p>{{ state.notes || 'No additional notes for this page.' }}</p>
    </section>

    <nav class="presenter-console-controls">
      <button @click="control('prev')">← Previous</button>
      <button @click="control('question')">❓ Ask</button>
      <button @click="control('discussion')">💬 Discuss</button>
      <button @click="control('next')">Next →</button>
      <button class="end" @click="control('end')">End presentation</button>
    </nav>

    <footer>Presenter Console stays on the lecturer screen. The projector window shows only the PDF and NyanMate choreography.</footer>
  </main>
</template>
