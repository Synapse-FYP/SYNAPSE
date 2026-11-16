// Gives the store access to React Router's navigate() so store actions (go/login/logout) can change routes,
// and records each location so the Back button knows the in-app history.
import { useEffect } from 'react';
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom';
import { store } from '../store/index.js';
import { recordLocation } from './navHistory.js';

export default function RouterBridge() {
  const navigate = useNavigate();
  const location = useLocation();
  const navType = useNavigationType();
  useEffect(() => {
    store.navigate = navigate;
    return () => { store.navigate = null; };
  }, [navigate]);
  useEffect(() => { recordLocation(location, navType); }, [location, navType]);
  return null;
}
