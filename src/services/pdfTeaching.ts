import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

export type TeachingCueType =
  | 'title'
  | 'bullets'
  | 'chart'
  | 'image'
  | 'formula'
  | 'code'
  | 'question'
  | 'summary'
  | 'general'

export interface TeachingCue {
  page: number
  type: TeachingCueType
  title: string
  message: string
  gesture: 'greet' | 'point-left' | 'point-right' | 'think' | 'code' | 'explain' | 'summarize'
  textPreview: string
}

export interface PreparedPdf {
  name: string
  pageCount: number
  cues: TeachingCue[]
}

function classifyPage(text: string, page: number, pageCount: number): TeachingCue {
  const clean = text.replace(/\s+/g, ' ').trim()
  const lower = clean.toLowerCase()
  const preview = clean.slice(0, 180)

  if (page === 1) {
    return {
      page,
      type: 'title',
      title: 'Opening',
      message: 'Opening slide — greet the class and introduce the topic.',
      gesture: 'greet',
      textPreview: preview,
    }
  }

  if (page === pageCount || /kesimpulan|conclusion|summary|ringkasan/.test(lower)) {
    return {
      page,
      type: 'summary',
      title: 'Summary',
      message: 'Closing section — summarize the key ideas and invite questions.',
      gesture: 'summarize',
      textPreview: preview,
    }
  }

  if (/\?|pertanyaan|question|diskusi|discussion/.test(lower)) {
    return {
      page,
      type: 'question',
      title: 'Question / discussion',
      message: 'Pause here and ask the class a question.',
      gesture: 'think',
      textPreview: preview,
    }
  }

  if (/function |const |let |class |import |select |from |public static|def |print\(/i.test(clean)) {
    return {
      page,
      type: 'code',
      title: 'Code',
      message: 'Code detected — explain the logic step by step.',
      gesture: 'code',
      textPreview: preview,
    }
  }

  if (/∑|√|=|equation|formula|persamaan|softmax|loss|akurasi|precision|recall/.test(lower)) {
    return {
      page,
      type: 'formula',
      title: 'Formula / metric',
      message: 'Formula or metric detected — point to the important terms while explaining.',
      gesture: 'point-right',
      textPreview: preview,
    }
  }

  if (/grafik|chart|diagram|figure|gambar|tabel|table|akurasi|dataset/.test(lower)) {
    return {
      page,
      type: 'chart',
      title: 'Visual / chart',
      message: 'Visual content detected — point to the figure and explain the pattern.',
      gesture: page % 2 === 0 ? 'point-left' : 'point-right',
      textPreview: preview,
    }
  }

  if ((clean.match(/[•●▪-]/g)?.length ?? 0) >= 3 || clean.length > 500) {
    return {
      page,
      type: 'bullets',
      title: 'Key points',
      message: 'Key points detected — explain them one by one.',
      gesture: 'explain',
      textPreview: preview,
    }
  }

  return {
    page,
    type: 'general',
    title: 'Explanation',
    message: 'Continue explaining this page and highlight the main idea.',
    gesture: page % 2 === 0 ? 'point-left' : 'point-right',
    textPreview: preview,
  }
}

export async function preparePdf(file: File): Promise<PreparedPdf> {
  const data = new Uint8Array(await file.arrayBuffer())
  const pdf = await pdfjsLib.getDocument({ data }).promise
  const cues: TeachingCue[] = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const content = await page.getTextContent()
    const text = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
    cues.push(classifyPage(text, pageNumber, pdf.numPages))
  }

  return {
    name: file.name.replace(/\.pdf$/i, ''),
    pageCount: pdf.numPages,
    cues,
  }
}
