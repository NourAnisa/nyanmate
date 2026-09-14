import type { LessonFlowConfig, LessonPagePlan, LessonStage } from './lessonFlow'

export interface CustomTeachingTemplatePage {
  stage: LessonStage
  durationSec: number
  discussionSec: number
  autoAdvanceCue: boolean
}

export interface CustomTeachingTemplate {
  id: string
  name: string
  description: string
  createdAt: string
  sourcePages: number
  pages: CustomTeachingTemplatePage[]
}

const storageKey = 'nyanmate-custom-teaching-templates-v1'

export function loadCustomTeachingTemplates(): CustomTeachingTemplate[] {
  try {
    const raw = localStorage.getItem(storageKey)
    return raw ? JSON.parse(raw) as CustomTeachingTemplate[] : []
  } catch {
    return []
  }
}

function persist(items: CustomTeachingTemplate[]) {
  localStorage.setItem(storageKey, JSON.stringify(items.slice(0, 30)))
}

export function saveFlowAsCustomTemplate(flow: LessonFlowConfig, name: string, description = ''): CustomTeachingTemplate {
  const template: CustomTeachingTemplate = {
    id: crypto.randomUUID(),
    name: name.trim() || `Template ${new Date().toLocaleDateString()}`,
    description: description.trim(),
    createdAt: new Date().toISOString(),
    sourcePages: flow.pages.length,
    pages: flow.pages.map(page => ({
      stage: page.stage,
      durationSec: page.durationSec,
      discussionSec: page.discussionSec,
      autoAdvanceCue: page.autoAdvanceCue,
    })),
  }
  persist([template, ...loadCustomTeachingTemplates()])
  return template
}

export function deleteCustomTeachingTemplate(id: string) {
  persist(loadCustomTeachingTemplates().filter(item => item.id !== id))
}

function sourceForTarget(template: CustomTeachingTemplate, index: number, targetCount: number) {
  if (!template.pages.length) return null
  if (targetCount <= 1) return template.pages[0]
  const normalized = index / Math.max(1, targetCount - 1)
  const sourceIndex = Math.min(template.pages.length - 1, Math.round(normalized * Math.max(0, template.pages.length - 1)))
  return template.pages[sourceIndex]
}

export function applyCustomTeachingTemplate(flow: LessonFlowConfig, template: CustomTeachingTemplate): LessonFlowConfig {
  const pages: LessonPagePlan[] = flow.pages.map((page, index) => {
    const source = sourceForTarget(template, index, flow.pages.length)
    if (!source) return { ...page }
    return {
      ...page,
      stage: source.stage,
      durationSec: Math.max(5, Math.min(1800, source.durationSec)),
      discussionSec: Math.max(0, Math.min(1800, source.discussionSec)),
      autoAdvanceCue: source.autoAdvanceCue,
    }
  })
  return { ...flow, pages }
}
