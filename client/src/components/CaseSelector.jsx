export default function CaseSelector({ cases, selectedCaseId, onChange }) {
  return (
    <div className="control-card">
      <label className="control-label" htmlFor="case-select">
        X-ray Case
      </label>
      <select
        id="case-select"
        className="app-select"
        value={selectedCaseId}
        onChange={(event) => onChange(event.target.value)}
      >
        {cases.map((caseItem) => (
          <option key={caseItem.id} value={caseItem.id}>
            {caseItem.label}
          </option>
        ))}
      </select>
    </div>
  );
}
