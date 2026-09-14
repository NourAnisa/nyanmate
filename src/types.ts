export type PetState = 'idle' | 'thinking' | 'coding' | 'teaching' | 'success' | 'error' | 'sleeping'

export type AgentState = 'idle' | 'starting' | 'thinking' | 'coding' | 'running' | 'waiting' | 'success' | 'error'

export type AgendaRepeat = 'none' | 'daily' | 'weekly' | 'monthly'

export interface AgendaItem {
  id: string
  title: string
  startsAt: string
  reminded: boolean
  repeat?: AgendaRepeat
  reminderMinutes?: number
  notes?: string
  completedAt?: string
  snoozedUntil?: string
  lastReminderOccurrence?: string
}

export interface AgentStatus {
  agent: string
  state: AgentState
  message?: string
}
