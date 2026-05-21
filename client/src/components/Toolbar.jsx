export default function Toolbar({
  tool,
  setTool,
  brushSize,
  setBrushSize,
  onUndo,
  onClear,
  showExpertOverlay,
  setShowExpertOverlay,
  overlayAvailable
}) {
  return (
    <div className="toolbar-grid">
      <div className="control-card">
        <div className="control-label">Annotation Tool</div>
        <div className="segmented-control">
          <button
            className={tool === 'draw' ? 'segment active' : 'segment'}
            onClick={() => setTool('draw')}
            type="button"
          >
            Marker
          </button>
          <button
            className={tool === 'erase' ? 'segment active' : 'segment'}
            onClick={() => setTool('erase')}
            type="button"
          >
            Eraser
          </button>
        </div>
      </div>

      <div className="control-card">
        <div className="label-row">
          <label className="control-label" htmlFor="brush-size">
            Brush Size
          </label>
          <span className="value-pill">{brushSize}px</span>
        </div>
        <input
          id="brush-size"
          className="app-range"
          type="range"
          min="4"
          max="36"
          step="1"
          value={brushSize}
          onChange={(event) => setBrushSize(Number(event.target.value))}
        />
      </div>

      <div className="control-card">
        <div className="control-label">Actions</div>
        <div className="button-row">
          <button type="button" className="app-button" onClick={onUndo}>
            Undo
          </button>
          <button type="button" className="app-button danger" onClick={onClear}>
            Clear All
          </button>
        </div>
      </div>

      <div className="control-card">
        <div className="control-label">Comparison</div>
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={showExpertOverlay}
            disabled={!overlayAvailable}
            onChange={(event) => setShowExpertOverlay(event.target.checked)}
          />
          <span>{overlayAvailable ? 'Show expert overlay' : 'No expert overlay available'}</span>
        </label>
      </div>
    </div>
  );
}
