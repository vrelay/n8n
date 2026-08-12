import type { INodeCreateElement, NodeCreatorOpenSource } from '@/Interface';
import {
	AGENT_NODE_TYPE,
	CHAT_TRIGGER_NODE_TYPE,
	DATA_TABLE_NODE_TYPE,
	DATA_TABLE_TOOL_NODE_TYPE,
	HTTP_REQUEST_NODE_TYPE,
	HTTP_REQUEST_TOOL_NODE_TYPE,
	IF_NODE_TYPE,
	MANUAL_TRIGGER_NODE_TYPE,
	MERGE_NODE_TYPE,
	NO_OP_NODE_TYPE,
	SCHEDULE_TRIGGER_NODE_TYPE,
	SET_NODE_TYPE,
	SIMPLE_MEMORY_NODE_TYPE,
	SWITCH_NODE_TYPE,
	WAIT_NODE_TYPE,
} from './nodeTypes';

export const TEMPLATE_CATEGORY_AI = 'categories/ai';

// LMS: OpenRouter LLM + agent tools (exist in @n8n/nodes-langchain)
export const OPENROUTER_CHAT_MODEL_NODE_TYPE = '@n8n/n8n-nodes-langchain.lmChatOpenRouter';
export const CALCULATOR_TOOL_NODE_TYPE = '@n8n/n8n-nodes-langchain.toolCalculator';
export const THINK_TOOL_NODE_TYPE = '@n8n/n8n-nodes-langchain.toolThink';

export const NODE_CREATOR_OPEN_SOURCES: Record<
	Uppercase<NodeCreatorOpenSource>,
	NodeCreatorOpenSource
> = {
	NO_TRIGGER_EXECUTION_TOOLTIP: 'no_trigger_execution_tooltip',
	PLUS_ENDPOINT: 'plus_endpoint',
	ADD_INPUT_ENDPOINT: 'add_input_endpoint',
	TRIGGER_PLACEHOLDER_BUTTON: 'trigger_placeholder_button',
	ADD_NODE_BUTTON: 'add_node_button',
	NODE_SHORTCUT: 'node_shortcut',
	NODE_CONNECTION_ACTION: 'node_connection_action',
	REPLACE_NODE_ACTION: 'replace_node_action',
	NODE_CONNECTION_DROP: 'node_connection_drop',
	NOTICE_ERROR_MESSAGE: 'notice_error_message',
	CONTEXT_MENU: 'context_menu',
	ADD_EVALUATION_NODE_BUTTON: 'add_evaluation_node_button',
	TEMPLATES_CALLOUT: 'templates_callout',
	INSTANCE_AI: 'instance_ai',
	'': '',
};
export const CORE_NODES_CATEGORY = 'Core Nodes';
export const HUMAN_IN_THE_LOOP_CATEGORY = 'HITL';
export const CUSTOM_NODES_CATEGORY = 'Custom Nodes';
export const DEFAULT_SUBCATEGORY = '*';
export const AI_OTHERS_NODE_CREATOR_VIEW = 'AI Other';
export const AI_NODE_CREATOR_VIEW = 'AI';
export const REGULAR_NODE_CREATOR_VIEW = 'Regular';
export const TRIGGER_NODE_CREATOR_VIEW = 'Trigger';
export const OTHER_TRIGGER_NODES_SUBCATEGORY = 'Other Trigger Nodes';
export const TRANSFORM_DATA_SUBCATEGORY = 'Data Transformation';
export const FILES_SUBCATEGORY = 'Files';
export const FLOWS_CONTROL_SUBCATEGORY = 'Flow';
export const AI_SUBCATEGORY = 'AI';
export const HELPERS_SUBCATEGORY = 'Helpers';
export const HITL_SUBCATEGORY = 'Human in the Loop';
export const AI_CATEGORY_AGENTS = 'Agents';
export const AI_CATEGORY_CHAINS = 'Chains';
export const AI_CATEGORY_LANGUAGE_MODELS = 'Language Models';
export const AI_CATEGORY_MEMORY = 'Memory';
export const AI_CATEGORY_OUTPUTPARSER = 'Output Parsers';
export const AI_CATEGORY_TOOLS = 'Tools';
export const AI_CATEGORY_VECTOR_STORES = 'Vector Stores';
export const AI_CATEGORY_RETRIEVERS = 'Retrievers';
export const AI_CATEGORY_EMBEDDING = 'Embeddings';
export const AI_CATEGORY_DOCUMENT_LOADERS = 'Document Loaders';
export const AI_CATEGORY_TEXT_SPLITTERS = 'Text Splitters';
export const AI_CATEGORY_OTHER_TOOLS = 'Other Tools';
export const AI_CATEGORY_ROOT_NODES = 'Root Nodes';
export const AI_CATEGORY_MCP_NODES = 'Model Context Protocol';
export const AI_CATEGORY_HUMAN_IN_THE_LOOP = HITL_SUBCATEGORY;
export const AI_EVALUATION = 'Evaluation';
export const AI_UNCATEGORIZED_CATEGORY = 'Miscellaneous';
export const AI_CODE_TOOL_LANGCHAIN_NODE_TYPE = '@n8n/n8n-nodes-langchain.toolCode';
export const AI_WORKFLOW_TOOL_LANGCHAIN_NODE_TYPE = '@n8n/n8n-nodes-langchain.toolWorkflow';
export const AI_SECTION_RECOMMENDED_TOOLS = 'Recommended Tools';
export const REQUEST_NODE_FORM_URL = 'https://n8n-community.typeform.com/to/K1fBVTZ3';

/**
 * LMS: nodes shown in the canvas "+" panel (flat list).
 * Only types that exist in this fork — missing ones are skipped at render time.
 */
export const LMS_ALLOWED_NODE_TYPES: string[] = [
	AGENT_NODE_TYPE,
	AI_CODE_TOOL_LANGCHAIN_NODE_TYPE,
	CALCULATOR_TOOL_NODE_TYPE,
	CHAT_TRIGGER_NODE_TYPE,
	HTTP_REQUEST_NODE_TYPE,
	HTTP_REQUEST_TOOL_NODE_TYPE,
	IF_NODE_TYPE,
	MANUAL_TRIGGER_NODE_TYPE,
	MERGE_NODE_TYPE,
	NO_OP_NODE_TYPE,
	// LMS: OpenRouter Chat Model omitted — use HTTP Request + $env.OPENROUTER_API_KEY instead
	SCHEDULE_TRIGGER_NODE_TYPE,
	SET_NODE_TYPE,
	SIMPLE_MEMORY_NODE_TYPE,
	SWITCH_NODE_TYPE,
	THINK_TOOL_NODE_TYPE,
	WAIT_NODE_TYPE,
];

export const LMS_ALLOWED_NODE_TYPE_SET = new Set(LMS_ALLOWED_NODE_TYPES);

/** LMS: restrict node-creator lists/search to the student allowlist */
export function filterToLmsAllowedNodeTypes<T extends { name: string }>(nodes: T[]): T[] {
	return nodes.filter((node) => LMS_ALLOWED_NODE_TYPE_SET.has(node.name));
}

/** LMS: restrict rendered search hits to the student allowlist */
export function filterLmsAllowedCreateElements(items: INodeCreateElement[]): INodeCreateElement[] {
	return items.filter(
		(item) => item.type === 'node' && LMS_ALLOWED_NODE_TYPE_SET.has(item.key),
	);
}

export const RECOMMENDED_NODES: string[] = [DATA_TABLE_NODE_TYPE, DATA_TABLE_TOOL_NODE_TYPE];
export const BETA_NODES: string[] = ['@n8n/n8n-nodes-langchain.microsoftAgent365Trigger'];

export const NEW_TOOL_CATEGORIES: string[] = [AI_CATEGORY_MCP_NODES];
