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

export interface ReportSummary {
  sessionCount: number
  totalTeachingSec: number
  averageTeachingSec: number
  totalAssessments: number
  answeredAssessments: number
  correctAssessments: number
  accuracyPercent: number | null
  uniquePagesVisited: number
}

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-')
export const assessmentStorageKey = (pdfName: string) => `nyanmate-assessment-${slug(pdfName)}`
export const reportStorageKey = (pdfName: string) => `nyanmate-class-report-${slug(pdfName)}`
export const reportHistoryStorageKey = (pdfName: string) => `nyanmate-class-report-history-${slug(pdfName)}`
export const reportIndexStorageKey = 'nyanmate-class-report-index'

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

export function loadReportHistory(pdfName: string): ClassSessionReport[] {
  try {
    const history = localStorage.getItem(reportHistoryStorageKey(pdfName))
    if (history) return JSON.parse(history) as ClassSessionReport[]
    const legacy = localStorage.getItem(reportStorageKey(pdfName))
    return legacy ? [JSON.parse(legacy) as ClassSessionReport] : []
  } catch {
    return []
  }
}

export function loadReportIndex(): string[] {
  try {
    const raw = localStorage.getItem(reportIndexStorageKey)
    return raw ? JSON.parse(raw) as string[] : []
  } catch {
    return []
  }
}

export function saveSessionReport(report: ClassSessionReport) {
  localStorage.setItem(reportStorageKey(report.pdfName), JSON.stringify(report))
  const history = loadReportHistory(report.pdfName)
  history.unshift(report)
  localStorage.setItem(reportHistoryStorageKey(report.pdfName), JSON.stringify(history.slice(0, 100)))
  const index = loadReportIndex().filter(name => name !== report.pdfName)
  index.unshift(report.pdfName)
  localStorage.setItem(reportIndexStorageKey, JSON.stringify(index.slice(0, 50)))
}

export function summarizeReports(reports: ClassSessionReport[]): ReportSummary {
  const assessments = reports.flatMap(report => report.assessments)
  const answered = assessments.filter(item => item.selectedOptionId)
  const correct = answered.filter(item => item.correct === true)
  const pages = new Set(reports.flatMap(report => report.pagesVisited))
  const totalTeachingSec = reports.reduce((sum, report) => sum + Math.max(0, report.durationSec), 0)
  return {
    sessionCount: reports.length,
    totalTeachingSec,
    averageTeachingSec: reports.length ? Math.round(totalTeachingSec / reports.length) : 0,
    totalAssessments: assessments.length,
    answeredAssessments: answered.length,
    correctAssessments: correct.length,
    accuracyPercent: answered.length ? Math.round((correct.length / answered.length) * 100) : null,
    uniquePagesVisited: pages.size,
  }
}

export function reportsToCsv(reports: ClassSessionReport[]): string {
  const header = ['pdfName','startedAt','finishedAt','durationSec','pagesVisited','assessmentPage','assessmentKind','selectedOptionId','correct','revealed','answeredAt']
  const rows: string[][] = [header]
  const quote = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`
  for (const report of reports) {
    if (!report.assessments.length) {
      rows.push([report.pdfName, report.startedAt, report.finishedAt, String(report.durationSec), report.pagesVisited.join('|'), '', '', '', '', '', ''])
      continue
    }
    for (const result of report.assessments) {
      rows.push([
        report.pdfName, report.startedAt, report.finishedAt, String(report.durationSec), report.pagesVisited.join('|'),
        String(result.page), result.kind, result.selectedOptionId ?? '', result.correct == null ? '' : String(result.correct), String(result.revealed), result.answeredAt ?? '',
      ])
    }
  }
  return rows.map(row => row.map(quote).join(',')).join('\n')
}
