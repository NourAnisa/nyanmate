import type { AssessmentConfig } from './assessment'
import type { LessonFlowConfig, LessonStage } from './lessonFlow'

export interface RunSheetStageSummary {
  stage: LessonStage
  seconds: number
  pages: number
}

export interface TeachingRunSheet {
  totalSec: number
  totalPages: number
  stageSummary: RunSheetStageSummary[]
  assessmentPages: number[]
  discussionPages: number[]
  checkpointPages: number[]
  longPages: number[]
}

export function buildTeachingRunSheet(flow: LessonFlowConfig | null, assessment: AssessmentConfig | null): TeachingRunSheet | null {
  if (!flow?.pages.length) return null
  const byStage = new Map<LessonStage, { seconds: number; pages: number }>()
  for (const page of flow.pages) {
    const current = byStage.get(page.stage) ?? { seconds: 0, pages: 0 }
    current.seconds += Math.max(0, page.durationSec)
    current.pages += 1
    byStage.set(page.stage, current)
  }
  const assessmentPages = (assessment?.pages ?? []).map(item => item.page).sort((a, b) => a - b)
  const discussionPages = flow.pages.filter(item => item.discussionSec > 0 || item.stage === 'discussion').map(item => item.page)
  const checkpointPages = [...new Set([...assessmentPages, ...discussionPages])].sort((a, b) => a - b)
  const longThreshold = Math.max(90, Math.round(flow.pages.reduce((sum, page) => sum + page.durationSec, 0) / flow.pages.length * 1.5))
  return {
    totalSec: flow.pages.reduce((sum, page) => sum + Math.max(0, page.durationSec), 0),
    totalPages: flow.pages.length,
    stageSummary: [...byStage.entries()].map(([stage, value]) => ({ stage, ...value })).sort((a, b) => b.seconds - a.seconds),
    assessmentPages,
    discussionPages,
    checkpointPages,
    longPages: flow.pages.filter(item => item.durationSec >= longThreshold).map(item => item.page),
  }
}
