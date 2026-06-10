const STORAGE_KEY = "site-welcome-hidden-date";

function getLocalDateKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function isWelcomeHiddenToday() {
  try {
    return localStorage.getItem(STORAGE_KEY) === getLocalDateKey();
  } catch {
    return false;
  }
}

export function hideWelcomeForToday() {
  try {
    localStorage.setItem(STORAGE_KEY, getLocalDateKey());
  } catch {
    // ignore
  }
}
