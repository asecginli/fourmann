<script lang="ts">
  import type { Question, Answer } from '$lib/types';
  import MultipleChoice from './QuestionTypes/MultipleChoice.svelte';
  import NumericInput from './QuestionTypes/NumericInput.svelte';
  import TextInput from './QuestionTypes/TextInput.svelte';
  import MarkdownEditor from './QuestionTypes/MarkdownEditor.svelte';

  const props = $props<{
    question: Question;
    answer: Answer | undefined;
    onAnswer: (answer: Answer, error?: string) => void;
  }>();

  function handleAnswer(answer: Answer, error?: string) {
    props.onAnswer(answer, error);
  }
</script>

<div class="question-card bg-white rounded-lg shadow-lg p-6 transition-all duration-300">
  <h2 class="text-xl font-medium text-[#202124] mb-4">
    {props.question.text}{#if props.question.required}<span class="text-[#d93025] ml-0.5" aria-label="Required question">*</span>{/if}
  </h2>

  <div class="mt-4">
    {#if props.question.type === 'choices'}
      <MultipleChoice 
        question={props.question} 
        answer={props.answer} 
        onAnswer={handleAnswer} 
      />
    {:else if props.question.type === 'numeric'}
      <NumericInput 
        question={props.question} 
        answer={props.answer} 
        onAnswer={handleAnswer} 
      />
    {:else if props.question.type === 'text'}
      <TextInput 
        question={props.question} 
        answer={props.answer} 
        onAnswer={handleAnswer} 
      />
    {:else if props.question.type === 'markdown'}
      <MarkdownEditor 
        question={props.question} 
        answer={props.answer} 
        onAnswer={handleAnswer} 
      />
    {/if}
  </div>
</div>