import { aggregatePlanVsActual, type ClassSessionReport } from './assessment'
import type { LessonFlowConfig } from './lessonFlow'

export type RebalanceConfidence = 'low' | 'medium' | 'high'
export type RebalanceDirection = 'increase' | 'decrease'

export interface LessonRebalanceSuggestion {
  page: number
  stage: string
  currentSec: number
  suggestedSec: number
  deltaSec: number
  variancePercent: number
  sessions: number
  confidence: RebalanceConfidence
  direction: RebalanceDirection
  reason: string
}

const roundToFive = (seconds: number) => Math.max(5, Math.round(seconds / 5) * 5)

function confidenceFor(sessions: number, variancePercent: number): RebalanceConfidence {
  if (sessions >= 4 && Math.abs(variancePercent) >= 30) return 'high'
  if (sessions >= 2) return 'medium'
  return 'low'
}

export function buildLessonRebalanceSuggestions(
  flow: LessonFlowConfig | null,
  reports: ClassSessionReport[],
): LessonRebalanceSuggestion[] {
  if (!flow || !reports.length) return []
  const analytics = aggregatePlanVsActual(reports)
  const planByPage = new Map(flow.pages.map(plan => [plan.page, plan]))

  return analytics
    .filter(item => item.sessions >= 2 && Math.abs(item.variancePercent) >= 20)
    .map(item => {
      const plan = planByPage.get(item.page)
      const currentSec = plan?.durationSec ?? item.targetSec
      // Blend current target with observed average instead of blindly copying one historical average.
      // This keeps recommendations conservative and lets the lecturer remain in control.
      const observedWeight = item.sessions >= 4 ? 0.7 : 0.55
      const blended = currentSec * (1 - observedWeight) + item.averageActualSec * observedWeight
      const suggestedSec = Math.min(1800, roundToFive(blended))
      const deltaSec = suggestedSec - currentSec
      const direction: RebalanceDirection = deltaSec >= 0 ? 'increase' : 'decrease'
      return {
        page: item.page,
        stage: plan?.stage ?? item.stage,
        currentSec,
        suggestedSec,
        deltaSec,
        variancePercent: item.variancePercent,
        sessions: item.sessions,
        confidence: confidenceFor(item.sessions, item.variancePercent),
        direction,
        reason: direction === 'increase'
          ? `Waktu aktual rata-rata ${item.averageActualSec}s melebihi target ${currentSec}s pada ${item.sessions} sesi.`
          : `Waktu aktual rata-rata ${item.averageActualSec}s lebih singkat dari target ${currentSec}s pada ${item.sessions} sesi.`,
      }
    })
    .filter(item => Math.abs(item.deltaSec) >= 5)
    .sort((a, b) => {
      const rank = { high: 3, medium: 2, low: 1 }
      return rank[b.confidence] - rank[a.confidence] || Math.abs(b.variancePercent) - Math.abs(a.variancePercent)
    })
}

export function applyLessonRebalanceSuggestion(flow: LessonFlowConfig, suggestion: LessonRebalanceSuggestion): LessonFlowConfig {
  return {
    ...flow,
    pages: flow.pages.map(plan => plan.page === suggestion.page ? { ...plan, durationSec: suggestion.suggestedSec } : plan),
  }
}

export function applyAllLessonRebalanceSuggestions(flow: LessonFlowConfig, suggestions: LessonRebalanceSuggestion[]): LessonFlowConfig {
  const suggestionByPage = new Map(suggestions.map(item => [item.page, item]))
  return {
    ...flow,
    pages: flow.pages.map(plan => {
      const suggestion = suggestionByPage.get(plan.page)
      return suggestion ? { ...plan, durationSec: suggestion.suggestedSec } : plan
    }),
  }
}
