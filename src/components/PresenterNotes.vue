<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { TeachingCue } from '../services/pdfTeaching'

const props = defineProps<{
  cue: TeachingCue | null
  page: number
  total: number
}>()

const storageKey = computed(() => `nyanmate-note-${props.page}`)
const customNote = ref('')

function loadNote() {
  customNote.value = localStorage.getItem(storageKey.value) ?? ''
}

function saveNote() {
  if (customNote.value.trim()) localStorage.setItem(storageKey.value, customNote.value)
  else localStorage.removeItem(storageKey.value)
}

watch(() => props.page, loadNote, { immediate: true })
</script>

<template>
  <aside class="presenter-notes">
    <div class="presenter-notes-head">
      <strong>Presenter Notes</strong>
      <span>{{ page }} / {{ total }}</span>
    </div>
    <p class="auto-note">{{ cue?.presenterNote || 'Tidak ada catatan otomatis untuk halaman ini.' }}</p>
    <textarea
      v-model="customNote"
      rows="5"
      placeholder="Tambahkan catatan pribadi untuk halaman ini…"
      @input="saveNote"
    ></textarea>
    <small>Catatan tersimpan lokal di perangkat ini.</small>
  </aside>
</template>
