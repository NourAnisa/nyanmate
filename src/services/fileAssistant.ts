export type AssistantFileKind = 'pdf' | 'markdown' | 'text' | 'code' | 'json' | 'unknown'
export type FileAssistantAction = 'summarize' | 'explain' | 'inspect-code' | 'prepare-teaching'

export interface FileAssistantResult {
  name: string
  kind: AssistantFileKind
  size: number
  language?: string
  lines?: number
  words?: number
  preview: string
  summary: string[]
  actions: FileAssistantAction[]
}

const codeExtensions: Record<string, string> = {
  ts: 'TypeScript', tsx: 'TypeScript/TSX', js: 'JavaScript', jsx: 'JavaScript/JSX', vue: 'Vue',
  rs: 'Rust', py: 'Python', php: 'PHP', java: 'Java', kt: 'Kotlin', dart: 'Dart', css: 'CSS',
  html: 'HTML', sql: 'SQL', sh: 'Shell', yml: 'YAML', yaml: 'YAML', toml: 'TOML',
}

export function detectFileKind(name: string): { kind: AssistantFileKind; language?: string } {
  const ext = name.toLowerCase().split('.').pop() ?? ''
  if (ext === 'pdf') return { kind: 'pdf' }
  if (ext === 'md' || ext === 'markdown') return { kind: 'markdown' }
  if (ext === 'txt' || ext === 'log' || ext === 'csv') return { kind: 'text' }
  if (ext === 'json') return { kind: 'json', language: 'JSON' }
  if (codeExtensions[ext]) return { kind: 'code', language: codeExtensions[ext] }
  return { kind: 'unknown' }
}

function cleanText(text: string) {
  return text.replace(/\r/g, '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim()
}

function sentenceSummary(text: string, max = 4) {
  const cleaned = cleanText(text)
  const sentences = cleaned.split(/(?<=[.!?])\s+|\n+/).map(v => v.trim()).filter(v => v.length >= 20)
  const unique: string[] = []
  for (const sentence of sentences) {
    const short = sentence.slice(0, 220)
    if (!unique.some(v => v.toLowerCase() === short.toLowerCase())) unique.push(short)
    if (unique.length >= max) break
  }
  return unique
}

function codeSummary(text: string, language?: string) {
  const lines = text.split(/\r?\n/)
  const functions = lines.filter(line => /\b(function|fn|def|class|interface|struct|enum|const\s+\w+\s*=\s*\(|async\s+function)\b/.test(line)).slice(0, 6)
  const imports = lines.filter(line => /^\s*(import|use|from|require\b)/.test(line)).length
  return [
    `${language ?? 'Code'} file with ${lines.length} lines and ${imports} import/use statement${imports === 1 ? '' : 's'}.`,
    functions.length ? `Detected declarations: ${functions.map(v => v.trim().slice(0, 70)).join(' · ')}` : 'No obvious top-level function/class declarations detected by the lightweight scanner.',
    'Inspection is heuristic and local; run the project build/tests for authoritative diagnostics.',
  ]
}

export async function analyzeDroppedFile(file: File): Promise<FileAssistantResult> {
  const detected = detectFileKind(file.name)
  if (detected.kind === 'pdf') {
    return { name: file.name, kind: 'pdf', size: file.size, preview: 'PDF detected. Use Prepare for teaching to open the existing PDF teaching workflow.', summary: ['PDF document detected locally.', 'NyanMate does not upload the file automatically.'], actions: ['prepare-teaching'] }
  }
  if (detected.kind === 'unknown') {
    return { name: file.name, kind: 'unknown', size: file.size, preview: 'Unsupported file type.', summary: ['This file type is not analyzed yet.'], actions: [] }
  }
  const text = await file.text()
  const cleaned = cleanText(text)
  const lines = text ? text.split(/\r?\n/).length : 0
  const words = cleaned ? cleaned.split(/\s+/).length : 0
  const isCode = detected.kind === 'code' || detected.kind === 'json'
  const summary = isCode ? codeSummary(text, detected.language) : sentenceSummary(text)
  return {
    name: file.name, kind: detected.kind, language: detected.language, size: file.size, lines, words,
    preview: cleaned.slice(0, 900) || '(empty file)',
    summary: summary.length ? summary : ['The file is empty or does not contain enough readable text for a local summary.'],
    actions: isCode ? ['summarize', 'explain', 'inspect-code'] : ['summarize', 'explain'],
  }
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
