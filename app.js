const firebaseConfig = {
  apiKey: "AIzaSyAl563jzr7ddmdaOEWXrm1Bx7hFEYXY-PI",
  authDomain: "vetkapim.firebaseapp.com",
  projectId: "vetkapim",
  storageBucket: "vetkapim.firebasestorage.app",
  messagingSenderId: "756311357966",
  appId: "1:756311357966:web:4d5442761899234de05a5f",
  measurementId: "G-QF8KPXNFDF",
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const form = document.getElementById("bookingForm");
const statusEl = document.getElementById("formStatus");
const catalogEl = document.getElementById("serviceCatalog");
const cartEl = document.getElementById("cartSummary");
const cartTotalEl = document.getElementById("cartTotal");
const cartTotalStickyEl = document.getElementById("cartTotalSticky");
const navCartCount = document.getElementById("navCartCount");
const slides = document.querySelectorAll(".slider-track .slide");
const dots = document.querySelectorAll(".slider-dots .dot");
const shopGrid = document.getElementById("shopGrid");
const shopTabs = document.querySelectorAll(".shop-tabs .tab");
const loginGate = document.getElementById("loginGate");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginPasswordConfirm = document.getElementById("loginPasswordConfirm");
const loginCode = document.getElementById("loginCode");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const sendCodeBtn = document.getElementById("sendCodeBtn");
const confirmCodeBtn = document.getElementById("confirmCodeBtn");
const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
const logoutBtn = document.getElementById("logoutBtn");
const loginInfo = document.getElementById("loginInfo");
const loginStatus = document.getElementById("loginStatus");
const userEmailHidden = document.getElementById("userEmail");
const rememberMe = document.getElementById("rememberMe");
const acceptTerms = document.getElementById("acceptTerms");
const editInfoBtn = document.querySelector(".edit-info-btn");
const toastEl = document.getElementById("toast");
const loginTriggers = document.querySelectorAll(".login-trigger");
const loginTabs = document.querySelectorAll(".login-tabs .tab-btn");
const loginCard = document.querySelector(".login-card");
const signupName = document.getElementById("signupName");
const signupSurname = document.getElementById("signupSurname");
const signupPhone = document.getElementById("signupPhone");
const signupBirthdate = document.getElementById("signupBirthdate");
let productToggleInit = false;
let heroPlaceholderTimer = null;
let heroPlaceholderIndex = 0;
let productSliderTimer = null;
let toastTimer = null;
const heroPlaceholderPhrases = [
  "Evde aşı randevusu",
  "Kedi tırnak kesimi",
  "Canlı video danışmanlık",
  "Acil veteriner sorusu",
];

// Mobile-first UX: show booking section above shop on small screens, keep desktop sÄ±rayÄ± koru.
(() => {
  const mainEl = document.querySelector("main");
  const booking = document.getElementById("randevu");
  const shop = document.getElementById("shop");
  if (!mainEl || !booking || !shop) return;

  const reorder = () => {
    const isMobile = window.matchMedia("(max-width: 720px)").matches;
    const bookingBeforeShop = shop.previousElementSibling === booking;

    if (isMobile && !bookingBeforeShop) {
      mainEl.insertBefore(booking, shop);
    } else if (!isMobile && bookingBeforeShop) {
      // MasaÃ¼stÃ¼nde eski sÄ±rayÄ± geri getir (shop, sonra booking)
      mainEl.insertBefore(shop, booking);
    }
  };

  reorder();
  window.addEventListener("resize", reorder);
})();

// Mobile sticky CTA: show when booking section out of view on small screens.
(() => {
  const bookingSection = document.getElementById("randevu");
  const bookingForm = document.getElementById("bookingForm");
  const stickyBar = document.getElementById("stickyCta");
  const stickyBtn = document.getElementById("stickyCtaSubmit");
  if (!bookingSection || !bookingForm || !stickyBar || !stickyBtn) return;

  const mql = window.matchMedia("(max-width: 720px)");

  const toggle = (entries) => {
    entries.forEach((entry) => {
      const shouldShow = !entry.isIntersecting && mql.matches;
      stickyBar.classList.toggle("visible", shouldShow);
    });
  };

  const observer = new IntersectionObserver(toggle, {
    rootMargin: "-20% 0px 0px 0px",
    threshold: 0,
  });

  observer.observe(bookingSection);

  mql.addEventListener("change", () => {
    if (!mql.matches) {
      stickyBar.classList.remove("visible");
    }
  });

  stickyBtn.addEventListener("click", () => {
    bookingForm.requestSubmit ? bookingForm.requestSubmit() : bookingForm.submit();
  });
})();

let isLoggedIn = false;
let isVerified = false;
let pendingToken = null;
let pendingAction = null;
let pendingProfile = null;
let lastCodeSentAt = Number(localStorage.getItem("otpLastSentAt") || "0");
const CODE_SEND_COOLDOWN_MS = 60000;
const defaultSendCodeLabel = sendCodeBtn ? sendCodeBtn.textContent : "Kod Gonder";
let serviceItemsUnsub = null;
let shopProductsUnsub = null;
let anonAuthInProgress = false;
let anonAuthDone = false;

const fallbackServices = [
  {
    title: "Evde Islemler",
    slug: "procedures",
    items: [
      { id: "proc_1", title: "Evin Yeni Uyesi Muayenesi", price: 1800 },
      { id: "proc_2", title: "Genel Muayene", price: 1800 },
      { id: "proc_3", title: "Tirnak Kesimi", price: 800 },
      { id: "proc_4", title: "Mikrocip ve Kimliklendirme", price: 1500 },
      { id: "proc_5", title: "Kuduz Titrasyon Testi", price: 14000 },
      { id: "proc_6", title: "Evde Serum Uygulamasi", price: 3000 },
    ],
  },
  {
    title: "Evde Kopek Asilari",
    slug: "vaccines",
    items: [
      { id: "vac_1", title: "Karma Asi", price: 2000 },
      { id: "vac_2", title: "Ic ve Dis Parazit 45 Gun", price: 1800 },
      { id: "vac_3", title: "Ic ve Dis Parazit 90 Gun", price: 3200 },
      { id: "vac_4", title: "Bronsin Asisi", price: 2000 },
      { id: "vac_5", title: "Corona Asisi", price: 2000 },
      { id: "vac_6", title: "Lyme Asisi", price: 2500 },
    ],
  },
];

const fallbackProducts = [
  {
    title: "Premium Kedi Mamasi 2 kg",
    tag: "Yeni",
    description: "Tavsiye edilen, hassas mide.",
    price: 540,
  },
  {
    title: "Kopek Vitamin Seti",
    tag: "Cok Satan",
    description: "Bagisiklik ve eklem destegi.",
    price: 320,
  },
  {
    title: "Hijyen Bakim Paketi",
    tag: "Firsat",
    description: "Sampuan + tarak + kulak solusyonu.",
    price: 410,
  },
  {
    title: "Kus Yem Karisimi",
    tag: "Populer",
    description: "Gunde 1 olcek, saglikli icerik.",
    price: 190,
  },
];

const services = [];
const shopProducts = [];
let shopItemsCache = [];
let activeShopFilter = "all";
const BOOKING_RATE_LIMIT_MS = 45000;

const selectedItems = new Map();

loadServiceItems();
renderCart();
bindServiceCards();
initSlider();
bindLoginGate();
watchAuth();
startCooldownTicker();
loadShopProducts();
bindShopTabs();
bindShopSearch();
bindHeroSearch();
compactBookingForm();
initBookingStepper();
bindPhoneMask();
bindTestimonialsToggle();
startHeroPlaceholder();
bindTestimonialsToggle();

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!isLoggedIn || !isVerified) {
    showLoginGate();
    return;
  }

  const name = document.getElementById("name").value.trim();
  const rawPhone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();
  const datetime = document.getElementById("datetime").value.trim();
  const notes = document.getElementById("notes").value.trim();
  const phone = normalizePhone(rawPhone);
  const items = Array.from(selectedItems.values());
  const total = items.reduce((sum, item) => sum + item.price, 0);
  const hpValue = (document.getElementById("hpField")?.value || "").trim();
  const now = Date.now();
  const lastBooking = Number(localStorage.getItem("bookingLastSubmitAt") || "0");

  if (hpValue) {
    showStatus("Islem tamamlanamadi. Lutfen tekrar deneyin.", true);
    return;
  }

  if (now - lastBooking < BOOKING_RATE_LIMIT_MS) {
    showStatus("Lutfen biraz bekleyip tekrar deneyin.", true);
    return;
  }

  if (items.length === 0) {
    showStatus("Lutfen en az bir hizmet secin.", true);
    return;
  }

  if (name.length < 3) {
    showStatus("Lutfen ad soyad girin.", true);
    return;
  }

  if (address.length < 8) {
    showStatus("Lutfen adres bilginizi detaylandirin.", true);
    return;
  }

  if (!isValidPhone(phone)) {
    showStatus("Telefon numarasini +90 formatinda girin.", true);
    return;
  }

  const serviceTip = serviceMessage(items);
  document.getElementById("selectedServices").value = items
    .map((item) => item.title)
    .join(", ");
  document.getElementById("totalPrice").value = `${total} TL`;
  document.getElementById("serviceNote").value = serviceTip;
  userEmailHidden.value = auth.currentUser?.email || "";

  const formData = new FormData(form);
  const payload = new URLSearchParams(formData).toString();

  if (auth.currentUser) {
    upsertUserProfile({
      uid: auth.currentUser.uid,
      email: auth.currentUser.email,
      name,
      phone,
      address,
    });
  }

  fetch("/api/booking", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: payload,
  })
    .then((res) => res.json())
    .then((data) => {
      if (!data.ok) {
        throw new Error(data.error || "Talep gonderilemedi.");
      }
      if (auth.currentUser) {
        const bookingPayload = {
          name,
          phone,
          address,
          datetime,
          notes,
          email: auth.currentUser?.email || "",
          services: items.map((item) => ({
            id: item.id,
            title: item.title,
            price: item.price,
          })),
          total,
          status: "new",
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        };
        db.collection("bookings").add(bookingPayload).catch(() => {});
      }
      form.reset();
      selectedItems.clear();
      renderCatalog();
      renderCart();
      localStorage.setItem("bookingLastSubmitAt", String(now));
      showStatus("Talebiniz alindi. Size en kisa surede donus yapacagiz.");
      trackEvent("booking_submit");
    })
    .catch((error) => {
      showStatus(error.message || "Bir hata olustu. Lutfen tekrar deneyin.", true);
    });
});

function bindLoginGate() {
  if (!loginGate) return;
  const closeButton = loginGate.querySelector(".close-gate");
  const drawerClose = loginGate.querySelector(".drawer-close");
  if (closeButton) {
    closeButton.addEventListener("click", () => hideLoginGate());
  }
  if (drawerClose) {
    drawerClose.addEventListener("click", () => hideLoginGate());
  }
  loginGate.addEventListener("click", (event) => {
    if (event.target === loginGate) {
      hideLoginGate();
    }
  });
  loginTriggers.forEach((trigger) =>
    trigger.addEventListener("click", () => showLoginGate())
  );
  loginTabs.forEach((tab) =>
    tab.addEventListener("click", () => switchLoginTab(tab))
  );
  loginBtn.addEventListener("click", handleLogin);
  signupBtn.addEventListener("click", handleSignup);
  sendCodeBtn.addEventListener("click", handleSendCode);
  confirmCodeBtn.addEventListener("click", handleConfirmCode);
  forgotPasswordBtn.addEventListener("click", handleForgotPassword);
  logoutBtn.addEventListener("click", handleLogout);
  editInfoBtn?.addEventListener("click", () => {
    setCodeStage(false);
    setLoginStatus("Bilgileri duzenleyebilirsiniz.", false);
    loginEmail?.focus();
  });

  document.querySelectorAll('a[href*="wa.me"]').forEach((link) => {
    link.addEventListener("click", () => trackEvent("whatsapp_click"));
  });
}

function bindPhoneMask() {
  const phoneInput = document.getElementById("phone");
  if (!phoneInput) return;
  phoneInput.addEventListener("input", () => {
    const digits = phoneInput.value.replace(/\D/g, "");
    if (!digits) return;
    let formatted = digits;
    if (digits.startsWith("90")) {
      formatted = `+${digits}`;
    } else if (digits.startsWith("0")) {
      formatted = `+90${digits.slice(1)}`;
    } else if (digits.length === 10) {
      formatted = `+90${digits}`;
    }
    const cleaned = formatted.replace(/[^\d+]/g, "");
    const match = cleaned.match(/^(\+90)?(\d{3})(\d{3})(\d{2})(\d{2})$/);
    if (match) {
      phoneInput.value = `${match[1] || "+90"} ${match[2]} ${match[3]} ${
        match[4]
      } ${match[5]}`;
    }
  });
}

function initBookingStepper() {
  const formEl = document.getElementById("bookingForm");
  const steps = Array.from(document.querySelectorAll(".booking-step"));
  const dots = Array.from(document.querySelectorAll(".booking-stepper .step-dot"));
  const progressFill = document.getElementById("bookingProgressFill");
  if (!formEl || steps.length === 0) return;

  const mql = window.matchMedia("(max-width: 720px)");
  let current = 1;

  const setRequired = (stepIndex) => {
    steps.forEach((step, idx) => {
      step.querySelectorAll("input, textarea, select").forEach((el) => {
        if (mql.matches) {
          if (idx + 1 === stepIndex) {
            if (el.dataset.req === "true") el.required = true;
          } else {
            if (el.required) {
              el.dataset.req = "true";
              el.required = false;
            }
          }
        } else {
          if (el.dataset.req === "true") el.required = true;
        }
      });
    });
  };

  const update = () => {
    steps.forEach((step, idx) => {
      step.classList.toggle("active", idx + 1 === current);
    });
    dots.forEach((dot, idx) => {
      dot.classList.toggle("active", idx + 1 === current);
    });
    if (progressFill) {
      const total = Math.max(1, steps.length - 1);
      const pct = Math.round(((current - 1) / total) * 100);
      progressFill.style.width = `${pct}%`;
    }
    setRequired(current);
  };

  formEl.addEventListener("click", (event) => {
    const next = event.target.closest(".next-step");
    const prev = event.target.closest(".prev-step");
    if (next) {
      const activeStep = steps[current - 1];
      const inputs = Array.from(activeStep.querySelectorAll("input, textarea, select"));
      const invalid = inputs.find((el) => el.required && !el.checkValidity());
      if (invalid) {
        invalid.reportValidity();
        return;
      }
      current = Math.min(current + 1, steps.length);
      update();
    }
    if (prev) {
      current = Math.max(current - 1, 1);
      update();
    }
  });

  mql.addEventListener("change", () => {
    current = 1;
    update();
  });

  update();
}

function startHeroPlaceholder() {
  const inputEl = document.querySelector(".hero-search input");
  if (!inputEl) return;
  stopHeroPlaceholder();
  if (inputEl.dataset.userActive === "true") return;

  inputEl.placeholder = "";

  const phrase = heroPlaceholderPhrases[heroPlaceholderIndex % heroPlaceholderPhrases.length];
  let pos = 0;
  let deleting = false;

  const tick = () => {
    if (inputEl.dataset.userActive === "true") {
      stopHeroPlaceholder();
      return;
    }

    if (!deleting) {
      inputEl.placeholder = phrase.slice(0, pos + 1);
      pos += 1;
      if (pos === phrase.length) {
        deleting = true;
        heroPlaceholderTimer = setTimeout(tick, 1200);
        return;
      }
    } else {
      inputEl.placeholder = phrase.slice(0, Math.max(pos - 1, 0));
      pos -= 1;
      if (pos === 0) {
        deleting = false;
        heroPlaceholderIndex = (heroPlaceholderIndex + 1) % heroPlaceholderPhrases.length;
      }
    }
    heroPlaceholderTimer = setTimeout(tick, deleting ? 45 : 110);
  };

  tick();
}

function stopHeroPlaceholder() {
  if (heroPlaceholderTimer) {
    clearTimeout(heroPlaceholderTimer);
    heroPlaceholderTimer = null;
  }
}

function watchAuth() {
  auth.onAuthStateChanged((user) => {
    const isRealUser = Boolean(user && !user.isAnonymous);
    isLoggedIn = isRealUser;
    if (user && isRealUser && !isEmailVerified(user.email)) {
      markEmailVerified(user.email);
    }
    isVerified = Boolean(user && isRealUser && isEmailVerified(user.email));
    if (userEmailHidden) {
      userEmailHidden.value = user?.email || "";
    }
    if (user && isRealUser) {
      ensureUserProfile(user);
    }
    if (!user) {
      ensureAnonymousAuth();
    }
    updateLoginUI(isRealUser ? user : null);
  });
}

function ensureAnonymousAuth() {
  if (anonAuthDone || anonAuthInProgress) return Promise.resolve();
  anonAuthInProgress = true;
  return auth
    .signInAnonymously()
    .then(() => {
      anonAuthDone = true;
    })
    .catch((error) => {
      console.warn("anonymous auth failed", error);
      anonAuthDone = false;
    })
    .finally(() => {
      anonAuthInProgress = false;
    });
}

function handleLogin() {
  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();
  if (!email || !password) {
    setLoginStatus("E-posta ve sifre girin.", true);
    return;
  }
  pendingAction = "login";
  setLoginStatus("Giris yapiliyor...", false);
  auth
    .signInWithEmailAndPassword(email, password)
    .then(() => {
      setLoginStatus("Giris basarili.", false);
      markEmailVerified(email);
      hideLoginGate();
    })
    .catch((error) => {
      if (error.code === "auth/user-not-found") {
        setLoginStatus("Kullanici bulunamadi. Uye olun.", true);
        return;
      }
      if (error.code === "auth/wrong-password") {
        setLoginStatus("Sifre hatali.", true);
        return;
      }
      setLoginStatus(error.message || "Giris yapilamadi.", true);
    });
}

function handleSignup() {
  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();
  const passwordConfirm = loginPasswordConfirm.value.trim();
  const name = signupName.value.trim();
  const surname = signupSurname.value.trim();
  const phone = signupPhone.value.trim();
  const gender = document.querySelector('input[name="gender"]:checked')?.value || "";
  const birthdate = signupBirthdate ? signupBirthdate.value : "";
  if (!email || !password) {
    setLoginStatus("E-posta ve sifre girin.", true);
    return;
  }
  if (passwordConfirm && password !== passwordConfirm) {
    setLoginStatus("Sifreler eslesmiyor.", true);
    return;
  }
  if (!name || !surname) {
    setLoginStatus("Ad ve soyad zorunlu.", true);
    return;
  }
  if (!phone) {
    setLoginStatus("Telefon zorunlu.", true);
    return;
  }
  if (acceptTerms && !acceptTerms.checked) {
    setLoginStatus("KVKK ve Hizmet Sartlari'ni kabul etmeniz gerekir.", true);
    return;
  }
  pendingAction = "signup";
  pendingProfile = { name, surname, phone, gender, birthdate };
  setLoginStatus("Onay kodu gonderiyoruz...", false);
  handleSendCode();
}

function setLoginStatus(message, isError) {
  if (loginStatus) {
    loginStatus.textContent = message;
    loginStatus.classList.toggle("error", isError);
  }
  showToast(message, isError);
}

function startCooldownTicker() {
  updateCooldownUI();
  setInterval(updateCooldownUI, 1000);
}

function updateCooldownUI() {
  if (!sendCodeBtn) return;
  if (isLoggedIn) {
    sendCodeBtn.disabled = true;
    return;
  }
  const remaining = Math.max(
    0,
    CODE_SEND_COOLDOWN_MS - (Date.now() - lastCodeSentAt)
  );
  if (remaining === 0) {
    sendCodeBtn.disabled = false;
    sendCodeBtn.textContent = defaultSendCodeLabel;
    return;
  }
  const seconds = Math.ceil(remaining / 1000);
  sendCodeBtn.disabled = true;
  sendCodeBtn.textContent = `Tekrar gonder (${seconds}s)`;
}

function updateLoginUI(user) {
  const loggedIn = Boolean(user);
  loginInfo.textContent = loggedIn ? `Giris yapildi: ${user.email}` : "";
  loginBtn.disabled = loggedIn;
  signupBtn.disabled = loggedIn;
  sendCodeBtn.disabled = loggedIn;
  confirmCodeBtn.disabled = loggedIn;
  loginEmail.disabled = loggedIn;
  loginPassword.disabled = loggedIn;
  loginCode.disabled = loggedIn;
  forgotPasswordBtn.style.display = loggedIn ? "none" : "inline-flex";
  logoutBtn.style.display = loggedIn ? "inline-flex" : "none";
}

function handleForgotPassword() {
  const email = loginEmail.value.trim();
  if (!email) {
    setLoginStatus("E-posta adresinizi girin.", true);
    return;
  }
  auth
    .sendPasswordResetEmail(email)
    .then(() => {
      setLoginStatus(
        "Sifre yenileme e-postasi gonderildi. Spam/Promosyon klasorunu kontrol edin.",
        false
      );
    })
    .catch((error) => {
      if (error.code === "auth/user-not-found") {
        setLoginStatus(
          "Bu e-posta ile kayitli hesap bulunamadi. Uye ol ile kaydolabilirsiniz.",
          true
        );
        return;
      }
      if (error.code === "auth/invalid-email") {
        setLoginStatus("Gecersiz e-posta adresi.", true);
        return;
      }
      if (error.code === "auth/too-many-requests") {
        setLoginStatus("Cok fazla deneme. Biraz sonra tekrar deneyin.", true);
        return;
      }
      setLoginStatus("Sifre yenileme e-postasi gonderilemedi.", true);
    });
}

function handleLogout() {
  auth.signOut().finally(() => {
    isLoggedIn = false;
    isVerified = false;
    pendingAction = null;
    pendingToken = null;
    setLoginStatus("Cikis yapildi.", false);
  });
}

function handleSendCode() {
  if (pendingAction !== "signup") {
    setLoginStatus("Kod yalnizca uyelik icin gonderilir.", true);
    return;
  }
  const email = loginEmail.value.trim();
  if (!email) {
    setLoginStatus("E-posta adresinizi girin.", true);
    return;
  }
  const now = Date.now();
  if (now - lastCodeSentAt < CODE_SEND_COOLDOWN_MS) {
    setLoginStatus("Kod zaten gonderildi. Lutfen biraz bekleyin.", true);
    updateCooldownUI();
    return;
  }
  fetch("/api/send-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (!data.ok) {
        throw new Error(data.error || "Kod gonderilemedi.");
      }
      pendingToken = data.token;
      lastCodeSentAt = now;
      localStorage.setItem("otpLastSentAt", String(now));
      updateCooldownUI();
      setCodeStage(true);
      setLoginStatus(
        "Onay kodu gonderildi. Kodu girip onaylayin.",
        false
      );
      loginCode.focus();
    })
    .catch((error) => {
      setLoginStatus(error.message, true);
    });
}

function handleConfirmCode() {
  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();
  const code = loginCode.value.trim();
  if (!email || !code || !pendingToken) {
    setLoginStatus("E-posta, kod ve gecerli token gerekli.", true);
    return;
  }
  if (!password) {
    setLoginStatus("Sifre girin.", true);
    return;
  }
  if (pendingAction === "signup" && acceptTerms && !acceptTerms.checked) {
    setLoginStatus(
      "Kayit icin KVKK ve Hizmet Sartlari'ni kabul etmeniz gerekir.",
      true
    );
    return;
  }
  fetch("/api/verify-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code, token: pendingToken }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (!data.ok) {
        throw new Error(data.error || "Kod dogrulanamadi.");
      }
      markEmailVerified(email);
      const persistence =
        rememberMe && rememberMe.checked
          ? firebase.auth.Auth.Persistence.LOCAL
          : firebase.auth.Auth.Persistence.SESSION;
      return auth.setPersistence(persistence).then(() => {
        if (pendingAction === "signup") {
          return auth
            .createUserWithEmailAndPassword(email, password)
            .catch((error) => {
              if (error.code === "auth/email-already-in-use") {
                return auth.signInWithEmailAndPassword(email, password);
              }
              throw error;
            });
        }
        if (pendingAction === "login") {
          return auth.signInWithEmailAndPassword(email, password);
        }
        return auth
          .signInWithEmailAndPassword(email, password)
          .catch((error) => {
            if (error.code === "auth/user-not-found") {
              return auth.createUserWithEmailAndPassword(email, password);
            }
            throw error;
          });
      });
    })
    .then(() => {
      if (pendingAction === "signup" && pendingProfile && auth.currentUser) {
        upsertUserProfile({
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          name: pendingProfile.name,
          surname: pendingProfile.surname,
          phone: pendingProfile.phone,
          gender: pendingProfile.gender,
          birthdate: pendingProfile.birthdate,
        });
      }
      setLoginStatus("Dogrulama tamamlandi.", false);
      pendingAction = null;
      pendingProfile = null;
      hideLoginGate();
    })
    .catch((error) => {
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password"
      ) {
        setLoginStatus(
          "Sifre hatali veya hesap baska sifreyle kayitli. Dogru sifreyle tekrar deneyin.",
          true
        );
        return;
      }
      if (error.code === "auth/too-many-requests") {
        setLoginStatus("Cok fazla deneme. 30 dk sonra tekrar deneyin.", true);
        return;
      }
      setLoginStatus(error.message, true);
    });
}

function showLoginGate() {
  loginGate.classList.add("show");
  loginGate.setAttribute("aria-hidden", "false");
  setCodeStage(false);
}

function hideLoginGate() {
  loginGate.classList.remove("show");
  loginGate.setAttribute("aria-hidden", "true");
  setCodeStage(false);
}

function setCodeStage(active) {
  if (!loginCard) return;
  loginCard.classList.toggle("code-sent", Boolean(active));
  if (loginEmail) loginEmail.readOnly = Boolean(active);
  if (loginPassword) loginPassword.readOnly = Boolean(active);
  if (loginPasswordConfirm) loginPasswordConfirm.readOnly = Boolean(active);
  if (loginCode) {
    loginCode.disabled = !active;
    if (!active) loginCode.value = "";
  }
  if (confirmCodeBtn) {
    confirmCodeBtn.disabled = !active;
  }
}

function switchLoginTab(tab) {
  loginTabs.forEach((btn) => btn.classList.remove("active"));
  tab.classList.add("active");
  if (loginCard) {
    loginCard.classList.toggle("signup-active", tab.dataset.tab === "signup");
  }
  pendingToken = null;
  setCodeStage(false);
  if (tab.dataset.tab === "signup") {
    pendingAction = "signup";
    setLoginStatus("Uye olmak icin e-posta/sifre girin, kodu gonderin.", false);
  } else {
    pendingAction = "login";
    setLoginStatus("", false);
  }
}

function getVerifiedEmails() {
  try {
    return JSON.parse(localStorage.getItem("verifiedEmails") || "{}");
  } catch (_) {
    return {};
  }
}

function markEmailVerified(email) {
  const verified = getVerifiedEmails();
  verified[email] = true;
  localStorage.setItem("verifiedEmails", JSON.stringify(verified));
  isVerified = true;
}

function isEmailVerified(email) {
  if (!email) return false;
  const verified = getVerifiedEmails();
  return Boolean(verified[email]);
}

function normalizePhone(value) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return value;
  if (digits.startsWith("90")) {
    return `+${digits}`;
  }
  if (digits.startsWith("0")) {
    return `+90${digits.slice(1)}`;
  }
  if (digits.length === 10) {
    return `+90${digits}`;
  }
  return value;
}

function isValidPhone(value) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 12;
}

function showToast(message, isError = false) {
  if (!toastEl || !message) return;
  toastEl.textContent = message;
  toastEl.classList.toggle("error", isError);
  toastEl.classList.add("show");
  if (toastTimer) {
    clearTimeout(toastTimer);
  }
  toastTimer = setTimeout(() => {
    toastEl.classList.remove("show");
  }, 3200);
}

function showStatus(message, isError = false) {
  if (statusEl) {
    statusEl.textContent = message;
    statusEl.classList.toggle("error", isError);
  }
  showToast(message, isError);
}

function trackEvent(name, params = {}) {
  if (typeof window.gtag === "function") {
    window.gtag("event", name, params);
  }
}

function serviceMessage(items) {
  const hasVaccine = items.some((item) => item.id.startsWith("vac_"));
  if (hasVaccine) {
    return "Dostunuzun kimlik/asi bilgileri varsa hazir ediniz.";
  }
  return "Randevu saatinde dostunuz yaninizda olsun.";
}

function renderCatalog() {
  catalogEl.innerHTML = "";
  services.forEach((category) => {
    const wrapper = document.createElement("div");
    wrapper.className = "category";
    wrapper.dataset.category = category.slug;

    const title = document.createElement("h4");
    title.textContent = category.title;
    wrapper.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "service-grid";

    category.items.forEach((item) => {
      const title = (item.title || "").toLowerCase();
      let badgeLabel = "Evde";
      let badgeClass = "badge-home";
      if (title.includes("video")) {
        badgeLabel = "Video";
        badgeClass = "badge-video";
      } else if (category.slug === "vaccines") {
        badgeLabel = "Aşı";
        badgeClass = "badge-vaccine";
      }

      const card = document.createElement("div");
      card.className = "service-card";

      const badge = document.createElement("span");
      badge.className = `service-badge ${badgeClass}`;
      badge.textContent = badgeLabel;

      const name = document.createElement("h5");
      name.textContent = item.title;

      const price = document.createElement("span");
      price.className = "service-price";
      price.textContent = `${item.price} TL`;

      const button = document.createElement("button");
      button.textContent = selectedItems.has(item.id)
        ? "Sepetten Cikar"
        : "Sepete Ekle";
      if (selectedItems.has(item.id)) {
        button.classList.add("active");
      }
      button.addEventListener("click", () => toggleItem(item));

      card.appendChild(badge);
      card.appendChild(name);
      card.appendChild(price);
      card.appendChild(button);
      grid.appendChild(card);
    });

    wrapper.appendChild(grid);
    catalogEl.appendChild(wrapper);
  });
}

function loadServiceItems() {
  const categories = new Map();
  if (serviceItemsUnsub) {
    serviceItemsUnsub();
  }
  serviceItemsUnsub = db.collection("serviceItems")
    .orderBy("order")
    .onSnapshot(
      (snapshot) => {
        if (snapshot.empty) {
          services.splice(0, services.length, ...fallbackServices);
          renderCatalog();
          return;
        }
        categories.clear();
        snapshot.forEach((doc) => {
          const item = doc.data();
          if (item.active === false) return;
          const slug = item.category || "procedures";
          if (!categories.has(slug)) {
            const title = slug === "vaccines" ? "Evde Kopek Asilari" : "Evde Islemler";
            categories.set(slug, { title, slug, items: [] });
          }
          categories.get(slug).items.push({
            id: doc.id,
            title: item.title,
            price: Number(item.price || 0),
          });
        });
        services.splice(0, services.length, ...Array.from(categories.values()));
        renderCatalog();
      },
      (error) => {
        console.error("serviceItems snapshot error:", error);
        if (error?.code === "permission-denied") {
          ensureAnonymousAuth().then(() => {
            if (auth.currentUser && auth.currentUser.isAnonymous) {
              loadServiceItems();
              return;
            }
            services.splice(0, services.length, ...fallbackServices);
            renderCatalog();
          });
          return;
        }
        services.splice(0, services.length, ...fallbackServices);
        renderCatalog();
      }
    );
}

function loadShopProducts() {
  if (!shopGrid) return;
  if (shopProductsUnsub) {
    shopProductsUnsub();
  }
  shopProductsUnsub = db.collection("shopProducts")
    .where("active", "==", true)
    .orderBy("order")
    .onSnapshot(
      (snapshot) => {
        const items = [];
        if (snapshot.empty) {
          items.push(...fallbackProducts);
        } else {
          snapshot.forEach((doc) => {
            const item = doc.data();
            if (item.active === false) return;
            items.push({ id: doc.id, ...item });
          });
        }
        shopItemsCache = items;
        refreshShopView();
      },
      (error) => {
        if (error?.code === "permission-denied") {
          ensureAnonymousAuth().then(() => {
            if (auth.currentUser && auth.currentUser.isAnonymous) {
              loadShopProducts();
              return;
            }
            shopItemsCache = fallbackProducts;
            refreshShopView();
          });
          return;
        }
        shopItemsCache = fallbackProducts;
        refreshShopView();
      }
    );
}

function renderShopProducts(items) {
  shopGrid.innerHTML = "";
  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "product-card";
    const hasId = Boolean(item.id);
    const detailUrl = hasId
      ? `product.html?id=${encodeURIComponent(item.id)}`
      : `product.html?title=${encodeURIComponent(item.title || "")}`;
    const cartItem = mapShopItem(item);
    const isInCart = selectedItems.has(cartItem.id);
    card.dataset.cartId = cartItem.id;
    const tag = item.tag ? `<span class="tag">${item.tag}</span>` : "";
    let stockBadge = "";
    if (Number.isFinite(Number(item.stock))) {
      const stockValue = Number(item.stock);
      if (stockValue === 0) {
        stockBadge = `<span class="stock-badge out">⛔ Stokta yok</span>`;
      } else if (stockValue <= 5) {
        stockBadge = `<span class="stock-badge low">⚠️ Az kaldı</span>`;
      } else {
        stockBadge = `<span class="stock-badge ok">✓ Stokta</span>`;
      }
    }
    const media = item.imageUrl
      ? `<img class="product-image" src="${item.imageUrl}" alt="${item.title || "Urun"}" loading="lazy" decoding="async" width="240" height="180" />`
      : `<div class="product-placeholder">Gorsel yok</div>`;
    const description = item.description
      ? `<p class="product-desc">${item.description}</p>`
      : "";
    card.innerHTML = `
      <div class="product-media">
        ${tag}
        ${stockBadge}
        ${media}
      </div>
      <div class="product-content">
        <div class="product-chip-row">
          <span class="product-chip">VETKAPIMDA Shop</span>
        </div>
        <a class="product-title" href="${detailUrl}">${item.title}</a>
        <button type="button" class="product-toggle">Detayı Göster</button>
        ${description}
        <div class="product-actions">
          <div class="price-stack">
            <span>Fiyat</span>
            <strong>${item.price} TL</strong>
          </div>
          <button type="button" class="add-to-cart">
            ${isInCart ? "✓ Sepette" : "Sepete Ekle"}
          </button>
        </div>
        <a class="product-detail" href="${detailUrl}">Urun Detayi</a>
        <a class="quick-order" href="https://wa.me/905360340920">Hizli Siparis</a>
      </div>
    `;
    const addButton = card.querySelector(".add-to-cart");
    addButton?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleItem(cartItem);
      const nowInCart = selectedItems.has(cartItem.id);
      addButton.textContent = nowInCart ? "Sepetten Cikar" : "Sepete Ekle";
      addButton.classList.toggle("is-added", nowInCart);
    });
    shopGrid.appendChild(card);
  });
  ensureProductToggleControls();
}

function renderProductSlider(items) {
  const slider = document.getElementById("productSlider");
  const dots = document.getElementById("productDots");
  if (!slider || !dots) return;
  slider.innerHTML = "";
  dots.innerHTML = "";

  const list = items.slice(0, 10);
  const pages = [];
  for (let i = 0; i < list.length; i += 2) {
    pages.push(list.slice(i, i + 2));
  }

  const renderMini = (item) => {
    const tags = [];
    if (item.tag) tags.push(item.tag);
    tags.push("Hızlı Teslim");
    const description = item.description || "";
    return `
      <article class="product-mini">
        <div class="tag-stack">
          ${tags.map((t) => `<span class="tag-chip">${t}</span>`).join("")}
        </div>
        <button class="favorite-btn" type="button" aria-label="Favorilere ekle">♡</button>
        <div class="image-box">
          ${
            item.imageUrl
              ? `<img src="${item.imageUrl}" alt="${item.title}" loading="lazy" />`
              : `<div class="product-placeholder">Görsel yok</div>`
          }
        </div>
        <div class="slide-meta">
          <span class="brand">VETKAPIMDA Shop</span>
          <span class="rating">★★★★★ <em>8</em></span>
        </div>
        <h4>${item.title}</h4>
        <p class="slider-desc">${description}</p>
        <div class="price-row">
          <span class="price-new">${item.price} TL</span>
        </div>
        <a class="btn primary" href="#randevu">Sepete Ekle</a>
      </article>
    `;
  };

  pages.forEach((group, pageIndex) => {
    const page = document.createElement("div");
    page.className = "product-slide";
    page.dataset.index = pageIndex;
    page.innerHTML = group.map(renderMini).join("");
    slider.appendChild(page);

    const dot = document.createElement("span");
    dot.className = "dot";
    dot.dataset.index = pageIndex;
    dots.appendChild(dot);
  });

  const slides = Array.from(slider.children);
  const dotsArr = Array.from(dots.children);

  const activate = (idx) => {
    dotsArr.forEach((d, i) => d.classList.toggle("active", i === idx));
    const target = slides[idx];
    if (target) {
      slider.scrollTo({ left: target.offsetLeft - 12, behavior: "smooth" });
    }
  };

  dotsArr.forEach((dot) => {
    dot.addEventListener("click", () => activate(Number(dot.dataset.index)));
  });

  const updateActive = () => {
    const sliderRect = slider.getBoundingClientRect();
    let nearest = 0;
    let minDist = Infinity;
    slides.forEach((slide, i) => {
      const rect = slide.getBoundingClientRect();
      const dist = Math.abs(rect.left - sliderRect.left);
      if (dist < minDist) {
        minDist = dist;
        nearest = i;
      }
    });
    dotsArr.forEach((d, i) => d.classList.toggle("active", i === nearest));
  };

  slider.addEventListener("scroll", () => {
    window.requestAnimationFrame(updateActive);
  });

  if (dotsArr[0]) dotsArr[0].classList.add("active");

  // auto-slide
  if (productSliderTimer) {
    clearInterval(productSliderTimer);
    productSliderTimer = null;
  }
  if (slides.length > 1) {
    let autoIndex = 0;
    productSliderTimer = setInterval(() => {
      autoIndex = (autoIndex + 1) % slides.length;
      activate(autoIndex);
    }, 1500);
  }
}

function normalizeShopText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function matchesShopFilter(item, filter) {
  if (!filter || filter === "all") return true;
  const text = normalizeShopText(
    `${item.category || ""} ${item.tag || ""} ${item.title || ""}`
  );
  if (filter === "kedi") return text.includes("kedi") || text.includes("cat");
  if (filter === "kopek") return text.includes("kopek") || text.includes("dog");
  if (filter === "kus") return text.includes("kus") || text.includes("bird");
  if (filter === "cok-satanlar") {
    return (
      text.includes("cok satan") ||
      text.includes("bestseller") ||
      text.includes("populer") ||
      text.includes("popular") ||
      text.includes("best")
    );
  }
  if (filter === "firsatlar") {
    return (
      text.includes("firsat") ||
      text.includes("indirim") ||
      text.includes("kampanya") ||
      text.includes("deal")
    );
  }
  return text.includes(filter);
}

function refreshShopView() {
  if (!shopGrid) return;
  const filtered = applyShopFilter(shopItemsCache);
  if (!filtered.length && shopItemsCache.length && activeShopFilter !== "all") {
    const fallbackTab =
      Array.from(shopTabs).find((tab) => tab.dataset.filter === "kedi") ||
      shopTabs[0];
    if (fallbackTab && fallbackTab.dataset.filter !== activeShopFilter) {
      setActiveShopTab(fallbackTab);
      return;
    }
  }
  renderShopProducts(filtered);
  renderProductSlider(filtered);
}

function setActiveShopTab(tab, silent = false) {
  if (!tab) return;
  shopTabs.forEach((item) => item.classList.toggle("active", item === tab));
  activeShopFilter = tab.dataset.filter || normalizeShopText(tab.textContent);
  if (!silent) {
    refreshShopView();
  }
}

function bindShopTabs() {
  if (!shopTabs.length) return;
  const defaultTab =
    Array.from(shopTabs).find((tab) => tab.dataset.default === "true") ||
    shopTabs[0];
  setActiveShopTab(defaultTab, true);
  shopTabs.forEach((tab) => {
    tab.addEventListener("click", () => setActiveShopTab(tab));
  });
}

function bindShopSearch() {
  const shopSearch = document.querySelector(".shop-search input");
  if (!shopSearch) return;
  shopSearch.setAttribute("autocomplete", "off");
  if (shopSearch.value.includes("@")) {
    shopSearch.value = "";
  }
  shopSearch.addEventListener("focus", () => {
    if (!shopSearch.dataset.userModified && shopSearch.value.includes("@")) {
      shopSearch.value = "";
      refreshShopView();
    }
  });
  shopSearch.addEventListener("input", () => {
    shopSearch.dataset.userModified = "true";
    refreshShopView();
  });
}

function bindHeroSearch() {
  const heroSearch = document.querySelector(".hero-search input");
  if (!heroSearch) return;
  heroSearch.setAttribute("autocomplete", "off");
  const clearEmail = () => {
    if (heroSearch.value.includes("@")) {
      heroSearch.value = "";
      delete heroSearch.dataset.userModified;
    }
  };
  clearEmail();
  setTimeout(clearEmail, 800);
  heroSearch.addEventListener("focus", () => {
    if (!heroSearch.dataset.userModified && heroSearch.value.includes("@")) {
      heroSearch.value = "";
    }
    stopHeroPlaceholder();
    heroSearch.dataset.userActive = "true";
  });
  heroSearch.addEventListener("input", () => {
    heroSearch.dataset.userModified = "true";
  });
  heroSearch.addEventListener("blur", () => {
    heroSearch.dataset.userActive = "";
    if (!heroSearch.value.trim()) {
      startHeroPlaceholder(heroSearch);
    }
  });
  startHeroPlaceholder(heroSearch);
}

function applyShopFilter(items) {
  const shopSearch = document.querySelector(".shop-search input");
  const query = shopSearch ? shopSearch.value.trim().toLowerCase() : "";
  let filtered = items;
  if (activeShopFilter && activeShopFilter !== "all") {
    filtered = items.filter((item) => matchesShopFilter(item, activeShopFilter));
  }
  if (!query) return filtered;
  return filtered.filter((item) => {
    return (
      (item.title || "").toLowerCase().includes(query) ||
      (item.description || "").toLowerCase().includes(query)
    );
  });
}

function mapShopItem(item) {
  const id = item.id || item.title || String(Date.now());
  return {
    id: `shop_${id}`,
    title: item.title || "",
    price: Number(item.price || 0),
    type: "shop",
  };
}

function ensureProductToggleControls() {
  document.querySelectorAll(".product-card").forEach((card) => {
    const toggle = card.querySelector(".product-toggle");
    if (!toggle) return;
    card.classList.add("collapsed");
    toggle.hidden = false;
    toggle.textContent = "Detayı Göster";
  });

  if (productToggleInit) return;

  document.addEventListener("click", (evt) => {
    const btn = evt.target.closest(".product-toggle");
    if (!btn) return;
    const card = btn.closest(".product-card");
    const collapsed = card.classList.toggle("collapsed");
    btn.textContent = collapsed ? "Detayı Göster" : "Detayı Gizle";
  });

  productToggleInit = true;
}

function compactBookingForm() {
  const mql = window.matchMedia("(max-width: 720px)");
  const formEl = document.getElementById("bookingForm");
  if (!formEl) return;
  const apply = () => {
    if (mql.matches) {
      formEl.classList.add("mobile-compact");
      formEl.querySelectorAll(".field").forEach((field) => {
        const label = field.querySelector("label");
        const input = field.querySelector("input, textarea");
        if (label && input && !input.placeholder) {
          input.placeholder = label.textContent.trim();
        }
      });
    } else {
      formEl.classList.remove("mobile-compact");
    }
  };
  apply();
  mql.addEventListener("change", apply);
}

function compactBookingForm() {
  const mql = window.matchMedia("(max-width: 720px)");
  const formEl = document.getElementById("bookingForm");
  if (!formEl) return;
  const apply = () => {
    if (mql.matches) {
      formEl.classList.add("mobile-compact");
      formEl.querySelectorAll(".field").forEach((field) => {
        const label = field.querySelector("label");
        const input = field.querySelector("input, textarea");
        if (label && input && !input.placeholder) {
          input.placeholder = label.textContent.trim();
        }
      });
    } else {
      formEl.classList.remove("mobile-compact");
    }
  };
  apply();
  mql.addEventListener("change", apply);
}


function ensureUserProfile(user) {
  const docRef = db.collection("users").doc(user.uid);
  docRef
    .get()
    .then((doc) => {
      if (doc.exists) return;
      return docRef.set({
        email: user.email || "",
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    })
    .catch(() => {});
}

function upsertUserProfile({ uid, email, name, surname, phone, address, gender, birthdate }) {
  if (!uid) return;
  db.collection("users")
    .doc(uid)
    .set(
      {
        email: email || "",
        name: name || "",
        surname: surname || "",
        phone: phone || "",
        address: address || "",
        gender: gender || "",
        birthdate: birthdate || "",
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    )
    .catch(() => {});
}
function renderCart() {
  cartEl.innerHTML = "";
  if (selectedItems.size === 0) {
    const empty = document.createElement("div");
    empty.className = "cart-item";
    empty.textContent = "Sepetiniz bos.";
    cartEl.appendChild(empty);
    updateBookingSummary(0, 0);
    cartTotalEl.textContent = "0 TL";
    if (cartTotalStickyEl) {
      cartTotalStickyEl.textContent = "0 TL";
    }
    if (navCartCount) {
      navCartCount.textContent = "0";
    }
    updateShopButtons();
    return;
  }

  let total = 0;
  selectedItems.forEach((item) => {
    const row = document.createElement("div");
    row.className = "cart-item";

    const label = document.createElement("span");
    label.textContent = item.title;

    const price = document.createElement("strong");
    price.textContent = `${item.price} TL`;

    const remove = document.createElement("button");
    remove.textContent = "Kaldir";
    remove.addEventListener("click", () => toggleItem(item));

    row.appendChild(label);
    row.appendChild(price);
    row.appendChild(remove);
    cartEl.appendChild(row);
    total += item.price;
  });
  updateBookingSummary(total, selectedItems.size);
  cartTotalEl.textContent = `${total} TL`;
  if (cartTotalStickyEl) {
    cartTotalStickyEl.textContent = `${total} TL`;
  }
  if (navCartCount) {
    navCartCount.textContent = String(selectedItems.size);
  }
  updateShopButtons();
}

function toggleItem(item) {
  if (!isLoggedIn || !isVerified) {
    showLoginGate();
    return;
  }
  if (selectedItems.has(item.id)) {
    selectedItems.delete(item.id);
  } else {
    selectedItems.set(item.id, item);
  }
  renderCatalog();
  renderCart();
}

function updateShopButtons() {
  if (!shopGrid) return;
  shopGrid.querySelectorAll(".product-card").forEach((card) => {
    const cartId = card.dataset.cartId;
    if (!cartId) return;
    const inCart = selectedItems.has(cartId);
    const button = card.querySelector(".add-to-cart");
    if (!button) return;
    button.textContent = inCart ? "✓ Sepette" : "Sepete Ekle";
    button.classList.toggle("is-added", inCart);
  });
}

function bindTestimonialsToggle() {
  const grid = document.getElementById("testimonialGrid");
  const toggle = document.getElementById("testimonialToggle");
  if (!grid || !toggle) return;
  const apply = () => {
    const isMobile = window.matchMedia("(max-width: 720px)").matches;
    grid.classList.toggle("compact", isMobile && !toggle.dataset.expanded);
    toggle.textContent = toggle.dataset.expanded ? "Daha az yorum" : "Daha fazla yorum";
  };
  toggle.addEventListener("click", () => {
    toggle.dataset.expanded = toggle.dataset.expanded ? "" : "true";
    apply();
  });
  apply();
  window.addEventListener("resize", apply);
}

function updateBookingSummary(total, count) {
  const el = document.getElementById("bookingSummary");
  if (!el) return;
  if (!count) {
    el.classList.add("is-empty");
    el.innerHTML = `
      <span class="summary-text">Sepetiniz boş.</span>
      <a class="btn ghost summary-action" href="#serviceCatalog">Hizmet Seç</a>
    `;
    return;
  }
  el.classList.remove("is-empty");
  el.innerHTML = `
    <span class="summary-text">${count} kalem</span>
    <span class="summary-pill">${total} TL</span>
    <a class="btn ghost summary-action" href="#serviceCatalog">Hizmet Ekle</a>
  `;
}

function bindServiceCards() {
  const cards = document.querySelectorAll(".card-link");
  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const category = card.dataset.category;
      if (category === "evde") {
        highlightCategories(["procedures", "vaccines"]);
      } else {
        highlightCategories([]);
      }
    });
  });
}

function highlightCategories(slugs) {
  const categories = document.querySelectorAll(".category");
  categories.forEach((category) => {
    if (slugs.includes(category.dataset.category)) {
      category.classList.add("highlight");
    } else {
      category.classList.remove("highlight");
    }
  });
  if (slugs.length === 0) return;
  setTimeout(() => {
    categories.forEach((category) => category.classList.remove("highlight"));
  }, 1600);
}

function initSlider() {
  if (!slides.length) return;
  let index = 0;

  const setActive = (nextIndex) => {
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === nextIndex);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === nextIndex);
    });
  };

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      index = Number(dot.dataset.index || 0);
      setActive(index);
    });
  });

  setInterval(() => {
    index = (index + 1) % slides.length;
    setActive(index);
  }, 4500);
}

