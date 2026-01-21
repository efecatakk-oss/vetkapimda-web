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

const form = document.getElementById("bookingForm");
const statusEl = document.getElementById("formStatus");
const catalogEl = document.getElementById("serviceCatalog");
const cartEl = document.getElementById("cartSummary");
const cartTotalEl = document.getElementById("cartTotal");
const slides = document.querySelectorAll(".slider-track .slide");
const dots = document.querySelectorAll(".slider-dots .dot");
const loginGate = document.getElementById("loginGate");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginCode = document.getElementById("loginCode");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const sendCodeBtn = document.getElementById("sendCodeBtn");
const confirmCodeBtn = document.getElementById("confirmCodeBtn");
const loginStatus = document.getElementById("loginStatus");
const userEmailHidden = document.getElementById("userEmail");

let isLoggedIn = false;
let isVerified = false;
let pendingToken = null;
let pendingAction = null;
let lastCodeSentAt = Number(localStorage.getItem("otpLastSentAt") || "0");
const CODE_SEND_COOLDOWN_MS = 60000;

const services = [
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

const selectedItems = new Map();

renderCatalog();
renderCart();
bindServiceCards();
initSlider();
bindLoginGate();
watchAuth();

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
      form.reset();
      selectedItems.clear();
      renderCatalog();
      renderCart();
      showStatus("Talebiniz alindi. Size en kisa surede donus yapacagiz.");
    })
    .catch((error) => {
      showStatus(error.message || "Bir hata olustu. Lutfen tekrar deneyin.", true);
    });
});

function bindLoginGate() {
  if (!loginGate) return;
  const closeButton = loginGate.querySelector(".close-gate");
  if (closeButton) {
    closeButton.addEventListener("click", () => hideLoginGate());
  }
  loginBtn.addEventListener("click", handleLogin);
  signupBtn.addEventListener("click", handleSignup);
  sendCodeBtn.addEventListener("click", handleSendCode);
  confirmCodeBtn.addEventListener("click", handleConfirmCode);
}

function watchAuth() {
  auth.onAuthStateChanged((user) => {
    isLoggedIn = Boolean(user);
    isVerified = Boolean(user && isEmailVerified(user.email));
    if (userEmailHidden) {
      userEmailHidden.value = user?.email || "";
    }
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
  setLoginStatus("Onay kodu gonderiyoruz...", false);
  handleSendCode();
}

function handleSignup() {
  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();
  if (!email || !password) {
    setLoginStatus("E-posta ve sifre girin.", true);
    return;
  }
  pendingAction = "signup";
  setLoginStatus("Onay kodu gonderiyoruz...", false);
  handleSendCode();
}

function setLoginStatus(message, isError) {
  loginStatus.textContent = message;
  loginStatus.classList.toggle("error", isError);
}

function handleSendCode() {
  const email = loginEmail.value.trim();
  if (!email) {
    setLoginStatus("E-posta adresinizi girin.", true);
    return;
  }
  const now = Date.now();
  if (now - lastCodeSentAt < CODE_SEND_COOLDOWN_MS) {
    setLoginStatus("Kod zaten gonderildi. Lutfen biraz bekleyin.", true);
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
      setLoginStatus(
        "Onay kodu gonderildi. Spam klasorunu kontrol edin.",
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
      return auth.signInWithEmailAndPassword(email, password).catch((error) => {
        if (error.code === "auth/user-not-found") {
          return auth.createUserWithEmailAndPassword(email, password);
        }
        throw error;
      });
    })
    .then(() => {
      setLoginStatus("Dogrulama tamamlandi.", false);
      pendingAction = null;
      hideLoginGate();
    })
    .catch((error) => {
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
}

function hideLoginGate() {
  loginGate.classList.remove("show");
  loginGate.setAttribute("aria-hidden", "true");
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

function showStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", isError);
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
      const card = document.createElement("div");
      card.className = "service-card";

      const name = document.createElement("h5");
      name.textContent = item.title;

      const price = document.createElement("span");
      price.textContent = `${item.price} TL`;

      const button = document.createElement("button");
      button.textContent = selectedItems.has(item.id)
        ? "Sepetten Cikar"
        : "Sepete Ekle";
      if (selectedItems.has(item.id)) {
        button.classList.add("active");
      }
      button.addEventListener("click", () => toggleItem(item));

      card.appendChild(name);
      card.appendChild(price);
      card.appendChild(button);
      grid.appendChild(card);
    });

    wrapper.appendChild(grid);
    catalogEl.appendChild(wrapper);
  });
}

function renderCart() {
  cartEl.innerHTML = "";
  if (selectedItems.size === 0) {
    const empty = document.createElement("div");
    empty.className = "cart-item";
    empty.textContent = "Sepetiniz bos.";
    cartEl.appendChild(empty);
    cartTotalEl.textContent = "0 TL";
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
  cartTotalEl.textContent = `${total} TL`;
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
