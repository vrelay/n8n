<script lang="ts" setup>
// LMS: build-along overlay — v-onboarding renders the highlight; the runner gates Next on canvas state
import { computed, inject, onBeforeUnmount, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { VOnboardingWrapper, VOnboardingStep, useVOnboarding } from 'v-onboarding';
import 'v-onboarding/dist/style.css';
import { N8nButton, N8nText } from '@n8n/design-system';
import { useLmsGuideStore } from './lmsGuide.store';
import { useLmsGuideRunner } from './useLmsGuideRunner';
import { WorkflowDocumentStoreKey } from '@/app/constants/injectionKeys';

const guideStore = useLmsGuideStore();
const { active, guide, stepIndex } = storeToRefs(guideStore);

// The workflow document store is provided by the editor; fall back to empty sources
// on routes (e.g. onboarding redirect) that never provide one.
const workflowDocumentStore = inject(WorkflowDocumentStoreKey, null);
const allNodes = computed(() => workflowDocumentStore?.value?.allNodes ?? []);
const connectionsBySourceNode = computed(
	() => workflowDocumentStore?.value?.connectionsBySourceNode ?? {},
);

const { vOnboardingSteps, currentStepComplete, maybeAutoAdvance } = useLmsGuideRunner(
	allNodes,
	connectionsBySourceNode,
);

const wrapper = ref<InstanceType<typeof VOnboardingWrapper> | null>(null);
const { start, finish, goToStep } = useVOnboarding(wrapper);

const stepCount = computed(() => guide.value?.steps.length ?? 0);

// LMS: no dim overlay — students click + and use the node picker sidebar, NDV, etc.
// while guided; dimming those panels makes the lesson unusable. Also disable
// preventOverlayInteraction (v-onboarding default) so pointer-events stay on the page.
const wrapperOptions = {
	overlay: {
		enabled: false,
		preventOverlayInteraction: false,
	},
	scrollToStep: { enabled: false },
};

watch(
	[active, () => guide.value?.id],
	([isActive]) => {
		if (isActive && vOnboardingSteps.value.length > 0) {
			// Wait a tick for the canvas to paint before resolving the first highlight.
			setTimeout(() => start(), 100);
		} else {
			finish();
		}
	},
	{ flush: 'post' },
);

watch(
	stepIndex,
	(index) => {
		if (!active.value) return;
		goToStep(index);
	},
	{ flush: 'post' },
);

watch(
	[currentStepComplete, stepIndex],
	() => {
		maybeAutoAdvance();
	},
	{ flush: 'post' },
);

function onNext(nextFn: () => void) {
	if (!currentStepComplete.value) return;
	if (stepIndex.value >= stepCount.value - 1) {
		guideStore.stop();
		return;
	}
	guideStore.next();
	nextFn();
}

function onPrevious(previousFn: () => void) {
	guideStore.previous();
	previousFn();
}

function onExit() {
	guideStore.stop();
}

onBeforeUnmount(() => {
	finish();
});
</script>

<template>
	<VOnboardingWrapper v-if="active" ref="wrapper" :steps="vOnboardingSteps" :options="wrapperOptions">
		<template #default="{ step, next, previous, isFirst, isLast }">
			<VOnboardingStep>
				<div :class="$style.card">
					<N8nText tag="h3" :bold="true" :class="$style.title">{{ step.content.title }}</N8nText>
					<N8nText v-if="step.content.description" tag="p" :class="$style.body">
						{{ step.content.description }}
					</N8nText>
					<div :class="$style.footer">
						<N8nText size="small" color="text-light">
							{{ stepIndex + 1 }} / {{ stepCount }}
						</N8nText>
						<div :class="$style.actions">
							<N8nButton type="tertiary" size="small" label="Exit" @click="onExit" />
							<N8nButton
								v-if="!isFirst"
								type="secondary"
								size="small"
								label="Back"
								@click="onPrevious(previous)"
							/>
							<N8nButton
								size="small"
								:label="isLast ? 'Finish' : 'Next'"
								:disabled="!currentStepComplete"
								@click="onNext(next)"
							/>
						</div>
					</div>
				</div>
			</VOnboardingStep>
		</template>
	</VOnboardingWrapper>
</template>

<style lang="scss" module>
.card {
	display: flex;
	flex-direction: column;
	gap: var(--spacing--2xs);
	max-width: 320px;
	padding: var(--spacing--sm);
	background: var(--color--background--light-3);
	border: var(--border);
	border-radius: var(--radius);
}

.title {
	margin: 0;
}

.body {
	margin: 0;
}

.footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: var(--spacing--2xs);
}

.actions {
	display: flex;
	gap: var(--spacing--3xs);
}
</style>
