<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { AgendaItem, AgendaRepeat } from '../types'
import { agendaForDay, buildDailyBrief, countdownLabel, loadAgenda, materializeUpcoming, saveAgenda } from '../services/smartAgenda'

const agenda = ref<AgendaItem[]>(loadAgenda())
const title = ref('')
const startsAt = ref('')
const repeat = ref<AgendaRepeat>('none')
const reminderMinutes = ref(10)
const notes = ref('')
const now = ref(new Date())
let clock: number | undefined

const todayEntries = computed(() => agendaForDay(agenda.value, now.value))
const upcomingEntries = computed(() => materializeUpcoming(agenda.value, now.value, 14).slice(0, 20))
const dailyBrief = computed(() => buildDailyBrief(agenda.value, now.value))

function persist() { saveAgenda(agenda.value) }

function addItem() {
  if (!title.value.trim() || !startsAt.value) return
  agenda.value.push({
    id: crypto.randomUUID(),
    title: title.value.trim(),
    startsAt: new Date(startsAt.value).toISOString(),
    reminded: false,
    repeat: repeat.value,
    reminderMinutes: Math.max(0, Math.min(1440, Math.round(reminderMinutes.value || 0))),
    notes: notes.value.trim() || undefined,
  })
  agenda.value.sort((a, b) => a.startsAt.localeCompare(b.startsAt))
  persist()
  title.value = ''
  startsAt.value = ''
  repeat.value = 'none'
  reminderMinutes.value = 10
  notes.value = ''
}

function removeItem(id: string) {
  agenda.value = agenda.value.filter(item => item.id !== id)
  persist()
}

function toggleComplete(id: string) {
  const item = agenda.value.find(entry => entry.id === id)
  if (!item) return
  item.completedAt = item.completedAt ? undefined : new Date().toISOString()
  persist()
}

function localDateTime(value: Date) {
  return value.toLocaleString([], { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

onMounted(() => { clock = window.setInterval(() => { now.value = new Date() }, 30_000) })
onUnmounted(() => { if (clock) clearInterval(clock) })
</script>

<template>
  <main class="smart-agenda-dashboard">
    <header class="agenda-dashboard-head">
      <div><strong>📅 Smart Agenda</strong><small>Local recurring reminders, countdowns, and daily brief.</small></div>
      <span>{{ now.toLocaleDateString([], { weekday: 'long', day: '2-digit', month: 'long' }) }}</span>
    </header>

    <section class="agenda-brief-card">
      <strong>☀️ Daily brief</strong>
      <p>{{ dailyBrief }}</p>
    </section>

    <section class="agenda-create-card">
      <h2>Add agenda</h2>
      <div class="agenda-form-grid">
        <label>Title<input v-model="title" placeholder="Lecture, meeting, deadline…" /></label>
        <label>Starts at<input v-model="startsAt" type="datetime-local" /></label>
        <label>Repeat<select v-model="repeat"><option value="none">Once</option><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select></label>
        <label>Remind before<input v-model.number="reminderMinutes" type="number" min="0" max="1440" /> <small>minutes</small></label>
        <label class="agenda-notes-field">Notes<textarea v-model="notes" rows="2" placeholder="Optional context"></textarea></label>
      </div>
      <button class="agenda-primary" @click="addItem">Add to agenda</button>
    </section>

    <section class="agenda-section">
      <div class="agenda-section-head"><h2>Today</h2><span>{{ todayEntries.length }} item{{ todayEntries.length === 1 ? '' : 's' }}</span></div>
      <p v-if="!todayEntries.length" class="agenda-empty">Nothing scheduled today.</p>
      <article v-for="entry in todayEntries" :key="`${entry.item.id}-${entry.occurrence.toISOString()}`" class="agenda-entry" :class="{ completed: !!entry.item.completedAt }">
        <div><strong>{{ entry.item.title }}</strong><small>{{ localDateTime(entry.occurrence) }} · {{ countdownLabel(entry.occurrence, now) }}</small><p v-if="entry.item.notes">{{ entry.item.notes }}</p></div>
        <span v-if="entry.item.repeat && entry.item.repeat !== 'none'" class="agenda-repeat">↻ {{ entry.item.repeat }}</span>
        <button @click="toggleComplete(entry.item.id)">{{ entry.item.completedAt ? 'Undo' : 'Done' }}</button>
        <button @click="removeItem(entry.item.id)">×</button>
      </article>
    </section>

    <section class="agenda-section">
      <div class="agenda-section-head"><h2>Next 14 days</h2><span>first {{ upcomingEntries.length }}</span></div>
      <p v-if="!upcomingEntries.length" class="agenda-empty">No upcoming agenda.</p>
      <article v-for="entry in upcomingEntries" :key="`up-${entry.item.id}-${entry.occurrence.toISOString()}`" class="agenda-entry compact">
        <div><strong>{{ entry.item.title }}</strong><small>{{ localDateTime(entry.occurrence) }} · {{ countdownLabel(entry.occurrence, now) }}</small></div>
        <span v-if="entry.item.repeat && entry.item.repeat !== 'none'" class="agenda-repeat">↻ {{ entry.item.repeat }}</span>
      </article>
    </section>
  </main>
</template>
