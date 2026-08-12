// LMS: auto-start a bundled lesson when opening /workflow/new?lesson=<id>
import { ref, watch, type Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from '@n8n/composables/useToast';
import { useI18n } from '@n8n/i18n';
import type { WorkflowDocumentStore } from '@/app/stores/workflowDocument.store';
import { loadLessonGuide } from './lessonRegistry';
import { startLmsGuide } from './startLmsGuide';

type WorkflowDocumentStoreRef = Ref<WorkflowDocumentStore | null>;

export function useLmsLessonDeepLink(options: {
	isLoading: Ref<boolean>;
	currentWorkflowDocumentStore: WorkflowDocumentStoreRef;
}) {
	const route = useRoute();
	const router = useRouter();
	const toast = useToast();
	const locale = useI18n();
	const startedLessonId = ref<string | null>(null);

	function getLessonIdFromQuery(): string | undefined {
		const lesson = route.query.lesson;
		return typeof lesson === 'string' && lesson.length > 0 ? lesson : undefined;
	}

	async function tryStartLessonFromQuery() {
		const lessonId = getLessonIdFromQuery();
		if (!lessonId) return;
		if (startedLessonId.value === lessonId) return;
		if (options.isLoading.value) return;
		if (!options.currentWorkflowDocumentStore.value) return;
		if (route.query.new !== 'true') return;

		try {
			startLmsGuide(loadLessonGuide(lessonId), { showSuccessToast: false });
			startedLessonId.value = lessonId;

			const { lesson: _lesson, ...restQuery } = route.query;
			await router.replace({ ...route, query: restQuery });
		} catch (error) {
			toast.showError(error as Error, locale.baseText('generic.invalidGuide'));
		}
	}

	watch(
		() => [
			getLessonIdFromQuery(),
			options.isLoading.value,
			options.currentWorkflowDocumentStore.value,
			route.query.new,
		] as const,
		() => {
			void tryStartLessonFromQuery();
		},
		{ immediate: true, flush: 'post' },
	);
}
