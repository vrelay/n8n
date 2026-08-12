// LMS: detect clicks on the fixed lesson guide (ignore for NDV backdrop / click-outside)
import { LMS_GUIDE_PANEL_SELECTOR } from '@/app/constants';

export function isLmsGuidePanelEventTarget(target: EventTarget | null): boolean {
	return target instanceof Element && target.closest(LMS_GUIDE_PANEL_SELECTOR) !== null;
}
