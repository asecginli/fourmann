<script lang="ts">
  import { Crepe } from '@milkdown/crepe';
  import "@milkdown/crepe/theme/common/style.css";
  import "@milkdown/crepe/theme/frame.css";
  import { onMount, onDestroy, createRawSnippet } from 'svelte';
  import type { Question, Answer } from '$lib/types';
  import type { ListenerManager } from '@milkdown/plugin-listener';
  import { uploadConfig } from '@milkdown/plugin-upload';

  const props = $props<{
    question: Question;
    answer: Answer | undefined;
    onAnswer: (answer: Answer) => void;
  }>();

  let crepeEditor: Crepe | null = null;
  let editorContainer: HTMLElement | null = null;
  
  
  onMount(() => {
    if (editorContainer) {
      crepeEditor = new Crepe({
        root: editorContainer,
        defaultValue: props.answer?.value?.[0] || 'Type your answer here...',
        featureConfigs:{
          [Crepe.Feature.ImageBlock]: {
            onUpload: async (file) => {
              return new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                  resolve(reader.result as string);
                };
                reader.readAsDataURL(file);
              });
            }
          }
        }
      });
      
      crepeEditor.create().then(() => {
        console.log('Editor created');
        crepeEditor?.on((api: ListenerManager) => {
          
          api.markdownUpdated((ctx, markdown, prevMarkdown) => {
            props.onAnswer({
              questionId: props.question.id,
              questionName: props.question.name,
              questionText: props.question.text,
              value: [markdown]
            });
          });
        });
      });
    }
  });
  
  onDestroy(() => {
    crepeEditor?.destroy();
    crepeEditor = null;
  });
</script>

<div class="markdown-editor">
  <div 
    bind:this={editorContainer}
    class="editor"
    role="textbox"
    aria-multiline="true"
    aria-label="Milkdown editor"
  ></div>
</div>

<style>
  .markdown-editor {
    @apply border border-gray-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-[#1a73e8] focus-within:ring-offset-2;
  }

  .editor {
    @apply w-full min-h-[240px];
  }

  :global(.milkdown) {
    padding: 40px;
  }
     /* Target the Milkdown editor and set the font for paragraphs */
    :global(.milkdown .editor p) {
      font-family: var(--font-family);
    }

    :global(.milkdown .editor h1, .milkdown .editor h2, .milkdown .editor h3) {
      font-family: var(--font-family);
    }

  :global(.milkdown .ProseMirror) {
    padding: 0 50px !important;
    @apply text-base text-gray-900;
    outline: none !important;
  }

  :global(.milkdown .ProseMirror:focus) {
    outline: none !important;
    box-shadow: none !important;
  }
</style>