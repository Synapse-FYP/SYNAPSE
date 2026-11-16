import { useSynapse } from '../../store/index.js';

export default function ConfirmDialog() {
  const { state, store } = useSynapse();
  const c = state.ui.confirm;
  if (!c) return null;
  const close = () => store.ui({ confirm: null });
  return (
    <>
      <div className="scrim modal-scrim" onClick={close} />
      <div className="modal" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
        <div className="modal-h"><h2 id="confirm-title">{c.title}</h2></div>
        <div className="modal-b"><p className="small" style={{ margin: 0, lineHeight: 1.6 }}>{c.body}</p></div>
        <div className="modal-f">
          <button type="button" className="btn btn-ghost" onClick={close}>Cancel</button>
          <button type="button" className={c.tone === 'danger' ? 'btn btn-danger' : 'btn btn-primary'} onClick={() => store.doConfirm()}>{c.label}</button>
        </div>
      </div>
    </>
  );
}
