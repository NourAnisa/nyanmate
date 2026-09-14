<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  aggregatePageAnalytics,
  aggregateStageAnalytics,
  loadReportHistory,
  loadReportIndex,
  reportsToCsv,
  summarizeReports,
  type ClassSessionReport,
} from '../services/assessment'

const props = defineProps<{ pdfName?: string | null }>()

const availablePdfs = ref<string[]>([])
const selectedPdf = ref('')
const reports = ref<ClassSessionReport[]>([])
const selectedIndex = ref(0)

const activePdf = computed(() => props.pdfName || selectedPdf.value)
const summary = computed(() => summarizeReports(reports.value))
const pageAnalytics = computed(() => aggregatePageAnalytics(reports.value))
const stageAnalytics = computed(() => aggregateStageAnalytics(reports.value))
const selectedReport = computed(() => reports.value[selectedIndex.value] ?? null)
const maxPageAverage = computed(() => Math.max(1, ...pageAnalytics.value.map(item => item.averageSec)))
const maxStageTotal = computed(() => Math.max(1, ...stageAnalytics.value.map(item => item.totalSec)))
const durationText = (seconds: number) => `${Math.floor(seconds / 60)}m ${seconds % 60}s`

function load() {
  availablePdfs.value = loadReportIndex()
  if (props.pdfName) selectedPdf.value = props.pdfName
  else if (!selectedPdf.value && availablePdfs.value.length) selectedPdf.value = availablePdfs.value[0]
  reports.value = activePdf.value ? loadReportHistory(activePdf.value) : []
  selectedIndex.value = 0
}

function reloadForSelection() {
  reports.value = selectedPdf.value ? loadReportHistory(selectedPdf.value) : []
  selectedIndex.value = 0
}

function downloadCsv() {
  if (!reports.value.length || !activePdf.value) return
  const blob = new Blob([reportsToCsv(reports.value)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${activePdf.value.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-class-report.csv`
  link.click()
  URL.revokeObjectURL(url)
}

function printReport() { window.print() }

watch(() => props.pdfName, load, { immediate: true })
</script>

<template>
  <main class="report-window">
    <section class="report-dashboard">
      <div class="report-dashboard-head">
        <div>
          <small>📊 NyanMate Teaching Analytics</small>
          <h3>{{ activePdf || 'No class reports yet' }}</h3>
        </div>
        <div class="report-actions">
          <button :disabled="!reports.length" @click="downloadCsv">Export CSV</button>
          <button :disabled="!reports.length" @click="printReport">Print / Save PDF</button>
        </div>
      </div>

      <label v-if="!props.pdfName && availablePdfs.length" class="report-material-picker">
        Materi
        <select v-model="selectedPdf" @change="reloadForSelection">
          <option v-for="name in availablePdfs" :key="name" :value="name">{{ name }}</option>
        </select>
      </label>

      <p v-if="!reports.length" class="report-empty">Belum ada laporan kelas tersimpan. Selesaikan satu sesi presentasi agar NyanMate membuat laporan otomatis.</p>

      <template v-else>
        <div class="report-summary-grid">
          <article><small>Sesi</small><strong>{{ summary.sessionCount }}</strong></article>
          <article><small>Total mengajar</small><strong>{{ durationText(summary.totalTeachingSec) }}</strong></article>
          <article><small>Rata-rata</small><strong>{{ durationText(summary.averageTeachingSec) }}</strong></article>
          <article><small>Halaman unik</small><strong>{{ summary.uniquePagesVisited }}</strong></article>
          <article><small>Assessment</small><strong>{{ summary.totalAssessments }}</strong></article>
          <article><small>Akurasi</small><strong>{{ summary.accuracyPercent == null ? '—' : `${summary.accuracyPercent}%` }}</strong></article>
        </div>

        <section class="analytics-section" v-if="pageAnalytics.length">
          <div class="analytics-head"><div><small>⏱ Page analytics</small><h4>Waktu rata-rata per halaman</h4></div><span>{{ pageAnalytics.length }} pages tracked</span></div>
          <div class="analytics-page-list">
            <article v-for="item in pageAnalytics" :key="item.page" class="analytics-row">
              <div class="analytics-row-title"><strong>Page {{ item.page }}</strong><small>{{ item.stage }} · {{ item.sessions }} session · {{ item.totalVisits }} visit</small></div>
              <div class="analytics-bar"><i :style="{ width: `${Math.max(4, (item.averageSec / maxPageAverage) * 100)}%` }"></i></div>
              <b>{{ durationText(item.averageSec) }}</b>
            </article>
          </div>
        </section>

        <section class="analytics-section" v-if="stageAnalytics.length">
          <div class="analytics-head"><div><small>🧭 Lesson-stage analytics</small><h4>Distribusi waktu mengajar</h4></div></div>
          <div class="analytics-stage-grid">
            <article v-for="item in stageAnalytics" :key="item.stage">
              <div><strong>{{ item.stage }}</strong><span>{{ durationText(item.totalSec) }}</span></div>
              <div class="analytics-bar"><i :style="{ width: `${Math.max(5, (item.totalSec / maxStageTotal) * 100)}%` }"></i></div>
              <small>avg {{ durationText(item.averageSec) }} · {{ item.sessions }} session</small>
            </article>
          </div>
        </section>

        <div class="report-session-picker">
          <label>Sesi
            <select v-model.number="selectedIndex">
              <option v-for="(report, index) in reports" :key="report.startedAt + index" :value="index">
                {{ new Date(report.startedAt).toLocaleString() }} · {{ durationText(report.durationSec) }}
              </option>
            </select>
          </label>
        </div>

        <article v-if="selectedReport" class="report-detail printable-report">
          <header>
            <div><small>Session report</small><h4>{{ selectedReport.pdfName }}</h4></div>
            <strong>{{ durationText(selectedReport.durationSec) }}</strong>
          </header>
          <div class="report-meta">
            <span><small>Started</small>{{ new Date(selectedReport.startedAt).toLocaleString() }}</span>
            <span><small>Finished</small>{{ new Date(selectedReport.finishedAt).toLocaleString() }}</span>
            <span><small>Pages visited</small>{{ selectedReport.pagesVisited.join(', ') || '—' }}</span>
          </div>

          <div class="report-page-coverage" v-if="selectedReport.pagesVisited.length">
            <span v-for="page in selectedReport.pagesVisited" :key="page">{{ page }}</span>
          </div>

          <div v-if="selectedReport.pageTimings?.length" class="session-timing-table">
            <h4>Time per page</h4>
            <div v-for="item in selectedReport.pageTimings" :key="item.page" class="session-timing-row">
              <strong>Page {{ item.page }}</strong><span>{{ item.stage }}</span><b>{{ durationText(item.seconds) }}</b><small>{{ item.visits }} visit{{ item.visits === 1 ? '' : 's' }}</small>
            </div>
          </div>

          <div v-if="selectedReport.stageTimings?.length" class="session-timing-table">
            <h4>Time per stage</h4>
            <div v-for="item in selectedReport.stageTimings" :key="item.stage" class="session-timing-row stage-row">
              <strong>{{ item.stage }}</strong><b>{{ durationText(item.seconds) }}</b>
            </div>
          </div>

          <div class="report-assessment-list">
            <h4>Assessment recap</h4>
            <p v-if="!selectedReport.assessments.length">Tidak ada assessment pada sesi ini.</p>
            <div v-for="(item, index) in selectedReport.assessments" :key="`${item.page}-${index}`" class="report-assessment-row">
              <div><strong>Page {{ item.page }} · {{ item.kind }}</strong><small>{{ item.answeredAt ? new Date(item.answeredAt).toLocaleTimeString() : 'No answer recorded' }}</small></div>
              <span v-if="item.correct === true" class="correct">✓ Correct</span>
              <span v-else-if="item.correct === false" class="wrong">✕ Incorrect</span>
              <span v-else>—</span>
              <code>{{ item.selectedOptionId?.toUpperCase() || '—' }}</code>
              <small>{{ item.revealed ? 'Answer revealed' : 'Not revealed' }}</small>
            </div>
          </div>
        </article>
      </template>
    </section>
  </main>
</template>
