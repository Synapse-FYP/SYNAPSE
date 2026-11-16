// Reusable Back button used at the top-left of page content in every portal.
// When clicked it goes to the previous page in this portal's browser history, or to the
// `fallback` dashboard route when there is none (direct link, refresh, or history that would
// lead to the login page / outside the app). A custom `onClick(goBack)` can run first,
// e.g. to close an in-page detail view, and may call goBack() to continue navigating.
import { useNavigate } from 'react-router-dom';
import { backDelta } from '../../routes/navHistory.js';
import NavIcon from './NavIcon.jsx';

export default function BackButton({ onClick, label = 'Back', ariaLabel, prefix, fallback }) {
  const navigate = useNavigate();
  const goBack = () => {
    const delta = backDelta(prefix);
    if (delta) navigate(delta);
    else navigate(fallback, { replace: true });
  };
  return (
    <button type="button" className="back-btn" onClick={() => (onClick ? onClick(goBack) : goBack())} aria-label={ariaLabel || label}>
      <NavIcon name="arrowLeft" className="back-ico" />
      <span>{label}</span>
    </button>
  );
}
