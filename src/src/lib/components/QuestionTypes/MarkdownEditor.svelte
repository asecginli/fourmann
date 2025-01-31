<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { Question, Answer } from '$lib/types';
  import { BlockEditorJs, type BlockEditorConfig } from './BlockEditorJs';
  import { marked } from 'marked';

  const props = $props<{
    question: Question;
    answer: Answer | undefined;
    onAnswer: (answer: Answer) => void;
  }>();

  let element = $state<HTMLElement | null>(null);
  let editor = $state<BlockEditorJs | null>(null);
  let showPreview = $state(false);
  let previewHtml = $state('');

  function updatePreview(markdown: string) {
    try {
      previewHtml = marked.parse(markdown, { 
        breaks: true,
        gfm: true
      });
    } catch (error) {
      console.error('Error parsing markdown:', error);
      previewHtml = '<p class="text-red-600">Error parsing markdown</p>';
    }
  }

  function initEditor() {
    if (!element) return;

    const config: BlockEditorConfig = {
      holder: element,
      question: props.question,
      answer: props.answer,
      onAnswer: props.onAnswer,
      onPreviewUpdate: updatePreview
    };

    editor = new BlockEditorJs(config);
    editor.initialize().then(() => {
      // Initialize preview with current content
      if (props.answer?.value?.[0]) {
        updatePreview(props.answer.value[0]);
      }
    });
  }

  onMount(() => {
    if (!showPreview) {
      initEditor();
    } else if (props.answer?.value?.[0]) {
      updatePreview(props.answer.value[0]);
    }
  });

  onDestroy(async () => {
    await editor?.destroy();
  });

  async function togglePreview() {
    if (!showPreview && editor) {
      // Save current content before switching to preview
      const data = await editor.save();
      if (data) {
        updatePreview(data.markdown);
      }
    }
    
    showPreview = !showPreview;
    
    if (!showPreview) {
      // Re-initialize editor when switching back from preview
      setTimeout(initEditor, 0);
    }
  }
</script>

<div class="markdown-editor">
  <div class="toolbar">
    <button 
      type="button"
      class="preview-toggle"
      onclick={togglePreview}
      aria-label={showPreview ? "Show editor" : "Show preview"}
    >
      {showPreview ? "Edit" : "Preview"}
    </button>
  </div>

  {#if showPreview}
    <div 
      class="preview prose"
      role="region"
      aria-label="Preview"
    >
      {@html previewHtml}
    </div>
  {:else}
    <div 
      bind:this={element}
      class="editor"
      role="textbox"
      aria-multiline="true"
      aria-label="Block editor"
    ></div>
  {/if}
</div>

<style>
  .markdown-editor {
    @apply border border-gray-300 rounded-lg overflow-hidden bg-white;
  }

  .toolbar {
    @apply flex items-center justify-between p-2 bg-gray-50 border-b border-gray-300;
  }

  .preview-toggle {
    @apply px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md 
           hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
           transition-colors duration-200;
  }

  .editor {
    @apply w-full min-h-[240px] p-4;
  }

  .preview {
    @apply p-4 min-h-[400px] max-w-none overflow-auto;
  }

  /* Editor.js overrides */
  :global(.ce-block__content) {
    max-width: 100% !important;
    margin: 0 !important;
  }

  :global(.ce-toolbar__content) {
    max-width: 100% !important;
  }

  :global(.ce-toolbar__actions) {
    right: 0 !important;
    left: auto !important;
  }

  :global(.ce-toolbar__plus) {
    left: -2px !important;
  }

  :global(.ce-toolbar__settings-btn) {
    right: -2px !important;
  }

  /* Editor heading styles */
  :global(h1.ce-header[contenteditable]) {
    font-size: 2em !important;
    font-weight: 700 !important;
    line-height: 1.2 !important;
    margin-bottom: 1rem !important;
    color: #202124 !important;
  }

  :global(h2.ce-header[contenteditable]) {
    font-size: 1.5em !important;
    font-weight: 700 !important;
    line-height: 1.3 !important;
    margin-bottom: 0.75rem !important;
    color: #202124 !important;
  }

  :global(h3.ce-header[contenteditable]) {
    font-size: 1.17em !important;
    font-weight: 700 !important;
    line-height: 1.4 !important;
    margin-bottom: 0.5rem !important;
    color: #202124 !important;
  }

  /* Image block styles */
  :global(.image-tool) {
    @apply my-4;
  }

  :global(.image-tool__image) {
    @apply max-w-full rounded-lg overflow-hidden;
  }

  :global(.image-tool__caption) {
    @apply text-sm text-gray-600 mt-2;
  }

  /* Preview styles */
  :global(.preview h1) {
    @apply text-[2em] font-bold text-[#202124] mt-6 first:mt-0 mb-4;
    line-height: 1.2;
  }

  :global(.preview h2) {
    @apply text-[1.5em] font-bold text-[#202124] mt-5 mb-3;
    line-height: 1.3;
  }

  :global(.preview h3) {
    @apply text-[1.17em] font-bold text-[#202124] mt-4 mb-2;
    line-height: 1.4;
  }

  :global(.preview p) {
    @apply mb-4 text-[#202124];
  }

  :global(.preview ul) {
    @apply list-none pl-5 mb-4 text-[#202124];
  }

  :global(.preview ul li::before) {
    @apply content-['•'] text-[#202124] inline-block w-4 -ml-4;
  }

  :global(.preview ol) {
    @apply list-none pl-5 mb-4 text-[#202124];
    counter-reset: list-counter;
  }

  :global(.preview ol li::before) {
    @apply text-[#202124] inline-block w-4 -ml-4;
    counter-increment: list-counter;
    content: counter(list-counter) ".";
  }

  :global(.preview li) {
    @apply mb-1;
  }

  :global(.preview blockquote) {
    @apply border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4;
  }

  :global(.preview code) {
    @apply font-mono bg-gray-100 px-1.5 py-0.5 rounded text-sm text-gray-800;
  }

  :global(.preview pre) {
    @apply bg-[#1e293b] text-gray-100 p-4 rounded-lg my-4 overflow-x-auto w-full;
  }

  :global(.preview pre code) {
    @apply bg-transparent text-inherit p-0;
  }

  :global(.preview img) {
    @apply max-w-full rounded-lg my-4;
  }
</style>