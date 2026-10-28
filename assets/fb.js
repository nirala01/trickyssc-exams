// TrickySSC Exams — one shared Firebase app for every page (EXAMS-FB-V1)
// waitlist.js, auth-nav.js and login.html all load Firebase through here,
// so the app is initialised only once per page.
import { firebaseConfig, isConfigured } from "./firebase-config.js";

export const SDK = "https://www.gstatic.com/firebasejs/10.12.2/";
export { isConfigured };

let appPromise = null;
export function getFirebaseApp() {
  if (!appPromise) {
    appPromise = import(SDK + "firebase-app.js").then((m) =>
      m.getApps().length ? m.getApp() : m.initializeApp(firebaseConfig)
    );
  }
  return appPromise;
}

export async function getAuthKit() {
  const app = await getFirebaseApp();
  const a = await import(SDK + "firebase-auth.js");
  return { auth: a.getAuth(app), a };
}

export async function getDbKit() {
  const app = await getFirebaseApp();
  const fs = await import(SDK + "firebase-firestore.js");
  return { db: fs.getFirestore(app), fs };
}
