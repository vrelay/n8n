// LMS: build-along runner — gates Next / auto-advance on real canvas state
import { computed, type Ref } from 'vue';
import { storeToRefs } from 'pinia';
import type { INodeUi } from '@/Interface';
import type { IConnections } from 'n8n-workflow';
import { useLmsGuideStore } from './lmsGuide.store';
import { evaluateLmsGuideWaitFor } from './evaluateWaitFor';

type WorkflowNodesSource = Ref<readonly INodeUi[]>;
type WorkflowConnectionsSource = Ref<IConnections>;

export function useLmsGuideRunner(
	allNodes: WorkflowNodesSource,
	connectionsBySourceNode: WorkflowConnectionsSource,
) {
	const guideStore = useLmsGuideStore();
	const { guide, stepIndex, autoAdvancedToIndex } = storeToRefs(guideStore);

	const currentStepComplete = computed(() => {
		const step = guide.value?.steps[stepIndex.value];
		if (!step) return false;
		return evaluateLmsGuideWaitFor(step.waitFor, allNodes.value, connectionsBySourceNode.value);
	});

	/** Steps the student must explicitly confirm with Next — never auto-skip these. */
	function isManualStep(index: number): boolean {
		const waitFor = guide.value?.steps[index]?.waitFor;
		return !waitFor || waitFor.kind === 'manual';
	}

	/**
	 * Auto-advance once when a canvas check (nodeAdded, nodesConnected, …) passes.
	 * Manual steps always wait for the student to press Next.
	 */
	function maybeAutoAdvance() {
		if (!guideStore.active) return;
		if (isManualStep(stepIndex.value)) return;
		if (!currentStepComplete.value) return;
		if (guideStore.isLastStep) return;
		if (autoAdvancedToIndex.value === stepIndex.value + 1) return;
		guideStore.markAutoAdvanced(stepIndex.value + 1);
		guideStore.next();
	}

	return {
		guideStore,
		currentStepComplete,
		maybeAutoAdvance,
	};
}
