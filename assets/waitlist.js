// TrickySSC Exams — waitlist / pre-registration form (EXAMS-WAITLIST-V3: Super TET + Hindi messages)
// Any <form data-waitlist> on the page is wired up. Fields used:
//   name, phone, email (optional), exam (hidden input or <select>), inService (optional select)
// Each entry is saved to Firestore "waitlist/<exam>_<phone>" — one entry per phone per exam.
import { getDbKit, isConfigured } from "./fb.js";

const TELEGRAM = "https://t.me/trickyssc";
const EXAM_NAMES = {
  "super-tet": "UP Super TET Gramin",
  "drdo-sao": "DRDO SAO Grade-II",
  "alc": "Assistant Labour Commissioner",
  "esic-dd": "ESIC Deputy Director",
  "epfo": "EPFO APFC & EO/AO"
};

// Hindi messages for Hindi pages (Super TET); other exams keep the English ones.
const HI = {
  already: (n) => "✅ आप पहले से " + n + " अलर्ट सूची में हैं। नोटिफिकेशन और नए Free Mock की सूचना आपको WhatsApp पर मिलेगी।",
  name: "कृपया अपना नाम लिखें।",
  phone: "कृपया सही 10 अंकों का मोबाइल नंबर लिखें।",
  email: "ईमेल सही नहीं लग रहा — ठीक करें या खाली छोड़ दें।",
  exam: "कृपया परीक्षा चुनें।",
  notReady: "रजिस्ट्रेशन एक-दो दिन में खुलेगा। तब तक हमारा Telegram जॉइन करें: <a href=\"" + TELEGRAM + "\" target=\"_blank\" rel=\"noopener\">t.me/trickyssc</a>",
  saving: "सेव हो रहा है…",
  done: (first, n, masked) => "✅ हो गया, " + first + "! आप " + n + " अलर्ट सूची में जुड़ गए। नोटिफिकेशन और नए Free Mock की सूचना " + masked + " पर WhatsApp से मिलेगी।",
  dup: (n) => "✅ यह नंबर पहले से " + n + " अलर्ट सूची में है। सब ठीक है।",
  fail: (code) => "अभी सेव नहीं हो पाया (" + code + ")। दोबारा कोशिश करें, या <a href=\"" + TELEGRAM + "\" target=\"_blank\" rel=\"noopener\">हमारा Telegram</a> जॉइन करें।"
};
function isHi(exam) { return exam === "super-tet"; }

function show(box, kind, html) {
  box.className = "form-msg " + kind;
  box.innerHTML = html;
}

function clean(s) { return String(s || "").trim().replace(/\s+/g, " "); }

function markJoined(exam) {
  try { localStorage.setItem("tssc-exams-joined-" + exam, "1"); } catch (e) { /* storage blocked */ }
}
function hasJoined(exam) {
  try { return localStorage.getItem("tssc-exams-joined-" + exam) === "1"; } catch (e) { return false; }
}

function track(exam) {
  try { if (window.gtag) window.gtag("event", "waitlist_join", { exam }); } catch (e) { /* ignore */ }
}

function wire(form) {
  const box = form.querySelector(".form-msg");
  const btn = form.querySelector("button[type=submit]");
  const examField = form.elements.exam;

  const initialExam = examField ? examField.value : "";
  if (initialExam && hasJoined(initialExam) && isHi(initialExam)) {
    show(box, "ok", HI.already(EXAM_NAMES[initialExam]));
  } else if (initialExam && hasJoined(initialExam)) {
    show(box, "ok", "✅ You're already on the " + (EXAM_NAMES[initialExam] || "") + " list." +
      (initialExam === "drdo-sao" ? " We'll message you when the course opens." : " We'll message you with exam updates."));
  }

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const name = clean(form.elements.name && form.elements.name.value);
    const phone = clean(form.elements.phone && form.elements.phone.value).replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, "");
    const email = clean(form.elements.email && form.elements.email.value).toLowerCase();
    const exam = examField ? examField.value : "";
    const inService = form.elements.inService ? form.elements.inService.value : "";

    const hi = isHi(exam);
    if (name.length < 2) return show(box, "err", hi ? HI.name : "Please enter your name.");
    if (!/^[6-9]\d{9}$/.test(phone)) return show(box, "err", hi ? HI.phone : "Please enter a valid 10-digit mobile number.");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return show(box, "err", hi ? HI.email : "That email doesn't look right — fix it or leave it empty.");
    if (!EXAM_NAMES[exam]) return show(box, "err", hi ? HI.exam : "Please choose an exam.");

    if (!isConfigured) {
      return show(box, "info", hi ? HI.notReady : "Registrations open in a day or two. Meanwhile, join our Telegram for the launch alert: <a href=\"" + TELEGRAM + "\" target=\"_blank\" rel=\"noopener\">t.me/trickyssc</a>");
    }

    btn.disabled = true;
    const label = btn.textContent;
    btn.textContent = hi ? HI.saving : "Saving…";
    try {
      const { db, fs } = await getDbKit();
      await fs.setDoc(fs.doc(db, "waitlist", exam + "_" + phone), {
        name: name.slice(0, 79),
        phone,
        email: email.slice(0, 119),
        exam,
        inService: ["yes", "no", ""].includes(inService) ? inService : "",
        source: location.pathname.slice(0, 60) || "/",
        createdAt: fs.serverTimestamp()
      });
      markJoined(exam);
      track(exam);
      form.reset();
      if (examField && examField.type === "hidden") examField.value = exam;
      const masked = phone.slice(0, 2) + "XXXXXX" + phone.slice(-2);
      if (hi) { show(box, "ok", HI.done(name.split(" ")[0], EXAM_NAMES[exam], masked)); return; }
      show(box, "ok", "✅ Done, " + name.split(" ")[0] + "! You're on the " + EXAM_NAMES[exam] + " list" +
        (exam === "drdo-sao" ? " with the early-bird price of ₹999 reserved." : " for exam updates.") +
        " We'll message you on " + phone.slice(0, 2) + "XXXXXX" + phone.slice(-2) + " at launch.");
    } catch (err) {
      const code = err && err.code ? String(err.code) : "";
      if (code.includes("permission-denied")) {
        // The rules allow only one entry per phone per exam, so a repeat lands here.
        markJoined(exam);
        if (hi) { show(box, "ok", HI.dup(EXAM_NAMES[exam])); return; }
        show(box, "ok", "✅ This number is already on the " + EXAM_NAMES[exam] + " list. You're all set.");
      } else {
        if (hi) { show(box, "err", HI.fail(code || "network")); return; }
        show(box, "err", "Couldn't save right now (" + (code || "network") + "). Please try again, or join <a href=\"" + TELEGRAM + "\" target=\"_blank\" rel=\"noopener\">our Telegram</a>.");
      }
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  });
}

document.querySelectorAll("form[data-waitlist]").forEach(wire);
