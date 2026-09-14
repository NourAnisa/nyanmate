<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { getCurrentWindow } from '@tauri-apps/api/window'
import type { PetState } from '../types'
import { chooseIdleActivity, type PetIdleActivity } from '../services/petLife'
import { buildPetMood, moodLabel, type PetMood } from '../services/petMood'

const props = withDefaults(defineProps<{
  state: PetState
  draggable?: boolean
  pointerDirection?: 'left' | 'right'
  choreographyAction?: string
}>(), { draggable: true, pointerDirection: 'right', choreographyAction: '' })
const emit = defineEmits<{ (e: 'pet'): void; (e: 'menu'): void }>()

const eyeX = ref(0)
const eyeY = ref(0)
const isPetting = ref(false)
const idleActivity = ref<PetIdleActivity>('rest')
const mood = ref<PetMood>('calm')
const energy = ref(78)
const affection = ref(45)
const roamX = ref(0)
const roamY = ref(0)
const lastInteractionAt = ref(Date.now())
const recentPets = ref(0)
let cycleIndex = 0
let lifeTimer: number | undefined

const stateClass = computed(() => `state-${props.state}`)
const activityClass = computed(() => `activity-${idleActivity.value}`)
const moodClass = computed(() => `mood-${mood.value}`)
const showThought = computed(() => props.state === 'thinking' || props.choreographyAction === 'think')
const showSparkles = computed(() => props.state === 'success' || props.choreographyAction === 'celebrate')
const autonomous = computed(() => props.state === 'idle' || props.state === 'sleeping')
const petStyle = computed(() => autonomous.value ? { transform: `translate(${roamX.value}px, ${roamY.value}px)` } : undefined)
const lifeTitle = computed(() => `Mood: ${moodLabel(mood.value)} · Energy ${energy.value}% · Affection ${affection.value}%`)

function registerInteraction() {
  lastInteractionAt.value = Date.now()
  if (props.state === 'sleeping') idleActivity.value = 'rest'
}

function trackEyes(event: MouseEvent) {
  registerInteraction()
  const el = event.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  const x = (event.clientX - (rect.left + rect.width / 2)) / rect.width
  const y = (event.clientY - (rect.top + rect.height / 2)) / rect.height
  eyeX.value = Math.max(-3, Math.min(3, x * 8))
  eyeY.value = Math.max(-2, Math.min(2, y * 6))
}

function resetEyes() { eyeX.value = 0; eyeY.value = 0 }

async function startDrag(event: MouseEvent) {
  registerInteraction()
  if (!props.draggable || event.button !== 0) return
  try { await getCurrentWindow().startDragging() } catch { /* Browser preview */ }
}

function pet() {
  registerInteraction()
  recentPets.value = Math.min(8, recentPets.value + 1)
  isPetting.value = true
  emit('pet')
  window.setTimeout(() => (isPetting.value = false), 700)
}

function updateLife() {
  if (!autonomous.value) {
    idleActivity.value = 'rest'
    roamX.value = 0
    roamY.value = 0
    return
  }

  const inactiveMs = Date.now() - lastInteractionAt.value
  const life = chooseIdleActivity(inactiveMs, cycleIndex, 180_000)
  idleActivity.value = life.activity
  const snapshot = buildPetMood({ inactiveMs, recentPets: recentPets.value, cycleIndex })
  mood.value = snapshot.mood
  energy.value = snapshot.energy
  affection.value = snapshot.affection
  roamX.value = life.asleep ? 0 : snapshot.roamX
  roamY.value = life.asleep ? 3 : snapshot.roamY
  cycleIndex += 1
  if (cycleIndex % 3 === 0 && recentPets.value > 0) recentPets.value -= 1
}

onMounted(() => {
  updateLife()
  lifeTimer = window.setInterval(updateLife, 12_000)
})

onUnmounted(() => { if (lifeTimer) clearInterval(lifeTimer) })
</script>

<template>
  <div
    class="nyan-pet"
    :class="[stateClass, activityClass, moodClass, `pointer-${pointerDirection}`, choreographyAction ? `pet-choreo-${choreographyAction}` : '', { petting: isPetting, 'drag-disabled': !draggable }]"
    :style="petStyle"
    @mousemove="trackEyes"
    @mouseleave="resetEyes"
    @mousedown="startDrag"
    @click.stop="pet"
    @dblclick.stop="emit('menu')"
    :title="draggable ? `${lifeTitle} · Click to pet • double-click for menu • drag to move` : 'NyanMate teaching companion'"
  >
    <div class="tail"><span class="tail-tip"></span></div>
    <div class="body">
      <div class="back-patch"></div><div class="belly"></div>
      <div class="paw paw-left"></div><div class="paw paw-right"></div>
      <div class="scarf-knot"></div><div class="scarf-tail"></div>
    </div>
    <div class="head">
      <div class="ear ear-left"><span></span></div><div class="ear ear-right"><span></span></div>
      <div class="gray-cap"></div><div class="face-patch patch-left"></div><div class="face-patch patch-right"></div>
      <div class="eye eye-left"><i :style="{ transform: `translate(${eyeX}px, ${eyeY}px)` }"></i><b></b></div>
      <div class="eye eye-right"><i :style="{ transform: `translate(${eyeX}px, ${eyeY}px)` }"></i><b></b></div>
      <div class="cheek cheek-left"></div><div class="cheek cheek-right"></div>
      <div class="nose"></div><div class="mouth"></div>
      <div class="whiskers whiskers-left"></div><div class="whiskers whiskers-right"></div>
      <div class="scarf-band"></div><div class="scarf-badge">✦</div>
      <div v-if="showThought" class="thought">•••</div>
      <div v-if="state === 'coding'" class="headphones"><span></span></div>
      <div v-if="state === 'coding'" class="laptop"><span>⌘</span></div>
      <template v-if="state === 'teaching'">
        <div class="teacher-glasses"><span></span><span></span></div>
        <div class="graduation-cap"><i></i></div>
        <div class="teaching-pointer"></div>
      </template>
      <div v-if="showSparkles" class="sparkles">✦ ✧</div>
      <div v-if="state === 'error'" class="alert">!</div>
      <div v-if="state === 'sleeping' || idleActivity === 'doze'" class="sleep-z">Z z</div>
      <div v-if="mood === 'playful' && autonomous" class="mood-heart">♥</div>
      <div v-if="mood === 'curious' && autonomous" class="mood-mark">?</div>
    </div>
  </div>
</template>
