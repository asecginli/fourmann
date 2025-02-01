<script lang="ts">
  import type { Question, Answer } from '$lib/types';

  const props = $props<{
    question: Question;
    answer: Answer | undefined;
    onAnswer: (answer: Answer) => void;
  }>();

  // Initialize value from answer if it exists
  let value = $state(props.answer?.value?.[0] || '');

  // Watch for answer changes from QuizState
  $effect(() => {
    value = props.answer?.value?.[0] || '';
  });

  function handleInput(event: Event) {
    const input = event.target as HTMLInputElement;
    value = input.value;
    props.onAnswer({
      questionId: props.question.id,
      questionName: props.question.name,
      questionText: props.question.text,
      value: [input.value]
    });
  }

  function handleBlur() {
    props.onAnswer({
      questionId: props.question.id,
      questionName: props.question.name,
      questionText: props.question.text,
      value: [value]
    });
  }
</script>

<input
  type="text"
  value={value}
  oninput={handleInput}
  onblur={handleBlur}
  class="w-full p-4 border border-[#dadce0] rounded-lg focus:ring-2 focus:ring-[#1a73e8] focus:border-[#1a73e8] outline-none transition-all duration-300 text-[#202124]"
  style="font-family: var(--font-family)"
  placeholder="Type your answer here..."
/>