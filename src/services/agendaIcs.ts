import type { AgendaItem, AgendaRepeat } from '../types'

function esc(value = '') {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;')
}

function unesc(value = '') {
  return value.replace(/\\n/g, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\')
}

function toIcsDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

function parseIcsDate(value: string) {
  const clean = value.trim()
  if (/^\d{8}T\d{6}Z$/.test(clean)) {
    const y = clean.slice(0, 4), m = clean.slice(4, 6), d = clean.slice(6, 8)
    const hh = clean.slice(9, 11), mm = clean.slice(11, 13), ss = clean.slice(13, 15)
    return new Date(`${y}-${m}-${d}T${hh}:${mm}:${ss}Z`).toISOString()
  }
  if (/^\d{8}T\d{6}$/.test(clean)) {
    const y = clean.slice(0, 4), m = clean.slice(4, 6), d = clean.slice(6, 8)
    const hh = clean.slice(9, 11), mm = clean.slice(11, 13), ss = clean.slice(13, 15)
    return new Date(`${y}-${m}-${d}T${hh}:${mm}:${ss}`).toISOString()
  }
  return null
}

function rruleFor(repeat: AgendaRepeat | undefined) {
  if (!repeat || repeat === 'none') return ''
  return `RRULE:FREQ=${repeat.toUpperCase()}`
}

export function exportAgendaToIcs(items: AgendaItem[]) {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//NyanMate//Smart Agenda//EN', 'CALSCALE:GREGORIAN']
  items.forEach(item => {
    const start = toIcsDate(item.startsAt)
    if (!start) return
    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${esc(item.id)}@nyanmate.local`)
    lines.push(`DTSTAMP:${toIcsDate(new Date().toISOString())}`)
    lines.push(`DTSTART:${start}`)
    lines.push(`SUMMARY:${esc(item.title)}`)
    if (item.notes) lines.push(`DESCRIPTION:${esc(item.notes)}`)
    const rule = rruleFor(item.repeat)
    if (rule) lines.push(rule)
    lines.push('END:VEVENT')
  })
  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

export function parseAgendaIcs(text: string): AgendaItem[] {
  const unfolded = text.replace(/\r?\n[ \t]/g, '')
  const blocks = unfolded.split('BEGIN:VEVENT').slice(1).map(block => block.split('END:VEVENT')[0])
  const results: AgendaItem[] = []

  blocks.forEach(block => {
    const lines = block.split(/\r?\n/).map(line => line.trim()).filter(Boolean)
    const find = (prefix: string) => lines.find(line => line.startsWith(prefix))?.slice(prefix.length)
    const summary = find('SUMMARY:')
    const dtstartLine = lines.find(line => line.startsWith('DTSTART'))
    if (!summary || !dtstartLine) return
    const dtValue = dtstartLine.slice(dtstartLine.indexOf(':') + 1)
    const startsAt = parseIcsDate(dtValue)
    if (!startsAt) return

    const rrule = find('RRULE:') ?? ''
    let repeat: AgendaRepeat = 'none'
    if (/FREQ=DAILY/i.test(rrule)) repeat = 'daily'
    else if (/FREQ=WEEKLY/i.test(rrule)) repeat = 'weekly'
    else if (/FREQ=MONTHLY/i.test(rrule)) repeat = 'monthly'

    const uidRaw = find('UID:')?.split('@')[0]
    results.push({
      id: uidRaw || crypto.randomUUID(),
      title: unesc(summary),
      startsAt,
      reminded: false,
      repeat,
      reminderMinutes: 10,
      notes: unesc(find('DESCRIPTION:') ?? '') || undefined,
    })
  })

  return results
}
