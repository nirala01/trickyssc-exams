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
// Config filled in 2026-10-27 (project: trickyssc-exams).
export const firebaseConfig = {
  apiKey: "AIzaSyALVgIzjw6etYwUBCDN_MAwXa1Bm19FDpM",
  authDomain: "trickyssc-exams.firebaseapp.com",
  projectId: "trickyssc-exams",
  storageBucket: "trickyssc-exams.firebasestorage.app",
  messagingSenderId: "330446854672",
  appId: "1:330446854672:web:53f225b58e275c4328c895"
};

export const isConfigured = !String(firebaseConfig.apiKey).startsWith("PASTE_");
