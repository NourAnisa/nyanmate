<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { analyzeDroppedFile, formatFileSize, type FileAssistantAction, type FileAssistantResult } from '../services/fileAssistant'
import { clearAssistantHistory, loadAssistantHistory, localAssistantReply, makeAssistantMessage, saveAssistantHistory, type AssistantMessage } from '../services/assistantChat'
import { loadProviderConfig, loadSessionApiKey, providerChatReply, saveProviderConfig, saveSessionApiKey, testProviderConnection, type ProviderTestResult } from '../services/aiProvider'

const tab = ref<'file' | 'chat' | 'provider'>('file')
const result = ref<FileAssistantResult | null>(null)
const busy = ref(false)
const dragActive = ref(false)
const actionText = ref('')
const input = ref<HTMLInputElement | null>(null)
const chatInput = ref('')
const includeFileContext = ref(false)
const allowRemoteFileContext = ref(false)
const messages = ref<AssistantMessage[]>(loadAssistantHistory())
const chatLog = ref<HTMLElement | null>(null)
const provider = ref(loadProviderConfig())
const apiKey = ref(loadSessionApiKey())
const providerBusy = ref(false)
const providerTest = ref<ProviderTestResult | null>(null)

const metadata = computed(() => {
  if (!result.value) return ''
  return [formatFileSize(result.value.size), result.value.language, result.value.lines ? `${result.value.lines} lines` : '', result.value.words ? `${result.value.words} words` : ''].filter(Boolean).join(' · ')
})
const remoteEnabled = computed(() => provider.value.mode === 'openai-compatible')

async function process(file?: File) {
  if (!file) return
  busy.value = true
  actionText.value = ''
  try { result.value = await analyzeDroppedFile(file); includeFileContext.value = false; allowRemoteFileContext.value = false }
  catch (error) { actionText.value = `Could not read this file: ${String(error)}` }
  finally { busy.value = false }
}
function drop(event: DragEvent) { dragActive.value = false; void process(event.dataTransfer?.files?.[0]) }
function choose() { input.value?.click() }
function runAction(action: FileAssistantAction) {
  if (!result.value) return
  if (action === 'summarize') actionText.value = result.value.summary.join('\n\n')
  if (action === 'explain') actionText.value = result.value.kind === 'code' || result.value.kind === 'json'
    ? `This looks like ${result.value.language ?? 'a code'} file. NyanMate's local scanner found its basic structure without executing it.`
    : `This ${result.value.kind} file contains about ${result.value.words ?? 0} words. The explanation is local and extractive.`
  if (action === 'inspect-code') actionText.value = `${result.value.summary.join('\n\n')}\n\nPreview:\n${result.value.preview}`
  if (action === 'prepare-teaching') actionText.value = 'PDF teaching preparation already exists in NyanMate. Open the main mascot menu → PDF Teaching and select this PDF there.'
}
async function sendChat() {
  const text = chatInput.value.trim()
  if (!text || providerBusy.value) return
  messages.value.push(makeAssistantMessage('user', text))
  chatInput.value = ''
  providerBusy.value = true
  try {
    const replyText = remoteEnabled.value
      ? await providerChatReply({ config: provider.value, apiKey: apiKey.value, messages: messages.value, file: result.value, includeFileContext: includeFileContext.value, allowRemoteFileContext: allowRemoteFileContext.value })
      : localAssistantReply(text, { file: result.value, includeFileContext: includeFileContext.value })
    messages.value.push(makeAssistantMessage('assistant', replyText))
  } catch (error) {
    messages.value.push(makeAssistantMessage('assistant', `Provider error: ${error instanceof Error ? error.message : String(error)}`))
  } finally {
    providerBusy.value = false
    saveAssistantHistory(messages.value)
    await nextTick()
    chatLog.value?.scrollTo({ top: chatLog.value.scrollHeight, behavior: 'smooth' })
  }
}
function clearChat() { messages.value = []; clearAssistantHistory() }
function persistProvider() { saveProviderConfig(provider.value); saveSessionApiKey(apiKey.value); providerTest.value = { ok: true, message: 'Settings saved. API key is kept only for this app session.' } }
async function testProvider() {
  providerBusy.value = true
  providerTest.value = null
  try { providerTest.value = await testProviderConnection(provider.value, apiKey.value) }
  finally { providerBusy.value = false }
}
</script>

<template>
  <main class="file-assistant-dashboard" @dragover.prevent="dragActive=true" @dragleave.prevent="dragActive=false" @drop.prevent="drop">
    <header class="file-assistant-head"><div><strong>✨ NyanMate Assistant</strong><small>Local-first file tools + optional AI provider.</small></div><span>v0.26</span></header>
    <nav class="assistant-tabs"><button :class="{active:tab==='file'}" @click="tab='file'">📎 File</button><button :class="{active:tab==='chat'}" @click="tab='chat'">💬 Chat</button><button :class="{active:tab==='provider'}" @click="tab='provider'">⚙️ Provider</button></nav>

    <template v-if="tab==='file'">
      <section class="file-drop-zone" :class="{ active: dragActive }" @click="choose">
        <input ref="input" type="file" hidden accept=".pdf,.txt,.md,.markdown,.json,.ts,.tsx,.js,.jsx,.vue,.rs,.py,.php,.java,.kt,.dart,.css,.html,.sql,.sh,.yml,.yaml,.toml,.log,.csv" @change="process(($event.target as HTMLInputElement).files?.[0])" />
        <div class="file-drop-cat">🐱</div><strong>{{ busy ? 'Reading locally…' : 'Drop a file here' }}</strong><span>or click to choose · PDF, text, Markdown, JSON and common source code</span><small>Nothing is uploaded automatically.</small>
      </section>
      <template v-if="result">
        <section class="file-result-card"><div class="file-result-title"><div><strong>{{ result.name }}</strong><small>{{ result.kind }} · {{ metadata }}</small></div><span>{{ result.language || result.kind.toUpperCase() }}</span></div><h3>Local overview</h3><p v-for="item in result.summary" :key="item">{{ item }}</p><details><summary>Readable preview</summary><pre>{{ result.preview }}</pre></details></section>
        <section class="file-actions-card"><h3>Actions</h3><div><button v-for="action in result.actions" :key="action" @click="runAction(action)">{{ action === 'inspect-code' ? '🔎 Inspect code' : action === 'prepare-teaching' ? '🎓 Prepare for teaching' : action === 'summarize' ? '📝 Summarize' : '💡 Explain' }}</button><button @click="tab='chat'">💬 Ask about this file</button></div><pre v-if="actionText" class="file-action-output">{{ actionText }}</pre></section>
      </template>
      <section v-else class="file-privacy-note"><strong>Local-first by default</strong><p>Text and code inspection runs inside the app. Remote AI is never used unless you enable a provider.</p></section>
    </template>

    <template v-else-if="tab==='chat'">
      <section class="assistant-chat-card">
        <div class="assistant-chat-toolbar"><div><strong>🐱 {{ remoteEnabled ? 'Provider Chat' : 'Local Assistant' }}</strong><small>{{ remoteEnabled ? `${provider.model || 'No model selected'} · ${provider.baseUrl}` : 'Deterministic helper · no network provider' }}</small></div><button @click="clearChat">Clear</button></div>
        <label class="assistant-context-toggle"><input v-model="includeFileContext" type="checkbox" :disabled="!result" /> Use loaded file context <small v-if="result">({{ result.name }})</small><small v-else>— no file loaded</small></label>
        <label v-if="remoteEnabled && includeFileContext && result" class="assistant-context-toggle danger"><input v-model="allowRemoteFileContext" type="checkbox" /> Explicitly allow sending this file preview/summary to the configured provider</label>
        <div ref="chatLog" class="assistant-chat-log"><div v-if="!messages.length" class="assistant-chat-empty"><span>🐾</span><strong>Ask NyanMate</strong><p>Local mode stays offline. Provider mode sends chat only to the endpoint you configure.</p></div><article v-for="message in messages" :key="message.id" class="assistant-message" :class="message.role"><strong>{{ message.role === 'user' ? 'You' : 'NyanMate' }}</strong><p>{{ message.text }}</p></article></div>
        <form class="assistant-chat-composer" @submit.prevent="sendChat"><textarea v-model="chatInput" rows="2" placeholder="Ask NyanMate…" @keydown.enter.exact.prevent="sendChat"></textarea><button type="submit" :disabled="providerBusy">{{ providerBusy ? 'Sending…' : 'Send' }}</button></form>
        <p class="assistant-provider-note">Remote mode is opt-in. File context requires a second explicit approval before it can be included in a provider request.</p>
      </section>
    </template>

    <template v-else>
      <section class="provider-settings-card">
        <div class="provider-head"><div><strong>⚙️ AI Provider</strong><small>Use local deterministic mode or an OpenAI-compatible endpoint.</small></div><span :class="['provider-status', remoteEnabled ? 'remote' : 'local']">{{ remoteEnabled ? 'REMOTE' : 'LOCAL' }}</span></div>
        <label>Mode<select v-model="provider.mode"><option value="local">Local deterministic assistant</option><option value="openai-compatible">OpenAI-compatible API</option></select></label>
        <template v-if="remoteEnabled">
          <label>Base URL<input v-model="provider.baseUrl" placeholder="http://localhost:11434/v1" /></label>
          <label>Model<input v-model="provider.model" placeholder="model-name" /></label>
          <label>API key<input v-model="apiKey" type="password" autocomplete="off" placeholder="Optional for local servers" /><small>Kept in sessionStorage only; it is not committed to the repository or persisted with provider settings.</small></label>
          <div class="provider-grid"><label>Temperature<input v-model.number="provider.temperature" type="number" min="0" max="2" step="0.1" /></label><label>Max tokens<input v-model.number="provider.maxTokens" type="number" min="64" max="8192" step="64" /></label></div>
        </template>
        <div class="provider-actions"><button @click="persistProvider">Save settings</button><button v-if="remoteEnabled" class="secondary" :disabled="providerBusy" @click="testProvider">{{ providerBusy ? 'Testing…' : 'Test connection' }}</button></div>
        <div v-if="providerTest" class="provider-test" :class="{ ok: providerTest.ok, bad: !providerTest.ok }"><strong>{{ providerTest.ok ? 'Connected / saved' : 'Not connected' }}</strong><p>{{ providerTest.message }}</p><small v-if="providerTest.models?.length">Models: {{ providerTest.models.join(', ') }}</small></div>
        <div class="provider-warning"><strong>Privacy boundary</strong><p>Normal chat is sent only when remote mode is selected. Loaded file content is excluded unless both “Use loaded file context” and the separate remote-file approval are enabled.</p></div>
      </section>
    </template>
  </main>
</template>
