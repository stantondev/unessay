import { useApp } from '../../context/AppContext';
import { SCENES } from '../../data/scenes';
import {
  GOOGLE_FORM_URL,
  GITHUB_ISSUES_URL,
  FEEDBACK_EMAIL,
  buildGoogleFormUrl,
  buildMailtoUrl,
} from '../../utils/feedback';
import './FeedbackPanel.css';

export default function FeedbackPanel() {
  const { state, dispatch } = useApp();
  if (!state.feedbackOpen) return null;

  const close = () => dispatch({ type: 'TOGGLE_FEEDBACK' });
  const scene = SCENES[state.currentSceneIndex];

  const openForm = (feedbackType) => {
    const formUrl = buildGoogleFormUrl(feedbackType, scene);
    if (formUrl) {
      window.open(formUrl, '_blank', 'noopener,noreferrer');
    } else {
      // Google Form not yet configured — fall back to mailto
      window.location.href = buildMailtoUrl(feedbackType, scene);
    }
    close();
  };

  const formConfigured = Boolean(GOOGLE_FORM_URL);

  return (
    <div className="feedback-overlay" onClick={close}>
      <div className="feedback-panel" onClick={(e) => e.stopPropagation()}>
        <div className="feedback-header">
          <h2>Help Keep This Accurate</h2>
          <button className="feedback-close" onClick={close} aria-label="Close">&times;</button>
        </div>
        <div className="feedback-body">
          <p className="feedback-intro">
            This is a draft of a living project. If you spot an inaccuracy, have
            a source that contradicts a claim, or can point to something important
            that&rsquo;s missing &mdash; I want to hear about it.
          </p>

          {scene && (
            <div className="feedback-context">
              <span className="feedback-context-label">You&rsquo;re currently on</span>
              <span className="feedback-context-scene">{scene.year} &mdash; {scene.title}</span>
            </div>
          )}

          <div className="feedback-options">
            <button
              className="feedback-option feedback-option--primary"
              onClick={() => openForm('Inaccuracy')}
            >
              <div className="feedback-option-label">Report an inaccuracy</div>
              <div className="feedback-option-desc">Something is factually wrong or needs a citation correction</div>
            </button>

            <button
              className="feedback-option feedback-option--primary"
              onClick={() => openForm('Addition')}
            >
              <div className="feedback-option-label">Suggest an addition</div>
              <div className="feedback-option-desc">A missing town, scene, source, or connection</div>
            </button>

            <button
              className="feedback-option"
              onClick={() => openForm('General feedback')}
            >
              <div className="feedback-option-label">General feedback</div>
              <div className="feedback-option-desc">Interpretation, framing, tone, or anything else</div>
            </button>
          </div>

          <div className="feedback-divider">
            <span>Or contact directly</span>
          </div>

          <div className="feedback-alternatives">
            <a
              className="feedback-alt"
              href={buildMailtoUrl('General feedback', scene)}
              onClick={close}
            >
              <span className="feedback-alt-icon">✉</span>
              <span>
                <strong>Email</strong>
                <span className="feedback-alt-desc">{FEEDBACK_EMAIL}</span>
              </span>
            </a>
            <a
              className="feedback-alt"
              href={GITHUB_ISSUES_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
            >
              <span className="feedback-alt-icon">◆</span>
              <span>
                <strong>GitHub Issues</strong>
                <span className="feedback-alt-desc">Open a ticket in the public repository</span>
              </span>
            </a>
          </div>

          {!formConfigured && (
            <div className="feedback-note">
              Note: The quick form isn&rsquo;t wired up yet &mdash; the buttons above
              will open an email draft. Everything still reaches me.
            </div>
          )}

          <div className="feedback-footer">
            Every submission is reviewed personally. Factual corrections with a
            citable source are applied and the data file is updated in the open
            source repository.
          </div>
        </div>
      </div>
    </div>
  );
}
