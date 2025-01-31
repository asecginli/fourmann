<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import CurrentPage from './lib/components/CurrentPage.svelte';
  import Navigation from './lib/components/Navigation.svelte';
  import ProgressBar from './lib/components/ProgressBar.svelte';
  import LoadingSpinner from './lib/components/LoadingSpinner.svelte';
  import Debug from './lib/components/Debug.svelte';
  import type { Page, Answer, QuizConfig } from './lib/types';
  import { QuestionnaireService } from './lib/services/questionnaireService';
  import { QuizStateService } from './lib/services/quizStateService';

  const props = $props<{
    config: QuizConfig;
  }>();

  const dispatch = createEventDispatcher();

  let pages = $state<Page[]>([]);
  let currentPageIndex = $state(0);
  let answers = $state<Answer[]>([]);
  let errors = $state<Record<string, string>>({});
  let submitted = $state(false);
  let isLoading = $state(true);
  let isSubmitting = $state(false);
  let stateService: QuizStateService;
  let quizState = $state<ReturnType<typeof QuizStateService.prototype.getState>>(null);

  let currentPage = $derived(pages[currentPageIndex]);
  let hasErrors = $derived(Object.keys(errors).length > 0);
  let canGoForward = $derived(
    !hasErrors && 
    !isSubmitting &&
    (currentPage ? getAllQuestionsFromPage(currentPage).every(q => 
      !q.required || answers.some(a => a.questionId === q.id)
    ) : false)
  );
  let showSubmit = $derived(currentPage?.submit === true);
  let isFirstPage = $derived(currentPageIndex === 0);
  let isLastPage = $derived(currentPageIndex === pages.length - 1);
  let showReset = $derived(props.config.debug === true);

  // Watch for page changes and answers
  $effect(() => {
    if (pages.length > 0 && stateService && !submitted) {
      const pageIndex = currentPageIndex; // Watch page index
      const currentAnswers = answers; // Watch answers
      stateService.saveState(currentPageIndex, answers);
      quizState = stateService.getState();
    }
  });

  onMount(async () => {
    try {
      isLoading = true;
      const questionnaireService = QuestionnaireService.getInstance(props.config);
      stateService = QuizStateService.getInstance(props.config);
      
      pages = await questionnaireService.loadQuestionnaire();

      // Load saved state if it exists
      const savedState = stateService.getState();
      if (savedState) {
        if (stateService.isSubmitted()) {
          submitted = true;
          answers = savedState.answers;
          currentPageIndex = 0; // Always show first page for submitted questionnaires
        } else {
          currentPageIndex = savedState.currentPageIndex;
          answers = savedState.answers;
        }
        quizState = savedState;
      }
    } catch (error) {
      console.error('Error loading questionnaire:', error);
    } finally {
      isLoading = false;
    }
  });

  function handleAnswer(answer: Answer, error?: string) {
    const index = answers.findIndex(a => a.questionId === answer.questionId);
    
    if (index >= 0) {
      answers[index] = answer;
    } else {
      answers = [...answers, answer];
    }

    if (error) {
      errors[answer.questionId] = error;
    } else {
      delete errors[answer.questionId];
      errors = errors;
    }

    // Save state immediately when an answer changes
    if (stateService && !submitted) {
      stateService.saveState(currentPageIndex, answers);
      quizState = stateService.getState();
    }
  }

  function getAllQuestionsFromPage(page: Page): Question[] {
    return page.sections.flatMap(section => 
      section.content
        .filter((content): content is QuestionsContent => content.type === 'questions')
        .flatMap(content => content.questions)
    );
  }

  function validateCurrentPage(): boolean {
    let isValid = true;
    errors = {};

    if (!currentPage) return true;

    const questions = getAllQuestionsFromPage(currentPage);
    
    questions.forEach(question => {
      const answer = answers.find(a => a.questionId === question.id);

      if (question.required && !answer) {
        errors[question.id] = 'This field is required';
        isValid = false;
        return;
      }

      if (question.type === 'choices' && answer) {
        const selectedValues = answer.value;
        if (question.maxValue !== undefined && selectedValues.length > question.maxValue) {
          errors[question.id] = `You can select up to ${question.maxValue} options`;
          isValid = false;
        }
      }

      if (question.type === 'numeric' && answer) {
        const value = parseInt(answer.value[0], 10);
        if (question.maxValue !== undefined && value > question.maxValue) {
          errors[question.id] = `Value cannot exceed ${question.maxValue}`;
          isValid = false;
        }
        if (question.minValue !== undefined && value < question.minValue) {
          errors[question.id] = `Value must be at least ${question.minValue}`;
          isValid = false;
        }
      }
    });

    errors = errors;
    return isValid;
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handlePrevious() {
    if (currentPageIndex > 0) {
      // Save current state before navigating
      if (stateService && !submitted) {
        stateService.saveState(currentPageIndex - 1, answers);
        quizState = stateService.getState();
      }
      currentPageIndex--;
      scrollToTop();
    }
  }

  function handleNext() {
    if (submitted) return;

    if (!validateCurrentPage()) {
      return;
    }

    // Save current state before proceeding
    if (stateService && !submitted) {
      stateService.saveState(currentPageIndex, answers);
      quizState = stateService.getState();
    }

    if (currentPage.submit) {
      handleSubmit();
    } else if (currentPageIndex < pages.length - 1) {
      currentPageIndex++;
      // Save state with new page index
      if (stateService && !submitted) {
        stateService.saveState(currentPageIndex + 1, answers);
        quizState = stateService.getState();
      }
      scrollToTop();
    }
  }

  async function handleSubmit() {
    if (!validateCurrentPage()) {
      return;
    }

    try {
      isSubmitting = true;
      
      // Save final state before submitting
      if (stateService && !submitted) {
        stateService.saveState(currentPageIndex, answers);
        quizState = stateService.getState();
      }

      const timestamp = new Date().toISOString();
      const submissionData = {
        answers,
        state: props.config.state,
        timestamp
      };

      if (props.config.on_submit) {
        await Promise.resolve(props.config.on_submit(submissionData));
      }
      
      stateService.markAsSubmitted();
      submitted = true;
      quizState = stateService.getState();

      if (currentPageIndex < pages.length - 1) {
        currentPageIndex++;
        scrollToTop();
      }
      
      dispatch('submit', submissionData);
    } catch (error) {
      console.error('Error submitting questionnaire:', error);
      errors['submit'] = 'Failed to submit the questionnaire. Please try again.';
    } finally {
      isSubmitting = false;
    }
  }

  function handleReset() {
    if (!showReset) return;
    
    stateService.clearState();
    submitted = false;
    answers = [];
    currentPageIndex = 0;
    errors = {};
    quizState = null;
    scrollToTop();
  }
</script>

<main class="min-h-screen bg-[#f8f9fa] py-8 px-4">
  {#if !submitted && pages.length > 0}
    <ProgressBar currentPage={currentPageIndex} totalPages={pages.length} />
  {/if}

  {#if isLoading}
    <div class="max-w-[960px] mx-auto mt-8">
      <div class="bg-white rounded-lg shadow-lg p-6 transition-all duration-300">
        <LoadingSpinner label="Loading questionnaire..." />
      </div>
    </div>
  {:else if currentPage}
    <CurrentPage
      page={currentPage}
      answers={answers}
      submitted={submitted}
      onAnswer={handleAnswer}
    />
    
    {#if errors['submit']}
      <div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm transition-all duration-300 max-w-[960px] mx-auto">
        {errors['submit']}
      </div>
    {/if}

    {#if isSubmitting}
      <div class="mt-6 max-w-[960px] mx-auto">
        <LoadingSpinner label="Submitting your responses..." />
      </div>
    {/if}
    
    <Navigation
      canGoBack={currentPageIndex > 0 && !submitted}
      canGoForward={canGoForward}
      isLastQuestion={showSubmit}
      submitRemarks={currentPage.submitRemarks}
      isFirstPage={isFirstPage}
      submitted={submitted}
      isLastPage={isLastPage}
      onPrevious={handlePrevious}
      onNext={handleNext}
    />

    {#if showReset}
      <Debug 
        state={quizState} 
        page={currentPage}
        answers={answers}
        onReset={handleReset} 
      />
    {/if}
  {:else}
    <div class="text-center">
      <p class="text-gray-600">Loading questions...</p>
    </div>
  {/if}
</main>