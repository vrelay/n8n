// LMS: build-along lesson guide schema (JSON authors import via the workflow ⋯ menu)

export type LmsGuideHighlight =
	| { kind: 'ui'; testId: string }
	| { kind: 'node'; type?: string; name?: string };

export type LmsGuideWaitFor =
	| { kind: 'manual' }
	| { kind: 'nodeAdded'; type: string }
	| { kind: 'nodesConnected'; fromType: string; toType: string }
	| { kind: 'nodeHasParam'; type: string; path: string; equals?: unknown };

export interface LmsGuideStep {
	id: string;
	title: string;
	body?: string;
	highlight: LmsGuideHighlight;
	waitFor?: LmsGuideWaitFor;
}

export interface LmsGuide {
	version: 1;
	id: string;
	title: string;
	steps: LmsGuideStep[];
}
