import {
	AI_CATEGORY_AGENTS,
	AI_CATEGORY_CHAINS,
	AI_CATEGORY_DOCUMENT_LOADERS,
	AI_CATEGORY_EMBEDDING,
	AI_CATEGORY_LANGUAGE_MODELS,
	AI_CATEGORY_MEMORY,
	AI_CATEGORY_OUTPUTPARSER,
	AI_CATEGORY_RETRIEVERS,
	AI_CATEGORY_TEXT_SPLITTERS,
	AI_CATEGORY_TOOLS,
	AI_CATEGORY_VECTOR_STORES,
	AI_CODE_TOOL_LANGCHAIN_NODE_TYPE,
	AI_NODE_CREATOR_VIEW,
	AI_OTHERS_NODE_CREATOR_VIEW,
	AI_SUBCATEGORY,
	AI_UNCATEGORIZED_CATEGORY,
	AI_WORKFLOW_TOOL_LANGCHAIN_NODE_TYPE,
	CORE_NODES_CATEGORY,
	HUMAN_IN_THE_LOOP_CATEGORY,
	LMS_ALLOWED_NODE_TYPES,
	MESSAGE_AN_AGENT_NODE_TYPE,
	REGULAR_NODE_CREATOR_VIEW,
	TEMPLATE_CATEGORY_AI,
	TRIGGER_NODE_CREATOR_VIEW,
} from '@/app/constants';
import { useNodeTypesStore } from '@/app/stores/nodeTypes.store';
import { useSettingsStore } from '@/app/stores/settings.store';
import type { NodeIconSource } from '@/app/utils/nodeIcon';
import { useEvaluationStore } from '@/features/ai/evaluation.ee/evaluation.store';
import { useTemplatesStore } from '@/features/workflows/templates/templates.store';
import type { SimplifiedNodeType } from '@/Interface';
import type { BaseTextKey } from '@n8n/i18n';
import { useI18n } from '@n8n/i18n';
import camelCase from 'lodash/camelCase';
import type { INodeTypeDescription, NodeConnectionType, Themed } from 'n8n-workflow';
import { isHitlToolType, NodeConnectionTypes } from 'n8n-workflow';
import { getAiTemplatesCallout } from '../nodeCreator.utils';
// LMS: stock Trigger/Regular views removed — getSendAndWaitNodes unused here now
// import { getAiTemplatesCallout, getSendAndWaitNodes } from '../nodeCreator.utils';

export interface NodeViewItemSection {
	key: string;
	title: string;
	items: string[];
}

export interface NodeViewItem {
	key: string;
	type: string;
	properties: {
		key?: string;
		name?: string;
		title?: string;
		icon?: Themed<string>;
		iconProps?: {
			color?: string;
		};
		info?: string;
		url?: string;
		connectionType?: NodeConnectionType;
		panelClass?: string;
		group?: string[];
		sections?: NodeViewItemSection[];
		description?: string;
		displayName?: string;
		tag?: {
			type?: string;
			text?: string;
			preview?: boolean;
		};
		forceIncludeNodes?: string[];
		iconData?: { type: 'file'; fileBuffer: string } | { type: 'icon'; icon: string };
	};
	category?: string | string[];
}

export interface NodeView {
	value: string;
	title: string;
	info?: string;
	subtitle?: string;
	items: NodeViewItem[];
	nodeIcon?: NodeIconSource;
}

function getNodeView(node: INodeTypeDescription | SimplifiedNodeType) {
	return {
		key: node.name,
		type: 'node',
		properties: {
			group: [],
			name: node.name,
			displayName: node.displayName,
			title: node.displayName,
			description: node.description,
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			icon: node.icon!,
			iconUrl: node.iconUrl,
		},
	};
}

/** LMS: flat alphabetical allowlist — skips types not present / hidden in this install */
function getLmsFlatNodeItems(): NodeViewItem[] {
	const nodeTypesStore = useNodeTypesStore();
	return LMS_ALLOWED_NODE_TYPES.map((name) => nodeTypesStore.getNodeType(name))
		.filter((node): node is INodeTypeDescription => !!node && !node.hidden)
		.map(getNodeView)
		.sort((a, b) => (a.properties.displayName ?? '').localeCompare(b.properties.displayName ?? ''));
}

function getAiNodesBySubcategory(nodes: INodeTypeDescription[], subcategory: string) {
	return nodes
		.filter(
			(node) => !node.hidden && node.codex?.subcategories?.[AI_SUBCATEGORY]?.includes(subcategory),
		)
		.map(getNodeView)
		.sort((a, b) => a.properties.displayName.localeCompare(b.properties.displayName));
}

function getEvaluationNode(
	nodeTypesStore: ReturnType<typeof useNodeTypesStore>,
	isEvaluationVariantEnabled: boolean,
) {
	const evaluationNodeStore = nodeTypesStore.getNodeType('n8n-nodes-base.evaluation');

	if (!isEvaluationVariantEnabled || !evaluationNodeStore) {
		return [];
	}

	const evaluationNode = getNodeView(evaluationNodeStore);

	return [
		{
			...evaluationNode,
			properties: {
				...evaluationNode.properties,
				defaults: {
					name: 'Evaluation',
					color: '#c3c9d5',
				},
			},
		},
	];
}

function getMessageAnAgentNode(
	nodeTypesStore: ReturnType<typeof useNodeTypesStore>,
	settingsStore: ReturnType<typeof useSettingsStore>,
) {
	if (!settingsStore.isModuleActive('agents')) return [];

	const node = nodeTypesStore.getNodeType(MESSAGE_AN_AGENT_NODE_TYPE);
	if (!node) return [];

	// The early-preview tag is attached centrally in `applyNodeTags`.
	return [getNodeView(node)];
}

export function AIView(_nodes: SimplifiedNodeType[]): NodeView {
	const i18n = useI18n();
	const nodeTypesStore = useNodeTypesStore();
	const settingsStore = useSettingsStore();
	const templatesStore = useTemplatesStore();
	const evaluationStore = useEvaluationStore();
	const isEvaluationEnabled = evaluationStore.isEvaluationEnabled;

	const evaluationNode = getEvaluationNode(nodeTypesStore, isEvaluationEnabled);

	const chainNodes = getAiNodesBySubcategory(nodeTypesStore.allLatestNodeTypes, AI_CATEGORY_CHAINS);
	const agentNodes = getAiNodesBySubcategory(nodeTypesStore.allLatestNodeTypes, AI_CATEGORY_AGENTS);
	const messageAnAgentNode = getMessageAnAgentNode(nodeTypesStore, settingsStore);

	const websiteCategoryURLParams = new URLSearchParams(
		templatesStore.websiteTemplateRepositoryParameters,
	);
	websiteCategoryURLParams.set('utm_user_role', 'AdvancedAI');
	const aiTemplatesURL = templatesStore.constructTemplateRepositoryURL(
		websiteCategoryURLParams,
		TEMPLATE_CATEGORY_AI,
	);

	const callouts: NodeViewItem[] = [getAiTemplatesCallout(aiTemplatesURL)];

	return {
		value: AI_NODE_CREATOR_VIEW,
		title: i18n.baseText('nodeCreator.aiPanel.aiNodes'),
		subtitle: i18n.baseText('nodeCreator.aiPanel.selectAiNode'),
		items: [
			...callouts,
			// shown only when agents module is active
			// TODO: revert before GA release
			...messageAnAgentNode,
			...agentNodes,
			...chainNodes,
			...evaluationNode,
			{
				key: AI_OTHERS_NODE_CREATOR_VIEW,
				type: 'view',
				properties: {
					title: i18n.baseText('nodeCreator.aiPanel.aiOtherNodes'),
					icon: 'robot',
					description: i18n.baseText('nodeCreator.aiPanel.aiOtherNodesDescription'),
				},
			},
		],
	};
}

export function AINodesView(_nodes: SimplifiedNodeType[]): NodeView {
	const i18n = useI18n();

	function getAISubcategoryProperties(nodeConnectionType: NodeConnectionType) {
		return {
			connectionType: nodeConnectionType,
			iconProps: {
				color: `var(--node-type-${nodeConnectionType}-color)`,
			},
			panelClass: `nodes-list-panel-${nodeConnectionType}`,
		};
	}

	function getSubcategoryInfo(subcategory: string) {
		const localeKey = `nodeCreator.subcategoryInfos.${camelCase(subcategory)}` as BaseTextKey;

		const info = i18n.baseText(localeKey);

		// Return undefined if the locale key is not found
		if (info === localeKey) return undefined;

		return info;
	}

	return {
		value: AI_OTHERS_NODE_CREATOR_VIEW,
		title: i18n.baseText('nodeCreator.aiPanel.aiOtherNodes'),
		subtitle: i18n.baseText('nodeCreator.aiPanel.selectAiNode'),
		items: [
			{
				key: AI_CATEGORY_DOCUMENT_LOADERS,
				type: 'subcategory',
				properties: {
					title: AI_CATEGORY_DOCUMENT_LOADERS,
					info: getSubcategoryInfo(AI_CATEGORY_DOCUMENT_LOADERS),
					icon: 'file-input',
					...getAISubcategoryProperties(NodeConnectionTypes.AiDocument),
				},
			},
			{
				key: AI_CATEGORY_LANGUAGE_MODELS,
				type: 'subcategory',
				properties: {
					title: AI_CATEGORY_LANGUAGE_MODELS,
					info: getSubcategoryInfo(AI_CATEGORY_LANGUAGE_MODELS),
					icon: 'language',
					...getAISubcategoryProperties(NodeConnectionTypes.AiLanguageModel),
				},
			},
			{
				key: AI_CATEGORY_MEMORY,
				type: 'subcategory',
				properties: {
					title: AI_CATEGORY_MEMORY,
					info: getSubcategoryInfo(AI_CATEGORY_MEMORY),
					icon: 'brain',
					...getAISubcategoryProperties(NodeConnectionTypes.AiMemory),
				},
			},
			{
				key: AI_CATEGORY_OUTPUTPARSER,
				type: 'subcategory',
				properties: {
					title: AI_CATEGORY_OUTPUTPARSER,
					info: getSubcategoryInfo(AI_CATEGORY_OUTPUTPARSER),
					icon: 'list',
					...getAISubcategoryProperties(NodeConnectionTypes.AiOutputParser),
				},
			},
			{
				key: AI_CATEGORY_RETRIEVERS,
				type: 'subcategory',
				properties: {
					title: AI_CATEGORY_RETRIEVERS,
					info: getSubcategoryInfo(AI_CATEGORY_RETRIEVERS),
					icon: 'search',
					...getAISubcategoryProperties(NodeConnectionTypes.AiRetriever),
				},
			},
			{
				key: AI_CATEGORY_TEXT_SPLITTERS,
				type: 'subcategory',
				properties: {
					title: AI_CATEGORY_TEXT_SPLITTERS,
					info: getSubcategoryInfo(AI_CATEGORY_TEXT_SPLITTERS),
					icon: 'grip-lines-vertical',
					...getAISubcategoryProperties(NodeConnectionTypes.AiTextSplitter),
				},
			},
			{
				type: 'subcategory',
				key: AI_CATEGORY_TOOLS,
				category: CORE_NODES_CATEGORY,
				properties: {
					title: AI_CATEGORY_TOOLS,
					info: getSubcategoryInfo(AI_CATEGORY_TOOLS),
					icon: 'tools',
					...getAISubcategoryProperties(NodeConnectionTypes.AiTool),
					sections: [
						{
							key: 'popular',
							title: i18n.baseText('nodeCreator.sectionNames.popular'),
							items: [AI_WORKFLOW_TOOL_LANGCHAIN_NODE_TYPE, AI_CODE_TOOL_LANGCHAIN_NODE_TYPE],
						},
					],
				},
			},
			{
				key: AI_CATEGORY_EMBEDDING,
				type: 'subcategory',
				properties: {
					title: AI_CATEGORY_EMBEDDING,
					info: getSubcategoryInfo(AI_CATEGORY_EMBEDDING),
					icon: 'vector-square',
					...getAISubcategoryProperties(NodeConnectionTypes.AiEmbedding),
				},
			},
			{
				key: AI_CATEGORY_VECTOR_STORES,
				type: 'subcategory',
				properties: {
					title: AI_CATEGORY_VECTOR_STORES,
					info: getSubcategoryInfo(AI_CATEGORY_VECTOR_STORES),
					icon: 'waypoints',
					...getAISubcategoryProperties(NodeConnectionTypes.AiVectorStore),
				},
			},
			{
				key: AI_UNCATEGORIZED_CATEGORY,
				type: 'subcategory',
				properties: {
					title: AI_UNCATEGORIZED_CATEGORY,
					icon: 'code',
				},
			},
		],
	};
}

export function TriggerView() {
	const i18n = useI18n();

	// LMS: flat student allowlist (A–Z). Stock trigger helper panel: restore from git.
	return {
		value: TRIGGER_NODE_CREATOR_VIEW,
		title: i18n.baseText('nodeCreator.triggerHelperPanel.selectATrigger'),
		subtitle: i18n.baseText('nodeCreator.triggerHelperPanel.selectATriggerDescription'),
		items: getLmsFlatNodeItems(),
	};
}

export function RegularView(_nodes: SimplifiedNodeType[]) {
	const i18n = useI18n();

	// LMS: same flat allowlist — no App / AI / HITL nesting. Stock RegularView: restore from git.
	return {
		value: REGULAR_NODE_CREATOR_VIEW,
		title: i18n.baseText('nodeCreator.triggerHelperPanel.whatHappensNext'),
		items: getLmsFlatNodeItems(),
	};
}

export function HitlToolView(nodes: SimplifiedNodeType[]): NodeView {
	const i18n = useI18n();

	// Filter nodes whose name ends with 'HitlTool'
	const hitlToolNodes = nodes
		.filter((node) => isHitlToolType(node.name))
		.map(getNodeView)
		.sort((a, b) => a.properties.displayName.localeCompare(b.properties.displayName));

	return {
		value: HUMAN_IN_THE_LOOP_CATEGORY,
		title: i18n.baseText('nodeCreator.subcategoryNames.humanInTheLoop'),
		items: hitlToolNodes,
		nodeIcon: {
			type: 'icon',
			name: 'badge-check',
		},
	};
}
