import { useSynapse } from '../../store/index.js';

export default function Toasts() {
  const { state, store } = useSynapse();
  return (
    <div className="toasts" aria-live="polite">
      {state.ui.toasts.map((t) => (
        <div key={t.id} className={'toast toast-' + t.tone}>
          <span>{t.msg}</span>
          <button type="button" onClick={() => store.dismissToast(t.id)} aria-label="Dismiss notification">✕</button>
        </div>
      ))}
    </div>
  );
}
