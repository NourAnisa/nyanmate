import type { AgendaItem, AgendaRepeat } from '../types'

export const AGENDA_STORAGE_KEY = 'nyanmate-agenda'

function clone(item: AgendaItem): AgendaItem {
  return { ...item, repeat: item.repeat ?? 'none', reminderMinutes: item.reminderMinutes ?? 10 }
}

export function loadAgenda(): AgendaItem[] {
  try {
    const raw = JSON.parse(localStorage.getItem(AGENDA_STORAGE_KEY) || '[]') as AgendaItem[]
    return Array.isArray(raw) ? raw.map(clone).sort((a, b) => a.startsAt.localeCompare(b.startsAt)) : []
  } catch {
    return []
  }
}

export function saveAgenda(items: AgendaItem[]) {
  localStorage.setItem(AGENDA_STORAGE_KEY, JSON.stringify(items))
}

export function nextOccurrence(item: AgendaItem, after = new Date()): Date | null {
  const repeat: AgendaRepeat = item.repeat ?? 'none'
  const start = new Date(item.startsAt)
  if (Number.isNaN(start.getTime())) return null
  if (start >= after) return start
  if (repeat === 'none') return null

  const next = new Date(start)
  if (repeat === 'daily') {
    const days = Math.max(1, Math.ceil((after.getTime() - start.getTime()) / 86_400_000))
    next.setDate(start.getDate() + days)
    while (next < after) next.setDate(next.getDate() + 1)
  } else if (repeat === 'weekly') {
    const weeks = Math.max(1, Math.ceil((after.getTime() - start.getTime()) / (7 * 86_400_000)))
    next.setDate(start.getDate() + weeks * 7)
    while (next < after) next.setDate(next.getDate() + 7)
  } else if (repeat === 'monthly') {
    next.setMonth(next.getMonth() + 1)
    while (next < after) next.setMonth(next.getMonth() + 1)
  }
  return next
}

export function materializeUpcoming(items: AgendaItem[], from = new Date(), days = 14) {
  const horizon = new Date(from.getTime() + days * 86_400_000)
  return items.flatMap(item => {
    const result: Array<{ item: AgendaItem; occurrence: Date }> = []
    let cursor = nextOccurrence(item, from)
    let guard = 0
    while (cursor && cursor <= horizon && guard < 64) {
      result.push({ item, occurrence: new Date(cursor) })
      guard++
      if ((item.repeat ?? 'none') === 'none') break
      cursor = nextOccurrence({ ...item, startsAt: new Date(cursor.getTime() + 1000).toISOString() }, new Date(cursor.getTime() + 1000))
      if ((item.repeat ?? 'none') === 'daily') cursor = new Date(result[result.length - 1].occurrence.getTime() + 86_400_000)
      if ((item.repeat ?? 'none') === 'weekly') cursor = new Date(result[result.length - 1].occurrence.getTime() + 7 * 86_400_000)
      if ((item.repeat ?? 'none') === 'monthly') {
        cursor = new Date(result[result.length - 1].occurrence)
        cursor.setMonth(cursor.getMonth() + 1)
      }
    }
    return result
  }).sort((a, b) => a.occurrence.getTime() - b.occurrence.getTime())
}

export function agendaForDay(items: AgendaItem[], day: Date) {
  const start = new Date(day); start.setHours(0, 0, 0, 0)
  const end = new Date(start); end.setDate(end.getDate() + 1)
  return materializeUpcoming(items, start, 2).filter(entry => entry.occurrence >= start && entry.occurrence < end)
}

export function countdownLabel(target: Date, now = new Date()) {
  const diff = target.getTime() - now.getTime()
  if (diff <= 0) return 'now'
  const minutes = Math.ceil(diff / 60_000)
  if (minutes < 60) return `in ${minutes}m`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours < 24) return rest ? `in ${hours}h ${rest}m` : `in ${hours}h`
  const days = Math.floor(hours / 24)
  return `in ${days}d`
}

export function buildDailyBrief(items: AgendaItem[], now = new Date()) {
  const today = agendaForDay(items, now)
  if (!today.length) return 'No agenda for today. Your schedule is clear. ✨'
  const upcoming = today.filter(entry => entry.occurrence.getTime() >= now.getTime())
  const first = upcoming[0] ?? today[0]
  const remainingText = upcoming.length ? `${upcoming.length} upcoming` : 'all scheduled items have passed'
  return `Today: ${today.length} item${today.length === 1 ? '' : 's'}, ${remainingText}. Next: ${first.item.title} at ${first.occurrence.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
}

export function dueReminder(items: AgendaItem[], now = new Date()) {
  return materializeUpcoming(items, now, 1).find(({ item, occurrence }) => {
    const reminderMs = Math.max(0, item.reminderMinutes ?? 10) * 60_000
    const diff = occurrence.getTime() - now.getTime()
    return diff > 0 && diff <= reminderMs
  }) ?? null
}
