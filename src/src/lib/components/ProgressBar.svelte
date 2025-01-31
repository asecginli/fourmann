<script lang="ts">
  const props = $props<{
    currentPage: number;
    totalPages: number;
  }>();

  let progress = $derived(((props.currentPage + 1) / props.totalPages) * 100);
</script>

<div class="fixed top-0 left-0 right-0 z-50">
  <div class="h-1 w-full bg-[#e8eaed]">
    <div 
      class="h-full bg-[#1a73e8] transition-all duration-300 ease-in-out"
      style="width: {progress}%"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin="0"
      aria-valuemax="100"
      aria-label="Quiz progress"
    ></div>
  </div>
</div>

<div class="h-2" aria-hidden="true"></div>