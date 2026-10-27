// TrickySSC Exams — Firebase config (SEPARATE project from trickyssc.com)
// ---------------------------------------------------------------
// 1. console.firebase.google.com → Add project → name it "trickyssc-exams"
// 2. Project settings → Your apps → Web (</>) → register "exams-web"
// 3. Copy the firebaseConfig values it shows and paste them below,
//    replacing every "PASTE_..." value.
// 4. Build → Firestore Database → Create database (asia-south1 / Mumbai)
// 5. Firestore → Rules → paste the contents of firestore.rules → Publish
// 6. Authentication → Settings → Authorized domains → add exams.trickyssc.com
//
// Until step 3 is done the waitlist form shows a "join our Telegram"
// message instead of saving, so the site is safe to go live first.
export const firebaseConfig = {
  apiKey: "PASTE_API_KEY",
  authDomain: "PASTE_PROJECT_ID.firebaseapp.com",
  projectId: "PASTE_PROJECT_ID",
  storageBucket: "PASTE_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "PASTE_SENDER_ID",
  appId: "PASTE_APP_ID"
};

export const isConfigured = !String(firebaseConfig.apiKey).startsWith("PASTE_");
