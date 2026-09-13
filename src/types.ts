export type PetState = 'idle' | 'thinking' | 'coding' | 'teaching' | 'success' | 'error' | 'sleeping'

export type AgentState = 'idle' | 'starting' | 'thinking' | 'coding' | 'running' | 'waiting' | 'success' | 'error'

export interface AgendaItem {
  id: string
  title: string
  startsAt: string
  reminded: boolean
}

export interface AgentStatus {
  agent: string
  state: AgentState
  message?: string
}
