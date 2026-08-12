// LMS: drag the lesson guide panel by its header (click-hold-move)
import { computed, nextTick, watch, type Ref } from 'vue';
import { useDraggable } from '@vueuse/core';

const DEFAULT_X = 0;

function centerPanelY(panel: HTMLElement | null): number {
	if (!panel) return 0;
	return Math.max(0, (window.innerHeight - panel.offsetHeight) / 2);
}

function clampPanelPosition(panel: HTMLElement | null, x: number, y: number) {
	if (!panel) return { x, y };
	const maxX = Math.max(0, window.innerWidth - panel.offsetWidth);
	const maxY = Math.max(0, window.innerHeight - panel.offsetHeight);
	return {
		x: Math.min(Math.max(0, x), maxX),
		y: Math.min(Math.max(0, y), maxY),
	};
}

export function useLmsGuidePanelDrag(
	panelRef: Ref<HTMLElement | null>,
	handleRef: Ref<HTMLElement | null>,
	active: Ref<boolean>,
) {
	const { x, y, isDragging } = useDraggable(panelRef, {
		handle: handleRef,
		initialValue: { x: DEFAULT_X, y: 0 },
		preventDefault: true,
		stopPropagation: true,
		onMove: (position) => {
			const clamped = clampPanelPosition(panelRef.value, position.x, position.y);
			x.value = clamped.x;
			y.value = clamped.y;
		},
	});

	function resetPosition() {
		x.value = DEFAULT_X;
		y.value = centerPanelY(panelRef.value);
	}

	watch(active, async (isActive) => {
		if (!isActive) return;
		await nextTick();
		resetPosition();
	});

	const panelPositionStyle = computed(() => ({
		top: `${y.value}px`,
		left: `${x.value}px`,
		transform: 'none',
	}));

	return {
		panelPositionStyle,
		isDragging,
		resetPosition,
	};
}
