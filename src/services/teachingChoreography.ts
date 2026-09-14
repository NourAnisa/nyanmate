import type { TeachingCue, TeachingGesture } from './pdfTeaching'
import type { LessonPagePlan } from './lessonFlow'

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

function durationFor(plan: LessonPagePlan | null | undefined, fallbackMs: number) {
  if (!plan?.durationSec) return fallbackMs
  return Math.max(1200, Math.min(12000, Math.round((plan.durationSec * 1000) / 3)))
}

export function buildPageChoreography(cue: TeachingCue, pageCount: number, plan?: LessonPagePlan | null): PageChoreography {
  const steps: ChoreographyStep[] = []
  const stage = plan?.stage

  if (cue.page === 1 || stage === 'opening') {
    steps.push(step('enter', 'Enter', 'NyanMate enters and gets ready to teach.', 'greet', 1600))
    steps.push(step('greet', 'Greeting', 'Halo semuanya! Mari kita mulai materi hari ini. 👋', 'greet', durationFor(plan, 2800)))
  }

  if (stage === 'quiz' || cue.type === 'question') {
    steps.push(step('think', 'Quiz', 'Coba pikirkan jawabannya terlebih dahulu. 🤔', 'think', durationFor(plan, 3000)))
    const discussionMs = plan?.discussionSec ? Math.min(120000, plan.discussionSec * 1000) : 4500
    steps.push(step('discuss', 'Discuss', 'Sekarang diskusikan jawaban kalian bersama teman. 💬', 'think', discussionMs))
  } else if (stage === 'discussion') {
    const discussionMs = plan?.discussionSec ? Math.min(120000, plan.discussionSec * 1000) : 30000
    steps.push(step('discuss', 'Discussion', 'Diskusikan poin ini bersama kelompok lalu siapkan satu kesimpulan. 💬', 'think', discussionMs))
  } else if (stage === 'evaluation') {
    steps.push(step('think', 'Evaluation', 'Gunakan bagian ini untuk mengecek pemahaman sebelum lanjut.', 'think', durationFor(plan, 3200)))
  } else if (stage === 'practice') {
    steps.push(step('explain', 'Practice', plan?.note || 'Mari praktikkan konsep pada bagian ini langkah demi langkah.', cue.gesture === 'greet' ? 'explain' : cue.gesture, durationFor(plan, 3000)))
    if (cue.focusLabel) steps.push(step('point', `Practice: ${cue.focusLabel}`, `Fokuskan praktik pada ${cue.focusLabel}. 👉`, cue.safeSide === 'left' ? 'point-right' : 'point-left', durationFor(plan, 3000)))
  } else if (cue.type === 'summary' || stage === 'closing') {
    steps.push(step('summarize', 'Summary', 'Mari kita rangkum poin penting dari materi ini.', 'summarize', durationFor(plan, 3200)))
  } else {
    steps.push(step('explain', cue.title, plan?.note || cue.message, cue.gesture === 'greet' ? 'explain' : cue.gesture, durationFor(plan, 2800)))
    if (cue.focusLabel) {
      steps.push(step('point', `Point to ${cue.focusLabel}`, `Perhatikan ${cue.focusLabel} pada bagian ini. 👉`, cue.safeSide === 'left' ? 'point-right' : 'point-left', durationFor(plan, 3000)))
    }
  }

  if (cue.page === pageCount || stage === 'closing') {
    steps.push(step('celebrate', 'Finish', 'Materi selesai! Terima kasih, semuanya! 🎉', 'summarize', 3000))
  }

  return { page: cue.page, steps }
}

export function buildTeachingChoreography(cues: TeachingCue[], pageCount: number, plans: LessonPagePlan[] = []): PageChoreography[] {
  return cues.map(cue => buildPageChoreography(cue, pageCount, plans.find(plan => plan.page === cue.page)))
}
