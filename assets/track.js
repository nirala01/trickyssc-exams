// TrickySSC Exams — page-visit logger for the admin Candidates page (EXAMS-TRACK-V1)
// Each page view saves one document to Firestore "visits":
//   path, title, src (where the visitor came from), landing (first page of this visit),
//   vid (random browser id), sid (random visit id), dev (m = phone, d = desktop),
//   uid (Firebase user id if logged in), ts (server time).
// No IP address, no phone or email is stored here. Visits from the admin's own browser
// (marked by opening /admin-candidates) and from automated browsers are not logged.
import { getDbKit, getAuthKit, isConfigured } from "./fb.js";

function rid() {
  return (Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-6)).replace(/[^a-z0-9]/g, "").slice(0, 16).padEnd(10, "0");
}
function stored(store, key) {
  try {
    let v = store.getItem(key);
    const fresh = !v || !/^[a-z0-9]{8,24}$/.test(v);
    if (fresh) { v = rid(); store.setItem(key, v); }
    return { v, fresh };
  } catch (e) { return { v: rid(), fresh: true }; }
}
function source() {
  const q = new URLSearchParams(location.search);
  const utm = (q.get("utm_source") || q.get("src") || "").toLowerCase().replace(/[^a-z0-9._-]/g, "");
  if (utm) return utm.slice(0, 60);
  let host = "";
  try { host = document.referrer ? new URL(document.referrer).hostname.toLowerCase() : ""; } catch (e) { host = ""; }
  if (!host || host === location.hostname) return "direct";
  if (/(^|\.)google\./.test(host)) return "google";
  if (/(^|\.)bing\.com$/.test(host)) return "bing";
  if (/(^|\.)(t\.me|telegram\.org|telegram\.me)$/.test(host)) return "telegram";
  if (/whatsapp|(^|\.)wa\.me$/.test(host)) return "whatsapp";
  if (/(^|\.)(facebook\.com|fb\.com|m\.facebook\.com|l\.facebook\.com)$/.test(host)) return "facebook";
  if (/instagram\.com$/.test(host)) return "instagram";
  if (/(youtube\.com|youtu\.be)$/.test(host)) return "youtube";
  if (/(^|\.)trickyssc\.com$/.test(host)) return "trickyssc.com";
  return host.slice(0, 60);
}
function isAdminBrowser() {
  try { return localStorage.getItem("tssc-admin") === "1"; } catch (e) { return false; }
}

async function currentUid() {
  try {
    const { auth, a } = await getAuthKit();
    return await new Promise((resolve) => {
      const t = setTimeout(() => resolve(auth.currentUser ? auth.currentUser.uid : ""), 2500);
      const off = a.onAuthStateChanged(auth, (u) => { clearTimeout(t); off(); resolve(u ? u.uid : ""); });
    });
  } catch (e) { return ""; }
}

async function logVisit() {
  if (!isConfigured || navigator.webdriver || isAdminBrowser()) return;
  const vid = stored(localStorage, "tssc-vid").v;
  const s = stored(sessionStorage, "tssc-sid");
  const uid = (await currentUid()).slice(0, 128);
  try {
    const { db, fs } = await getDbKit();
    await fs.addDoc(fs.collection(db, "visits"), {
      path: (location.pathname.replace(/\.html$/, "") || "/").slice(0, 80),
      title: (document.title || "").slice(0, 100),
      src: s.fresh ? source() : "internal",
      landing: s.fresh,
      vid,
      sid: s.v,
      dev: /Mobi|Android|iPhone/i.test(navigator.userAgent) ? "m" : "d",
      uid,
      ts: fs.serverTimestamp()
    });
  } catch (e) { /* logging is best-effort; never block the page */ }
}

if (document.readyState === "complete") logVisit();
else window.addEventListener("load", logVisit, { once: true });
