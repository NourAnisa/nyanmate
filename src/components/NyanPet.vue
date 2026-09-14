<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { getCurrentWindow } from '@tauri-apps/api/window'
import type { PetState } from '../types'
import { activityLabel, chooseIdleActivity, type PetIdleActivity } from '../services/petLife'

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
const lastLocalActivity = ref(Date.now())
let idleCycle = 0
let lifeTimer: number | undefined
const sleepAfterMs = 3 * 60 * 1000

const autonomousSleep = computed(() => props.state === 'idle' && idleActivity.value === 'doze')
const displayState = computed<PetState>(() => autonomousSleep.value ? 'sleeping' : props.state)
const stateClass = computed(() => `state-${displayState.value}`)
const activityClass = computed(() => props.state === 'idle' ? `idle-${idleActivity.value}` : '')
const showThought = computed(() => displayState.value === 'thinking' || props.choreographyAction === 'think')
const showSparkles = computed(() => displayState.value === 'success' || props.choreographyAction === 'celebrate')
const titleText = computed(() => props.draggable
  ? `NyanMate is ${activityLabel(idleActivity.value)} • click to pet • double-click for menu • drag to move`
  : 'NyanMate teaching companion')

function trackEyes(event: MouseEvent) {
  markActivity()
  const el = event.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  const x = (event.clientX - (rect.left + rect.width / 2)) / rect.width
  const y = (event.clientY - (rect.top + rect.height / 2)) / rect.height
  eyeX.value = Math.max(-3, Math.min(3, x * 8))
  eyeY.value = Math.max(-2, Math.min(2, y * 6))
}

function resetEyes() { eyeX.value = 0; eyeY.value = 0 }
function markActivity() {
  lastLocalActivity.value = Date.now()
  if (idleActivity.value === 'doze') idleActivity.value = 'rest'
}

function updatePetLife() {
  if (props.state !== 'idle') {
    idleActivity.value = 'rest'
    return
  }
  idleCycle += 1
  idleActivity.value = chooseIdleActivity(Date.now() - lastLocalActivity.value, idleCycle, sleepAfterMs).activity
}

async function startDrag(event: MouseEvent) {
  markActivity()
  if (!props.draggable || event.button !== 0) return
  try { await getCurrentWindow().startDragging() } catch { /* Browser preview */ }
}

function pet() {
  markActivity()
  isPetting.value = true
  emit('pet')
  window.setTimeout(() => (isPetting.value = false), 700)
}

function globalLocalActivity() { markActivity() }

watch(() => props.state, state => {
  if (state !== 'idle') idleActivity.value = 'rest'
  else markActivity()
})

onMounted(() => {
  window.addEventListener('keydown', globalLocalActivity)
  window.addEventListener('pointerdown', globalLocalActivity)
  lifeTimer = window.setInterval(updatePetLife, 10_000)
})

onUnmounted(() => {
  window.removeEventListener('keydown', globalLocalActivity)
  window.removeEventListener('pointerdown', globalLocalActivity)
  if (lifeTimer) clearInterval(lifeTimer)
})
</script>

<template>
  <div
    class="nyan-pet"
    :class="[stateClass, activityClass, `pointer-${pointerDirection}`, choreographyAction ? `pet-choreo-${choreographyAction}` : '', { petting: isPetting, 'drag-disabled': !draggable }]"
    @mousemove="trackEyes"
    @mouseleave="resetEyes"
    @mousedown="startDrag"
    @click.stop="pet"
    @dblclick.stop="emit('menu')"
    :title="titleText"
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
      <div v-if="displayState === 'coding'" class="headphones"><span></span></div>
      <div v-if="displayState === 'coding'" class="laptop"><span>⌘</span></div>
      <template v-if="displayState === 'teaching'">
        <div class="teacher-glasses"><span></span><span></span></div>
        <div class="graduation-cap"><i></i></div>
        <div class="teaching-pointer"></div>
      </template>
      <div v-if="showSparkles" class="sparkles">✦ ✧</div>
      <div v-if="displayState === 'error'" class="alert">!</div>
      <div v-if="displayState === 'sleeping'" class="sleep-z">Z z</div>
      <div v-if="props.state === 'idle' && idleActivity === 'groom'" class="groom-mark">♡</div>
    </div>
  </div>
</template>
