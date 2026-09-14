import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

export type TeachingCueType = 'title' | 'bullets' | 'chart' | 'image' | 'formula' | 'code' | 'question' | 'summary' | 'general'
export type TeachingGesture = 'greet' | 'point-left' | 'point-right' | 'think' | 'code' | 'explain' | 'summarize'
export type SafeSide = 'left' | 'right'

export interface PointTarget { x: number; y: number }

export interface TeachingCue {
  page: number
  type: TeachingCueType
  title: string
  message: string
  gesture: TeachingGesture
  textPreview: string
  safeSide: SafeSide
  pointTarget: PointTarget
  presenterNote: string
}

export interface PreparedPdf {
  name: string
  pageCount: number
  cues: TeachingCue[]
  bytes: Uint8Array
}

interface LayoutHint { safeSide: SafeSide; pointTarget: PointTarget }

type TextItemLike = {
  str?: string
  width?: number
  transform?: number[]
}

function createPresenterNote(type: TeachingCueType, preview: string) {
  const intro = type === 'title' ? 'Buka materi dengan tujuan pembelajaran.' :
    type === 'summary' ? 'Ringkas poin utama lalu buka sesi tanya jawab.' :
    type === 'question' ? 'Berhenti sejenak dan beri mahasiswa waktu untuk menjawab.' :
    type === 'code' ? 'Jelaskan alur kode dari input, proses, lalu output.' :
    type === 'formula' ? 'Jelaskan arti setiap variabel sebelum masuk ke perhitungan.' :
    type === 'chart' || type === 'image' ? 'Arahkan perhatian ke pola atau bagian visual yang paling penting.' :
    type === 'bullets' ? 'Jelaskan poin satu per satu, jangan dibaca sekaligus.' :
    'Tekankan satu gagasan utama dari halaman ini.'
  return preview ? `${intro}\n\nKonteks: ${preview.slice(0, 220)}` : intro
}

function classifyPage(text: string, page: number, pageCount: number, layout: LayoutHint): TeachingCue {
  const clean = text.replace(/\s+/g, ' ').trim()
  const lower = clean.toLowerCase()
  const preview = clean.slice(0, 180)
  let type: TeachingCueType = 'general'
  let title = 'Explanation'
  let message = 'Continue explaining this page and highlight the main idea.'
  let gesture: TeachingGesture = layout.safeSide === 'left' ? 'point-right' : 'point-left'

  if (page === 1) {
    type = 'title'; title = 'Opening'; message = 'Opening slide — greet the class and introduce the topic.'; gesture = 'greet'
  } else if (page === pageCount || /kesimpulan|conclusion|summary|ringkasan/.test(lower)) {
    type = 'summary'; title = 'Summary'; message = 'Closing section — summarize the key ideas and invite questions.'; gesture = 'summarize'
  } else if (/\?|pertanyaan|question|diskusi|discussion/.test(lower)) {
    type = 'question'; title = 'Question / discussion'; message = 'Pause here and ask the class a question.'; gesture = 'think'
  } else if (/function |const |let |class |import |select |from |public static|def |print\(/i.test(clean)) {
    type = 'code'; title = 'Code'; message = 'Code detected — explain the logic step by step.'; gesture = 'code'
  } else if (/∑|√|=|equation|formula|persamaan|softmax|loss|akurasi|precision|recall/.test(lower)) {
    type = 'formula'; title = 'Formula / metric'; message = 'Formula or metric detected — point to the important terms while explaining.'
  } else if (/grafik|chart|diagram|figure|gambar|tabel|table|akurasi|dataset/.test(lower)) {
    type = 'chart'; title = 'Visual / chart'; message = 'Visual content detected — point to the figure and explain the pattern.'
  } else if ((clean.match(/[•●▪-]/g)?.length ?? 0) >= 3 || clean.length > 500) {
    type = 'bullets'; title = 'Key points'; message = 'Key points detected — explain them one by one.'; gesture = 'explain'
  }

  return {
    page, type, title, message, gesture, textPreview: preview,
    safeSide: layout.safeSide,
    pointTarget: layout.pointTarget,
    presenterNote: createPresenterNote(type, preview),
  }
}

function analyzeLayout(items: TextItemLike[], width: number, height: number): LayoutHint {
  let leftWeight = 0
  let rightWeight = 0
  let bestScore = -1
  let targetX = width / 2
  let targetY = height / 2

  for (const item of items) {
    const text = item.str?.trim() ?? ''
    if (!text || !item.transform) continue
    const x = Number(item.transform[4] ?? width / 2)
    const y = Number(item.transform[5] ?? height / 2)
    const itemWidth = Number(item.width ?? 0)
    const score = Math.max(1, text.length) * Math.max(1, itemWidth)
    if (x < width / 2) leftWeight += score
    else rightWeight += score
    if (score > bestScore) {
      bestScore = score
      targetX = x + itemWidth / 2
      targetY = y
    }
  }

  return {
    safeSide: leftWeight <= rightWeight ? 'left' : 'right',
    pointTarget: {
      x: Math.max(.08, Math.min(.92, targetX / Math.max(width, 1))),
      y: Math.max(.08, Math.min(.92, 1 - targetY / Math.max(height, 1))),
    },
  }
}

export async function preparePdf(file: File): Promise<PreparedPdf> {
  const source = new Uint8Array(await file.arrayBuffer())
  const renderBytes = source.slice()
  const pdf = await pdfjsLib.getDocument({ data: source }).promise
  const cues: TeachingCue[] = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const viewport = page.getViewport({ scale: 1 })
    const content = await page.getTextContent()
    const items = content.items as TextItemLike[]
    const text = items.map((item) => item.str ?? '').join(' ')
    const layout = analyzeLayout(items, viewport.width, viewport.height)
    cues.push(classifyPage(text, pageNumber, pdf.numPages, layout))
  }

  return { name: file.name.replace(/\.pdf$/i, ''), pageCount: pdf.numPages, cues, bytes: renderBytes }
}
