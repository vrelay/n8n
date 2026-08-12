// LMS: validate imported lesson guide JSON before starting the runner
import type {
	LmsGuide,
	LmsGuideHighlight,
	LmsGuidePlacement,
	LmsGuideStep,
	LmsGuideWaitFor,
} from './types';

const HIGHLIGHT_KINDS = ['ui', 'node'] as const;
const WAIT_KINDS = ['manual', 'nodeAdded', 'nodesConnected', 'nodeHasParam'] as const;
const PLACEMENTS = ['top', 'bottom', 'left', 'right', 'auto'] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validateHighlight(raw: unknown, stepId: string): LmsGuideHighlight {
	if (!isRecord(raw) || !HIGHLIGHT_KINDS.includes(raw.kind as never)) {
		throw new Error(`Step "${stepId}": highlight.kind must be "ui" or "node"`);
	}
	if (raw.kind === 'ui') {
		if (typeof raw.testId !== 'string' || !raw.testId) {
			throw new Error(`Step "${stepId}": highlight.testId must be a non-empty string`);
		}
		return { kind: 'ui', testId: raw.testId };
	}
	const node: LmsGuideHighlight = { kind: 'node' };
	if (typeof raw.type === 'string' && raw.type) node.type = raw.type;
	if (typeof raw.name === 'string' && raw.name) node.name = raw.name;
	if (raw.index !== undefined) {
		if (typeof raw.index !== 'number' || raw.index < 0 || !Number.isInteger(raw.index)) {
			throw new Error(`Step "${stepId}": highlight.index must be a non-negative integer`);
		}
		node.index = raw.index;
	}
	if (!node.type && !node.name) {
		throw new Error(`Step "${stepId}": node highlight needs a type or a name`);
	}
	return node;
}

function validateWaitFor(raw: unknown, stepId: string): LmsGuideWaitFor | undefined {
	if (raw === undefined) return undefined;
	if (!isRecord(raw) || !WAIT_KINDS.includes(raw.kind as never)) {
		throw new Error(
			`Step "${stepId}": waitFor.kind must be one of ${WAIT_KINDS.map((k) => `"${k}"`).join(', ')}`,
		);
	}
	switch (raw.kind) {
		case 'manual':
			return { kind: 'manual' };
		case 'nodeAdded': {
			if (typeof raw.type !== 'string' || !raw.type) {
				throw new Error(`Step "${stepId}": waitFor.type must be a non-empty string`);
			}
			const wait: LmsGuideWaitFor = { kind: 'nodeAdded', type: raw.type };
			if (raw.count !== undefined) {
				if (typeof raw.count !== 'number' || raw.count < 1 || !Number.isInteger(raw.count)) {
					throw new Error(`Step "${stepId}": waitFor.count must be a positive integer`);
				}
				wait.count = raw.count;
			}
			return wait;
		}
		case 'nodesConnected': {
			for (const key of ['fromType', 'toType'] as const) {
				if (typeof raw[key] !== 'string' || !raw[key]) {
					throw new Error(`Step "${stepId}": waitFor.${key} must be a non-empty string`);
				}
			}
			const wait: LmsGuideWaitFor = {
				kind: 'nodesConnected',
				fromType: raw.fromType as string,
				toType: raw.toType as string,
			};
			if (typeof raw.fromName === 'string' && raw.fromName) wait.fromName = raw.fromName;
			if (typeof raw.toName === 'string' && raw.toName) wait.toName = raw.toName;
			return wait;
		}
		default: {
			if (typeof raw.type !== 'string' || !raw.type || typeof raw.path !== 'string' || !raw.path) {
				throw new Error(`Step "${stepId}": waitFor.type and waitFor.path must be non-empty strings`);
			}
			const wait: LmsGuideWaitFor = {
				kind: 'nodeHasParam',
				type: raw.type,
				path: raw.path,
			};
			if ('equals' in raw) wait.equals = raw.equals;
			if (typeof raw.name === 'string' && raw.name) wait.name = raw.name;
			return wait;
		}
	}
}

function validateActions(raw: unknown, stepId: string): string[] | undefined {
	if (raw === undefined) return undefined;
	if (!Array.isArray(raw) || raw.length === 0) {
		throw new Error(`Step "${stepId}": actions must be a non-empty array of strings`);
	}
	for (const [index, action] of raw.entries()) {
		if (typeof action !== 'string' || !action.trim()) {
			throw new Error(`Step "${stepId}": actions[${index}] must be a non-empty string`);
		}
	}
	return raw as string[];
}

function validatePlacement(raw: unknown, stepId: string): LmsGuidePlacement | undefined {
	if (raw === undefined) return undefined;
	if (typeof raw !== 'string' || !PLACEMENTS.includes(raw as LmsGuidePlacement)) {
		throw new Error(
			`Step "${stepId}": placement must be one of ${PLACEMENTS.map((p) => `"${p}"`).join(', ')}`,
		);
	}
	return raw as LmsGuidePlacement;
}

function validateStep(raw: unknown, index: number): LmsGuideStep {
	const fallbackId = `#${index + 1}`;
	if (!isRecord(raw)) {
		throw new Error(`Step ${fallbackId}: must be an object`);
	}
	const id = typeof raw.id === 'string' && raw.id ? raw.id : fallbackId;
	if (typeof raw.title !== 'string' || !raw.title) {
		throw new Error(`Step "${id}": title must be a non-empty string`);
	}
	return {
		id,
		title: raw.title,
		body: typeof raw.body === 'string' ? raw.body : undefined,
		actions: validateActions(raw.actions, id),
		highlight: validateHighlight(raw.highlight, id),
		waitFor: validateWaitFor(raw.waitFor, id),
		placement: validatePlacement(raw.placement, id),
	};
}

export function parseLmsGuide(jsonText: string): LmsGuide {
	let raw: unknown;
	try {
		raw = JSON.parse(jsonText);
	} catch {
		throw new Error('Not valid JSON — pick a lesson guide file exported for the LMS.');
	}
	if (!isRecord(raw) || raw.version !== 1) {
		throw new Error('Guide must be an object with "version": 1');
	}
	if (typeof raw.id !== 'string' || !raw.id || typeof raw.title !== 'string' || !raw.title) {
		throw new Error('Guide needs non-empty "id" and "title" strings');
	}
	if (!Array.isArray(raw.steps) || raw.steps.length === 0) {
		throw new Error('Guide needs a non-empty "steps" array');
	}
	return {
		version: 1,
		id: raw.id,
		title: raw.title,
		steps: raw.steps.map((step, index) => validateStep(step, index)),
	};
}
