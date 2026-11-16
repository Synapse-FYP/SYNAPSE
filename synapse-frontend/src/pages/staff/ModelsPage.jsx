import { useSynapse } from '../../store/index.js';
import { buildModels } from '../../viewmodels/staff/models.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import { Bar, ChartTicks, Legend } from '../../components/common/Charts.jsx';

const CERT_KPIS = [
  ['Recall', '95.59%', '260 of 272 malicious days'],
  ['Precision', '28.35%', '260 true of 917 alerts'],
  ['F1-score', '43.73%', '0.4373'],
  ['False alerts', '657', 'FPR 0.5055% · 12 missed'],
  ['Predictors', '46', '23 log features + 23 deviations'],
  ['Events processed', '79.86M', 'logon, device, file, email, HTTP'],
];

export default function ModelsPage() {
  const { state, store } = useSynapse();
  const u = state.ui;
  const V = buildModels(store);
  const { ens, lstm } = V;

  return (
    <>
      <PageHeader title="Model Intelligence" sub="Research foundation of SYNAPSE: what has been evaluated, what is integrated in the prototype, and what is still proposed. Experimental figures come from the CERT r5.2 technical report (29 Oct 2026).">
        <div className="row" style={{ gap: 6 }}><span className="mst mst-ev">Experimentally evaluated</span><span className="mst mst-ev-int">Prototype integrated</span><span className="mst mst-prop">Proposed</span></div>
      </PageHeader>

      <section className="card" style={{ borderColor: '#1E4E5E' }}>
        <div className="card-h">
          <div><h2>CERT r5.2 retrospective experimental results</h2><div className="tiny muted" style={{ marginTop: 3 }}>Selected model: personalized HistGradientBoosting · retrospective test 19 Feb – 2 Jun 2011 · 130,238 employee-days · 272 labeled malicious days</div></div>
          <span className="tag-exp">Historical synthetic data — not live performance</span>
        </div>
        <div className="card-b">
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}>
            {CERT_KPIS.map(([l, v, s]) => <div key={l} className="kpi" style={{ cursor: 'default' }}><span className="lbl">{l}</span><span className="kpi-v">{v}</span><span className="tiny muted">{s}</span></div>)}
          </div>
          <div className="banner banner-warn" style={{ marginTop: 12 }}>About 71.65% of the selected model’s alerts (657 of 917) were false on this historical period and still need human review. The test period had been inspected before model comparison, so these are retrospective development results — not an independent evaluation, and not evidence of real-world generalization. Employee-cluster 95% intervals: precision 19.06–40.18%, recall 90.02–98.88%.</div>
        </div>
      </section>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))' }}>
        <section className="card">
          <div className="card-h"><h2>Precision and recall · CERT r5.2 test</h2><Legend items={[['#22D3EE', 'Recall'], ['#8B5CF6', 'Precision']]} /></div>
          <div className="card-b stack" style={{ gap: 12 }}>
            {V.mRows.map((m) => (
              <div key={m.k}>
                <div className="small" style={{ fontWeight: 600 }}>{m.name}</div>
                <div className="row small" style={{ flexWrap: 'nowrap', gap: 8, marginTop: 4 }}><Bar as="span" w={m.rW} color="#22D3EE" /><span className="mono" style={{ width: 58 }}>{m.rL}</span></div>
                <div className="row small" style={{ flexWrap: 'nowrap', gap: 8, marginTop: 3 }}><Bar as="span" w={m.pW} color="#8B5CF6" /><span className="mono" style={{ width: 58 }}>{m.pL}</span></div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="card">
        <div className="card-h"><h2>Model comparison</h2><span className="tiny muted">Click a row to highlight · only values documented in the attached research are shown</span></div>
        <div className="card-b" style={{ overflowX: 'auto' }}>
          <table className="t" style={{ minWidth: 900 }}>
            <thead><tr><th>Model</th><th>Type</th><th>Feature set</th><th>Dataset</th><th>Precision</th><th>Recall</th><th>F1</th><th>FPR</th><th>AP</th><th>TP / FP / FN</th><th>Status</th></tr></thead>
            <tbody>
              {V.mRows.map((m) => (
                <tr key={m.k} className={m.cls}>
                  <td><button type="button" className="link" onClick={m.pick}>{m.name}</button></td><td>{m.type}</td><td className="small">{m.feats}</td><td>{m.data}</td>
                  <td className="mono">{m.pL}</td><td className="mono">{m.rL}</td><td className="mono">{m.f1L}</td><td className="mono">{m.fprL}</td><td className="mono">{m.apL}</td>
                  <td className="mono">{m.tp} / {m.fp} / {m.fn}</td><td><span className={m.stCls}>{m.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="lbl" style={{ margin: '16px 0 8px' }}>Other models and planned components</div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
            {V.mOther.map((m) => (
              <div key={m.name} className="note">
                <div className="row" style={{ justifyContent: 'space-between' }}><b className="small">{m.name}</b><span className={m.stCls}>{m.status}</span></div>
                <div className="tiny muted" style={{ margin: '2px 0 6px' }}>{m.data}</div>
                <div className="small">{m.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))' }}>
        <section className="card">
          <div className="card-h"><h2>Scenario coverage (selected model)</h2><span className="tag-exp">CERT r5.2</span></div>
          <div className="card-b stack" style={{ gap: 10 }}>
            {V.scen.map((s) => (
              <div key={s.s} className="hbar" style={{ gridTemplateColumns: '90px 1fr 120px' }}><span className="small">Scenario {s.s}</span><Bar as="span" w={s.w} color="#22D3EE" style={{ height: 10 }} /><span className="mono small">{s.d}/{s.m} · {s.r}</span></div>
            ))}
            <p className="tiny muted" style={{ margin: 0 }}>Scenario 3 has only six positive days across three users; its 66.67% recall has limited support.</p>
          </div>
        </section>
        <section className="card">
          <div className="card-h"><h2>Frozen inference prototype</h2><span className="mst mst-ev-int">Prototype integrated</span></div>
          <div className="card-b">
            <dl className="kv" style={{ margin: 0 }}>
              <dt>Endpoints</dt><dd className="mono">GET /health · POST /score (API key)</dd>
              <dt>Threshold</dt><dd className="mono">0.06255 (uncalibrated score)</dd>
              <dt>API checks</dt><dd>21 of 21 passed (local, in-memory)</dd>
              <dt>Prediction replay</dt><dd>2,012 employee-days matched</dd>
              <dt>Local latency</dt><dd>median 32.5 ms (1 day) · 43.3 ms (100 days)</dd>
              <dt>Historical workload</dt><dd>mean 8.82 alerts/day · p95 19 · max 25</dd>
            </dl>
            <p className="tiny muted" style={{ margin: '10px 0 0' }}>Not yet connected to this frontend. Scores shown on alerts in this prototype are simulated through the same interface shape.</p>
          </div>
        </section>
      </div>

      <section className="card">
        <div className="card-h"><div><h2>LSTM Autoencoder · temporal reconstruction error</h2><div className="tiny muted" style={{ marginTop: 3 }}>Interface prepared for 7–14 day behavioral sequences per employee</div></div><span className="tag-plan">Illustrative — model not trained</span></div>
        <div className="card-b">
          <div className="row" style={{ marginBottom: 12 }}>
            <div className="field" style={{ width: 260 }}><label htmlFor="l-emp">Employee history</label>
              <select id="l-emp" className="select" value={u.lstmEmp} onChange={V.lf.emp}>{V.lstmOpts.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}</select>
            </div>
            <span className="small muted">Peak illustrative error {lstm ? lstm.peak : ''} on {lstm ? lstm.peakDay : ''}</span>
          </div>
          {lstm && (
            <>
              <div className="chart-wrap"><div className="chart" style={{ height: 170 }}>
                <ChartTicks ticks={lstm.ticks} />
                <svg viewBox="0 0 600 200" preserveAspectRatio="none" aria-hidden="true">
                  <path d={'M0 ' + lstm.thr + ' L600 ' + lstm.thr} stroke="#F0506E" strokeDasharray="5 4" vectorEffect="non-scaling-stroke" fill="none" />
                  <path d={lstm.area} fill="#8B5CF6" fillOpacity="0.12" />
                  <path d={lstm.path} fill="none" stroke="#8B5CF6" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                </svg>
              </div></div>
              <div className="chart-x" style={{ paddingLeft: 34 }}><span>{lstm.first}</span><span>7-day rolling window · dashed = illustrative threshold</span><span>{lstm.last}</span></div>
            </>
          )}
          <div className="banner banner-sim" style={{ marginTop: 12 }}>Placeholder curve derived from the simulated baseline deviations so the visualization can be reviewed. No LSTM reconstruction results exist yet; real outputs will replace this after the planned experiment.</div>
        </div>
      </section>

      <section className="card">
        <div className="card-h"><div><h2>Ensemble intelligence · voting and disagreement</h2><div className="tiny muted" style={{ marginTop: 3 }}>Prepared visualization for the proposed voting-based ensemble</div></div><span className="tag-sim">Simulated scores</span></div>
        <div className="card-b grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(240px, 320px)', gap: 18 }}>
          <div className="stack" style={{ gap: 10 }}>
            <div className="row">
              <div className="field" style={{ width: 260 }}><label htmlFor="e-alert">Alert</label>
                <select id="e-alert" className="select" value={u.mAlert} onChange={V.lf.alert}>{V.ensAlertOpts.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}</select>
              </div>
              <div className="field" style={{ flex: 1, minWidth: 200 }}><label htmlFor="e-th">Threshold comparison: {ens.T}</label><input id="e-th" type="range" min="20" max="90" step="5" value={u.mThresh} onChange={V.lf.thresh} style={{ accentColor: '#8B5CF6' }} /></div>
            </div>
            {ens.scores.map((s) => (
              <div key={s.name} className="hbar" style={{ gridTemplateColumns: '150px 1fr 64px' }}>
                <span className="small"><b>{s.name}</b><br /><span className="tiny muted">{s.src}</span></span>
                <span style={{ position: 'relative', background: '#1A2440', borderRadius: 5 }}><span className={s.cls} style={{ width: s.w + '%' }}>{s.v}</span></span>
                <span className="small mono">{s.vote}</span>
              </div>
            ))}
          </div>
          <div className="stack" style={{ gap: 10 }}>
            <div className="note"><div className="lbl">Hard voting</div><div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 22 }}>{ens.votes} / {ens.total}</div><div className="small">{ens.hard}</div></div>
            <div className="note"><div className="lbl">Soft voting (mean score)</div><div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 22 }}>{ens.soft}</div><div className="small">{ens.softRes}</div></div>
            <div className="note"><div className="lbl">Model agreement</div><div className="small">{ens.agree}</div></div>
            <p className="tiny muted" style={{ margin: 0 }}>All five values are simulated for interface design. No claim is made that an ensemble outperforms the selected model before experimental validation.</p>
          </div>
        </div>
      </section>
    </>
  );
}
