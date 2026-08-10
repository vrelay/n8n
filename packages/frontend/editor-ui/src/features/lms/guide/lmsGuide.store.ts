// LMS: build-along lesson guide state — started from the workflow ⋯ menu "Import lesson guide"
import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import type { LmsGuide } from './types';

export const useLmsGuideStore = defineStore('lmsGuide', () => {
	const guide = ref<LmsGuide | null>(null);
	const stepIndex = ref(0);
	// Set when a waitFor auto-advanced the tour; Previous backtracks without re-locking the student.
	const autoAdvancedToIndex = ref<number | null>(null);

	const active = computed(() => guide.value !== null);
	const currentStep = computed(() => guide.value?.steps[stepIndex.value] ?? null);
	const isLastStep = computed(
		() => guide.value !== null && stepIndex.value === guide.value.steps.length - 1,
	);

	function start(nextGuide: LmsGuide) {
		guide.value = nextGuide;
		stepIndex.value = 0;
		autoAdvancedToIndex.value = null;
	}

	function stop() {
		guide.value = null;
		stepIndex.value = 0;
		autoAdvancedToIndex.value = null;
	}

	function goTo(index: number) {
		if (!guide.value) return;
		stepIndex.value = Math.max(0, Math.min(index, guide.value.steps.length - 1));
		autoAdvancedToIndex.value = null;
	}

	function next() {
		goTo(stepIndex.value + 1);
	}

	function previous() {
		goTo(stepIndex.value - 1);
	}

	function markAutoAdvanced(index: number) {
		autoAdvancedToIndex.value = index;
	}

	return {
		guide,
		stepIndex,
		autoAdvancedToIndex,
		active,
		currentStep,
		isLastStep,
		start,
		stop,
		goTo,
		next,
		previous,
		markAutoAdvanced,
	};
});
