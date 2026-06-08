export type Theme = "dark" | "light" | "system";

const KEY = "sdlc:theme";

export function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return (localStorage.getItem(KEY) as Theme) || "dark";
}

export function applyTheme(t: Theme) {
  if (typeof document === "undefined") return;
  const sys = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  const effective = t === "system" ? sys : t;
  const root = document.documentElement;
  root.classList.remove("dark", "light");
  root.classList.add(effective);
}

export function setTheme(t: Theme) {
  try { localStorage.setItem(KEY, t); } catch { /* noop */ }
  applyTheme(t);
}

// Inline script injected into <head> to prevent FOUC.
export const themeBootstrapScript = `
(function(){try{var t=localStorage.getItem('${KEY}')||'dark';
var s=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
var e=t==='system'?s:t;var r=document.documentElement;
r.classList.remove('dark','light');r.classList.add(e);}catch(e){}})();
`;
