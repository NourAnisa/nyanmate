import type { LessonFlowConfig, LessonStage } from './lessonFlow'

export type TeachingTemplateId = 'theory' | 'practicum' | 'discussion' | 'seminar'

export interface TeachingTemplateStage {
  stage: LessonStage
  percent: number
}

export interface TeachingTemplate {
  id: TeachingTemplateId
  name: string
  description: string
  defaultMinutes: number
  stages: TeachingTemplateStage[]
}

export interface AppliedTemplateSummary {
  templateId: TeachingTemplateId
  totalMinutes: number
  stageSeconds: Array<{ stage: LessonStage; seconds: number; pages: number }>
}

export const teachingTemplates: TeachingTemplate[] = [
  {
    id: 'theory',
    name: 'Kuliah Teori',
    description: 'Porsi terbesar untuk penjelasan konsep, dengan ruang diskusi, quiz, dan penutup.',
    defaultMinutes: 100,
    stages: [
      { stage: 'opening', percent: 8 },
      { stage: 'concept', percent: 58 },
      { stage: 'discussion', percent: 12 },
      { stage: 'quiz', percent: 12 },
      { stage: 'closing', percent: 10 },
    ],
  },
  {
    id: 'practicum',
    name: 'Praktikum',
    description: 'Fokus pada demonstrasi singkat, praktik mandiri, evaluasi, dan refleksi akhir.',
    defaultMinutes: 120,
    stages: [
      { stage: 'opening', percent: 5 },
      { stage: 'concept', percent: 15 },
      { stage: 'practice', percent: 60 },
      { stage: 'evaluation', percent: 15 },
      { stage: 'closing', percent: 5 },
    ],
  },
  {
    id: 'discussion',
    name: 'Diskusi Kelompok',
    description: 'Menempatkan diskusi sebagai aktivitas utama dengan briefing, evaluasi, dan penutup.',
    defaultMinutes: 90,
    stages: [
      { stage: 'opening', percent: 8 },
      { stage: 'concept', percent: 15 },
      { stage: 'discussion', percent: 50 },
      { stage: 'evaluation', percent: 17 },
      { stage: 'closing', percent: 10 },
    ],
  },
  {
    id: 'seminar',
    name: 'Presentasi Seminar',
    description: 'Alur ringkas untuk pemaparan materi, tanya jawab, evaluasi, dan kesimpulan.',
    defaultMinutes: 60,
    stages: [
      { stage: 'opening', percent: 8 },
      { stage: 'concept', percent: 62 },
      { stage: 'discussion', percent: 15 },
      { stage: 'evaluation', percent: 10 },
      { stage: 'closing', percent: 5 },
    ],
  },
]

export function getTeachingTemplate(id: TeachingTemplateId) {
  return teachingTemplates.find(item => item.id === id) ?? teachingTemplates[0]
}

function stageForPosition(template: TeachingTemplate, index: number, count: number): LessonStage {
  if (count <= 1) return 'opening'
  if (index === 0) return 'opening'
  if (index === count - 1) return 'closing'

  const position = ((index + 0.5) / count) * 100
  let cumulative = 0
  for (const item of template.stages) {
    cumulative += item.percent
    if (position <= cumulative) return item.stage
  }
  return 'closing'
}

function distributeSeconds(totalSeconds: number, pageIndexes: number[], durations: number[]) {
  if (!pageIndexes.length) return
  const base = Math.floor(totalSeconds / pageIndexes.length)
  let remainder = totalSeconds - base * pageIndexes.length
  pageIndexes.forEach(index => {
    durations[index] = base + (remainder > 0 ? 1 : 0)
    remainder = Math.max(0, remainder - 1)
  })
}

export function applyTeachingTemplate(flow: LessonFlowConfig, template: TeachingTemplate, totalMinutes: number): { flow: LessonFlowConfig; summary: AppliedTemplateSummary } {
  const safeMinutes = Math.max(10, Math.min(360, Math.round(totalMinutes || template.defaultMinutes)))
  const totalSeconds = safeMinutes * 60
  const pages = flow.pages.map(page => ({ ...page }))
  const durations = pages.map(() => 0)

  pages.forEach((page, index) => {
    page.stage = stageForPosition(template, index, pages.length)
  })

  const stageSeconds = template.stages.map(item => ({
    stage: item.stage,
    seconds: Math.round(totalSeconds * (item.percent / 100)),
    pages: pages.filter(page => page.stage === item.stage).length,
  }))

  const assigned = stageSeconds.reduce((sum, item) => sum + item.seconds, 0)
  if (stageSeconds.length) stageSeconds[stageSeconds.length - 1].seconds += totalSeconds - assigned

  for (const stage of stageSeconds) {
    const indexes = pages.map((page, index) => page.stage === stage.stage ? index : -1).filter(index => index >= 0)
    distributeSeconds(stage.seconds, indexes, durations)
  }

  pages.forEach((page, index) => {
    page.durationSec = Math.max(5, Math.min(1800, durations[index] || Math.round(totalSeconds / Math.max(1, pages.length))))
    page.discussionSec = page.stage === 'discussion' ? Math.max(30, Math.min(900, Math.round(page.durationSec * 0.8))) : page.stage === 'quiz' ? Math.max(20, Math.min(180, Math.round(page.durationSec * 0.35))) : 0
    page.autoAdvanceCue = true
  })

  return {
    flow: { ...flow, pages },
    summary: { templateId: template.id, totalMinutes: safeMinutes, stageSeconds },
  }
}
