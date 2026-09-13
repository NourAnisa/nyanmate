<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { AgendaItem, PetState } from './types'

const petState = ref<PetState>('idle')
const bubble = ref('Hi! I’m NyanMate ✨')
const menuOpen = ref(false)
const agenda = ref<AgendaItem[]>(JSON.parse(localStorage.getItem('nyanmate-agenda') || '[]'))
const newTitle = ref('')
const newTime = ref('')
const focusSeconds = ref(25 * 60)
const focusRunning = ref(false)
let timer: number | undefined

const petEmoji = computed(() => ({
  idle: '🐱', thinking: '🤔', coding: '🐱‍💻', teaching: '🐱‍🏫',
  success: '😸', error: '🙀', sleeping: '😴'
}[petState.value]))

const focusText = computed(() => `${String(Math.floor(focusSeconds.value / 60)).padStart(2, '0')}:${String(focusSeconds.value % 60).padStart(2, '0')}`)

function speak(message: string, state: PetState = 'idle') {
  bubble.value = message
  petState.value = state
}

function addAgenda() {
  if (!newTitle.value || !newTime.value) return
  agenda.value.push({ id: crypto.randomUUID(), title: newTitle.value, startsAt: newTime.value, reminded: false })
  agenda.value.sort((a, b) => a.startsAt.localeCompare(b.startsAt))
  localStorage.setItem('nyanmate-agenda', JSON.stringify(agenda.value))
  speak(`Agenda saved: ${newTitle.value} 📅`, 'success')
  newTitle.value = ''
  newTime.value = ''
}

function toggleFocus() {
  focusRunning.value = !focusRunning.value
  speak(focusRunning.value ? 'Focus time! I’ll stay with you. 🍅' : 'Focus paused.', focusRunning.value ? 'coding' : 'idle')
}

function teachingMode() {
  const active = petState.value !== 'teaching'
  speak(active ? 'Teaching mode active. I’m ready to present with you! 🎓' : 'Teaching mode finished.', active ? 'teaching' : 'idle')
  menuOpen.value = false
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

onMounted(() => {
  timer = window.setInterval(() => {
    checkAgenda()
    if (focusRunning.value && focusSeconds.value > 0) focusSeconds.value--
    if (focusRunning.value && focusSeconds.value === 0) {
      focusRunning.value = false
      focusSeconds.value = 25 * 60
      speak('Focus session complete! Great work! 🎉', 'success')
    }
  }, 1000)
})
onUnmounted(() => timer && clearInterval(timer))
</script>

<template>
  <main class="desktop">
    <section v-if="menuOpen" class="panel">
      <header><strong>NyanMate</strong><button @click="menuOpen=false">×</button></header>
      <div class="section">
        <h3>📅 Quick agenda</h3>
        <input v-model="newTitle" placeholder="Agenda title" />
        <input v-model="newTime" type="datetime-local" />
        <button class="primary" @click="addAgenda">Add agenda</button>
        <p v-if="agenda.length" class="next">Next: {{ agenda[0].title }} · {{ new Date(agenda[0].startsAt).toLocaleString() }}</p>
      </div>
      <div class="actions">
        <button @click="teachingMode">🎓 Teaching mode</button>
        <button @click="speak('Thinking with your AI agent…', 'thinking')">🤖 Agent demo</button>
      </div>
    </section>

    <div class="bubble">{{ bubble }}</div>
    <div class="pet" @dblclick="menuOpen=!menuOpen" title="Double click me">
      <div class="pet-face">{{ petEmoji }}</div>
      <div v-if="petState==='teaching'" class="pointer">➤</div>
    </div>

    <button class="focus" @click="toggleFocus">🍅 {{ focusText }} {{ focusRunning ? 'Ⅱ' : '▶' }}</button>
  </main>
</template>
