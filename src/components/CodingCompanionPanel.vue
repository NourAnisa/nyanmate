<script setup lang="ts">
import { computed, ref } from 'vue'
import { codingAgents, normalizeAgentEvent, type CodingAgentEvent } from '../services/codingCompanion'
import type { AgentState, AgentStatus } from '../types'

const props = defineProps<{ status: AgentStatus | null }>()
const emit = defineEmits<{ (e: 'status', status: AgentStatus): void }>()
const agent = ref('opencode')
const state = ref<AgentState>('thinking')
const message = ref('')
const states: AgentState[] = ['idle', 'starting', 'thinking', 'coding', 'running', 'waiting', 'success', 'error']
const activeLabel = computed(() => props.status ? `${props.status.agent} · ${props.status.state}` : 'No agent activity yet')

function send() {
  const profile = codingAgents.find(item => item.id === agent.value)
  const event: CodingAgentEvent = { agent: profile?.name ?? agent.value, state: state.value, message: message.value }
  emit('status', normalizeAgentEvent(event))
}
</script>

<template>
  <section class="coding-companion-panel">
    <div class="coding-companion-head"><div><strong>🤖 AI Coding Companion</strong><small>NyanMate reacts to normalized coding-agent activity.</small></div><span>{{ activeLabel }}</span></div>
    <div class="coding-companion-controls">
      <select v-model="agent"><option v-for="item in codingAgents" :key="item.id" :value="item.id">{{ item.name }}</option></select>
      <select v-model="state"><option v-for="item in states" :key="item" :value="item">{{ item }}</option></select>
      <input v-model="message" placeholder="Optional status message" @keyup.enter="send" />
      <button @click="send">Send status</button>
    </div>
    <small>Adapter contract: idle · starting · thinking · coding · running · waiting · success · error. This panel is also a local test harness for future CLI adapters.</small>
  </section>
</template>
