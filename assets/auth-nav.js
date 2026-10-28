// TrickySSC Exams — swaps the nav "Login" button for the student's name once signed in.
// Any element with data-login-link is updated. Also pre-fills waitlist forms.
import { getAuthKit, isConfigured } from "./fb.js";

function firstName(user) {
  const n = (user.displayName || user.email || "").trim();
  return n.split(/[ @]/)[0].slice(0, 14) || "Account";
}

if (isConfigured) {
  getAuthKit().then(({ auth, a }) => {
    a.onAuthStateChanged(auth, (user) => {
      document.querySelectorAll("[data-login-link]").forEach((el) => {
        el.textContent = user ? "👤 " + firstName(user) : "Login";
        el.setAttribute("href", "/login");
        el.setAttribute("title", user ? "My account" : "Login or create an account");
      });
      if (!user) return;
      document.querySelectorAll("form[data-waitlist]").forEach((f) => {
        if (f.elements.name && !f.elements.name.value && user.displayName) f.elements.name.value = user.displayName;
        if (f.elements.email && !f.elements.email.value && user.email) f.elements.email.value = user.email;
      });
    });
  }).catch(() => { /* offline or blocked: keep the plain Login link */ });
}
