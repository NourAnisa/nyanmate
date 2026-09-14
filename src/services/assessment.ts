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

export interface PageTiming {
  page: number
  stage: string
  seconds: number
  visits: number
}

export interface StageTiming {
  stage: string
  seconds: number
}

export interface PlannedPageTiming {
  page: number
  stage: string
  targetSec: number
}

export interface DiscussionEvent {
  page: number
  stage: string
  startedAt: string
  plannedSec: number
}

export interface ClassSessionReport {
  pdfName: string
  startedAt: string
  finishedAt: string
  durationSec: number
  pagesVisited: number[]
  assessments: AssessmentResult[]
  pageTimings?: PageTiming[]
  stageTimings?: StageTiming[]
  plannedPageTimings?: PlannedPageTiming[]
  discussionEvents?: DiscussionEvent[]
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

export interface PageAnalytics {
  page: number
  stage: string
  totalSec: number
  averageSec: number
  totalVisits: number
  sessions: number
}

export interface StageAnalytics {
  stage: string
  totalSec: number
  averageSec: number
  sessions: number
}

export interface PlanActualAnalytics {
  page: number
  stage: string
  targetSec: number
  averageActualSec: number
  varianceSec: number
  variancePercent: number
  sessions: number
  status: 'under' | 'on-target' | 'over'
}

export interface DiscussionAnalytics {
  page: number
  stage: string
  count: number
  sessions: number
  averagePlannedSec: number
}

export type TeachingInsightKind = 'pace' | 'stage' | 'assessment' | 'coverage' | 'trend' | 'positive' | 'plan' | 'discussion'
export type TeachingInsightSeverity = 'info' | 'watch' | 'action'

export interface TeachingInsight {
  id: string
  kind: TeachingInsightKind
  severity: TeachingInsightSeverity
  title: string
  detail: string
  recommendation: string
  page?: number
  stage?: string
  metric?: string
}

export interface TeachingReflection {
  headline: string
  summary: string
  strengths: string[]
  actions: string[]
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

export function aggregatePageAnalytics(reports: ClassSessionReport[]): PageAnalytics[] {
  const map = new Map<number, { stage: string; totalSec: number; totalVisits: number; sessions: Set<number> }>()
  reports.forEach((report, sessionIndex) => {
    for (const item of report.pageTimings ?? []) {
      const entry = map.get(item.page) ?? { stage: item.stage || 'concept', totalSec: 0, totalVisits: 0, sessions: new Set<number>() }
      entry.stage = item.stage || entry.stage
      entry.totalSec += Math.max(0, item.seconds)
      entry.totalVisits += Math.max(1, item.visits || 1)
      entry.sessions.add(sessionIndex)
      map.set(item.page, entry)
    }
  })
  return [...map.entries()]
    .map(([page, entry]) => ({
      page,
      stage: entry.stage,
      totalSec: entry.totalSec,
      averageSec: entry.sessions.size ? Math.round(entry.totalSec / entry.sessions.size) : 0,
      totalVisits: entry.totalVisits,
      sessions: entry.sessions.size,
    }))
    .sort((a, b) => a.page - b.page)
}

export function aggregateStageAnalytics(reports: ClassSessionReport[]): StageAnalytics[] {
  const map = new Map<string, { totalSec: number; sessions: Set<number> }>()
  reports.forEach((report, sessionIndex) => {
    const stageEntries = report.stageTimings?.length
      ? report.stageTimings
      : (report.pageTimings ?? []).reduce<StageTiming[]>((acc, item) => {
          const found = acc.find(stage => stage.stage === item.stage)
          if (found) found.seconds += item.seconds
          else acc.push({ stage: item.stage || 'concept', seconds: item.seconds })
          return acc
        }, [])
    for (const item of stageEntries) {
      const entry = map.get(item.stage) ?? { totalSec: 0, sessions: new Set<number>() }
      entry.totalSec += Math.max(0, item.seconds)
      entry.sessions.add(sessionIndex)
      map.set(item.stage, entry)
    }
  })
  return [...map.entries()]
    .map(([stage, entry]) => ({
      stage,
      totalSec: entry.totalSec,
      averageSec: entry.sessions.size ? Math.round(entry.totalSec / entry.sessions.size) : 0,
      sessions: entry.sessions.size,
    }))
    .sort((a, b) => b.totalSec - a.totalSec)
}

export function aggregatePlanVsActual(reports: ClassSessionReport[]): PlanActualAnalytics[] {
  const map = new Map<number, { stage: string; target: number; actual: number; sessions: number }>()
  for (const report of reports) {
    const actualByPage = new Map((report.pageTimings ?? []).map(item => [item.page, item]))
    for (const planned of report.plannedPageTimings ?? []) {
      const actual = actualByPage.get(planned.page)
      if (!actual) continue
      const entry = map.get(planned.page) ?? { stage: planned.stage, target: 0, actual: 0, sessions: 0 }
      entry.stage = planned.stage || entry.stage
      entry.target += Math.max(1, planned.targetSec)
      entry.actual += Math.max(0, actual.seconds)
      entry.sessions += 1
      map.set(planned.page, entry)
    }
  }
  return [...map.entries()].map(([page, entry]) => {
    const targetSec = Math.round(entry.target / Math.max(1, entry.sessions))
    const averageActualSec = Math.round(entry.actual / Math.max(1, entry.sessions))
    const varianceSec = averageActualSec - targetSec
    const variancePercent = targetSec ? Math.round((varianceSec / targetSec) * 100) : 0
    return {
      page,
      stage: entry.stage,
      targetSec,
      averageActualSec,
      varianceSec,
      variancePercent,
      sessions: entry.sessions,
      status: variancePercent >= 20 ? 'over' : variancePercent <= -20 ? 'under' : 'on-target',
    }
  }).sort((a, b) => Math.abs(b.variancePercent) - Math.abs(a.variancePercent))
}

export function aggregateDiscussionAnalytics(reports: ClassSessionReport[]): DiscussionAnalytics[] {
  const map = new Map<number, { stage: string; count: number; planned: number; sessions: Set<number> }>()
  reports.forEach((report, sessionIndex) => {
    for (const event of report.discussionEvents ?? []) {
      const entry = map.get(event.page) ?? { stage: event.stage || 'discussion', count: 0, planned: 0, sessions: new Set<number>() }
      entry.stage = event.stage || entry.stage
      entry.count += 1
      entry.planned += Math.max(0, event.plannedSec)
      entry.sessions.add(sessionIndex)
      map.set(event.page, entry)
    }
  })
  return [...map.entries()].map(([page, entry]) => ({
    page,
    stage: entry.stage,
    count: entry.count,
    sessions: entry.sessions.size,
    averagePlannedSec: entry.count ? Math.round(entry.planned / entry.count) : 0,
  })).sort((a, b) => b.count - a.count || a.page - b.page)
}

function median(values: number[]) {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : Math.round((sorted[middle - 1] + sorted[middle]) / 2)
}

function formatShort(seconds: number) {
  if (seconds < 60) return `${seconds}s`
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
}

export function generateTeachingInsights(reports: ClassSessionReport[]): TeachingInsight[] {
  if (!reports.length) return []
  const insights: TeachingInsight[] = []
  const pages = aggregatePageAnalytics(reports)
  const stages = aggregateStageAnalytics(reports)
  const planActual = aggregatePlanVsActual(reports)
  const discussions = aggregateDiscussionAnalytics(reports)
  const baseline = median(pages.filter(item => item.sessions >= Math.min(2, reports.length)).map(item => item.averageSec).filter(Boolean))

  const repeatedOver = planActual.filter(item => item.sessions >= Math.min(2, reports.length) && item.variancePercent >= 25).slice(0, 3)
  for (const item of repeatedOver) {
    insights.push({
      id: `plan-over-${item.page}`,
      kind: 'plan',
      severity: item.variancePercent >= 60 ? 'action' : 'watch',
      title: `Halaman ${item.page} konsisten melewati target`,
      detail: `Target rata-rata ${formatShort(item.targetSec)}, aktual ${formatShort(item.averageActualSec)} (${item.variancePercent > 0 ? '+' : ''}${item.variancePercent}%).`,
      recommendation: `Naikkan target waktu halaman ${item.page} atau ringkas materi agar Lesson Flow lebih realistis.`,
      page: item.page,
      stage: item.stage,
      metric: `+${item.variancePercent}%`,
    })
  }

  const repeatedUnder = planActual.filter(item => item.sessions >= Math.min(2, reports.length) && item.variancePercent <= -35).slice(0, 2)
  for (const item of repeatedUnder) {
    insights.push({
      id: `plan-under-${item.page}`,
      kind: 'plan',
      severity: 'info',
      title: `Halaman ${item.page} lebih cepat dari rencana`,
      detail: `Aktual ${formatShort(item.averageActualSec)} dibanding target ${formatShort(item.targetSec)} (${item.variancePercent}%).`,
      recommendation: 'Gunakan waktu sisa untuk contoh, pertanyaan pemantik, atau kurangi target durasi agar rencana lebih presisi.',
      page: item.page,
      stage: item.stage,
      metric: `${item.variancePercent}%`,
    })
  }

  const frequentDiscussion = discussions.find(item => item.sessions >= 2 && item.count >= Math.max(2, item.sessions))
  if (frequentDiscussion) {
    insights.push({
      id: `discussion-${frequentDiscussion.page}`,
      kind: 'discussion',
      severity: 'info',
      title: `Halaman ${frequentDiscussion.page} sering memicu diskusi`,
      detail: `${frequentDiscussion.count} diskusi tercatat pada ${frequentDiscussion.sessions} sesi, dengan rencana rata-rata ${formatShort(frequentDiscussion.averagePlannedSec)}.`,
      recommendation: 'Pertimbangkan menjadikan diskusi di halaman ini sebagai aktivitas eksplisit dalam Lesson Flow.',
      page: frequentDiscussion.page,
      stage: frequentDiscussion.stage,
      metric: `${frequentDiscussion.count} diskusi`,
    })
  }

  if (baseline > 0) {
    const slow = pages
      .filter(item => item.averageSec >= Math.max(45, baseline * 1.7) && item.sessions >= Math.min(2, reports.length))
      .sort((a, b) => b.averageSec - a.averageSec)
      .slice(0, 2)
    for (const item of slow) {
      const ratio = Math.round((item.averageSec / baseline) * 10) / 10
      insights.push({
        id: `pace-slow-${item.page}`,
        kind: 'pace',
        severity: ratio >= 2 ? 'action' : 'watch',
        title: `Halaman ${item.page} membutuhkan waktu lebih lama`,
        detail: `Rata-rata ${formatShort(item.averageSec)}, sekitar ${ratio}× dibanding median halaman ${formatShort(baseline)}.`,
        recommendation: `Periksa kepadatan materi halaman ${item.page}; pertimbangkan membagi penjelasan atau menambah contoh singkat.`,
        page: item.page,
        stage: item.stage,
        metric: `${ratio}× median`,
      })
    }
  }

  if (stages.length) {
    const total = stages.reduce((sum, item) => sum + item.totalSec, 0)
    const top = stages[0]
    const share = total ? Math.round((top.totalSec / total) * 100) : 0
    if (share >= 35) {
      insights.push({
        id: `stage-${top.stage}`,
        kind: 'stage',
        severity: share >= 50 ? 'watch' : 'info',
        title: `Stage ${top.stage} paling dominan`,
        detail: `${share}% waktu terukur berada pada stage ${top.stage} (${formatShort(top.totalSec)} total).`,
        recommendation: share >= 50 ? 'Cek apakah proporsi ini sesuai tujuan pembelajaran atau perlu diseimbangkan dengan aktivitas lain.' : 'Pertahankan jika stage ini memang menjadi fokus utama materi.',
        stage: top.stage,
        metric: `${share}% waktu`,
      })
    }
  }

  const pageAssessment = new Map<number, { answered: number; correct: number; attempts: number }>()
  for (const report of reports) {
    for (const result of report.assessments) {
      const item = pageAssessment.get(result.page) ?? { answered: 0, correct: 0, attempts: 0 }
      item.attempts += 1
      if (result.selectedOptionId) {
        item.answered += 1
        if (result.correct === true) item.correct += 1
      }
      pageAssessment.set(result.page, item)
    }
  }
  for (const [page, item] of [...pageAssessment.entries()].sort((a, b) => b[1].answered - a[1].answered)) {
    if (item.answered < 2) continue
    const accuracy = Math.round((item.correct / item.answered) * 100)
    if (accuracy <= 60) {
      insights.push({
        id: `assessment-${page}`,
        kind: 'assessment',
        severity: accuracy < 40 ? 'action' : 'watch',
        title: `Assessment halaman ${page} sering kurang tepat`,
        detail: `Akurasi tercatat ${accuracy}% dari ${item.answered} jawaban yang direkam.`,
        recommendation: `Tinjau kembali penjelasan sebelum assessment halaman ${page}, distraktor jawaban, dan kejelasan pertanyaannya.`,
        page,
        metric: `${accuracy}% akurasi`,
      })
    } else if (accuracy >= 85 && item.answered >= 3) {
      insights.push({
        id: `assessment-positive-${page}`,
        kind: 'positive',
        severity: 'info',
        title: `Pemahaman di halaman ${page} terlihat kuat`,
        detail: `Akurasi assessment mencapai ${accuracy}% dari ${item.answered} jawaban.`,
        recommendation: 'Pertahankan pola penjelasan atau aktivitas yang digunakan sebelum assessment ini.',
        page,
        metric: `${accuracy}% akurasi`,
      })
    }
  }

  if (reports.length >= 2) {
    const latest = reports[0].durationSec
    const previous = reports.slice(1, 4)
    const previousAvg = Math.round(previous.reduce((sum, report) => sum + report.durationSec, 0) / previous.length)
    if (previousAvg > 0) {
      const change = Math.round(((latest - previousAvg) / previousAvg) * 100)
      if (Math.abs(change) >= 20) {
        insights.push({
          id: 'duration-trend',
          kind: 'trend',
          severity: Math.abs(change) >= 35 ? 'watch' : 'info',
          title: change > 0 ? 'Sesi terbaru lebih panjang dari biasanya' : 'Sesi terbaru lebih singkat dari biasanya',
          detail: `Durasi terbaru ${formatShort(latest)}, ${Math.abs(change)}% ${change > 0 ? 'lebih lama' : 'lebih cepat'} dibanding rata-rata ${previous.length} sesi sebelumnya.`,
          recommendation: 'Bandingkan page analytics untuk melihat bagian mana yang paling berubah sebelum mengubah pacing.',
          metric: `${change > 0 ? '+' : ''}${change}%`,
        })
      }
    }
  }

  const latest = reports[0]
  const historicalPages = new Set(reports.flatMap(report => report.pagesVisited))
  if (historicalPages.size >= 5 && latest.pagesVisited.length < historicalPages.size * 0.7) {
    insights.push({
      id: 'coverage-latest',
      kind: 'coverage',
      severity: 'watch',
      title: 'Cakupan sesi terbaru lebih rendah',
      detail: `Sesi terbaru mengunjungi ${latest.pagesVisited.length} dari ${historicalPages.size} halaman yang pernah digunakan pada materi ini.`,
      recommendation: 'Pastikan halaman yang dilewati memang disengaja, bukan karena waktu kelas habis.',
      metric: `${latest.pagesVisited.length}/${historicalPages.size} halaman`,
    })
  }

  return insights.slice(0, 10)
}

export function buildTeachingReflection(reports: ClassSessionReport[]): TeachingReflection {
  if (!reports.length) return { headline: 'Belum ada data refleksi', summary: 'Selesaikan sesi mengajar untuk menghasilkan insight otomatis.', strengths: [], actions: [] }
  const summary = summarizeReports(reports)
  const insights = generateTeachingInsights(reports)
  const strengths = insights.filter(item => item.kind === 'positive').map(item => item.title)
  const onTarget = aggregatePlanVsActual(reports).filter(item => item.status === 'on-target').length
  if (onTarget >= 3) strengths.unshift(`${onTarget} halaman berjalan mendekati target waktu Lesson Flow`)
  if (summary.accuracyPercent != null && summary.accuracyPercent >= 80) strengths.unshift(`Akurasi assessment keseluruhan ${summary.accuracyPercent}%`)
  if (!strengths.length && reports.length >= 2) strengths.push('Data lintas sesi sudah cukup untuk mulai membandingkan pola pacing secara konsisten.')

  const actions = insights
    .filter(item => item.severity === 'action' || item.severity === 'watch')
    .map(item => item.recommendation)
    .filter((value, index, array) => array.indexOf(value) === index)
    .slice(0, 4)

  const latest = reports[0]
  const headline = actions.length ? 'Ada beberapa bagian yang layak ditinjau sebelum kelas berikutnya.' : 'Pacing kelas terlihat cukup stabil dari data yang tersedia.'
  const summaryText = `NyanMate menganalisis ${reports.length} sesi, ${summary.uniquePagesVisited} halaman unik, dan ${summary.totalAssessments} assessment. Sesi terbaru berlangsung ${formatShort(latest.durationSec)}.`
  return { headline, summary: summaryText, strengths: strengths.slice(0, 3), actions }
}

export function reportsToCsv(reports: ClassSessionReport[]): string {
  const header = ['pdfName','startedAt','finishedAt','durationSec','pagesVisited','pageTimings','stageTimings','plannedPageTimings','discussionEvents','assessmentPage','assessmentKind','selectedOptionId','correct','revealed','answeredAt']
  const rows: string[][] = [header]
  const quote = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`
  const pageTimingsText = (report: ClassSessionReport) => (report.pageTimings ?? []).map(item => `${item.page}:${item.stage}:${item.seconds}s:${item.visits}v`).join('|')
  const stageTimingsText = (report: ClassSessionReport) => (report.stageTimings ?? []).map(item => `${item.stage}:${item.seconds}s`).join('|')
  const plannedText = (report: ClassSessionReport) => (report.plannedPageTimings ?? []).map(item => `${item.page}:${item.stage}:${item.targetSec}s`).join('|')
  const discussionText = (report: ClassSessionReport) => (report.discussionEvents ?? []).map(item => `${item.page}:${item.stage}:${item.plannedSec}s:${item.startedAt}`).join('|')
  for (const report of reports) {
    if (!report.assessments.length) {
      rows.push([report.pdfName, report.startedAt, report.finishedAt, String(report.durationSec), report.pagesVisited.join('|'), pageTimingsText(report), stageTimingsText(report), plannedText(report), discussionText(report), '', '', '', '', '', ''])
      continue
    }
    for (const result of report.assessments) {
      rows.push([
        report.pdfName, report.startedAt, report.finishedAt, String(report.durationSec), report.pagesVisited.join('|'), pageTimingsText(report), stageTimingsText(report), plannedText(report), discussionText(report),
        String(result.page), result.kind, result.selectedOptionId ?? '', result.correct == null ? '' : String(result.correct), String(result.revealed), result.answeredAt ?? '',
      ])
    }
  }
  return rows.map(row => row.map(quote).join(',')).join('\n')
}
