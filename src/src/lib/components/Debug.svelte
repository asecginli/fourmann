<script lang="ts">
  import type { QuizState } from '$lib/types';

  const props = $props<{
    state: QuizState | null;
    onReset: () => void;
  }>();

  let isExpanded = $state(false);
  let height = $state('40px');

  function toggleExpand() {
    isExpanded = !isExpanded;
    height = isExpanded ? '500px' : '40px';
  }
</script>

<div 
  class="fixed bottom-0 left-0 right-0 bg-slate-900 text-slate-50 z-50 transition-[height] duration-300 ease-in-out overflow-hidden"
  style="height: {height}"
>
  <div class="max-w-[960px] mx-auto relative h-full">
    <div class="flex justify-between items-center h-10 px-4">
      <div class="flex items-center gap-2">
        <h3 class="text-sm font-medium">Debug</h3>
        <button
          onclick={toggleExpand}
          class="p-1 hover:bg-slate-700 rounded text-slate-50 transition-colors duration-300 text-xs"
          aria-label={isExpanded ? 'Collapse debug panel' : 'Expand debug panel'}
        >
          {isExpanded ? '▼' : '▲'}
        </button>
      </div>
      <button
        onclick={props.onReset}
        class="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-50 transition-colors duration-300 text-sm"
      >
        Reset Quiz
      </button>
    </div>
    {#if isExpanded}
      <div 
        class="bg-slate-800 rounded p-4 overflow-y-auto mx-4 mb-4"
        style="height: calc({height} - 56px)"
      >
        <pre class="whitespace-pre">{JSON.stringify(props.state, null, 2)}</pre>
      </div>
    {/if}
  </div>
</div>

<!-- Add padding to prevent content from being hidden behind debug panel -->
<div style="height: {height}" aria-hidden="true"></div>