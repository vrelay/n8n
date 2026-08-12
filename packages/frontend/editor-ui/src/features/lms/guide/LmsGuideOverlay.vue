<script lang="ts" setup>
// LMS: build-along panel — fixed on the left; runner gates Next on canvas state
import { computed, inject, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useStyles } from '@n8n/composables/useStyles';
import { N8nButton, N8nText } from '@n8n/design-system';
import { useLmsGuideStore } from './lmsGuide.store';
import { useLmsGuideRunner } from './useLmsGuideRunner';
import { WorkflowDocumentStoreKey } from '@/app/constants/injectionKeys';

const { APP_Z_INDEXES } = useStyles();

const guideStore = useLmsGuideStore();
const { active, guide, stepIndex } = storeToRefs(guideStore);

const workflowDocumentStore = inject(WorkflowDocumentStoreKey, null);
const allNodes = computed(() => workflowDocumentStore?.value?.allNodes ?? []);
const connectionsBySourceNode = computed(
	() => workflowDocumentStore?.value?.connectionsBySourceNode ?? {},
);

const { currentStepComplete, maybeAutoAdvance } = useLmsGuideRunner(
	allNodes,
	connectionsBySourceNode,
);

const stepCount = computed(() => guide.value?.steps.length ?? 0);
const currentStep = computed(() => guide.value?.steps[stepIndex.value] ?? null);
const isFirstStep = computed(() => stepIndex.value === 0);
const isLastStep = computed(() => stepIndex.value >= stepCount.value - 1);

const showWaitHint = computed(() => {
	const step = currentStep.value;
	if (!step?.waitFor || step.waitFor.kind === 'manual') return false;
	return !currentStepComplete.value;
});

watch([currentStepComplete, stepIndex, active], () => {
	if (!active.value) return;
	maybeAutoAdvance();
});

function onNext() {
	if (!currentStepComplete.value) return;
	if (isLastStep.value) {
		guideStore.stop();
		return;
	}
	guideStore.next();
}

function onPrevious() {
	guideStore.previous();
}

function onExit() {
	guideStore.stop();
}
</script>

<template>
	<aside
		v-if="active && currentStep"
		:class="$style.panel"
		:style="{ zIndex: APP_Z_INDEXES.LMS_GUIDE_PANEL }"
		data-test-id="lms-guide-panel"
		@mousedown.stop
	>
		<N8nText tag="h3" :bold="true" :class="$style.title">{{ currentStep.title }}</N8nText>
		<N8nText v-if="currentStep.body" tag="p" :class="$style.body">
			{{ currentStep.body }}
		</N8nText>
		<ol v-if="currentStep.actions?.length" :class="$style.actionList">
			<li v-for="(action, actionIndex) in currentStep.actions" :key="actionIndex">
				<N8nText tag="span">{{ action }}</N8nText>
			</li>
		</ol>
		<N8nText v-if="showWaitHint" tag="p" size="small" color="text-light" :class="$style.hint">
			Do the steps above first — Next unlocks when you are done.
		</N8nText>
		<div :class="$style.footer">
			<N8nText size="small" color="text-light">{{ stepIndex + 1 }} / {{ stepCount }}</N8nText>
			<div :class="$style.buttons">
				<N8nButton type="tertiary" size="small" label="Exit" @click="onExit" />
				<N8nButton
					v-if="!isFirstStep"
					type="secondary"
					size="small"
					label="Back"
					@click="onPrevious"
				/>
				<N8nButton
					size="small"
					:label="isLastStep ? 'Finish' : 'Next'"
					:disabled="!currentStepComplete"
					@click="onNext"
				/>
			</div>
		</div>
	</aside>
</template>

<style lang="scss" module>
.panel {
	position: fixed;
	top: 50%;
	left: 0;
	display: flex;
	flex-direction: column;
	gap: var(--spacing--2xs);
	width: min(360px, 90vw);
	max-height: calc(100vh - var(--spacing--lg) * 2);
	padding: var(--spacing--sm);
	overflow-y: auto;
	background: var(--color--background--light-3);
	border: var(--border);
	border-left: none;
	border-radius: 0 var(--radius) var(--radius) 0;
	box-shadow: var(--shadow);
	transform: translateY(-50%);
}

.title {
	margin: 0;
}

.body {
	margin: 0;
}

.actionList {
	margin: 0;
	padding-left: var(--spacing--sm);
	display: flex;
	flex-direction: column;
	gap: var(--spacing--3xs);
}

.hint {
	margin: 0;
	font-style: italic;
}

.footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: var(--spacing--2xs);
	margin-top: var(--spacing--3xs);
}

.buttons {
	display: flex;
	gap: var(--spacing--3xs);
}
</style>
