import type { AssistantMessage } from './assistantChat'
import type { FileAssistantResult } from './fileAssistant'

export type AiProviderMode = 'local' | 'openai-compatible'

export interface AiProviderConfig {
  mode: AiProviderMode
  baseUrl: string
  model: string
  temperature: number
  maxTokens: number
}

export interface ProviderTestResult {
  ok: boolean
  message: string
  models?: string[]
}

const CONFIG_KEY = 'nyanmate-ai-provider-v1'
const API_KEY_SESSION = 'nyanmate-ai-provider-key-session'

export const DEFAULT_PROVIDER_CONFIG: AiProviderConfig = {
  mode: 'local',
  baseUrl: 'http://localhost:11434/v1',
  model: '',
  temperature: 0.4,
  maxTokens: 800,
}

function clamp(value: unknown, min: number, max: number, fallback: number) {
  const n = Number(value)
  return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback
}

export function loadProviderConfig(): AiProviderConfig {
  try {
    const raw = JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}') as Partial<AiProviderConfig>
    return {
      mode: raw.mode === 'openai-compatible' ? 'openai-compatible' : 'local',
      baseUrl: typeof raw.baseUrl === 'string' && raw.baseUrl.trim() ? raw.baseUrl.trim().replace(/\/$/, '') : DEFAULT_PROVIDER_CONFIG.baseUrl,
      model: typeof raw.model === 'string' ? raw.model.trim() : '',
      temperature: clamp(raw.temperature, 0, 2, DEFAULT_PROVIDER_CONFIG.temperature),
      maxTokens: Math.round(clamp(raw.maxTokens, 64, 8192, DEFAULT_PROVIDER_CONFIG.maxTokens)),
    }
  } catch { return { ...DEFAULT_PROVIDER_CONFIG } }
}

export function saveProviderConfig(config: AiProviderConfig) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify({ ...config, baseUrl: config.baseUrl.trim().replace(/\/$/, '') }))
}

export function loadSessionApiKey() { return sessionStorage.getItem(API_KEY_SESSION) || '' }
export function saveSessionApiKey(key: string) {
  const trimmed = key.trim()
  if (trimmed) sessionStorage.setItem(API_KEY_SESSION, trimmed)
  else sessionStorage.removeItem(API_KEY_SESSION)
}

function validatedBaseUrl(value: string) {
  const url = new URL(value.trim())
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('Provider URL must use http:// or https://')
  return url.toString().replace(/\/$/, '')
}

function authHeaders(apiKey: string) {
  return apiKey.trim() ? { Authorization: `Bearer ${apiKey.trim()}` } : {}
}

export async function testProviderConnection(config: AiProviderConfig, apiKey: string): Promise<ProviderTestResult> {
  if (config.mode === 'local') return { ok: true, message: 'Local deterministic assistant is enabled; no network provider is required.' }
  try {
    const base = validatedBaseUrl(config.baseUrl)
    const response = await fetch(`${base}/models`, { headers: { Accept: 'application/json', ...authHeaders(apiKey) } })
    if (!response.ok) return { ok: false, message: `Provider returned HTTP ${response.status}.` }
    const json = await response.json() as { data?: Array<{ id?: string }> }
    const models = Array.isArray(json.data) ? json.data.map(v => v.id || '').filter(Boolean).slice(0, 30) : []
    return { ok: true, message: models.length ? `Connected. ${models.length} model(s) reported.` : 'Connected. Provider responded successfully.', models }
  } catch (error) {
    return { ok: false, message: `Connection failed: ${error instanceof Error ? error.message : String(error)}` }
  }
}

function fileContextBlock(file: FileAssistantResult) {
  return [`File: ${file.name}`, `Kind: ${file.kind}`, file.language ? `Language: ${file.language}` : '', `Local summary:\n${file.summary.join('\n')}`, `Readable preview:\n${file.preview}`].filter(Boolean).join('\n\n')
}

export async function providerChatReply(args: {
  config: AiProviderConfig
  apiKey: string
  messages: AssistantMessage[]
  file?: FileAssistantResult | null
  includeFileContext?: boolean
  allowRemoteFileContext?: boolean
}) {
  if (args.config.mode !== 'openai-compatible') throw new Error('Remote provider is not enabled.')
  if (!args.config.model.trim()) throw new Error('Choose a model before sending.')
  const base = validatedBaseUrl(args.config.baseUrl)
  const recent = args.messages.slice(-16).map(message => ({ role: message.role, content: message.text }))
  const system: Array<{ role: 'system'; content: string }> = [{ role: 'system', content: 'You are NyanMate, a concise desktop assistant. Be clear about uncertainty. Never claim to have accessed files or tools unless their content was explicitly included.' }]
  if (args.includeFileContext && args.file) {
    if (!args.allowRemoteFileContext) throw new Error('Remote file-context sharing is not approved. Enable explicit file sharing first.')
    system.push({ role: 'system', content: `The user explicitly approved sending this loaded file context for this request:\n\n${fileContextBlock(args.file)}` })
  }
  const response = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...authHeaders(args.apiKey) },
    body: JSON.stringify({ model: args.config.model.trim(), messages: [...system, ...recent], temperature: args.config.temperature, max_tokens: args.config.maxTokens }),
  })
  if (!response.ok) throw new Error(`Provider returned HTTP ${response.status}: ${(await response.text()).slice(0, 300)}`)
  const json = await response.json() as { choices?: Array<{ message?: { content?: string } }> }
  const text = json.choices?.[0]?.message?.content?.trim()
  if (!text) throw new Error('Provider response did not contain assistant text.')
  return text
}
