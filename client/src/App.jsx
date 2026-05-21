import { useEffect, useMemo, useRef, useState } from 'react';
import AnnotationCanvas from './components/AnnotationCanvas';
import Toolbar from './components/Toolbar';
import CaseSelector from './components/CaseSelector';
import { cases } from './data/cases';
import { downloadTextFile, sanitizeFileSegment } from './utils/fileHelpers';

const TAB_CONTENT = {
  findings: {
    label: 'Findings',
    body: 'Add finalized findings content here. Summarize the radiographic observations, alignment, fracture characteristics, hardware status, and any secondary abnormalities.'
  },
  impression: {
    label: 'Impression',
    body: 'Add finalized impression content here. State the primary impression and any differential considerations once the interpretation is finalized.'
  },
  discussion: {
    label: 'Discussion',
    body: 'Add finalized discussion content here. Use this space for teaching points, management considerations, and broader clinical context.'
  }
};

export default function App() {
  const canvasRef = useRef(null);
  const primaryCase = cases[0];

  const [selectedCaseId, setSelectedCaseId] = useState(primaryCase.id);
  const [currentViewIndex, setCurrentViewIndex] = useState(0);
  const [tool, setTool] = useState('draw');
  const [brushSize, setBrushSize] = useState(12);
  const [showExpertOverlay, setShowExpertOverlay] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Ready for review.');
  const [submitting, setSubmitting] = useState(false);
  const [strokeCount, setStrokeCount] = useState(0);
  const [hasEnteredCase, setHasEnteredCase] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const selectedCase = useMemo(
    () => cases.find((caseItem) => caseItem.id === selectedCaseId) ?? primaryCase,
    [selectedCaseId, primaryCase]
  );
  const selectedCaseOverlayAvailable = Boolean(selectedCase.overlayUrl);
  const selectedCaseNarrative = {
    findings: selectedCase.findings ?? [TAB_CONTENT.findings.body],
    impression: selectedCase.impression ?? [TAB_CONTENT.impression.body],
    discussion: selectedCase.discussion ?? [TAB_CONTENT.discussion.body]
  };

  useEffect(() => {
    setCurrentViewIndex(0);
    setActiveTab(null);
  }, [selectedCaseId]);

  useEffect(() => {
    if (!selectedCaseOverlayAvailable && showExpertOverlay) {
      setShowExpertOverlay(false);
    }
  }, [selectedCaseOverlayAvailable, showExpertOverlay]);

  const buildSubmissionObject = async () => {
    const bundle = await canvasRef.current?.exportBundle();
    if (!bundle) {
      throw new Error('Canvas export failed.');
    }

    return {
      annotatorName: 'Demo Reviewer',
      caseId: selectedCase.id,
      caseLabel: selectedCase.label,
      bodyRegion: selectedCase.bodyRegion,
      view: selectedCase.images?.length > 1 ? `${selectedCase.view} (View ${currentViewIndex + 1})` : selectedCase.view,
      showExpertOverlayAtSubmission: showExpertOverlay,
      notes: {
        findings: selectedCaseNarrative.findings.join('\n'),
        impression: selectedCaseNarrative.impression.join('\n'),
        discussion: selectedCaseNarrative.discussion.join('\n')
      },
      submittedAt: new Date().toISOString(),
      strokes: bundle.strokes,
      canvas: bundle.canvas,
      displayCanvas: bundle.displayCanvas,
      imageDataUrl: bundle.imageDataUrl
    };
  };

  const handleDownloadJson = async () => {
    try {
      const payload = await buildSubmissionObject();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileStem = `${sanitizeFileSegment(payload.annotatorName)}-${payload.caseId}-${timestamp}`;
      downloadTextFile(`${fileStem}.json`, JSON.stringify(payload, null, 2));
      setStatusMessage('Case JSON downloaded locally.');
    } catch (error) {
      setStatusMessage(`Download failed: ${error.message}`);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setStatusMessage('Submitting case package to backend...');

    try {
      const payload = await buildSubmissionObject();
      const response = await fetch('/api/annotations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const result = await response.json();
      setStatusMessage(`Saved to ${result.savedTo.relativeDirectory}. JSON and annotated PNG created successfully.`);
    } catch (error) {
      try {
        const payload = await buildSubmissionObject();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileStem = `${sanitizeFileSegment(payload.annotatorName)}-${payload.caseId}-${timestamp}`;
        downloadTextFile(`${fileStem}.json`, JSON.stringify(payload, null, 2));
        setStatusMessage(`Backend unavailable, so the case JSON was downloaded locally instead. Details: ${error.message}`);
      } catch (fallbackError) {
        setStatusMessage(`Submission failed: ${fallbackError.message}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleUndo = () => {
    canvasRef.current?.undo();
    setStatusMessage('Last stroke removed.');
  };

  const handleClear = () => {
    canvasRef.current?.clear();
    setStatusMessage('All strokes cleared.');
  };

  if (!hasEnteredCase) {
    return (
      <div className="app-shell case-library-shell">
        <div className="ambient-orb ambient-orb-left" />
        <div className="ambient-orb ambient-orb-right" />
        <header className="brand-bar">
          <div className="brand-lockup">
            <div className="brand-mark">O</div>
            <div>
              <div className="brand-name">OrthoSense</div>
              <div className="brand-subtitle">Orthopedic case review</div>
            </div>
          </div>
          <div className="brand-chip">Teaching case</div>
        </header>

        <main className="landing-grid">
          <section className="hero-card">
            <div className="eyebrow">Orthopedic Teaching Case</div>
            <h1>Orthopedic imaging case review.</h1>
            <p className="lead">
              Review the radiograph, annotate directly on the study, and document findings, diagnosis, and
              discussion in a structured format.
            </p>
            <div className="hero-stat-row">
              <div className="hero-stat-card">
                <span className="hero-stat-value">{String(cases.length).padStart(2, '0')}</span>
                <span className="hero-stat-label">Available cases</span>
              </div>
              <div className="hero-stat-card">
                <span className="hero-stat-value">3</span>
                <span className="hero-stat-label">Narrative tabs</span>
              </div>
              <div className="hero-stat-card">
                <span className="hero-stat-value">AP</span>
                <span className="hero-stat-label">Pelvis view</span>
              </div>
            </div>
          </section>

          <section className="library-grid">
            {cases.map((caseItem) => (
              <button
                key={caseItem.id}
                type="button"
                className="case-entry-card"
                onClick={() => {
                  setSelectedCaseId(caseItem.id);
                  setHasEnteredCase(true);
                  setActiveTab(null);
                  setStatusMessage('Case opened.');
                }}
              >
                <div className="case-entry-visual">
                  <div className="case-entry-visual-overlay" />
                  <img src={caseItem.images?.[0] ?? caseItem.imageUrl} alt={`${caseItem.label} preview`} className="case-entry-image" />
                </div>
                <div className="case-entry-content">
                  <div className="case-entry-meta">
                    <span className="meta-pill">Demographics: {caseItem.demographics}</span>
                  </div>
                  <div className="case-entry-body">
                    <div>
                      <div className="case-entry-kicker">Case</div>
                      <h2>{caseItem.label}</h2>
                    </div>
                    <span className="case-entry-action">Enter Case</span>
                  </div>
                  <div className="case-entry-footer">
                    <span>Structured narrative</span>
                    <span>Structured export</span>
                    <span>Expert overlay support</span>
                  </div>
                </div>
              </button>
            ))}
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell case-review-shell">
      <div className="ambient-orb ambient-orb-left" />
      <div className="ambient-orb ambient-orb-right" />
      <header className="brand-bar">
        <div className="brand-lockup">
          <div className="brand-mark">O</div>
          <div>
            <div className="brand-name">OrthoSense</div>
            <div className="brand-subtitle">Orthopedic case review</div>
          </div>
        </div>
        <div className="brand-chip">Teaching file</div>
      </header>

      <header className="workspace-hero">
        <div className="workspace-title-block">
          <div className="case-meta-row">
            <span className="meta-pill">Demographics: {selectedCase.demographics}</span>
            <span className="meta-pill">Indication: {selectedCase.indication}</span>
            <span className="meta-pill">View: {selectedCase.view}</span>
          </div>
          <h1>{selectedCase.label}</h1>
          <p className="lead workspace-lead">
            Review, annotate, and document the case in a structured teaching format.
          </p>
        </div>
        <div className="workspace-hero-actions">
          <button type="button" className="app-button" onClick={() => setHasEnteredCase(false)}>
            Back to Cases
          </button>
          <button type="button" className="primary-button" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Save Case'}
          </button>
        </div>
      </header>

      <main className="case-review-grid">
        <section className="viewer-column">
          <div className="showcase-panel">
            <div className="showcase-header">
              <div>
                <div className="showcase-kicker">Imaging Review</div>
                <h2 className="showcase-title">Reading canvas</h2>
              </div>
              <div className="showcase-badge">Interactive overlay</div>
            </div>

            <AnnotationCanvas
              ref={canvasRef}
              imageUrl={selectedCase.images?.[currentViewIndex] ?? selectedCase.imageUrl}
              overlayUrl={selectedCase.overlayUrl}
              showExpertOverlay={showExpertOverlay}
              tool={tool}
              brushSize={brushSize}
              aspectRatio={selectedCase.aspectRatio}
              onStrokeCountChange={setStrokeCount}
            />
          </div>

          <div className="insight-bar">
            <div className="insight-card">
              <span className="insight-label">Current Case</span>
              <span className="insight-value">{selectedCase.id.toUpperCase()}</span>
            </div>
            <div className="insight-card">
              <span className="insight-label">Strokes</span>
              <span className="insight-value">{strokeCount}</span>
            </div>
            <div className="insight-card">
              <span className="insight-label">Overlay</span>
              <span className="insight-value">
                {selectedCaseOverlayAvailable ? (showExpertOverlay ? 'Visible' : 'Hidden') : 'Not available'}
              </span>
            </div>
          </div>

          <div className="panel-card">
            <h2>Annotation Controls</h2>
            <CaseSelector
              cases={cases}
              selectedCaseId={selectedCaseId}
              onChange={setSelectedCaseId}
            />

            { (selectedCase.images?.length || (selectedCase.imageUrl ? 1 : 0)) > 1 && (
              <div className="control-card">
                <label className="control-label" htmlFor="view-select">View</label>
                <select
                  id="view-select"
                  className="app-select"
                  value={currentViewIndex}
                  onChange={(e) => setCurrentViewIndex(Number(e.target.value))}
                >
                  { (selectedCase.images ?? [selectedCase.imageUrl]).map((img, idx) => (
                    <option key={idx} value={idx}>{`View ${idx + 1}`}</option>
                  )) }
                </select>
              </div>
            ) }

            <Toolbar
              tool={tool}
              setTool={setTool}
              brushSize={brushSize}
              setBrushSize={setBrushSize}
              onUndo={handleUndo}
              onClear={handleClear}
              showExpertOverlay={showExpertOverlay}
              setShowExpertOverlay={setShowExpertOverlay}
              overlayAvailable={selectedCaseOverlayAvailable}
            />
          </div>
        </section>

        <section className="case-content-column">
          <div className="panel-card narrative-card">
            <div className="narrative-toolbar">
              <button type="button" className="outline-pill accent-pill">
                Ask Voxel AI
              </button>
              <div className="narrative-actions">
                <button type="button" className="outline-pill" onClick={handleDownloadJson}>
                  Download JSON
                </button>
              </div>
            </div>

            <div className="case-section-shell" role="tablist" aria-label="Case narrative tabs">
              {Object.entries(TAB_CONTENT).map(([tabId, tab]) => (
                <div key={tabId} className={activeTab === tabId ? 'case-section-row active' : 'case-section-row'}>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tabId}
                    className="case-section-trigger"
                    onClick={() => setActiveTab((current) => (current === tabId ? null : tabId))}
                  >
                    <span className="case-section-title">{tab.label}</span>
                    <span className="case-section-action">{activeTab === tabId ? 'Hide' : 'Read'}</span>
                  </button>

                  {activeTab === tabId && (
                    <div className="case-section-content" role="tabpanel" aria-label={tab.label}>
                      {selectedCaseNarrative[tabId].map((line, index) => (
                        <p key={index}>{line}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="status-box">{statusMessage}</div>
          </div>
        </section>
      </main>
    </div>
  );
}
