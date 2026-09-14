<script setup lang="ts">
import { computed, ref } from 'vue'
import { analyzeDroppedFile, formatFileSize, type FileAssistantAction, type FileAssistantResult } from '../services/fileAssistant'

const result = ref<FileAssistantResult | null>(null)
const busy = ref(false)
const dragActive = ref(false)
const actionText = ref('')
const input = ref<HTMLInputElement | null>(null)

const metadata = computed(() => {
  if (!result.value) return ''
  return [formatFileSize(result.value.size), result.value.language, result.value.lines ? `${result.value.lines} lines` : '', result.value.words ? `${result.value.words} words` : ''].filter(Boolean).join(' · ')
})

async function process(file?: File) {
  if (!file) return
  busy.value = true
  actionText.value = ''
  try { result.value = await analyzeDroppedFile(file) }
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
</script>

<template>
  <main class="file-assistant-dashboard" @dragover.prevent="dragActive=true" @dragleave.prevent="dragActive=false" @drop.prevent="drop">
    <header class="file-assistant-head"><div><strong>✨ NyanMate File Assistant</strong><small>Drop a file for lightweight, local-first inspection.</small></div><span>v0.24</span></header>
    <section class="file-drop-zone" :class="{ active: dragActive }" @click="choose">
      <input ref="input" type="file" hidden accept=".pdf,.txt,.md,.markdown,.json,.ts,.tsx,.js,.jsx,.vue,.rs,.py,.php,.java,.kt,.dart,.css,.html,.sql,.sh,.yml,.yaml,.toml,.log,.csv" @change="process(($event.target as HTMLInputElement).files?.[0])" />
      <div class="file-drop-cat">🐱</div><strong>{{ busy ? 'Reading locally…' : 'Drop a file here' }}</strong><span>or click to choose · PDF, text, Markdown, JSON and common source code</span><small>Nothing is uploaded automatically.</small>
    </section>
    <template v-if="result">
      <section class="file-result-card"><div class="file-result-title"><div><strong>{{ result.name }}</strong><small>{{ result.kind }} · {{ metadata }}</small></div><span>{{ result.language || result.kind.toUpperCase() }}</span></div><h3>Local overview</h3><p v-for="item in result.summary" :key="item">{{ item }}</p><details><summary>Readable preview</summary><pre>{{ result.preview }}</pre></details></section>
      <section class="file-actions-card"><h3>Actions</h3><div><button v-for="action in result.actions" :key="action" @click="runAction(action)">{{ action === 'inspect-code' ? '🔎 Inspect code' : action === 'prepare-teaching' ? '🎓 Prepare for teaching' : action === 'summarize' ? '📝 Summarize' : '💡 Explain' }}</button></div><pre v-if="actionText" class="file-action-output">{{ actionText }}</pre></section>
    </template>
    <section v-else class="file-privacy-note"><strong>Local-first by default</strong><p>Text and code inspection runs inside the app. AI/cloud analysis is intentionally not automatic and will remain opt-in.</p></section>
  </main>
</template>
