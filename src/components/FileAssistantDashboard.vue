<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { analyzeDroppedFile, formatFileSize, type FileAssistantAction, type FileAssistantResult } from '../services/fileAssistant'
import { clearAssistantHistory, loadAssistantHistory, localAssistantReply, makeAssistantMessage, saveAssistantHistory, type AssistantMessage } from '../services/assistantChat'

const tab = ref<'file' | 'chat'>('file')
const result = ref<FileAssistantResult | null>(null)
const busy = ref(false)
const dragActive = ref(false)
const actionText = ref('')
const input = ref<HTMLInputElement | null>(null)
const chatInput = ref('')
const includeFileContext = ref(false)
const messages = ref<AssistantMessage[]>(loadAssistantHistory())
const chatLog = ref<HTMLElement | null>(null)

const metadata = computed(() => {
  if (!result.value) return ''
  return [formatFileSize(result.value.size), result.value.language, result.value.lines ? `${result.value.lines} lines` : '', result.value.words ? `${result.value.words} words` : ''].filter(Boolean).join(' · ')
})

async function process(file?: File) {
  if (!file) return
  busy.value = true
  actionText.value = ''
  try { result.value = await analyzeDroppedFile(file); includeFileContext.value = false }
  catch (error) { actionText.value = `Could not read this file: ${String(error)}` }
  finally { busy.value = false }
}
function drop(event: DragEvent) { dragActive.value = false; void process(event.dataTransfer?.files?.[0]) }
function choose() { input.value?.click() }
function runAction(action: FileAssistantAction) {
  if (!result.value) return
  if (action === 'summarize') actionText.value = result.value.summary.join('\n\n')
  if (action === 'explain') actionText.value = result.value.kind === 'code' || result.value.kind === 'json'
    ? `This looks like ${result.value.language ?? 'a code'} file. NyanMate's local scanner found its basic structure without executing it. For deeper explanation, a future opt-in AI provider can receive only the content you explicitly approve.`
    : `This ${result.value.kind} file contains about ${result.value.words ?? 0} words. The current explanation is local and extractive, so it does not invent context outside the file.`
  if (action === 'inspect-code') actionText.value = `${result.value.summary.join('\n\n')}\n\nPreview:\n${result.value.preview}`
  if (action === 'prepare-teaching') actionText.value = 'PDF teaching preparation already exists in NyanMate. Open the main mascot menu → PDF Teaching and select this PDF there. Direct hand-off will be added after native file-path support is wired safely.'
}
async function sendChat() {
  const text = chatInput.value.trim()
  if (!text) return
  const user = makeAssistantMessage('user', text)
  messages.value.push(user)
  chatInput.value = ''
  const reply = makeAssistantMessage('assistant', localAssistantReply(text, { file: result.value, includeFileContext: includeFileContext.value }))
  messages.value.push(reply)
  saveAssistantHistory(messages.value)
  await nextTick()
  chatLog.value?.scrollTo({ top: chatLog.value.scrollHeight, behavior: 'smooth' })
}
function clearChat() { messages.value = []; clearAssistantHistory() }
</script>

<template>
  <main class="file-assistant-dashboard" @dragover.prevent="dragActive=true" @dragleave.prevent="dragActive=false" @drop.prevent="drop">
    <header class="file-assistant-head"><div><strong>✨ NyanMate Assistant</strong><small>Local-first file tools + assistant chat.</small></div><span>v0.25</span></header>
    <nav class="assistant-tabs"><button :class="{active:tab==='file'}" @click="tab='file'">📎 File</button><button :class="{active:tab==='chat'}" @click="tab='chat'">💬 Chat</button></nav>

    <template v-if="tab==='file'">
      <section class="file-drop-zone" :class="{ active: dragActive }" @click="choose">
        <input ref="input" type="file" hidden accept=".pdf,.txt,.md,.markdown,.json,.ts,.tsx,.js,.jsx,.vue,.rs,.py,.php,.java,.kt,.dart,.css,.html,.sql,.sh,.yml,.yaml,.toml,.log,.csv" @change="process(($event.target as HTMLInputElement).files?.[0])" />
        <div class="file-drop-cat">🐱</div><strong>{{ busy ? 'Reading locally…' : 'Drop a file here' }}</strong><span>or click to choose · PDF, text, Markdown, JSON and common source code</span><small>Nothing is uploaded automatically.</small>
      </section>
      <template v-if="result">
        <section class="file-result-card"><div class="file-result-title"><div><strong>{{ result.name }}</strong><small>{{ result.kind }} · {{ metadata }}</small></div><span>{{ result.language || result.kind.toUpperCase() }}</span></div><h3>Local overview</h3><p v-for="item in result.summary" :key="item">{{ item }}</p><details><summary>Readable preview</summary><pre>{{ result.preview }}</pre></details></section>
        <section class="file-actions-card"><h3>Actions</h3><div><button v-for="action in result.actions" :key="action" @click="runAction(action)">{{ action === 'inspect-code' ? '🔎 Inspect code' : action === 'prepare-teaching' ? '🎓 Prepare for teaching' : action === 'summarize' ? '📝 Summarize' : '💡 Explain' }}</button><button @click="tab='chat'">💬 Ask about this file</button></div><pre v-if="actionText" class="file-action-output">{{ actionText }}</pre></section>
      </template>
      <section v-else class="file-privacy-note"><strong>Local-first by default</strong><p>Text and code inspection runs inside the app. AI/cloud analysis is intentionally not automatic and will remain opt-in.</p></section>
    </template>

    <template v-else>
      <section class="assistant-chat-card">
        <div class="assistant-chat-toolbar"><div><strong>🐱 Local Assistant</strong><small>Deterministic helper · no cloud model connected</small></div><button @click="clearChat">Clear</button></div>
        <label class="assistant-context-toggle"><input v-model="includeFileContext" type="checkbox" :disabled="!result" /> Use loaded file context <small v-if="result">({{ result.name }})</small><small v-else>— no file loaded</small></label>
        <div ref="chatLog" class="assistant-chat-log">
          <div v-if="!messages.length" class="assistant-chat-empty"><span>🐾</span><strong>Ask NyanMate</strong><p>Try “what features do you have?”, “help with my file”, “how does Smart Agenda work?”, or “privacy”.</p></div>
          <article v-for="message in messages" :key="message.id" class="assistant-message" :class="message.role"><strong>{{ message.role === 'user' ? 'You' : 'NyanMate' }}</strong><p>{{ message.text }}</p></article>
        </div>
        <form class="assistant-chat-composer" @submit.prevent="sendChat"><textarea v-model="chatInput" rows="2" placeholder="Ask NyanMate…" @keydown.enter.exact.prevent="sendChat"></textarea><button type="submit">Send</button></form>
        <p class="assistant-provider-note">v0.25 intentionally ships without a cloud provider. Future providers will be opt-in, and loaded-file context will require explicit consent.</p>
      </section>
    </template>
  </main>
</template>
