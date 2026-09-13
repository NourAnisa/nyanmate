<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import NyanPet from './components/NyanPet.vue'
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
let timer: number | undefined
let bubbleReset: number | undefined

const focusText = computed(() => `${String(Math.floor(focusSeconds.value / 60)).padStart(2, '0')}:${String(focusSeconds.value % 60).padStart(2, '0')}`)
const teachingActive = computed(() => petState.value === 'teaching')
const nextAgenda = computed(() => agenda.value.find(item => new Date(item.startsAt).getTime() >= Date.now()))

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

function teachingMode() {
  if (teachingActive.value) {
    speak('Class finished. Nice teaching! 🎓', 'success', true)
  } else {
    teachingPage.value = 1
    speak(`Teaching mode ready: ${teachingTopic.value}. I’ll point and move with you! 🎓`, 'teaching')
  }
  menuOpen.value = false
}

function changeTeachingPage(delta: number) {
  teachingPage.value = Math.max(1, Math.min(teachingPages.value, teachingPage.value + delta))
  const progress = teachingPage.value / teachingPages.value
  const cue = progress < .2 ? 'Opening section — let’s introduce the topic.' :
    progress > .85 ? 'We’re near the conclusion — time to summarize.' :
    teachingPage.value % 5 === 0 ? 'Key point here — I’ll highlight this page.' :
    'Next point — keep going!'
  bubble.value = `Page ${teachingPage.value}/${teachingPages.value}: ${cue}`
}

function askClass() {
  bubble.value = 'Question time! What do you think about this point? ❓'
}

function startDiscussion() {
  bubble.value = 'Discussion time! I’ll keep the class focused. 💬'
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
  if (event.key === 'ArrowRight' || event.key === 'PageDown') changeTeachingPage(1)
  if (event.key === 'ArrowLeft' || event.key === 'PageUp') changeTeachingPage(-1)
  if (event.key.toLowerCase() === 'q') askClass()
  if (event.key.toLowerCase() === 'd') startDiscussion()
}

onMounted(() => {
  window.addEventListener('keydown', handleKey)
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
  if (timer) clearInterval(timer)
  if (bubbleReset) clearTimeout(bubbleReset)
})
</script>

<template>
  <main class="desktop" :class="{ teaching: teachingActive }">
    <section v-if="menuOpen" class="panel">
      <header><strong>NyanMate v0.2</strong><button @click="menuOpen=false">×</button></header>

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
      </div>

      <div class="actions">
        <button @click="teachingMode">🎓 Start teaching</button>
        <button @click="speak('Thinking with your AI agent…', 'thinking')">🤖 Agent demo</button>
        <button @click="speak('Build completed successfully!', 'success', true)">✓ Success demo</button>
        <button @click="speak('Oops — something needs attention.', 'error', true)">⚠ Error demo</button>
      </div>
    </section>

    <div v-if="teachingActive" class="teaching-hud">
      <strong>🎓 {{ teachingTopic }}</strong>
      <span>Page {{ teachingPage }} / {{ teachingPages }}</span>
      <div>
        <button @click="changeTeachingPage(-1)">←</button>
        <button @click="askClass">❓</button>
        <button @click="startDiscussion">💬</button>
        <button @click="changeTeachingPage(1)">→</button>
        <button @click="teachingMode">End</button>
      </div>
    </div>

    <div class="bubble">{{ bubble }}</div>
    <NyanPet :state="petState" @pet="petNyan" @menu="menuOpen=!menuOpen" />

    <div class="status-strip">
      <button class="focus" @click="toggleFocus">🍅 {{ focusText }} {{ focusRunning ? 'Ⅱ' : '▶' }}</button>
      <span v-if="nextAgenda" class="next-agenda">📅 {{ nextAgenda.title }}</span>
    </div>
  </main>
</template>
