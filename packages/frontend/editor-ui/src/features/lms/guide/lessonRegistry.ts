// LMS: bundled lesson guides for deep-link auto-start (?lesson=<id>)
import notesHelper from './lessons/notes-helper.guide.json';
import { parseLmsGuide } from './parseGuide';
import type { LmsGuide } from './types';

const LESSONS: Record<string, string> = {
	'notes-helper': JSON.stringify(notesHelper),
};

export function loadLessonGuide(lessonId: string): LmsGuide {
	const raw = LESSONS[lessonId];
	if (!raw) {
		throw new Error(`Unknown lesson: ${lessonId}`);
	}
	return parseLmsGuide(raw);
}
