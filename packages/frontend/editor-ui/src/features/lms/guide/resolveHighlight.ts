// LMS: resolve guide highlights to live DOM elements for v-onboarding
import type { LmsGuideHighlight } from './types';

function findCanvasNodeElement(type?: string, name?: string): Element | null {
	// Canvas nodes carry data-node-name (CanvasNode.vue). Match by name first; when the
	// student hasn't named the node yet, the caller passes the node name resolved from
	// the workflow store by type.
	if (name) {
		return document.querySelector(`[data-node-name="${CSS.escape(name)}"]`);
	}
	void type;
	return null;
}

export function resolveLmsGuideHighlight(
	highlight: LmsGuideHighlight,
	nodeNameByType?: (type: string) => string | null,
): () => Element | null {
	return () => {
		if (highlight.kind === 'ui') {
			return document.querySelector(`[data-test-id="${CSS.escape(highlight.testId)}"]`);
		}
		const resolvedName =
			highlight.name ?? (highlight.type ? nodeNameByType?.(highlight.type) : null);
		return findCanvasNodeElement(highlight.type, resolvedName ?? undefined);
	};
}
