<script lang="ts">
  const props = $props<{
    canGoBack: boolean;
    canGoForward: boolean;
    isLastQuestion: boolean;
    submitRemarks?: string;
    isFirstPage: boolean;
    submitted: boolean;
    isLastPage: boolean;
    onPrevious: () => void;
    onNext: () => void;
  }>();
</script>

<div class="flex flex-col items-center mt-8 max-w-[960px] mx-auto">
  <div class="flex justify-between w-full">
    {#if props.canGoBack && !props.submitted}
      <button
        class="px-6 py-2 rounded-lg bg-white border border-[#dadce0] text-[#1a73e8] hover:bg-[#f8f9fa] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium"
        onclick={props.onPrevious}
      >
        Previous
      </button>
    {:else}
      <div></div>
    {/if}
    
    {#if props.isFirstPage && props.submitted}
      <div class="text-[#5f6368] bg-[#f8f9fa] px-4 py-2 rounded-lg">Responses for this form have already been submitted</div>
    {:else if !props.isLastPage && !props.submitted}
      <button
        class="px-6 py-2 rounded-lg bg-[#1a73e8] text-white hover:bg-[#1557b0] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium shadow-sm"
        disabled={!props.canGoForward}
        onclick={props.onNext}
      >
        {props.isLastQuestion ? 'Submit' : 'Next'}
      </button>
    {/if}
  </div>

  {#if props.isLastQuestion && props.submitRemarks}
    <p class="text-[#5f6368] text-sm mt-4 text-center">{props.submitRemarks}</p>
  {/if}
</div>