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
  lessonStage: string
  lessonPageRemaining: number
  lessonDuration: number
  lessonDiscussion: number
  assessmentActive: boolean
  assessmentKind: string
  assessmentRemaining: number
  assessmentQuestion: string
  assessmentRevealed: boolean
}

const state = ref<PresenterState>({
  active: false, topic: 'NyanMate Teaching', page: 1, total: 1, cueTitle: 'Waiting', cueMessage: 'Start a presentation from the NyanMate window.', textPreview: '', notes: '',
  choreographyLabel: 'Waiting', choreographyAction: 'explain', choreographyIndex: 0, choreographyTotal: 0, choreographyAutoPlay: true,
  lessonStage: 'concept', lessonPageRemaining: 0, lessonDuration: 0, lessonDiscussion: 0,
  assessmentActive: false, assessmentKind: '', assessmentRemaining: 0, assessmentQuestion: '', assessmentRevealed: false,
})

let unlisten: UnlistenFn | undefined
const progress = computed(() => Math.round((state.value.page / Math.max(1, state.value.total)) * 100))
const choreographyProgress = computed(() => state.value.choreographyTotal ? Math.round((state.value.choreographyIndex / state.value.choreographyTotal) * 100) : 0)
const pageTime = computed(() => `${String(Math.floor(state.value.lessonPageRemaining / 60)).padStart(2, '0')}:${String(state.value.lessonPageRemaining % 60).padStart(2, '0')}`)
const assessmentTime = computed(() => `${String(Math.floor(state.value.assessmentRemaining / 60)).padStart(2, '0')}:${String(state.value.assessmentRemaining % 60).padStart(2, '0')}`)

function control(action: 'prev' | 'next' | 'question' | 'discussion' | 'assessment' | 'reveal' | 'assessment-close' | 'cue-prev' | 'cue-next' | 'auto' | 'end') { void emit('presenter-control', { action }) }

onMounted(async () => {
  try { const primary = await primaryMonitor(); if (primary) await getCurrentWindow().setPosition(primary.position) } catch { /* keep default */ }
  unlisten = await listen<PresenterState>('presenter-state', (event) => { state.value = event.payload })
  await emit('presenter-ready')
})

onUnmounted(() => unlisten?.())
</script>

<template>
  <main class="presenter-console">
    <header class="presenter-console-header"><div><small>NyanMate Presenter Console</small><h1>{{ state.topic }}</h1></div><span class="presenter-live" :class="{ active: state.active }">{{ state.active ? 'LIVE' : 'STANDBY' }}</span></header>
    <section class="presenter-progress-card"><div><strong>Page {{ state.page }} / {{ state.total }}</strong><span>{{ progress }}%</span></div><progress :value="state.page" :max="state.total"></progress></section>

    <section class="presenter-card presenter-lesson-card">
      <small>🧭 Lesson flow</small>
      <h2>{{ state.lessonStage }}</h2>
      <div class="presenter-lesson-meta">
        <span><small>Page timer</small><b>{{ pageTime }}</b></span>
        <span><small>Target time</small><b>{{ state.lessonDuration }}s</b></span>
        <span><small>Discussion</small><b>{{ state.lessonDiscussion }}s</b></span>
      </div>
    </section>

    <section v-if="state.assessmentQuestion || state.assessmentActive" class="presenter-card presenter-assessment-card">
      <small>🧠 Assessment</small>
      <span v-if="state.assessmentActive" class="assessment-live-chip">LIVE · {{ assessmentTime }}</span>
      <h2>{{ state.assessmentKind || 'assessment' }}</h2>
      <p>{{ state.assessmentQuestion || 'Assessment configured for this page.' }}</p>
      <div class="presenter-assessment-controls">
        <button v-if="!state.assessmentActive" @click="control('assessment')">Start assessment</button>
        <button v-else @click="control('assessment-close')">Close</button>
        <button class="reveal" :disabled="state.assessmentRevealed" @click="control('reveal')">{{ state.assessmentRevealed ? 'Revealed' : 'Reveal answer' }}</button>
      </div>
    </section>

    <section class="presenter-card cue"><small>Teaching cue</small><h2>{{ state.cueTitle }}</h2><p>{{ state.cueMessage }}</p></section>
    <section class="presenter-card choreography-console-card"><div class="presenter-choreo-head"><small>🎬 Choreography</small><span>{{ state.choreographyIndex }} / {{ state.choreographyTotal }}</span></div><h2>{{ state.choreographyLabel }}</h2><p>{{ state.choreographyAction }} · {{ choreographyProgress }}%</p><progress :value="state.choreographyIndex" :max="Math.max(1, state.choreographyTotal)"></progress><div class="presenter-choreo-controls"><button @click="control('cue-prev')">← Cue</button><button :class="{ active: state.choreographyAutoPlay }" @click="control('auto')">{{ state.choreographyAutoPlay ? '⏸ Auto' : '▶ Auto' }}</button><button @click="control('cue-next')">Cue →</button></div></section>
    <section v-if="state.textPreview" class="presenter-card"><small>Slide preview</small><p>{{ state.textPreview }}</p></section>
    <section class="presenter-card notes-card"><small>Private presenter notes</small><p>{{ state.notes || 'No additional notes for this page.' }}</p></section>
    <nav class="presenter-console-controls"><button @click="control('prev')">← Previous</button><button @click="control('question')">❓ Ask</button><button @click="control('discussion')">💬 Discuss</button><button @click="control('next')">Next →</button><button class="end" @click="control('end')">End presentation</button></nav>
    <footer>Presenter Console stays on the lecturer screen. Assessments, notes, and controls stay private while the projector shows the student-facing interaction.</footer>
  </main>
</template>
