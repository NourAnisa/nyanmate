import type { AgentState, AgentStatus, PetState } from '../types'

export type CodingAgentId = 'opencode' | 'codex' | 'claude-code' | 'cursor' | 'kiro' | 'antigravity' | 'devin' | 'copilot-cli' | 'custom'

export interface CodingAgentProfile {
  id: CodingAgentId
  name: string
  aliases: string[]
}

export interface CodingAgentEvent {
  agent?: string
  state?: string
  message?: string
  timestamp?: string
}

export const codingAgents: CodingAgentProfile[] = [
  { id: 'opencode', name: 'OpenCode', aliases: ['opencode', 'open code'] },
  { id: 'codex', name: 'Codex', aliases: ['codex', 'codex cli'] },
  { id: 'claude-code', name: 'Claude Code', aliases: ['claude', 'claude code'] },
  { id: 'cursor', name: 'Cursor', aliases: ['cursor'] },
  { id: 'kiro', name: 'Kiro', aliases: ['kiro'] },
  { id: 'antigravity', name: 'Antigravity', aliases: ['antigravity'] },
  { id: 'devin', name: 'Devin', aliases: ['devin'] },
  { id: 'copilot-cli', name: 'Copilot CLI', aliases: ['copilot', 'copilot cli', 'github copilot'] },
  { id: 'custom', name: 'Coding Agent', aliases: [] },
]

const stateAliases: Record<string, AgentState> = {
  idle: 'idle', ready: 'idle', stopped: 'idle',
  starting: 'starting', booting: 'starting', initializing: 'starting',
  thinking: 'thinking', reasoning: 'thinking', planning: 'thinking', analysing: 'thinking', analyzing: 'thinking',
  coding: 'coding', editing: 'coding', writing: 'coding', patching: 'coding',
  running: 'running', executing: 'running', testing: 'running', building: 'running',
  waiting: 'waiting', input: 'waiting', approval: 'waiting', paused: 'waiting',
  success: 'success', complete: 'success', completed: 'success', done: 'success', passed: 'success',
  error: 'error', failed: 'error', failure: 'error', blocked: 'error',
}

export function normalizeAgentName(value = ''): CodingAgentProfile {
  const normalized = value.trim().toLowerCase()
  return codingAgents.find(agent => agent.aliases.some(alias => normalized.includes(alias))) ?? codingAgents[codingAgents.length - 1]
}

export function normalizeAgentState(value = ''): AgentState {
  const normalized = value.trim().toLowerCase().replace(/[_-]+/g, ' ')
  if (stateAliases[normalized]) return stateAliases[normalized]
  const match = Object.entries(stateAliases).find(([alias]) => normalized.includes(alias))
  return match?.[1] ?? 'idle'
}

export function normalizeAgentEvent(event: CodingAgentEvent): AgentStatus {
  const profile = normalizeAgentName(event.agent)
  return { agent: profile.name, state: normalizeAgentState(event.state), message: event.message?.trim() || undefined }
}

export function agentStateToPetState(state: AgentState): PetState {
  if (state === 'thinking' || state === 'starting' || state === 'waiting') return 'thinking'
  if (state === 'coding' || state === 'running') return 'coding'
  if (state === 'success') return 'success'
  if (state === 'error') return 'error'
  return 'idle'
}

export function agentBubble(status: AgentStatus) {
  if (status.message) return `${status.agent}: ${status.message}`
  const messages: Record<AgentState, string> = {
    idle: `${status.agent} is ready.`, starting: `${status.agent} is starting…`, thinking: `${status.agent} is thinking…`,
    coding: `${status.agent} is coding…`, running: `${status.agent} is running the task…`, waiting: `${status.agent} needs your input.`,
    success: `${status.agent} finished successfully! ✨`, error: `${status.agent} hit an error. ⚠️`,
  }
  return messages[status.state]
}
