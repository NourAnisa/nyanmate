import type { TeachingCue, TeachingGesture } from './pdfTeaching'

export type ChoreographyAction = 'enter' | 'greet' | 'explain' | 'point' | 'think' | 'discuss' | 'summarize' | 'celebrate'

export interface ChoreographyStep {
  action: ChoreographyAction
  label: string
  message: string
  gesture: TeachingGesture
  durationMs: number
}

export interface PageChoreography {
  page: number
  steps: ChoreographyStep[]
}

const step = (action: ChoreographyAction, label: string, message: string, gesture: TeachingGesture, durationMs = 2600): ChoreographyStep => ({
  action, label, message, gesture, durationMs,
})

export function buildPageChoreography(cue: TeachingCue, pageCount: number): PageChoreography {
  const steps: ChoreographyStep[] = []

  if (cue.page === 1) {
    steps.push(step('enter', 'Enter', 'NyanMate enters and gets ready to teach.', 'greet', 1600))
    steps.push(step('greet', 'Greeting', 'Halo semuanya! Mari kita mulai materi hari ini. 👋', 'greet', 2800))
  }

  if (cue.type === 'question') {
    steps.push(step('think', 'Question', 'Coba pikirkan pertanyaan ini sebentar. 🤔', 'think', 3000))
    steps.push(step('discuss', 'Discuss', 'Sekarang diskusikan jawaban kalian bersama teman. 💬', 'think', 4500))
  } else if (cue.type === 'summary') {
    steps.push(step('summarize', 'Summary', 'Mari kita rangkum poin penting dari materi ini.', 'summarize', 3200))
  } else {
    steps.push(step('explain', cue.title, cue.message, cue.gesture === 'greet' ? 'explain' : cue.gesture, 2800))
    if (cue.focusLabel) {
      steps.push(step('point', `Point to ${cue.focusLabel}`, `Perhatikan ${cue.focusLabel} pada bagian ini. 👉`, cue.safeSide === 'left' ? 'point-right' : 'point-left', 3000))
    }
  }

  if (cue.page === pageCount) {
    steps.push(step('celebrate', 'Finish', 'Materi selesai! Terima kasih, semuanya! 🎉', 'summarize', 3000))
  }

  return { page: cue.page, steps }
}

export function buildTeachingChoreography(cues: TeachingCue[], pageCount: number): PageChoreography[] {
  return cues.map(cue => buildPageChoreography(cue, pageCount))
}
