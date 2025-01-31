<script lang="ts">
  import type { QuizState, Page, Question, QuestionsContent, Answer } from '$lib/types';

  const props = $props<{
    state: QuizState | null;
    page: Page | null;
    answers: Answer[];
    onReset: () => void;
  }>();

  let isExpanded = $state(false);
  let height = $state('40px');
  let activeTab = $state<'state' | 'questions' | 'answers'>('state');

  function toggleExpand() {
    isExpanded = !isExpanded;
    height = isExpanded ? '500px' : '40px';
  }

  function getAllQuestionsFromPage(page: Page): Question[] {
    return page.sections.flatMap(section => 
      section.content
        .filter((content): content is QuestionsContent => content.type === 'questions')
        .flatMap(content => content.questions)
    );
  }

  function getCurrentAnswers(): Answer[] {
    if (!props.page) return [];
    const questions = getAllQuestionsFromPage(props.page);
    return props.answers.filter(answer => 
      questions.some(q => q.id === answer.questionId)
    );
  }

  $effect(() => {
    // Reset to first tab when page changes
    if (props.page) {
      activeTab = 'state';
    }
  });
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
      <div class="px-4 pt-2">
        <div class="flex gap-2">
          <button
            class="px-3 py-1 rounded text-sm {activeTab === 'state' ? 'bg-slate-700' : 'hover:bg-slate-800'}"
            onclick={() => activeTab = 'state'}
          >
            State
          </button>
          <button
            class="px-3 py-1 rounded text-sm {activeTab === 'questions' ? 'bg-slate-700' : 'hover:bg-slate-800'}"
            onclick={() => activeTab = 'questions'}
          >
            Questions
          </button>
          <button
            class="px-3 py-1 rounded text-sm {activeTab === 'answers' ? 'bg-slate-700' : 'hover:bg-slate-800'}"
            onclick={() => activeTab = 'answers'}
          >
            Current Answers
          </button>
        </div>
      </div>
      <div 
        class="bg-slate-800 rounded p-4 overflow-y-auto mx-4 mb-4 mt-2"
        style="height: calc({height} - 96px)"
      >
        {#if activeTab === 'state'}
          <pre class="whitespace-pre">{JSON.stringify(props.state, null, 2)}</pre>
        {:else if activeTab === 'questions' && props.page}
          <pre class="whitespace-pre">{JSON.stringify(getAllQuestionsFromPage(props.page), null, 2)}</pre>
        {:else if activeTab === 'answers'}
          <pre class="whitespace-pre">{JSON.stringify(getCurrentAnswers(), null, 2)}</pre>
        {/if}
      </div>
    {/if}
  </div>
</div>

<!-- Add padding to prevent content from being hidden behind debug panel -->
<div style="height: {height}" aria-hidden="true"></div>