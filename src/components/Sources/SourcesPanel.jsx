import { useApp } from '../../context/AppContext';
import sources from '../../data/sources.json';
import portraitsData from '../../data/portraits.json';
import artifactsData from '../../data/artifacts.json';
import pronunciations from '../../data/pronunciations.json';
import oralHistories from '../../data/oralHistories.json';
import videosData from '../../data/videos.json';
import './SourcesPanel.css';

export default function SourcesPanel() {
  const { state, dispatch } = useApp();

  if (!state.sourcesOpen) return null;

  return (
    <div className="sources-overlay">
      <div className="sources-panel">
        <div className="sources-header">
          <h2>Sources & Bibliography</h2>
          <button
            className="sources-close"
            onClick={() => dispatch({ type: 'TOGGLE_SOURCES' })}
          >
            &times;
          </button>
        </div>
        <div className="sources-body">
          <div className="sources-section">
            <h3>Core Textbook</h3>
            <p className="source-citation">{sources.courseTextbook.citation}</p>
          </div>

          <div className="sources-section">
            <h3>Cherokee-Authored & Cherokee Nation Sources</h3>
            {sources.cherokeeAuthored.map((s, i) => (
              <p key={i} className="source-citation">{s.citation}</p>
            ))}
          </div>

          <div className="sources-section">
            <h3>Core Academic Works</h3>
            {sources.coreAcademic.map((s, i) => (
              <p key={i} className="source-citation">{s.citation}</p>
            ))}
          </div>

          <div className="sources-section">
            <h3>Population & Land Data</h3>
            {sources.populationAndLand.map((s, i) => (
              <p key={i} className="source-citation">{s.citation}</p>
            ))}
          </div>

          <div className="sources-section">
            <h3>Primary Source Archives</h3>
            {sources.primarySources.map((s, i) => (
              <p key={i} className="source-citation">{s.citation}</p>
            ))}
          </div>

          <div className="sources-section">
            <h3>Settler Town Founding Dates</h3>
            <p className="source-note">
              Founding years and locations for the colonial settlements that
              appear on the map as the timeline advances.
            </p>
            {sources.settlerTownFoundings.map((s, i) => (
              <p key={i} className="source-citation">{s.citation}</p>
            ))}
          </div>

          <div className="sources-section">
            <h3>Course Sources by Unit</h3>
            {sources.courseSources.map((unit) => (
              <div key={unit.unit} className="course-unit">
                <h4>{unit.unit}</h4>
                <ul>
                  {unit.sources.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="sources-section">
            <h3>Portraits & Image Credits</h3>
            <p className="source-note">
              All portraits are from Wikimedia Commons and are either in the public domain or
              released under a Creative Commons license. Click any portrait in the app to see
              full attribution.
            </p>
            {portraitsData.portraits.map((p) => (
              <p key={p.id} className="source-citation">
                <strong>{p.name}</strong>
                {p.syllabary && <> &middot; {p.syllabary}</>}
                {' — '}
                {(p.artist || 'Unknown artist').replace(/<[^>]+>/g, '').trim()}
                {p.collection ? `, ${p.collection}` : ''}
                {'. License: '}{p.license}
                {p.sourceUrl && (
                  <> · <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer">Wikimedia Commons</a></>
                )}
              </p>
            ))}
          </div>

          <div className="sources-section">
            <h3>External Video Content</h3>
            <p className="source-note">
              Curated videos from Cherokee-led, Cherokee-adjacent, and public-broadcasting
              sources. All videos are embedded via YouTube&apos;s privacy-enhanced
              (youtube-nocookie.com) domain in accordance with YouTube&apos;s terms of
              service, and the embed only loads after the user clicks play (facade pattern).
              All copyright remains with the original creators.
            </p>
            {Object.values(videosData.videos).map((v) => (
              <p key={v.id} className="source-citation">
                <strong>{v.title}</strong> — {v.channel}
                {v.date && <> · {v.date}</>}
                {v.youtubeId && (
                  <> · <a href={`https://www.youtube.com/watch?v=${v.youtubeId}`} target="_blank" rel="noopener noreferrer">Watch on YouTube</a></>
                )}
                {v.externalUrl && !v.youtubeId && (
                  <> · <a href={v.externalUrl} target="_blank" rel="noopener noreferrer">Watch on {v.channel.split('·')[0].trim()}</a></>
                )}
              </p>
            ))}
          </div>

          <div className="sources-section">
            <h3>Oral Histories & Testimony</h3>
            <p className="source-note">
              First-person voices threaded through the app. Some are archival text (the
              speakers lived before audio recording reached them); some are audio; some
              are video. Each is shown with full provenance in-scene.
            </p>
            {Object.values(oralHistories.histories).map((h) => (
              <p key={h.id} className="source-citation">
                <strong>{h.speaker}</strong>, {h.date} —{' '}
                {h.source || h.attribution}
                {h.license && <> · License: {h.license}</>}
                {h.sourceUrl && (
                  <> · <a href={h.sourceUrl} target="_blank" rel="noopener noreferrer">View archival record</a></>
                )}
              </p>
            ))}
          </div>

          <div className="sources-section">
            <h3>Cherokee Language Audio & Pronunciation</h3>
            <p className="source-note">
              Wherever a Cherokee word, name, or place appears in the app, a speaker icon
              opens a pronunciation popover with syllabary, romanization, IPA, a plain-English
              guide, and — where publicly-licensed native-speaker audio exists — playable audio.
            </p>
            <p className="source-citation">
              <strong>{pronunciations._meta.audioSources.wikitonguesJerryWolf.speaker}</strong>
              {' — '}
              {pronunciations._meta.audioSources.wikitonguesJerryWolf.description}
              {' License: '}{pronunciations._meta.audioSources.wikitonguesJerryWolf.license}.
              {' '}
              <a
                href={pronunciations._meta.audioSources.wikitonguesJerryWolf.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
              >View on Wikimedia Commons →</a>
            </p>
            {pronunciations._meta.sources.map((s, i) => (
              <p key={i} className="source-citation">{s}</p>
            ))}
            <p className="source-note">
              <strong>Note on audio scope:</strong> Comprehensive public-domain Cherokee
              word-level audio does not currently exist. The Cherokee Nation Language
              Department and EBCI Kituwah Preservation maintain the definitive
              pronunciations; both are linked from every pronunciation popover in the app.
            </p>
          </div>

          <div className="sources-section">
            <h3>Historical Cartography</h3>
            <p className="source-note">
              The treaty-era Cherokee territory polygons in this app derive from
              Charles C. Royce&rsquo;s 1884 survey of Indian land cessions. Users can
              overlay the original map directly onto the modern basemap via the
              &ldquo;Royce 1884&rdquo; control on the map.
            </p>
            <p className="source-citation">
              Royce, Charles C. <em>Map of the Former Territorial Limits of the
              Cherokee &ldquo;Nation of&rdquo; Indians</em>, 1884. Published in the
              <em> Fifth Annual Report of the Bureau of American Ethnology</em>,
              Smithsonian Institution. Public Domain. Scanned by the U.S. National
              Archives (NARA 102278418).
              {' '}<a
                href="https://commons.wikimedia.org/wiki/File:Map_of_the_Former_Territorial_Limits_of_the_Cherokee_%22Nation_of%22_Indians_Exhibiting_the_Boundaries_of_the_Various_Cessions_of_Land_Made_by_Them_to_the_United_States_by_Treaty_Stipulations,_from_the_Beginning_of_(...)_-_NARA_-_102278418.jpg"
                target="_blank"
                rel="noopener noreferrer"
              >View on Wikimedia Commons →</a>
            </p>
          </div>

          <div className="sources-section">
            <h3>Primary Source Artifacts</h3>
            <p className="source-note">
              Documents, newspapers, and artifacts shown inline within individual scenes.
              Click any artifact in the app to see a larger view with full caption.
            </p>
            {artifactsData.artifacts.map((a) => (
              <p key={a.id} className="source-citation">
                <strong>{a.title}</strong>
                {a.subtitle && <> &middot; {a.subtitle}</>}
                {' — '}
                {a.artist || 'Unknown source'}
                {'. License: '}{a.license}
                {a.sourceUrl && (
                  <> · <a href={a.sourceUrl} target="_blank" rel="noopener noreferrer">Wikimedia Commons</a></>
                )}
              </p>
            ))}
          </div>

          <div className="sources-section sources-note">
            <h3>About This Project</h3>
            <p>
              <strong>What Was Here Before</strong> was created by Stanton Melvin as an unessay for
              Introduction to Native American History, taught by Professor Charmayne &ldquo;Charli&rdquo; Champion-Shaw.
            </p>
            <p>
              This application maps Cherokee homeland, treaty-by-treaty territorial loss from 1721 to 1835,
              the Trail of Tears at the detachment level, and Cherokee sovereignty today. All historical claims
              are sourced from the bibliography above. Territorial boundaries are approximations based on
              Charles C. Royce&apos;s 1884 historical maps of Cherokee territorial limits.
            </p>
            <p>
              No existing project integrates all three eras &mdash; pre-contact homeland, treaty-by-treaty
              dispossession, and the removal itself &mdash; in a single, open-source, publicly accessible platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
