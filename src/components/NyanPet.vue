<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { getCurrentWindow } from '@tauri-apps/api/window'
import type { PetState } from '../types'
import { chooseIdleActivity, type PetIdleActivity } from '../services/petLife'
import { buildPetMood, moodLabel, type PetMood } from '../services/petMood'
import {
  loadPetSettings,
  motionMultiplier,
  personalityLabels,
  personalityMotionMultiplier,
  personalitySleepMultiplier,
  savePetSettings,
  type PetAccessory,
  type PetMotionLevel,
  type PetPersonality,
  type PetSettings,
} from '../services/petSettings'

const props = withDefaults(defineProps<{
  state: PetState
  draggable?: boolean
  pointerDirection?: 'left' | 'right'
  choreographyAction?: string
}>(), { draggable: true, pointerDirection: 'right', choreographyAction: '' })
const emit = defineEmits<{ (e: 'pet'): void; (e: 'menu'): void }>()

const eyeX = ref(0), eyeY = ref(0), isPetting = ref(false)
const idleActivity = ref<PetIdleActivity>('rest'), mood = ref<PetMood>('calm')
const energy = ref(78), affection = ref(45), roamX = ref(0), roamY = ref(0)
const lastInteractionAt = ref(Date.now()), recentPets = ref(0), settingsOpen = ref(false)
const settings = ref<PetSettings>(loadPetSettings())
const draft = ref<PetSettings>({ ...settings.value })
let cycleIndex = 0, lifeTimer: number | undefined

const stateClass = computed(() => `state-${props.state}`)
const activityClass = computed(() => `activity-${idleActivity.value}`)
const moodClass = computed(() => `mood-${mood.value}`)
const personalityClass = computed(() => `personality-${settings.value.personality}`)
const accessoryClass = computed(() => `accessory-${settings.value.accessory}`)
const showThought = computed(() => props.state === 'thinking' || props.choreographyAction === 'think')
const showSparkles = computed(() => props.state === 'success' || props.choreographyAction === 'celebrate')
const autonomous = computed(() => props.state === 'idle' || props.state === 'sleeping')
const petStyle = computed(() => autonomous.value && settings.value.autonomousMovement ? { transform: `translate(${roamX.value}px, ${roamY.value}px)` } : undefined)
const lifeTitle = computed(() => `${settings.value.name} · ${personalityLabels[settings.value.personality]} · Mood: ${moodLabel(mood.value)} · Energy ${energy.value}% · Affection ${affection.value}%`)
const sleepAfterMs = computed(() => settings.value.sleepAfterMinutes * 60_000 * personalitySleepMultiplier(settings.value.personality))

function registerInteraction() { lastInteractionAt.value = Date.now(); if (props.state === 'sleeping') idleActivity.value = 'rest' }
function trackEyes(event: MouseEvent) { registerInteraction(); const el = event.currentTarget as HTMLElement, rect = el.getBoundingClientRect(); const x = (event.clientX - (rect.left + rect.width / 2)) / rect.width, y = (event.clientY - (rect.top + rect.height / 2)) / rect.height; eyeX.value = Math.max(-3, Math.min(3, x * 8)); eyeY.value = Math.max(-2, Math.min(2, y * 6)) }
function resetEyes() { eyeX.value = 0; eyeY.value = 0 }
async function startDrag(event: MouseEvent) { registerInteraction(); if (!props.draggable || event.button !== 0) return; try { await getCurrentWindow().startDragging() } catch {} }
function pet() { registerInteraction(); recentPets.value = Math.min(8, recentPets.value + 1); isPetting.value = true; emit('pet'); window.setTimeout(() => (isPetting.value = false), 700) }
function openSettings(event: MouseEvent) { event.preventDefault(); if (!props.draggable) return; draft.value = { ...settings.value }; settingsOpen.value = true }
function closeSettings() { settingsOpen.value = false }
function applySettings() { settings.value = savePetSettings(draft.value); draft.value = { ...settings.value }; settingsOpen.value = false; registerInteraction(); updateLife() }
function resetSettings() { draft.value = loadPetSettings(); draft.value = { name: 'NyanMate', personality: 'gentle', accessory: 'scarf', motionLevel: 'normal', sleepAfterMinutes: 3, autonomousMovement: true } }
function externalSettings(event: Event) { const detail = (event as CustomEvent<PetSettings>).detail; if (detail) settings.value = { ...detail } }

function updateLife() {
  if (!autonomous.value) { idleActivity.value = 'rest'; roamX.value = 0; roamY.value = 0; return }
  const inactiveMs = Date.now() - lastInteractionAt.value
  const life = chooseIdleActivity(inactiveMs, cycleIndex, sleepAfterMs.value)
  idleActivity.value = life.activity
  const snapshot = buildPetMood({ inactiveMs, recentPets: recentPets.value, cycleIndex })
  mood.value = settings.value.personality === 'playful' && recentPets.value > 0 ? 'playful' : settings.value.personality === 'sleepy' && inactiveMs > 45_000 ? 'sleepy' : snapshot.mood
  energy.value = snapshot.energy
  affection.value = snapshot.affection
  const movement = motionMultiplier(settings.value.motionLevel) * personalityMotionMultiplier(settings.value.personality)
  roamX.value = !settings.value.autonomousMovement || life.asleep ? 0 : Math.round(snapshot.roamX * movement)
  roamY.value = life.asleep ? 3 : !settings.value.autonomousMovement ? 0 : Math.round(snapshot.roamY * movement)
  cycleIndex += 1
  if (cycleIndex % 3 === 0 && recentPets.value > 0) recentPets.value -= 1
}

onMounted(() => { updateLife(); lifeTimer = window.setInterval(updateLife, 12_000); window.addEventListener('nyanmate-pet-settings-changed', externalSettings) })
onUnmounted(() => { if (lifeTimer) clearInterval(lifeTimer); window.removeEventListener('nyanmate-pet-settings-changed', externalSettings) })
</script>

<template>
  <div class="pet-customization-shell">
    <div
      class="nyan-pet"
      :class="[stateClass, activityClass, moodClass, personalityClass, accessoryClass, `pointer-${pointerDirection}`, choreographyAction ? `pet-choreo-${choreographyAction}` : '', { petting: isPetting, 'drag-disabled': !draggable }]"
      :style="petStyle"
      @mousemove="trackEyes" @mouseleave="resetEyes" @mousedown="startDrag" @click.stop="pet" @dblclick.stop="emit('menu')" @contextmenu="openSettings"
      :title="draggable ? `${lifeTitle} · Click to pet • right-click to customize • double-click for menu • drag to move` : 'NyanMate teaching companion'"
    >
      <div class="tail"><span class="tail-tip"></span></div>
      <div class="body"><div class="back-patch"></div><div class="belly"></div><div class="paw paw-left"></div><div class="paw paw-right"></div><div v-if="settings.accessory === 'scarf'" class="scarf-knot"></div><div v-if="settings.accessory === 'scarf'" class="scarf-tail"></div></div>
      <div class="head">
        <div class="ear ear-left"><span></span></div><div class="ear ear-right"><span></span></div><div class="gray-cap"></div><div class="face-patch patch-left"></div><div class="face-patch patch-right"></div>
        <div class="eye eye-left"><i :style="{ transform: `translate(${eyeX}px, ${eyeY}px)` }"></i><b></b></div><div class="eye eye-right"><i :style="{ transform: `translate(${eyeX}px, ${eyeY}px)` }"></i><b></b></div>
        <div class="cheek cheek-left"></div><div class="cheek cheek-right"></div><div class="nose"></div><div class="mouth"></div><div class="whiskers whiskers-left"></div><div class="whiskers whiskers-right"></div>
        <template v-if="settings.accessory === 'scarf'"><div class="scarf-band"></div><div class="scarf-badge">✦</div></template>
        <div v-if="settings.accessory === 'bell'" class="pet-bell">●</div><div v-if="settings.accessory === 'bow'" class="pet-bow">◆</div>
        <div v-if="showThought" class="thought">•••</div><div v-if="state === 'coding'" class="headphones"><span></span></div><div v-if="state === 'coding'" class="laptop"><span>⌘</span></div>
        <template v-if="state === 'teaching'"><div class="teacher-glasses"><span></span><span></span></div><div class="graduation-cap"><i></i></div><div class="teaching-pointer"></div></template>
        <div v-if="showSparkles" class="sparkles">✦ ✧</div><div v-if="state === 'error'" class="alert">!</div><div v-if="state === 'sleeping' || idleActivity === 'doze'" class="sleep-z">Z z</div><div v-if="mood === 'playful' && autonomous" class="mood-heart">♥</div><div v-if="mood === 'curious' && autonomous" class="mood-mark">?</div>
      </div>
      <div v-if="draggable" class="pet-name-tag">{{ settings.name }}</div>
    </div>

    <div v-if="settingsOpen" class="pet-settings-popover" @click.stop @mousedown.stop>
      <div class="pet-settings-head"><strong>🐾 Pet Customization</strong><button @click="closeSettings">×</button></div>
      <label>Name<input v-model="draft.name" maxlength="24" /></label>
      <label>Personality<select v-model="draft.personality"><option value="gentle">Gentle</option><option value="playful">Playful</option><option value="focused">Focused</option><option value="sleepy">Sleepy</option></select></label>
      <label>Accessory<select v-model="draft.accessory"><option value="scarf">Signature scarf</option><option value="bell">Bell</option><option value="bow">Bow</option><option value="none">None</option></select></label>
      <label>Motion<select v-model="draft.motionLevel"><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option></select></label>
      <label>Sleep after <span>{{ draft.sleepAfterMinutes }} min</span><input v-model.number="draft.sleepAfterMinutes" type="range" min="1" max="30" /></label>
      <label class="pet-settings-check"><input v-model="draft.autonomousMovement" type="checkbox" /> Autonomous movement</label>
      <div class="pet-settings-actions"><button @click="resetSettings">Defaults</button><button class="primary" @click="applySettings">Save</button></div>
      <small>Saved locally on this device. Right-click {{ settings.name }} anytime to change these settings.</small>
    </div>
  </div>
</template>
