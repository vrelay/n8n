// LMS: resolve guide highlights to live DOM elements for v-onboarding
import type { LmsGuideHighlight } from './types';

function findCanvasNodeElement(name: string): Element | null {
	return document.querySelector(`[data-node-name="${CSS.escape(name)}"]`);
}

export function resolveLmsGuideHighlight(
	highlight: LmsGuideHighlight,
	nodeNameByType?: (type: string, index?: number) => string | null,
): () => Element | null {
	return () => {
		if (highlight.kind === 'ui') {
			return document.querySelector(`[data-test-id="${CSS.escape(highlight.testId)}"]`);
		}
		const resolvedName =
			highlight.name ??
			(highlight.type ? nodeNameByType?.(highlight.type, highlight.index) : null);
		if (!resolvedName) return null;
		return findCanvasNodeElement(resolvedName);
	};
}
