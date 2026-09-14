import type { TeachingCueType } from './pdfTeaching'

export type LessonStage = 'opening' | 'concept' | 'practice' | 'quiz' | 'discussion' | 'evaluation' | 'closing'

export interface LessonPagePlan {
  page: number
  stage: LessonStage
  durationSec: number
  discussionSec: number
  autoAdvanceCue: boolean
  note: string
}

export interface LessonFlowConfig {
  name: string
  pages: LessonPagePlan[]
}

export const lessonStageLabels: Record<LessonStage, string> = {
  opening: 'Opening',
  concept: 'Concept',
  practice: 'Practice',
  quiz: 'Quiz',
  discussion: 'Discussion',
  evaluation: 'Evaluation',
  closing: 'Closing',
}

export function inferLessonStage(type: TeachingCueType, page: number, pageCount: number): LessonStage {
  if (page === 1 || type === 'title') return 'opening'
  if (page === pageCount || type === 'summary') return 'closing'
  if (type === 'question') return 'quiz'
  if (type === 'code') return 'practice'
  return 'concept'
}

export function createDefaultLessonFlow(name: string, cues: Array<{ page: number; type: TeachingCueType }>, pageCount: number): LessonFlowConfig {
  return {
    name,
    pages: cues.map(cue => ({
      page: cue.page,
      stage: inferLessonStage(cue.type, cue.page, pageCount),
      durationSec: cue.type === 'title' || cue.type === 'summary' ? 20 : 35,
      discussionSec: cue.type === 'question' ? 60 : 0,
      autoAdvanceCue: true,
      note: '',
    })),
  }
}

export function getLessonPagePlan(flow: LessonFlowConfig | null, page: number): LessonPagePlan | null {
  return flow?.pages.find(item => item.page === page) ?? null
}

export function lessonFlowStorageKey(pdfName: string) {
  return `nyanmate-lesson-flow-${pdfName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
}

export function loadLessonFlow(pdfName: string): LessonFlowConfig | null {
  try {
    const raw = localStorage.getItem(lessonFlowStorageKey(pdfName))
    return raw ? JSON.parse(raw) as LessonFlowConfig : null
  } catch {
    return null
  }
}

export function saveLessonFlow(pdfName: string, flow: LessonFlowConfig) {
  localStorage.setItem(lessonFlowStorageKey(pdfName), JSON.stringify(flow))
}
