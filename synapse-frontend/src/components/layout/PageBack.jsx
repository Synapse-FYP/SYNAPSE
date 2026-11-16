// Places the shared Back button above the routed page content.
// Hidden on the portal's dashboard home page. When an in-page detail view is open
// (employee profile, training module, policy reader, ...) Back closes it first; if that
// detail view was opened straight from another page, Back also returns to that page.
import { useSynapse } from '../../store/index.js';
import { getSubview } from '../../routes/subviews.js';
import BackButton from '../common/BackButton.jsx';

export default function PageBack({ portal, page, home, prefix }) {
  const { state, store } = useSynapse();
  const sub = getSubview(store, portal, page);
  if (page === home && !sub) return null;
  const fallback = prefix + '/' + home;
  const onClick = sub ? (goBack) => {
    const leavePage = !!state.ui.entrySub;
    sub.back();
    if (leavePage) { store.ui({ entrySub: false }); goBack(); }
  } : undefined;
  return (
    <div className="back-row">
      <BackButton prefix={prefix} fallback={fallback} onClick={onClick} ariaLabel={sub ? sub.label : 'Back to previous page'} />
    </div>
  );
}
