export type AssessmentKind = 'quiz' | 'check' | 'practice'

export interface AssessmentOption {
  id: string
  text: string
}

export interface PageAssessment {
  page: number
  kind: AssessmentKind
  question: string
  options: AssessmentOption[]
  correctOptionId: string
  countdownSec: number
  explanation: string
}

export interface AssessmentConfig {
  pdfName: string
  pages: PageAssessment[]
}

export interface AssessmentResult {
  page: number
  kind: AssessmentKind
  selectedOptionId?: string
  correct?: boolean
  revealed: boolean
  answeredAt?: string
}

export interface ClassSessionReport {
  pdfName: string
  startedAt: string
  finishedAt: string
  durationSec: number
  pagesVisited: number[]
  assessments: AssessmentResult[]
}

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-')
export const assessmentStorageKey = (pdfName: string) => `nyanmate-assessment-${slug(pdfName)}`
export const reportStorageKey = (pdfName: string) => `nyanmate-class-report-${slug(pdfName)}`

export function createDefaultAssessment(page: number, kind: AssessmentKind = 'quiz'): PageAssessment {
  return {
    page,
    kind,
    question: kind === 'practice' ? 'Apa langkah berikutnya pada praktik ini?' : 'Apa poin utama dari halaman ini?',
    options: [
      { id: 'a', text: 'Pilihan A' },
      { id: 'b', text: 'Pilihan B' },
      { id: 'c', text: 'Pilihan C' },
      { id: 'd', text: 'Pilihan D' },
    ],
    correctOptionId: 'a',
    countdownSec: 30,
    explanation: 'Jelaskan alasan jawaban yang benar setelah reveal.',
  }
}

export function loadAssessmentConfig(pdfName: string): AssessmentConfig {
  try {
    const raw = localStorage.getItem(assessmentStorageKey(pdfName))
    if (raw) return JSON.parse(raw) as AssessmentConfig
  } catch { /* ignore malformed local data */ }
  return { pdfName, pages: [] }
}

export function saveAssessmentConfig(config: AssessmentConfig) {
  localStorage.setItem(assessmentStorageKey(config.pdfName), JSON.stringify(config))
}

export function getPageAssessment(config: AssessmentConfig | null, page: number) {
  return config?.pages.find(item => item.page === page) ?? null
}

export function saveSessionReport(report: ClassSessionReport) {
  localStorage.setItem(reportStorageKey(report.pdfName), JSON.stringify(report))
}
