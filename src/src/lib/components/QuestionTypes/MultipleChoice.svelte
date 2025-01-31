<script lang="ts">
  import type { Question, Answer } from '$lib/types';

  const props = $props<{
    question: Question;
    answer: Answer | undefined;
    onAnswer: (answer: Answer, error?: string) => void;
  }>();

  // Initialize selectedValues from answer if it exists
  let selectedValues = $state<string[]>(props.answer?.value || []);
  let otherInputValue = $state<string>('');

  // Watch for answer changes from QuizState
  $effect(() => {
    if (props.answer) {
      // If 'other' is in the values, find the custom value
      const otherIndex = props.answer.value.findIndex(v => !props.question.choices?.some(c => c.value === v));
      if (otherIndex !== -1) {
        otherInputValue = props.answer.value[otherIndex];
        selectedValues = ['other'];
      } else {
        selectedValues = props.answer.value;
        otherInputValue = '';
      }
    }
  });

  let error = $state<string | null>(null);

  // Find if this question has an "other" choice option
  const hasOtherChoice = props.question.choices?.some(choice => choice.other === true);

  if (hasOtherChoice) {
    console.log('hasOtherChoice=true; question.name=' + props.question.name, hasOtherChoice);
  }

  function validateAndSave(newValues: string[], newOtherValue?: string, validateOther: boolean = false) {
    // Only validate other value when explicitly requested (e.g., when moving to next page)
    if (validateOther && newValues.includes('other') && (!newOtherValue || !newOtherValue.trim())) {
      error = 'Please specify a value for "Other"';
      return false;
    }

    if (props.question.maxValue !== undefined && newValues.length > props.question.maxValue) {
      error = `You can select up to ${props.question.maxValue} options`;
      return false;
    }

    error = null;
    selectedValues = newValues;
    if (newOtherValue !== undefined) {
      otherInputValue = newOtherValue;
    }
    
    // Replace 'other' with the actual input value in the final answer
    const finalValues = newValues.map(v => 
      v === 'other' && otherInputValue ? otherInputValue : v
    ).filter(v => v !== '');

    props.onAnswer({
      questionId: props.question.id,
      value: finalValues,
      questionName: props.question.name || props.question.text,  // Updated to use questionName
      questionText: props.question.text
    }, error);
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
    
    // Don't validate other value when just selecting the option
    validateAndSave(newValues, value === 'other' ? otherInputValue : undefined, false);
  }

  function handleOtherChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const newOtherValue = input.value;
    
    if (!selectedValues.includes('other')) {
      selectedValues = props.question.allowMultiple ? 
        [...selectedValues, 'other'] : ['other'];
    }
    
    // Validate other value when the user types in the input
    validateAndSave(selectedValues, newOtherValue, true);
  }

  // Add a function to validate the entire question
  export function validate(): boolean {
    return validateAndSave(selectedValues, otherInputValue, true);
  }
</script>

<div class="space-y-4">
  {#each props.question.choices || [] as choice}
    {#if !choice.other}
      <label class="flex items-center space-x-3 p-4 rounded-lg border border-[#dadce0] hover:border-[#1a73e8] hover:bg-[#f8f9fa] cursor-pointer transition-all duration-300">
        <input
          type={props.question.allowMultiple ? 'checkbox' : 'radio'}
          name={props.question.id}
          value={choice.value}
          checked={selectedValues.includes(choice.value)}
          onchange={() => handleChange(choice.value)}
          class="h-5 w-5 text-[#1a73e8] border-[#dadce0] focus:ring-[#1a73e8] transition-all duration-300"
          aria-invalid={!!error}
          aria-describedby={error ? `${props.question.id}-error` : undefined}
        />
        <span class="text-[#202124] font-medium">{choice.text}</span>
      </label>
    {/if}
  {/each}

  {#if hasOtherChoice}
    <div class="space-y-3">
      <label class="flex items-center space-x-3 p-4 rounded-lg border border-[#dadce0] hover:border-[#1a73e8] hover:bg-[#f8f9fa] cursor-pointer transition-all duration-300">
        <input
          type={props.question.allowMultiple ? 'checkbox' : 'radio'}
          name={props.question.id}
          value="other"
          checked={selectedValues.includes('other')}
          onchange={() => handleChange('other')}
          class="h-5 w-5 text-[#1a73e8] border-[#dadce0] focus:ring-[#1a73e8] transition-all duration-300"
        />
        <span class="text-[#202124] font-medium">Other</span>
      </label>

      <div class="pl-12" class:hidden={!selectedValues.includes('other')}>
        <input
          type="text"
          placeholder="Please specify..."
          value={otherInputValue}
          onchange={handleOtherChange}
          class="w-full p-3 border border-[#dadce0] rounded-md focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-all duration-300"
          aria-invalid={!!error}
        />
      </div>
    </div>
  {/if}
  
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