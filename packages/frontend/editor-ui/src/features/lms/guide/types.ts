// LMS: build-along lesson guide schema (JSON authors import via the workflow ⋯ menu)

export type LmsGuideHighlight =
	| { kind: 'ui'; testId: string }
	| { kind: 'node'; type?: string; name?: string; index?: number };

export type LmsGuideWaitFor =
	| { kind: 'manual' }
	| { kind: 'nodeAdded'; type: string; count?: number }
	| {
			kind: 'nodesConnected';
			fromType: string;
			toType: string;
			fromName?: string;
			toName?: string;
	  }
	| { kind: 'nodeHasParam'; type: string; path: string; equals?: unknown; name?: string };

export type LmsGuidePlacement = 'top' | 'bottom' | 'left' | 'right' | 'auto';

export interface LmsGuideStep {
	id: string;
	title: string;
	body?: string;
	actions?: string[];
	highlight: LmsGuideHighlight;
	waitFor?: LmsGuideWaitFor;
	placement?: LmsGuidePlacement;
}

export interface LmsGuide {
	version: 1;
	id: string;
	title: string;
	steps: LmsGuideStep[];
}
