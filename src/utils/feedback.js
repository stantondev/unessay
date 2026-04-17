// Feedback configuration
// ------------------------------------------------------------
// To enable the feedback form, follow the steps in FEEDBACK_SETUP.md
// and paste your Google Form URL and entry IDs below.
//
// While these values are the placeholders below, clicking "Report an
// inaccuracy" or "Suggest an addition" will open a generic feedback
// modal that still offers email and GitHub Issues as working fallbacks.
// ------------------------------------------------------------

// Your Google Form's /viewform URL — looks like:
// https://docs.google.com/forms/d/e/1FAIpQLS.../viewform
export const GOOGLE_FORM_URL = '';

// Entry IDs from your Google Form — see FEEDBACK_SETUP.md for how to find them.
// If left blank, the form will still open but won't pre-fill scene context.
export const GOOGLE_FORM_ENTRY_IDS = {
  feedbackType: '',  // e.g. 'entry.1234567890' for the "Type of feedback" field
  sceneId: '',       // e.g. 'entry.2345678901' for "Scene ID"
  sceneTitle: '',    // e.g. 'entry.3456789012' for "Scene Title"
  sceneYear: '',     // e.g. 'entry.4567890123' for "Scene Year"
  pageUrl: '',       // e.g. 'entry.5678901234' for "Page URL"
};

// Fallback contact methods — work regardless of Google Form setup
export const FEEDBACK_EMAIL = 'stanton.melvin@example.com'; // TODO: replace with your real email
export const GITHUB_ISSUES_URL = 'https://github.com/stantondev/unessay/issues/new';

/**
 * Build the Google Form URL pre-filled with the current scene context.
 * Returns null if the form URL isn't configured yet.
 */
export function buildGoogleFormUrl(feedbackType, scene) {
  if (!GOOGLE_FORM_URL) return null;
  const params = new URLSearchParams();
  if (GOOGLE_FORM_ENTRY_IDS.feedbackType && feedbackType) {
    params.set(GOOGLE_FORM_ENTRY_IDS.feedbackType, feedbackType);
  }
  if (GOOGLE_FORM_ENTRY_IDS.sceneId && scene?.id) {
    params.set(GOOGLE_FORM_ENTRY_IDS.sceneId, scene.id);
  }
  if (GOOGLE_FORM_ENTRY_IDS.sceneTitle && scene?.title) {
    params.set(GOOGLE_FORM_ENTRY_IDS.sceneTitle, scene.title);
  }
  if (GOOGLE_FORM_ENTRY_IDS.sceneYear && scene?.year) {
    params.set(GOOGLE_FORM_ENTRY_IDS.sceneYear, scene.year);
  }
  if (GOOGLE_FORM_ENTRY_IDS.pageUrl && typeof window !== 'undefined') {
    params.set(GOOGLE_FORM_ENTRY_IDS.pageUrl, window.location.href);
  }
  const query = params.toString();
  return query ? `${GOOGLE_FORM_URL}?${query}&usp=pp_url` : GOOGLE_FORM_URL;
}

/**
 * Build a pre-filled mailto: URL as a fallback.
 */
export function buildMailtoUrl(feedbackType, scene) {
  const subject = `[What Was Here Before] ${feedbackType}${scene ? `: ${scene.title}` : ''}`;
  const body = [
    `Type: ${feedbackType}`,
    scene ? `Scene: ${scene.year} — ${scene.title} (${scene.id})` : '',
    typeof window !== 'undefined' ? `URL: ${window.location.href}` : '',
    '',
    '--- Please describe the inaccuracy, suggestion, or feedback below ---',
    '',
  ].filter(Boolean).join('\n');
  return `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
