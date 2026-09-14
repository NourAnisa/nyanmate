<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import { emit, listen, type UnlistenFn } from '@tauri-apps/api/event'
import { availableMonitors, getCurrentWindow } from '@tauri-apps/api/window'
import NyanPet from './components/NyanPet.vue'
import PdfTeachingPanel from './components/PdfTeachingPanel.vue'
import PdfPresentationStage from './components/PdfPresentationStage.vue'
import PresenterNotes from './components/PresenterNotes.vue'
import type { PreparedPdf, TeachingCue } from './services/pdfTeaching'
import type { AgendaItem, PetState } from './types'

const petState = ref<PetState>('idle')
const bubble = ref('Hi! I’m NyanMate ✨')
const menuOpen = ref(false)
const agenda = ref<AgendaItem[]>(JSON.parse(localStorage.getItem('nyanmate-agenda') || '[]'))
const newTitle = ref('')
const newTime = ref('')
const focusSeconds = ref(25 * 60)
const focusRunning = ref(false)
const teachingPage = ref(1)
const teachingPages = ref(20)
const teachingTopic = ref('PDF Presentation')
const preparedPdf = ref<PreparedPdf | null>(null)
const presentationOpen = ref(false)
const presenterNotesOpen = ref(false)
const monitorNames = ref<string[]>([])
const projectorMonitorIndex = ref(1)
const dualMonitorMode = ref(true)
let timer: number | undefined
let bubbleReset: number | undefined
let unlistenControl: UnlistenFn | undefined
let unlistenReady: UnlistenFn | undefined

const focusText = computed(() => `${String(Math.floor(focusSeconds.value / 60)).padStart(2, '0')}:${String(focusSeconds.value % 60).padStart(2, '0')}`)
const teachingActive = computed(() => petState.value === 'teaching')
const builtInPresentation = computed(() => teachingActive.value && presentationOpen.value && preparedPdf.value !== null)
const nextAgenda = computed(() => agenda.value.find(item => new Date(item.startsAt).getTime() >= Date.now()))
const currentTeachingCue = computed(() => preparedPdf.value?.cues[teachingPage.value - 1] ?? null)
const petSide = computed(() => currentTeachingCue.value?.safeSide === 'right' ? 'pet-right' : 'pet-left')
const pointerDirection = computed(() => petSide.value === 'pet-right' ? 'left' : 'right')
const pointStyle = computed(() => ({
  left: `${(currentTeachingCue.value?.pointTarget.x ?? .5) * 100}%`,
  top: `${(currentTeachingCue.value?.pointTarget.y ?? .5) * 100}%`,
}))
const dualMonitorAvailable = computed(() => monitorNames.value.length > 1)

function speak(message: string, state: PetState = 'idle', autoReset = false) {
  bubble.value = message
  petState.value = state
  if (bubbleReset) clearTimeout(bubbleReset)
  if (autoReset) {
    bubbleReset = window.setTimeout(() => {
      if (!focusRunning.value && !teachingActive.value) petState.value = 'idle'
    }, 3500)
  }
}

function petNyan() {
  if (teachingActive.value) return
  speak('Prrrr… thank you! ♡', 'success', true)
}

function addAgenda() {
  if (!newTitle.value || !newTime.value) return
  agenda.value.push({ id: crypto.randomUUID(), title: newTitle.value, startsAt: newTime.value, reminded: false })
  agenda.value.sort((a, b) => a.startsAt.localeCompare(b.startsAt))
  localStorage.setItem('nyanmate-agenda', JSON.stringify(agenda.value))
  speak(`Agenda saved: ${newTitle.value} 📅`, 'success', true)
  newTitle.value = ''
  newTime.value = ''
}

function removeAgenda(id: string) {
  agenda.value = agenda.value.filter(item => item.id !== id)
  localStorage.setItem('nyanmate-agenda', JSON.stringify(agenda.value))
}

function toggleFocus() {
  focusRunning.value = !focusRunning.value
  speak(focusRunning.value ? 'Focus time! I’ll stay with you. 🍅' : 'Focus paused.', focusRunning.value ? 'coding' : 'idle')
}

function handlePdfPrepared(pdf: PreparedPdf) {
  preparedPdf.value = pdf
  teachingTopic.value = pdf.name
  teachingPages.value = pdf.pageCount
  teachingPage.value = 1
  bubble.value = `PDF ready: ${pdf.name} · ${pdf.pageCount} pages. Safe zones and teaching cues prepared. 📄✨`
}

function handlePreparedCue(cue: TeachingCue) {
  teachingPage.value = cue.page
  bubble.value = `Page ${cue.page}: ${cue.message}`
}

async function detectMonitors() {
  try {
    const monitors = await availableMonitors()
    monitorNames.value = monitors.map((monitor, index) => monitor.name || `Display ${index + 1}`)
    if (projectorMonitorIndex.value >= monitors.length) projectorMonitorIndex.value = Math.max(0, monitors.length - 1)
  } catch {
    monitorNames.value = ['Current display']
  }
}

async function movePresentationToSelectedMonitor() {
  if (!dualMonitorMode.value || !dualMonitorAvailable.value) return
  try {
    const monitors = await availableMonitors()
    const target = monitors[projectorMonitorIndex.value]
    if (!target) return
    const current = getCurrentWindow()
    await current.setFullscreen(false)
    await current.setPosition(target.position)
    await current.setSize(target.size)
  } catch {
    // Falls back to fullscreen on the current monitor.
  }
}

async function setPresenterWindowVisible(visible: boolean) {
  try { await invoke('set_presenter_visible', { visible }) } catch { /* browser preview */ }
}

function presenterNotesText() {
  const auto = currentTeachingCue.value?.presenterNote ?? ''
  const custom = localStorage.getItem(`nyanmate-note-${teachingPage.value}`) ?? ''
  return [auto, custom].filter(Boolean).join('\n\n')
}

async function syncPresenterState() {
  const cue = currentTeachingCue.value
  await emit('presenter-state', {
    active: builtInPresentation.value,
    topic: teachingTopic.value,
    page: teachingPage.value,
    total: teachingPages.value,
    cueTitle: cue?.title ?? 'Teaching',
    cueMessage: cue?.message ?? bubble.value,
    textPreview: cue?.textPreview ?? '',
    notes: presenterNotesText(),
  })
}

async function setFullscreen(value: boolean) {
  try { await getCurrentWindow().setFullscreen(value) } catch { /* Browser preview */ }
}

async function teachingMode() {
  if (teachingActive.value) {
    presentationOpen.value = false
    presenterNotesOpen.value = false
    await setPresenterWindowVisible(false)
    await setFullscreen(false)
    speak('Class finished. Nice teaching! 🎓', 'success', true)
    await syncPresenterState()
  } else {
    teachingPage.value = 1
    petState.value = 'teaching'
    presentationOpen.value = Boolean(preparedPdf.value)
    if (presentationOpen.value) {
      await detectMonitors()
      await movePresentationToSelectedMonitor()
      await setFullscreen(true)
      if (dualMonitorMode.value && dualMonitorAvailable.value) await setPresenterWindowVisible(true)
    }
    const cue = currentTeachingCue.value
    bubble.value = cue ? `Page 1/${teachingPages.value}: ${cue.message}` : `Teaching mode ready: ${teachingTopic.value}. 🎓`
    await syncPresenterState()
  }
  menuOpen.value = false
}

async function changeTeachingPage(delta: number) {
  teachingPage.value = Math.max(1, Math.min(teachingPages.value, teachingPage.value + delta))
  const cue = currentTeachingCue.value
  bubble.value = cue
    ? `Page ${teachingPage.value}/${teachingPages.value}: ${cue.message}`
    : `Page ${teachingPage.value}/${teachingPages.value}: Continue explaining the main idea.`
  await syncPresenterState()
}

async function askClass() {
  bubble.value = 'Question time! What do you think about this point? ❓'
  await syncPresenterState()
}

async function startDiscussion() {
  bubble.value = 'Discussion time! Discuss this idea with your group. 💬'
  await syncPresenterState()
}

function checkAgenda() {
  const now = Date.now()
  let changed = false
  for (const item of agenda.value) {
    const diff = new Date(item.startsAt).getTime() - now
    if (!item.reminded && diff > 0 && diff <= 10 * 60 * 1000) {
      item.reminded = true
      changed = true
      speak(`${item.title} starts in ${Math.max(1, Math.ceil(diff / 60000))} minutes! 🔔`, 'thinking')
    }
  }
  if (changed) localStorage.setItem('nyanmate-agenda', JSON.stringify(agenda.value))
}

function handleKey(event: KeyboardEvent) {
  if (!teachingActive.value) return
  if (event.key === 'Escape') { void teachingMode(); return }
  if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') { event.preventDefault(); void changeTeachingPage(1) }
  if (event.key === 'ArrowLeft' || event.key === 'PageUp') { event.preventDefault(); void changeTeachingPage(-1) }
  if (event.key.toLowerCase() === 'q') void askClass()
  if (event.key.toLowerCase() === 'd') void startDiscussion()
  if (event.key.toLowerCase() === 'n') presenterNotesOpen.value = !presenterNotesOpen.value
}

onMounted(async () => {
  window.addEventListener('keydown', handleKey)
  await detectMonitors()
  unlistenControl = await listen<{ action: string }>('presenter-control', (event) => {
    const action = event.payload.action
    if (action === 'prev') void changeTeachingPage(-1)
    if (action === 'next') void changeTeachingPage(1)
    if (action === 'question') void askClass()
    if (action === 'discussion') void startDiscussion()
    if (action === 'end') void teachingMode()
  })
  unlistenReady = await listen('presenter-ready', () => { void syncPresenterState() })

  timer = window.setInterval(() => {
    checkAgenda()
    if (focusRunning.value && focusSeconds.value > 0) focusSeconds.value--
    if (focusRunning.value && focusSeconds.value === 0) {
      focusRunning.value = false
      focusSeconds.value = 25 * 60
      speak('Focus session complete! Great work! 🎉', 'success', true)
    }
  }, 1000)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKey)
  unlistenControl?.()
  unlistenReady?.()
  if (timer) clearInterval(timer)
  if (bubbleReset) clearTimeout(bubbleReset)
})
</script>

<template>
  <main class="desktop" :class="{ teaching: teachingActive, presenting: builtInPresentation }">
    <template v-if="builtInPresentation && preparedPdf">
      <PdfPresentationStage :pdf="preparedPdf" :page="teachingPage" @error="bubble = $event" />
      <div class="presentation-target" :style="pointStyle" title="NyanMate focus target"><span></span></div>

      <div class="presentation-topbar">
        <strong>🎓 {{ teachingTopic }}</strong>
        <span>{{ teachingPage }} / {{ teachingPages }} · {{ currentTeachingCue?.title || 'Teaching' }}</span>
        <button v-if="!dualMonitorAvailable || !dualMonitorMode" @click="presenterNotesOpen=!presenterNotesOpen">Notes · N</button>
        <button @click="teachingMode">End · Esc</button>
      </div>

      <PresenterNotes v-if="presenterNotesOpen && (!dualMonitorAvailable || !dualMonitorMode)" :cue="currentTeachingCue" :page="teachingPage" :total="teachingPages" />

      <div class="presentation-nav">
        <button :disabled="teachingPage <= 1" @click="changeTeachingPage(-1)">←</button>
        <button @click="askClass">❓</button>
        <button @click="startDiscussion">💬</button>
        <button :disabled="teachingPage >= teachingPages" @click="changeTeachingPage(1)">→</button>
      </div>

      <div class="teaching-pet-overlay" :class="petSide">
        <div class="presentation-bubble">{{ bubble }}</div>
        <NyanPet :state="petState" :draggable="false" :pointer-direction="pointerDirection" @pet="petNyan" />
      </div>
    </template>

    <template v-else>
      <section v-if="menuOpen" class="panel">
        <header><strong>NyanMate v0.6</strong><button @click="menuOpen=false">×</button></header>
        <PdfTeachingPanel @prepared="handlePdfPrepared" @cue="handlePreparedCue" />

        <div class="section dual-monitor-setup">
          <h3>🖥️ Presenter display</h3>
          <label class="dual-toggle"><input v-model="dualMonitorMode" type="checkbox" /> Use private presenter console when two displays are available</label>
          <select v-if="monitorNames.length > 1" v-model.number="projectorMonitorIndex">
            <option v-for="(name, index) in monitorNames" :key="name + index" :value="index">Projector: {{ name }}</option>
          </select>
          <small>{{ dualMonitorAvailable ? `${monitorNames.length} displays detected. Presenter Console will remain separate from the projected PDF.` : 'One display detected. NyanMate will use same-screen presenter notes.' }}</small>
        </div>

        <div class="section">
          <h3>📅 Quick agenda</h3>
          <input v-model="newTitle" placeholder="Agenda title" />
          <input v-model="newTime" type="datetime-local" />
          <button class="primary" @click="addAgenda">Add agenda</button>
          <div v-if="agenda.length" class="agenda-list">
            <div v-for="item in agenda.slice(0, 3)" :key="item.id" class="agenda-row">
              <span>{{ item.title }}<small>{{ new Date(item.startsAt).toLocaleString() }}</small></span>
              <button @click="removeAgenda(item.id)">×</button>
            </div>
          </div>
        </div>

        <div class="section teaching-setup">
          <h3>🎓 Teaching companion</h3>
          <input v-model="teachingTopic" placeholder="Presentation/PDF title" />
          <div class="page-config"><span>Pages</span><input v-model.number="teachingPages" type="number" min="1" max="999" /></div>
          <small v-if="preparedPdf" class="prepared-note">✓ PDF cues, safe-side analysis, pointer targeting, and presenter console ready.</small>
        </div>

        <div class="actions">
          <button @click="teachingMode">🎓 {{ preparedPdf ? 'Present PDF' : 'Start teaching' }}</button>
          <button @click="speak('Thinking with your AI agent…', 'thinking')">🤖 Agent demo</button>
          <button @click="speak('Build completed successfully!', 'success', true)">✓ Success demo</button>
          <button @click="speak('Oops — something needs attention.', 'error', true)">⚠ Error demo</button>
        </div>
      </section>

      <div v-if="teachingActive" class="teaching-hud">
        <strong>🎓 {{ teachingTopic }}</strong><span>Page {{ teachingPage }} / {{ teachingPages }}</span>
        <div><button @click="changeTeachingPage(-1)">←</button><button @click="askClass">❓</button><button @click="startDiscussion">💬</button><button @click="changeTeachingPage(1)">→</button><button @click="teachingMode">End</button></div>
      </div>

      <div class="bubble">{{ bubble }}</div>
      <NyanPet :state="petState" @pet="petNyan" @menu="menuOpen=!menuOpen" />
      <div class="status-strip"><button class="focus" @click="toggleFocus">🍅 {{ focusText }} {{ focusRunning ? 'Ⅱ' : '▶' }}</button><span v-if="nextAgenda" class="next-agenda">📅 {{ nextAgenda.title }}</span></div>
    </template>
  </main>
</template>
