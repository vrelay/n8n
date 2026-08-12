// LMS: shared entry to validate and start a lesson guide (file import or deep-link)
import { useToast } from '@n8n/composables/useToast';
import { useI18n } from '@n8n/i18n';
import { useLmsGuideStore } from './lmsGuide.store';
import { parseLmsGuide } from './parseGuide';
import type { LmsGuide } from './types';

export function startLmsGuide(guide: LmsGuide, options?: { showSuccessToast?: boolean }) {
	const lmsGuideStore = useLmsGuideStore();
	const toast = useToast();
	const locale = useI18n();

	lmsGuideStore.start(guide);
	if (options?.showSuccessToast !== false) {
		toast.showMessage({ title: locale.baseText('generic.guideStarted'), type: 'success' });
	}
}

export function startLmsGuideFromJsonString(json: string, options?: { showSuccessToast?: boolean }) {
	try {
		startLmsGuide(parseLmsGuide(json), options);
	} catch (error) {
		const toast = useToast();
		const locale = useI18n();
		toast.showError(error as Error, locale.baseText('generic.invalidGuide'));
		throw error;
	}
}
