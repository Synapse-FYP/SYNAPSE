// "Nightwatch" sign-in / sign-up screen with demo accounts.
import { useSynapse } from '../../store/index.js';
import markUrl from '../../assets/synapse-mark.png';

const HEX = 'polygon(25% 5%,75% 5%,100% 50%,75% 95%,25% 95%,0 50%)';

function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.27 5.48-4.8 7.18l7.73 6C44.38 38.03 46.98 31.88 46.98 24.55z" />
      <path fill="#FBBC05" d="M10.53 28.59A14.5 14.5 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.2A24 24 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.17 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

const DEMO_ACCOUNTS = [
  { key: 'admin', initials: 'NK', bg: 'linear-gradient(135deg,#4C1D95,#7C3AED)', title: 'Administrator', line: 'admin@synapse.demo · Admin#2026', email: 'admin@synapse.demo', pw: 'Admin#2026' },
  { key: 'analyst', initials: 'BA', bg: null, title: 'Security Analyst', line: 'analyst@synapse.demo · Analyst#2026', email: 'analyst@synapse.demo', pw: 'Analyst#2026' },
  { key: 'employee', initials: 'DO', bg: 'linear-gradient(135deg,#065F46,#0E7490)', title: 'Employee — Daniel Okafor', line: 'daniel.okafor@meridianledger.example · Employee#2026', email: 'daniel.okafor@meridianledger.example', pw: 'Employee#2026' },
];

export default function LoginPage() {
  const { state, store } = useSynapse();
  const u = state.ui;
  const isSignup = u.authMode === 'signup';
  const fe = { email: u.loginFieldErr.email || '', pw: u.loginFieldErr.pw || '' };
  const bind = (k) => (e) => store.ui({ [k]: e.target.value });
  const onSubmit = (e) => { e.preventDefault(); if (isSignup) store.signup(); else store.login(); };

  return (
    <div className="nw-login">
      <section className="nw-hero" aria-label="About SYNAPSE">
        <div className="row" style={{ gap: 10 }}><span className="tag-exp">Cognitive UEBA</span><span className="tag-sim">Prototype · fictional data</span></div>
        <div className="nw-emblem" aria-hidden="true">
          <div className="nw-ring" /><div className="nw-ring2" /><div className="nw-hex" /><div className="nw-hex-in" />
          <span className="nw-node" style={{ left: 6, top: 146 }} />
          <span className="nw-node" style={{ right: 6, top: 146, background: '#A78BFA', boxShadow: '0 0 10px #A78BFA' }} />
          <span className="nw-node" style={{ left: 146, top: 0 }} />
          <img src={markUrl} alt="" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 600 }}>
          <div className="brand-name" style={{ fontSize: 30, letterSpacing: '.34em' }}>SYNAPSE</div>
          <div style={{ fontSize: 15, color: '#67E8F9', letterSpacing: '.06em' }}>Watching behavior. Protecting people.</div>
          <h1 style={{ fontSize: 36, lineHeight: 1.15, fontWeight: 700, marginTop: 6 }}>Behavioral intelligence for proactive security.</h1>
          <p style={{ margin: 0, color: '#A9B7CC', fontSize: 15, lineHeight: 1.65 }}>Every employee gets their own behavioral baseline. SYNAPSE explains why activity stands out and recommends human-centered responses — training, verification, analyst review — instead of automatic blame.</p>
        </div>
        <div className="nw-stats">
          <div className="nw-stat"><span className="tag-exp">CERT r5.2 · retrospective</span><b>95.59%</b><span className="tiny muted">recall · 28.35% precision on historical synthetic data</span></div>
          <div className="nw-stat"><span className="tag-exp">Personalization</span><b>46</b><span className="tiny muted">predictors · 23 activity + 23 employee-relative deviations</span></div>
          <div className="nw-stat"><span className="tag-sim">Live demo</span><b>Simulated</b><span className="tiny muted">fictional organization; no real monitoring</span></div>
        </div>
        <p className="tiny" style={{ margin: 0, color: '#6B7C97' }}>CT-499 Final Year Design Project · NED University of Engineering &amp; Technology</p>
      </section>

      <section className="nw-form-side">
        <form className="nw-card" onSubmit={onSubmit} noValidate>
          <div className="row" style={{ gap: 12 }}>
            <img src={markUrl} alt="SYNAPSE" style={{ width: 42, height: 42, clipPath: HEX }} />
            <div><h2 style={{ fontSize: 21 }}>{isSignup ? 'Create your account' : 'Secure sign-in'}</h2><div className="tiny muted">Security Operations · Employee Awareness</div></div>
          </div>
          <p className="muted small" style={{ margin: 0 }}>{isSignup ? 'Employee self-registration requires organizational approval and a configured backend.' : 'Prototype sign-in uses browser-only demo credentials. Real sign-in requires a backend.'}</p>
          {u.loginErr && <div className="banner" role="alert" style={{ background: 'rgba(240,80,110,.1)', color: '#FFB3C1', border: '1px solid rgba(240,80,110,.35)' }}>{u.loginErr}</div>}
          {isSignup && (
            <div className="field"><label htmlFor="signup-name">Full name</label><input id="signup-name" className="input" autoComplete="name" value={u.signupName} onChange={bind('signupName')} placeholder="Your full name" /></div>
          )}
          <div className="field">
            <label htmlFor="login-email">Work email</label>
            <input id="login-email" className="input" type="text" inputMode="email" autoComplete="username" value={u.loginEmail} onChange={bind('loginEmail')} placeholder="name@company.example" />
            {fe.email && <span className="errtext">{fe.email}</span>}
          </div>
          <div className="field">
            <label htmlFor="login-pw">Password</label>
            <div style={{ display: 'flex', gap: 6 }}>
              <input id="login-pw" className="input" type={u.showPw ? 'text' : 'password'} autoComplete="current-password" value={u.loginPw} onChange={bind('loginPw')} placeholder="••••••••" />
              <button type="button" className="btn btn-secondary" onClick={() => store.ui({ showPw: !u.showPw })} aria-label="Toggle password visibility">{u.showPw ? 'Hide' : 'Show'}</button>
            </div>
            {fe.pw && <span className="errtext">{fe.pw}</span>}
          </div>
          <button type="submit" className="btn btn-primary" style={{ minHeight: 44, fontSize: 14 }}>{isSignup ? 'Request employee account' : 'Sign in to SYNAPSE'}</button>
          <div className="auth-separator"><span>or</span></div>
          <button type="button" className="google-auth-btn" onClick={() => store.googleAuth()} aria-label="Continue with Google">
            <GoogleLogo />
            Continue with Google
          </button>
          <p className="tiny muted" style={{ margin: 0 }}>Google authentication needs a configured server-side OAuth integration. No account will be created without server verification.</p>
          <button type="button" className="btn btn-ghost" style={{ width: '100%' }} onClick={() => store.ui({ authMode: isSignup ? 'signin' : 'signup', loginErr: '', loginFieldErr: {} })}>
            {isSignup ? 'Already have an account? Sign in' : 'New employee? Sign up'}
          </button>
          {!isSignup && (
            <>
              <div className="divider" />
              <div className="lbl">Demo accounts · click to fill</div>
              {DEMO_ACCOUNTS.map((d) => (
                <button key={d.key} type="button" className="demo-acc" onClick={() => store.ui({ loginEmail: d.email, loginPw: d.pw, loginErr: '', loginFieldErr: {} })}>
                  <span className="avatar" style={d.bg ? { background: d.bg } : undefined}>{d.initials}</span>
                  <span style={{ flex: 1 }}><b>{d.title}</b><br /><span className="muted small mono">{d.line}</span></span>
                </button>
              ))}
              <p className="tiny muted" style={{ margin: 0 }}>Any employee in the fictional directory can sign in with their work email and <span className="mono">Employee#2026</span>.</p>
            </>
          )}
        </form>
      </section>
    </div>
  );
}
