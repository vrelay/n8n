// LMS: build-along runner — maps guide steps to v-onboarding and gates Next on real canvas state
import { computed, type Ref } from 'vue';
import { storeToRefs } from 'pinia';
import type { StepEntity } from 'v-onboarding';
import type { INodeUi } from '@/Interface';
import type { IConnections } from 'n8n-workflow';
import { useLmsGuideStore } from './lmsGuide.store';
import { resolveLmsGuideHighlight } from './resolveHighlight';
import { evaluateLmsGuideWaitFor } from './evaluateWaitFor';

type WorkflowNodesSource = Ref<readonly INodeUi[]>;
type WorkflowConnectionsSource = Ref<IConnections>;

export function useLmsGuideRunner(
	allNodes: WorkflowNodesSource,
	connectionsBySourceNode: WorkflowConnectionsSource,
) {
	const guideStore = useLmsGuideStore();
	const { guide, stepIndex, autoAdvancedToIndex } = storeToRefs(guideStore);

	function nodeNameByType(type: string): string | null {
		return allNodes.value.find((node) => node.type === type)?.name ?? null;
	}

	const vOnboardingSteps = computed<StepEntity[]>(
		() =>
			guide.value?.steps.map((step) => ({
				attachTo: {
					element: resolveLmsGuideHighlight(step.highlight, nodeNameByType),
				},
				content: {
					title: step.title,
					description: step.body ?? '',
				},
			})) ?? [],
	);

	const currentStepComplete = computed(() => {
		const step = guide.value?.steps[stepIndex.value];
		if (!step) return false;
		return evaluateLmsGuideWaitFor(step.waitFor, allNodes.value, connectionsBySourceNode.value);
	});

	/**
	 * Auto-advance once when the student finishes the step's waitFor. Previous resets
	 * autoAdvancedToIndex so going back doesn't re-trigger the jump.
	 */
	function maybeAutoAdvance() {
		if (!guideStore.active) return;
		if (!currentStepComplete.value) return;
		if (guideStore.isLastStep) return;
		if (autoAdvancedToIndex.value === stepIndex.value + 1) return;
		guideStore.markAutoAdvanced(stepIndex.value + 1);
		guideStore.next();
	}

	return {
		guideStore,
		vOnboardingSteps,
		currentStepComplete,
		maybeAutoAdvance,
	};
}
