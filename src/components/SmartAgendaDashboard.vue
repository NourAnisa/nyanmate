<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { AgendaItem, AgendaRepeat } from '../types'
import {
  agendaForDay,
  buildDailyBrief,
  countdownLabel,
  dueReminder,
  loadAgenda,
  markReminderShown,
  materializeUpcoming,
  saveAgenda,
  snoozeAgendaItem,
} from '../services/smartAgenda'
import { exportAgendaToIcs, parseAgendaIcs } from '../services/agendaIcs'

const agenda = ref<AgendaItem[]>(loadAgenda())
const title = ref('')
const startsAt = ref('')
const repeat = ref<AgendaRepeat>('none')
const reminderMinutes = ref(10)
const notes = ref('')
const now = ref(new Date())
const editingId = ref<string | null>(null)
const reminderItem = ref<AgendaItem | null>(null)
const reminderOccurrence = ref<Date | null>(null)
const notificationPermission = ref<NotificationPermission | 'unsupported'>('unsupported')
let clock: number | undefined

const todayEntries = computed(() => agendaForDay(agenda.value, now.value))
const upcomingEntries = computed(() => materializeUpcoming(agenda.value, now.value, 14).slice(0, 20))
const dailyBrief = computed(() => buildDailyBrief(agenda.value, now.value))
const formTitle = computed(() => editingId.value ? 'Edit agenda' : 'Add agenda')

function persist() { saveAgenda(agenda.value) }

function resetForm() {
  editingId.value = null
  title.value = ''
  startsAt.value = ''
  repeat.value = 'none'
  reminderMinutes.value = 10
  notes.value = ''
}

function localInputValue(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const offset = d.getTimezoneOffset() * 60_000
  return new Date(d.getTime() - offset).toISOString().slice(0, 16)
}

function submitItem() {
  if (!title.value.trim() || !startsAt.value) return
  const payload = {
    title: title.value.trim(),
    startsAt: new Date(startsAt.value).toISOString(),
    repeat: repeat.value,
    reminderMinutes: Math.max(0, Math.min(1440, Math.round(reminderMinutes.value || 0))),
    notes: notes.value.trim() || undefined,
  }

  if (editingId.value) {
    const item = agenda.value.find(entry => entry.id === editingId.value)
    if (item) Object.assign(item, payload, { reminded: false, snoozedUntil: undefined, lastReminderOccurrence: undefined })
  } else {
    agenda.value.push({ id: crypto.randomUUID(), ...payload, reminded: false })
  }

  agenda.value.sort((a, b) => a.startsAt.localeCompare(b.startsAt))
  persist()
  resetForm()
}

function editItem(item: AgendaItem) {
  editingId.value = item.id
  title.value = item.title
  startsAt.value = localInputValue(item.startsAt)
  repeat.value = item.repeat ?? 'none'
  reminderMinutes.value = item.reminderMinutes ?? 10
  notes.value = item.notes ?? ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function removeItem(id: string) {
  agenda.value = agenda.value.filter(item => item.id !== id)
  if (editingId.value === id) resetForm()
  persist()
}

function toggleComplete(id: string) {
  const item = agenda.value.find(entry => entry.id === id)
  if (!item) return
  item.completedAt = item.completedAt ? undefined : new Date().toISOString()
  persist()
}

function snooze(item: AgendaItem, minutes: number) {
  snoozeAgendaItem(item, minutes, now.value)
  persist()
  reminderItem.value = null
  reminderOccurrence.value = null
}

function localDateTime(value: Date) {
  return value.toLocaleString([], { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

async function enableNotifications() {
  if (!('Notification' in window)) {
    notificationPermission.value = 'unsupported'
    return
  }
  try { notificationPermission.value = await Notification.requestPermission() } catch { notificationPermission.value = Notification.permission }
}

function showNotification(item: AgendaItem, occurrence: Date) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  try {
    new Notification(`NyanMate · ${item.title}`, {
      body: `Starts ${countdownLabel(occurrence, now.value)}${item.notes ? ` · ${item.notes}` : ''}`,
      tag: `nyanmate-${item.id}-${occurrence.toISOString()}`,
    })
  } catch { /* WebView may not expose desktop notifications */ }
}

function checkReminder() {
  const due = dueReminder(agenda.value, now.value)
  if (!due) return
  reminderItem.value = due.item
  reminderOccurrence.value = due.occurrence
  showNotification(due.item, due.occurrence)
  markReminderShown(due.item, due.occurrence)
  persist()
}

function dismissReminder() {
  reminderItem.value = null
  reminderOccurrence.value = null
}

function downloadIcs() {
  const blob = new Blob([exportAgendaToIcs(agenda.value)], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'nyanmate-agenda.ics'
  anchor.click()
  URL.revokeObjectURL(url)
}

async function importIcs(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const imported = parseAgendaIcs(await file.text())
  const existingIds = new Set(agenda.value.map(item => item.id))
  imported.forEach(item => {
    if (existingIds.has(item.id)) item.id = crypto.randomUUID()
    agenda.value.push(item)
  })
  agenda.value.sort((a, b) => a.startsAt.localeCompare(b.startsAt))
  persist()
  input.value = ''
}

onMounted(() => {
  notificationPermission.value = 'Notification' in window ? Notification.permission : 'unsupported'
  checkReminder()
  clock = window.setInterval(() => {
    now.value = new Date()
    checkReminder()
  }, 30_000)
})

onUnmounted(() => { if (clock) clearInterval(clock) })
</script>

<template>
  <main class="smart-agenda-dashboard">
    <header class="agenda-dashboard-head">
      <div><strong>📅 Smart Agenda</strong><small>Recurring reminders, snooze, editing, and calendar exchange.</small></div>
      <span>{{ now.toLocaleDateString([], { weekday: 'long', day: '2-digit', month: 'long' }) }}</span>
    </header>

    <section v-if="reminderItem && reminderOccurrence" class="agenda-reminder-card">
      <div><strong>🔔 {{ reminderItem.title }}</strong><small>{{ localDateTime(reminderOccurrence) }} · {{ countdownLabel(reminderOccurrence, now) }}</small><p v-if="reminderItem.notes">{{ reminderItem.notes }}</p></div>
      <div class="agenda-reminder-actions"><button @click="snooze(reminderItem, 5)">Snooze 5m</button><button @click="snooze(reminderItem, 10)">10m</button><button @click="snooze(reminderItem, 30)">30m</button><button @click="dismissReminder">Dismiss</button></div>
    </section>

    <section class="agenda-brief-card">
      <strong>☀️ Daily brief</strong>
      <p>{{ dailyBrief }}</p>
      <div class="agenda-tool-row">
        <button v-if="notificationPermission !== 'granted'" @click="enableNotifications">🔔 Enable desktop notification</button>
        <span v-else class="agenda-notify-ok">✓ Desktop notifications enabled</span>
        <button @click="downloadIcs">Export .ics</button>
        <label class="agenda-import-button">Import .ics<input type="file" accept=".ics,text/calendar" @change="importIcs" /></label>
      </div>
      <small v-if="notificationPermission === 'unsupported'">Desktop notification is not available in this WebView; in-app reminders still work.</small>
    </section>

    <section class="agenda-create-card">
      <div class="agenda-section-head"><h2>{{ formTitle }}</h2><button v-if="editingId" @click="resetForm">Cancel edit</button></div>
      <div class="agenda-form-grid">
        <label>Title<input v-model="title" placeholder="Lecture, meeting, deadline…" /></label>
        <label>Starts at<input v-model="startsAt" type="datetime-local" /></label>
        <label>Repeat<select v-model="repeat"><option value="none">Once</option><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select></label>
        <label>Remind before<input v-model.number="reminderMinutes" type="number" min="0" max="1440" /> <small>minutes</small></label>
        <label class="agenda-notes-field">Notes<textarea v-model="notes" rows="2" placeholder="Optional context"></textarea></label>
      </div>
      <button class="agenda-primary" @click="submitItem">{{ editingId ? 'Save changes' : 'Add to agenda' }}</button>
    </section>

    <section class="agenda-section">
      <div class="agenda-section-head"><h2>Today</h2><span>{{ todayEntries.length }} item{{ todayEntries.length === 1 ? '' : 's' }}</span></div>
      <p v-if="!todayEntries.length" class="agenda-empty">Nothing scheduled today.</p>
      <article v-for="entry in todayEntries" :key="`${entry.item.id}-${entry.occurrence.toISOString()}`" class="agenda-entry" :class="{ completed: !!entry.item.completedAt }">
        <div><strong>{{ entry.item.title }}</strong><small>{{ localDateTime(entry.occurrence) }} · {{ countdownLabel(entry.occurrence, now) }}</small><p v-if="entry.item.notes">{{ entry.item.notes }}</p><small v-if="entry.item.snoozedUntil">Snoozed until {{ new Date(entry.item.snoozedUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</small></div>
        <span v-if="entry.item.repeat && entry.item.repeat !== 'none'" class="agenda-repeat">↻ {{ entry.item.repeat }}</span>
        <button @click="editItem(entry.item)">Edit</button>
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
        <button @click="editItem(entry.item)">Edit</button>
      </article>
    </section>
  </main>
</template>
