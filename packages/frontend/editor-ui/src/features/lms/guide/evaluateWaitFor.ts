// LMS: decide whether the current build-along step is complete
import type { INodeUi } from '@/Interface';
import type { IConnections } from 'n8n-workflow';
import type { LmsGuideWaitFor } from './types';

function getByPath(source: unknown, path: string): unknown {
	return path.split('.').reduce<unknown>((acc, key) => {
		if (typeof acc !== 'object' || acc === null) return undefined;
		return (acc as Record<string, unknown>)[key];
	}, source);
}

function isNonEmpty(value: unknown): boolean {
	if (value === undefined || value === null) return false;
	if (typeof value === 'string') return value.trim().length > 0;
	if (Array.isArray(value)) return value.length > 0;
	if (typeof value === 'object') return Object.keys(value).length > 0;
	return true;
}

export function evaluateLmsGuideWaitFor(
	waitFor: LmsGuideWaitFor | undefined,
	nodes: readonly INodeUi[],
	connectionsBySource: IConnections,
): boolean {
	if (!waitFor || waitFor.kind === 'manual') return true;

	switch (waitFor.kind) {
		case 'nodeAdded': {
			const matching = nodes.filter((node) => node.type === waitFor.type);
			const needed = waitFor.count ?? 1;
			return matching.length >= needed;
		}
		case 'nodesConnected': {
			const from = nodes.find((node) =>
				waitFor.fromName ? node.name === waitFor.fromName : node.type === waitFor.fromType,
			);
			const to = nodes.find((node) =>
				waitFor.toName ? node.name === waitFor.toName : node.type === waitFor.toType,
			);
			if (!from || !to) return false;
			const outgoing = connectionsBySource[from.name]?.main ?? [];
			return outgoing.some((group) =>
				(group ?? []).some((connection) => connection.node === to.name),
			);
		}
		case 'nodeHasParam': {
			const node = nodes.find((candidate) =>
				waitFor.name ? candidate.name === waitFor.name : candidate.type === waitFor.type,
			);
			if (!node) return false;
			const value = getByPath(node.parameters, waitFor.path);
			if ('equals' in waitFor) return value === waitFor.equals;
			return isNonEmpty(value);
		}
	}
}
