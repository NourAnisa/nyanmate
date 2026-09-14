import type { FileAssistantResult } from './fileAssistant'

export type AssistantRole = 'user' | 'assistant'
export interface AssistantMessage {
  id: string
  role: AssistantRole
  text: string
  createdAt: string
}

export interface AssistantChatContext {
  file?: FileAssistantResult | null
  includeFileContext?: boolean
}

const HISTORY_KEY = 'nyanmate-assistant-chat-v1'

export function loadAssistantHistory(): AssistantMessage[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') as AssistantMessage[]
    return Array.isArray(parsed) ? parsed.slice(-80) : []
  } catch { return [] }
}

export function saveAssistantHistory(messages: AssistantMessage[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(messages.slice(-80)))
}

export function clearAssistantHistory() { localStorage.removeItem(HISTORY_KEY) }

export function makeAssistantMessage(role: AssistantRole, text: string): AssistantMessage {
  return { id: crypto.randomUUID(), role, text: text.trim(), createdAt: new Date().toISOString() }
}

function fileReply(file: FileAssistantResult) {
  const meta = [file.kind, file.language, file.lines ? `${file.lines} lines` : '', file.words ? `${file.words} words` : ''].filter(Boolean).join(' · ')
  return `I currently have ${file.name} in local context (${meta}).\n\n${file.summary.join('\n')}`
}

function featureReply() {
  return 'NyanMate currently includes the desktop pet, Smart Agenda, Pomodoro, PDF Teaching Companion, local teaching analytics, AI coding-agent status normalization, Drop-a-File inspection, and this local assistant chat shell.'
}

export function localAssistantReply(prompt: string, context: AssistantChatContext = {}): string {
  const q = prompt.trim().toLowerCase()
  if (!q) return 'Type a message and I’ll help with the local NyanMate features available in this prototype.'

  if (/^(hi|hello|hai|halo|hey)\b/.test(q)) return 'Hi! I’m NyanMate. 🐱 This v0.25 chat runs locally and does not contact a cloud model.'
  if (q.includes('privacy') || q.includes('cloud') || q.includes('upload')) return 'This chat is local-only. Dropped files are not uploaded automatically. A future external AI provider must be explicitly enabled, and file context should require a separate opt-in.'
  if (q.includes('feature') || q.includes('fitur') || q.includes('what can') || q.includes('bisa apa')) return featureReply()
  if (q.includes('file') || q.includes('dokumen') || q.includes('code') || q.includes('kode')) {
    if (context.includeFileContext && context.file) return fileReply(context.file)
    if (context.file) return `A file is loaded (${context.file.name}), but file context sharing is currently off. Turn on “Use loaded file context” to let this local chat reference its analysis.`
    return 'No file is loaded in the File Assistant yet. Open the File tab and drop a supported document or source-code file.'
  }
  if (q.includes('agenda') || q.includes('jadwal')) return 'Open Smart Agenda from the system tray to manage recurring schedules, snooze reminders, Daily Brief, and .ics import/export.'
  if (q.includes('teaching') || q.includes('ajar') || q.includes('pdf')) return 'For teaching, open the main mascot menu and prepare a PDF. NyanMate can present it fullscreen, run lesson flow/choreography, assessments, presenter notes, and local post-class analytics.'
  if (q.includes('coding') || q.includes('agent')) return 'The coding companion currently normalizes agent states such as thinking, coding, running, success, and error. Automatic process-level adapters for real CLIs are still a later milestone.'
  if (q.includes('help') || q.includes('bantu')) return 'Try asking about the loaded file, Smart Agenda, teaching mode, coding companion, privacy, or current NyanMate features. This local engine intentionally avoids pretending to be a full cloud LLM.'

  if (context.includeFileContext && context.file) return `I can only provide deterministic local help in v0.25. The loaded file is ${context.file.name}. Its local overview is:\n\n${context.file.summary.join('\n')}\n\nFor open-ended reasoning over the full file, connect an opt-in AI provider in a future version.`
  return 'v0.25 currently uses a deterministic local assistant, so I can help with NyanMate features and loaded-file summaries but not general open-ended AI reasoning yet. External providers will be opt-in rather than silently enabled.'
}
