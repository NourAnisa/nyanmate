import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

export type TeachingCueType = 'title' | 'bullets' | 'chart' | 'image' | 'formula' | 'code' | 'question' | 'summary' | 'general'
export type TeachingGesture = 'greet' | 'point-left' | 'point-right' | 'think' | 'code' | 'explain' | 'summarize'
export type SafeSide = 'left' | 'right'
export type FocusKind = 'title' | 'text' | 'visual' | 'table' | 'formula' | 'code' | 'question' | 'summary'

export interface PointTarget { x: number; y: number }
export interface FocusRegion { x: number; y: number; width: number; height: number }

export interface TeachingCue {
  page: number
  type: TeachingCueType
  title: string
  message: string
  gesture: TeachingGesture
  textPreview: string
  safeSide: SafeSide
  pointTarget: PointTarget
  focusKind: FocusKind
  focusLabel: string
  focusRegion: FocusRegion
  confidence: number
  presenterNote: string
}

export interface PreparedPdf {
  name: string
  pageCount: number
  cues: TeachingCue[]
  bytes: Uint8Array
}

interface LayoutHint {
  safeSide: SafeSide
  pointTarget: PointTarget
  focusRegion: FocusRegion
  leftWeight: number
  rightWeight: number
}

type TextItemLike = {
  str?: string
  width?: number
  height?: number
  transform?: number[]
}

type TextBox = {
  text: string
  x: number
  y: number
  width: number
  height: number
  score: number
}

const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value))

function createPresenterNote(type: TeachingCueType, preview: string, focusLabel: string) {
  const intro = type === 'title' ? 'Buka materi dengan tujuan pembelajaran.' :
    type === 'summary' ? 'Ringkas poin utama lalu buka sesi tanya jawab.' :
    type === 'question' ? 'Berhenti sejenak dan beri mahasiswa waktu untuk menjawab.' :
    type === 'code' ? 'Jelaskan alur kode dari input, proses, lalu output.' :
    type === 'formula' ? 'Jelaskan arti setiap variabel sebelum masuk ke perhitungan.' :
    type === 'chart' || type === 'image' ? 'Arahkan perhatian ke pola atau bagian visual yang paling penting.' :
    type === 'bullets' ? 'Jelaskan poin satu per satu, jangan dibaca sekaligus.' :
    'Tekankan satu gagasan utama dari halaman ini.'
  const focus = focusLabel ? `Target pointer: ${focusLabel}.` : ''
  return [intro, focus, preview ? `Konteks: ${preview.slice(0, 220)}` : ''].filter(Boolean).join('\n\n')
}

function toBoxes(items: TextItemLike[], pageWidth: number, pageHeight: number): TextBox[] {
  const boxes: TextBox[] = []
  for (const item of items) {
    const text = item.str?.replace(/\s+/g, ' ').trim() ?? ''
    if (!text || !item.transform) continue
    const rawX = Number(item.transform[4] ?? 0)
    const rawY = Number(item.transform[5] ?? pageHeight / 2)
    const width = Math.max(Number(item.width ?? 0), text.length * 3)
    const height = Math.max(Number(item.height ?? 0), Math.abs(Number(item.transform[3] ?? 10)), 8)
    const x = clamp(rawX / Math.max(1, pageWidth))
    const y = clamp(1 - rawY / Math.max(1, pageHeight))
    const normalizedWidth = clamp(width / Math.max(1, pageWidth), .02, .92)
    const normalizedHeight = clamp(height / Math.max(1, pageHeight), .015, .18)
    boxes.push({
      text,
      x,
      y,
      width: normalizedWidth,
      height: normalizedHeight,
      score: Math.max(1, text.length) * Math.max(.02, normalizedWidth),
    })
  }
  return boxes
}

function keywordScore(text: string, patterns: RegExp[]) {
  return patterns.reduce((score, pattern) => score + (pattern.test(text) ? 1 : 0), 0)
}

function findBestFocusBox(boxes: TextBox[], type: TeachingCueType): { box: TextBox | null; label: string; confidence: number } {
  if (!boxes.length) return { box: null, label: type === 'image' ? 'visual utama' : 'area utama', confidence: .35 }

  const rules: Record<TeachingCueType, { label: string; patterns: RegExp[] }> = {
    title: { label: 'judul materi', patterns: [/judul|title|materi|topik|chapter|bab/i] },
    bullets: { label: 'poin utama', patterns: [/•|●|▪|^-|tujuan|manfaat|langkah|tahap/i] },
    chart: { label: 'diagram / tabel', patterns: [/grafik|chart|diagram|figure|gambar|tabel|table|dataset|akurasi|hasil/i] },
    image: { label: 'visual utama', patterns: [/gambar|image|photo|illustration|ilustrasi|figure/i] },
    formula: { label: 'rumus / metrik', patterns: [/=|∑|√|formula|persamaan|softmax|loss|precision|recall|akurasi/i] },
    code: { label: 'blok kode', patterns: [/function|const |let |class |import |select |from |def |print\(|public static/i] },
    question: { label: 'pertanyaan', patterns: [/\?|pertanyaan|question|diskusi|discussion/i] },
    summary: { label: 'ringkasan', patterns: [/kesimpulan|conclusion|summary|ringkasan/i] },
    general: { label: 'gagasan utama', patterns: [/konsep|definisi|proses|metode|model|sistem/i] },
  }

  const rule = rules[type]
  let winner = boxes[0]
  let winnerScore = -1
  let matchedKeywords = 0

  for (const box of boxes) {
    const matches = keywordScore(box.text, rule.patterns)
    const titleBonus = box.y < .28 ? .8 : 0
    const lengthBonus = Math.min(1.4, box.text.length / 65)
    const score = matches * 4 + box.score + titleBonus + lengthBonus
    if (score > winnerScore) {
      winner = box
      winnerScore = score
      matchedKeywords = matches
    }
  }

  return {
    box: winner,
    label: rule.label,
    confidence: clamp(.48 + matchedKeywords * .15 + Math.min(.22, winner.score / 35), .35, .95),
  }
}

function regionFromBox(box: TextBox | null, type: TeachingCueType): FocusRegion {
  if (!box) {
    if (type === 'chart' || type === 'image') return { x: .25, y: .25, width: .5, height: .5 }
    return { x: .2, y: .3, width: .6, height: .28 }
  }
  const paddingX = type === 'chart' || type === 'image' ? .08 : .035
  const paddingY = type === 'chart' || type === 'image' ? .09 : .045
  return {
    x: clamp(box.x - paddingX, .03, .9),
    y: clamp(box.y - paddingY, .03, .9),
    width: clamp(box.width + paddingX * 2, .1, .88),
    height: clamp(box.height + paddingY * 2, .08, .65),
  }
}

function focusKindFor(type: TeachingCueType): FocusKind {
  if (type === 'title') return 'title'
  if (type === 'chart') return 'table'
  if (type === 'image') return 'visual'
  if (type === 'formula') return 'formula'
  if (type === 'code') return 'code'
  if (type === 'question') return 'question'
  if (type === 'summary') return 'summary'
  return 'text'
}

function classifyType(text: string, page: number, pageCount: number, imageCount: number): TeachingCueType {
  const clean = text.replace(/\s+/g, ' ').trim()
  const lower = clean.toLowerCase()
  if (page === 1) return 'title'
  if (page === pageCount || /kesimpulan|conclusion|summary|ringkasan/.test(lower)) return 'summary'
  if (/\?|pertanyaan|question|diskusi|discussion/.test(lower)) return 'question'
  if (/function |const |let |class |import |select |from |public static|def |print\(/i.test(clean)) return 'code'
  if (/∑|√|=|equation|formula|persamaan|softmax|loss|precision|recall|f1-score|akurasi/.test(lower)) return 'formula'
  if (/grafik|chart|diagram|figure|tabel|table|dataset|confusion matrix/.test(lower)) return 'chart'
  if (imageCount > 0 && clean.length < 260) return 'image'
  if ((clean.match(/[•●▪-]/g)?.length ?? 0) >= 3 || clean.length > 500) return 'bullets'
  return 'general'
}

function cueCopy(type: TeachingCueType): { title: string; message: string; gesture?: TeachingGesture } {
  if (type === 'title') return { title: 'Opening', message: 'Opening slide — greet the class and introduce the topic.', gesture: 'greet' }
  if (type === 'summary') return { title: 'Summary', message: 'Closing section — summarize the key ideas and invite questions.', gesture: 'summarize' }
  if (type === 'question') return { title: 'Question / discussion', message: 'Pause here and ask the class a question.', gesture: 'think' }
  if (type === 'code') return { title: 'Code', message: 'Code detected — point to the relevant block and explain the logic step by step.', gesture: 'code' }
  if (type === 'formula') return { title: 'Formula / metric', message: 'Formula detected — point to the relevant expression and explain each important term.' }
  if (type === 'chart') return { title: 'Diagram / table', message: 'Structured visual detected — point to the relevant caption or data region and explain the pattern.' }
  if (type === 'image') return { title: 'Visual', message: 'Image-heavy page detected — use the pointer to anchor the explanation on the visual.' }
  if (type === 'bullets') return { title: 'Key points', message: 'Key points detected — explain them one by one.', gesture: 'explain' }
  return { title: 'Explanation', message: 'Continue explaining this page and highlight the main idea.' }
}

function analyzeLayout(items: TextItemLike[], width: number, height: number, type: TeachingCueType): LayoutHint & { focusLabel: string; confidence: number } {
  const boxes = toBoxes(items, width, height)
  let leftWeight = 0
  let rightWeight = 0
  for (const box of boxes) {
    const weight = Math.max(1, box.text.length) * Math.max(.05, box.width)
    if (box.x + box.width / 2 < .5) leftWeight += weight
    else rightWeight += weight
  }

  const focus = findBestFocusBox(boxes, type)
  const region = regionFromBox(focus.box, type)
  const target = {
    x: clamp(region.x + region.width / 2, .06, .94),
    y: clamp(region.y + region.height / 2, .06, .94),
  }

  return {
    safeSide: leftWeight <= rightWeight ? 'left' : 'right',
    pointTarget: target,
    focusRegion: region,
    leftWeight,
    rightWeight,
    focusLabel: focus.label,
    confidence: focus.confidence,
  }
}

async function countImages(page: any): Promise<number> {
  try {
    const operatorList = await page.getOperatorList()
    const ops = pdfjsLib.OPS as Record<string, number>
    const imageOps = new Set([
      ops.paintImageXObject,
      ops.paintInlineImageXObject,
      ops.paintImageMaskXObject,
      ops.paintSolidColorImageMask,
    ].filter((value): value is number => typeof value === 'number'))
    return operatorList.fnArray.reduce((count: number, fn: number) => count + (imageOps.has(fn) ? 1 : 0), 0)
  } catch {
    return 0
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
    const imageCount = await countImages(page)
    const type = classifyType(text, pageNumber, pdf.numPages, imageCount)
    const layout = analyzeLayout(items, viewport.width, viewport.height, type)
    const copy = cueCopy(type)
    const gesture: TeachingGesture = copy.gesture ?? (layout.safeSide === 'left' ? 'point-right' : 'point-left')
    const preview = text.replace(/\s+/g, ' ').trim().slice(0, 180)

    cues.push({
      page: pageNumber,
      type,
      title: copy.title,
      message: copy.message,
      gesture,
      textPreview: preview,
      safeSide: layout.safeSide,
      pointTarget: layout.pointTarget,
      focusKind: focusKindFor(type),
      focusLabel: layout.focusLabel,
      focusRegion: layout.focusRegion,
      confidence: layout.confidence,
      presenterNote: createPresenterNote(type, preview, layout.focusLabel),
    })
  }

  return { name: file.name.replace(/\.pdf$/i, ''), pageCount: pdf.numPages, cues, bytes: renderBytes }
}
