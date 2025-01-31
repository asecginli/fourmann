<script lang="ts">
  import type { Question, Answer } from '$lib/types';

  const props = $props<{
    question: Question;
    answer: Answer | undefined;
    onAnswer: (answer: Answer, error?: string) => void;
  }>();

  // Initialize selectedValues from answer if it exists
  let selectedValues = $state<string[]>(props.answer?.value || []);

  // Watch for answer changes from QuizState
  $effect(() => {
    selectedValues = props.answer?.value || [];
  });

  let error = $state<string | null>(null);

  function validateAndSave(newValues: string[]) {
    if (props.question.maxValue !== undefined && newValues.length > props.question.maxValue) {
      error = `You can select up to ${props.question.maxValue} options`;
      props.onAnswer({
        questionId: props.question.id,
        value: selectedValues
      }, error);
      return false;
    }
    error = null;
    selectedValues = newValues;
    props.onAnswer({
      questionId: props.question.id,
      value: newValues
    }, null);
    return true;
  }

  function handleChange(value: string) {
    let newValues: string[];
    
    if (props.question.allowMultiple) {
      const index = selectedValues.indexOf(value);
      if (index === -1) {
        newValues = [...selectedValues, value];
      } else {
        newValues = selectedValues.filter(v => v !== value);
      }
    } else {
      newValues = [value];
    }
    
    validateAndSave(newValues);
  }

  function handleBlur() {
    validateAndSave(selectedValues);
  }
</script>

<div class="space-y-4">
  {#each props.question.choices || [] as choice}
    <label class="flex items-center space-x-3 p-4 rounded-lg border border-[#dadce0] hover:border-[#1a73e8] hover:bg-[#f8f9fa] cursor-pointer transition-all duration-300">
      <input
        type={props.question.allowMultiple ? 'checkbox' : 'radio'}
        name={props.question.id}
        value={choice.value}
        checked={selectedValues.includes(choice.value)}
        onchange={() => handleChange(choice.value)}
        onblur={handleBlur}
        class="h-5 w-5 text-[#1a73e8] border-[#dadce0] focus:ring-[#1a73e8] transition-all duration-300"
        aria-invalid={!!error}
        aria-describedby={error ? `${props.question.id}-error` : undefined}
      />
      <span class="text-[#202124] font-medium">{choice.text}</span>
    </label>
  {/each}
  
  {#if error}
    <p 
      id="{props.question.id}-error" 
      class="text-[#d93025] text-sm mt-2"
      role="alert"
    >
      {error}
    </p>
  {/if}
</div>