// Small presentational chart helpers built on the original `.chart` SVG layout.

export function ChartTicks({ ticks }) {
  return ticks.map((t) => <span key={t.top} className="chart-yt" style={{ top: t.top + '%' }}>{t.label}</span>);
}

// Line + expected-range band, 600×200 viewBox stretched to the container.
export function BandLineSvg({ chart, strokeWidth = 1.8, showMean = false }) {
  return (
    <svg viewBox="0 0 600 200" preserveAspectRatio="none" aria-hidden="true">
      <path d={chart.bandPath} fill="#22D3EE" fillOpacity="0.14" />
      {showMean && <path d={chart.meanPath} stroke="#22D3EE" strokeDasharray="4 4" strokeWidth="1" vectorEffect="non-scaling-stroke" fill="none" />}
      <path d={chart.path} fill="none" stroke="#E6ECF5" strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

// Compact trend card used on the employee profile behavioral tab.
export function MiniTrendCard({ title, chart, first, last }) {
  return (
    <section className="card">
      <div className="card-h"><h3>{title}</h3><span className="tiny muted mono">mean {chart.mean}/day</span></div>
      <div className="card-b">
        <div className="chart" style={{ height: 120 }}><BandLineSvg chart={chart} /></div>
        <div className="chart-x"><span>{first}</span><span>{last}</span></div>
      </div>
    </section>
  );
}

// Horizontal progress bar (`.bar-track` / `.bar-fill`). `as="span"` mirrors the inline-span variant.
export function Bar({ w, color, as = 'div', style }) {
  const Tag = as;
  const fill = as === 'span' ? { display: 'block', width: w + '%', background: color } : { width: w + '%', background: color };
  return (
    <Tag className="bar-track" style={style}>
      <Tag className="bar-fill" style={fill} />
    </Tag>
  );
}

export function Legend({ items }) {
  return (
    <span className="legend">
      {items.map(([color, label]) => <span key={label}><i className="lg-sw" style={{ background: color }} />{label}</span>)}
    </span>
  );
}
