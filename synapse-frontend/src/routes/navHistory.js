// Tracks the in-app browser history stack so the Back button can tell whether the
// previous entry is a page inside the current portal (safe to go back to) or
// something outside it, such as the login page or a direct link from elsewhere.

let stack = []; // [{ key, pathname }]
let idx = -1;

export function recordLocation(location, navType) {
  const entry = { key: location.key, pathname: location.pathname };
  if (idx >= 0 && stack[idx] && stack[idx].key === entry.key) return; // already recorded (StrictMode re-run)
  if (navType === 'PUSH') {
    stack = stack.slice(0, idx + 1);
    stack.push(entry);
    idx = stack.length - 1;
  } else if (navType === 'REPLACE' && idx >= 0) {
    stack[idx] = entry;
  } else {
    const found = stack.findIndex((x) => x.key === entry.key);
    if (found >= 0) idx = found;
    else { stack = [entry]; idx = 0; } // first load or an entry from before this session
  }
}

// Number of steps (negative) to the previous distinct page within `prefix`, or null if there is none.
export function backDelta(prefix) {
  if (idx < 0) return null;
  const cur = stack[idx].pathname;
  for (let i = idx - 1; i >= 0; i--) {
    const p = stack[i].pathname;
    if (p === cur) continue;
    return p.startsWith(prefix + '/') ? i - idx : null;
  }
  return null;
}
