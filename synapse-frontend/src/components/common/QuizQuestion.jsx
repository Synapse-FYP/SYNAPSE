// Multiple-choice question rendered as a fieldset of `.opt` radio labels (training review + assessments).
export default function QuizQuestion({ q, suffix }) {
  return (
    <fieldset style={{ border: 0, padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <legend className="small" style={{ fontWeight: 600, marginBottom: 8 }}>{q.n}. {q.q}{suffix}</legend>
      {q.opts.map((o, i) => (
        <label key={i} className={o.cls}><input type="radio" name={o.name} checked={o.checked} onChange={o.pick} /><span className="small">{o.o}</span></label>
      ))}
    </fieldset>
  );
}
