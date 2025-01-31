<script lang="ts">
  import type { Page, Answer, Section, MarkdownContent, QuestionsContent } from '$lib/types';
  import QuestionCard from './QuestionCard.svelte';

  const props = $props<{
    page: Page;
    answers: Answer[];
    submitted: boolean;
    onAnswer: (answer: Answer, error?: string) => void;
  }>();

  function isMarkdownContent(content: MarkdownContent | QuestionsContent): content is MarkdownContent {
    return content.type === 'markdown';
  }

  function isQuestionsContent(content: MarkdownContent | QuestionsContent): content is QuestionsContent {
    return content.type === 'questions';
  }
</script>

<div class="max-w-[960px] mx-auto">
  {#if props.page.title}
    <h1 class="text-3xl font-bold text-[#202124] mb-6 transition-opacity duration-300">
      {props.page.title}
    </h1>
  {/if}
  
  {#each props.page.sections as section}
    <div class="mb-8 bg-white rounded-lg shadow-lg p-6">
      <div class="flex gap-8 items-start">
        {#each section.content as content}
          {#if isMarkdownContent(content)}
            <div 
              class="prose prose-sm prose-headings:mt-0 first:prose-headings:mt-0"
              style="width: {content.width}%"
            >
              {@html content.content}
            </div>
          {/if}
          
          {#if isQuestionsContent(content) && !props.submitted}
            <div 
              class="space-y-4"
              style="width: {content.width}%"
            >
              {#each content.questions as question}
                <div class="bg-transparent">
                  <QuestionCard
                    {question}
                    answer={props.answers.find((a: Answer) => a.questionId === question.id)}
                    onAnswer={props.onAnswer}
                  />
                </div>
              {/each}
            </div>
          {/if}
        {/each}
      </div>
    </div>
  {/each}
</div>

<style>
  :global(.question-card) {
    box-shadow: none !important;
    background: transparent !important;
    padding: 0 !important;
  }
</style>