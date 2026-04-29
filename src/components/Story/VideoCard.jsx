import { useState } from 'react';
import videosData from '../../data/videos.json';
import './VideoCard.css';

const VIDEOS = videosData.videos;

function youtubeThumb(id, quality = 'hqdefault') {
  return `https://i.ytimg.com/vi/${id}/${quality}.jpg`;
}
function youtubeWatchUrl(id) {
  return `https://www.youtube.com/watch?v=${id}`;
}
function youtubeEmbedUrl(id) {
  // Privacy-enhanced domain: doesn't set cookies until user interacts
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
}

/**
 * VideoCard — external video embed with facade pattern.
 * Shows thumbnail + metadata; iframe loads only when user clicks play.
 * For videos without a YouTube ID, renders as an external-link card only.
 */
export default function VideoCard({ id }) {
  const v = VIDEOS[id];
  const [playing, setPlaying] = useState(false);

  if (!v) return null;

  const hasEmbed = !!v.youtubeId;
  const thumb = hasEmbed ? youtubeThumb(v.youtubeId, 'maxresdefault') : null;
  const thumbFallback = hasEmbed ? youtubeThumb(v.youtubeId, 'hqdefault') : null;

  return (
    <div className="video-card">
      <div className="video-card-header">
        <div className="video-card-eyebrow">
          <span className="video-card-badge">Video · {v.kind}</span>
          <span className="video-card-channel">{v.channel}</span>
        </div>
        <h4 className="video-card-title">{v.title}</h4>
        {v.date && <div className="video-card-date">{v.date}</div>}
      </div>

      {hasEmbed && !playing && (
        <button
          type="button"
          className="video-card-facade"
          onClick={() => setPlaying(true)}
          aria-label={`Play video: ${v.title}`}
        >
          <img
            src={thumb}
            onError={(e) => {
              // maxresdefault may not exist for all videos; fall back to hqdefault
              if (e.currentTarget.src !== thumbFallback) {
                e.currentTarget.src = thumbFallback;
              }
            }}
            alt=""
            loading="lazy"
          />
          <div className="video-card-facade-overlay">
            <div className="video-card-play-icon" aria-hidden="true">
              <svg width="30" height="30" viewBox="0 0 30 30">
                <path d="M8 5L24 15L8 25Z" fill="currentColor" />
              </svg>
            </div>
            <div className="video-card-facade-hint">Click to play on YouTube</div>
          </div>
        </button>
      )}

      {hasEmbed && playing && (
        <div className="video-card-embed">
          <iframe
            src={youtubeEmbedUrl(v.youtubeId)}
            title={v.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            loading="lazy"
          />
        </div>
      )}

      {!hasEmbed && (
        <a
          href={v.externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="video-card-external"
        >
          <div className="video-card-external-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M5 15L15 5M15 5H8M15 5V12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="video-card-external-text">
            <div>Watch on {v.channel}</div>
            <div className="video-card-external-sub">Opens in a new tab</div>
          </div>
        </a>
      )}

      {v.context && <p className="video-card-context">{v.context}</p>}

      <div className="video-card-footer">
        {hasEmbed && (
          <a
            href={youtubeWatchUrl(v.youtubeId)}
            target="_blank"
            rel="noopener noreferrer"
            className="video-card-link"
          >
            Watch on YouTube →
          </a>
        )}
        {v.channelUrl && (
          <a
            href={v.channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="video-card-link video-card-link--muted"
          >
            Channel &rsaquo; {v.channel}
          </a>
        )}
      </div>

      <div className="video-card-attribution">
        Content copyright remains with {v.channel}. Embedded via YouTube&apos;s
        privacy-enhanced mode in accordance with YouTube&apos;s terms of service.
      </div>
    </div>
  );
}
