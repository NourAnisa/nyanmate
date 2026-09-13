<script setup lang="ts">
import { computed, ref } from 'vue'
import { getCurrentWindow } from '@tauri-apps/api/window'
import type { PetState } from '../types'

const props = defineProps<{ state: PetState }>()
const emit = defineEmits<{ (e: 'pet'): void; (e: 'menu'): void }>()

const eyeX = ref(0)
const eyeY = ref(0)
const isPetting = ref(false)

const stateClass = computed(() => `state-${props.state}`)

function trackEyes(event: MouseEvent) {
  const el = event.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  const x = (event.clientX - (rect.left + rect.width / 2)) / rect.width
  const y = (event.clientY - (rect.top + rect.height / 2)) / rect.height
  eyeX.value = Math.max(-3, Math.min(3, x * 8))
  eyeY.value = Math.max(-2, Math.min(2, y * 6))
}

function resetEyes() {
  eyeX.value = 0
  eyeY.value = 0
}

async function startDrag(event: MouseEvent) {
  if (event.button !== 0) return
  try {
    await getCurrentWindow().startDragging()
  } catch {
    // Browser preview: dragging is only available inside Tauri.
  }
}

function pet() {
  isPetting.value = true
  emit('pet')
  window.setTimeout(() => (isPetting.value = false), 700)
}
</script>

<template>
  <div
    class="nyan-pet"
    :class="[stateClass, { petting: isPetting }]"
    @mousemove="trackEyes"
    @mouseleave="resetEyes"
    @mousedown="startDrag"
    @click.stop="pet"
    @dblclick.stop="emit('menu')"
    title="Click to pet • double-click for menu • drag to move"
  >
    <div class="tail"><span class="tail-tip"></span></div>

    <div class="body">
      <div class="back-patch"></div>
      <div class="belly"></div>
      <div class="paw paw-left"></div>
      <div class="paw paw-right"></div>
      <div class="scarf-knot"></div>
      <div class="scarf-tail"></div>
    </div>

    <div class="head">
      <div class="ear ear-left"><span></span></div>
      <div class="ear ear-right"><span></span></div>
      <div class="gray-cap"></div>
      <div class="face-patch patch-left"></div>
      <div class="face-patch patch-right"></div>

      <div class="eye eye-left"><i :style="{ transform: `translate(${eyeX}px, ${eyeY}px)` }"></i><b></b></div>
      <div class="eye eye-right"><i :style="{ transform: `translate(${eyeX}px, ${eyeY}px)` }"></i><b></b></div>
      <div class="cheek cheek-left"></div>
      <div class="cheek cheek-right"></div>
      <div class="nose"></div>
      <div class="mouth"></div>
      <div class="whiskers whiskers-left"></div>
      <div class="whiskers whiskers-right"></div>

      <div class="scarf-band"></div>
      <div class="scarf-badge">✦</div>

      <div v-if="state === 'thinking'" class="thought">•••</div>
      <div v-if="state === 'coding'" class="headphones"><span></span></div>
      <div v-if="state === 'coding'" class="laptop"><span>⌘</span></div>

      <template v-if="state === 'teaching'">
        <div class="teacher-glasses"><span></span><span></span></div>
        <div class="graduation-cap"><i></i></div>
        <div class="teaching-pointer"></div>
      </template>

      <div v-if="state === 'success'" class="sparkles">✦ ✧</div>
      <div v-if="state === 'error'" class="alert">!</div>
      <div v-if="state === 'sleeping'" class="sleep-z">Z z</div>
    </div>
  </div>
</template>
