<script lang="ts">
  import type { Question, Answer } from '$lib/types';

  const props = $props<{
    question: Question;
    answer: Answer | undefined;
    onAnswer: (answer: Answer, error?: string) => void;
  }>();

  // Initialize value from answer if it exists
  let value = $state(props.answer?.value?.[0] || '');

  // Watch for answer changes from QuizState
  $effect(() => {
    value = props.answer?.value?.[0] || '';
  });

  let error = $state<string | null>(null);

  function validateAndSave(rawValue: string) {
    const pattern = props.question.type === 'numeric' ? /^\d*$/ : /^\d*\.?\d*$/;
    if (!pattern.test(rawValue)) {
      return;
    }

    const numValue = props.question.type === 'numeric' 
      ? parseInt(rawValue, 10)
      : parseFloat(rawValue);
    
    if (rawValue === '' || isNaN(numValue)) {
      value = '';
      error = props.question.required ? 'This field is required' : null;
      props.onAnswer({
        questionId: props.question.id,
        questionName: props.question.name,
        questionText: props.question.text,
        value: ['']
      }, error);
      return;
    }

    if (props.question.type === 'numeric' && !Number.isInteger(numValue)) {
      return;
    }

    if (props.question.maxValue !== undefined && numValue > props.question.maxValue) {
      error = `Value cannot exceed ${props.question.maxValue}`;
      props.onAnswer({
        questionId: props.question.id,
        questionName: props.question.name,
        questionText: props.question.text,
        value: [rawValue]
      }, error);
      return;
    }
    if (props.question.minValue !== undefined && numValue < props.question.minValue) {
      error = `Value must be at least ${props.question.minValue}`;
      props.onAnswer({
        questionId: props.question.id,
        questionName: props.question.name,
        questionText: props.question.text,
        value: [rawValue]
      }, error);
      return;
    }
    
    error = null;
    value = rawValue;
    props.onAnswer({
      questionId: props.question.id,
      questionName: props.question.name,
      questionText: props.question.text,
      value: [rawValue]
    }, null);
  }

  function handleInput(event: Event) {
    const input = event.target as HTMLInputElement;
    validateAndSave(input.value);
  }

  function handleBlur(event: Event) {
    const input = event.target as HTMLInputElement;
    validateAndSave(input.value);
  }
</script>

<div class="space-y-2">
  <input
    type="text" 
    inputmode="numeric"
    pattern={props.question.type === 'numeric' ? '[0-9]*' : '[0-9]*\\.?[0-9]*'}
    value={value}
    oninput={handleInput}
    onblur={handleBlur}
    class="w-full p-4 border border-[#dadce0] rounded-lg focus:ring-2 focus:ring-[#1a73e8] focus:border-[#1a73e8] outline-none transition-all duration-300 text-[#202124]"
    class:border-[#d93025]={error}
    placeholder={props.question.type === 'numeric' ? 'Enter a whole number...' : 'Enter a number...'}
    aria-label={props.question.text}
    aria-invalid={!!error}
    aria-describedby={error ? `${props.question.id}-error` : undefined}
  />
  
  {#if error}
    <p 
      id="{props.question.id}-error" 
      class="text-[#d93025] text-sm"
      role="alert"
    >
      {error}
    </p>
  {/if}
</div>